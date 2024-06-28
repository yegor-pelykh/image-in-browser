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
import { PixelUint1 } from './pixel-uint1.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorUint1 } from '../color/color-uint1.js';

/**
 * Class representing memory image data with 1-bit per pixel.
 */
export class MemoryImageDataUint1 implements MemoryImageData, Iterable<Pixel> {
  /**
   * Optional pixel data.
   */
  private pixel?: PixelUint1;

  /**
   * Image width.
   */
  private readonly _width: number;

  /**
   * Gets the image width.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Image height.
   */
  private readonly _height: number;

  /**
   * Gets the image height.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Image data.
   */
  private readonly _data: Uint8Array;

  /**
   * Gets the image data.
   */
  public get data(): Uint8Array {
    return this._data;
  }

  /**
   * Number of channels in the image.
   */
  private readonly _numChannels: number;

  /**
   * Gets the number of channels in the image.
   */
  public get numChannels(): number {
    return this._numChannels;
  }

  /**
   * Gets the format of the image.
   */
  public get format(): Format {
    return Format.uint1;
  }

  /**
   * Gets the format type of the image.
   */
  public get formatType(): FormatType {
    return FormatType.uint;
  }

  /**
   * Gets the buffer of the image data.
   */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  /**
   * Row stride of the image.
   */
  private _rowStride: number;

  /**
   * Gets the row stride of the image.
   */
  public get rowStride(): number {
    return this._rowStride;
  }

  /**
   * Gets the iterator for the image data.
   */
  public get iterator(): PixelUint1 {
    return PixelUint1.imageData(this);
  }

  /**
   * Gets the byte length of the image data.
   */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /**
   * Gets the length of the image data.
   */
  public get length(): number {
    return this._data.byteLength;
  }

  /**
   * Gets the maximum channel value.
   */
  public get maxChannelValue(): number {
    return this._palette?.maxChannelValue ?? 1;
  }

  /**
   * Gets the maximum index value.
   */
  public get maxIndexValue(): number {
    return 1;
  }

  /**
   * Checks if the image has a palette.
   */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /**
   * Optional palette for the image.
   */
  private _palette?: Palette;

  /**
   * Gets the palette of the image.
   */
  public get palette(): Palette | undefined {
    return this._palette;
  }

  /**
   * Sets the palette of the image.
   */
  public set palette(p: Palette | undefined) {
    this._palette = p;
  }

  /**
   * Checks if the image format is HDR.
   */
  public get isHdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the image format is LDR.
   */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /**
   * Gets the bits per channel.
   */
  public get bitsPerChannel(): number {
    return 1;
  }

  /**
   * Creates an instance of MemoryImageDataUint1.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Uint8Array} [data] - Optional image data.
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
    this._rowStride = Math.ceil((this._width * this._numChannels) / 8);
    this._palette = undefined;
    this._data =
      data ?? new Uint8Array(Math.max(this._rowStride * this._height, 1));
  }

  /**
   * Creates a MemoryImageDataUint1 instance with a palette.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {Palette} [palette] - Optional palette for the image.
   * @returns {MemoryImageDataUint1} A new MemoryImageDataUint1 instance.
   */
  public static palette(
    width: number,
    height: number,
    palette?: Palette
  ): MemoryImageDataUint1 {
    const rowStride = Math.ceil(width / 8);
    const data = new Uint8Array(Math.max(rowStride * height, 1));
    const d = new MemoryImageDataUint1(width, height, 1, data);
    d._rowStride = rowStride;
    d._palette = palette;
    return d;
  }

  /**
   * Creates a MemoryImageDataUint1 instance from another instance.
   * @param {MemoryImageDataUint1} other - The other MemoryImageDataUint1 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint1} A new MemoryImageDataUint1 instance.
   */
  public static from(
    other: MemoryImageDataUint1,
    skipPixels = false
  ): MemoryImageDataUint1 {
    const data = skipPixels
      ? new Uint8Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint1(
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
      PixelUint1.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color from the given RGBA values.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} [a] - The alpha component.
   * @returns {Color} A Color instance.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorUint1.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorUint1.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  /**
   * Gets a pixel at the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {Pixel} [pixel] - Optional pixel instance to reuse.
   * @returns {Pixel} A Pixel instance.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint1) || p.image !== this) {
      p = PixelUint1.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel at the given coordinates with the given color.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {Color} p - The color to set.
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red component of a pixel at the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} r - The red component.
   */
  public setPixelR(x: number, y: number, r: number): void {
    if (this._numChannels < 1) {
      return;
    }
    this.pixel ??= PixelUint1.imageData(this);
    this.pixel.setPosition(x, y);
    this.pixel.index = r;
  }

  /**
   * Sets the RGB components of a pixel at the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
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
    this.pixel ??= PixelUint1.imageData(this);
    this.pixel.setPosition(x, y);
    this.pixel.setRgb(r, g, b);
  }

  /**
   * Sets the RGBA components of a pixel at the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
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
    this.pixel ??= PixelUint1.imageData(this);
    this.pixel.setPosition(x, y);
    this.pixel.setRgba(r, g, b, a);
  }

  /**
   * Safely sets the RGB components of a pixel at the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
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
   * Safely sets the RGBA components of a pixel at the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
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
   * Clears the image data.
   * @param {Color} [_c] - Optional color to clear with.
   */
  public clear(_c?: Color): void {}

  /**
   * Clones the current image data.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint1} A new MemoryImageDataUint1 instance.
   */
  public clone(skipPixels = false): MemoryImageDataUint1 {
    return MemoryImageDataUint1.from(this, skipPixels);
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
   * @param {number} [opt.width] - The width of the image.
   * @param {number} [opt.height] - The height of the image.
   * @param {string} [opt.format] - The format of the image data (e.g., 'RGBA', 'RGB').
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
    return PixelUint1.imageData(this);
  }
}
