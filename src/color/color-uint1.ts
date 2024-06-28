/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 1-bit unsigned int color with channel values in the range [0, 1].
 */
export class ColorUint1 implements Color {
  /** Internal data storage for color channels */
  private _data: number;

  /**
   * Gets the format of the color.
   * @returns {Format} The format of the color.
   */
  public get format(): Format {
    return Format.uint1;
  }

  /** The length of the color data */
  private readonly _length: number;

  /**
   * Gets the length of the color data.
   * @returns {number} The length of the color data.
   */
  public get length(): number {
    return this._length;
  }

  /**
   * Gets the maximum channel value.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 1;
  }

  /**
   * Gets the maximum index value.
   * @returns {number} The maximum index value.
   */
  public get maxIndexValue(): number {
    return 1;
  }

  /**
   * Checks if the format is LDR (Low Dynamic Range).
   * @returns {boolean} True if the format is LDR, otherwise false.
   */
  public get isLdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the format is HDR (High Dynamic Range).
   * @returns {boolean} True if the format is HDR, otherwise false.
   */
  public get isHdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the color has a palette.
   * @returns {boolean} True if the color has a palette, otherwise false.
   */
  public get hasPalette(): boolean {
    return false;
  }

  /**
   * Gets the palette of the color.
   * @returns {Palette | undefined} The palette of the color, or undefined if there is no palette.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets the index of the color.
   * @returns {number} The index of the color.
   */
  public get index(): number {
    return this.r;
  }

  /**
   * Sets the index of the color.
   * @param {number} i - The index to set.
   */
  public set index(i: number) {
    this.r = i;
  }

  /**
   * Gets the red channel value.
   * @returns {number} The red channel value.
   */
  public get r(): number {
    return this.getChannel(0);
  }

  /**
   * Sets the red channel value.
   * @param {number} r - The red channel value to set.
   */
  public set r(r: number) {
    this.setChannel(0, r);
  }

  /**
   * Gets the green channel value.
   * @returns {number} The green channel value.
   */
  public get g(): number {
    return this.getChannel(1);
  }

  /**
   * Sets the green channel value.
   * @param {number} g - The green channel value to set.
   */
  public set g(g: number) {
    this.setChannel(1, g);
  }

  /**
   * Gets the blue channel value.
   * @returns {number} The blue channel value.
   */
  public get b(): number {
    return this.getChannel(2);
  }

  /**
   * Sets the blue channel value.
   * @param {number} b - The blue channel value to set.
   */
  public set b(b: number) {
    this.setChannel(2, b);
  }

  /**
   * Gets the alpha channel value.
   * @returns {number} The alpha channel value.
   */
  public get a(): number {
    return this.getChannel(3);
  }

  /**
   * Sets the alpha channel value.
   * @param {number} a - The alpha channel value to set.
   */
  public set a(a: number) {
    this.setChannel(3, a);
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
   * Gets the luminance of the color.
   * @returns {number} The luminance of the color.
   */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /**
   * Gets the normalized luminance of the color.
   * @returns {number} The normalized luminance of the color.
   */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new ColorUint1 instance.
   * @param {number[] | number} data - The initial data for the color.
   */
  constructor(data: number[] | number) {
    if (typeof data === 'number') {
      this._length = data;
      this._data = 0;
    } else {
      this._length = data.length;
      this._data = 0;
      this.setRgba(
        data.length > 0 ? data[0] : 0,
        data.length > 1 ? data[1] : 0,
        data.length > 2 ? data[2] : 0,
        data.length > 3 ? data[3] : 0
      );
    }
  }

  /**
   * Creates a new ColorUint1 instance from another ColorUint1 instance.
   * @param {ColorUint1} other - The other ColorUint1 instance.
   * @returns {ColorUint1} A new ColorUint1 instance.
   */
  public static from(other: ColorUint1): ColorUint1 {
    const c = new ColorUint1(other._length);
    c._data = other._data;
    return c;
  }

  /**
   * Creates a new ColorUint1 instance from an array of color values.
   * @param {number[]} color - The array of color values.
   * @returns {ColorUint1} A new ColorUint1 instance.
   */
  public static fromArray(color: number[]): ColorUint1 {
    return new ColorUint1(color);
  }

  /**
   * Creates a new ColorUint1 instance with RGB values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @returns {ColorUint1} A new ColorUint1 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorUint1 {
    return new ColorUint1([r, g, b]);
  }

  /**
   * Creates a new ColorUint1 instance with RGBA values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   * @returns {ColorUint1} A new ColorUint1 instance.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorUint1 {
    return new ColorUint1([r, g, b, a]);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The value of the specified channel.
   */
  public getChannel(channel: number | Channel): number {
    return channel < this.length ? (this._data >>> (7 - channel)) & 0x1 : 0;
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
   * @param {number} value - The value to set for the specified channel.
   */
  public setChannel(index: number | Channel, value: number): void {
    let _index = index;
    if (_index >= this.length) {
      return;
    }
    _index = 7 - _index;
    let v = this._data;
    if (value !== 0) {
      v |= 1 << _index;
    } else {
      v &= ~((1 << _index) & 0xff);
    }
    this._data = v;
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
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * Sets the RGBA values of the color.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  public setRgba(r: number, g: number, b: number, a: number): void {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Converts the color to an array of channel values.
   * @returns {number[]} An array of channel values.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Creates a clone of the current ColorUint1 instance.
   * @returns {ColorUint1} A new ColorUint1 instance that is a clone of the current instance.
   */
  public clone(): ColorUint1 {
    return ColorUint1.from(this);
  }

  /**
   * Checks if the current color is equal to another color.
   * @param {Color} other - The other color to compare with.
   * @returns {boolean} True if the colors are equal, otherwise false.
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
   * Converts the color to another format.
   * @param {ColorConvertOptions} [opt] - The options for color conversion.
   * @returns {Color} The converted color.
   */
  public convert(opt?: ColorConvertOptions) {
    return ColorUtils.convertColor({
      from: this,
      format: opt?.format,
      numChannels: opt?.numChannels,
      alpha: opt?.alpha,
    });
  }
}
