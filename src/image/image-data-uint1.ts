/** @format */

import { ChannelOrder } from '../color/channel-order';
import { Color } from '../color/color';
import { Format, FormatType } from '../color/format';
import { MemoryImageData } from './image-data';
import { Palette } from './palette';
import { Pixel } from './pixel';
import { PixelUint1 } from './pixel-uint1';
import { PixelRangeIterator } from './pixel-range-iterator';
import { ColorUint1 } from '../color/color-uint1';

export class MemoryImageDataUint1 implements MemoryImageData, Iterable<Pixel> {
  private pixel?: PixelUint1;

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
    return Format.uint1;
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

  public get iterator(): PixelUint1 {
    return PixelUint1.imageData(this);
  }

  public get byteLength(): number {
    return this._data.byteLength;
  }

  public get length(): number {
    return this._data.byteLength;
  }

  public get maxChannelValue(): number {
    return this._palette?.maxChannelValue ?? 1;
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
    return 1;
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
    this._rowStride = Math.ceil((this._width * this._numChannels) / 8);
    this._palette = undefined;
    this._data =
      data ?? new Uint8Array(Math.max(this._rowStride * this._height, 1));
  }

  public static palette(
    width: number,
    height: number,
    palette?: Palette
  ): MemoryImageDataUint1 {
    const rowStride = Math.ceil(width / 8);
    const data = new Uint8Array(Math.max(rowStride * height, 1));
    const d = new MemoryImageDataUint1(width, height, 1, data);
    d._rowStride = rowStride;
    d._palette = palette;
    return d;
  }

  public static from(
    other: MemoryImageDataUint1,
    skipPixels = false
  ): MemoryImageDataUint1 {
    const data = skipPixels
      ? new Uint8Array(other.data.length)
      : other.data.slice();
    const d = new MemoryImageDataUint1(
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
      PixelUint1.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorUint1.rgb(Math.trunc(r), Math.trunc(g), Math.trunc(b))
      : ColorUint1.rgba(
          Math.trunc(r),
          Math.trunc(g),
          Math.trunc(b),
          Math.trunc(a)
        );
  }

  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelUint1) || p.image !== this) {
      p = PixelUint1.imageData(this);
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
    this.pixel ??= PixelUint1.imageData(this);
    this.pixel.setPosition(x, y);
    this.pixel.index = r;
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
    this.pixel ??= PixelUint1.imageData(this);
    this.pixel.setPosition(x, y);
    this.pixel.setRgb(r, g, b);
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
    this.pixel ??= PixelUint1.imageData(this);
    this.pixel.setPosition(x, y);
    this.pixel.setRgba(r, g, b, a);
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

  public clone(skipPixels = false): MemoryImageDataUint1 {
    return MemoryImageDataUint1.from(this, skipPixels);
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  public getBytes(order?: ChannelOrder | undefined): Uint8Array {
    if (order === undefined) {
      return this.toUint8Array();
    }

    if (this.numChannels === 4) {
      if (
        order === ChannelOrder.abgr ||
        order === ChannelOrder.argb ||
        order === ChannelOrder.bgra
      ) {
        const tempImage = this.clone();
        if (order === ChannelOrder.abgr) {
          for (const p of tempImage) {
            const r = p.r;
            const g = p.g;
            const b = p.b;
            const a = p.a;
            p.r = a;
            p.g = b;
            p.b = g;
            p.a = r;
          }
        } else if (order === ChannelOrder.argb) {
          for (const p of tempImage) {
            const r = p.r;
            const g = p.g;
            const b = p.b;
            const a = p.a;
            p.r = a;
            p.g = r;
            p.b = g;
            p.a = b;
          }
        } else if (order === ChannelOrder.bgra) {
          for (const p of tempImage) {
            const r = p.r;
            const g = p.g;
            const b = p.b;
            const a = p.a;
            p.r = b;
            p.g = g;
            p.b = r;
            p.a = a;
          }
        }
        return tempImage.toUint8Array();
      }
    } else if (this.numChannels === 3) {
      if (order === ChannelOrder.bgr) {
        const tempImage = this.clone();
        for (const p of tempImage) {
          const r = p.r;
          p.r = p.b;
          p.b = r;
        }
        return tempImage.toUint8Array();
      }
    }

    return this.toUint8Array();
  }

  public toString(): string {
    return `${this.constructor.name} (w: ${this._width}, h: ${this._height}, ch: ${this._numChannels})`;
  }

  public [Symbol.iterator](): Iterator<Pixel, Pixel, undefined> {
    return PixelUint1.imageData(this);
  }
}
