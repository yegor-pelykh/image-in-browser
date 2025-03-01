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
import { PixelUint4 } from './pixel-uint4.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorUint4 } from '../color/color-uint4.js';

/**
 * Class representing memory image data with uint4 format.
 */
export class MemoryImageDataUint4 implements MemoryImageData, Iterable<Pixel> {
  private _pixel?: PixelUint4;

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

  /**
   * The data of the image.
   */
  private readonly _data: Uint8Array;
  public get data(): Uint8Array {
    return this._data;
  }

  /**
   * The number of channels in the image.
   */
  private readonly _numChannels: number;
  public get numChannels(): number {
    return this._numChannels;
  }

  /**
   * The format of the image.
   */
  public get format(): Format {
    return Format.uint4;
  }

  /**
   * The format type of the image.
   */
  public get formatType(): FormatType {
    return FormatType.uint;
  }

  /**
   * The buffer of the image data.
   */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  private _rowStride: number;
  public get rowStride(): number {
    return this._rowStride;
  }

  /**
   * The iterator for the image data.
   */
  public get iterator(): PixelUint4 {
    return PixelUint4.imageData(this);
  }

  /**
   * The byte length of the image data.
   */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /**
   * The length of the image data.
   */
  public get length(): number {
    return this._data.byteLength;
  }

  /**
   * The maximum channel value.
   */
  public get maxChannelValue(): number {
    return this._palette?.maxChannelValue ?? 15;
  }

  /**
   * The maximum index value.
   */
  public get maxIndexValue(): number {
    return 15;
  }

  /**
   * Whether the image has a palette.
   */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  private _palette?: Palette;
  public get palette(): Palette | undefined {
    return this._palette;
  }
  public set palette(p: Palette | undefined) {
    this._palette = p;
  }

  /**
   * Whether the image format is HDR.
   */
  public get isHdrFormat(): boolean {
    return false;
  }

  /**
   * Whether the image format is LDR.
   */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /**
   * The bits per channel.
   */
  public get bitsPerChannel(): number {
    return 4;
  }

  /**
   * Creates an instance of MemoryImageDataUint4.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Uint8Array} [data] - The data of the image.
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Uint8Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._rowStride =
      this._numChannels === 2
        ? this._width
        : this._numChannels === 4
          ? this._width * 2
          : this._numChannels === 3
            ? Math.ceil(this._width * 1.5)
            : Math.ceil(this._width / 2);
    this._palette = undefined;
    this._data =
      data ?? new Uint8Array(Math.max(this._rowStride * this._height, 1));
  }

  /**
   * Creates a MemoryImageDataUint4 instance with a palette.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {Palette} [palette] - The palette of the image.
   * @returns {MemoryImageDataUint4} A new MemoryImageDataUint4 instance.
   */
  public static palette(
    width: number,
    height: number,
    palette?: Palette
  ): MemoryImageDataUint4 {
    const rowStride = Math.ceil(width / 2);
    const data = new Uint8Array(Math.max(rowStride * height, 1));
    const d = new MemoryImageDataUint4(width, height, 1, data);
    d._rowStride = rowStride;
    d._palette = palette;
    return d;
  }

  /**
   * Creates a MemoryImageDataUint4 instance from another instance.
   * @param {MemoryImageDataUint4} other - The other MemoryImageDataUint4 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint4} A new MemoryImageDataUint4 instance.
   */
  public static from(
    other: MemoryImageDataUint4,
    skipPixels = false
  ): MemoryImageDataUint4 {
    const data = skipPixels
      ? new Uint8Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint4(
      other.width,
      other.height,
      other._numChannels,
      data
    );
    d._rowStride = other.rowStride;
    d._palette = other.palette?.clone();
    return d;
  }

  /**
   * Gets a range of pixels.
   * @param {number} x - The x-coordinate of the range.
   * @param {number} y - The y-coordinate of the range.
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
      PixelUint4.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} [a] - The alpha component.
   * @returns {Color} A Color instance.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorUint4.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorUint4.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  /**
   * Gets a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - The pixel instance to reuse.
   * @returns {Pixel} A Pixel instance.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint4) || p.image !== this) {
      p = PixelUint4.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color} p - The color to set.
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red component of a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   */
  public setPixelR(x: number, y: number, r: number): void {
    if (this._numChannels < 1) {
      return;
    }
    this._pixel ??= PixelUint4.imageData(this);
    this._pixel.setPosition(x, y);
    this._pixel.index = r;
  }

  /**
   * Sets the RGB components of a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   */
  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    if (this._numChannels < 1) {
      return;
    }
    this._pixel ??= PixelUint4.imageData(this);
    this._pixel.setPosition(x, y);
    this._pixel.setRgb(r, g, b);
  }

  /**
   * Sets the RGBA components of a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} a - The alpha component.
   */
  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    if (this._numChannels < 1) {
      return;
    }
    this._pixel ??= PixelUint4.imageData(this);
    this._pixel.setPosition(x, y);
    this._pixel.setRgba(r, g, b, a);
  }

  /**
   * Safely sets the RGB components of a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
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
   * Safely sets the RGBA components of a pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} a - The alpha component.
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
   * Clears the image.
   * @param {Color} [_c] - The color to clear with.
   */
  public clear(_c?: Color): void {}

  /**
   * Clones the image data.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint4} A new MemoryImageDataUint4 instance.
   */
  public clone(skipPixels = false): MemoryImageDataUint4 {
    return MemoryImageDataUint4.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array.
   * @returns {Uint8Array} A Uint8Array of the image data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data.
   * @param {MemoryImageDataGetBytesOptions} [opt] - The options for getting the bytes.
   * @param {string} [opt.format] - The format in which to get the bytes (e.g., 'png', 'jpeg').
   * @param {number} [opt.quality] - The quality of the image data (e.g., 0.8 for 80% quality).
   * @param {number} [opt.width] - The width of the image data to be returned.
   * @param {number} [opt.height] - The height of the image data to be returned.
   * @returns {Uint8Array} A Uint8Array of the image data bytes.
   */
  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  /**
   * Converts the image data to a string.
   * @returns {string} A string representation of the image data.
   */
  public toString(): string {
    return `${this.constructor.name} (w: ${this._width}, h: ${this._height}, ch: ${this._numChannels})`;
  }

  /**
   * The iterator for the image data.
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image data.
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelUint4.imageData(this);
  }
}
