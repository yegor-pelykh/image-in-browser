/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { Float16 } from '../common/float16.js';
import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Color, ColorConvertOptions } from './color.js';
import { ColorUtils } from './color-utils.js';
import { Format } from './format.js';

/**
 * A 16-bit floating point color.
 */
export class ColorFloat16 implements Color {
  /** The data array holding the color values */
  protected data: Uint16Array;

  /** Gets the format of the color */
  public get format(): Format {
    return Format.float16;
  }

  /** Gets the length of the data array */
  public get length(): number {
    return this.data.length;
  }

  /** Gets the maximum channel value */
  public get maxChannelValue(): number {
    return 1;
  }

  /** Gets the maximum index value */
  public get maxIndexValue(): number {
    return 1;
  }

  /** Checks if the format is LDR */
  public get isLdrFormat(): boolean {
    return false;
  }

  /** Checks if the format is HDR */
  public get isHdrFormat(): boolean {
    return true;
  }

  /** Checks if the color has a palette */
  public get hasPalette(): boolean {
    return false;
  }

  /** Gets the palette of the color */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /** Gets the index of the color */
  public get index(): number {
    return this.r;
  }
  /** Sets the index of the color */
  public set index(i: number) {
    this.r = i;
  }

  /** Gets the red channel value */
  public get r(): number {
    return this.getChannel(0);
  }
  /** Sets the red channel value */
  public set r(r: number) {
    this.setChannel(0, r);
  }

  /** Gets the green channel value */
  public get g(): number {
    return this.getChannel(1);
  }
  /** Sets the green channel value */
  public set g(g: number) {
    this.setChannel(1, g);
  }

  /** Gets the blue channel value */
  public get b(): number {
    return this.getChannel(2);
  }
  /** Sets the blue channel value */
  public set b(b: number) {
    this.setChannel(2, b);
  }

  /** Gets the alpha channel value */
  public get a(): number {
    return this.getChannel(3);
  }
  /** Sets the alpha channel value */
  public set a(a: number) {
    this.setChannel(3, a);
  }

  /** Gets the normalized red channel value */
  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }
  /** Sets the normalized red channel value */
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  /** Gets the normalized green channel value */
  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }
  /** Sets the normalized green channel value */
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  /** Gets the normalized blue channel value */
  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }
  /** Sets the normalized blue channel value */
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  /** Gets the normalized alpha channel value */
  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }
  /** Sets the normalized alpha channel value */
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  /** Gets the luminance of the color */
  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }

  /** Gets the normalized luminance of the color */
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  /**
   * Constructs a new ColorFloat16 instance.
   * @param {Uint16Array | number} data The data array or number of channels.
   */
  constructor(data: Uint16Array | number) {
    if (typeof data === 'number') {
      this.data = new Uint16Array(data);
    } else {
      this.data = data.slice();
    }
  }

  /**
   * Creates a new ColorFloat16 instance from another instance.
   * @param {ColorFloat16} other The other ColorFloat16 instance.
   * @returns {ColorFloat16} A new ColorFloat16 instance.
   */
  public static from(other: ColorFloat16): ColorFloat16 {
    const c = new ColorFloat16(other.length);
    c.data = other.data;
    return c;
  }

  /**
   * Creates a new ColorFloat16 instance from an array.
   * @param {Uint16Array} color The color array.
   * @returns {ColorFloat16} A new ColorFloat16 instance.
   */
  public static fromArray(color: Uint16Array): ColorFloat16 {
    const c = new ColorFloat16(color);
    const l = color.length;
    for (let i = 0; i < l; ++i) {
      c.data[i] = Float16.doubleToFloat16(color[i]);
    }
    return c;
  }

  /**
   * Creates a new ColorFloat16 instance with RGB values.
   * @param {number} r The red channel value.
   * @param {number} g The green channel value.
   * @param {number} b The blue channel value.
   * @returns {ColorFloat16} A new ColorFloat16 instance.
   */
  public static rgb(r: number, g: number, b: number): ColorFloat16 {
    const data = new Uint16Array([
      Float16.doubleToFloat16(r),
      Float16.doubleToFloat16(g),
      Float16.doubleToFloat16(b),
    ]);
    return new ColorFloat16(data);
  }

  /**
   * Creates a new ColorFloat16 instance with RGBA values.
   * @param {number} r The red channel value.
   * @param {number} g The green channel value.
   * @param {number} b The blue channel value.
   * @param {number} a The alpha channel value.
   * @returns {ColorFloat16} A new ColorFloat16 instance.
   */
  public static rgba(r: number, g: number, b: number, a: number): ColorFloat16 {
    const data = new Uint16Array([
      Float16.doubleToFloat16(r),
      Float16.doubleToFloat16(g),
      Float16.doubleToFloat16(b),
      Float16.doubleToFloat16(a),
    ]);
    return new ColorFloat16(data);
  }

  /**
   * Gets the value of a specific channel.
   * @param {number | Channel} channel The channel index or Channel enum.
   * @returns {number} The channel value.
   */
  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this.data.length
        ? Float16.float16ToDouble(this.data[channel])
        : 0;
    }
  }

  /**
   * Gets the normalized value of a specific channel.
   * @param {number | Channel} channel The channel index or Channel enum.
   * @returns {number} The normalized channel value.
   */
  public getChannelNormalized(channel: number | Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  /**
   * Sets the value of a specific channel.
   * @param {number | Channel} index The channel index or Channel enum.
   * @param {number} value The value to set.
   */
  public setChannel(index: number | Channel, value: number): void {
    if (index < this.data.length) {
      this.data[index] = Float16.doubleToFloat16(value);
    }
  }

  /**
   * Sets the color values from another color.
   * @param {Color} c The other color.
   */
  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

  /**
   * Sets the RGB values of the color.
   * @param {number} r The red channel value.
   * @param {number} g The green channel value.
   * @param {number} b The blue channel value.
   */
  public setRgb(r: number, g: number, b: number): void {
    this.data[0] = Float16.doubleToFloat16(r);
    const nc = this.data.length;
    if (nc > 1) {
      this.data[1] = Float16.doubleToFloat16(g);
      if (nc > 2) {
        this.data[2] = Float16.doubleToFloat16(b);
      }
    }
  }

  /**
   * Sets the RGBA values of the color.
   * @param {number} r The red channel value.
   * @param {number} g The green channel value.
   * @param {number} b The blue channel value.
   * @param {number} a The alpha channel value.
   */
  public setRgba(r: number, g: number, b: number, a: number): void {
    this.data[0] = Float16.doubleToFloat16(r);
    const nc = this.data.length;
    if (nc > 1) {
      this.data[1] = Float16.doubleToFloat16(g);
      if (nc > 2) {
        this.data[2] = Float16.doubleToFloat16(b);
        if (nc > 3) {
          this.data[3] = Float16.doubleToFloat16(a);
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
   * Clones the color.
   * @returns {ColorFloat16} A new ColorFloat16 instance.
   */
  public clone(): ColorFloat16 {
    return ColorFloat16.from(this);
  }

  /**
   * Checks if the color is equal to another color.
   * @param {Color} other The other color.
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
   * @param {ColorConvertOptions} opt The conversion options.
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
