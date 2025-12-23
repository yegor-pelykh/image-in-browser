/** @format */

import { VP8L } from './vp8l.js';
import { VP8LTransform } from './vp8l-transform.js';

/**
 * Internal operations for VP8L image decoding.
 */
export class VP8LInternal extends VP8L {
  /** Array of VP8LTransform objects used for image transformations. */
  public get transforms(): VP8LTransform[] {
    return this._transforms;
  }

  /** Pixel data buffer. */
  public get pixels(): Uint32Array | undefined {
    return this._pixels;
  }

  /** Opaque (alpha) channel data. */
  public get opaque(): Uint8Array | undefined {
    return this._opaque;
  }
  public set opaque(v: Uint8Array | undefined) {
    this._opaque = v;
  }

  /** Width of the IO buffer. */
  public get ioWidth(): number {
    return this._ioWidth;
  }
  public set ioWidth(v: number) {
    this._ioWidth = v;
  }

  /** Height of the IO buffer. */
  public get ioHeight(): number {
    return this._ioHeight;
  }
  public set ioHeight(v: number) {
    this._ioHeight = v;
  }

  /**
   * Decode image data using a processing function for each row.
   * @param data - Image data buffer.
   * @param width - Image width.
   * @param height - Image height.
   * @param lastRow - Last row index to process.
   * @param processFunc - Function to process each row.
   * @returns True if decoding succeeds.
   */
  public decodeImageData(
    data: Uint32Array,
    width: number,
    height: number,
    lastRow: number,
    processFunc: (_row: number, _waitForBiggestBatch: boolean) => void
  ): boolean {
    return super.decodeImageData(data, width, height, lastRow, processFunc);
  }

  /**
   * Decode the image stream to a pixel buffer.
   * @param xsize - Image width.
   * @param ysize - Image height.
   * @param isLevel0 - If true, decode at level 0.
   * @returns Decoded pixel buffer or undefined.
   */
  public decodeImageStream(
    xsize: number,
    ysize: number,
    isLevel0: boolean
  ): Uint32Array | undefined {
    return super.decodeImageStream(xsize, ysize, isLevel0);
  }

  /**
   * Allocate internal 32-bit buffers.
   * @param finalWidth - Final width for buffer allocation.
   * @returns True if allocation succeeds.
   */
  public allocateInternalBuffers32b(finalWidth: number): boolean {
    return super.allocateInternalBuffers32b(finalWidth);
  }

  /**
   * Allocate internal 8-bit buffers.
   * @returns True if allocation succeeds.
   */
  public allocateInternalBuffers8b(): boolean {
    return super.allocateInternalBuffers8b();
  }

  /**
   * Decode alpha (transparency) channel data.
   * @param width - Image width.
   * @param height - Image height.
   * @param lastRow - Last row index to process.
   * @returns True if decoding succeeds.
   */
  public decodeAlphaData(
    width: number,
    height: number,
    lastRow: number
  ): boolean {
    return super.decodeAlphaData(width, height, lastRow);
  }

  /**
   * Check if 8-bit optimization can be applied.
   * @returns True if optimization is possible.
   */
  public is8bOptimizable(): boolean {
    return super.is8bOptimizable();
  }

  /**
   * Extract alpha rows for processing.
   * @param row - Row index to extract.
   * @param waitForBiggestBatch - If true, wait for the largest batch.
   */
  public extractAlphaRows(row: number, waitForBiggestBatch: boolean): void {
    return super.extractAlphaRows(row, waitForBiggestBatch);
  }

  /**
   * Calculate subsampled size for given sampling bits.
   * @param size - Original size.
   * @param samplingBits - Number of sampling bits.
   * @returns Subsampled size.
   */
  public static subSampleSize(size: number, samplingBits: number): number {
    return VP8L.subSampleSize(size, samplingBits);
  }
}
