/** @format */

import { Format } from '../color/format';
import { Palette } from './palette';

export class PaletteUint32 implements Palette {
  private readonly _data: Uint32Array;
  public get data(): Uint32Array {
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
    return this._data.byteLength;
  }

  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  public get format(): Format {
    return Format.uint32;
  }

  public get maxChannelValue(): number {
    return 0xffffffff;
  }

  constructor(numColors: number, numChannels: number, data?: Uint32Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Uint32Array(numColors * numChannels);
  }

  public static from(other: PaletteUint32) {
    return new PaletteUint32(other.numColors, other.numChannels, other.data);
  }

  public setRgb(index: number, r: number, g: number, b: number): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Math.trunc(b);
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
    this._data[_index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Math.trunc(b);
        if (this._numChannels > 3) {
          this._data[_index + 3] = Math.trunc(a);
        }
      }
    }
  }

  public set(index: number, channel: number, value: number): void {
    let _index = index;
    if (channel < this._numChannels) {
      _index *= this._numChannels;
      this._data[_index + channel] = Math.trunc(value);
    }
  }

  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? this._data[index * this._numChannels + channel]
      : 0;
  }

  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return this._data[_index];
  }

  public getGreen(index: number): number {
    let _index = index;
    if (this._numChannels < 2) {
      return 0;
    }
    _index *= this._numChannels;
    return this._data[_index + 1];
  }

  public getBlue(index: number): number {
    let _index = index;
    if (this._numChannels < 3) {
      return 0;
    }
    _index *= this._numChannels;
    return this._data[_index + 2];
  }

  public getAlpha(index: number) {
    let _index = index;
    if (this._numChannels < 4) {
      return 0;
    }
    _index *= this._numChannels;
    return this._data[_index + 3];
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

  public clone(): PaletteUint32 {
    return PaletteUint32.from(this);
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
