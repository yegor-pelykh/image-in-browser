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
import { PixelFloat16 } from './pixel-float16';
import { PixelRangeIterator } from './pixel-range-iterator';
import { ColorFloat16 } from '../color/color-float16';
import { Float16 } from '../common/float16';

export class MemoryImageDataFloat16
  implements MemoryImageData, Iterable<Pixel>
{
  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  private readonly _data: Uint16Array;
  public get data(): Uint16Array {
    return this._data;
  }

  private readonly _numChannels: number;
  public get numChannels(): number {
    return this._numChannels;
  }

  public get format(): Format {
    return Format.float16;
  }

  public get formatType(): FormatType {
    return FormatType.float;
  }

  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  public get rowStride(): number {
    return this._width * this._numChannels * 2;
  }

  public get iterator(): PixelFloat16 {
    return PixelFloat16.imageData(this);
  }

  public get byteLength(): number {
    return this._data.byteLength;
  }

  public get length(): number {
    return this._data.byteLength;
  }

  public get maxChannelValue(): number {
    return 1;
  }

  public get maxIndexValue(): number {
    return 1;
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
    return 16;
  }

  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Uint16Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Uint16Array(this._width * this._height * this._numChannels);
  }

  public static from(
    other: MemoryImageDataFloat16,
    skipPixels = false
  ): MemoryImageDataFloat16 {
    const data = skipPixels
      ? new Uint16Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataFloat16(
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
      PixelFloat16.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorFloat16.rgb(r, g, b)
      : ColorFloat16.rgba(r, g, b, a);
  }

  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelFloat16) || p.image !== this) {
      p = PixelFloat16.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this._width * this._numChannels + x * this.numChannels;
    this.data[index] = Float16.doubleToFloat16(r);
  }

  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Float16.doubleToFloat16(b);
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
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[index + 2] = Float16.doubleToFloat16(b);
        if (this._numChannels > 3) {
          this._data[index + 3] = Float16.doubleToFloat16(a);
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

  public clone(skipPixels = false): MemoryImageDataFloat16 {
    return MemoryImageDataFloat16.from(this, skipPixels);
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
    return PixelFloat16.imageData(this);
  }
}
