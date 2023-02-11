/** @format */

import { Format } from '../color/format';
import { Float16 } from '../common/float16';
import { Palette } from './palette';

export class PaletteFloat16 implements Palette {
  private readonly _data: Uint16Array;
  public get data(): Uint16Array {
    return this._data;
  }

  private readonly _numColors: number;
  public get numColors(): number {
    return this._numColors;
  }

  private readonly _numChannels: number;
  public get numChannels(): number {
    return this._numChannels;
  }

  public get byteLength(): number {
    return this.data.byteLength;
  }

  public get buffer(): ArrayBufferLike {
    return this.data.buffer;
  }

  public get format(): Format {
    return Format.float16;
  }

  public get maxChannelValue(): number {
    return 1;
  }

  constructor(numColors: number, numChannels: number, data?: Uint16Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Uint16Array(numColors * numChannels);
  }

  public static from(other: PaletteFloat16) {
    return new PaletteFloat16(other.numColors, other.numChannels, other.data);
  }

  public setRgb(index: number, r: number, g: number, b: number): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Float16.doubleToFloat16(b);
      }
    }
  }

  public setRgba(
    index: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Float16.doubleToFloat16(b);
        if (this._numChannels > 3) {
          this._data[_index + 3] = Float16.doubleToFloat16(a);
        }
      }
    }
  }

  public set(index: number, channel: number, value: number): void {
    let _index = index;
    if (channel < this._numChannels) {
      _index *= this._numChannels;
      this._data[_index + channel] = Float16.doubleToFloat16(value);
    }
  }

  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? Float16.float16ToDouble(this._data[index * this._numChannels + channel])
      : 0;
  }

  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index]);
  }

  public getGreen(index: number): number {
    let _index = index;
    if (this._numChannels < 2) {
      return 0;
    }
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index + 1]);
  }

  public getBlue(index: number): number {
    let _index = index;
    if (this._numChannels < 3) {
      return 0;
    }
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index + 2]);
  }

  public getAlpha(index: number) {
    let _index = index;
    if (this._numChannels < 4) {
      return 255;
    }
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index + 3]);
  }

  public setRed(index: number, value: number): void {
    this.set(index, 0, value);
  }

  public setGreen(index: number, value: number): void {
    this.set(index, 1, value);
  }

  public setBlue(index: number, value: number): void {
    this.set(index, 2, value);
  }

  public setAlpha(index: number, value: number): void {
    this.set(index, 3, value);
  }

  public clone(): PaletteFloat16 {
    return PaletteFloat16.from(this);
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
