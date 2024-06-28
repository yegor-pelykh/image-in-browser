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
import { PixelFloat32 } from './pixel-float32.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';
import { ColorFloat32 } from '../color/color-float32.js';

/**
 * Class representing a memory image data in Float32 format.
 * Implements MemoryImageData and Iterable interfaces.
 */
export class MemoryImageDataFloat32
  implements MemoryImageData, Iterable<Pixel>
{
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
   * The data of the image in Float32Array format.
   */
  private readonly _data: Float32Array;
  /**
   * Gets the data of the image.
   */
  public get data(): Float32Array {
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
   * Gets the format of the image.
   */
  public get format(): Format {
    return Format.float32;
  }

  /**
   * Gets the format type of the image.
   */
  public get formatType(): FormatType {
    return FormatType.float;
  }

  /**
   * Gets the buffer of the image data.
   */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  /**
   * Gets the row stride of the image.
   */
  public get rowStride(): number {
    return this._width * this._numChannels * 4;
  }

  /**
   * Gets the iterator for the image.
   */
  public get iterator(): PixelFloat32 {
    return PixelFloat32.imageData(this);
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
    return 1;
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
   * Gets the palette of the image.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Checks if the image is in HDR format.
   */
  public get isHdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the image is in LDR format.
   */
  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  /**
   * Gets the bits per channel.
   */
  public get bitsPerChannel(): number {
    return 32;
  }

  /**
   * Creates an instance of MemoryImageDataFloat32.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} numChannels - The number of channels in the image.
   * @param {Float32Array} [data] - The data of the image.
   */
  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Float32Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Float32Array(this._width * this._height * this._numChannels);
  }

  /**
   * Creates a new instance of MemoryImageDataFloat32 from another instance.
   * @param {MemoryImageDataFloat32} other - The other instance of MemoryImageDataFloat32.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataFloat32} A new instance of MemoryImageDataFloat32.
   */
  public static from(
    other: MemoryImageDataFloat32,
    skipPixels = false
  ): MemoryImageDataFloat32 {
    const data = skipPixels
      ? new Float32Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataFloat32(
      other.width,
      other.height,
      other._numChannels,
      data
    );
  }

  /**
   * Gets a range of pixels from the image.
   * @param {number} x - The x-coordinate of the starting point.
   * @param {number} y - The y-coordinate of the starting point.
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
      PixelFloat32.imageData(this),
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
   * @param {number} [a] - The alpha component.
   * @returns {Color} A Color object.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorFloat32.rgb(r, g, b)
      : ColorFloat32.rgba(r, g, b, a);
  }

  /**
   * Gets a pixel from the image at the given coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel object to reuse.
   * @returns {Pixel} A Pixel object.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelFloat32) || p.image !== this) {
      p = PixelFloat32.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  /**
   * Sets a pixel in the image at the given coordinates with the given color.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color} p - The color to set.
   */
  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  /**
   * Sets the red component of a pixel in the image at the given coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component.
   */
  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this._width * this._numChannels + x * this.numChannels;
    this.data[index] = r;
  }

  /**
   * Sets the RGB components of a pixel in the image at the given coordinates.
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
   * Sets the RGBA components of a pixel in the image at the given coordinates.
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
   * Safely sets the RGB components of a pixel in the image at the given coordinates.
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
   * Safely sets the RGBA components of a pixel in the image at the given coordinates.
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
   * Clones the current instance of MemoryImageDataFloat32.
   * @param {boolean} [skipPixels=false] - Whether to skip copying pixel data.
   * @returns {MemoryImageDataFloat32} A new instance of MemoryImageDataFloat32.
   */
  public clone(skipPixels = false): MemoryImageDataFloat32 {
    return MemoryImageDataFloat32.from(this, skipPixels);
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
   * @param {MemoryImageDataGetBytesOptions} [opt] - Options for getting the bytes.
   * @param {string} [opt.format] - The format in which to get the bytes (e.g., 'png', 'jpeg').
   * @param {number} [opt.quality] - The quality of the image data (e.g., 0.8 for 80% quality).
   * @param {number} [opt.width] - The width of the image data to be returned.
   * @param {number} [opt.height] - The height of the image data to be returned.
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
   * Gets the iterator for the image.
   * @returns {Iterator<Pixel, Pixel, undefined>} An iterator for the image.
   */
  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelFloat32.imageData(this);
  }
}
