/** @format */

import { Color } from '../color/color.js';
import { Format, FormatType } from '../color/format.js';
import {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
  getImageDataBytes,
} from './image-data.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';
import { PixelFloat16 } from './pixel-float16.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorFloat16 } from '../color/color-float16.js';
import { Float16 } from '../common/float16.js';

/**
 * Class representing a memory image data with Float16 precision.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataFloat16
  implements MemoryImageData, Iterable<Pixel>
{
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

  /** The data of the image stored as a Uint16Array. */
  private readonly _data: Uint16Array;
  /** Gets the data of the image. */
  public get data(): Uint16Array {
    return this._data;
  }

  /** The number of channels in the image. */
  private readonly _numChannels: number;
  /** Gets the number of channels in the image. */
  public get numChannels(): number {
    return this._numChannels;
  }

  /** Gets the format of the image. */
  public get format(): Format {
    return Format.float16;
  }

  /** Gets the format type of the image. */
  public get formatType(): FormatType {
    return FormatType.float;
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
  public get iterator(): PixelFloat16 {
    return PixelFloat16.imageData(this);
  }

  /** Gets the byte length of the image data. */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /** Gets the length of the image data. */
  public get length(): number {
    return this._data.byteLength;
  }

  /** Gets the maximum channel value of the image data. */
  public get maxChannelValue(): number {
    return 1;
  }

  /** Gets the maximum index value of the image data. */
  public get maxIndexValue(): number {
    return 1;
  }

  /** Checks if the image data has a palette. */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /** Gets the palette of the image data. */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Checks if the image format is HDR. */
  public get isHdrFormat(): boolean {
    return true;
  }

  /** Checks if the image format is LDR. */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /** Gets the bits per channel of the image data. */
  public get bitsPerChannel(): number {
    return 16;
  }

  /**
   * Constructs a new MemoryImageDataFloat16 instance.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Uint16Array} [data] - Optional data for the image.
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Uint16Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Uint16Array(this._width * this._height * this._numChannels);
  }

  /**
   * Creates a new MemoryImageDataFloat16 instance from another instance.
   * @param {MemoryImageDataFloat16} other - The other MemoryImageDataFloat16 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataFloat16} A new MemoryImageDataFloat16 instance.
   */
  public static from(
    other: MemoryImageDataFloat16,
    skipPixels = false
  ): MemoryImageDataFloat16 {
    const data = skipPixels
      ? new Uint16Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataFloat16(
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
      PixelFloat16.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color object from the given RGBA values.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} [a] - The alpha component (optional).
   * @returns {Color} A Color object.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorFloat16.rgb(r, g, b)
      : ColorFloat16.rgba(r, g, b, a);
  }

  /**
   * Gets a pixel from the image data at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel object to reuse.
   * @returns {Pixel} A Pixel object.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelFloat16) || p.image !== this) {
      p = PixelFloat16.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel in the image data at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color} p - The Color object to set.
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red component of a pixel in the image data at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component value.
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this._width * this._numChannels + x * this.numChannels;
    this.data[index] = Float16.doubleToFloat16(r);
  }

  /**
   * Sets the RGB components of a pixel in the image data at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component value.
   * @param {number} g - The green component value.
   * @param {number} b - The blue component value.
   */
  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Float16.doubleToFloat16(b);
      }
    }
  }

  /**
   * Sets the RGBA components of a pixel in the image data at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component value.
   * @param {number} g - The green component value.
   * @param {number} b - The blue component value.
   * @param {number} a - The alpha component value.
   */
  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Float16.doubleToFloat16(b);
        if (this._numChannels > 3) {
          this._data[index + 3] = Float16.doubleToFloat16(a);
        }
      }
    }
  }

  /**
   * Sets the RGB components of a pixel in the image data at the specified coordinates safely.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component value.
   * @param {number} g - The green component value.
   * @param {number} b - The blue component value.
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
   * Sets the RGBA components of a pixel in the image data at the specified coordinates safely.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component value.
   * @param {number} g - The green component value.
   * @param {number} b - The blue component value.
   * @param {number} a - The alpha component value.
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
   * Clones the current image data.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataFloat16} A new MemoryImageDataFloat16 instance.
   */
  public clone(skipPixels = false): MemoryImageDataFloat16 {
    return MemoryImageDataFloat16.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array.
   * @returns {Uint8Array} A Uint8Array representing the image data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data.
   * @param {MemoryImageDataGetBytesOptions} [opt] - Optional options for getting the bytes.
   * @param {string} [opt.format] - The format in which to get the bytes (e.g., 'png', 'jpeg').
   * @param {number} [opt.quality] - The quality of the image data (e.g., 0.8 for 80% quality).
   * @param {number} [opt.width] - The width of the image to resize to (optional).
   * @param {number} [opt.height] - The height of the image to resize to (optional).
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
    return PixelFloat16.imageData(this);
  }
}
