/** @format */

import { LibError } from '../../error/lib-error.js';
import { MemoryImage } from '../../image/image.js';
import { encodeAlphaChunk } from './vp8-alpha.js';
import { VP8Lossy } from './vp8-lossy.js';
import { VP8BoolEncoder } from './vp8-bool-encoder.js';
import { VP8Config } from './vp8-config.js';
import { bitCost } from './vp8-enc-proba.js';
import { VP8EncIterator } from './vp8-iterator.js';
import { VP8Decimate, VP8ModeScore } from './vp8-rd.js';
import {
  VP8Residual,
  recordCoeffTokens,
  typeChroma,
  typeI16AC,
  typeI16DC,
  typeI4AC,
} from './vp8-residual.js';
import { analyzeSegments } from './vp8-segments.js';
import { VP8EncState } from './vp8-state.js';
import {
  bDcPred,
  bHePred,
  bHdPred,
  bLdPred,
  bRdPred,
  bTmPred,
  bVePred,
  bVlPred,
  dcPred,
  hPred,
  kBModesProba,
  tmPred,
  vPred,
} from './vp8-tables.js';
import { VP8TokenBuffer } from './vp8-tokens.js';
import { VP8Yuv, cleanupTransparentArea, importYuv } from './vp8-yuv.js';
import { maxDimension } from './vp8l-encoder.js';

/**
 * Partition #0 carries the header and every macroblock's modes, and the
 * format gives its length nineteen bits.
 */
const _maxPartition0Size = 1 << 19;

/**
 * A rough number of bytes each macroblock takes, indexed by the quantizer
 * divided by sixteen. Only used to size the output buffer up front.
 */
const _averageBytesPerMb = [50, 24, 16, 9, 7, 5, 3, 2];

/**
 * How many macroblocks may pass before the probabilities are refreshed.
 *
 * The rate-distortion decisions are only as good as the cost tables they are
 * made against, so the tables are recomputed from the statistics collected so
 * far, roughly eight times per picture.
 */
const _minRefreshCount = 96;

export { VP8Lossy };

/**
 * Encodes [image] as a VP8 keyframe.
 */
export function encodeVP8(image: MemoryImage, config: VP8Config): VP8Lossy {
  if (
    image.width <= 0 ||
    image.height <= 0 ||
    image.width > maxDimension ||
    image.height > maxDimension
  ) {
    // The frame header has fourteen bits for each dimension; letting one
    // overflow into the next field would produce a stream no decoder can read.
    throw new LibError(
      'WebP images must be between 1x1 and ' +
        `${maxDimension}x${maxDimension}, got ${image.width}x${image.height}`
    );
  }
  const yuv = importYuv(image);
  if (!config.exact) {
    cleanupTransparentArea(yuv);
  }
  const alphaPlane = yuv.a;
  const alpha =
    alphaPlane === undefined
      ? undefined
      : encodeAlphaChunk(
          alphaPlane,
          yuv.width,
          yuv.height,
          config.alphaFiltering,
          config.alphaCompression,
          config.alphaQuality
        );
  return new VP8Lossy(new VP8Encoder(config, yuv).encode(), alpha);
}

export class VP8Encoder {
  public readonly config: VP8Config;
  public readonly enc: VP8EncState;

  private readonly _tokens = new VP8TokenBuffer();
  private readonly _res = new VP8Residual();

  constructor(config: VP8Config, pic: VP8Yuv) {
    this.config = config;
    this.enc = new VP8EncState(config, pic);
  }

  /**
   * Codes the picture and returns the VP8 bitstream.
   */
  public encode(): Uint8Array {
    analyzeSegments(this.enc);
    const tokenPartition = this._codeMacroblocks();
    return this._assemble(tokenPartition);
  }

  /**
   * Runs the mode search over every macroblock, recording the coding of each
   * as tokens rather than writing it out.
   *
   * Nothing can be written until the whole picture has been seen, because the
   * probabilities the coefficients are written with are derived from what the
   * picture turned out to contain.
   */
  private _codeMacroblocks(): Uint8Array {
    this._setLoopParams(this.config.quality);

    const it = new VP8EncIterator(this.enc);
    const decimate = new VP8Decimate(this.enc, it);
    const rd = new VP8ModeScore();
    const rdOpt = this.config.rdOptLevel;

    let maxCount = (this.enc.mbW * this.enc.mbH) >> 3;
    if (maxCount < _minRefreshCount) {
      maxCount = _minRefreshCount;
    }
    let count = maxCount;

    this.enc.proba.resetTokenStats();
    this._tokens.clear();

    do {
      it.import();
      if (--count < 0) {
        this.enc.proba.finalizeTokenProbas();
        this.enc.proba.calculateLevelCosts();
        count = maxCount;
      }
      decimate.run(rd, rdOpt);
      this._recordTokens(it, rd);
      it.saveBoundary();
    } while (it.next());

    this.enc.proba.finalizeTokenProbas();

    const bytesPerMb = _averageBytesPerMb[this.enc.quant.baseQuant >> 4];
    const bw = new VP8BoolEncoder(this.enc.mbW * this.enc.mbH * bytesPerMb);
    this._tokens.emit(bw, this.enc.proba.coeffs);
    return bw.finish();
  }

  private _setLoopParams(quality: number): void {
    const q = quality < 0 ? 0.0 : quality > 100 ? 100.0 : quality;
    this.enc.quant.setSegmentParams(
      this.config,
      q,
      this.enc.alpha,
      this.enc.uvAlpha,
      this.enc.mbSegment
    );
    this._setSegmentProbas();
    this.enc.proba.calculateLevelCosts();
    this.enc.proba.nbSkip = 0;
  }

  /**
   * Derives the probabilities of the segment tree from how many macroblocks
   * ended up in each segment.
   */
  private _setSegmentProbas(): void {
    const p = new Int32Array(4);
    const mbs = this.enc.mbW * this.enc.mbH;
    for (let n = 0; n < mbs; n++) {
      p[this.enc.mbSegment[n]]++;
    }
    if (this.enc.numSegments > 1) {
      const probas = this.enc.proba.segments;
      probas[0] = VP8Encoder._getProba(p[0] + p[1], p[2] + p[3]);
      probas[1] = VP8Encoder._getProba(p[0], p[1]);
      probas[2] = VP8Encoder._getProba(p[2], p[3]);
      this.enc.updateMap =
        probas[0] !== 255 || probas[1] !== 255 || probas[2] !== 255;
      if (!this.enc.updateMap) {
        // Every macroblock would be coded as segment 0 anyway.
        this.enc.mbSegment.fill(0, 0, mbs);
      }
      this.enc.segmentSize =
        p[0] * (bitCost(0, probas[0]) + bitCost(0, probas[1])) +
        p[1] * (bitCost(0, probas[0]) + bitCost(1, probas[1])) +
        p[2] * (bitCost(1, probas[0]) + bitCost(0, probas[2])) +
        p[3] * (bitCost(1, probas[0]) + bitCost(1, probas[2]));
    } else {
      this.enc.updateMap = false;
      this.enc.segmentSize = 0;
    }
  }

  private static _getProba(a: number, b: number): number {
    const total = a + b;
    return total === 0
      ? 255
      : Math.trunc((255 * a + Math.trunc(total / 2)) / total);
  }

  /**
   * Records the coefficients of one macroblock into the token buffer.
   */
  private _recordTokens(it: VP8EncIterator, rd: VP8ModeScore): void {
    const proba = this.enc.proba;
    it.nzToBytes();

    if (it.mbType === 1) {
      // The DC of an intra 16x16 macroblock is coded through its own block.
      const ctx = it.topNz[8] + it.leftNz[8];
      this._res.init(0, typeI16DC);
      this._res.setCoeffs(rd.yDcLevels, 0);
      const nz = recordCoeffTokens(proba, this._res, ctx, this._tokens);
      it.topNz[8] = nz;
      it.leftNz[8] = nz;
      this._res.init(1, typeI16AC);
    } else {
      this._res.init(0, typeI4AC);
    }

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const ctx = it.topNz[x] + it.leftNz[y];
        this._res.setCoeffs(rd.yAcLevels, (x + y * 4) * 16);
        const nz = recordCoeffTokens(proba, this._res, ctx, this._tokens);
        it.topNz[x] = nz;
        it.leftNz[y] = nz;
      }
    }

    this._res.init(0, typeChroma);
    for (let ch = 0; ch <= 2; ch += 2) {
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const ctx = it.topNz[4 + ch + x] + it.leftNz[4 + ch + y];
          this._res.setCoeffs(rd.uvLevels, (ch * 2 + x + y * 2) * 16);
          const nz = recordCoeffTokens(proba, this._res, ctx, this._tokens);
          it.topNz[4 + ch + x] = nz;
          it.leftNz[4 + ch + y] = nz;
        }
      }
    }
    it.bytesToNz();
  }

  //----------------------------------------------------------------------------
  // Bitstream assembly.

  private _assemble(tokenPartition: Uint8Array): Uint8Array {
    const part0 = this._generatePartition0();
    if (part0.length >= _maxPartition0Size) {
      throw new LibError('VP8 partition #0 overflow');
    }

    const out = new Uint8Array(10 + part0.length + tokenPartition.length);
    // Paragraph 9.1: a keyframe (bit 0 clear), its profile, that it is shown,
    // and how long partition #0 is.
    const bits = (this.enc.profile << 1) | (1 << 4) | (part0.length << 5);
    out[0] = bits & 0xff;
    out[1] = (bits >> 8) & 0xff;
    out[2] = (bits >> 16) & 0xff;
    // The start code, then the dimensions with a scale of 1:1.
    out[3] = 0x9d;
    out[4] = 0x01;
    out[5] = 0x2a;
    out[6] = this.enc.pic.width & 0xff;
    out[7] = (this.enc.pic.width >> 8) & 0x3f;
    out[8] = this.enc.pic.height & 0xff;
    out[9] = (this.enc.pic.height >> 8) & 0x3f;
    out.set(part0, 10);
    out.set(tokenPartition, 10 + part0.length);
    return out;
  }

  private _generatePartition0(): Uint8Array {
    const bw = new VP8BoolEncoder(
      Math.trunc((this.enc.mbW * this.enc.mbH * 7) / 8)
    );
    // Colour space and clamping type, both zero.
    bw.putBitUniform(0);
    bw.putBitUniform(0);
    this._putSegmentHeader(bw);
    this._putFilterHeader(bw);
    // One token partition.
    bw.putBits(0, 2);
    this._putQuant(bw);
    // The probabilities are not carried to a next frame.
    bw.putBitUniform(0);
    this.enc.proba.write(bw);
    this._codeIntraModes(bw);
    return bw.finish();
  }

  private _putSegmentHeader(bw: VP8BoolEncoder): void {
    const quant = this.enc.quant;
    if (bw.putBitUniform(this.enc.numSegments > 1 ? 1 : 0) === 0) {
      return;
    }
    bw.putBitUniform(this.enc.updateMap ? 1 : 0);
    // The quantizer and filter values follow, as absolute values rather than
    // deltas.
    bw.putBitUniform(1);
    bw.putBitUniform(1);
    for (let s = 0; s < 4; s++) {
      bw.putSignedBits(quant.dqm[s].quant, 7);
    }
    for (let s = 0; s < 4; s++) {
      bw.putSignedBits(quant.dqm[s].fstrength, 6);
    }
    if (this.enc.updateMap) {
      for (let s = 0; s < 3; s++) {
        const proba = this.enc.proba.segments[s];
        if (bw.putBitUniform(proba !== 255 ? 1 : 0) !== 0) {
          bw.putBits(proba, 8);
        }
      }
    }
  }

  private _putFilterHeader(bw: VP8BoolEncoder): void {
    const quant = this.enc.quant;
    bw.putBitUniform(quant.filterSimple ? 1 : 0);
    bw.putBits(quant.filterLevel, 6);
    bw.putBits(quant.filterSharpness, 3);
    // No per-mode filter deltas: the encoder never runs the filter itself,
    // so it has nothing to say about them.
    bw.putBitUniform(0);
  }

  private _putQuant(bw: VP8BoolEncoder): void {
    const quant = this.enc.quant;
    bw.putBits(quant.baseQuant, 7);
    bw.putSignedBits(quant.dqY1Dc, 4);
    bw.putSignedBits(quant.dqY2Dc, 4);
    bw.putSignedBits(quant.dqY2Ac, 4);
    bw.putSignedBits(quant.dqUvDc, 4);
    bw.putSignedBits(quant.dqUvAc, 4);
  }

  /**
   * Writes the segment, skip flag and intra modes of every macroblock.
   */
  private _codeIntraModes(bw: VP8BoolEncoder): void {
    const it = new VP8EncIterator(this.enc);
    const preds = this.enc.preds;
    const predsW = this.enc.predsW;
    do {
      if (this.enc.updateMap) {
        VP8Encoder._putSegment(
          bw,
          this.enc.mbSegment[it.mbPos],
          this.enc.proba.segments
        );
      }
      if (this.enc.proba.useSkipProba) {
        bw.putBit(this.enc.mbSkip[it.mbPos], this.enc.proba.skipProba);
      }
      if (bw.putBit(it.mbType !== 0 ? 1 : 0, 145) !== 0) {
        VP8Encoder._putI16Mode(bw, preds[it.predsPos]);
      } else {
        let p = it.predsPos;
        let topPred = p - predsW;
        for (let y = 0; y < 4; y++) {
          let left = preds[p - 1];
          for (let x = 0; x < 4; x++) {
            left = VP8Encoder._putI4Mode(
              bw,
              preds[p + x],
              kBModesProba[preds[topPred + x]][left]
            );
          }
          topPred = p;
          p += predsW;
        }
      }
      VP8Encoder._putUVMode(bw, it.uvMode);
    } while (it.next());
  }

  private static _putSegment(
    bw: VP8BoolEncoder,
    s: number,
    p: Uint8Array
  ): void {
    if (bw.putBit(s >= 2 ? 1 : 0, p[0]) !== 0) {
      bw.putBit(s & 1, p[2]);
    } else {
      bw.putBit(s & 1, p[1]);
    }
  }

  private static _putI16Mode(bw: VP8BoolEncoder, mode: number): void {
    if (bw.putBit(mode === tmPred || mode === hPred ? 1 : 0, 156) !== 0) {
      // True motion or horizontal.
      bw.putBit(mode === tmPred ? 1 : 0, 128);
    } else {
      // Vertical or DC.
      bw.putBit(mode === vPred ? 1 : 0, 163);
    }
  }

  private static _putUVMode(bw: VP8BoolEncoder, mode: number): void {
    if (bw.putBit(mode !== dcPred ? 1 : 0, 142) !== 0) {
      if (bw.putBit(mode !== vPred ? 1 : 0, 114) !== 0) {
        // Otherwise true motion.
        bw.putBit(mode !== hPred ? 1 : 0, 183);
      }
    }
  }

  /**
   * Codes one 4x4 mode through the tree of RFC 6386 11.4, and returns it so
   * it can serve as the left context of the next block.
   */
  private static _putI4Mode(
    bw: VP8BoolEncoder,
    mode: number,
    prob: number[]
  ): number {
    if (bw.putBit(mode !== bDcPred ? 1 : 0, prob[0]) !== 0) {
      if (bw.putBit(mode !== bTmPred ? 1 : 0, prob[1]) !== 0) {
        if (bw.putBit(mode !== bVePred ? 1 : 0, prob[2]) !== 0) {
          if (bw.putBit(mode >= bLdPred ? 1 : 0, prob[3]) === 0) {
            if (bw.putBit(mode !== bHePred ? 1 : 0, prob[4]) !== 0) {
              bw.putBit(mode !== bRdPred ? 1 : 0, prob[5]);
            }
          } else {
            if (bw.putBit(mode !== bLdPred ? 1 : 0, prob[6]) !== 0) {
              if (bw.putBit(mode !== bVlPred ? 1 : 0, prob[7]) !== 0) {
                bw.putBit(mode !== bHdPred ? 1 : 0, prob[8]);
              }
            }
          }
        }
      }
    }
    return mode;
  }
}
