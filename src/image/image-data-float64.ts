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
import { PixelFloat64 } from './pixel-float64.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorFloat64 } from '../color/color-float64.js';

/**
 * Class representing a memory image data with Float64 precision.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataFloat64
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

  /** Data array containing pixel values */
  private readonly _data: Float64Array;
  /** Getter for the data array */
  public get data(): Float64Array {
    return this._data;
  }

  /** Number of channels in the image */
  private readonly _numChannels: number;
  /** Getter for the number of channels */
  public get numChannels(): number {
    return this._numChannels;
  }

  /** Getter for the format of the image */
  public get format(): Format {
    return Format.float64;
  }

  /** Getter for the format type of the image */
  public get formatType(): FormatType {
    return FormatType.float;
  }

  /** Getter for the buffer of the image data */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  /** Getter for the row stride of the image data */
  public get rowStride(): number {
    return this._width * this._numChannels * 8;
  }

  /** Getter for the iterator of the image data */
  public get iterator(): PixelFloat64 {
    return PixelFloat64.imageData(this);
  }

  /** Getter for the byte length of the image data */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /** Getter for the length of the image data */
  public get length(): number {
    return this._data.byteLength;
  }

  /** Getter for the maximum channel value */
  public get maxChannelValue(): number {
    return 1;
  }

  /** Getter for the maximum index value */
  public get maxIndexValue(): number {
    return 1;
  }

  /** Getter to check if the image has a palette */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /** Getter for the palette of the image */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Getter to check if the image format is HDR */
  public get isHdrFormat(): boolean {
    return true;
  }

  /** Getter to check if the image format is LDR */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /** Getter for the bits per channel */
  public get bitsPerChannel(): number {
    return 64;
  }

  /**
   * Constructor for MemoryImageDataFloat64
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {number} numChannels - Number of channels in the image
   * @param {Float64Array} [data] - Optional data array containing pixel values
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Float64Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ??
      new Float64Array(this._width * this._height * 4 * this._numChannels);
  }

  /**
   * Creates a new MemoryImageDataFloat64 instance from another instance
   * @param {MemoryImageDataFloat64} other - Another MemoryImageDataFloat64 instance
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data
   * @returns {MemoryImageDataFloat64} A new MemoryImageDataFloat64 instance
   */
  public static from(
    other: MemoryImageDataFloat64,
    skipPixels = false
  ): MemoryImageDataFloat64 {
    const data = skipPixels
      ? new Float64Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataFloat64(
      other.width,
      other.height,
      other._numChannels,
      data
    );
  }

  /**
   * Gets a range of pixels from the image
   * @param {number} x - X coordinate of the starting pixel
   * @param {number} y - Y coordinate of the starting pixel
   * @param {number} width - Width of the range
   * @param {number} height - Height of the range
   * @returns {Iterator<Pixel>} An iterator for the range of pixels
   */
  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return new PixelRangeIterator(
      PixelFloat64.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color object from the given RGBA values
   * @param {number} r - Red component
   * @param {number} g - Green component
   * @param {number} b - Blue component
   * @param {number} [a] - Alpha component (optional)
   * @returns {Color} A Color object
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorFloat64.rgb(r, g, b)
      : ColorFloat64.rgba(r, g, b, a);
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
    if (p === undefined || !(p instanceof PixelFloat64) || p.image !== this) {
      p = PixelFloat64.imageData(this);
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
   * Sets the red component of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red component
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this._width * this._numChannels + x * this.numChannels;
    this.data[index] = r;
  }

  /**
   * Sets the RGB components of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red component
   * @param {number} g - Green component
   * @param {number} b - Blue component
   */
  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = r;
    if (this._numChannels > 1) {
      this._data[index + 1] = g;
      if (this._numChannels > 2) {
        this._data[index + 2] = b;
      }
    }
  }

  /**
   * Sets the RGBA components of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red component
   * @param {number} g - Green component
   * @param {number} b - Blue component
   * @param {number} a - Alpha component
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
    this._data[index] = r;
    if (this._numChannels > 1) {
      this._data[index + 1] = g;
      if (this._numChannels > 2) {
        this._data[index + 2] = b;
        if (this._numChannels > 3) {
          this._data[index + 3] = a;
        }
      }
    }
  }

  /**
   * Safely sets the RGB components of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red component
   * @param {number} g - Green component
   * @param {number} b - Blue component
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
   * Safely sets the RGBA components of a pixel at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} r - Red component
   * @param {number} g - Green component
   * @param {number} b - Blue component
   * @param {number} a - Alpha component
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
   * @returns {MemoryImageDataFloat64} A new MemoryImageDataFloat64 instance
   */
  public clone(skipPixels = false): MemoryImageDataFloat64 {
    return MemoryImageDataFloat64.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array
   * @returns {Uint8Array} A Uint8Array containing the image data
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data
   * @param {MemoryImageDataGetBytesOptions} [opt] - Options for getting the bytes
   * @param {number} [opt.width] - The width of the image (optional)
   * @param {number} [opt.height] - The height of the image (optional)
   * @param {string} [opt.format] - The format of the image data (optional)
   * @returns {Uint8Array} A Uint8Array containing the image data bytes
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
   * Iterator for the image data
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image data
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelFloat64.imageData(this);
  }
}
