/** @format */

import { Color } from '../color/color';
import { Format, FormatType } from '../color/format';
import {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
  getImageDataBytes,
} from './image-data';
import { Palette } from './palette';
import { Pixel } from './pixel';
import { PixelUint8 } from './pixel-uint8';
import { PixelRangeIterator } from './pixel-range-iterator';
import { ColorRgb8 } from '../color/color-rgb8';
import { ColorRgba8 } from '../color/color-rgba8';
import { MathUtils } from '../common/math-utils';

export class MemoryImageDataUint8 implements MemoryImageData, Iterable<Pixel> {
  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  private readonly _data: Uint8Array;
  public get data(): Uint8Array {
    return this._data;
  }

  private readonly _numChannels: number;
  public get numChannels(): number {
    return this._numChannels;
  }

  public get format(): Format {
    return Format.uint8;
  }

  public get formatType(): FormatType {
    return FormatType.uint;
  }

  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  public get rowStride(): number {
    return this._width * this._numChannels;
  }

  public get iterator(): PixelUint8 {
    return PixelUint8.imageData(this);
  }

  public get byteLength(): number {
    return this._data.byteLength;
  }

  public get length(): number {
    return this._data.byteLength;
  }

  public get maxChannelValue(): number {
    return this._palette?.maxChannelValue ?? 255;
  }

  public get maxIndexValue(): number {
    return 255;
  }

  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  private _palette?: Palette;
  public get palette(): Palette | undefined {
    return this._palette;
  }
  public set palette(p: Palette | undefined) {
    this._palette = p;
  }

  public get isHdrFormat(): boolean {
    return false;
  }

  public get isLdrFormat(): boolean {
    return !this.isHdrFormat;
  }

  public get bitsPerChannel(): number {
    return 8;
  }

  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Uint8Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._palette = undefined;
    this._data =
      data ?? new Uint8Array(this._width * this._height * this._numChannels);
  }

  public static palette(
    width: number,
    height: number,
    palette?: Palette
  ): MemoryImageDataUint8 {
    const data = new Uint8Array(width * height);
    const d = new MemoryImageDataUint8(width, height, 1, data);
    d._palette = palette;
    return d;
  }

  public static from(
    other: MemoryImageDataUint8,
    skipPixels = false
  ): MemoryImageDataUint8 {
    const data = skipPixels
      ? new Uint8Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint8(
      other.width,
      other.height,
      other._numChannels,
      data
    );
    d._palette = other.palette?.clone();
    return d;
  }

  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return new PixelRangeIterator(
      PixelUint8.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? new ColorRgb8(
          MathUtils.clampInt255(r),
          MathUtils.clampInt255(g),
          MathUtils.clampInt255(b)
        )
      : new ColorRgba8(
          MathUtils.clampInt255(r),
          MathUtils.clampInt255(g),
          MathUtils.clampInt255(b),
          MathUtils.clampInt255(a)
        );
  }

  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint8) || p.image !== this) {
      p = PixelUint8.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this.rowStride + x * this.numChannels;
    this.data[index] = Math.trunc(r);
  }

  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this.rowStride + x * this._numChannels;
    this._data[index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Math.trunc(b);
      }
    }
  }

  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    const index = y * this.rowStride + x * this._numChannels;
    this._data[index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Math.trunc(b);
        if (this._numChannels > 3) {
          this._data[index + 3] = Math.trunc(a);
        }
      }
    }
  }

  public setPixelRgbSafe(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.setPixelRgb(x, y, r, g, b);
  }

  public setPixelRgbaSafe(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.setPixelRgba(x, y, r, g, b, a);
  }

  public clear(c?: Color): void {
    const c8 = c?.convert({
      format: Format.uint8,
    });
    if (this._numChannels === 1) {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      this._data.fill(ri);
    } else if (this._numChannels === 2) {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      const gi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.g);
      const rg = (gi << 8) | ri;
      const u16 = new Uint16Array(this._data.buffer);
      u16.fill(rg);
    } else if (this._numChannels === 4) {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      const gi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.g);
      const bi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.b);
      const ai = c8 === undefined ? 0 : MathUtils.clampInt255(c8.a);
      const rgba = (ai << 24) | (bi << 16) | (gi << 8) | ri;
      const u32 = new Uint32Array(this._data.buffer);
      u32.fill(rgba);
    } else {
      const ri = c8 === undefined ? 0 : MathUtils.clampInt255(c8.r);
      const gi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.g);
      const bi = c8 === undefined ? 0 : MathUtils.clampInt255(c8.b);
      // rgb is the slow case since we can't pack the channels
      for (const p of this) {
        p.r = ri;
        p.g = gi;
        p.b = bi;
      }
    }
  }

  public clone(skipPixels = false): MemoryImageDataUint8 {
    return MemoryImageDataUint8.from(this, skipPixels);
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  public toString(): string {
    return `${this.constructor.name} (w: ${this._width}, h: ${this._height}, ch: ${this._numChannels})`;
  }

  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelUint8.imageData(this);
  }
}
