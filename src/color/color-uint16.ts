/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 16-bit unsigned int color with channel values in the range [0, 65535].
 */
export class ColorUint16 implements Color {
  /**
   * The underlying data array storing the color channels.
   */
  protected data: Uint16Array;

  /**
   * Gets the format of the color.
   * @returns {Format} The format of the color.
   */
  public get format(): Format {
    return Format.uint16;
  }

  /**
   * Gets the number of channels in the color.
   * @returns {number} The number of channels.
   */
  public get length(): number {
    return this.data.length;
  }

  /**
   * Gets the maximum value a channel can have.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 0xffff;
  }

  /**
   * Gets the maximum index value.
   * @returns {number} The maximum index value.
   */
  public get maxIndexValue(): number {
    return 0xffff;
  }

  /**
   * Checks if the format is a low dynamic range format.
   * @returns {boolean} True if it is an LDR format, false otherwise.
   */
  public get isLdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the format is a high dynamic range format.
   * @returns {boolean} True if it is an HDR format, false otherwise.
   */
  public get isHdrFormat(): boolean {
    return true;
  }

  /**
   * Checks if the color has a palette.
   * @returns {boolean} True if it has a palette, false otherwise.
   */
  public get hasPalette(): boolean {
    return false;
  }

  /**
   * Gets the palette associated with the color.
   * @returns {Palette | undefined} The palette or undefined if none exists.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets the index value.
   * @returns {number} The index value.
   */
  public get index(): number {
    return this.r;
  }

  /**
   * Sets the index value.
   * @param {number} i - The index value to set.
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
   * @returns {number} The luminance value.
   */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /**
   * Gets the normalized luminance of the color.
   * @returns {number} The normalized luminance value.
   */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new ColorUint16 instance.
   * @param {Uint16Array | number} data - The data array or the number of channels.
   */
  constructor(data: Uint16Array | number) {
    if (typeof data === 'number') {
      this.data = new Uint16Array(data);
    } else {
      this.data = data.slice();
    }
  }

  /**
   * Creates a new ColorUint16 instance from another ColorUint16 instance.
   * @param {ColorUint16} other - The other ColorUint16 instance.
   * @returns {ColorUint16} The new ColorUint16 instance.
   */
  public static from(other: ColorUint16): ColorUint16 {
    const c = new ColorUint16(other.length);
    c.data = other.data;
    return c;
  }

  /**
   * Creates a new ColorUint16 instance from an array.
   * @param {Uint16Array} color - The color array.
   * @returns {ColorUint16} The new ColorUint16 instance.
   */
  public static fromArray(color: Uint16Array): ColorUint16 {
    return new ColorUint16(color);
  }

  /**
   * Creates a new ColorUint16 instance with RGB channels.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @returns {ColorUint16} The new ColorUint16 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorUint16 {
    const data = new Uint16Array([r, g, b]);
    return new ColorUint16(data);
  }

  /**
   * Creates a new ColorUint16 instance with RGBA channels.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   * @returns {ColorUint16} The new ColorUint16 instance.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorUint16 {
    const data = new Uint16Array([r, g, b, a]);
    return new ColorUint16(data);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @returns {number} The channel value.
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
   * @returns {number} The normalized channel value.
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
      this.data[index] = Math.trunc(value);
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
    this.data[0] = Math.trunc(r);
    const nc = this.data.length;
    if (nc > 1) {
      this.data[1] = Math.trunc(g);
      if (nc > 2) {
        this.data[2] = Math.trunc(b);
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
    this.data[0] = Math.trunc(r);
    const nc = this.data.length;
    if (nc > 1) {
      this.data[1] = Math.trunc(g);
      if (nc > 2) {
        this.data[2] = Math.trunc(b);
        if (nc > 3) {
          this.data[3] = Math.trunc(a);
        }
      }
    }
  }

  /**
   * Converts the color to an array.
   * @returns {number[]} The color as an array.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Clones the current color instance.
   * @returns {ColorUint16} The cloned color instance.
   */
  public clone(): ColorUint16 {
    return ColorUint16.from(this);
  }

  /**
   * Checks if the current color is equal to another color.
   * @param {Color} other - The other color to compare.
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
