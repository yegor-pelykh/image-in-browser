/** @format */

import { ArrayUtils } from '../common/array-utils';
import { Palette } from '../image/palette';
import { Channel } from './channel';
import { Color, ColorConvertOptions } from './color';
import { ColorUtils } from './color-utils';
import { Format } from './format';

/**
 * A 64-bit floating point color.
 */
export class ColorFloat64 implements Color {
  protected data: Float64Array;

  public get format(): Format {
    return Format.float64;
  }

  public get length(): number {
    return this.data.length;
  }

  public get maxChannelValue(): number {
    return 1;
  }

  public get maxIndexValue(): number {
    return 1;
  }

  public get isLdrFormat(): boolean {
    return true;
  }

  public get isHdrFormat(): boolean {
    return false;
  }

  public get hasPalette(): boolean {
    return false;
  }

  public get palette(): Palette | undefined {
    return undefined;
  }

  public get index(): number {
    return this.r;
  }
  public set index(i: number) {
    this.r = i;
  }

  public get r(): number {
    return this.getChannel(0);
  }
  public set r(r: number) {
    this.setChannel(0, r);
  }

  public get g(): number {
    return this.getChannel(1);
  }
  public set g(g: number) {
    this.setChannel(1, g);
  }

  public get b(): number {
    return this.getChannel(2);
  }
  public set b(b: number) {
    this.setChannel(2, b);
  }

  public get a(): number {
    return this.getChannel(3);
  }
  public set a(a: number) {
    this.setChannel(3, a);
  }

  public get rNormalized(): number {
    return this.r / this.maxChannelValue;
  }
  public set rNormalized(v: number) {
    this.r = v * this.maxChannelValue;
  }

  public get gNormalized(): number {
    return this.g / this.maxChannelValue;
  }
  public set gNormalized(v: number) {
    this.g = v * this.maxChannelValue;
  }

  public get bNormalized(): number {
    return this.b / this.maxChannelValue;
  }
  public set bNormalized(v: number) {
    this.b = v * this.maxChannelValue;
  }

  public get aNormalized(): number {
    return this.a / this.maxChannelValue;
  }
  public set aNormalized(v: number) {
    this.a = v * this.maxChannelValue;
  }

  public get luminance(): number {
    return ColorUtils.getLuminance(this);
  }
  public get luminanceNormalized(): number {
    return ColorUtils.getLuminanceNormalized(this);
  }

  constructor(data: Float64Array | number) {
    if (typeof data === 'number') {
      this.data = new Float64Array(data);
    } else {
      this.data = data.slice();
    }
  }

  public static from(other: ColorFloat64) {
    const c = new ColorFloat64(other.length);
    c.data = other.data;
    return c;
  }

  public static fromArray(color: Float64Array) {
    return new ColorFloat64(color);
  }

  public static rgb(r: number, g: number, b: number) {
    const data = new Float64Array([r, g, b]);
    return new ColorFloat64(data);
  }

  public static rgba(r: number, g: number, b: number, a: number) {
    const data = new Float64Array([r, g, b, a]);
    return new ColorFloat64(data);
  }

  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this.data.length ? this.data[channel] : 0;
    }
  }

  public getChannelNormalized(channel: number | Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  public setChannel(index: number | Channel, value: number): void {
    if (index < this.data.length) {
      this.data[index] = value;
    }
  }

  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

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

  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  public clone() {
    return ColorFloat64.from(this);
  }

  public equals(other: Color) {
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

  public convert(opt?: ColorConvertOptions) {
    return ColorUtils.convertColor({
      from: this,
      format: opt?.format,
      numChannels: opt?.numChannels,
      alpha: opt?.alpha,
    });
  }
}
