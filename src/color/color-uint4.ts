/** @format */

import { ArrayUtils } from '../common/array-utils';
import { MathUtils } from '../common/math-utils';
import { Palette } from '../image/palette';
import { Channel } from './channel';
import { Color, ColorConvertOptions } from './color';
import { ColorUtils } from './color-utils';
import { Format } from './format';

/**
 * A 4-bit unsigned int color with channel values in the range [0, 15].
 */
export class ColorUint4 implements Color {
  private _data: Uint8Array;

  public get format(): Format {
    return Format.uint4;
  }

  private readonly _length: number;
  public get length(): number {
    return this._length;
  }

  public get maxChannelValue(): number {
    return 15;
  }

  public get maxIndexValue(): number {
    return 15;
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

  public static from(other: ColorUint4) {
    const c = new ColorUint4(other._length);
    c._data = other._data;
    return c;
  }

  public static fromArray(color: Uint8Array) {
    return new ColorUint4(color);
  }

  public static rgb(r: number, g: number, b: number) {
    const c = new ColorUint4(3);
    c.setRgb(r, g, b);
    return c;
  }

  public static rgba(r: number, g: number, b: number, a: number) {
    const c = new ColorUint4(4);
    c.setRgba(r, g, b, a);
    return c;
  }

  public getChannel(channel: number | Channel): number {
    return channel < 0 || channel >= this.length
      ? 0
      : channel < 2
      ? (this._data[0] >>> (4 - (channel << 2))) & 0xf
      : (this._data[1] >>> (4 - ((channel & 0x1) << 2))) & 0xf;
  }

  public getChannelNormalized(channel: number | Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

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

  public set(c: Color): void {
    this.setRgba(c.r, c.g, c.b, c.a);
  }

  public setRgb(r: number, g: number, b: number): void {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public setRgba(r: number, g: number, b: number, a: number): void {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  public clone() {
    return ColorUint4.from(this);
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
