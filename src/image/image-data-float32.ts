/** @format */

import { ChannelOrder } from '../color/channel-order';
import { Color } from '../color/color';
import { Format, FormatType } from '../color/format';
import { MemoryImageData } from './image-data';
import { Palette } from './palette';
import { Pixel } from './pixel';
import { PixelFloat32 } from './pixel-float32';
import { PixelRangeIterator } from './pixel-range-iterator';
import { ColorFloat32 } from '../color/color-float32';

export class MemoryImageDataFloat32
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

  private readonly _data: Float32Array;
  public get data(): Float32Array {
    return this._data;
  }

  private readonly _numChannels: number;
  public get numChannels(): number {
    return this._numChannels;
  }

  public get format(): Format {
    return Format.float32;
  }

  public get formatType(): FormatType {
    return FormatType.float;
  }

  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  public get rowStride(): number {
    return this._width * this._numChannels * 4;
  }

  public get iterator(): PixelFloat32 {
    return PixelFloat32.imageData(this);
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
    return 32;
  }

  constructor(
    width: number,
    height: number,
    numChannels: number,
    data?: Float32Array
  ) {
    this._width = width;
    this._height = height;
    this._numChannels = numChannels;
    this._data =
      data ?? new Float32Array(this._width * this._height * this._numChannels);
  }

  public static from(
    other: MemoryImageDataFloat32,
    skipPixels = false
  ): MemoryImageDataFloat32 {
    const data = skipPixels
      ? new Float32Array(other.data.length)
      : other.data.slice();
    return new MemoryImageDataFloat32(
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
      PixelFloat32.imageData(this),
      x,
      y,
      width,
      height
    );
  }

  public getColor(r: number, g: number, b: number, a?: number): Color {
    return a === undefined
      ? ColorFloat32.rgb(r, g, b)
      : ColorFloat32.rgba(r, g, b, a);
  }

  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    let p = pixel;
    if (p === undefined || !(p instanceof PixelFloat32) || p.image !== this) {
      p = PixelFloat32.imageData(this);
    }
    p.setPosition(x, y);
    return p;
  }

  public setPixel(x: number, y: number, p: Color): void {
    this.setPixelRgba(x, y, p.r, p.g, p.b, p.a);
  }

  public setPixelR(x: number, y: number, r: number): void {
    const index = y * this._width * this._numChannels + x * this.numChannels;
    this.data[index] = r;
  }

  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const index = y * this._width * this._numChannels + x * this._numChannels;
    this._data[index] = r;
    if (this._numChannels > 1) {
      this._data[index + 1] = g;
      if (this._numChannels > 2) {
        this._data[index + 2] = b;
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
    this._data[index] = r;
    if (this._numChannels > 1) {
      this._data[index + 1] = g;
      if (this._numChannels > 2) {
        this._data[index + 2] = b;
        if (this._numChannels > 3) {
          this._data[index + 3] = a;
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

  public clone(skipPixels = false): MemoryImageDataFloat32 {
    return MemoryImageDataFloat32.from(this, skipPixels);
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
    return PixelFloat32.imageData(this);
  }
}
