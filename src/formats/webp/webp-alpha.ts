/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { VP8LImageTransformType } from './vp8l-image-transform-type.js';
import { VP8LInternal } from './vp8l-internal.js';
import { WebPFilters } from './webp-filters.js';
import { WebPInfo } from './webp-info.js';

/**
 * Handles decoding and processing of the WebP alpha channel.
 */
export class WebPAlpha {
  /** Input buffer for alpha data. */
  private _input: InputBuffer<Uint8Array>;
  /** Image width. */
  private _width: number = 0;
  /** Image height. */
  private _height: number = 0;
  /** Compression method. */
  private _method: number = 0;
  /** Filter type. */
  private _filter: number = 0;
  /** Pre-processing level. */
  private _preProcessing: number = 0;
  /** Reserved field. */
  private _rsrv: number = 1;
  /** True if alpha channel is decoded. */
  private _isAlphaDecoded: boolean = false;
  /** VP8L internal data. */
  private _vp8l!: VP8LInternal;
  /** True if 8-bit decode is used. */
  private _use8bDecode: boolean = false;

  /** No compression constant. */
  private static readonly alphaNoCompression = 0;
  /** Lossless compression constant. */
  private static readonly alphaLosslessCompression = 1;
  /** Preprocessed levels constant. */
  private static readonly alphaPreprocessedLevels = 1;

  /** Returns input buffer. */
  public get input(): InputBuffer<Uint8Array> {
    return this._input;
  }
  /** Returns image width. */
  public get width(): number {
    return this._width;
  }
  /** Returns image height. */
  public get height(): number {
    return this._height;
  }
  /** Returns compression method. */
  public get method(): number {
    return this._method;
  }
  /** Returns filter type. */
  public get filter(): number {
    return this._filter;
  }
  /** Returns pre-processing level. */
  public get preProcessing(): number {
    return this._preProcessing;
  }
  /** Returns reserved field. */
  public get rsrv(): number {
    return this._rsrv;
  }
  /** Returns true if alpha is decoded. */
  public get isAlphaDecoded(): boolean {
    return this._isAlphaDecoded;
  }
  /** Returns VP8L internal data. */
  public get vp8l(): VP8LInternal {
    return this._vp8l;
  }
  /** Returns true if 8-bit decode is used. */
  public get use8bDecode(): boolean {
    return this._use8bDecode;
  }

  /** Returns true if alpha data is valid. */
  public get isValid(): boolean {
    if (
      this._method < WebPAlpha.alphaNoCompression ||
      this._method > WebPAlpha.alphaLosslessCompression ||
      this._filter >= WebPFilters.filterLast ||
      this._preProcessing > WebPAlpha.alphaPreprocessedLevels ||
      this._rsrv !== 0
    ) {
      return false;
    }
    return true;
  }

  /**
   * Constructs WebPAlpha instance.
   * @param input Input buffer.
   * @param width Image width.
   * @param height Image height.
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
        if (input.length < alphaDecodedSize) this._rsrv = 1;
      } else if (this._method === WebPAlpha.alphaLosslessCompression) {
        if (!this.decodeAlphaHeader()) this._rsrv = 1;
      } else {
        this._rsrv = 1;
      }
    }
  }

  /**
   * Dequantizes alpha levels if pre-processing is enabled.
   * @param _data Alpha data.
   * @param width Image width.
   * @param height Image height.
   * @param row Start row.
   * @param numRows Number of rows.
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
   * Decodes alpha image stream.
   * @param lastRow Last row to decode.
   * @param output Output array.
   */
  private decodeAlphaImageStream(lastRow: number, output: Uint8Array): boolean {
    this._vp8l.opaque = output;
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
          (_row, _waitForBiggestBatch) =>
            this._vp8l.extractAlphaRows(_row, _waitForBiggestBatch)
        );
  }

  /**
   * Decodes alpha header and initializes VP8LInternal.
   */
  private decodeAlphaHeader(): boolean {
    const webp = new WebPInfo();
    webp.width = this._width;
    webp.height = this._height;
    this._vp8l = new VP8LInternal(this._input, webp);
    this._vp8l.ioWidth = this._width;
    this._vp8l.ioHeight = this._height;
    this._vp8l.decodeImageStream(webp.width, webp.height, true);
    if (
      this._vp8l.transforms.length === 1 &&
      this._vp8l.transforms[0].type === VP8LImageTransformType.colorIndexing &&
      this._vp8l.is8bOptimizable()
    ) {
      this._use8bDecode = true;
      this._vp8l.allocateInternalBuffers8b();
    } else {
      this._use8bDecode = false;
      this._vp8l.allocateInternalBuffers32b(this._width);
    }
    return true;
  }

  /**
   * Decodes alpha data for specified rows.
   * @param row Start row.
   * @param numRows Number of rows.
   * @param output Output array.
   */
  public decode(row: number, numRows: number, output: Uint8Array): boolean {
    if (!this.isValid) return false;
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
      if (!this.decodeAlphaImageStream(row + numRows, output)) return false;
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
    if (row + numRows >= this._height) this._isAlphaDecoded = true;
    return true;
  }
}
