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
import { PixelUint2 } from './pixel-uint2';
import { PixelRangeIterator } from './pixel-range-iterator';
import { ColorUint2 } from '../color/color-uint2';

export class MemoryImageDataUint2 implements MemoryImageData, Iterable<Pixel> {
  private _pixel?: PixelUint2;

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
    return Format.uint2;
  }

  public get formatType(): FormatType {
    return FormatType.uint;
  }

  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  private _rowStride: number;
  public get rowStride(): number {
    return this._rowStride;
  }

  public get iterator(): PixelUint2 {
    return PixelUint2.imageData(this);
  }

  public get byteLength(): number {
    return this._data.byteLength;
  }

  public get length(): number {
    return this._data.byteLength;
  }

  public get maxChannelValue(): number {
    return this._palette?.maxChannelValue ?? 3;
  }

  public get maxIndexValue(): number {
    return 1;
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
    return 2;
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
    this._rowStride = Math.ceil((this._width * (this._numChannels << 1)) / 8);
    this._palette = undefined;
    this._data =
      data ?? new Uint8Array(Math.max(this._rowStride * this._height, 1));
  }

  public static palette(
    width: number,
    height: number,
    palette?: Palette
  ): MemoryImageDataUint2 {
    const rowStride = Math.ceil(width / 4);
    const data = new Uint8Array(Math.max(rowStride * height, 1));
    const d = new MemoryImageDataUint2(width, height, 1, data);
    d._rowStride = rowStride;
    d._palette = palette;
    return d;
  }

  public static from(
    other: MemoryImageDataUint2,
    skipPixels = false
  ): MemoryImageDataUint2 {
    const data = skipPixels
      ? new Uint8Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint2(
      other.width,
      other.height,
      other._numChannels,
      data
    );
    d._rowStride = other.rowStride;
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
      PixelUint2.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorUint2.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorUint2.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint2) || p.image !== this) {
      p = PixelUint2.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  public setPixelR(x: number, y: number, r: number): void {
    if (this._numChannels < 1) {
      return;
    }
    this._pixel ??= PixelUint2.imageData(this);
    this._pixel.setPosition(x, y);
    this._pixel.index = r;
  }

  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    if (this._numChannels < 1) {
      return;
    }
    this._pixel ??= PixelUint2.imageData(this);
    this._pixel.setPosition(x, y);
    this._pixel.setRgb(r, g, b);
  }

  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    if (this._numChannels < 1) {
      return;
    }
    this._pixel ??= PixelUint2.imageData(this);
    this._pixel.setPosition(x, y);
    this._pixel.setRgba(r, g, b, a);
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

  public clone(skipPixels = false): MemoryImageDataUint2 {
    return MemoryImageDataUint2.from(this, skipPixels);
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
    return PixelUint2.imageData(this);
  }
}
