/** @format */

import { MathUtils } from '../../common/math-utils.js';

/**
 * The VP8L cross-color transform, from the encoder's side.
 *
 * Subtracting green removes the bulk of the correlation between channels, but
 * what is left still moves together: an edge leaves a residual in red, green
 * and blue at once. This transform fits a small linear model per block, so red
 * is predicted from green and blue from both, and codes only what is left.
 */

/**
 * The three multipliers a block of the cross-color transform carries.
 */
export class VP8LColorMultipliers {
  public readonly greenToRed: number;
  public readonly greenToBlue: number;
  public readonly redToBlue: number;

  constructor(greenToRed: number, greenToBlue: number, redToBlue: number) {
    this.greenToRed = greenToRed;
    this.greenToBlue = greenToBlue;
    this.redToBlue = redToBlue;
  }

  /**
   * The multipliers as the sub-image pixel that stores them: green to red in
   * blue, green to blue in green, red to blue in red.
   */
  public get blue(): number {
    return this.greenToRed & 0xff;
  }

  public get green(): number {
    return this.greenToBlue & 0xff;
  }

  public get red(): number {
    return this.redToBlue & 0xff;
  }
}

function _int8(v: number): number {
  return v < 128 ? v : v - 256;
}

/**
 * Rounds to the nearest integer, away from zero on a tie, as Dart's
 * `num.round` does.
 */
function _roundHalfAwayFromZero(v: number): number {
  return v < 0 ? -Math.round(-v) : Math.round(v);
}

/**
 * The delta a multiplier applies, matching the decoder's
 * VP8LMultipliers.colorTransformDelta.
 *
 * The decoder computes this on unsigned 32 bit values and keeps the low eight
 * bits; an arithmetic shift agrees with that everywhere the result is masked,
 * which is everywhere it is used.
 */
export function colorTransformDelta(multiplier: number, color: number): number {
  return (_int8(multiplier) * _int8(color)) >> 5;
}

/**
 * Fits the multiplier that best predicts the first [n] of [target] from
 * [source].
 *
 * The least squares estimate lands close, and the handful of neighbours around
 * it are then scored on what they actually cost to code, which the closed form
 * cannot see because of the shift and the wrap to eight bits.
 */
function _fitMultiplier(
  source: Uint8Array,
  target: Uint8Array,
  n: number,
  candidates: Int32Array,
  signed: Int32Array,
  costs: Int32Array
): number {
  let sumXY = 0;
  let sumXX = 0;
  for (let k = 0; k < n; k++) {
    const x = _int8(source[k]);
    const y = _int8(target[k]);
    sumXY += x * y;
    sumXX += x * x;
  }
  if (sumXX === 0) {
    return 0;
  }

  const estimate = MathUtils.clamp(
    _roundHalfAwayFromZero((32 * sumXY) / sumXX),
    -128,
    127
  );

  // Zero always competes, since declining the correlation is a real option.
  // Each candidate is kept twice: as the byte it will be stored as, and as the
  // signed value the delta is computed from, so the conversion stays out of
  // the pixel loop.
  candidates[0] = 0;
  signed[0] = 0;
  let numCandidates = 1;
  for (let t = estimate - 2; t <= estimate + 2; t++) {
    if (t >= -128 && t <= 127) {
      signed[numCandidates] = _int8(t & 0xff);
      candidates[numCandidates++] = t;
    }
  }

  // All the candidates are scored in one sweep of the block. Scoring them one
  // at a time reads the block six times over, and this runs three times per
  // block for every block of the image.
  costs.fill(0, 0, numCandidates);
  for (let k = 0; k < n; k++) {
    const s = _int8(source[k]);
    const t = target[k];
    for (let c = 0; c < numCandidates; c++) {
      const d = (t - ((signed[c] * s) >> 5)) & 0xff;
      costs[c] += d < 128 ? d : 256 - d;
    }
  }

  let best = 0;
  let bestCost = costs[0];
  for (let c = 1; c < numCandidates; c++) {
    if (costs[c] < bestCost) {
      bestCost = costs[c];
      best = candidates[c];
    }
  }
  return best & 0xff;
}

/**
 * Chooses multipliers for every block, or undefined when the transform would
 * not pay for the sub-image that has to carry it.
 */
export function selectCrossColor(
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  width: number,
  height: number,
  blockBits: number
): VP8LColorMultipliers[] | undefined {
  const blockSize = 1 << blockBits;
  const blockW = (width + blockSize - 1) >> blockBits;
  const blockH = (height + blockSize - 1) >> blockBits;
  const result: VP8LColorMultipliers[] = [];

  // Red residuals in the first half, blue in the second.
  const before = new Uint32Array(512);
  const after = new Uint32Array(512);

  // Each block's channels gathered into contiguous buffers, reused across
  // blocks. The fits then walk plain arrays instead of chasing a list of pixel
  // indices, and nothing is allocated per block.
  const maxBlock = blockSize * blockSize;
  const blockG = new Uint8Array(maxBlock);
  const blockR = new Uint8Array(maxBlock);
  const blockB = new Uint8Array(maxBlock);
  const blueAfterGreen = new Uint8Array(maxBlock);
  const candidates = new Int32Array(6);
  const signed = new Int32Array(6);
  const costs = new Int32Array(6);

  for (let by = 0; by < blockH; by++) {
    for (let bx = 0; bx < blockW; bx++) {
      const x0 = bx * blockSize;
      const y0 = by * blockSize;
      const x1 = x0 + blockSize < width ? x0 + blockSize : width;
      const y1 = y0 + blockSize < height ? y0 + blockSize : height;

      let n = 0;
      for (let y = y0; y < y1; y++) {
        const base = y * width;
        for (let x = x0; x < x1; x++) {
          const i = base + x;
          blockG[n] = g[i];
          blockR[n] = r[i];
          blockB[n] = b[i];
          n++;
        }
      }

      const greenToRed = _fitMultiplier(
        blockG,
        blockR,
        n,
        candidates,
        signed,
        costs
      );

      // Blue is predicted from green first, then from red, matching the order
      // the decoder undoes them in.
      const greenToBlue = _fitMultiplier(
        blockG,
        blockB,
        n,
        candidates,
        signed,
        costs
      );
      for (let k = 0; k < n; k++) {
        blueAfterGreen[k] =
          (blockB[k] - colorTransformDelta(greenToBlue, blockG[k])) & 0xff;
      }
      const redToBlue = _fitMultiplier(
        blockR,
        blueAfterGreen,
        n,
        candidates,
        signed,
        costs
      );

      result.push(new VP8LColorMultipliers(greenToRed, greenToBlue, redToBlue));

      // What actually gets coded is the entropy of the residuals, not their
      // magnitude, so accumulate the distributions over the whole image and
      // compare those.
      for (let k = 0; k < n; k++) {
        before[blockR[k]]++;
        before[256 + blockB[k]]++;
        after[
          (blockR[k] - colorTransformDelta(greenToRed, blockG[k])) & 0xff
        ]++;
        after[
          256 +
            ((blueAfterGreen[k] - colorTransformDelta(redToBlue, blockR[k])) &
              0xff)
        ]++;
      }
    }
  }

  // Storing the sub-image costs something too; charge three bytes a block.
  const gain =
    _entropy(before, 256) +
    _entropy(before, 256, 256) -
    _entropy(after, 256) -
    _entropy(after, 256, 256);
  return gain > blockW * blockH * 24 ? result : undefined;
}

/**
 * Shannon entropy in bits of a slice of [freq].
 */
function _entropy(freq: Uint32Array, size: number, offset = 0): number {
  let total = 0;
  for (let i = 0; i < size; i++) {
    total += freq[offset + i];
  }
  if (total === 0) {
    return 0;
  }
  let bits = 0.0;
  for (let i = 0; i < size; i++) {
    const f = freq[offset + i];
    if (f > 0) {
      bits -= f * (Math.log(f / total) / Math.LN2);
    }
  }
  return bits;
}

/**
 * Applies the transform in place, exactly inverting what the decoder's
 * colorSpaceInverseTransform will do.
 */
export function applyCrossColor(
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  width: number,
  height: number,
  blockBits: number,
  multipliers: VP8LColorMultipliers[]
): void {
  const blockW = (width + (1 << blockBits) - 1) >> blockBits;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const m = multipliers[(y >> blockBits) * blockW + (x >> blockBits)];
      const red = r[i];
      r[i] = (red - colorTransformDelta(m.greenToRed, g[i])) & 0xff;
      // The decoder adds the red term back using the red it has just restored,
      // which is this original value, so subtract with it here.
      b[i] =
        (b[i] -
          colorTransformDelta(m.greenToBlue, g[i]) -
          colorTransformDelta(m.redToBlue, red)) &
        0xff;
    }
  }
}
