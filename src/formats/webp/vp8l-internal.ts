/** @format */

import { VP8L } from './vp8l.js';
import { VP8LTransform } from './vp8l-transform.js';

/**
 * Class representing internal VP8L operations.
 */
export class VP8LInternal extends VP8L {
  /**
   * Gets the transforms.
   * @returns {VP8LTransform[]} The array of VP8LTransform objects.
   */
  public get transforms(): VP8LTransform[] {
    return this._transforms;
  }

  /**
   * Gets the pixels.
   * @returns {Uint32Array | undefined} The pixel data.
   */
  public get pixels(): Uint32Array | undefined {
    return this._pixels;
  }

  /**
   * Gets the opaque data.
   * @returns {Uint8Array | undefined} The opaque data.
   */
  public get opaque(): Uint8Array | undefined {
    return this._opaque;
  }

  /**
   * Sets the opaque data.
   * @param {Uint8Array | undefined} v - The opaque data.
   */
  public set opaque(v: Uint8Array | undefined) {
    this._opaque = v;
  }

  /**
   * Gets the IO width.
   * @returns {number | undefined} The IO width.
   */
  public get ioWidth(): number | undefined {
    return this._ioWidth;
  }

  /**
   * Sets the IO width.
   * @param {number | undefined} v - The IO width.
   */
  public set ioWidth(v: number | undefined) {
    this._ioWidth = v;
  }

  /**
   * Gets the IO height.
   * @returns {number | undefined} The IO height.
   */
  public get ioHeight(): number | undefined {
    return this._ioHeight;
  }

  /**
   * Sets the IO height.
   * @param {number | undefined} v - The IO height.
   */
  public set ioHeight(v: number | undefined) {
    this._ioHeight = v;
  }

  /**
   * Decodes image data.
   * @param {Uint32Array} data - The image data.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} lastRow - The last row of the image.
   * @param {(_: number) => void} processFunc - The function to process each pixel.
   * @returns {boolean} True if decoding was successful, otherwise false.
   */
  public decodeImageData(
    data: Uint32Array,
    width: number,
    height: number,
    lastRow: number,
    processFunc: (_: number) => void
  ): boolean {
    return super.decodeImageData(data, width, height, lastRow, processFunc);
  }

  /**
   * Decodes image stream.
   * @param {number} xsize - The width of the image.
   * @param {number} ysize - The height of the image.
   * @param {boolean} isLevel0 - Indicates if it is level 0.
   * @returns {Uint32Array | undefined} The decoded image stream.
   */
  public decodeImageStream(
    xsize: number,
    ysize: number,
    isLevel0: boolean
  ): Uint32Array | undefined {
    return super.decodeImageStream(xsize, ysize, isLevel0);
  }

  /**
   * Allocates internal buffers for 32-bit data.
   * @returns {boolean} True if allocation was successful, otherwise false.
   */
  public allocateInternalBuffers32b(): boolean {
    return super.allocateInternalBuffers32b();
  }

  /**
   * Allocates internal buffers for 8-bit data.
   * @returns {boolean} True if allocation was successful, otherwise false.
   */
  public allocateInternalBuffers8b(): boolean {
    return super.allocateInternalBuffers8b();
  }

  /**
   * Decodes alpha data.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} lastRow - The last row of the image.
   * @returns {boolean} True if decoding was successful, otherwise false.
   */
  public decodeAlphaData(
    width: number,
    height: number,
    lastRow: number
  ): boolean {
    return super.decodeAlphaData(width, height, lastRow);
  }

  /**
   * Checks if 8-bit optimization is possible.
   * @returns {boolean} True if 8-bit optimization is possible, otherwise false.
   */
  public is8bOptimizable(): boolean {
    return super.is8bOptimizable();
  }

  /**
   * Extracts alpha rows.
   * @param {number} row - The row to extract.
   */
  public extractAlphaRows(row: number): void {
    return super.extractAlphaRows(row);
  }

  /**
   * Calculates the subsample size.
   * @param {number} size - The original size.
   * @param {number} samplingBits - The number of sampling bits.
   * @returns {number} The subsample size.
   */
  public static subSampleSize(size: number, samplingBits: number): number {
    return VP8L.subSampleSize(size, samplingBits);
  }
}
