/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { MathUtils } from '../common/math-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 4-bit unsigned int color with channel values in the range [0, 15].
 */
export class ColorUint4 implements Color {
  /** Internal data storage for color channels */
  private _data: Uint8Array;

  /** Format of the color */
  public get format(): Format {
    return Format.uint4;
  }

  /** Length of the color data */
  private readonly _length: number;
  /** Length of the color data */
  public get length(): number {
    return this._length;
  }

  /** Maximum value for any channel */
  public get maxChannelValue(): number {
    return 15;
  }

  /** Maximum value for the index */
  public get maxIndexValue(): number {
    return 15;
  }

  /** Indicates if the format is Low Dynamic Range */
  public get isLdrFormat(): boolean {
    return true;
  }

  /** Indicates if the format is High Dynamic Range */
  public get isHdrFormat(): boolean {
    return false;
  }

  /** Indicates if the color has a palette */
  public get hasPalette(): boolean {
    return false;
  }

  /** Palette associated with the color, if any */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Index value of the color */
  public get index(): number {
    return this.r;
  }
  public set index(i: number) {
    this.r = i;
  }

  /** Red channel value */
  public get r(): number {
    return this.getChannel(0);
  }
  public set r(r: number) {
    this.setChannel(0, r);
  }

  /** Green channel value */
  public get g(): number {
    return this.getChannel(1);
  }
  public set g(g: number) {
    this.setChannel(1, g);
  }

  /** Blue channel value */
  public get b(): number {
    return this.getChannel(2);
  }
  public set b(b: number) {
    this.setChannel(2, b);
  }

  /** Alpha channel value */
  public get a(): number {
    return this.getChannel(3);
  }
  public set a(a: number) {
    this.setChannel(3, a);
  }

  /** Normalized red channel value */
  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  /** Normalized green channel value */
  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  /** Normalized blue channel value */
  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  /** Normalized alpha channel value */
  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  /** Luminance of the color */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /** Normalized luminance of the color */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new ColorUint4 instance.
   * @param {Uint8Array | number} data - Either a Uint8Array or a number representing the length of the color data.
   */
  constructor(data: Uint8Array | number) {
    if (typeof data === 'number') {
      this._length = data;
      this._data = new Uint8Array(this.length < 3 ? 1 : 2);
    } else {
      this._length = data.length;
      this._data = new Uint8Array(this._length < 3 ? 1 : 2);
      this.setRgba(
        this._length > 0 ? data[0] : 0,
        this._length > 1 ? data[1] : 0,
        this._length > 2 ? data[2] : 0,
        this._length > 3 ? data[3] : 0
      );
    }
  }

  /**
   * Creates a new ColorUint4 instance from another ColorUint4 instance.
   * @param {ColorUint4} other - The other ColorUint4 instance.
   * @returns {ColorUint4} A new ColorUint4 instance.
   */
  public static from(other: ColorUint4): ColorUint4 {
    const c = new ColorUint4(other._length);
    c._data = other._data;
    return c;
  }

  /**
   * Creates a new ColorUint4 instance from a Uint8Array.
   * @param {Uint8Array} color - The Uint8Array representing the color.
   * @returns {ColorUint4} A new ColorUint4 instance.
   */
  public static fromArray(color: Uint8Array): ColorUint4 {
    return new ColorUint4(color);
  }

  /**
   * Creates a new ColorUint4 instance with RGB values.
   * @param {number} r - Red channel value.
   * @param {number} g - Green channel value.
   * @param {number} b - Blue channel value.
   * @returns {ColorUint4} A new ColorUint4 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorUint4 {
    const c = new ColorUint4(3);
    c.setRgb(r, g, b);
    return c;
  }

  /**
   * Creates a new ColorUint4 instance with RGBA values.
   * @param {number} r - Red channel value.
   * @param {number} g - Green channel value.
   * @param {number} b - Blue channel value.
   * @param {number} a - Alpha channel value.
   * @returns {ColorUint4} A new ColorUint4 instance.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorUint4 {
    const c = new ColorUint4(4);
    c.setRgba(r, g, b, a);
    return c;
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The value of the channel.
   */
  public getChannel(channel: number | Channel): number {
    return channel < 0 || channel >= this.length
      ? 0
      : channel < 2
        ? (this._data[0] >>> (4 - (channel << 2))) & 0xf
        : (this._data[1] >>> (4 - ((channel & 0x1) << 2))) & 0xf;
  }

  /**
   * Gets the normalized value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The normalized value of the channel.
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
    let _index = index;
    if (_index >= this.length) {
      return;
    }
    const vi = MathUtils.clamp(Math.trunc(value), 0, 15);
    let i = 0;
    if (_index > 1) {
      _index &= 0x1;
      i = 1;
    }
    if (_index === 0) {
      this._data[i] = (this._data[i] & 0xf) | (vi << 4);
    } else if (_index === 1) {
      this._data[i] = (this._data[i] & 0xf0) | vi;
    }
  }

  /**
   * Sets the color values from another Color instance.
   * @param {Color} c - The other Color instance.
   */
  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

  /**
   * Sets the RGB values of the color.
   * @param {number} r - Red channel value.
   * @param {number} g - Green channel value.
   * @param {number} b - Blue channel value.
   */
  public setRgb(r: number, g: number, b: number): void {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * Sets the RGBA values of the color.
   * @param {number} r - Red channel value.
   * @param {number} g - Green channel value.
   * @param {number} b - Blue channel value.
   * @param {number} a - Alpha channel value.
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
   * Creates a clone of the current color instance.
   * @returns {ColorUint4} A new ColorUint4 instance that is a clone of the current instance.
   */
  public clone(): ColorUint4 {
    return ColorUint4.from(this);
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
   * @param {ColorConvertOptions} [opt] - Optional parameters for color conversion.
   * @param {string} [opt.format] - The target color format (e.g., 'rgb', 'hex').
   * @param {number} [opt.numChannels] - The number of color channels to include in the conversion.
   * @param {number} [opt.alpha] - The alpha value for the color conversion.
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
