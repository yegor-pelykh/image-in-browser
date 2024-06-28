/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 64-bit floating point color.
 */
export class ColorFloat64 implements Color {
  /**
   * The underlying data array for the color channels.
   */
  protected data: Float64Array;

  /**
   * Gets the format of the color.
   */
  public get format(): Format {
    return Format.float64;
  }

  /**
   * Gets the number of channels in the color.
   */
  public get length(): number {
    return this.data.length;
  }

  /**
   * Gets the maximum value for any channel.
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
   * Checks if the format is Low Dynamic Range (LDR).
   */
  public get isLdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the format is High Dynamic Range (HDR).
   */
  public get isHdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the color has a palette.
   */
  public get hasPalette(): boolean {
    return false;
  }

  /**
   * Gets the palette associated with the color, if any.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets or sets the index of the color.
   */
  public get index(): number {
    return this.r;
  }
  public set index(i: number) {
    this.r = i;
  }

  /**
   * Gets or sets the red channel value.
   */
  public get r(): number {
    return this.getChannel(0);
  }
  public set r(r: number) {
    this.setChannel(0, r);
  }

  /**
   * Gets or sets the green channel value.
   */
  public get g(): number {
    return this.getChannel(1);
  }
  public set g(g: number) {
    this.setChannel(1, g);
  }

  /**
   * Gets or sets the blue channel value.
   */
  public get b(): number {
    return this.getChannel(2);
  }
  public set b(b: number) {
    this.setChannel(2, b);
  }

  /**
   * Gets or sets the alpha channel value.
   */
  public get a(): number {
    return this.getChannel(3);
  }
  public set a(a: number) {
    this.setChannel(3, a);
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
   * Gets the luminance of the color.
   */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /**
   * Gets the normalized luminance of the color.
   */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new ColorFloat64 instance.
   * @param {Float64Array | number} data - The initial data for the color, either a Float64Array or a number.
   */
  constructor(data: Float64Array | number) {
    if (typeof data === 'number') {
      this.data = new Float64Array(data);
    } else {
      this.data = data.slice();
    }
  }

  /**
   * Creates a new ColorFloat64 instance from another ColorFloat64 instance.
   *
   * @param {ColorFloat64} other - The other ColorFloat64 instance to copy.
   * @returns {ColorFloat64} A new ColorFloat64 instance.
   */
  public static from(other: ColorFloat64): ColorFloat64 {
    const c = new ColorFloat64(other.length);
    c.data = other.data;
    return c;
  }

  /**
   * Creates a new ColorFloat64 instance from a Float64Array.
   *
   * @param {Float64Array} color - The Float64Array to use for the color data.
   * @returns {ColorFloat64} A new instance of ColorFloat64.
   */
  public static fromArray(color: Float64Array): ColorFloat64 {
    return new ColorFloat64(color);
  }

  /**
   * Creates a new ColorFloat64 instance with RGB values.
   *
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @returns {ColorFloat64} A new instance of ColorFloat64 with the specified RGB values.
   */
  public static rgb(r: number, g: number, b: number): ColorFloat64 {
    const data = new Float64Array([r, g, b]);
    return new ColorFloat64(data);
  }

  /**
   * Creates a new ColorFloat64 instance with RGBA values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  public static rgba(r: number, g: number, b: number, a: number) {
    const data = new Float64Array([r, g, b, a]);
    return new ColorFloat64(data);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The value of the specified channel.
   */
  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this.data.length ? this.data[channel] : 0;
    }
  }

  /**
   * Gets the normalized value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The normalized value of the specified channel.
   */
  public getChannelNormalized(channel: number | Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  /**
   * Sets the value of a specific channel.
   * @param {number | Channel} index - The channel index or Channel enum.
   * @param {number} value - The value to set.
   */
  public setChannel(index: number | Channel, value: number): void {
    if (index < this.data.length) {
      this.data[index] = value;
    }
  }

  /**
   * Sets the color values from another Color instance.
   * @param {Color} c - The Color instance to copy values from.
   */
  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

  /**
   * Sets the RGB values of the color.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   */
  public setRgb(r: number, g: number, b: number): void {
    this.data[0] = r;
    const nc = this.data.length;
    if (nc > 1) {
      this.data[1] = g;
      if (nc > 2) {
        this.data[2] = b;
      }
    }
  }

  /**
   * Sets the RGBA values of the color.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  public setRgba(r: number, g: number, b: number, a: number): void {
    this.data[0] = r;
    const nc = this.data.length;
    if (nc > 1) {
      this.data[1] = g;
      if (nc > 2) {
        this.data[2] = b;
        if (nc > 3) {
          this.data[3] = a;
        }
      }
    }
  }

  /**
   * Converts the color to an array of numbers.
   * @returns {number[]} The color as an array of numbers.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Creates a clone of the current color.
   *
   * @returns {ColorFloat64} A new ColorFloat64 instance that is a clone of the current instance.
   */
  public clone(): ColorFloat64 {
    return ColorFloat64.from(this);
  }

  /**
   * Checks if the current color is equal to another color.
   * @param {Color} other - The other color to compare with.
   * @returns {boolean} True if the colors are equal, false otherwise.
   */
  public equals(other: Color): boolean {
    if (other.length !== this.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (other.getChannel(i) !== this.getChannel(i)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Converts the current color instance to a different format based on the provided options.
   *
   * @param {ColorConvertOptions} [opt] - Optional parameter that specifies the conversion options.
   * @param {string} [opt.format] - The target color format.
   * @param {number} [opt.numChannels] - The number of color channels.
   * @param {number} [opt.alpha] - The alpha value for the color.
   * @returns {Color} The converted color.
   */
  public convert(opt?: ColorConvertOptions): Color {
    return ColorUtils.convertColor({
      from: this,
      format: opt?.format,
      numChannels: opt?.numChannels,
      alpha: opt?.alpha,
    });
  }
}
