/** @format */

import { Color } from '../color/color.js';
import { ColorInt16 } from '../color/color-int16.js';
import { Format, FormatType } from '../color/format.js';
import {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
  getImageDataBytes,
} from './image-data.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';
import { PixelInt16 } from './pixel-int16.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';

/**
 * Represents a memory image data with 16-bit integer channels.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataInt16 implements MemoryImageData, Iterable<Pixel> {
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

  /** The image data stored as a 16-bit integer array. */
  private readonly _data: Int16Array;
  /** Gets the image data stored as a 16-bit integer array. */
  public get data(): Int16Array {
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
    return Format.int16;
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
    return this._width * this._numChannels * 2;
  }

  /** Gets the iterator for the image data. */
  public get iterator(): PixelInt16 {
    return PixelInt16.imageData(this);
  }

  /** Gets the byte length of the image data. */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /** Gets the length of the image data. */
  public get length(): number {
    return this._data.byteLength;
  }

  /** Gets the maximum channel value for the image data. */
  public get maxChannelValue(): number {
    return 0x7fff;
  }

  /** Gets the maximum index value for the image data. */
  public get maxIndexValue(): number {
    return 0x7fff;
  }

  /** Checks if the image data has a palette. */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /** Gets the palette of the image data. */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Checks if the image data is in HDR format. */
  public get isHdrFormat(): boolean {
    return true;
  }

  /** Checks if the image data is in LDR format. */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /** Gets the bits per channel for the image data. */
  public get bitsPerChannel(): number {
    return 16;
  }

  /**
   * Constructs a new MemoryImageDataInt16 instance.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Int16Array} [data] - Optional initial data for the image.
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Int16Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Int16Array(this._width * this._height * this._numChannels);
  }

  /**
   * Creates a new MemoryImageDataInt16 instance from another instance.
   * @param {MemoryImageDataInt16} other - The other MemoryImageDataInt16 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataInt16} A new MemoryImageDataInt16 instance.
   */
  public static from(
    other: MemoryImageDataInt16,
    skipPixels = false
  ): MemoryImageDataInt16 {
    const data = skipPixels
      ? new Int16Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataInt16(
      other.width,
      other.height,
      other._numChannels,
      data
    );
  }

  /**
   * Gets a range of pixels from the image data.
   * @param {number} x - The x-coordinate of the starting pixel.
   * @param {number} y - The y-coordinate of the starting pixel.
   * @param {number} width - The width of the range.
   * @param {number} height - The height of the range.
   * @returns {Iterator<Pixel>} An iterator for the range of pixels.
   */
  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return new PixelRangeIterator(
      PixelInt16.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color object from the given channel values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} [a] - The alpha channel value (optional).
   * @returns {Color} A Color object.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorInt16.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorInt16.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  /**
   * Gets a pixel object at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel object to reuse.
   * @returns {Pixel} A Pixel object.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelInt16) || p.image !== this) {
      p = PixelInt16.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel at the specified coordinates with the given color.
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
    const index = y * this.width * this.numChannels + x * this.numChannels;
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
   * Clears the image data with the specified color.
   * @param {Color} [_c] - The color to clear with (optional).
   */
  public clear(_c?: Color): void {}

  /**
   * Clones the current MemoryImageDataInt16 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataInt16} A new MemoryImageDataInt16 instance.
   */
  public clone(skipPixels = false): MemoryImageDataInt16 {
    return MemoryImageDataInt16.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array.
   * @returns {Uint8Array} A Uint8Array representing the image data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data with optional parameters.
   * @param {MemoryImageDataGetBytesOptions} [opt] - The options for getting the bytes.
   * @param {number} [opt.width] - The width of the image. If not provided, the default width is used.
   * @param {number} [opt.height] - The height of the image. If not provided, the default height is used.
   * @param {string} [opt.format] - The format of the image data. Can be 'RGBA', 'RGB', etc.
   * @param {boolean} [opt.flipY] - A boolean indicating whether to flip the image vertically.
   * @returns {Uint8Array} A Uint8Array representing the image data bytes.
   */
  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  /**
   * Converts the image data to a string representation.
   * @returns {string} A string representing the image data.
   */
  public toString(): string {
    return `${this.constructor.name} (w: ${this._width}, h: ${this._height}, ch: ${this._numChannels})`;
  }

  /**
   * Gets the iterator for the image data.
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image data.
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelInt16.imageData(this);
  }
}
