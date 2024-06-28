/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 16-bit integer color.
 */
export class ColorInt16 implements Color {
  /**
   * Internal storage for color data.
   */
  private _data: Int16Array;

  /**
   * Gets the format of the color.
   */
  public get format(): Format {
    return Format.int16;
  }

  /**
   * Gets the length of the color data.
   */
  public get length(): number {
    return this._data.length;
  }

  /**
   * Gets the maximum value for a color channel.
   */
  public get maxChannelValue(): number {
    return 0x7fff;
  }

  /**
   * Gets the maximum index value.
   */
  public get maxIndexValue(): number {
    return 0x7fff;
  }

  /**
   * Checks if the format is Low Dynamic Range (LDR).
   */
  public get isLdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the format is High Dynamic Range (HDR).
   */
  public get isHdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the color has a palette.
   */
  public get hasPalette(): boolean {
    return false;
  }

  /**
   * Gets the palette associated with the color.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets or sets the index value.
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
    return this._data.length > 0 ? this._data[0] : 0;
  }
  public set r(r: number) {
    if (this._data.length > 0) {
      this._data[0] = Math.trunc(r);
    }
  }

  /**
   * Gets or sets the green channel value.
   */
  public get g(): number {
    return this._data.length > 1 ? this._data[1] : 0;
  }
  public set g(g: number) {
    if (this._data.length > 1) {
      this._data[1] = Math.trunc(g);
    }
  }

  /**
   * Gets or sets the blue channel value.
   */
  public get b(): number {
    return this._data.length > 2 ? this._data[2] : 0;
  }
  public set b(b: number) {
    if (this._data.length > 2) {
      this._data[2] = Math.trunc(b);
    }
  }

  /**
   * Gets or sets the alpha channel value.
   */
  public get a(): number {
    return this._data.length > 3 ? this._data[3] : 0;
  }
  public set a(a: number) {
    if (this._data.length > 3) {
      this._data[3] = Math.trunc(a);
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
   * Constructs a new ColorInt16 instance.
   * @param {Int16Array | number} data - The initial data for the color.
   */
  constructor(data: Int16Array | number) {
    if (typeof data === 'number') {
      this._data = new Int16Array(data);
    } else {
      this._data = data.slice();
    }
  }

  /**
   * Creates a new ColorInt16 instance from another ColorInt16 instance.
   * @param {ColorInt16} other - The other ColorInt16 instance.
   * @returns {ColorInt16} A new ColorInt16 instance.
   */
  public static from(other: ColorInt16): ColorInt16 {
    const c = new ColorInt16(other.length);
    c._data = other._data;
    return c;
  }

  /**
   * Creates a new ColorInt16 instance from an array of numbers.
   * @param {number[]} color - The array of numbers representing the color.
   * @returns {ColorInt16} A new ColorInt16 instance.
   */
  public static fromArray(color: number[]): ColorInt16 {
    const data = new Int16Array(color);
    return new ColorInt16(data);
  }

  /**
   * Creates a new ColorInt16 instance with RGB values.
   *
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @returns {ColorInt16} A new ColorInt16 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorInt16 {
    const data = new Int16Array([r, g, b]);
    return new ColorInt16(data);
  }

  /**
   * Creates a new ColorInt16 instance with RGBA values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorInt16 {
    const data = new Int16Array([r, g, b, a]);
    return new ColorInt16(data);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} - The value of the specified channel.
   */
  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this._data.length ? this._data[channel] : 0;
    }
  }

  /**
   * Gets the normalized value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} - The normalized value of the specified channel.
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
    if (index < this._data.length) {
      this._data[index] = Math.trunc(value);
    }
  }

  /**
   * Sets the color values from another Color instance.
   * @param {Color} c - The Color instance.
   */
  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

  /**
   * Sets the RGB values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   */
  public setRgb(r: number, g: number, b: number): void {
    this._data[0] = Math.trunc(r);
    const nc = this._data.length;
    if (nc > 1) {
      this._data[1] = Math.trunc(g);
      if (nc > 2) {
        this._data[2] = Math.trunc(b);
      }
    }
  }

  /**
   * Sets the RGBA values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  public setRgba(r: number, g: number, b: number, a: number): void {
    this._data[0] = Math.trunc(r);
    const nc = this._data.length;
    if (nc > 1) {
      this._data[1] = Math.trunc(g);
      if (nc > 2) {
        this._data[2] = Math.trunc(b);
        if (nc > 3) {
          this._data[3] = Math.trunc(a);
        }
      }
    }
  }

  /**
   * Converts the color data to an array of numbers.
   * @returns {number[]} - The array of numbers representing the color.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Creates a clone of the current ColorInt16 instance.
   * @returns {ColorInt16} - A new ColorInt16 instance that is a clone of the current instance.
   */
  public clone(): ColorInt16 {
    return ColorInt16.from(this);
  }

  /**
   * Checks if the current color is equal to another color.
   * @param {Color} other - The other Color instance.
   * @returns {boolean} - True if the colors are equal, false otherwise.
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
   * @param {ColorConvertOptions} [opt] - Optional parameters for the color conversion.
   * @param {string} [opt.format] - The target color format (e.g., 'rgb', 'hex').
   * @param {number} [opt.numChannels] - The number of color channels to include in the conversion.
   * @param {number} [opt.alpha] - The alpha value for the color conversion.
   * @returns {Color} - The converted color.
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
