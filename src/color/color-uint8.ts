/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * An 8-bit unsigned int color with channel values in the range [0, 255].
 */
export class ColorUint8 implements Color {
  /** Holds the color data as an array of 8-bit unsigned integers. */
  protected data: Uint8Array;

  /** Gets the format of the color. */
  public get format(): Format {
    return Format.uint8;
  }

  /** Gets the length of the color data array. */
  public get length(): number {
    return this.data.length;
  }

  /** Gets the maximum value a channel can have. */
  public get maxChannelValue(): number {
    return 255;
  }

  /** Gets the maximum value an index can have. */
  public get maxIndexValue(): number {
    return 255;
  }

  /** Checks if the format is Low Dynamic Range (LDR). */
  public get isLdrFormat(): boolean {
    return true;
  }

  /** Checks if the format is High Dynamic Range (HDR). */
  public get isHdrFormat(): boolean {
    return false;
  }

  /** Checks if the color has a palette. */
  public get hasPalette(): boolean {
    return false;
  }

  /** Gets the palette of the color, if any. */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Gets the index value of the color. */
  public get index(): number {
    return this.r;
  }
  /** Sets the index value of the color. */
  public set index(i: number) {
    this.r = i;
  }

  /** Gets the red channel value. */
  public get r(): number {
    return this.getChannel(0);
  }
  /** Sets the red channel value. */
  public set r(r: number) {
    this.setChannel(0, r);
  }

  /** Gets the green channel value. */
  public get g(): number {
    return this.getChannel(1);
  }
  /** Sets the green channel value. */
  public set g(g: number) {
    this.setChannel(1, g);
  }

  /** Gets the blue channel value. */
  public get b(): number {
    return this.getChannel(2);
  }
  /** Sets the blue channel value. */
  public set b(b: number) {
    this.setChannel(2, b);
  }

  /** Gets the alpha channel value. */
  public get a(): number {
    return this.getChannel(3, 255);
  }
  /** Sets the alpha channel value. */
  public set a(a: number) {
    this.setChannel(3, a);
  }

  /** Gets the normalized red channel value. */
  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }
  /** Sets the normalized red channel value. */
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  /** Gets the normalized green channel value. */
  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }
  /** Sets the normalized green channel value. */
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  /** Gets the normalized blue channel value. */
  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }
  /** Sets the normalized blue channel value. */
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  /** Gets the normalized alpha channel value. */
  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }
  /** Sets the normalized alpha channel value. */
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  /** Gets the luminance of the color. */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }
  /** Gets the normalized luminance of the color. */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new ColorUint8 instance.
   * @param {Uint8Array | number} data - The initial data for the color, either as a Uint8Array or a number.
   */
  constructor(data: Uint8Array | number) {
    if (typeof data === 'number') {
      this.data = new Uint8Array(data);
    } else {
      this.data = data.slice();
    }
  }

  /**
   * Creates a new ColorUint8 instance from another ColorUint8 instance.
   * @param {ColorUint8} other - The other ColorUint8 instance to copy.
   * @returns {ColorUint8} A new ColorUint8 instance.
   */
  public static from(other: ColorUint8): ColorUint8 {
    const c = new ColorUint8(other.length);
    c.data = other.data;
    return c;
  }

  /**
   * Creates a new ColorUint8 instance from a Uint8Array.
   * @param {Uint8Array} color - The color data as a Uint8Array.
   * @returns {ColorUint8} A new ColorUint8 instance.
   */
  public static fromArray(color: Uint8Array): ColorUint8 {
    return new ColorUint8(color);
  }

  /**
   * Creates a new ColorUint8 instance with RGB values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @returns {ColorUint8} A new ColorUint8 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorUint8 {
    const data = new Uint8Array([r, g, b]);
    return new ColorUint8(data);
  }

  /**
   * Creates a new ColorUint8 instance with RGBA values.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   * @returns {ColorUint8} A new ColorUint8 instance.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorUint8 {
    const data = new Uint8Array([r, g, b, a]);
    return new ColorUint8(data);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel - The channel index or Channel enum.
   * @param {number} [defValue=0] - The default value if the channel is not present.
   * @returns {number} The value of the channel.
   */
  public getChannel(channel: number | Channel, defValue = 0): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this.data.length ? this.data[channel] : defValue;
    }
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
    if (index < this.data.length) {
      this.data[index] = Math.trunc(value);
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
   * Sets the RGBA values of the color.
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
   * Converts the color data to an array of numbers.
   * @returns {number[]} An array of numbers representing the color data.
   */
  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  /**
   * Creates a clone of the current ColorUint8 instance.
   * @returns {ColorUint8} A new ColorUint8 instance that is a clone of the current instance.
   */
  public clone(): ColorUint8 {
    return ColorUint8.from(this);
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
   * Converts the color to another format.
   * @param {ColorConvertOptions} [opt] - The options for the conversion.
   * @param {string} [opt.format] - The target format.
   * @param {number} [opt.numChannels] - The number of channels in the target format.
   * @param {number} [opt.alpha] - The alpha value in the target format.
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
