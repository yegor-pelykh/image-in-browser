/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { VP8EncState } from './vp8-state.js';
import {
  kBps,
  kScan,
  yuvSizeEnc,
  predSizeEnc,
  yOffEnc,
  uOffEnc,
  vOffEnc,
} from './vp8-tables.js';

/**
 * Where the top sample of each 4x4 block sits inside the boundary array.
 */
const topLeftI4 = [17, 21, 25, 29, 13, 17, 21, 25, 9, 13, 17, 21, 5, 9, 13, 17];

/**
 * The current macroblock, its neighbours, and the scratch buffers the search
 * works in.
 */
export class VP8EncIterator {
  public readonly enc: VP8EncState;

  /**
   * Position of the current macroblock.
   */
  public x: number = 0;
  public y: number = 0;

  /**
   * Source samples of the current macroblock.
   */
  public readonly yuvIn: Uint8Array = new Uint8Array(yuvSizeEnc);

  /**
   * Reconstructed samples. Swapped with {@link yuvOut2} as better modes are found.
   */
  public yuvOut: Uint8Array = new Uint8Array(yuvSizeEnc);
  public yuvOut2: Uint8Array = new Uint8Array(yuvSizeEnc);

  /**
   * Every candidate prediction, built once per macroblock.
   */
  public readonly yuvP: Uint8Array = new Uint8Array(predSizeEnc);

  /**
   * Index of the current macroblock in the per-macroblock arrays.
   */
  public mbPos: number = 0;

  /**
   * Index of the current macroblock's first 4x4 mode in `enc.preds`.
   */
  public predsPos: number = 0;

  /**
   * Index of the current macroblock's entry in `enc.nz`.
   */
  public nzPos: number = 1;

  /**
   * Index of the current macroblock's top samples.
   */
  public yTopPos: number = 0;
  public uvTopPos: number = 0;

  /**
   * Whether the top samples come from a scratch buffer rather than from the
   * running reconstruction. The analysis pass works on the source instead.
   */
  public yTop: Uint8Array;
  public uvTop: Uint8Array;

  /**
   * Left samples, addressable from index -1 through the offsets below.
   */
  public readonly yLeft: Uint8Array = new Uint8Array(17);
  public readonly uvLeft: Uint8Array = new Uint8Array(32);

  public static readonly yLeftOff = 1;
  public static readonly uLeftOff = 1;
  public static readonly vLeftOff = 17;

  /**
   * Scratch used when the boundary must come from the source picture.
   */
  public readonly boundaryScratch: Uint8Array = new Uint8Array(32);

  /**
   * The 4x4 boundary samples, in the snaking order {@link topLeftI4} indexes.
   */
  public readonly i4Boundary: Uint8Array = new Uint8Array(40);

  /**
   * Index in {@link i4Boundary} of the current 4x4 block's top samples.
   */
  public i4Top: number = 0;

  /**
   * Which 4x4 block the intra-4 search is on.
   */
  public i4: number = 0;

  /**
   * Non-zero flags of the blocks above and to the left, one per 4x4 column
   * and row, plus the luma DC block at index 8.
   */
  public readonly topNz: Int32Array = new Int32Array(9);
  public readonly leftNz: Int32Array = new Int32Array(9);

  /**
   * Whether the coefficient trellis is in use for this macroblock.
   */
  public doTrellis: boolean = false;

  public countDown: number = 0;

  /**
   * Chroma DC error carried in from the block to the left, two values per
   * channel. Reset at the start of every macroblock row.
   */
  public readonly leftDerr: Int8Array = new Int8Array(4);

  constructor(enc: VP8EncState) {
    this.enc = enc;
    this.yTop = enc.yTop;
    this.uvTop = enc.uvTop;
    this.reset();
  }

  public reset(): void {
    this.yTop = this.enc.yTop;
    this.uvTop = this.enc.uvTop;
    this.setRow(0);
    this.countDown = this.enc.mbW * this.enc.mbH;
    // The picture's top border acts as a row of mid-grey samples.
    this.enc.yTop.fill(127);
    this.enc.uvTop.fill(127);
    this.enc.nz.fill(0);
    this.enc.topDerr?.fill(0);
    this.doTrellis = false;
  }

  public setRow(row: number): void {
    this.x = 0;
    this.y = row;
    this.predsPos = this.enc.predsOrigin + row * 4 * this.enc.predsW;
    this.nzPos = 1;
    this.mbPos = row * this.enc.mbW;
    this.yTop = this.enc.yTop;
    this.uvTop = this.enc.uvTop;
    this.yTopPos = 0;
    this.uvTopPos = 0;
    this.initLeft();
  }

  public setCountDown(count: number): void {
    this.countDown = count;
  }

  public get isDone(): boolean {
    return this.countDown <= 0;
  }

  private initLeft(): void {
    // Left of the first column: the standard's fixed values.
    const v = this.y > 0 ? 129 : 127;
    this.yLeft[0] = v;
    this.uvLeft[VP8EncIterator.uLeftOff - 1] = v;
    this.uvLeft[VP8EncIterator.vLeftOff - 1] = v;
    this.yLeft.fill(129, VP8EncIterator.yLeftOff, VP8EncIterator.yLeftOff + 16);
    this.uvLeft.fill(129, VP8EncIterator.uLeftOff, VP8EncIterator.uLeftOff + 8);
    this.uvLeft.fill(129, VP8EncIterator.vLeftOff, VP8EncIterator.vLeftOff + 8);
    this.leftNz[8] = 0;
    if (this.enc.topDerr !== undefined) {
      this.leftDerr.fill(0);
    }
  }

  /**
   * Copies the current macroblock out of the picture, replicating the edge
   * where the macroblock hangs over the right or bottom border.
   */
  public import(sourceBoundary: boolean = false): void {
    const pic = this.enc.pic;
    const yStride = pic.width;
    const uvStride = pic.uvWidth;
    const ySrc = (this.y * yStride + this.x) * 16;
    const uvSrc = (this.y * uvStride + this.x) * 8;
    const w = min(pic.width - this.x * 16, 16);
    const h = min(pic.height - this.y * 16, 16);
    const uvW = (w + 1) >> 1;
    const uvH = (h + 1) >> 1;

    VP8EncIterator.importBlock(
      pic.y,
      ySrc,
      yStride,
      this.yuvIn,
      yOffEnc,
      w,
      h,
      16
    );
    VP8EncIterator.importBlock(
      pic.u,
      uvSrc,
      uvStride,
      this.yuvIn,
      uOffEnc,
      uvW,
      uvH,
      8
    );
    VP8EncIterator.importBlock(
      pic.v,
      uvSrc,
      uvStride,
      this.yuvIn,
      vOffEnc,
      uvW,
      uvH,
      8
    );

    if (!sourceBoundary) {
      return;
    }

    if (this.x === 0) {
      this.initLeft();
    } else {
      if (this.y === 0) {
        this.yLeft[0] = 127;
        this.uvLeft[VP8EncIterator.uLeftOff - 1] = 127;
        this.uvLeft[VP8EncIterator.vLeftOff - 1] = 127;
      } else {
        this.yLeft[0] = pic.y[ySrc - 1 - yStride];
        this.uvLeft[VP8EncIterator.uLeftOff - 1] = pic.u[uvSrc - 1 - uvStride];
        this.uvLeft[VP8EncIterator.vLeftOff - 1] = pic.v[uvSrc - 1 - uvStride];
      }
      VP8EncIterator.importLine(
        pic.y,
        ySrc - 1,
        yStride,
        this.yLeft,
        VP8EncIterator.yLeftOff,
        h,
        16
      );
      VP8EncIterator.importLine(
        pic.u,
        uvSrc - 1,
        uvStride,
        this.uvLeft,
        VP8EncIterator.uLeftOff,
        uvH,
        8
      );
      VP8EncIterator.importLine(
        pic.v,
        uvSrc - 1,
        uvStride,
        this.uvLeft,
        VP8EncIterator.vLeftOff,
        uvH,
        8
      );
    }

    this.yTop = this.boundaryScratch;
    this.uvTop = this.boundaryScratch;
    this.yTopPos = 0;
    this.uvTopPos = 16;
    if (this.y === 0) {
      this.boundaryScratch.fill(127, 0, 32);
    } else {
      VP8EncIterator.importLine(
        pic.y,
        ySrc - yStride,
        1,
        this.boundaryScratch,
        0,
        w,
        16
      );
      VP8EncIterator.importLine(
        pic.u,
        uvSrc - uvStride,
        1,
        this.boundaryScratch,
        16,
        uvW,
        8
      );
      VP8EncIterator.importLine(
        pic.v,
        uvSrc - uvStride,
        1,
        this.boundaryScratch,
        24,
        uvW,
        8
      );
    }
  }

  private static importBlock(
    src: Uint8Array,
    srcOff: number,
    srcStride: number,
    dst: Uint8Array,
    dstOff: number,
    w: number,
    h: number,
    size: number
  ): void {
    let so = srcOff;
    let doff = dstOff;
    for (let i = 0; i < h; i++) {
      ArrayUtils.copyRange(src, so, dst, doff, w);
      if (w < size) {
        const last = dst[doff + w - 1];
        for (let j = w; j < size; j++) {
          dst[doff + j] = last;
        }
      }
      doff += kBps;
      so += srcStride;
    }
    for (let i = h; i < size; i++) {
      ArrayUtils.copyRange(dst, doff - kBps, dst, doff, size);
      doff += kBps;
    }
  }

  private static importLine(
    src: Uint8Array,
    srcOff: number,
    srcStride: number,
    dst: Uint8Array,
    dstOff: number,
    len: number,
    totalLen: number
  ): void {
    let i = 0;
    let so = srcOff;
    for (; i < len; i++, so += srcStride) {
      dst[dstOff + i] = src[so];
    }
    const last = dst[dstOff + len - 1];
    for (; i < totalLen; i++) {
      dst[dstOff + i] = last;
    }
  }

  /**
   * Keeps the reconstructed edges of this macroblock for its neighbours.
   */
  public saveBoundary(): void {
    const ySrc = yOffEnc;
    const uvSrc = uOffEnc;
    if (this.x < this.enc.mbW - 1) {
      for (let i = 0; i < 16; i++) {
        this.yLeft[VP8EncIterator.yLeftOff + i] =
          this.yuvOut[ySrc + 15 + i * kBps];
      }
      for (let i = 0; i < 8; i++) {
        this.uvLeft[VP8EncIterator.uLeftOff + i] =
          this.yuvOut[uvSrc + 7 + i * kBps];
        this.uvLeft[VP8EncIterator.vLeftOff + i] =
          this.yuvOut[uvSrc + 15 + i * kBps];
      }
      // The top-left corner has to be taken before 'top' is overwritten.
      this.yLeft[0] = this.yTop[this.yTopPos + 15];
      this.uvLeft[VP8EncIterator.uLeftOff - 1] = this.uvTop[this.uvTopPos + 7];
      this.uvLeft[VP8EncIterator.vLeftOff - 1] =
        this.uvTop[this.uvTopPos + 8 + 7];
    }
    if (this.y < this.enc.mbH - 1) {
      ArrayUtils.copyRange(
        this.yuvOut,
        ySrc + 15 * kBps,
        this.yTop,
        this.yTopPos,
        16
      );
      ArrayUtils.copyRange(
        this.yuvOut,
        uvSrc + 7 * kBps,
        this.uvTop,
        this.uvTopPos,
        16
      );
    }
  }

  /**
   * Advances to the next macroblock. Returns false when the picture is done.
   */
  public next(): boolean {
    if (++this.x === this.enc.mbW) {
      this.setRow(++this.y);
    } else {
      this.predsPos += 4;
      this.mbPos += 1;
      this.nzPos += 1;
      this.yTopPos += 16;
      this.uvTopPos += 16;
    }
    return --this.countDown > 0;
  }

  //----------------------------------------------------------------------------
  // Non-zero context.

  /**
   * Unpacks the neighbouring patterns into {@link topNz} and {@link leftNz}.
   */
  public nzToBytes(): void {
    const tnz = this.enc.nz[this.nzPos];
    const lnz = this.enc.nz[this.nzPos - 1];
    this.topNz[0] = (tnz >> 12) & 1;
    this.topNz[1] = (tnz >> 13) & 1;
    this.topNz[2] = (tnz >> 14) & 1;
    this.topNz[3] = (tnz >> 15) & 1;
    this.topNz[4] = (tnz >> 18) & 1;
    this.topNz[5] = (tnz >> 19) & 1;
    this.topNz[6] = (tnz >> 22) & 1;
    this.topNz[7] = (tnz >> 23) & 1;
    this.topNz[8] = (tnz >> 24) & 1;

    this.leftNz[0] = (lnz >> 3) & 1;
    this.leftNz[1] = (lnz >> 7) & 1;
    this.leftNz[2] = (lnz >> 11) & 1;
    this.leftNz[3] = (lnz >> 15) & 1;
    this.leftNz[4] = (lnz >> 17) & 1;
    this.leftNz[5] = (lnz >> 19) & 1;
    this.leftNz[6] = (lnz >> 21) & 1;
    this.leftNz[7] = (lnz >> 23) & 1;
    // The left DC flag lives in leftNz[8] and is carried separately.
  }

  /**
   * Packs {@link topNz} and {@link leftNz} back into this macroblock's pattern.
   */
  public bytesToNz(): void {
    let nz = 0;
    nz |= (this.topNz[0] << 12) | (this.topNz[1] << 13);
    nz |= (this.topNz[2] << 14) | (this.topNz[3] << 15);
    nz |= (this.topNz[4] << 18) | (this.topNz[5] << 19);
    nz |= (this.topNz[6] << 22) | (this.topNz[7] << 23);
    // The DC flag is propagated downwards, which is what intra 4x4 needs.
    nz |= this.topNz[8] << 24;
    nz |= (this.leftNz[0] << 3) | (this.leftNz[1] << 7);
    nz |= this.leftNz[2] << 11;
    nz |= (this.leftNz[4] << 17) | (this.leftNz[6] << 21);
    this.enc.nz[this.nzPos] = nz;
  }

  //----------------------------------------------------------------------------
  // Mode bookkeeping.

  public setIntra16Mode(mode: number): void {
    let p = this.predsPos;
    for (let yy = 0; yy < 4; yy++) {
      this.enc.preds.fill(mode, p, p + 4);
      p += this.enc.predsW;
    }
    this.enc.mbType[this.mbPos] = 1;
  }

  public setIntra4Mode(modes: Uint8Array): void {
    let p = this.predsPos;
    for (let yy = 0; yy < 4; yy++) {
      ArrayUtils.copyRange(modes, 4 * yy, this.enc.preds, p, 4);
      p += this.enc.predsW;
    }
    this.enc.mbType[this.mbPos] = 0;
  }

  public setIntraUVMode(mode: number): void {
    this.enc.mbUvMode[this.mbPos] = mode;
  }

  public setSkip(skip: boolean): void {
    this.enc.mbSkip[this.mbPos] = skip ? 1 : 0;
  }

  public setSegment(segment: number): void {
    this.enc.mbSegment[this.mbPos] = segment;
  }

  public get segment(): number {
    return this.enc.mbSegment[this.mbPos];
  }

  public get mbType(): number {
    return this.enc.mbType[this.mbPos];
  }

  public get uvMode(): number {
    return this.enc.mbUvMode[this.mbPos];
  }

  /**
   * Exchanges the reconstruction buffer with the scratch one.
   */
  public swapOut(): void {
    const tmp = this.yuvOut;
    this.yuvOut = this.yuvOut2;
    this.yuvOut2 = tmp;
  }

  //----------------------------------------------------------------------------
  // Intra 4x4 iteration.

  public startI4(): void {
    this.i4 = 0;
    this.i4Top = topLeftI4[0];
    for (let i = 0; i < 17; i++) {
      this.i4Boundary[i] = this.yLeft[16 - i];
    }
    for (let i = 0; i < 16; i++) {
      this.i4Boundary[17 + i] = this.yTop[this.yTopPos + i];
    }
    if (this.x < this.enc.mbW - 1) {
      for (let i = 16; i < 16 + 4; i++) {
        this.i4Boundary[17 + i] = this.yTop[this.yTopPos + i];
      }
    } else {
      // At the right edge there is nothing above-right, so repeat the last valid sample.
      for (let i = 16; i < 16 + 4; i++) {
        this.i4Boundary[17 + i] = this.i4Boundary[17 + 15];
      }
    }
    this.nzToBytes();
  }

  /**
   * Folds the block just reconstructed into the boundary and moves on.
   *
   * Returns false once all sixteen blocks are done.
   */
  public rotateI4(yuvOut: Uint8Array, outOff: number): boolean {
    const blk = outOff + kScan[this.i4];
    const top = this.i4Top;
    for (let i = 0; i <= 3; i++) {
      this.i4Boundary[top - 4 + i] = yuvOut[blk + i + 3 * kBps];
    }
    if ((this.i4 & 3) !== 3) {
      for (let i = 0; i <= 2; i++) {
        this.i4Boundary[top + i] = yuvOut[blk + 3 + (2 - i) * kBps];
      }
    } else {
      // On the right-hand blocks the samples above-right are not available.
      for (let i = 0; i <= 3; i++) {
        this.i4Boundary[top + i] = this.i4Boundary[top + i + 4];
      }
    }
    if (++this.i4 === 16) {
      return false;
    }
    this.i4Top = topLeftI4[this.i4];
    return true;
  }
}

function min(a: number, b: number): number {
  return a < b ? a : b;
}
