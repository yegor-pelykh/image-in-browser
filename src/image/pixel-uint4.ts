/** @format */

import { Channel } from '../color/channel';
import { Color, ColorConvertOptions } from '../color/color';
import { ColorUtils } from '../color/color-utils';
import { Format } from '../color/format';
import { ArrayUtils } from '../common/array-utils';
import { MathUtils } from '../common/math-utils';
import { MemoryImage } from './image';
import { MemoryImageDataUint4 } from './image-data-uint4';
import { Palette } from './palette';
import { Pixel } from './pixel';

export class PixelUint4 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private _index: number;
  private _bitIndex: number;

  private readonly _image: MemoryImageDataUint4;
  public get image(): MemoryImageDataUint4 {
    return this._image;
  }

  private _x: number;
  public get x(): number {
    return this._x;
  }

  private _y: number;
  public get y(): number {
    return this._y;
  }

  public get xNormalized(): number {
    return this.width > 1 ? this._x / (this.width - 1) : 0;
  }

  public get yNormalized(): number {
    return this.height > 1 ? this._y / (this.height - 1) : 0;
  }

  public get index(): number {
    return this.getChannelInternal(0);
  }
  public set index(i: number) {
    this.setChannel(0, i);
  }

  public get data(): Uint8Array {
    return this._image.data;
  }

  public get isValid(): boolean {
    return (
      this._x >= 0 &&
      this._x < this._image.width - 1 &&
      this._y >= 0 &&
      this._y < this._image.height - 1
    );
  }

  public get width(): number {
    return this._image.width;
  }

  public get height(): number {
    return this._image.width;
  }

  public get length(): number {
    return this.palette?.numChannels ?? this._image.numChannels;
  }

  public get numChannels(): number {
    return this._image.numChannels;
  }

  public get maxChannelValue(): number {
    return this._image.maxChannelValue;
  }

  public get maxIndexValue(): number {
    return this._image.maxIndexValue;
  }

  public get format(): Format {
    return Format.uint4;
  }

  public get isLdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  public get isHdrFormat(): boolean {
    return this._image.isLdrFormat;
  }

  public get hasPalette(): boolean {
    return this._image.hasPalette;
  }

  public get palette(): Palette | undefined {
    return this._image.palette;
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

  constructor(
    x: number,
    y: number,
    index: number,
    bitIndex: number,
    image: MemoryImageDataUint4
  ) {
    this._image = image;
    this._index = index;
    this._bitIndex = bitIndex;
    this._x = x;
    this._y = y;
  }

  public static imageData(image: MemoryImageDataUint4) {
    return new PixelUint4(-1, 0, 0, -(image.numChannels << 2), image);
  }

  public static image(image: MemoryImage) {
    return new PixelUint4(
      -1,
      0,
      0,
      -(image.numChannels << 2),
      image.data instanceof MemoryImageDataUint4
        ? (image.data as MemoryImageDataUint4)
        : new MemoryImageDataUint4(0, 0, 0)
    );
  }

  public static from(other: PixelUint4) {
    return new PixelUint4(
      other.x,
      other.y,
      other._index,
      other._bitIndex,
      other.image
    );
  }

  private getChannelInternal(channel: number): number {
    let i = this._index;
    let bi = 4 - (this._bitIndex + (channel << 2));
    if (bi < 0) {
      bi += 8;
      i++;
    }
    return (this._image.data[i] >>> bi) & 0xf;
  }

  public next(): IteratorResult<Pixel> {
    this._x++;
    if (this._x === this.width) {
      // skip row stride padding bits
      this._x = 0;
      this._y++;
      this._bitIndex = 0;
      this._index = this._y * this.image.rowStride;
      return <IteratorResult<Pixel>>{
        done: this._y >= this.height,
        value: this,
      };
    }
    const nc = this.image.numChannels;
    if (this.palette !== undefined || nc === 1) {
      this._bitIndex += 4;
      if (this._bitIndex > 7) {
        this._bitIndex = 0;
        this._index++;
      }
    } else {
      const bpp = nc << 2;
      this._bitIndex += bpp;
      while (this._bitIndex > 7) {
        this._bitIndex -= 8;
        this._index++;
      }
    }
    return <IteratorResult<Pixel>>{
      done: this._index >= this.image.data.length,
      value: this,
    };
  }

  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
    const bpp = this.image.numChannels * 4;
    const w = this.image.width;
    const rowStride = this.image.rowStride;
    this._index =
      bpp === 4
        ? this._y * rowStride + (this._x >>> 1)
        : bpp === 8
        ? this._y * w + this._x
        : bpp === 16
        ? this._y * rowStride + (this._x << 1)
        : this._y * rowStride + ((this._x * bpp) >>> 3);
    this._bitIndex = bpp > 7 ? (this._x * bpp) & 0x4 : (this._x * bpp) & 0x7;
  }

  public setPositionNormalized(x: number, y: number): void {
    return this.setPosition(
      Math.floor(x * (this.width - 1)),
      Math.floor(y * (this.height - 1))
    );
  }

  public getChannel(channel: number | Channel): number {
    if (this.palette !== undefined) {
      return this.palette.get(this.getChannelInternal(0), channel);
    } else {
      if (channel === Channel.luminance) {
        return this.luminance;
      } else {
        return channel < this.numChannels
          ? this.getChannelInternal(channel)
          : 0;
      }
    }
  }

  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  public setChannel(channel: number, value: number): void {
    if (channel >= this.image.numChannels) {
      return;
    }

    let i = this._index;
    let bi = 4 - (this._bitIndex + (channel << 2));
    if (bi < 0) {
      bi += 8;
      i++;
    }

    let v = this.data[i];

    const vi = MathUtils.clampInt(value, 0, 15);
    const mask = bi === 4 ? 0x0f : 0xf0;
    v = (v & mask) | (vi << bi);
    this.data[i] = v;
  }

  public set(color: Color): void {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
  }

  public setRgb(r: number, g: number, b: number): void {
    const nc = this.image.numChannels;
    if (nc > 0) {
      this.setChannel(0, r);
      if (nc > 1) {
        this.setChannel(1, g);
        if (nc > 2) {
          this.setChannel(2, b);
        }
      }
    }
  }

  public setRgba(r: number, g: number, b: number, a: number): void {
    const nc = this.image.numChannels;
    if (nc > 0) {
      this.setChannel(0, r);
      if (nc > 1) {
        this.setChannel(1, g);
        if (nc > 2) {
          this.setChannel(2, b);
          if (nc > 3) {
            this.setChannel(3, a);
          }
        }
      }
    }
  }

  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelUint4) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  public clone(): PixelUint4 {
    return PixelUint4.from(this);
  }

  public convert(opt: ColorConvertOptions): Color {
    return ColorUtils.convertColor({
      from: this,
      format: opt.format,
      numChannels: opt.numChannels,
      alpha: opt.alpha,
    });
  }

  public toString(): string {
    return `${this.constructor.name} (${this.toArray()})`;
  }

  public [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }
}
