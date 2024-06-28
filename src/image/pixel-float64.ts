/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format } from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MemoryImage } from './image.js';
import { MemoryImageDataFloat64 } from './image-data-float64.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Represents a pixel with 64-bit floating point color channels.
 * Implements Pixel, Iterable<Pixel>, and Iterator<Pixel>.
 */
export class PixelFloat64 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private _index: number;

  private readonly _image: MemoryImageDataFloat64;

  /**
   * Gets the image data associated with this pixel.
   * @returns {MemoryImageDataFloat64} The image data.
   */
  public get image(): MemoryImageDataFloat64 {
    return this._image;
  }

  private _x: number;

  /**
   * Gets the x-coordinate of the pixel.
   * @returns {number} The x-coordinate.
   */
  public get x(): number {
    return this._x;
  }

  private _y: number;

  /**
   * Gets the y-coordinate of the pixel.
   * @returns {number} The y-coordinate.
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Gets the normalized x-coordinate of the pixel.
   * @returns {number} The normalized x-coordinate.
   */
  public get xNormalized(): number {
    return this.width > 1 ? this._x / (this.width - 1) : 0;
  }

  /**
   * Gets the normalized y-coordinate of the pixel.
   * @returns {number} The normalized y-coordinate.
   */
  public get yNormalized(): number {
    return this.height > 1 ? this._y / (this.height - 1) : 0;
  }

  /**
   * Gets the index of the pixel.
   * @returns {number} The index.
   */
  public get index(): number {
    return this.r;
  }

  /**
   * Sets the index of the pixel.
   * @param {number} i - The index to set.
   */
  public set index(i: number) {
    this.r = i;
  }

  /**
   * Gets the raw data of the pixel.
   * @returns {Float64Array} The raw data.
   */
  public get data(): Float64Array {
    return this._image.data;
  }

  /**
   * Checks if the pixel is valid.
   * @returns {boolean} True if valid, otherwise false.
   */
  public get isValid(): boolean {
    return (
      this._x >= 0 &&
      this._x < this._image.width - 1 &&
      this._y >= 0 &&
      this._y < this._image.height - 1
    );
  }

  /**
   * Gets the width of the image.
   * @returns {number} The width.
   */
  public get width(): number {
    return this._image.width;
  }

  /**
   * Gets the height of the image.
   * @returns {number} The height.
   */
  public get height(): number {
    return this._image.height;
  }

  /**
   * Gets the number of channels in the image.
   * @returns {number} The number of channels.
   */
  public get length(): number {
    return this._image.numChannels;
  }

  /**
   * Gets the number of channels in the image.
   * @returns {number} The number of channels.
   */
  public get numChannels(): number {
    return this._image.numChannels;
  }

  /**
   * Gets the maximum channel value.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return this._image.maxChannelValue;
  }

  /**
   * Gets the maximum index value.
   * @returns {number} The maximum index value.
   */
  public get maxIndexValue(): number {
    return this._image.maxIndexValue;
  }

  /**
   * Gets the format of the image.
   * @returns {Format} The format.
   */
  public get format(): Format {
    return Format.float64;
  }

  /**
   * Checks if the image is in LDR format.
   * @returns {boolean} True if in LDR format, otherwise false.
   */
  public get isLdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the image is in HDR format.
   * @returns {boolean} True if in HDR format, otherwise false.
   */
  public get isHdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the image has a palette.
   * @returns {boolean} True if it has a palette, otherwise false.
   */
  public get hasPalette(): boolean {
    return this._image.hasPalette;
  }

  /**
   * Gets the palette of the image.
   * @returns {Palette | undefined} The palette, or undefined if none.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets the red channel value.
   * @returns {number} The red channel value.
   */
  public get r(): number {
    return this.numChannels > 0 ? this.data[this._index] : 0;
  }

  /**
   * Sets the red channel value.
   * @param {number} r - The red channel value to set.
   */
  public set r(r: number) {
    if (this.numChannels > 0) {
      this.data[this._index] = r;
    }
  }

  /**
   * Gets the green channel value.
   * @returns {number} The green channel value.
   */
  public get g(): number {
    return this.numChannels > 1 ? this.data[this._index + 1] : 0;
  }

  /**
   * Sets the green channel value.
   * @param {number} g - The green channel value to set.
   */
  public set g(g: number) {
    if (this.numChannels > 1) {
      this.data[this._index + 1] = g;
    }
  }

  /**
   * Gets the blue channel value.
   * @returns {number} The blue channel value.
   */
  public get b(): number {
    return this.numChannels > 2 ? this.data[this._index + 2] : 0;
  }

  /**
   * Sets the blue channel value.
   * @param {number} b - The blue channel value to set.
   */
  public set b(b: number) {
    if (this.numChannels > 2) {
      this.data[this._index + 2] = b;
    }
  }

  /**
   * Gets the alpha channel value.
   * @returns {number} The alpha channel value.
   */
  public get a(): number {
    return this.numChannels > 3 ? this.data[this._index + 3] : 0;
  }

  /**
   * Sets the alpha channel value.
   * @param {number} a - The alpha channel value to set.
   */
  public set a(a: number) {
    if (this.numChannels > 3) {
      this.data[this._index + 3] = a;
    }
  }

  /**
   * Gets the normalized red channel value.
   * @returns {number} The normalized red channel value.
   */
  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }

  /**
   * Sets the normalized red channel value.
   * @param {number} v - The normalized red channel value to set.
   */
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  /**
   * Gets the normalized green channel value.
   * @returns {number} The normalized green channel value.
   */
  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }

  /**
   * Sets the normalized green channel value.
   * @param {number} v - The normalized green channel value to set.
   */
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  /**
   * Gets the normalized blue channel value.
   * @returns {number} The normalized blue channel value.
   */
  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }

  /**
   * Sets the normalized blue channel value.
   * @param {number} v - The normalized blue channel value to set.
   */
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  /**
   * Gets the normalized alpha channel value.
   * @returns {number} The normalized alpha channel value.
   */
  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }

  /**
   * Sets the normalized alpha channel value.
   * @param {number} v - The normalized alpha channel value to set.
   */
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  /**
   * Gets the luminance of the pixel.
   * @returns {number} The luminance.
   */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /**
   * Gets the normalized luminance of the pixel.
   * @returns {number} The normalized luminance.
   */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new PixelFloat64 instance.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} index - The index.
   * @param {MemoryImageDataFloat64} image - The image data.
   */
  constructor(
    x: number,
    y: number,
    index: number,
    image: MemoryImageDataFloat64
  ) {
    this._image = image;
    this._index = index;
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a new PixelFloat64 instance from image data.
   * @param {MemoryImageDataFloat64} image - The image data.
   * @returns {PixelFloat64} The new PixelFloat64 instance.
   */
  public static imageData(image: MemoryImageDataFloat64): PixelFloat64 {
    return new PixelFloat64(-1, 0, -image.numChannels, image);
  }

  /**
   * Creates a new PixelFloat64 instance from an image.
   * @param {MemoryImage} image - The image.
   * @returns {PixelFloat64} The new PixelFloat64 instance.
   */
  public static image(image: MemoryImage): PixelFloat64 {
    return new PixelFloat64(
      -1,
      0,
      -image.numChannels,
      image.data instanceof MemoryImageDataFloat64
        ? (image.data as MemoryImageDataFloat64)
        : new MemoryImageDataFloat64(0, 0, 0)
    );
  }

  /**
   * Creates a new PixelFloat64 instance from another PixelFloat64 instance.
   * @param {PixelFloat64} other - The other PixelFloat64 instance.
   * @returns {PixelFloat64} The new PixelFloat64 instance.
   */
  public static from(other: PixelFloat64): PixelFloat64 {
    return new PixelFloat64(other.x, other.y, other._index, other.image);
  }

  /**
   * Returns an iterator for the PixelFloat64 instance.
   * @returns {Iterator<Pixel>} The iterator.
   */
  [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }

  /**
   * Advances the iterator and returns the next result.
   * @returns {IteratorResult<Pixel>} The next result.
   */
  public next(): IteratorResult<Pixel> {
    this._x++;
    if (this._x === this.width) {
      this._x = 0;
      this._y++;
      if (this._y === this.height) {
        return <IteratorResult<Pixel>>{
          done: true,
          value: this,
        };
      }
    }
    this._index += this.numChannels;
    return <IteratorResult<Pixel>>{
      done: this._index >= this.image.data.length,
      value: this,
    };
  }

  /**
   * Sets the position of the pixel.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
    this._index =
      this._y * this._image.width * this._image.numChannels +
      this._x * this._image.numChannels;
  }

  /**
   * Sets the normalized position of the pixel.
   * @param {number} x - The normalized x-coordinate.
   * @param {number} y - The normalized y-coordinate.
   */
  public setPositionNormalized(x: number, y: number): void {
    return this.setPosition(
      Math.floor(x * (this.width - 1)),
      Math.floor(y * (this.height - 1))
    );
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel number or type.
   * @returns {number} The channel value.
   */
  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this.numChannels ? this.data[this._index + channel] : 0;
    }
  }

  /**
   * Gets the normalized value of a specific channel.
   * @param {Channel} channel - The channel type.
   * @returns {number} The normalized channel value.
   */
  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  /**
   * Sets the value of a specific channel.
   * @param {number} channel - The channel number.
   * @param {number} value - The value to set.
   */
  public setChannel(channel: number, value: number): void {
    if (channel < this.numChannels) {
      this.data[this._index + channel] = value;
    }
  }

  /**
   * Sets the color of the pixel.
   * @param {Color} color - The color to set.
   */
  public set(color: Color): void {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
  }

  /**
   * Sets the RGB values of the pixel.
   * @param {number} r - The red value.
   * @param {number} g - The green value.
   * @param {number} b - The blue value.
   */
  public setRgb(r: number, g: number, b: number): void {
    if (this.numChannels > 0) {
      this.data[this._index] = r;
      if (this.numChannels > 1) {
        this.data[this._index + 1] = g;
        if (this.numChannels > 2) {
          this.data[this._index + 2] = b;
        }
      }
    }
  }

  /**
   * Sets the RGBA values of the pixel.
   * @param {number} r - The red value.
   * @param {number} g - The green value.
   * @param {number} b - The blue value.
   * @param {number} a - The alpha value.
   */
  public setRgba(r: number, g: number, b: number, a: number): void {
    if (this.numChannels > 0) {
      this.data[this._index] = r;
      if (this.numChannels > 1) {
        this.data[this._index + 1] = g;
        if (this.numChannels > 2) {
          this.data[this._index + 2] = b;
          if (this.numChannels > 3) {
            this.data[this._index + 3] = a;
          }
        }
      }
    }
  }

  /**
   * Converts the pixel to an array of channel values.
   * @returns {number[]} The array of channel values.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Checks if the pixel is equal to another pixel or array of channel values.
   * @param {Pixel | number[]} other - The other pixel or array.
   * @returns {boolean} True if equal, otherwise false.
   */
  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelFloat64) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  /**
   * Clones the pixel.
   * @returns {PixelFloat64} The cloned pixel.
   */
  public clone(): PixelFloat64 {
    return PixelFloat64.from(this);
  }

  /**
   * Converts the pixel to a color.
   * @param {ColorConvertOptions} opt - The conversion options.
   * @returns {Color} The converted color.
   */
  public convert(opt: ColorConvertOptions): Color {
    return ColorUtils.convertColor({
      from: this,
      format: opt.format,
      numChannels: opt.numChannels,
      alpha: opt.alpha,
    });
  }

  /**
   * Converts the pixel to a string representation.
   * @returns {string} The string representation.
   */
  public toString(): string {
    return `${this.constructor.name} (${this.toArray()})`;
  }
}
