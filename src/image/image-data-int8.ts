/** @format */

import { Color } from '../color/color.js';
import { ColorInt8 } from '../color/color-int8.js';
import { Format, FormatType } from '../color/format.js';
import {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
  getImageDataBytes,
} from './image-data.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';
import { PixelInt8 } from './pixel-int8.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';

/**
 * Class representing an 8-bit memory image data.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataInt8 implements MemoryImageData, Iterable<Pixel> {
  /** The width of the image. */
  private readonly _width: number;
  /** Gets the width of the image. */
  public get width(): number {
    return this._width;
  }

  /** The height of the image. */
  private readonly _height: number;
  /** Gets the height of the image. */
  public get height(): number {
    return this._height;
  }

  /** The image data stored as an Int8Array. */
  private readonly _data: Int8Array;
  /** Gets the image data. */
  public get data(): Int8Array {
    return this._data;
  }

  /** The number of channels in the image. */
  private readonly _numChannels: number;
  /** Gets the number of channels in the image. */
  public get numChannels(): number {
    return this._numChannels;
  }

  /** Gets the format of the image data. */
  public get format(): Format {
    return Format.int8;
  }

  /** Gets the format type of the image data. */
  public get formatType(): FormatType {
    return FormatType.int;
  }

  /** Gets the buffer of the image data. */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  /** Gets the row stride of the image data. */
  public get rowStride(): number {
    return this._width * this._numChannels;
  }

  /** Gets the iterator for the image data. */
  public get iterator(): PixelInt8 {
    return PixelInt8.imageData(this);
  }

  /** Gets the byte length of the image data. */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /** Gets the length of the image data. */
  public get length(): number {
    return this._data.byteLength;
  }

  /** Gets the maximum channel value. */
  public get maxChannelValue(): number {
    return 0x7f;
  }

  /** Gets the maximum index value. */
  public get maxIndexValue(): number {
    return 0x7f;
  }

  /** Checks if the image data has a palette. */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /** Gets the palette of the image data. */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Checks if the format is HDR. */
  public get isHdrFormat(): boolean {
    return true;
  }

  /** Checks if the format is LDR. */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /** Gets the bits per channel. */
  public get bitsPerChannel(): number {
    return 8;
  }

  /**
   * Constructs a new MemoryImageDataInt8 instance.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Int8Array} [data] - Optional image data.
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Int8Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Int8Array(this._width * this._height * this._numChannels);
  }

  /**
   * Creates a new MemoryImageDataInt8 instance from another instance.
   * @param {MemoryImageDataInt8} other - The other MemoryImageDataInt8 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataInt8} A new MemoryImageDataInt8 instance.
   */
  public static from(
    other: MemoryImageDataInt8,
    skipPixels = false
  ): MemoryImageDataInt8 {
    const data = skipPixels
      ? new Int8Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataInt8(
      other.width,
      other.height,
      other._numChannels,
      data
    );
  }

  /**
   * Gets a range of pixels.
   * @param {number} x - The x-coordinate of the starting pixel.
   * @param {number} y - The y-coordinate of the starting pixel.
   * @param {number} width - The width of the range.
   * @param {number} height - The height of the range.
   * @returns {Iterator<Pixel>} An iterator for the pixel range.
   */
  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return new PixelRangeIterator(
      PixelInt8.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color object.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} [a] - The alpha channel value (optional).
   * @returns {Color} A Color object.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorInt8.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorInt8.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  /**
   * Gets a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - Optional pixel object to reuse.
   * @returns {Pixel} A Pixel object.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelInt8) || p.image !== this) {
      p = PixelInt8.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color} p - The color to set.
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red channel of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this.rowStride + x * this.numChannels;
    this.data[index] = Math.trunc(r);
  }

  /**
   * Sets the RGB channels of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   */
  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this.rowStride + x * this._numChannels;
    this._data[index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Math.trunc(b);
      }
    }
  }

  /**
   * Sets the RGBA channels of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    const index = y * this.rowStride + x * this._numChannels;
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
   * Safely sets the RGB channels of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
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
   * Safely sets the RGBA channels of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
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
   * Clears the image data.
   * @param {Color} [_c] - Optional color to clear with.
   */
  public clear(_c?: Color): void {}

  /**
   * Clones the image data.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataInt8} A new MemoryImageDataInt8 instance.
   */
  public clone(skipPixels = false): MemoryImageDataInt8 {
    return MemoryImageDataInt8.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array.
   * @returns {Uint8Array} A Uint8Array representation of the image data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data.
   * @param {MemoryImageDataGetBytesOptions} [opt] - Optional options for getting the bytes.
   * @param {number} [opt.width] - The width of the image. If not provided, the default width will be used.
   * @param {number} [opt.height] - The height of the image. If not provided, the default height will be used.
   * @param {string} [opt.format] - The format of the image data. Can be 'RGBA', 'RGB', etc.
   * @param {boolean} [opt.flipY] - A boolean indicating whether to flip the image data vertically.
   * @returns {Uint8Array} A Uint8Array of the image data bytes.
   */
  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  /**
   * Gets the iterator for the image data.
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image data.
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelInt8.imageData(this);
  }
}
