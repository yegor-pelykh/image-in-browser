/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format } from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MemoryImage } from './image.js';
import { MemoryImageDataFloat32 } from './image-data-float32.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Represents a pixel with float32 data.
 */
export class PixelFloat32 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  /**
   * The index of the pixel.
   */
  private _index: number;

  /**
   * The image data associated with the pixel.
   */
  private readonly _image: MemoryImageDataFloat32;

  /**
   * Gets the image data associated with the pixel.
   */
  public get image(): MemoryImageDataFloat32 {
    return this._image;
  }

  /**
   * The x-coordinate of the pixel.
   */
  private _x: number;

  /**
   * Gets the x-coordinate of the pixel.
   */
  public get x(): number {
    return this._x;
  }

  /**
   * The y-coordinate of the pixel.
   */
  private _y: number;

  /**
   * Gets the y-coordinate of the pixel.
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Gets the normalized x-coordinate of the pixel.
   */
  public get xNormalized(): number {
    return this.width > 1 ? this._x / (this.width - 1) : 0;
  }

  /**
   * Gets the normalized y-coordinate of the pixel.
   */
  public get yNormalized(): number {
    return this.height > 1 ? this._y / (this.height - 1) : 0;
  }

  /**
   * Gets the index of the pixel.
   */
  public get index(): number {
    return this.r;
  }

  /**
   * Sets the index of the pixel.
   */
  public set index(i: number) {
    this.r = i;
  }

  /**
   * Gets the data of the pixel.
   */
  public get data(): Float32Array {
    return this._image.data;
  }

  /**
   * Checks if the pixel is valid.
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
   */
  public get width(): number {
    return this._image.width;
  }

  /**
   * Gets the height of the image.
   */
  public get height(): number {
    return this._image.height;
  }

  /**
   * Gets the length of the pixel data.
   */
  public get length(): number {
    return this._image.numChannels;
  }

  /**
   * Gets the number of channels in the pixel data.
   */
  public get numChannels(): number {
    return this._image.numChannels;
  }

  /**
   * Gets the maximum channel value.
   */
  public get maxChannelValue(): number {
    return this._image.maxChannelValue;
  }

  /**
   * Gets the maximum index value.
   */
  public get maxIndexValue(): number {
    return this._image.maxIndexValue;
  }

  /**
   * Gets the format of the pixel data.
   */
  public get format(): Format {
    return Format.float32;
  }

  /**
   * Checks if the format is LDR.
   */
  public get isLdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the format is HDR.
   */
  public get isHdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the image has a palette.
   */
  public get hasPalette(): boolean {
    return this._image.hasPalette;
  }

  /**
   * Gets the palette of the image.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets the red channel value.
   */
  public get r(): number {
    return this.numChannels > 0 ? this.data[this._index] : 0;
  }

  /**
   * Sets the red channel value.
   */
  public set r(r: number) {
    if (this.numChannels > 0) {
      this.data[this._index] = r;
    }
  }

  /**
   * Gets the green channel value.
   */
  public get g(): number {
    return this.numChannels > 1 ? this.data[this._index + 1] : 0;
  }

  /**
   * Sets the green channel value.
   */
  public set g(g: number) {
    if (this.numChannels > 1) {
      this.data[this._index + 1] = g;
    }
  }

  /**
   * Gets the blue channel value.
   */
  public get b(): number {
    return this.numChannels > 2 ? this.data[this._index + 2] : 0;
  }

  /**
   * Sets the blue channel value.
   */
  public set b(b: number) {
    if (this.numChannels > 2) {
      this.data[this._index + 2] = b;
    }
  }

  /**
   * Gets the alpha channel value.
   */
  public get a(): number {
    return this.numChannels > 3 ? this.data[this._index + 3] : 1;
  }

  /**
   * Sets the alpha channel value.
   */
  public set a(a: number) {
    if (this.numChannels > 3) {
      this.data[this._index + 3] = a;
    }
  }

  /**
   * Gets the normalized red channel value.
   */
  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }

  /**
   * Sets the normalized red channel value.
   */
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  /**
   * Gets the normalized green channel value.
   */
  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }

  /**
   * Sets the normalized green channel value.
   */
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  /**
   * Gets the normalized blue channel value.
   */
  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }

  /**
   * Sets the normalized blue channel value.
   */
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  /**
   * Gets the normalized alpha channel value.
   */
  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }

  /**
   * Sets the normalized alpha channel value.
   */
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  /**
   * Gets the luminance of the pixel.
   */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /**
   * Gets the normalized luminance of the pixel.
   */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new PixelFloat32 instance.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} index - The index of the pixel.
   * @param {MemoryImageDataFloat32} image - The image data associated with the pixel.
   */
  constructor(
    x: number,
    y: number,
    index: number,
    image: MemoryImageDataFloat32
  ) {
    this._image = image;
    this._index = index;
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a new PixelFloat32 instance from image data.
   * @param {MemoryImageDataFloat32} image - The image data.
   * @returns {PixelFloat32} The new PixelFloat32 instance.
   */
  public static imageData(image: MemoryImageDataFloat32): PixelFloat32 {
    return new PixelFloat32(-1, 0, -image.numChannels, image);
  }

  /**
   * Creates a new PixelFloat32 instance from an image.
   * @param {MemoryImage} image - The image.
   * @returns {PixelFloat32} The new PixelFloat32 instance.
   */
  public static image(image: MemoryImage): PixelFloat32 {
    return new PixelFloat32(
      -1,
      0,
      -image.numChannels,
      image.data instanceof MemoryImageDataFloat32
        ? (image.data as MemoryImageDataFloat32)
        : new MemoryImageDataFloat32(0, 0, 0)
    );
  }

  /**
   * Creates a new PixelFloat32 instance from another PixelFloat32 instance.
   * @param {PixelFloat32} other - The other PixelFloat32 instance.
   * @returns {PixelFloat32} The new PixelFloat32 instance.
   */
  public static from(other: PixelFloat32): PixelFloat32 {
    return new PixelFloat32(other.x, other.y, other._index, other.image);
  }

  /**
   * Advances the iterator to the next pixel.
   * @returns {IteratorResult<Pixel>} The result of the iteration.
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
   * @returns {number} The value of the specified channel.
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
   * @returns {number} The normalized value of the specified channel.
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
   * Converts the pixel data to an array.
   * @returns {number[]} The pixel data as an array.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Checks if the pixel is equal to another pixel or array.
   * @param {Pixel | number[]} other - The other pixel or array.
   * @returns {boolean} True if the pixel is equal to the other pixel or array, false otherwise.
   */
  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelFloat32) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  /**
   * Clones the pixel.
   * @returns {PixelFloat32} The cloned pixel.
   */
  public clone(): PixelFloat32 {
    return PixelFloat32.from(this);
  }

  /**
   * Converts the pixel to a color.
   * @param {ColorConvertOptions} opt - The color conversion options.
   * @param {string} opt.format - The format to which the color should be converted (e.g., 'rgb', 'hex').
   * @param {number} opt.numChannels - The number of color channels to use in the conversion.
   * @param {number} opt.alpha - The alpha value for the color, representing its transparency.
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
   * Returns a string representation of the pixel.
   * @returns {string} The string representation of the pixel.
   */
  public toString(): string {
    return `${this.constructor.name} (${this.toArray()})`;
  }

  /**
   * Returns an iterator for the pixel.
   * @returns {Iterator<Pixel>} The iterator for the pixel.
   */
  public [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }
}
