/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 2-bit unsigned int color with channel values in the range [0, 3].
 */
export class ColorUint2 implements Color {
  /** Internal data storage for color channels */
  private _data: number;

  /**
   * Gets the format of the color.
   * @returns {Format} The format of the color.
   */
  public get format(): Format {
    return Format.uint2;
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
   * Gets the maximum value a channel can have.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 3;
  }

  /**
   * Gets the maximum index value.
   * @returns {number} The maximum index value.
   */
  public get maxIndexValue(): number {
    return 3;
  }

  /**
   * Checks if the format is Low Dynamic Range (LDR).
   * @returns {boolean} True if the format is LDR, otherwise false.
   */
  public get isLdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the format is High Dynamic Range (HDR).
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
   * @returns {Palette | undefined} The palette of the color, if any.
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
   * Constructs a new ColorUint2 instance.
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
   * Creates a new ColorUint2 instance from another ColorUint2 instance.
   * @param {ColorUint2} other - The other ColorUint2 instance.
   * @returns {ColorUint2} A new ColorUint2 instance.
   */
  public static from(other: ColorUint2): ColorUint2 {
    const c = new ColorUint2(other._length);
    c._data = other._data;
    return c;
  }

  /**
   * Creates a new ColorUint2 instance from an array of numbers.
   * @param {number[]} color - The array of numbers.
   * @returns {ColorUint2} A new ColorUint2 instance.
   */
  public static fromArray(color: number[]): ColorUint2 {
    return new ColorUint2(color);
  }

  /**
   * Creates a new ColorUint2 instance with RGB values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @returns {ColorUint2} A new ColorUint2 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorUint2 {
    return new ColorUint2([r, g, b]);
  }

  /**
   * Creates a new ColorUint2 instance with RGBA values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   * @returns {ColorUint2} A new ColorUint2 instance.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorUint2 {
    return new ColorUint2([r, g, b, a]);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The value of the specified channel.
   */
  public getChannel(channel: number | Channel): number {
    return channel < this.length
      ? (this._data >>> (6 - (channel << 1))) & 0x3
      : 0;
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
    const _index = index;
    if (_index >= this.length) {
      return;
    }

    const _mask = [
      ~(0x3 << (6 - (0 << 1))) & 0xff,
      ~(0x3 << (6 - (1 << 1))) & 0xff,
      ~(0x3 << (6 - (2 << 1))) & 0xff,
      ~(0x3 << (6 - (3 << 1))) & 0xff,
    ];

    const mask = _mask[index];
    const x = Math.trunc(value) & 0x3;
    this._data = (this._data & mask) | (x << (6 - (index << 1)));
  }

  /**
   * Sets the color values from another Color instance.
   * @param {Color} c - The Color instance.
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
   * Converts the color to an array of numbers.
   * @returns {number[]} An array of numbers representing the color.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Clones the current color instance.
   * @returns {ColorUint2} A new ColorUint2 instance.
   */
  public clone(): ColorUint2 {
    return ColorUint2.from(this);
  }

  /**
   * Checks if the current color is equal to another color.
   * @param {Color} other - The other color to compare.
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
   * @param {ColorConvertOptions} [opt] - The conversion options.
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
