/** @format */

import { VP8Config } from './vp8-config.js';
import { qFix, VP8Matrix } from './vp8-matrix.js';
import { sar } from './vp8-sar.js';
import { VP8SegmentInfo } from './vp8-segment-info.js';
import { kAcTable, kDcTable } from './vp8-tables.js';

export { VP8Matrix };
export { VP8SegmentInfo };

/**
 * Largest codable coefficient level.
 */
export const maxLevel = 2047;

/**
 * Diffusion errors are stored descaled by this, so that they fit in a byte.
 */
export const errorDescale = 1;

/**
 * The AC step sizes of the luma DC block, which is coded through a second
 * transform and so needs a coarser ladder than {@link kAcTable}.
 */
const acTable2 = [
  8, 8, 9, 10, 12, 13, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 31, 32, 34, 35,
  37, 38, 40, 41, 43, 44, 46, 48, 49, 51, 52, 54, 55, 57, 58, 60, 62, 63, 65,
  66, 68, 69, 71, 72, 74, 75, 77, 79, 80, 82, 83, 85, 86, 88, 89, 93, 96, 99,
  102, 105, 108, 111, 114, 117, 120, 124, 127, 130, 133, 136, 139, 142, 145,
  148, 151, 155, 158, 161, 164, 167, 170, 173, 176, 179, 184, 189, 193, 198,
  203, 207, 212, 217, 221, 226, 230, 235, 240, 244, 249, 254, 258, 263, 268,
  274, 280, 286, 292, 299, 305, 311, 317, 323, 330, 336, 342, 348, 354, 362,
  370, 379, 385, 393, 401, 409, 416, 424, 432, 440,
];

/**
 * Filtering strength needed to smooth an edge step of a given size, indexed
 * by sharpness then by the step.
 */
const levelsFromDelta = [
  [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    59, 60, 61, 62, 63,
  ],
  [
    0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 20, 21, 23, 24, 26,
    27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50, 51, 53, 54,
    56, 57, 59, 60, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
  [
    0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26,
    28, 29, 31, 32, 34, 35, 37, 38, 40, 41, 43, 44, 46, 47, 49, 50, 52, 53, 55,
    56, 58, 59, 61, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
  [
    0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27,
    28, 30, 31, 33, 34, 36, 37, 39, 40, 42, 43, 45, 46, 48, 49, 51, 52, 54, 55,
    57, 58, 60, 61, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
  [
    0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27,
    29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50, 51, 53, 54, 56,
    57, 59, 60, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
  [
    0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20, 22, 23, 25, 26, 28,
    29, 31, 32, 34, 35, 37, 38, 40, 41, 43, 44, 46, 47, 49, 50, 52, 53, 55, 56,
    58, 59, 61, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
  [
    0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28,
    30, 31, 33, 34, 36, 37, 39, 40, 42, 43, 45, 46, 48, 49, 51, 52, 54, 55, 57,
    58, 60, 61, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
  [
    0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29,
    30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50, 51, 53, 54, 56, 57,
    59, 60, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
    63, 63, 63, 63, 63,
  ],
];

/**
 * The filtering strength that would smooth an edge step of {@link delta}.
 */
export function filterStrengthFromDelta(
  sharpness: number,
  delta: number
): number {
  return levelsFromDelta[sharpness][delta < 64 ? delta : 63];
}

function clip(v: number, m: number, M: number): number {
  return v < m ? m : v > M ? M : v;
}

function step(
  inp: Int16Array,
  at: number,
  out: Int16Array,
  to: number,
  sharpen: number,
  q: number,
  iq: number,
  bias: number,
  zthresh: number
): boolean {
  const v = inp[at];
  const sign = v < 0;
  const coeff = (sign ? -v : v) + sharpen;
  if (coeff > zthresh) {
    let level = (coeff * iq + bias) >> qFix;
    if (level > maxLevel) {
      level = maxLevel;
    }
    if (sign) {
      level = -level;
    }
    inp[at] = level * q;
    out[to] = level;
    return level !== 0;
  }
  out[to] = 0;
  inp[at] = 0;
  return false;
}

/**
 * Quantizes one 4x4 block in place.
 *
 * {@link inp} holds the transform coefficients in raster order and is overwritten
 * with the dequantized values, so the caller can reconstruct straight from it.
 * {@link out} receives the levels in zigzag order.
 *
 * Returns the position of the last non-zero level, or -1 if there is none.
 */
export function quantizeBlock(
  inp: Int16Array,
  inOff: number,
  out: Int16Array,
  outOff: number,
  mtx: VP8Matrix
): number {
  const sharpen = mtx.sharpen;
  const q = mtx.q[1];
  const iq = mtx.iq[1];
  const bias = mtx.bias[1];
  const zthresh = mtx.zthresh[1];
  let last = -1;

  if (
    step(
      inp,
      inOff,
      out,
      outOff,
      sharpen[0],
      mtx.q[0],
      mtx.iq[0],
      mtx.bias[0],
      mtx.zthresh[0]
    )
  ) {
    last = 0;
  }
  if (step(inp, inOff + 1, out, outOff + 1, sharpen[1], q, iq, bias, zthresh)) {
    last = 1;
  }
  if (step(inp, inOff + 4, out, outOff + 2, sharpen[4], q, iq, bias, zthresh)) {
    last = 2;
  }
  if (step(inp, inOff + 8, out, outOff + 3, sharpen[8], q, iq, bias, zthresh)) {
    last = 3;
  }
  if (step(inp, inOff + 5, out, outOff + 4, sharpen[5], q, iq, bias, zthresh)) {
    last = 4;
  }
  if (step(inp, inOff + 2, out, outOff + 5, sharpen[2], q, iq, bias, zthresh)) {
    last = 5;
  }
  if (step(inp, inOff + 3, out, outOff + 6, sharpen[3], q, iq, bias, zthresh)) {
    last = 6;
  }
  if (step(inp, inOff + 6, out, outOff + 7, sharpen[6], q, iq, bias, zthresh)) {
    last = 7;
  }
  if (step(inp, inOff + 9, out, outOff + 8, sharpen[9], q, iq, bias, zthresh)) {
    last = 8;
  }
  if (
    step(inp, inOff + 12, out, outOff + 9, sharpen[12], q, iq, bias, zthresh)
  ) {
    last = 9;
  }
  if (
    step(inp, inOff + 13, out, outOff + 10, sharpen[13], q, iq, bias, zthresh)
  ) {
    last = 10;
  }
  if (
    step(inp, inOff + 10, out, outOff + 11, sharpen[10], q, iq, bias, zthresh)
  ) {
    last = 11;
  }
  if (
    step(inp, inOff + 7, out, outOff + 12, sharpen[7], q, iq, bias, zthresh)
  ) {
    last = 12;
  }
  if (
    step(inp, inOff + 11, out, outOff + 13, sharpen[11], q, iq, bias, zthresh)
  ) {
    last = 13;
  }
  if (
    step(inp, inOff + 14, out, outOff + 14, sharpen[14], q, iq, bias, zthresh)
  ) {
    last = 14;
  }
  if (
    step(inp, inOff + 15, out, outOff + 15, sharpen[15], q, iq, bias, zthresh)
  ) {
    last = 15;
  }
  return last;
}

/**
 * Quantizes one DC coefficient in place, returning the error left behind,
 * descaled by {@link errorDescale} so that it fits in a signed byte.
 */
export function quantizeSingleDC(
  v: Int16Array,
  at: number,
  mtx: VP8Matrix
): number {
  let value = v[at];
  const sign = value < 0;
  if (sign) {
    value = -value;
  }
  if (value > mtx.zthresh[0]) {
    let level = (value * mtx.iq[0] + mtx.bias[0]) >> qFix;
    if (level > maxLevel) {
      level = maxLevel;
    }
    const qv = level * mtx.q[0];
    const err = value - qv;
    v[at] = sign ? -qv : qv;
    return sar(sign ? -err : err, errorDescale);
  }
  v[at] = 0;
  return sar(sign ? -value : value, errorDescale);
}

/**
 * Quantizes the two blocks at {@link inOff}, returning a two-bit non-zero mask.
 */
export function quantize2Blocks(
  inp: Int16Array,
  inOff: number,
  out: Int16Array,
  outOff: number,
  mtx: VP8Matrix
): number {
  const low = quantizeBlock(inp, inOff, out, outOff, mtx) >= 0 ? 1 : 0;
  const high =
    quantizeBlock(inp, inOff + 16, out, outOff + 16, mtx) >= 0 ? 2 : 0;
  return low | high;
}

/**
 * Neutral, lowest and highest useful values of the susceptibility scale.
 */
export const midAlpha = 64;
export const minAlpha = 30;
export const maxAlpha = 100;

/**
 * Scaling between the noise-shaping setting and the quantizer modulation.
 */
const snsToDq = 0.9;

/**
 * The chroma quantizer may be moved this far from the luma one.
 */
const maxDqUv = 6;
const minDqUv = -4;

/**
 * Below this, filtering has no visible effect and only costs decode time.
 */
const fStrengthCutoff = 2;

/**
 * The quantizer state of a frame: one segment set plus the channel offsets.
 */
export class VP8Quantizers {
  public numSegments: number;
  public readonly dqm: VP8SegmentInfo[] = [
    new VP8SegmentInfo(),
    new VP8SegmentInfo(),
    new VP8SegmentInfo(),
    new VP8SegmentInfo(),
  ];

  /**
   * The quantizer other segments are coded relative to.
   */
  public baseQuant: number = 0;

  public dqY1Dc: number = 0;
  public dqY2Dc: number = 0;
  public dqY2Ac: number = 0;
  public dqUvDc: number = 0;
  public dqUvAc: number = 0;

  public filterLevel: number = 0;
  public filterSharpness: number = 0;
  public filterSimple: boolean = false;

  constructor(numSegments: number) {
    this.numSegments = numSegments;
  }

  /**
   * Chooses each segment's quantizer for {@link quality}, then everything that
   * follows from it.
   */
  public setSegmentParams(
    config: VP8Config,
    quality: number,
    alpha: number,
    uvAlpha: number,
    segmentOfMb: Uint8Array
  ): void {
    const amp = (snsToDq * config.snsStrength) / 100 / 128;
    const q = quality / 100;
    const cBase = config.emulateJpegSize
      ? qualityToJpegCompression(q, alpha / 255)
      : qualityToCompression(q);
    for (let i = 0; i < this.numSegments; i++) {
      // A segment that can take more quantization without showing it gets a
      // larger exponent, hence a coarser quantizer.
      const expn = 1.0 - amp * this.dqm[i].alpha;
      const c = Math.pow(cBase, expn);
      this.dqm[i].quant = clip((127 * (1 - c)) | 0, 0, 127);
    }

    this.baseQuant = this.dqm[0].quant;
    for (let i = this.numSegments; i < 4; i++) {
      this.dqm[i].quant = this.baseQuant;
    }

    let dqUvAcValue =
      ((uvAlpha - midAlpha) * (maxDqUv - minDqUv)) / (maxAlpha - minAlpha);
    dqUvAcValue = (dqUvAcValue * config.snsStrength) / 100;
    this.dqUvAc = clip(dqUvAcValue | 0, minDqUv, maxDqUv);
    this.dqUvDc = clip(((-4 * config.snsStrength) / 100) | 0, -15, 15);

    this.dqY1Dc = 0;
    this.dqY2Dc = 0;
    this.dqY2Ac = 0;

    this.setupFilterStrength(config);
    if (this.numSegments > 1) {
      this.simplifySegments(segmentOfMb);
    }
    this.setupMatrices(config);
  }

  private setupFilterStrength(config: VP8Config): void {
    const level0 = 5 * config.filterStrength;
    for (let i = 0; i < 4; i++) {
      const m = this.dqm[i];
      const qstep = kAcTable[clip(m.quant, 0, 127)] >> 2;
      const baseStrength = filterStrengthFromDelta(
        config.filterSharpness,
        qstep
      );
      const f = (baseStrength * level0) / (256 + m.beta);
      m.fstrength = f < fStrengthCutoff ? 0 : f > 63 ? 63 : f | 0;
    }
    this.filterLevel = this.dqm[0].fstrength;
    this.filterSimple = config.filterType === 0;
    this.filterSharpness = config.filterSharpness;
  }

  private simplifySegments(segmentOfMb: Uint8Array): void {
    const map = new Int32Array(4);
    let numFinal = 1;
    for (let s1 = 1; s1 < this.numSegments; s1++) {
      let found = false;
      let s2 = 0;
      for (; s2 < numFinal; s2++) {
        if (this.dqm[s1].equivalentTo(this.dqm[s2])) {
          found = true;
          break;
        }
      }
      map[s1] = s2;
      if (!found) {
        if (numFinal !== s1) {
          this.dqm[numFinal].copyFrom(this.dqm[s1]);
        }
        numFinal++;
      }
    }
    if (numFinal < this.numSegments) {
      for (let i = 0; i < segmentOfMb.length; i++) {
        segmentOfMb[i] = map[segmentOfMb[i]];
      }
      for (let i = numFinal; i < this.numSegments; i++) {
        this.dqm[i].copyFrom(this.dqm[numFinal - 1]);
      }
      this.numSegments = numFinal;
    }
  }

  /**
   * Builds the three matrices of each segment and the weights that go with
   * them.
   */
  public setupMatrices(config: VP8Config): void {
    const tlambdaScale = config.method >= 4 ? config.snsStrength : 0;
    for (let i = 0; i < this.numSegments; i++) {
      const m = this.dqm[i];
      const q = m.quant;
      m.y1.q[0] = kDcTable[clip(q + this.dqY1Dc, 0, 127)];
      m.y1.q[1] = kAcTable[clip(q, 0, 127)];

      m.y2.q[0] = kDcTable[clip(q + this.dqY2Dc, 0, 127)] * 2;
      m.y2.q[1] = acTable2[clip(q + this.dqY2Ac, 0, 127)];

      m.uv.q[0] = kDcTable[clip(q + this.dqUvDc, 0, 117)];
      m.uv.q[1] = kAcTable[clip(q + this.dqUvAc, 0, 127)];

      const qI4 = m.y1.expand(0);
      const qI16 = m.y2.expand(1);
      const qUv = m.uv.expand(2);

      m.lambdaI4 = atLeast1((3 * qI4 * qI4) >> 7);
      m.lambdaI16 = atLeast1(3 * qI16 * qI16);
      m.lambdaUv = atLeast1((3 * qUv * qUv) >> 6);
      m.lambdaMode = atLeast1((qI4 * qI4) >> 7);
      m.lambdaTrellisI4 = atLeast1((7 * qI4 * qI4) >> 3);
      m.lambdaTrellisI16 = atLeast1((qI16 * qI16) >> 2);
      m.lambdaTrellisUv = atLeast1((qUv * qUv) << 1);
      m.tlambda = atLeast1((tlambdaScale * qI4) >> 5);
      m.minDisto = 20 * m.y1.q[0];
      m.maxEdge = 0;
      m.i4Penalty = 1000 * qI4 * qI4;
    }
  }
}

function atLeast1(v: number): number {
  return v < 1 ? 1 : v;
}

function qualityToCompression(c: number): number {
  const linearC = c < 0.75 ? c * (2 / 3) : 2 * c - 1;
  return Math.pow(linearC, 1 / 3);
}

function qualityToJpegCompression(c: number, alpha: number): number {
  const aMin = 0.3;
  const aMax = 0.85;
  const expMin = 0.4;
  const expMax = 0.9;
  const slope = (expMin - expMax) / (aMax - aMin);
  const expn =
    alpha > aMax
      ? expMin
      : alpha < aMin
        ? expMax
        : expMax + slope * (alpha - aMin);
  return Math.pow(c, expn);
}
