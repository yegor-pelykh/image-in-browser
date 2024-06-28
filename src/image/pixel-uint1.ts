/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format } from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from './image.js';
import { MemoryImageDataUint1 } from './image-data-uint1.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Represents a pixel with 1-bit color depth.
 * Implements Pixel, Iterable<Pixel>, and Iterator<Pixel>.
 */
export class PixelUint1 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private _index: number;
  private _bitIndex: number;
  private _rowOffset: number;

  private readonly _image: MemoryImageDataUint1;

  /**
   * Gets the image data associated with this pixel.
   */
  public get image(): MemoryImageDataUint1 {
    return this._image;
  }

  private _x: number;

  /**
   * Gets the x-coordinate of the pixel.
   */
  public get x(): number {
    return this._x;
  }

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
    return this.getChannelInternal(0);
  }

  /**
   * Sets the index of the pixel.
   */
  public set index(i: number) {
    this.setChannel(0, i);
  }

  /**
   * Gets the raw data of the image.
   */
  public get data(): Uint8Array {
    return this._image.data;
  }

  /**
   * Checks if the pixel is within the valid range of the image.
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
   * Gets the number of channels in the pixel.
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
   * Gets the maximum value a channel can have.
   */
  public get maxChannelValue(): number {
    return this._image.maxChannelValue;
  }

  /**
   * Gets the maximum value the index can have.
   */
  public get maxIndexValue(): number {
    return this._image.maxIndexValue;
  }

  /**
   * Gets the format of the pixel.
   */
  public get format(): Format {
    return Format.uint1;
  }

  /**
   * Checks if the image format is LDR (Low Dynamic Range).
   */
  public get isLdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  /**
   * Checks if the image format is HDR (High Dynamic Range).
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
   * Gets the palette associated with the image, if any.
   */
  public get palette(): Palette | undefined {
    return this._image.palette;
  }

  /**
   * Gets the red channel value.
   */
  public get r(): number {
    return this.getChannel(0);
  }

  /**
   * Sets the red channel value.
   */
  public set r(r: number) {
    this.setChannel(0, r);
  }

  /**
   * Gets the green channel value.
   */
  public get g(): number {
    return this.getChannel(1);
  }

  /**
   * Sets the green channel value.
   */
  public set g(g: number) {
    this.setChannel(1, g);
  }

  /**
   * Gets the blue channel value.
   */
  public get b(): number {
    return this.getChannel(2);
  }

  /**
   * Sets the blue channel value.
   */
  public set b(b: number) {
    this.setChannel(2, b);
  }

  /**
   * Gets the alpha channel value.
   */
  public get a(): number {
    return this.getChannel(3);
  }

  /**
   * Sets the alpha channel value.
   */
  public set a(a: number) {
    this.setChannel(3, a);
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
   * Gets the length of the image data.
   */
  public get imageLength(): number {
    return this._image.length;
  }

  /**
   * Constructs a new PixelUint1 instance.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} index - The index of the pixel.
   * @param {number} bitIndex - The bit index of the pixel.
   * @param {number} rowOffset - The row offset of the pixel.
   * @param {MemoryImageDataUint1} image - The image data associated with the pixel.
   */
  constructor(
    x: number,
    y: number,
    index: number,
    bitIndex: number,
    rowOffset: number,
    image: MemoryImageDataUint1
  ) {
    this._image = image;
    this._index = index;
    this._bitIndex = bitIndex;
    this._rowOffset = rowOffset;
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a new PixelUint1 instance from image data.
   * @param {MemoryImageDataUint1} image - The image data.
   * @returns {PixelUint1} The new PixelUint1 instance.
   */
  public static imageData(image: MemoryImageDataUint1): PixelUint1 {
    return new PixelUint1(-1, 0, 0, -1, 0, image);
  }

  /**
   * Creates a new PixelUint1 instance from an image.
   * @param {MemoryImage} image - The image.
   * @returns {PixelUint1} The new PixelUint1 instance.
   */
  public static image(image: MemoryImage): PixelUint1 {
    return new PixelUint1(
      -1,
      0,
      0,
      -1,
      0,
      image.data instanceof MemoryImageDataUint1
        ? (image.data as MemoryImageDataUint1)
        : new MemoryImageDataUint1(0, 0, 0)
    );
  }

  /**
   * Creates a new PixelUint1 instance from another PixelUint1 instance.
   * @param {PixelUint1} other - The other PixelUint1 instance.
   * @returns {PixelUint1} The new PixelUint1 instance.
   */
  public static from(other: PixelUint1): PixelUint1 {
    return new PixelUint1(
      other.x,
      other.y,
      other._index,
      other._bitIndex,
      other._rowOffset,
      other.image
    );
  }

  /**
   * Gets the internal channel value.
   * @param {number} channel - The channel index.
   * @returns {number} The internal channel value.
   */
  private getChannelInternal(channel: number): number {
    let i = this._index;
    let bi = 7 - (this._bitIndex + channel);
    if (bi < 0) {
      bi += 8;
      i++;
    }
    if (i >= this._image.data.length) {
      return 0;
    }
    return (this._image.data[i] >>> bi) & 0x1;
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
      this._bitIndex = 0;
      this._index++;
      this._rowOffset += this.image.rowStride;
      return <IteratorResult<Pixel>>{
        done: this._y >= this.height,
        value: this,
      };
    }

    const nc = this.numChannels;
    if (this.palette !== undefined || nc === 1) {
      this._bitIndex++;
      if (this._bitIndex > 7) {
        this._bitIndex = 0;
        this._index++;
      }
    } else {
      const bpp = this.image.numChannels;
      this._bitIndex = (this._x * bpp) & 0x7;
      this._index = this._rowOffset + ((this._x * bpp) >>> 3);
    }
    return <IteratorResult<Pixel>>{
      done: this._index >= this.imageLength,
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
    const bpp = this._image.numChannels;
    this._rowOffset = this._y * this._image.rowStride;
    this._index = this._rowOffset + ((this._x * bpp) >>> 3);
    this._bitIndex = (this._x * bpp) & 0x7;
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
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The value of the specified channel.
   */
  public getChannel(channel: number | Channel): number {
    if (this.palette !== undefined) {
      return this.palette.get(this.getChannelInternal(0), channel);
    } else {
      if (channel === Channel.luminance) {
        return this.luminance;
      } else {
        return channel < this.numChannels
          ? this.getChannelInternal(channel)
          : 0;
      }
    }
  }

  /**
   * Gets the normalized value of a specific channel.
   * @param {Channel} channel - The Channel enum.
   * @returns {number} The normalized value of the specified channel.
   */
  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  /**
   * Sets the value of a specific channel.
   * @param {number} channel - The channel index.
   * @param {number} value - The value to set.
   */
  public setChannel(channel: number, value: number): void {
    if (channel >= this.numChannels) {
      return;
    }

    let i = this._index;
    let bi = 7 - (this._bitIndex + channel);
    if (bi < 0) {
      bi += 8;
      i++;
    }

    let v = this.data[i];

    const vi = MathUtils.clampInt(value, 0, 1);
    const msk = [0xfe, 0xfd, 0xfb, 0xf7, 0xef, 0xdf, 0xbf, 0x7f];
    const mask = msk[bi];
    v = (v & mask) | (vi << bi);
    this.data[i] = v;
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
    const nc = this.image.numChannels;
    if (nc > 0) {
      this.setChannel(0, r);
      if (nc > 1) {
        this.setChannel(1, g);
        if (nc > 2) {
          this.setChannel(2, b);
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
    const nc = this.numChannels;
    if (nc > 0) {
      this.setChannel(0, r);
      if (nc > 1) {
        this.setChannel(1, g);
        if (nc > 2) {
          this.setChannel(2, b);
          if (nc > 3) {
            this.setChannel(3, a);
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
    if (other instanceof PixelUint1) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  /**
   * Clones the pixel.
   * @returns {PixelUint1} The cloned PixelUint1 instance.
   */
  public clone(): PixelUint1 {
    return PixelUint1.from(this);
  }

  /**
   * Converts the pixel to a different color format.
   *
   * @param {ColorConvertOptions} opt - The color conversion options.
   * @param {string} opt.format - The target color format (e.g., 'RGB', 'CMYK').
   * @param {number} opt.numChannels - The number of color channels in the target format.
   * @param {number} opt.alpha - The alpha transparency value in the target format.
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
