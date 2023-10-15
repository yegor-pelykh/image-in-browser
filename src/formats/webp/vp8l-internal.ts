/** @format */

import { VP8L } from './vp8l';
import { VP8LTransform } from './vp8l-transform';

export class VP8LInternal extends VP8L {
  public get transforms(): VP8LTransform[] {
    return this._transforms;
  }

  public get pixels(): Uint32Array | undefined {
    return this._pixels;
  }

  public get opaque(): Uint8Array | undefined {
    return this._opaque;
  }
  public set opaque(v: Uint8Array | undefined) {
    this._opaque = v;
  }

  public get ioWidth(): number | undefined {
    return this._ioWidth;
  }
  public set ioWidth(v: number | undefined) {
    this._ioWidth = v;
  }

  public get ioHeight(): number | undefined {
    return this._ioHeight;
  }
  public set ioHeight(v: number | undefined) {
    this._ioHeight = v;
  }

  public decodeImageData(
    data: Uint32Array,
    width: number,
    height: number,
    lastRow: number,
    processFunc: (_: number) => void
  ): boolean {
    return super.decodeImageData(data, width, height, lastRow, processFunc);
  }

  public decodeImageStream(
    xsize: number,
    ysize: number,
    isLevel0: boolean
  ): Uint32Array | undefined {
    return super.decodeImageStream(xsize, ysize, isLevel0);
  }

  public allocateInternalBuffers32b(): boolean {
    return super.allocateInternalBuffers32b();
  }

  public allocateInternalBuffers8b(): boolean {
    return super.allocateInternalBuffers8b();
  }

  public decodeAlphaData(
    width: number,
    height: number,
    lastRow: number
  ): boolean {
    return super.decodeAlphaData(width, height, lastRow);
  }

  public is8bOptimizable(): boolean {
    return super.is8bOptimizable();
  }

  public extractAlphaRows(row: number): void {
    return super.extractAlphaRows(row);
  }

  public static subSampleSize(size: number, samplingBits: number): number {
    return VP8L.subSampleSize(size, samplingBits);
  }
}
