/** @format */

import { Color } from '../color/color.js';
import { ColorInt32 } from '../color/color-int32.js';
import { Format, FormatType } from '../color/format.js';
import {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
  getImageDataBytes,
} from './image-data.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';
import { PixelInt32 } from './pixel-int32.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';

/**
 * Class representing memory image data in Int32 format.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataInt32 implements MemoryImageData, Iterable<Pixel> {
  /** The width of the image. */
  private _width: number;
  /** Gets the width of the image. */
  public get width(): number {
    return this._width;
  }
  /** Sets the width of the image. */
  public set width(v: number) {
    this._width = v;
  }

  /** The height of the image. */
  private _height: number;
  /** Gets the height of the image. */
  public get height(): number {
    return this._height;
  }
  /** Sets the height of the image. */
  public set height(v: number) {
    this._height = v;
  }

  /** Data of the image in Int32Array format */
  private readonly _data: Int32Array;
  /** Gets the data of the image */
  public get data(): Int32Array {
    return this._data;
  }

  /** Number of channels in the image */
  private readonly _numChannels: number;
  /** Gets the number of channels in the image */
  public get numChannels(): number {
    return this._numChannels;
  }

  /** Gets the format of the image */
  public get format(): Format {
    return Format.int32;
  }

  /** Gets the format type of the image */
  public get formatType(): FormatType {
    return FormatType.int;
  }

  /** Gets the buffer of the image data */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  /** Gets the row stride of the image */
  public get rowStride(): number {
    return this._width * this._numChannels * 4;
  }

  /** Gets the iterator for the image data */
  public get iterator(): PixelInt32 {
    return PixelInt32.imageData(this);
  }

  /** Gets the byte length of the image data */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /** Gets the length of the image data */
  public get length(): number {
    return this._data.byteLength;
  }

  /** Gets the maximum channel value */
  public get maxChannelValue(): number {
    return 0x7fffffff;
  }

  /** Gets the maximum index value */
  public get maxIndexValue(): number {
    return 0x7fffffff;
  }

  /** Checks if the image has a palette */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /** Gets the palette of the image */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Checks if the image is in HDR format */
  public get isHdrFormat(): boolean {
    return true;
  }

  /** Checks if the image is in LDR format */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /** Gets the bits per channel */
  public get bitsPerChannel(): number {
    return 32;
  }

  /**
   * Constructor for MemoryImageDataInt32
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {number} numChannels - Number of channels in the image
   * @param {Int32Array} [data] - Optional data for the image
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Int32Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Int32Array(this._width * this._height * this._numChannels);
  }

  /**
   * Creates a new MemoryImageDataInt32 from another instance
   * @param {MemoryImageDataInt32} other - Another MemoryImageDataInt32 instance
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data
   * @returns {MemoryImageDataInt32} A new MemoryImageDataInt32 instance
   */
  public static from(
    other: MemoryImageDataInt32,
    skipPixels = false
  ): MemoryImageDataInt32 {
    const data = skipPixels
      ? new Int32Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataInt32(
      other.width,
      other.height,
      other._numChannels,
      data
    );
  }

  /**
   * Gets a range of pixels from the image
   * @param {number} x - X coordinate of the starting point
   * @param {number} y - Y coordinate of the starting point
   * @param {number} width - Width of the range
   * @param {number} height - Height of the range
   * @returns {Iterator<Pixel>} An iterator for the pixel range
   */
  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return new PixelRangeIterator(
      PixelInt32.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color object from the given RGBA values
   * @param {number} r - Red channel value
   * @param {number} g - Green channel value
   * @param {number} b - Blue channel value
   * @param {number} [a] - Alpha channel value (optional)
   * @returns {Color} A Color object
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorInt32.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorInt32.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  /**
   * Gets a pixel object at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Pixel} [pixel] - Optional pixel object to reuse
   * @returns {Pixel} A Pixel object
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelInt32) || p.image !== this) {
      p = PixelInt32.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel at the given coordinates with the given color
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Color} p - Color object
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red channel of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red channel value
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this.width * this.numChannels + x * this.numChannels;
    this.data[index] = Math.trunc(r);
  }

  /**
   * Sets the RGB channels of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red channel value
   * @param {number} g - Green channel value
   * @param {number} b - Blue channel value
   */
  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this.width * this.numChannels + x * this._numChannels;
    this._data[index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Math.trunc(b);
      }
    }
  }

  /**
   * Sets the RGBA channels of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red channel value
   * @param {number} g - Green channel value
   * @param {number} b - Blue channel value
   * @param {number} a - Alpha channel value
   */
  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    const index = y * this.width * this.numChannels + x * this._numChannels;
    this._data[index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Math.trunc(b);
        if (this._numChannels > 3) {
          this._data[index + 3] = Math.trunc(a);
        }
      }
    }
  }

  /**
   * Safely sets the RGB channels of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red channel value
   * @param {number} g - Green channel value
   * @param {number} b - Blue channel value
   */
  public setPixelRgbSafe(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.setPixelRgb(x, y, r, g, b);
  }

  /**
   * Safely sets the RGBA channels of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red channel value
   * @param {number} g - Green channel value
   * @param {number} b - Blue channel value
   * @param {number} a - Alpha channel value
   */
  public setPixelRgbaSafe(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.setPixelRgba(x, y, r, g, b, a);
  }

  /**
   * Clears the image data
   * @param {Color} [_c] - Optional color to clear with
   */
  public clear(_c?: Color): void {}

  /**
   * Clones the current image data
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data
   * @returns {MemoryImageDataInt32} A new MemoryImageDataInt32 instance
   */
  public clone(skipPixels = false): MemoryImageDataInt32 {
    return MemoryImageDataInt32.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array
   * @returns {Uint8Array} A Uint8Array representation of the image data
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data
   * @param {MemoryImageDataGetBytesOptions} [opt] - Options for getting the bytes
   * @param {string} [opt.format] - The format in which to get the bytes (e.g., 'png', 'jpeg')
   * @param {number} [opt.quality] - The quality of the image data (e.g., 0.8 for 80% quality)
   * @param {number} [opt.width] - The width of the image data to be returned
   * @param {number} [opt.height] - The height of the image data to be returned
   * @returns {Uint8Array} A Uint8Array of the image data bytes
   */
  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  /**
   * Converts the image data to a string representation
   * @returns {string} A string representation of the image data
   */
  public toString(): string {
    return `${this.constructor.name} (w: ${this._width}, h: ${this._height}, ch: ${this._numChannels})`;
  }

  /**
   * Gets the iterator for the image data
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image data
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelInt32.imageData(this);
  }
}
