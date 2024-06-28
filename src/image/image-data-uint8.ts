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
import { PixelUint8 } from './pixel-uint8.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorRgb8 } from '../color/color-rgb8.js';
import { ColorRgba8 } from '../color/color-rgba8.js';
import { MathUtils } from '../common/math-utils.js';

/**
 * Represents an image data structure with 8-bit unsigned integer pixels.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataUint8 implements MemoryImageData, Iterable<Pixel> {
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

  /** The pixel data of the image. */
  private readonly _data: Uint8Array;
  /** Gets the pixel data of the image. */
  public get data(): Uint8Array {
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
    return Format.uint8;
  }

  /** Gets the format type of the image data. */
  public get formatType(): FormatType {
    return FormatType.uint;
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
  public get iterator(): PixelUint8 {
    return PixelUint8.imageData(this);
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
    return this._palette?.maxChannelValue ?? 255;
  }

  /** Gets the maximum index value of the image data. */
  public get maxIndexValue(): number {
    return 255;
  }

  /** Checks if the image data has a palette. */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /** The palette of the image data. */
  private _palette?: Palette;
  /** Gets the palette of the image data. */
  public get palette(): Palette | undefined {
    return this._palette;
  }
  /** Sets the palette of the image data. */
  public set palette(p: Palette | undefined) {
    this._palette = p;
  }

  /** Checks if the image data is in HDR format. */
  public get isHdrFormat(): boolean {
    return false;
  }

  /** Checks if the image data is in LDR format. */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /** Gets the bits per channel of the image data. */
  public get bitsPerChannel(): number {
    return 8;
  }

  /**
   * Constructs a new MemoryImageDataUint8 instance.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Uint8Array} [data] - The pixel data of the image.
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
    this._palette = undefined;
    this._data =
      data ?? new Uint8Array(this._width * this._height * this._numChannels);
  }

  /**
   * Creates a new MemoryImageDataUint8 instance with a palette.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {Palette} [palette] - The palette of the image.
   * @returns {MemoryImageDataUint8} A new MemoryImageDataUint8 instance.
   */
  public static palette(
    width: number,
    height: number,
    palette?: Palette
  ): MemoryImageDataUint8 {
    const data = new Uint8Array(width * height);
    const d = new MemoryImageDataUint8(width, height, 1, data);
    d._palette = palette;
    return d;
  }

  /**
   * Creates a new MemoryImageDataUint8 instance from another instance.
   * @param {MemoryImageDataUint8} other - The other MemoryImageDataUint8 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint8} A new MemoryImageDataUint8 instance.
   */
  public static from(
    other: MemoryImageDataUint8,
    skipPixels = false
  ): MemoryImageDataUint8 {
    const data = skipPixels
      ? new Uint8Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint8(
      other.width,
      other.height,
      other._numChannels,
      data
    );
    d._palette = other.palette?.clone();
    return d;
  }

  /**
   * Gets a range of pixels from the image data.
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
      PixelUint8.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color from the specified RGBA values.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} [a] - The alpha component.
   * @returns {Color} A Color instance.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? new ColorRgb8(
          MathUtils.clampInt255(r),
          MathUtils.clampInt255(g),
          MathUtils.clampInt255(b)
        )
      : new ColorRgba8(
          MathUtils.clampInt255(r),
          MathUtils.clampInt255(g),
          MathUtils.clampInt255(b),
          MathUtils.clampInt255(a)
        );
  }

  /**
   * Gets a pixel from the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel instance to reuse.
   * @returns {Pixel} A Pixel instance.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint8) || p.image !== this) {
      p = PixelUint8.imageData(this);
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
   * Sets the red component of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this.rowStride + x * this.numChannels;
    this.data[index] = Math.trunc(r);
  }

  /**
   * Sets the RGB components of a pixel at the specified coordinates.
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
   * Sets the RGBA components of a pixel at the specified coordinates.
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
   * Safely sets the RGB components of a pixel at the specified coordinates.
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
   * Safely sets the RGBA components of a pixel at the specified coordinates.
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
   * Clears the image data with the specified color.
   * @param {Color} [c] - The color to clear with.
   */
  public clear(c?: Color): void {
    const c8 = c?.convert({
      format: Format.uint8,
    });
    if (this._numChannels === 1) {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      this._data.fill(ri);
    } else if (this._numChannels === 2) {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      const gi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.g);
      const rg = (gi << 8) | ri;
      const u16 = new Uint16Array(this._data.buffer);
      u16.fill(rg);
    } else if (this._numChannels === 4) {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      const gi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.g);
      const bi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.b);
      const ai = c8 === undefined ? 0 : MathUtils.clampInt255(c8.a);
      const rgba = (ai << 24) | (bi << 16) | (gi << 8) | ri;
      const u32 = new Uint32Array(this._data.buffer);
      u32.fill(rgba);
    } else {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      const gi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.g);
      const bi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.b);
      // rgb is the slow case since we can't pack the channels
      for (const p of this) {
        p.r = ri;
        p.g = gi;
        p.b = bi;
      }
    }
  }

  /**
   * Clones the image data.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint8} A new MemoryImageDataUint8 instance.
   */
  public clone(skipPixels = false): MemoryImageDataUint8 {
    return MemoryImageDataUint8.from(this, skipPixels);
  }

  /**
   * Converts the image data to a Uint8Array.
   * @returns {Uint8Array} A Uint8Array containing the image data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Gets the bytes of the image data with the specified options.
   * @param {MemoryImageDataGetBytesOptions} [opt] - The options for getting the bytes.
   * @param {string} [opt.format] - The format in which to get the bytes (e.g., 'png', 'jpeg').
   * @param {number} [opt.quality] - The quality of the image data (0 to 100) if applicable.
   * @param {number} [opt.width] - The width to resize the image to before getting the bytes.
   * @param {number} [opt.height] - The height to resize the image to before getting the bytes.
   * @param {string} [opt.colorSpace] - The color space to use (e.g., 'srgb', 'adobe-rgb').
   * @returns {Uint8Array} A Uint8Array containing the image data bytes.
   */
  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  /**
   * Converts the image data to a string representation.
   * @returns {string} A string representation of the image data.
   */
  public toString(): string {
    return `${this.constructor.name} (w: ${this._width}, h: ${this._height}, ch: ${this._numChannels})`;
  }

  /**
   * Gets the iterator for the image data.
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image data.
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelUint8.imageData(this);
  }
}
