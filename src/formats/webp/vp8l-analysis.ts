/** @format */

/**
 * Choosing which transforms a VP8L stream should carry.
 *
 * The alternative is to build the stream once per combination and keep the
 * smallest, which is exact but pays for every combination in full. libwebp
 * instead makes one pass over the pixels, accumulating what each hypothesis
 * would have to code, and picks by entropy. This mirrors its `AnalyzeEntropy`.
 */

/**
 * Options for creating a VP8LAnalysis.
 */
export interface VP8LAnalysisOptions {
  useSubtractGreen: boolean;
  usePredictor: boolean;
  useCrossColor: boolean;
}

/**
 * Which of the transforms the analysis found worth applying.
 */
export class VP8LAnalysis {
  public readonly useSubtractGreen: boolean;
  public readonly usePredictor: boolean;

  /**
   * Cross-color only ever helps once the predictor has run, and never when
   * red and blue are already zero everywhere.
   */
  public readonly useCrossColor: boolean;

  constructor(opt: VP8LAnalysisOptions) {
    this.useSubtractGreen = opt.useSubtractGreen;
    this.usePredictor = opt.usePredictor;
    this.useCrossColor = opt.useCrossColor;
  }
}

/**
 * The thirteen distributions one pass collects, in the order they are indexed.
 */
const idxAlpha = 0;
const idxRed = 1;
const idxGreen = 2;
const idxBlue = 3;
const idxAlphaPred = 4;
const idxRedPred = 5;
const idxGreenPred = 6;
const idxBluePred = 7;
const idxRedSubGreen = 8;
const idxBlueSubGreen = 9;
const idxRedPredSubGreen = 10;
const idxBluePredSubGreen = 11;
const numHistograms = 12;

/**
 * Per-channel `a - b`, each channel wrapping on its own.
 */
function subPixels(a: number, b: number): number {
  const alphaAndGreen = 0x00ff00ff + (a & 0xff00ff00) - (b & 0xff00ff00);
  const redAndBlue = 0xff00ff00 + (a & 0x00ff00ff) - (b & 0x00ff00ff);
  return (alphaAndGreen & 0xff00ff00) | (redAndBlue & 0x00ff00ff);
}

/**
 * Decides which transforms to apply, from one pass over {@link argb}.
 *
 * {@link transformBits} is the block size the predictor and cross-color sub-images
 * would use, which is what their overhead is charged against.
 */
export function analyzeEntropy(
  argb: Uint32Array,
  width: number,
  height: number,
  transformBits: number
): VP8LAnalysis {
  const histo = Array.from(
    { length: numHistograms },
    (_) => new Uint32Array(256)
  );
  const alpha = histo[idxAlpha];
  const red = histo[idxRed];
  const green = histo[idxGreen];
  const blue = histo[idxBlue];
  const alphaPred = histo[idxAlphaPred];
  const redPred = histo[idxRedPred];
  const greenPred = histo[idxGreenPred];
  const bluePred = histo[idxBluePred];
  const redSubGreen = histo[idxRedSubGreen];
  const blueSubGreen = histo[idxBlueSubGreen];
  const redPredSubGreen = histo[idxRedPredSubGreen];
  const bluePredSubGreen = histo[idxBluePredSubGreen];

  // Skips the first pixel, which has no predecessor.
  let pixPrev = argb[0];
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const pix = argb[row + x];
      const pixDiff = subPixels(pix, pixPrev);
      pixPrev = pix;
      // A pixel equal to its left or top neighbour codes as part of a run
      // whichever transform is chosen, so counting it would let flat areas
      // decide a question they have no stake in.
      if (pixDiff === 0 || (y > 0 && pix === argb[row - width + x])) {
        continue;
      }

      alpha[(pix >>> 24) & 0xff]++;
      red[(pix >>> 16) & 0xff]++;
      green[(pix >>> 8) & 0xff]++;
      blue[pix & 0xff]++;

      alphaPred[(pixDiff >>> 24) & 0xff]++;
      redPred[(pixDiff >>> 16) & 0xff]++;
      greenPred[(pixDiff >>> 8) & 0xff]++;
      bluePred[pixDiff & 0xff]++;

      const g = (pix >>> 8) & 0xff;
      redSubGreen[((pix >>> 16) - g) & 0xff]++;
      blueSubGreen[(pix - g) & 0xff]++;

      const gd = (pixDiff >>> 8) & 0xff;
      redPredSubGreen[((pixDiff >>> 16) - gd) & 0xff]++;
      bluePredSubGreen[(pixDiff - gd) & 0xff]++;
    }
  }

  // The skip above removes zeros from the predicted distributions rather too
  // well; at least one is almost certainly there in reality.
  redPredSubGreen[0]++;
  bluePredSubGreen[0]++;
  redPred[0]++;
  greenPred[0]++;
  bluePred[0]++;
  alphaPred[0]++;

  const bits = new Float64Array(numHistograms);
  for (let i = 0; i < numHistograms; i++) {
    bits[i] = bitsEntropy(histo[i]);
  }

  const direct = bits[idxAlpha] + bits[idxRed] + bits[idxGreen] + bits[idxBlue];
  let spatial =
    bits[idxAlphaPred] +
    bits[idxRedPred] +
    bits[idxGreenPred] +
    bits[idxBluePred];
  const subGreen =
    bits[idxAlpha] +
    bits[idxRedSubGreen] +
    bits[idxGreen] +
    bits[idxBlueSubGreen];
  let spatialSubGreen =
    bits[idxAlphaPred] +
    bits[idxRedPredSubGreen] +
    bits[idxGreenPred] +
    bits[idxBluePredSubGreen];

  // Carrying a transform costs its sub-image, which is small but decides the
  // question outright on small images. Fourteen predictors to name per block,
  // and three multipliers of a byte each for cross-color.
  const subImagePixels =
    subSampleSize(width, transformBits) * subSampleSize(height, transformBits);
  spatial += subImagePixels * (Math.log(14) / Math.LN2);
  spatialSubGreen += subImagePixels * (Math.log(24) / Math.LN2);

  let best = direct;
  let usePredictor = false;
  let useSubtractGreen = false;
  if (spatial < best) {
    best = spatial;
    usePredictor = true;
    useSubtractGreen = false;
  }
  if (subGreen < best) {
    best = subGreen;
    usePredictor = false;
    useSubtractGreen = true;
  }
  if (spatialSubGreen < best) {
    usePredictor = true;
    useSubtractGreen = true;
  }

  // Cross-color has nothing to remove if the winning hypothesis already leaves
  // red and blue at zero everywhere.
  let chosenRed: Uint32Array = red;
  let chosenBlue: Uint32Array = blue;
  if (usePredictor && useSubtractGreen) {
    chosenRed = redPredSubGreen;
    chosenBlue = bluePredSubGreen;
  } else if (usePredictor) {
    chosenRed = redPred;
    chosenBlue = bluePred;
  } else if (useSubtractGreen) {
    chosenRed = redSubGreen;
    chosenBlue = blueSubGreen;
  }
  let redAndBlueAlwaysZero = true;
  for (let i = 1; i < 256; i++) {
    if (chosenRed[i] !== 0 || chosenBlue[i] !== 0) {
      redAndBlueAlwaysZero = false;
      break;
    }
  }

  return new VP8LAnalysis({
    useSubtractGreen: useSubtractGreen,
    usePredictor: usePredictor,
    useCrossColor: usePredictor && !redAndBlueAlwaysZero,
  });
}

function subSampleSize(size: number, samplingBits: number): number {
  return (size + (1 << samplingBits) - 1) >> samplingBits;
}

/**
 * Bits a distribution would take, with the floor a prefix code cannot go
 * below.
 *
 * Plain entropy is optimistic: a Huffman code spends whole bits, so a
 * distribution of two symbols costs about one bit each however skewed it is.
 * The correction mirrors libwebp's `BitsEntropyRefine`, whose constants are
 * empirical.
 */
function bitsEntropy(counts: Uint32Array): number {
  let sum = 0;
  let nonzeros = 0;
  let maxVal = 0;
  let entropy = 0.0;
  for (let i = 0; i < 256; i++) {
    const v = counts[i];
    if (v !== 0) {
      sum += v;
      nonzeros++;
      entropy += v * (Math.log(v) / Math.LN2);
      if (v > maxVal) {
        maxVal = v;
      }
    }
  }
  if (sum === 0) {
    return 0;
  }
  entropy = sum * (Math.log(sum) / Math.LN2) - entropy;

  if (nonzeros < 5) {
    if (nonzeros <= 1) {
      return 0;
    }
    if (nonzeros === 2) {
      // Two symbols code as 0 and 1; a little entropy is mixed back in so that
      // clustering can still tell such distributions apart.
      return (99 * sum + entropy) / 100;
    }
  }
  const mix = nonzeros < 5 ? (nonzeros === 3 ? 0.95 : 0.7) : 0.627;
  const floor = 2.0 * sum - maxVal;
  const minLimit = mix * floor + (1 - mix) * entropy;
  return entropy < minLimit ? minLimit : entropy;
}
