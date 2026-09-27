/** @format */

/**
 * The analysis pass: deciding how many quantizer segments the picture wants
 * and which macroblock belongs to which.
 *
 * Each macroblock is scored by how much of its energy survives the transform.
 * A block whose coefficients spread out is detailed and hides quantization
 * error well; a block whose energy sits in a few coefficients is smooth and
 * shows it. Clustering those scores lets the busy parts of a picture take a
 * coarser quantizer than the flat parts, at the same visual quality.
 */

import { fTransform, mean16x4, predChroma8, predLuma16 } from './vp8-dsp.js';
import { VP8EncIterator } from './vp8-iterator.js';
import { VP8EncState } from './vp8-state.js';
import {
  kBps,
  kScan,
  kScanUV,
  kI16ModeOffsets,
  kUVModeOffsets,
  yOffEnc,
  uOffEnc,
} from './vp8-tables.js';

/**
 * Coefficients above this bin are lumped together; they are mostly noise.
 */
const _maxCoeffThresh = 31;

/**
 * Susceptibilities use the whole 8-bit range.
 */
const _maxAlpha = 255;
const _alphaScale = 2 * _maxAlpha;

/**
 * How many modes to weigh during analysis.
 *
 * Testing every mode here risks settling into a local optimum that the real
 * search would have avoided, so only the first two of each are tried.
 */
const _maxIntra16Mode = 2;
const _maxUVMode = 2;

const _maxItersKMeans = 6;

/**
 * Offsets of the sixteen luma blocks followed by the eight chroma blocks.
 */
const _dspScan = new Uint16Array(24);
_dspScan.set(kScan, 0);
_dspScan.set(kScanUV, 16);

function _clip(v: number, m: number, M: number): number {
  return v < m ? m : v > M ? M : v;
}

/**
 * Chooses segments for every macroblock of [enc].
 */
export function analyzeSegments(enc: VP8EncState): void {
  const needsSegments =
    enc.config.emulateJpegSize || enc.numSegments > 1 || enc.config.method <= 1;
  if (!needsSegments) {
    _resetAllMBInfo(enc);
    return;
  }

  const alphas = new Int32Array(_maxAlpha + 1);
  const it = new VP8EncIterator(enc);
  const analyzer = new MBAnalyzer(enc, it);
  let alphaSum = 0;
  let uvAlphaSum = 0;
  const totalMb = enc.mbW * enc.mbH;

  do {
    // The analysis pretends the reconstruction is perfect, so the neighbours
    // it predicts from are the source samples.
    it.import(true);
    analyzer.analyze(alphas);
    alphaSum += analyzer.bestAlpha;
    uvAlphaSum += analyzer.bestUvAlpha;
  } while (it.next());

  enc.alpha = Math.trunc(alphaSum / totalMb);
  enc.uvAlpha = Math.trunc(uvAlphaSum / totalMb);
  _assignSegments(enc, alphas);
}

function _resetAllMBInfo(enc: VP8EncState): void {
  const n = enc.mbW * enc.mbH;
  // Intra 16x16.
  enc.mbType.fill(1, 0, n);
  enc.mbUvMode.fill(0, 0, n);
  enc.mbSkip.fill(0, 0, n);
  enc.mbSegment.fill(0, 0, n);
  enc.mbAlpha.fill(0, 0, n);
  enc.quant.dqm[0].alpha = 0;
  enc.quant.dqm[0].beta = 0;
  enc.alpha = 0;
  enc.uvAlpha = 0;
}

/**
 * Measures one macroblock and picks a first guess at its modes.
 */
class MBAnalyzer {
  public readonly enc: VP8EncState;
  public readonly it: VP8EncIterator;

  private readonly _coeffs = new Int16Array(16);
  private readonly _distribution = new Int32Array(_maxCoeffThresh + 1);

  /**
   * Susceptibility of the macroblock just analyzed, and of its chroma.
   */
  public bestAlpha: number = 0;
  public bestUvAlpha: number = 0;

  constructor(enc: VP8EncState, it: VP8EncIterator) {
    this.enc = enc;
    this.it = it;
  }

  public analyze(alphas: Int32Array): void {
    // Default: intra 16x16, DC.
    this.it.setIntra16Mode(0);
    this.it.setSkip(false);
    this.it.setSegment(0);

    const luma =
      this.enc.config.method <= 1
        ? this._fastAnalyze()
        : this._bestIntra16Mode();
    this.bestUvAlpha = this._bestUVMode();

    // Luma dominates the impression, but chroma is not free either.
    let alpha = (3 * luma + this.bestUvAlpha + 2) >> 2;
    alpha = _clip(_maxAlpha - alpha, 0, _maxAlpha);
    alphas[alpha]++;
    this.enc.mbAlpha[this.it.mbPos] = alpha;
    this.bestAlpha = alpha;
  }

  /**
   * Collects the coefficient histogram of blocks `[start, end)` and returns
   * the susceptibility it implies.
   */
  private _alphaOf(predOffset: number, start: number, end: number): number {
    this._distribution.fill(0, 0, this._distribution.length);
    for (let j = start; j < end; j++) {
      const off = _dspScan[j];
      const srcBase = j < 16 ? yOffEnc : uOffEnc;
      fTransform(
        this.it.yuvIn,
        srcBase + off,
        this.it.yuvP,
        predOffset + off,
        this._coeffs,
        0
      );
      for (let k = 0; k < 16; k++) {
        // Written out rather than calling abs(), which stays a call and shows
        // up as its own entry in the profile.
        const c = this._coeffs[k];
        const v = (c < 0 ? -c : c) >> 3;
        this._distribution[v > _maxCoeffThresh ? _maxCoeffThresh : v]++;
      }
    }
    let maxValue = 0;
    let lastNonZero = 1;
    for (let k = 0; k <= _maxCoeffThresh; k++) {
      const value = this._distribution[k];
      if (value > 0) {
        if (value > maxValue) {
          maxValue = value;
        }
        lastNonZero = k;
      }
    }
    // Energy spread over many bins means the block is busy and can take more
    // quantization; energy in one bin means it is flat and cannot.
    return maxValue > 1
      ? Math.trunc((_alphaScale * lastNonZero) / maxValue)
      : 0;
  }

  private _bestIntra16Mode(): number {
    predLuma16(
      this.it.yuvP,
      this.it.x !== 0 ? this.it.yLeft : undefined,
      VP8EncIterator.yLeftOff,
      this.it.y !== 0 ? this.it.yTop : undefined,
      this.it.yTopPos
    );
    let best = -1;
    let bestMode = 0;
    for (let mode = 0; mode < _maxIntra16Mode; mode++) {
      const alpha = this._alphaOf(kI16ModeOffsets[mode], 0, 16);
      if (alpha > best) {
        best = alpha;
        bestMode = mode;
      }
    }
    this.it.setIntra16Mode(bestMode);
    return best;
  }

  private _bestUVMode(): number {
    predChroma8(
      this.it.yuvP,
      this.it.x !== 0 ? this.it.uvLeft : undefined,
      VP8EncIterator.uLeftOff,
      this.it.y !== 0 ? this.it.uvTop : undefined,
      this.it.uvTopPos
    );
    let best = -1;
    let smallest = 0;
    let bestMode = 0;
    for (let mode = 0; mode < _maxUVMode; mode++) {
      const alpha = this._alphaOf(kUVModeOffsets[mode], 16, 16 + 4 + 4);
      if (alpha > best) {
        best = alpha;
      }
      // The mode that leaves the least energy behind is the one to predict
      // with, even though the susceptibility we report is the largest.
      if (mode === 0 || alpha < smallest) {
        smallest = alpha;
        bestMode = mode;
      }
    }
    this.it.setIntraUVMode(bestMode);
    return best;
  }

  /**
   * The cheap analysis used at method 0 and 1: compare the variance of the
   * sixteen block means against a threshold.
   */
  private _fastAnalyze(): number {
    const q = Math.trunc(this.enc.config.quality);
    // Around the block size, favouring 4x4 at high quality.
    const threshold = 8 + Math.trunc(((17 - 8) * q) / 100);
    const dc = new Uint32Array(16);
    for (let k = 0; k < 16; k += 4) {
      mean16x4(this.it.yuvIn, yOffEnc + k * kBps, dc, k);
    }
    let m = 0;
    let m2 = 0;
    for (let k = 0; k < 16; k++) {
      m += dc[k];
      m2 += dc[k] * dc[k];
    }
    if (threshold * m2 < m * m) {
      // Flat: DC over the whole macroblock.
      this.it.setIntra16Mode(0);
    } else {
      this.it.setIntra4Mode(new Uint8Array(16));
    }
    return 0;
  }
}

/**
 * Groups the macroblocks into segments by clustering their susceptibilities.
 */
function _assignSegments(enc: VP8EncState, alphas: Int32Array): void {
  const nb = enc.numSegments;
  const centers = new Int32Array(4);
  const map = new Int32Array(_maxAlpha + 1);
  const accum = new Int32Array(4);
  const distAccum = new Int32Array(4);
  let weightedAverage = 0;

  let minA = 0;
  let maxA = _maxAlpha;
  let n = 0;
  while (n <= _maxAlpha && alphas[n] === 0) {
    n++;
  }
  minA = n;
  n = _maxAlpha;
  while (n > minA && alphas[n] === 0) {
    n--;
  }
  maxA = n;
  const rangeA = maxA - minA;

  // Start with the centres spread evenly over the range that is in use.
  for (let k = 0, i = 1; k < nb; k++, i += 2) {
    centers[k] = minA + Math.trunc((i * rangeA) / (2 * nb));
  }

  for (let k = 0; k < _maxItersKMeans; k++) {
    accum.fill(0, 0, nb);
    distAccum.fill(0, 0, nb);
    // The centres stay sorted, so the nearest one can be tracked by walking
    // forward with 'a'.
    let c = 0;
    for (let a = minA; a <= maxA; a++) {
      if (alphas[a] !== 0) {
        while (
          c + 1 < nb &&
          Math.abs(a - centers[c + 1]) < Math.abs(a - centers[c])
        ) {
          c++;
        }
        map[a] = c;
        distAccum[c] += a * alphas[a];
        accum[c] += alphas[a];
      }
    }
    let displaced = 0;
    let totalWeight = 0;
    weightedAverage = 0;
    for (let i = 0; i < nb; i++) {
      if (accum[i] !== 0) {
        const newCenter = Math.trunc(
          (distAccum[i] + Math.trunc(accum[i] / 2)) / accum[i]
        );
        displaced += Math.abs(centers[i] - newCenter);
        centers[i] = newCenter;
        weightedAverage += newCenter * accum[i];
        totalWeight += accum[i];
      }
    }
    weightedAverage = Math.trunc(
      (weightedAverage + Math.trunc(totalWeight / 2)) / totalWeight
    );
    if (displaced < 5) {
      break;
    }
  }

  for (let i = 0; i < enc.mbW * enc.mbH; i++) {
    const alpha = enc.mbAlpha[i];
    enc.mbSegment[i] = map[alpha];
    // For the record.
    enc.mbAlpha[i] = centers[map[alpha]];
  }

  _setSegmentAlphas(enc, centers, weightedAverage);
}

/**
 * Turns the cluster centres into the per-segment susceptibilities that drive
 * the quantizer and the filter strength.
 */
function _setSegmentAlphas(
  enc: VP8EncState,
  centers: Int32Array,
  mid: number
): void {
  const nb = enc.numSegments;
  let min = centers[0];
  let max = centers[0];
  if (nb > 1) {
    for (let n = 0; n < nb; n++) {
      if (min > centers[n]) {
        min = centers[n];
      }
      if (max < centers[n]) {
        max = centers[n];
      }
    }
  }
  if (max === min) {
    max = min + 1;
  }
  for (let n = 0; n < nb; n++) {
    const alpha = Math.trunc((255 * (centers[n] - mid)) / (max - min));
    const beta = Math.trunc((255 * (centers[n] - min)) / (max - min));
    enc.quant.dqm[n].alpha = _clip(alpha, -127, 127);
    enc.quant.dqm[n].beta = _clip(beta, 0, 255);
  }
}
