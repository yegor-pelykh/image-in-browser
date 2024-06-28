/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format } from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MemoryImage } from './image.js';
import { MemoryImageDataInt16 } from './image-data-int16.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Class representing a Pixel with Int16 data.
 */
export class PixelInt16 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  /**
   * The index of the pixel.
   * @private
   */
  private _index: number;

  /**
   * The image data associated with the pixel.
   * @private
   */
  private readonly _image: MemoryImageDataInt16;

  /**
   * Gets the image data associated with the pixel.
   * @returns {MemoryImageDataInt16} The image data.
   */
  public get image(): MemoryImageDataInt16 {
    return this._image;
  }

  /**
   * The x-coordinate of the pixel.
   * @private
   */
  private _x: number;

  /**
   * Gets the x-coordinate of the pixel.
   * @returns {number} The x-coordinate.
   */
  public get x(): number {
    return this._x;
  }

  /**
   * The y-coordinate of the pixel.
   * @private
   */
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
   * @param {number} i - The index.
   */
  public set index(i: number) {
    this.r = i;
  }

  /**
   * Gets the data of the pixel.
   * @returns {Int16Array} The data.
   */
  public get data(): Int16Array {
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
   * Gets the length of the pixel data.
   * @returns {number} The length.
   */
  public get length(): number {
    return this._image.numChannels;
  }

  /**
   * Gets the number of channels in the pixel data.
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
   * Gets the format of the pixel data.
   * @returns {Format} The format.
   */
  public get format(): Format {
    return Format.int16;
  }

  /**
   * Checks if the format is LDR.
   * @returns {boolean} True if LDR format, otherwise false.
   */
  public get isLdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the format is HDR.
   * @returns {boolean} True if HDR format, otherwise false.
   */
  public get isHdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the image has a palette.
   * @returns {boolean} True if has a palette, otherwise false.
   */
  public get hasPalette(): boolean {
    return this._image.hasPalette;
  }

  /**
   * Gets the palette of the image.
   * @returns {Palette | undefined} The palette.
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
   * @param {number} r - The red channel value.
   */
  public set r(r: number) {
    if (this.numChannels > 0) {
      this.data[this._index] = Math.trunc(r);
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
   * @param {number} g - The green channel value.
   */
  public set g(g: number) {
    if (this.numChannels > 1) {
      this.data[this._index + 1] = Math.trunc(g);
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
   * @param {number} b - The blue channel value.
   */
  public set b(b: number) {
    if (this.numChannels > 2) {
      this.data[this._index + 2] = Math.trunc(b);
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
   * @param {number} a - The alpha channel value.
   */
  public set a(a: number) {
    if (this.numChannels > 3) {
      this.data[this._index + 3] = Math.trunc(a);
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
   * @param {number} v - The normalized red channel value.
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
   * @param {number} v - The normalized green channel value.
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
   * @param {number} v - The normalized blue channel value.
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
   * @param {number} v - The normalized alpha channel value.
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
   * Creates an instance of PixelInt16.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} index - The index.
   * @param {MemoryImageDataInt16} image - The image data.
   */
  constructor(
    x: number,
    y: number,
    index: number,
    image: MemoryImageDataInt16
  ) {
    this._image = image;
    this._index = index;
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a PixelInt16 instance from image data.
   * @param {MemoryImageDataInt16} image - The image data.
   * @returns {PixelInt16} The PixelInt16 instance.
   */
  public static imageData(image: MemoryImageDataInt16): PixelInt16 {
    return new PixelInt16(-1, 0, -image.numChannels, image);
  }

  /**
   * Creates a PixelInt16 instance from an image.
   * @param {MemoryImage} image - The image.
   * @returns {PixelInt16} The PixelInt16 instance.
   */
  public static image(image: MemoryImage): PixelInt16 {
    return new PixelInt16(
      -1,
      0,
      -image.numChannels,
      image.data instanceof MemoryImageDataInt16
        ? (image.data as MemoryImageDataInt16)
        : new MemoryImageDataInt16(0, 0, 0)
    );
  }

  /**
   * Creates a PixelInt16 instance from another PixelInt16 instance.
   * @param {PixelInt16} other - The other PixelInt16 instance.
   * @returns {PixelInt16} The new PixelInt16 instance.
   */
  public static from(other: PixelInt16): PixelInt16 {
    return new PixelInt16(other.x, other.y, other._index, other.image);
  }

  /**
   * Advances the iterator to the next pixel.
   * @returns {IteratorResult<Pixel>} The next pixel.
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
   * @param {number | Channel} channel - The channel.
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
   * @param {Channel} channel - The channel.
   * @returns {number} The normalized channel value.
   */
  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  /**
   * Sets the value of a specific channel.
   * @param {number} channel - The channel.
   * @param {number} value - The value.
   */
  public setChannel(channel: number, value: number): void {
    if (channel < this.numChannels) {
      this.data[this._index + channel] = Math.trunc(value);
    }
  }

  /**
   * Sets the color of the pixel.
   * @param {Color} color - The color.
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
      this.data[this._index] = Math.trunc(r);
      if (this.numChannels > 1) {
        this.data[this._index + 1] = Math.trunc(g);
        if (this.numChannels > 2) {
          this.data[this._index + 2] = Math.trunc(b);
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
      this.data[this._index] = Math.trunc(r);
      if (this.numChannels > 1) {
        this.data[this._index + 1] = Math.trunc(g);
        if (this.numChannels > 2) {
          this.data[this._index + 2] = Math.trunc(b);
          if (this.numChannels > 3) {
            this.data[this._index + 3] = Math.trunc(a);
          }
        }
      }
    }
  }

  /**
   * Converts the pixel data to an array.
   * @returns {number[]} The array of pixel data.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Checks if the pixel is equal to another pixel or array.
   * @param {Pixel | number[]} other - The other pixel or array.
   * @returns {boolean} True if equal, otherwise false.
   */
  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelInt16) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  /**
   * Clones the pixel.
   * @returns {PixelInt16} The cloned pixel.
   */
  public clone(): PixelInt16 {
    return PixelInt16.from(this);
  }

  /**
   * Converts the pixel to a different color format.
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

  /**
   * Returns the iterator for the pixel.
   * @returns {Iterator<Pixel>} The iterator.
   */
  public [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }
}
