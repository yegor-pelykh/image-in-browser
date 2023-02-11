/** @format */

import { Channel } from '../color/channel';
import { Color, ColorConvertOptions } from '../color/color';
import { ColorUtils } from '../color/color-utils';
import { Format } from '../color/format';
import { ArrayUtils } from '../common/array-utils';
import { MathUtils } from '../common/math-utils';
import { MemoryImage } from './image';
import { MemoryImageDataUint1 } from './image-data-uint1';
import { Palette } from './palette';
import { Pixel } from './pixel';

export class PixelUint1 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private _index: number;
  private _bitIndex: number;
  private _rowOffset: number;

  private readonly _image: MemoryImageDataUint1;
  public get image(): MemoryImageDataUint1 {
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
    return Format.uint1;
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

  public get imageLength(): number {
    return this._image.length;
  }

  constructor(
    x: number,
    y: number,
    index: number,
    bitIndex: number,
    rowOffset: number,
    image: MemoryImageDataUint1
  ) {
    this._image = image;
    this._index = index;
    this._bitIndex = bitIndex;
    this._rowOffset = rowOffset;
    this._x = x;
    this._y = y;
  }

  public static imageData(image: MemoryImageDataUint1) {
    return new PixelUint1(-1, 0, 0, -1, 0, image);
  }

  public static image(image: MemoryImage) {
    return new PixelUint1(
      -1,
      0,
      0,
      -1,
      0,
      image.data instanceof MemoryImageDataUint1
        ? (image.data as MemoryImageDataUint1)
        : new MemoryImageDataUint1(0, 0, 0)
    );
  }

  public static from(other: PixelUint1) {
    return new PixelUint1(
      other.x,
      other.y,
      other._index,
      other._bitIndex,
      other._rowOffset,
      other.image
    );
  }

  private getChannelInternal(channel: number): number {
    let i = this._index;
    let bi = 7 - (this._bitIndex + channel);
    if (bi < 0) {
      bi += 8;
      i++;
    }
    if (i >= this._image.data.length) {
      return 0;
    }
    return (this._image.data[i] >> bi) & 0x1;
  }

  public next(): IteratorResult<Pixel> {
    this._x++;
    if (this._x === this.width) {
      this._x = 0;
      this._y++;
      this._bitIndex = 0;
      this._index++;
      this._rowOffset += this.image.rowStride;
      return <IteratorResult<Pixel>>{
        done: this._y >= this.height,
        value: this,
      };
    }

    const nc = this.numChannels;
    if (this.palette !== undefined || nc === 1) {
      this._bitIndex++;
      if (this._bitIndex > 7) {
        this._bitIndex = 0;
        this._index++;
      }
    } else {
      const bpp = this.image.numChannels;
      this._bitIndex = (this._x * bpp) & 0x7;
      this._index = this._rowOffset + ((this._x * bpp) >> 3);
    }
    return <IteratorResult<Pixel>>{
      done: this._index >= this.imageLength,
      value: this,
    };
  }

  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
    const bpp = this._image.numChannels;
    this._rowOffset = this._y * this._image.rowStride;
    this._index = this._rowOffset + ((this._x * bpp) >> 3);
    this._bitIndex = (this._x * bpp) & 0x7;
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
    if (channel >= this.numChannels) {
      return;
    }

    let i = this._index;
    let bi = 7 - (this._bitIndex + channel);
    if (bi < 0) {
      bi += 8;
      i++;
    }

    let v = this.data[i];

    const vi = MathUtils.clampInt(value, 0, 1);
    const msk = [0xfe, 0xfd, 0xfb, 0xf7, 0xef, 0xdf, 0xbf, 0x7f];
    const mask = msk[bi];
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
    const nc = this.numChannels;
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

  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelUint1) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  public clone(): PixelUint1 {
    return PixelUint1.from(this);
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
