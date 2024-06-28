/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { VP8LImageTransformType } from './vp8l-image-transform-type.js';
import { VP8LInternal } from './vp8l-internal.js';
import { WebPFilters } from './webp-filters.js';
import { WebPInfo } from './webp-info.js';

/**
 * Class representing WebPAlpha.
 */
export class WebPAlpha {
  /**
   * Input buffer for the alpha data.
   */
  private _input: InputBuffer<Uint8Array>;

  /**
   * Gets the input buffer.
   * @returns {InputBuffer<Uint8Array>} The input buffer.
   */
  public get input(): InputBuffer<Uint8Array> {
    return this._input;
  }

  /**
   * Width of the image.
   */
  private _width: number = 0;

  /**
   * Gets the width of the image.
   * @returns {number} The width of the image.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Height of the image.
   */
  private _height: number = 0;

  /**
   * Gets the height of the image.
   * @returns {number} The height of the image.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Compression method used.
   */
  private _method: number = 0;

  /**
   * Gets the compression method used.
   * @returns {number} The compression method.
   */
  public get method(): number {
    return this._method;
  }

  /**
   * Filter type used.
   */
  private _filter: number = 0;

  /**
   * Gets the filter type used.
   * @returns {number} The filter type.
   */
  public get filter(): number {
    return this._filter;
  }

  /**
   * Pre-processing level.
   */
  private _preProcessing: number = 0;

  /**
   * Gets the pre-processing level.
   * @returns {number} The pre-processing level.
   */
  public get preProcessing(): number {
    return this._preProcessing;
  }

  /**
   * Reserved field.
   */
  private _rsrv: number = 1;

  /**
   * Gets the reserved field.
   * @returns {number} The reserved field.
   */
  public get rsrv(): number {
    return this._rsrv;
  }

  /**
   * Indicates if the alpha channel is decoded.
   */
  private _isAlphaDecoded: boolean = false;

  /**
   * Gets the alpha decoded status.
   * @returns {boolean} True if alpha is decoded, otherwise false.
   */
  public get isAlphaDecoded(): boolean {
    return this._isAlphaDecoded;
  }

  /**
   * VP8L internal data.
   */
  private _vp8l!: VP8LInternal;

  /**
   * Gets the VP8L internal data.
   * @returns {VP8LInternal} The VP8L internal data.
   */
  public get vp8l(): VP8LInternal {
    return this._vp8l;
  }

  /**
   * Indicates if 8-bit decode is used.
   */
  private _use8bDecode: boolean = false;

  /**
   * Gets the 8-bit decode usage status.
   * @returns {boolean} True if 8-bit decode is used, otherwise false.
   */
  public get use8bDecode(): boolean {
    return this._use8bDecode;
  }

  /**
   * Gets the validity status of the alpha data.
   * @returns {boolean} True if valid, otherwise false.
   */
  public get isValid(): boolean {
    if (
      this._method < WebPAlpha.alphaNoCompression ||
      this._method > WebPAlpha.alphaLosslessCompression ||
      this._filter >= WebPFilters.fitlerLast ||
      this._preProcessing > WebPAlpha.alphaPreprocessedLevels ||
      this._rsrv !== 0
    ) {
      return false;
    }
    return true;
  }

  /**
   * Creates an instance of WebPAlpha.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   */
  constructor(input: InputBuffer<Uint8Array>, width: number, height: number) {
    this._input = input;
    this._width = width;
    this._height = height;
    const b = input.read();
    this._method = b & 0x03;
    this._filter = (b >>> 2) & 0x03;
    this._preProcessing = (b >>> 4) & 0x03;
    this._rsrv = (b >>> 6) & 0x03;

    if (this.isValid) {
      if (this._method === WebPAlpha.alphaNoCompression) {
        const alphaDecodedSize = width * height;
        if (input.length < alphaDecodedSize) {
          this._rsrv = 1;
        }
      } else if (this._method === WebPAlpha.alphaLosslessCompression) {
        if (!this.decodeAlphaHeader()) {
          this._rsrv = 1;
        }
      } else {
        this._rsrv = 1;
      }
    }
  }

  /**
   * Dequantizes the levels.
   * @param {Uint8Array} _data - The data array.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} row - The starting row.
   * @param {number} numRows - The number of rows.
   * @returns {boolean} True if successful, otherwise false.
   */
  private dequantizeLevels(
    _data: Uint8Array,
    width: number,
    height: number,
    row: number,
    numRows: number
  ): boolean {
    if (
      width <= 0 ||
      height <= 0 ||
      row < 0 ||
      numRows < 0 ||
      row + numRows > height
    ) {
      return false;
    }
    return true;
  }

  /**
   * Decodes the alpha image stream.
   * @param {number} lastRow - The last row to decode.
   * @param {Uint8Array} output - The output array.
   * @returns {boolean} True if successful, otherwise false.
   */
  private decodeAlphaImageStream(lastRow: number, output: Uint8Array): boolean {
    this._vp8l.opaque = output;
    // Decode (with special row processing).
    return this._use8bDecode
      ? this._vp8l.decodeAlphaData(
          this._vp8l.webp.width,
          this._vp8l.webp.height,
          lastRow
        )
      : this._vp8l.decodeImageData(
          this._vp8l.pixels!,
          this._vp8l.webp.width,
          this._vp8l.webp.height,
          lastRow,
          this._vp8l.extractAlphaRows
        );
  }

  /**
   * Decodes the alpha header.
   * @returns {boolean} True if successful, otherwise false.
   */
  private decodeAlphaHeader(): boolean {
    const webp = new WebPInfo();
    webp.width = this._width;
    webp.height = this._height;

    this._vp8l = new VP8LInternal(this._input, webp);
    this._vp8l.ioWidth = this._width;
    this._vp8l.ioHeight = this._height;

    this._vp8l.decodeImageStream(webp.width, webp.height, true);

    // Special case: if alpha data uses only the color indexing transform and
    // doesn't use color cache (a frequent case), we will use decodeAlphaData()
    // method that only needs allocation of 1 byte per pixel (alpha channel).
    if (
      this._vp8l.transforms.length === 1 &&
      this._vp8l.transforms[0].type === VP8LImageTransformType.colorIndexing &&
      this._vp8l.is8bOptimizable()
    ) {
      this._use8bDecode = true;
      this._vp8l.allocateInternalBuffers8b();
    } else {
      this._use8bDecode = false;
      this._vp8l.allocateInternalBuffers32b();
    }

    return true;
  }

  /**
   * Decodes the alpha data.
   * @param {number} row - The starting row.
   * @param {number} numRows - The number of rows.
   * @param {Uint8Array} output - The output array.
   * @returns {boolean} True if successful, otherwise false.
   */
  public decode(row: number, numRows: number, output: Uint8Array): boolean {
    if (!this.isValid) {
      return false;
    }

    const unfilterFunc = WebPFilters.unfilters[this._filter];

    if (this._method === WebPAlpha.alphaNoCompression) {
      const offset = row * this._width;
      const numPixels = numRows * this._width;
      ArrayUtils.copyRange(
        this._input.buffer,
        this._input.position + offset,
        output,
        offset,
        numPixels
      );
    } else {
      if (!this.decodeAlphaImageStream(row + numRows, output)) {
        return false;
      }
    }

    if (unfilterFunc !== undefined) {
      unfilterFunc(
        this._width,
        this._height,
        this._width,
        row,
        numRows,
        output
      );
    }

    if (this._preProcessing === WebPAlpha.alphaPreprocessedLevels) {
      if (
        !this.dequantizeLevels(output, this._width, this._height, row, numRows)
      ) {
        return false;
      }
    }

    if (row + numRows === this._height) {
      this._isAlphaDecoded = true;
    }

    return true;
  }

  /**
   * Alpha related constants.
   */
  private static readonly alphaNoCompression = 0;
  private static readonly alphaLosslessCompression = 1;
  private static readonly alphaPreprocessedLevels = 1;
}
