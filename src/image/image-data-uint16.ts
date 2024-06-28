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
import { PixelUint16 } from './pixel-uint16.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorUint16 } from '../color/color-uint16.js';

/**
 * Class representing memory image data with 16-bit unsigned integer channels.
 */
export class MemoryImageDataUint16 implements MemoryImageData, Iterable<Pixel> {
  /**
   * The width of the image.
   */
  private readonly _width: number;

  /**
   * Gets the width of the image.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * The height of the image.
   */
  private readonly _height: number;

  /**
   * Gets the height of the image.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * The image data.
   */
  private readonly _data: Uint16Array;

  /**
   * Gets the image data.
   */
  public get data(): Uint16Array {
    return this._data;
  }

  /**
   * The number of channels in the image.
   */
  private readonly _numChannels: number;

  /**
   * Gets the number of channels in the image.
   */
  public get numChannels(): number {
    return this._numChannels;
  }

  /**
   * Gets the format of the image data.
   */
  public get format(): Format {
    return Format.uint16;
  }

  /**
   * Gets the format type of the image data.
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
   * Gets the row stride of the image data.
   */
  public get rowStride(): number {
    return this._width * this._numChannels * 2;
  }

  /**
   * Gets the iterator for the image data.
   */
  public get iterator(): PixelUint16 {
    return PixelUint16.imageData(this);
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
   * Gets the maximum channel value of the image data.
   */
  public get maxChannelValue(): number {
    return this._palette?.maxChannelValue ?? 0xffff;
  }

  /**
   * Gets the maximum index value of the image data.
   */
  public get maxIndexValue(): number {
    return 0xffff;
  }

  /**
   * Checks if the image data has a palette.
   */
  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  /**
   * The palette of the image data.
   */
  private _palette: Palette | undefined;

  /**
   * Gets the palette of the image data.
   */
  public get palette(): Palette | undefined {
    return this._palette;
  }

  /**
   * Checks if the image data is in HDR format.
   */
  public get isHdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the image data is in LDR format.
   */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /**
   * Gets the bits per channel of the image data.
   */
  public get bitsPerChannel(): number {
    return 16;
  }

  /**
   * Creates an instance of MemoryImageDataUint16.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Uint16Array} [data] - The image data.
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
   * Creates a palette-based MemoryImageDataUint16.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {Palette} [palette] - The palette of the image.
   * @returns {MemoryImageDataUint16} A new MemoryImageDataUint16 instance.
   */
  public static palette(width: number, height: number, palette?: Palette) {
    const data = new Uint16Array(width * height);
    const d = new MemoryImageDataUint16(width, height, 1, data);
    d._palette = palette;
    return d;
  }

  /**
   * Creates a new MemoryImageDataUint16 from another instance.
   * @param {MemoryImageDataUint16} other - The other MemoryImageDataUint16 instance.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint16} A new MemoryImageDataUint16 instance.
   */
  public static from(
    other: MemoryImageDataUint16,
    skipPixels = false
  ): MemoryImageDataUint16 {
    const data = skipPixels
      ? new Uint16Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint16(
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
      PixelUint16.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  /**
   * Gets a color from the image data.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} [a] - The alpha channel value.
   * @returns {Color} A Color instance.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorUint16.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorUint16.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  /**
   * Gets a pixel from the image data.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel instance to reuse.
   * @returns {Pixel} A Pixel instance.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint16) || p.image !== this) {
      p = PixelUint16.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel in the image data.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color} p - The color to set.
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red channel of a pixel in the image data.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this._width * this._numChannels + x * this.numChannels;
    this.data[index] = Math.trunc(r);
  }

  /**
   * Sets the RGB channels of a pixel in the image data.
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
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Math.trunc(b);
      }
    }
  }

  /**
   * Sets the RGBA channels of a pixel in the image data.
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
    const index = y * this._width * this._numChannels + x * this._numChannels;
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
   * Safely sets the RGB channels of a pixel in the image data.
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
   * Safely sets the RGBA channels of a pixel in the image data.
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
   * @param {Color} [_c] - The color to clear with.
   */
  public clear(_c?: Color): void {}

  /**
   * Clones the image data.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataUint16} A new MemoryImageDataUint16 instance.
   */
  public clone(skipPixels = false): MemoryImageDataUint16 {
    return MemoryImageDataUint16.from(this, skipPixels);
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
   * @param {MemoryImageDataGetBytesOptions} [opt] - Options for getting the bytes.
   * @param {number} [opt.width] - The width of the image.
   * @param {number} [opt.height] - The height of the image.
   * @param {string} [opt.format] - The format of the image data.
   * @param {number} [opt.quality] - The quality of the image data.
   * @returns {Uint8Array} A Uint8Array of the image data bytes.
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
    return PixelUint16.imageData(this);
  }
}
