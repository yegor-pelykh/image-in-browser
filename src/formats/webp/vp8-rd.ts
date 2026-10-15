/** @format */

/**
 * Choosing how to code one macroblock.
 *
 * For every candidate mode the encoder reconstructs the block exactly as the
 * decoder would, measures how far the result is from the source, prices the
 * bits it would take, and keeps the mode with the lowest rate-distortion
 * score. The lambda that converts bits into distortion comes from the
 * quantizer, so a coarsely quantized picture is willing to spend fewer bits
 * on the same amount of error.
 */

import { ArrayUtils } from '../../common/array-utils.js';
import { VP8Config } from './vp8-config.js';
import {
  kFixedCostsI4,
  kFixedCostsI16,
  kFixedCostsUV,
} from './vp8-cost-tables.js';
import {
  copy16x8,
  copy4x4,
  distoFrom,
  fTransform,
  fTransform2,
  fTransformWHT,
  getSSE,
  getSSE4x4,
  iTransform,
  iTransform2,
  isFlat,
  isFlatSource16,
  predChroma8,
  predLuma16,
  predLuma4,
  spectrum4x4,
  transformWHT,
} from './vp8-dsp.js';
import { VP8EncIterator } from './vp8-iterator.js';
import { bitCost } from './vp8-enc-proba.js';
import { VP8Matrix } from './vp8-matrix.js';
import { maxCost, VP8ModeScore } from './vp8-mode-score.js';
import {
  errorDescale,
  maxLevel,
  quantize2Blocks,
  quantizeBlock,
  quantizeSingleDC,
} from './vp8-quant.js';
import { VP8SegmentInfo } from './vp8-segment-info.js';
import {
  getResidualCost,
  typeChroma,
  typeI16AC,
  typeI16DC,
  typeI4AC,
  VP8Residual,
} from './vp8-residual.js';
import { sar } from './vp8-sar.js';
import { VP8EncState } from './vp8-state.js';
import {
  i4TMP,
  kBands,
  kI16ModeOffsets,
  kI4ModeOffsets,
  kScan,
  kScanUV,
  kUVModeOffsets,
  kZigzag,
  numBands,
  numBModes,
  numCtx,
  numProbas,
  uOffEnc,
  yOffEnc,
} from './vp8-tables.js';

export { maxCost, VP8ModeScore };

/**
 * How much a unit of distortion weighs against a bit.
 */
const rdDistoMult = 256;

/**
 * The four 16x16 luma modes, and the four chroma modes.
 */
const numPredModes = 4;

// A block with few non-zero coefficients is "flat"; complex predictions that
// happen to fit such a block tend to look worse than the simple ones, so they
// are penalised.
const flatnessLimitI16 = 0;
const flatnessLimitI4 = 3;
const flatnessLimitUV = 2;
const flatnessPenalty = 140;

/**
 * Weights of the spectral distortion, matching {@link distoFrom}.
 */
const weightTrellis = [
  30, 27, 19, 11, 27, 24, 17, 10, 19, 17, 12, 8, 11, 10, 8, 6,
];

function mult8b(a: number, b: number): number {
  return (a * b + 128) >> 8;
}

function setRDScore(lambda: number, rd: VP8ModeScore): void {
  rd.score = (rd.r + rd.h) * lambda + rdDistoMult * (rd.d + rd.sd);
}

function rdScoreTrellis(
  lambda: number,
  rate: number,
  distortion: number
): number {
  return rate * lambda + rdDistoMult * distortion;
}

/**
 * The mode search, and the reconstruction it needs to judge a mode.
 *
 * One instance is reused for the whole picture: every buffer a search step
 * needs is a field here, so that coding a macroblock allocates nothing.
 */
export class VP8Decimate {
  public readonly enc: VP8EncState;
  public readonly it: VP8EncIterator;

  // Scratch coefficients: the sixteen luma blocks, their DC block, and one
  // spare block for the 4x4 search.
  private readonly _tmp = new Int16Array(16 * 16);
  private readonly _dcTmp = new Int16Array(16);
  private readonly _tmpLevels = new Int16Array(16);

  private readonly _rdTmp = new VP8ModeScore();
  private readonly _rdI4 = new VP8ModeScore();
  private readonly _rdBestI4 = new VP8ModeScore();
  private readonly _rdUv = new VP8ModeScore();
  private readonly _rdBestUv = new VP8ModeScore();
  private readonly _rdCandidate = new VP8ModeScore();
  private readonly _res = new VP8Residual();

  /**
   * The spectrum of each 4x4 block of the source macroblock. The mode search
   * compares every candidate against these, and the source does not change
   * while it does, so they are measured once per macroblock.
   */
  private readonly _srcSpectrum = new Int32Array(16);
  private _srcSpectrumValid: boolean = false;

  // Trellis state: two candidate levels per coefficient, and one node per
  // (coefficient, candidate).
  private readonly _nodePrev = new Int8Array(32);
  private readonly _nodeSign = new Int8Array(32);
  private readonly _nodeLevel = new Int16Array(32);
  // A plain list, not an Int64List: the web has no 64-bit integer array, and
  // these four values are read and written constantly anyway.
  private readonly _stateScore = ArrayUtils.fill(4, 0);
  private readonly _stateCost = new Int32Array(4);

  constructor(enc: VP8EncState, it: VP8EncIterator) {
    this.enc = enc;
    this.it = it;
  }

  /**
   * Picks modes and levels for the current macroblock. Returns true if the
   * macroblock ended up with no coefficients at all.
   */
  public run(rd: VP8ModeScore, rdOpt: number): boolean {
    rd.init();

    // The 16x16 and chroma predictions do not depend on the coding of this
    // macroblock, so they can all be made once; the 4x4 ones cannot, since
    // each block predicts from the reconstruction of the last.
    this.makeLuma16Preds();
    this.makeChroma8Preds();
    this._srcSpectrumValid = false;

    if (rdOpt > VP8Config.rdOptNone) {
      this.it.doTrellis = rdOpt >= VP8Config.rdOptTrellisAll;
      this.pickBestIntra16(rd);
      if (this.enc.config.method >= 2) {
        this.pickBestIntra4(rd);
      }
      this.pickBestUV(rd);
      if (rdOpt === VP8Config.rdOptTrellis) {
        // Redo the winner with the trellis on.
        this.it.doTrellis = true;
        this.simpleQuantize(rd);
      }
    } else {
      this.refineUsingDistortion(
        rd,
        this.enc.config.method >= 2,
        this.enc.config.method >= 1
      );
    }
    const isSkipped = rd.nz === 0;
    this.it.setSkip(isSkipped);
    return isSkipped;
  }

  /**
   * Measures the source spectra, once per macroblock.
   */
  private measureSourceSpectrum(): void {
    if (this._srcSpectrumValid) {
      return;
    }
    for (let n = 0; n < 16; n++) {
      this._srcSpectrum[n] = spectrum4x4(this.it.yuvIn, yOffEnc + kScan[n]);
    }
    this._srcSpectrumValid = true;
  }

  private makeLuma16Preds(): void {
    predLuma16(
      this.it.yuvP,
      this.it.yuvP32,
      this.it.x !== 0 ? this.it.yLeft : undefined,
      VP8EncIterator.yLeftOff,
      this.it.y !== 0 ? this.it.yTop : undefined,
      this.it.yTopPos
    );
  }

  private makeChroma8Preds(): void {
    predChroma8(
      this.it.yuvP,
      this.it.yuvP32,
      this.it.x !== 0 ? this.it.uvLeft : undefined,
      VP8EncIterator.uLeftOff,
      this.it.y !== 0 ? this.it.uvTop : undefined,
      this.it.uvTopPos
    );
  }

  private makeIntra4Preds(): void {
    predLuma4(this.it.yuvP, this.it.i4Boundary, this.it.i4Top);
  }

  //----------------------------------------------------------------------------
  // Reconstruction.

  /**
   * Transforms, quantizes and reconstructs a whole macroblock as intra 16x16.
   *
   * The DC of each of the sixteen blocks is collected into a seventeenth
   * block and transformed again, which is what makes flat areas cheap.
   */
  private reconstructIntra16(
    rd: VP8ModeScore,
    yuvOut: Uint8Array,
    mode: number
  ): number {
    const ref = kI16ModeOffsets[mode];
    const src = yOffEnc;
    const dqm = this.enc.quant.dqm[this.it.segment];
    let nz = 0;

    for (let n = 0; n < 16; n += 2) {
      fTransform2(
        this.it.yuvIn,
        src + kScan[n],
        this.it.yuvP,
        ref + kScan[n],
        this._tmp,
        n * 16
      );
    }
    fTransformWHT(this._tmp, 0, this._dcTmp, 0);
    nz |=
      (quantizeBlock(this._dcTmp, 0, rd.yDcLevels, 0, dqm.y2) >= 0 ? 1 : 0) <<
      24;

    if (this.it.doTrellis) {
      this.it.nzToBytes();
      let n = 0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++, n++) {
          const ctx = this.it.topNz[x] + this.it.leftNz[y];
          const nonZero = this.trellisQuantizeBlock(
            this._tmp,
            n * 16,
            rd.yAcLevels,
            n * 16,
            ctx,
            typeI16AC,
            dqm.y1,
            dqm.lambdaTrellisI16
          );
          this.it.topNz[x] = nonZero;
          this.it.leftNz[y] = nonZero;
          rd.yAcLevels[n * 16] = 0;
          nz |= nonZero << n;
        }
      }
    } else {
      for (let n = 0; n < 16; n += 2) {
        // The DC is carried by the second transform, so zero it here: it keeps
        // the non-zero flag honest and shortens the search for the last
        // coefficient.
        this._tmp[n * 16] = 0;
        this._tmp[(n + 1) * 16] = 0;
        nz |=
          quantize2Blocks(this._tmp, n * 16, rd.yAcLevels, n * 16, dqm.y1) << n;
      }
    }

    transformWHT(this._dcTmp, 0, this._tmp, 0);
    for (let n = 0; n < 16; n += 2) {
      iTransform2(
        this.it.yuvP,
        ref + kScan[n],
        this._tmp,
        n * 16,
        yuvOut,
        yOffEnc + kScan[n]
      );
    }
    return nz;
  }

  /**
   * The same for one 4x4 block, whose prediction is made as we go.
   */
  private reconstructIntra4(
    levels: Int16Array,
    levelsOff: number,
    srcOff: number,
    yuvOut: Uint8Array,
    outOff: number,
    mode: number
  ): number {
    const ref = kI4ModeOffsets[mode];
    const dqm = this.enc.quant.dqm[this.it.segment];
    fTransform(this.it.yuvIn, srcOff, this.it.yuvP, ref, this._tmpLevels, 0);
    // Reusing _tmp as the coefficient scratch would clash with the 16x16
    // search, so the 4x4 path keeps its own block.
    const coeffs = this._tmpLevels;
    let nz: number = 0;
    if (this.it.doTrellis) {
      const x = this.it.i4 & 3;
      const y = this.it.i4 >> 2;
      const ctx = this.it.topNz[x] + this.it.leftNz[y];
      nz = this.trellisQuantizeBlock(
        coeffs,
        0,
        levels,
        levelsOff,
        ctx,
        typeI4AC,
        dqm.y1,
        dqm.lambdaTrellisI4
      );
    } else {
      nz = quantizeBlock(coeffs, 0, levels, levelsOff, dqm.y1) >= 0 ? 1 : 0;
    }
    iTransform(this.it.yuvP, ref, coeffs, 0, yuvOut, outOff);
    return nz;
  }

  /**
   * And for the eight chroma blocks of a macroblock.
   */
  private reconstructUV(
    rd: VP8ModeScore,
    yuvOut: Uint8Array,
    mode: number
  ): number {
    const ref = kUVModeOffsets[mode];
    const src = uOffEnc;
    const dqm = this.enc.quant.dqm[this.it.segment];
    let nz = 0;

    for (let n = 0; n < 8; n += 2) {
      fTransform2(
        this.it.yuvIn,
        src + kScanUV[n],
        this.it.yuvP,
        ref + kScanUV[n],
        this._tmp,
        n * 16
      );
    }
    if (this.enc.topDerr !== undefined) {
      this.correctDCValues(rd, dqm.uv);
    }
    for (let n = 0; n < 8; n += 2) {
      nz |=
        quantize2Blocks(this._tmp, n * 16, rd.uvLevels, n * 16, dqm.uv) << n;
    }
    for (let n = 0; n < 8; n += 2) {
      iTransform2(
        this.it.yuvP,
        ref + kScanUV[n],
        this._tmp,
        n * 16,
        yuvOut,
        uOffEnc + kScanUV[n]
      );
    }
    return nz << 16;
  }

  //----------------------------------------------------------------------------
  // Chroma DC error diffusion.
  //
  // The four chroma blocks of one channel sit in a 2x2 square. Each takes the
  // error left over from its neighbors above and to the left before being
  // quantized, and passes its own on:
  //
  //           | top[0] | top[1]
  //   --------+--------+--------
  //   left[0] |  err0     err1
  //   left[1] |  err2     err3
  //
  // Only 15/16ths of the error is passed on. libwebp under-corrects on purpose:
  // diffusing all of it makes a chessboard of blocks appear at the very bottom
  // of the quality range.

  /**
   * Fraction of the error sent to the block below, out of 1 << {@link _dShift}.
   */
  private static readonly _c1 = 7;

  /**
   * And to the block on the right.
   */
  private static readonly _c2 = 8;
  private static readonly _dShift = 4;

  /**
   * Nudges the four DC coefficients of each chroma channel by the error its
   * neighbors left, and records what this macroblock passes on.
   */
  private correctDCValues(rd: VP8ModeScore, mtx: VP8Matrix): void {
    const top = this.enc.topDerr!;
    const left = this.it.leftDerr;
    for (let ch = 0; ch <= 1; ch++) {
      const t = this.it.x * 4 + ch * 2;
      const l = ch * 2;
      // The four DC coefficients are at the head of blocks 0..3 of this
      // channel, and the two channels are four blocks apart.
      const b = ch * 4 * 16;
      const s = VP8Decimate._dShift - errorDescale;

      this._tmp[b] += sar(
        VP8Decimate._c1 * top[t] + VP8Decimate._c2 * left[l],
        s
      );
      const err0 = quantizeSingleDC(this._tmp, b, mtx);
      this._tmp[b + 16] += sar(
        VP8Decimate._c1 * top[t + 1] + VP8Decimate._c2 * err0,
        s
      );
      const err1 = quantizeSingleDC(this._tmp, b + 16, mtx);
      this._tmp[b + 32] += sar(
        VP8Decimate._c1 * err0 + VP8Decimate._c2 * left[l + 1],
        s
      );
      const err2 = quantizeSingleDC(this._tmp, b + 32, mtx);
      this._tmp[b + 48] += sar(
        VP8Decimate._c1 * err1 + VP8Decimate._c2 * err2,
        s
      );
      const err3 = quantizeSingleDC(this._tmp, b + 48, mtx);

      rd.derr[ch * 3] = err1;
      rd.derr[ch * 3 + 1] = err2;
      rd.derr[ch * 3 + 2] = err3;
    }
  }

  /**
   * Hands the winning mode's errors to the neighbors still to be coded.
   */
  private storeDiffusionErrors(rd: VP8ModeScore): void {
    const top = this.enc.topDerr!;
    const left = this.it.leftDerr;
    for (let ch = 0; ch <= 1; ch++) {
      const t = this.it.x * 4 + ch * 2;
      const l = ch * 2;
      // err1, to the block on the right.
      left[l] = rd.derr[ch * 3];
      // Three quarters of err3, which is signed.
      left[l + 1] = sar(3 * rd.derr[ch * 3 + 2], 2);
      // err2, to the block below.
      top[t] = rd.derr[ch * 3 + 1];
      // The last quarter.
      top[t + 1] = rd.derr[ch * 3 + 2] - left[l + 1];
    }
  }

  //----------------------------------------------------------------------------
  // Trellis quantization.

  /**
   * Chooses the levels of one block by dynamic programming rather than by
   * rounding each coefficient on its own.
   *
   * Rounding is greedy: it cannot see that dropping one coefficient to zero
   * shortens the block and pays for itself. This walks the coefficients in
   * order, keeping for each the best path that ends there, and takes the best
   * ending position at the end.
   */
  private trellisQuantizeBlock(
    inp: Int16Array,
    inOff: number,
    out: Int16Array,
    outOff: number,
    ctx0: number,
    coeffType: number,
    mtx: VP8Matrix,
    lambda: number
  ): number {
    const proba = this.enc.proba;
    const probas = proba.coeffs;
    const costBase = proba.costBase;
    const first = coeffType === typeI16AC ? 1 : 0;
    let bestPathLast = -1;
    let bestPathNode = -1;
    let bestPathPrev = -1;
    let bestScore: number = 0;

    // Only two candidates per coefficient: the rounded level and one above it.
    // Levels below never win, since they cost as much and distort more.
    const minDelta = 0;
    const maxDelta = 1;
    // Index into _stateScore/_stateCost of the current pair.
    let ssCur = 0;
    let ssPrev = 2;

    let last = first - 1;
    {
      const thresh = Math.trunc((mtx.q[1] * mtx.q[1]) / 4);
      const lastProba =
        probas[VP8Decimate.probaIndex(coeffType, kBands[first], ctx0)];
      for (let n = 15; n >= first; n--) {
        const j = kZigzag[n];
        const err = inp[inOff + j] * inp[inOff + j];
        if (err > thresh) {
          last = n;
          break;
        }
      }
      if (last < 15) {
        last++;
      }
      // Coding nothing at all is the score to beat.
      bestScore = rdScoreTrellis(lambda, bitCost(0, lastProba), 0);
      const rate = ctx0 === 0 ? bitCost(1, lastProba) : 0;
      for (let m = 0; m <= maxDelta; m++) {
        this._stateScore[ssCur + m] = rdScoreTrellis(lambda, rate, 0);
        this._stateCost[ssCur + m] =
          costBase[(coeffType * 16 + first) * numCtx + ctx0];
      }
    }

    for (let n = first; n <= last; n++) {
      const j = kZigzag[n];
      const q = mtx.q[j];
      const iq = mtx.iq[j];
      const v = inp[inOff + j];
      const sign = v < 0 ? 1 : 0;
      const coeff0 = (v < 0 ? -v : v) + mtx.sharpen[j];
      // A neutral bias, so the two candidates bracket the true value.
      let level0 = (coeff0 * iq) >> 17;
      let threshLevel = (coeff0 * iq + (0x80 << 9)) >> 17;
      if (threshLevel > maxLevel) {
        threshLevel = maxLevel;
      }
      if (level0 > maxLevel) {
        level0 = maxLevel;
      }

      const tmp = ssCur;
      ssCur = ssPrev;
      ssPrev = tmp;

      for (let m = 0; m <= maxDelta; m++) {
        const node = n * 2 + m;
        const level = level0 + m;
        const ctx = level > 2 ? 2 : level;
        const band = kBands[n + 1];

        // The cost table of the following position, which the next round
        // prices its level against. There is no round after the sixteenth
        // coefficient, so nothing reads it there.
        this._stateCost[ssCur + m] =
          n < 15 ? costBase[(coeffType * 16 + n + 1) * numCtx + ctx] : 0;
        if (level < 0 || level > threshLevel) {
          this._stateScore[ssCur + m] = maxCost;
          continue;
        }

        // How much coding this level takes off the error of dropping it.
        const newError = coeff0 - level * q;
        const deltaError =
          weightTrellis[j] * (newError * newError - coeff0 * coeff0);
        const baseScore = rdScoreTrellis(lambda, 0, deltaError);

        let cost = proba.levelCostAt(this._stateCost[ssPrev + minDelta], level);
        let bestCurScore =
          this._stateScore[ssPrev + minDelta] + rdScoreTrellis(lambda, cost, 0);
        let bestPrev = minDelta;
        for (let p = minDelta + 1; p <= maxDelta; p++) {
          cost = proba.levelCostAt(this._stateCost[ssPrev + p], level);
          const score =
            this._stateScore[ssPrev + p] + rdScoreTrellis(lambda, cost, 0);
          if (score < bestCurScore) {
            bestCurScore = score;
            bestPrev = p;
          }
        }
        bestCurScore += baseScore;

        this._nodeSign[node] = sign;
        this._nodeLevel[node] = level;
        this._nodePrev[node] = bestPrev;
        this._stateScore[ssCur + m] = bestCurScore;

        // Could the block end here?
        if (level !== 0 && bestCurScore < bestScore) {
          const lastPosCost =
            n < 15
              ? bitCost(0, probas[VP8Decimate.probaIndex(coeffType, band, ctx)])
              : 0;
          const score = bestCurScore + rdScoreTrellis(lambda, lastPosCost, 0);
          if (score < bestScore) {
            bestScore = score;
            bestPathLast = n;
            bestPathNode = m;
            bestPathPrev = bestPrev;
          }
        }
      }
    }

    // The DC of an intra 16x16 block is not ours to touch.
    if (coeffType === typeI16AC) {
      inp.fill(0, inOff + 1, inOff + 16);
      out.fill(0, outOff + 1, outOff + 16);
    } else {
      inp.fill(0, inOff, inOff + 16);
      out.fill(0, outOff, outOff + 16);
    }
    if (bestPathLast === -1) {
      // The whole block is dropped.
      return 0;
    }

    let nz = 0;
    let node = bestPathNode;
    let n = bestPathLast;
    // The predecessor of the terminal node is not always the one stored.
    this._nodePrev[n * 2 + node] = bestPathPrev;
    for (; n >= first; n--) {
      const at = n * 2 + node;
      const level = this._nodeLevel[at];
      const j = kZigzag[n];
      out[outOff + n] = this._nodeSign[at] !== 0 ? -level : level;
      nz |= level;
      inp[inOff + j] = out[outOff + n] * mtx.q[j];
      node = this._nodePrev[at];
    }
    return nz !== 0 ? 1 : 0;
  }

  private static probaIndex(type: number, band: number, ctx: number): number {
    return ((type * numBands + band) * numCtx + ctx) * numProbas;
  }

  //----------------------------------------------------------------------------
  // Rate.

  private getCostLuma16(rd: VP8ModeScore): number {
    const proba = this.enc.proba;
    let r = 0;
    this.it.nzToBytes();

    this._res.init(0, typeI16DC);
    this._res.setCoeffs(rd.yDcLevels, 0);
    r += getResidualCost(
      proba,
      this._res,
      this.it.topNz[8] + this.it.leftNz[8]
    );

    this._res.init(1, typeI16AC);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const ctx = this.it.topNz[x] + this.it.leftNz[y];
        this._res.setCoeffs(rd.yAcLevels, (x + y * 4) * 16);
        r += getResidualCost(proba, this._res, ctx);
        const nz = this._res.last >= 0 ? 1 : 0;
        this.it.topNz[x] = nz;
        this.it.leftNz[y] = nz;
      }
    }
    return r;
  }

  private getCostLuma4(levels: Int16Array): number {
    const x = this.it.i4 & 3;
    const y = this.it.i4 >> 2;
    this._res.init(0, typeI4AC);
    this._res.setCoeffs(levels, 0);
    return getResidualCost(
      this.enc.proba,
      this._res,
      this.it.topNz[x] + this.it.leftNz[y]
    );
  }

  private getCostUV(rd: VP8ModeScore): number {
    const proba = this.enc.proba;
    let r = 0;
    this.it.nzToBytes();

    this._res.init(0, typeChroma);
    for (let ch = 0; ch <= 2; ch += 2) {
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const ctx = this.it.topNz[4 + ch + x] + this.it.leftNz[4 + ch + y];
          this._res.setCoeffs(rd.uvLevels, (ch * 2 + x + y * 2) * 16);
          r += getResidualCost(proba, this._res, ctx);
          const nz = this._res.last >= 0 ? 1 : 0;
          this.it.topNz[4 + ch + x] = nz;
          this.it.leftNz[4 + ch + y] = nz;
        }
      }
    }
    return r;
  }

  //----------------------------------------------------------------------------
  // Mode search.

  private pickBestIntra16(rd: VP8ModeScore): void {
    const dqm = this.enc.quant.dqm[this.it.segment];
    const lambda = dqm.lambdaI16;
    const tlambda = dqm.tlambda;
    const src = yOffEnc;
    let rdCur = this._rdTmp;
    let rdBest = rd;
    let isFlatBlock = isFlatSource16(this.it.yuvIn, src);
    if (tlambda !== 0) {
      this.measureSourceSpectrum();
    }

    rd.modeI16 = -1;
    for (let mode = 0; mode < numPredModes; mode++) {
      const tmpDst = this.it.yuvOut2;
      // Each step reads what the ones before it stored.
      rdCur.modeI16 = mode;
      rdCur.nz = this.reconstructIntra16(rdCur, tmpDst, mode);
      rdCur.d = getSSE(this.it.yuvIn, src, tmpDst, src, 16, 16);
      rdCur.sd = tlambda !== 0 ? mult8b(tlambda, this.disto16(tmpDst)) : 0;
      rdCur.h = kFixedCostsI16[mode];
      rdCur.r = this.getCostLuma16(rdCur);
      if (isFlatBlock) {
        // The first impression was made on the pixels; now that the levels are
        // known, confirm it.
        isFlatBlock = isFlat(rdCur.yAcLevels, 0, 16, flatnessLimitI16);
        if (isFlatBlock) {
          // Any error at all is conspicuous on a flat block.
          rdCur.d *= 2;
          rdCur.sd *= 2;
        }
      }

      setRDScore(lambda, rdCur);
      if (mode === 0 || rdCur.score < rdBest.score) {
        const tmp = rdCur;
        rdCur = rdBest;
        rdBest = tmp;
        this.it.swapOut();
      }
    }
    if (rdBest !== rd) {
      rd.copyFrom(rdBest);
    }
    // Re-score with the mode-decision lambda, which is what intra4 compares
    // itself against.
    setRDScore(dqm.lambdaMode, rd);
    this.it.setIntra16Mode(rd.modeI16);

    // A macroblock where only the DC survived, yet which is still far from the
    // source, is a candidate for blocking artefacts; remember how large its
    // steps were so the filter strength can be raised later.
    if ((rd.nz & 0x100ffff) === 0x1000000 && rd.d > dqm.minDisto) {
      VP8Decimate.storeMaxDelta(dqm, rd.yDcLevels);
    }
  }

  /**
   * The spectral distance of a whole macroblock from the source.
   */
  private disto16(candidate: Uint8Array): number {
    let d = 0;
    for (let n = 0; n < 16; n++) {
      d += distoFrom(this._srcSpectrum[n], candidate, yOffEnc + kScan[n]);
    }
    return d;
  }

  private static storeMaxDelta(dqm: VP8SegmentInfo, dcs: Int16Array): void {
    const d0 = dcs[1];
    const d1 = dcs[2];
    const d2 = dcs[4];
    const v0 = d0 < 0 ? -d0 : d0;
    const v1 = d1 < 0 ? -d1 : d1;
    const v2 = d2 < 0 ? -d2 : d2;
    let maxV = v1 > v0 ? v1 : v0;
    maxV = v2 > maxV ? v2 : maxV;
    if (maxV > dqm.maxEdge) {
      dqm.maxEdge = maxV;
    }
  }

  /**
   * The cost table for the current 4x4 block, given its neighbors' modes.
   */
  private getCostModeI4(modes: Uint8Array): number[] {
    const predsW = this.enc.predsW;
    const x = this.it.i4 & 3;
    const y = this.it.i4 >> 2;
    const left =
      x === 0
        ? this.enc.preds[this.it.predsPos + y * predsW - 1]
        : modes[this.it.i4 - 1];
    const top =
      y === 0
        ? this.enc.preds[this.it.predsPos - predsW + x]
        : modes[this.it.i4 - 4];
    return kFixedCostsI4[top][left];
  }

  /**
   * Tries coding the luma as sixteen 4x4 blocks. Returns true if that beats
   * the 16x16 coding already in {@link rd}.
   */
  private pickBestIntra4(rd: VP8ModeScore): boolean {
    const dqm = this.enc.quant.dqm[this.it.segment];
    const lambda = dqm.lambdaI4;
    const tlambda = dqm.tlambda;
    const src0 = yOffEnc;
    let totalHeaderBits = 0;
    const rdBest = this._rdBestI4;

    if (this.enc.maxI4HeaderBits === 0) {
      return false;
    }

    rdBest.init();
    // The cost of the bit that says "not 16x16".
    rdBest.h = 211;
    setRDScore(dqm.lambdaMode, rdBest);
    this.it.startI4();
    do {
      const src = src0 + kScan[this.it.i4];
      const modeCosts = this.getCostModeI4(rd.modesI4);
      let bestMode = -1;
      // The winner of each block is kept in yuv_out2, the candidate in a
      // scratch corner of the prediction area.
      let bestBlockBuf = this.it.yuvOut2;
      let bestBlock = yOffEnc + kScan[this.it.i4];
      let tmpBuf = this.it.yuvP;
      let tmpDst = i4TMP;

      this._rdI4.init();
      this.makeIntra4Preds();
      const srcSpectrum = tlambda !== 0 ? spectrum4x4(this.it.yuvIn, src) : 0;
      for (let mode = 0; mode < numBModes; mode++) {
        this._rdCandidate.nz =
          this.reconstructIntra4(
            this._tmpLevelsOut,
            0,
            src,
            tmpBuf,
            tmpDst,
            mode
          ) << this.it.i4;
        this._rdCandidate.d = getSSE4x4(this.it.yuvIn, src, tmpBuf, tmpDst);
        this._rdCandidate.sd =
          tlambda !== 0
            ? mult8b(tlambda, distoFrom(srcSpectrum, tmpBuf, tmpDst))
            : 0;
        this._rdCandidate.h = modeCosts[mode];
        // A complex mode that lands on a flat block is usually a
        // mis-prediction; make it pay for the privilege.
        this._rdCandidate.r =
          mode > 0 && isFlat(this._tmpLevelsOut, 0, 1, flatnessLimitI4)
            ? flatnessPenalty
            : 0;

        setRDScore(lambda, this._rdCandidate);
        if (bestMode >= 0 && this._rdCandidate.score >= this._rdI4.score) {
          continue;
        }

        this._rdCandidate.r += this.getCostLuma4(this._tmpLevelsOut);
        setRDScore(lambda, this._rdCandidate);

        if (bestMode < 0 || this._rdCandidate.score < this._rdI4.score) {
          this._rdI4.copyScore(this._rdCandidate);
          bestMode = mode;
          const swapBuf = tmpBuf;
          const swapOff = tmpDst;
          tmpBuf = bestBlockBuf;
          tmpDst = bestBlock;
          bestBlockBuf = swapBuf;
          bestBlock = swapOff;
          rdBest.yAcLevels.set(this._tmpLevelsOut, this.it.i4 * 16);
        }
      }
      setRDScore(dqm.lambdaMode, this._rdI4);
      rdBest.addScore(this._rdI4);
      if (rdBest.score >= rd.score) {
        return false;
      }
      totalHeaderBits += this._rdI4.h;
      if (totalHeaderBits > this.enc.maxI4HeaderBits) {
        return false;
      }
      // Move the winning block where the next one expects to predict from.
      if (
        bestBlockBuf !== this.it.yuvOut2 ||
        bestBlock !== yOffEnc + kScan[this.it.i4]
      ) {
        copy4x4(
          bestBlockBuf,
          bestBlock,
          this.it.yuvOut2,
          yOffEnc + kScan[this.it.i4]
        );
      }
      rd.modesI4[this.it.i4] = bestMode;
      const nz = this._rdI4.nz !== 0 ? 1 : 0;
      this.it.topNz[this.it.i4 & 3] = nz;
      this.it.leftNz[this.it.i4 >> 2] = nz;
    } while (this.it.rotateI4(this.it.yuvOut2, yOffEnc));

    rd.copyScore(rdBest);
    this.it.setIntra4Mode(rd.modesI4);
    this.it.swapOut();
    rd.yAcLevels.set(rdBest.yAcLevels, 0);
    return true;
  }

  /**
   * Levels of the 4x4 block being tried.
   */
  private readonly _tmpLevelsOut = new Int16Array(16);

  private pickBestUV(rd: VP8ModeScore): void {
    const dqm = this.enc.quant.dqm[this.it.segment];
    const lambda = dqm.lambdaUv;
    const src = uOffEnc;
    const rdBest = this._rdBestUv;
    let dstBuf = this.it.yuvOut;
    let tmpBuf = this.it.yuvOut2;

    rd.modeUv = -1;
    rdBest.init();
    for (let mode = 0; mode < numPredModes; mode++) {
      this._rdUv.nz = this.reconstructUV(this._rdUv, tmpBuf, mode);

      this._rdUv.d = getSSE(this.it.yuvIn, src, tmpBuf, src, 16, 8);
      // No spectral term here: on chroma it tends to flatten areas out.
      this._rdUv.sd = 0;
      this._rdUv.h = kFixedCostsUV[mode];
      this._rdUv.r = this.getCostUV(this._rdUv);
      if (mode > 0 && isFlat(this._rdUv.uvLevels, 0, 8, flatnessLimitUV)) {
        this._rdUv.r += flatnessPenalty * 8;
      }

      setRDScore(lambda, this._rdUv);
      if (mode === 0 || this._rdUv.score < rdBest.score) {
        rdBest.copyScore(this._rdUv);
        rd.modeUv = mode;
        rd.uvLevels.set(this._rdUv.uvLevels, 0);
        if (this.enc.topDerr !== undefined) {
          rd.derr.set(this._rdUv.derr, 0);
        }
        const tmp = dstBuf;
        dstBuf = tmpBuf;
        tmpBuf = tmp;
      }
    }
    this.it.setIntraUVMode(rd.modeUv);
    rd.addScore(rdBest);
    if (dstBuf !== this.it.yuvOut) {
      copy16x8(dstBuf, uOffEnc, this.it.yuvOut, uOffEnc);
    }
    if (this.enc.topDerr !== undefined) {
      this.storeDiffusionErrors(rd);
    }
  }

  /**
   * Recodes the macroblock with the modes already chosen, this time with the
   * trellis switched on.
   */
  private simpleQuantize(rd: VP8ModeScore): void {
    const isI16 = this.it.mbType === 1;
    let nz = 0;

    if (isI16) {
      nz = this.reconstructIntra16(
        rd,
        this.it.yuvOut,
        this.enc.preds[this.it.predsPos]
      );
    } else {
      this.it.startI4();
      do {
        const mode =
          this.enc.preds[
            this.it.predsPos +
              (this.it.i4 & 3) +
              (this.it.i4 >> 2) * this.enc.predsW
          ];
        const src = yOffEnc + kScan[this.it.i4];
        const dst = yOffEnc + kScan[this.it.i4];
        this.makeIntra4Preds();
        nz |=
          this.reconstructIntra4(
            rd.yAcLevels,
            this.it.i4 * 16,
            src,
            this.it.yuvOut,
            dst,
            mode
          ) << this.it.i4;
      } while (this.it.rotateI4(this.it.yuvOut, yOffEnc));
    }

    nz |= this.reconstructUV(rd, this.it.yuvOut, this.it.uvMode);
    rd.nz = nz;
  }

  /**
   * The cheap path: pick modes by distortion alone, with a fixed penalty
   * standing in for the rate.
   */
  private refineUsingDistortion(
    rd: VP8ModeScore,
    tryBothModes: boolean,
    refineUvMode: boolean
  ): void {
    let bestScore = maxCost;
    let nz = 0;
    let tryBoth = tryBothModes;
    let isI16 = tryBoth || this.it.mbType === 1;
    const dqm = this.enc.quant.dqm[this.it.segment];

    // Empirical exchange rates, of about the right order of magnitude.
    const lambdaDI16 = 106;
    const lambdaDI4 = 11;
    const lambdaDUv = 120;
    let scoreI4 = dqm.i4Penalty;
    let i4BitSum = 0;
    const bitLimit = tryBoth ? this.enc.mbHeaderLimit : maxCost;

    if (isI16) {
      let bestMode = -1;
      const src = yOffEnc;
      for (let mode = 0; mode < numPredModes; mode++) {
        const ref = kI16ModeOffsets[mode];
        const score =
          getSSE(this.it.yuvIn, src, this.it.yuvP, ref, 16, 16) * rdDistoMult +
          kFixedCostsI16[mode] * lambdaDI16;
        if (mode > 0 && kFixedCostsI16[mode] > bitLimit) {
          continue;
        }
        if (score < bestScore) {
          bestMode = mode;
          bestScore = score;
        }
      }
      if (this.it.x === 0 || this.it.y === 0) {
        // On the border a flat block can start a checkerboard that then
        // resonates across the picture; force the mode that cannot.
        if (isFlatSource16(this.it.yuvIn, src)) {
          bestMode = this.it.x === 0 ? 0 : 2;
          tryBoth = false;
        }
      }
      this.it.setIntra16Mode(bestMode);
    }

    if (tryBoth || !isI16) {
      isI16 = false;
      this.it.startI4();
      do {
        let bestI4Mode = -1;
        let bestI4Score = maxCost;
        const src = yOffEnc + kScan[this.it.i4];
        const modeCosts = this.getCostModeI4(rd.modesI4);

        this.makeIntra4Preds();
        for (let mode = 0; mode < numBModes; mode++) {
          const ref = kI4ModeOffsets[mode];
          const score =
            getSSE(this.it.yuvIn, src, this.it.yuvP, ref, 4, 4) * rdDistoMult +
            modeCosts[mode] * lambdaDI4;
          if (score < bestI4Score) {
            bestI4Mode = mode;
            bestI4Score = score;
          }
        }
        i4BitSum += modeCosts[bestI4Mode];
        rd.modesI4[this.it.i4] = bestI4Mode;
        scoreI4 += bestI4Score;
        if (scoreI4 >= bestScore || i4BitSum > bitLimit) {
          // Intra4 cannot win any more; stop and keep intra16.
          isI16 = true;
          break;
        }
        const tmpDst = yOffEnc + kScan[this.it.i4];
        nz |=
          this.reconstructIntra4(
            rd.yAcLevels,
            this.it.i4 * 16,
            src,
            this.it.yuvOut2,
            tmpDst,
            bestI4Mode
          ) << this.it.i4;
      } while (this.it.rotateI4(this.it.yuvOut2, yOffEnc));
    }

    if (!isI16) {
      this.it.setIntra4Mode(rd.modesI4);
      this.it.swapOut();
      bestScore = scoreI4;
    } else {
      nz = this.reconstructIntra16(
        rd,
        this.it.yuvOut,
        this.enc.preds[this.it.predsPos]
      );
    }

    if (refineUvMode) {
      let bestMode = -1;
      let bestUvScore = maxCost;
      const src = uOffEnc;
      for (let mode = 0; mode < numPredModes; mode++) {
        const ref = kUVModeOffsets[mode];
        const score =
          getSSE(this.it.yuvIn, src, this.it.yuvP, ref, 16, 8) * rdDistoMult +
          kFixedCostsUV[mode] * lambdaDUv;
        if (score < bestUvScore) {
          bestMode = mode;
          bestUvScore = score;
        }
      }
      this.it.setIntraUVMode(bestMode);
    }
    nz |= this.reconstructUV(rd, this.it.yuvOut, this.it.uvMode);

    rd.nz = nz;
    rd.score = bestScore;
  }
}
