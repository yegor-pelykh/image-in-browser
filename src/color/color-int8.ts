/** @format */

import { ArrayUtils } from '../common/array-utils';
import { Palette } from '../image/palette';
import { Channel } from './channel';
import { Color, ColorConvertOptions } from './color';
import { ColorUtils } from './color-utils';
import { Format } from './format';

/**
 * A 8-bit integer color.
 */
export class ColorInt8 implements Color {
  private _data: Int8Array;

  public get format(): Format {
    return Format.int8;
  }

  public get length(): number {
    return this._data.length;
  }

  public get maxChannelValue(): number {
    return 127;
  }

  public get maxIndexValue(): number {
    return 127;
  }

  public get isLdrFormat(): boolean {
    return false;
  }

  public get isHdrFormat(): boolean {
    return true;
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
    return this._data.length > 0 ? this._data[0] : 0;
  }
  public set r(r: number) {
    if (this._data.length > 0) {
      this._data[0] = Math.trunc(r);
    }
  }

  public get g(): number {
    return this._data.length > 1 ? this._data[1] : 0;
  }
  public set g(g: number) {
    if (this._data.length > 1) {
      this._data[1] = Math.trunc(g);
    }
  }

  public get b(): number {
    return this._data.length > 2 ? this._data[2] : 0;
  }
  public set b(b: number) {
    if (this._data.length > 2) {
      this._data[2] = Math.trunc(b);
    }
  }

  public get a(): number {
    return this._data.length > 3 ? this._data[3] : 0;
  }
  public set a(a: number) {
    if (this._data.length > 3) {
      this._data[3] = Math.trunc(a);
    }
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

  constructor(data: Int8Array | number) {
    if (typeof data === 'number') {
      this._data = new Int8Array(data);
    } else {
      this._data = data.slice();
    }
  }

  public static from(other: ColorInt8) {
    const c = new ColorInt8(other.length);
    c._data = other._data;
    return c;
  }

  public static fromArray(color: number[]) {
    const data = new Int8Array(color);
    return new ColorInt8(data);
  }

  public static rgb(r: number, g: number, b: number) {
    const data = new Int8Array([r, g, b]);
    return new ColorInt8(data);
  }

  public static rgba(r: number, g: number, b: number, a: number) {
    const data = new Int8Array([r, g, b, a]);
    return new ColorInt8(data);
  }

  public getChannel(channel: number | Channel): number {
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this._data.length ? this._data[channel] : 0;
    }
  }

  public getChannelNormalized(channel: number | Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  public setChannel(index: number | Channel, value: number): void {
    if (index < this._data.length) {
      this._data[index] = Math.trunc(value);
    }
  }

  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

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

  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  public clone() {
    return ColorInt8.from(this);
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

  public convert(opt?: ColorConvertOptions): Color {
    return ColorUtils.convertColor({
      from: this,
      format: opt?.format,
      numChannels: opt?.numChannels,
      alpha: opt?.alpha,
    });
  }
}
