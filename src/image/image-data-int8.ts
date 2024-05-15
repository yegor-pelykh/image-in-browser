/** @format */

import { Color } from '../color/color.js';
import { ColorInt8 } from '../color/color-int8.js';
import { Format, FormatType } from '../color/format.js';
import {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
  getImageDataBytes,
} from './image-data.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';
import { PixelInt8 } from './pixel-int8.js';
import { PixelRangeIterator } from './pixel-range-iterator.js';

export class MemoryImageDataInt8 implements MemoryImageData, Iterable<Pixel> {
  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  private readonly _data: Int8Array;
  public get data(): Int8Array {
    return this._data;
  }

  private readonly _numChannels: number;
  public get numChannels(): number {
    return this._numChannels;
  }

  public get format(): Format {
    return Format.int8;
  }

  public get formatType(): FormatType {
    return FormatType.int;
  }

  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  public get rowStride(): number {
    return this._width * this._numChannels;
  }

  public get iterator(): PixelInt8 {
    return PixelInt8.imageData(this);
  }

  public get byteLength(): number {
    return this._data.byteLength;
  }

  public get length(): number {
    return this._data.byteLength;
  }

  public get maxChannelValue(): number {
    return 0x7f;
  }

  public get maxIndexValue(): number {
    return 0x7f;
  }

  public get hasPalette(): boolean {
    return this.palette !== undefined;
  }

  public get palette(): Palette | undefined {
    return undefined;
  }

  public get isHdrFormat(): boolean {
    return true;
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
    data?: Int8Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Int8Array(this._width * this._height * this._numChannels);
  }

  public static from(
    other: MemoryImageDataInt8,
    skipPixels = false
  ): MemoryImageDataInt8 {
    const data = skipPixels
      ? new Int8Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataInt8(
      other.width,
      other.height,
      other._numChannels,
      data
    );
  }

  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return new PixelRangeIterator(
      PixelInt8.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorInt8.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorInt8.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelInt8) || p.image !== this) {
      p = PixelInt8.imageData(this);
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

  public clear(_c?: Color): void {}

  public clone(skipPixels = false): MemoryImageDataInt8 {
    return MemoryImageDataInt8.from(this, skipPixels);
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  public getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array {
    return getImageDataBytes(this, opt);
  }

  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelInt8.imageData(this);
  }
}
