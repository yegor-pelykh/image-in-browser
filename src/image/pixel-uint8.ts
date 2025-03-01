/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format } from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from './image.js';
import { MemoryImageDataUint8 } from './image-data-uint8.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Represents a pixel in an 8-bit memory image.
 */
export class PixelUint8 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  /**
   * The index of the pixel in the image data array.
   */
  private _index: number;

  /**
   * The image data associated with this pixel.
   */
  private readonly _image: MemoryImageDataUint8;

  /**
   * Gets the image data associated with this pixel.
   */
  public get image(): MemoryImageDataUint8 {
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
   * Gets or sets the index value of the pixel.
   */
  public get index(): number {
    return this.data[this._index];
  }
  public set index(i: number) {
    this.data[this._index] = MathUtils.clampInt255(i);
  }

  /**
   * Gets the image data array.
   */
  public get data(): Uint8Array {
    return this._image.data;
  }

  /**
   * Checks if the pixel is valid within the image boundaries.
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
   * Gets the number of channels in the image.
   */
  public get length(): number {
    return this.palette?.numChannels ?? this._image.numChannels;
  }

  /**
   * Gets the number of channels in the image.
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
   * Gets the format of the image.
   */
  public get format(): Format {
    return Format.uint8;
  }

  /**
   * Checks if the image is in LDR format.
   */
  public get isLdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the image is in HDR format.
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
   * Gets the palette of the image, if any.
   */
  public get palette(): Palette | undefined {
    return this._image.palette;
  }

  /**
   * Gets or sets the red channel value.
   */
  public get r(): number {
    return this.palette === undefined
      ? this.numChannels > 0
        ? this.data[this._index]
        : 0
      : this.palette.getRed(this.data[this._index]);
  }
  public set r(r: number) {
    if (this.numChannels > 0) {
      this.data[this._index] = MathUtils.clampInt255(r);
    }
  }

  /**
   * Gets or sets the green channel value.
   */
  public get g(): number {
    return this.palette === undefined
      ? this.numChannels === 2
        ? this.data[this._index]
        : this.numChannels > 1
          ? this.data[this._index + 1]
          : 0
      : this.palette.getGreen(this.data[this._index]);
  }
  public set g(g: number) {
    if (this.numChannels === 2) {
      this.data[this._index] = MathUtils.clampInt255(g);
    } else if (this.image.numChannels > 1) {
      this.data[this._index + 1] = MathUtils.clampInt255(g);
    }
  }

  /**
   * Gets or sets the blue channel value.
   */
  public get b(): number {
    return this.palette === undefined
      ? this.numChannels === 2
        ? this.data[this._index]
        : this.numChannels > 2
          ? this.data[this._index + 2]
          : 0
      : this.palette.getBlue(this.data[this._index]);
  }
  public set b(b: number) {
    if (this.numChannels === 2) {
      this.data[this._index] = MathUtils.clampInt255(b);
    } else if (this.image.numChannels > 2) {
      this.data[this._index + 2] = MathUtils.clampInt255(b);
    }
  }

  /**
   * Gets or sets the alpha channel value.
   */
  public get a(): number {
    return this.palette === undefined
      ? this.numChannels === 2
        ? this.data[this._index + 1]
        : this.numChannels > 3
          ? this.data[this._index + 3]
          : 255
      : this.palette.getAlpha(this.data[this._index]);
  }
  public set a(a: number) {
    if (this.numChannels === 2) {
      this.data[this._index + 1] = MathUtils.clampInt255(a);
    } else if (this.image.numChannels > 3) {
      this.data[this._index + 3] = MathUtils.clampInt255(a);
    }
  }

  /**
   * Gets or sets the normalized red channel value.
   */
  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  /**
   * Gets or sets the normalized green channel value.
   */
  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  /**
   * Gets or sets the normalized blue channel value.
   */
  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  /**
   * Gets or sets the normalized alpha channel value.
   */
  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  /**
   * Gets the luminance of the pixel.
   */
  public get luminance(): number {
    return this.numChannels === 2 ? this.r : ColorUtils.getLuminance(this);
  }

  /**
   * Gets the normalized luminance of the pixel.
   */
  public get luminanceNormalized(): number {
    return this.numChannels === 2
      ? this.rNormalized
      : ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new PixelUint8 instance.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} index - The index of the pixel in the image data array.
   * @param {MemoryImageDataUint8} image - The image data associated with this pixel.
   */
  constructor(
    x: number,
    y: number,
    index: number,
    image: MemoryImageDataUint8
  ) {
    this._image = image;
    this._index = index;
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a new PixelUint8 instance for the given image data.
   * @param {MemoryImageDataUint8} image - The image data.
   * @returns {PixelUint8} A new PixelUint8 instance.
   */
  public static imageData(image: MemoryImageDataUint8): PixelUint8 {
    return new PixelUint8(-1, 0, -image.numChannels, image);
  }

  /**
   * Creates a new PixelUint8 instance for the given image.
   * @param {MemoryImage} image - The image.
   * @returns {PixelUint8} A new PixelUint8 instance.
   */
  public static image(image: MemoryImage): PixelUint8 {
    return new PixelUint8(
      -1,
      0,
      -image.numChannels,
      image.data instanceof MemoryImageDataUint8
        ? (image.data as MemoryImageDataUint8)
        : new MemoryImageDataUint8(0, 0, 0)
    );
  }

  /**
   * Creates a new PixelUint8 instance from another PixelUint8 instance.
   * @param {PixelUint8} other - The other PixelUint8 instance.
   * @returns {PixelUint8} A new PixelUint8 instance.
   */
  public static from(other: PixelUint8): PixelUint8 {
    return new PixelUint8(other.x, other.y, other._index, other.image);
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
    this._index += this.palette === undefined ? this.numChannels : 1;
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
   * Gets the value of the specified channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The value of the specified channel.
   */
  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      if (this.palette !== undefined) {
        return this.palette.get(this.data[this._index], channel);
      } else {
        return channel < this.numChannels
          ? this.data[this._index + channel]
          : 0;
      }
    }
  }

  /**
   * Gets the normalized value of the specified channel.
   * @param {Channel} channel - The Channel enum.
   * @returns {number} The normalized value of the specified channel.
   */
  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  /**
   * Sets the value of the specified channel.
   * @param {number} channel - The channel index.
   * @param {number} value - The value to set.
   */
  public setChannel(channel: number, value: number): void {
    if (channel < this.numChannels) {
      this.data[this._index + channel] = MathUtils.clampInt255(value);
    }
  }

  /**
   * Sets the pixel color.
   * @param {Color} color - The color to set.
   */
  public set(color: Color): void {
    if (this._image.hasPalette) {
      this.index = color.index;
    } else {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
      this.a = color.a;
    }
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
   * Checks if the pixel is equal to another pixel or array of numbers.
   * @param {Pixel | number[]} other - The other pixel or array of numbers.
   * @returns {boolean} True if the pixels are equal, false otherwise.
   */
  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelUint8) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  /**
   * Converts the pixel to an array of channel values.
   * @returns {number[]} An array of channel values.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Clones the pixel.
   * @returns {PixelUint8} A new PixelUint8 instance.
   */
  public clone(): PixelUint8 {
    return PixelUint8.from(this);
  }

  /**
   * Converts the pixel to a color.
   * @param {ColorConvertOptions} opt - The color conversion options.
   * @param {string} opt.format - The format to convert the color to (e.g., 'rgb', 'hex').
   * @param {number} opt.numChannels - The number of color channels (e.g., 3 for RGB, 4 for RGBA).
   * @param {number} [opt.alpha] - The alpha value for the color (optional).
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
   * @returns {string} The string representation of the pixel.
   */
  public toString(): string {
    return `${this.constructor.name} (${this.toArray()})`;
  }

  /**
   * Returns the iterator for the pixel.
   * @returns {Iterator<Pixel>} The iterator for the pixel.
   */
  public [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }
}
