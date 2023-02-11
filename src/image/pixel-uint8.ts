/** @format */

import { Channel } from '../color/channel';
import { Color, ColorConvertOptions } from '../color/color';
import { ColorUtils } from '../color/color-utils';
import { Format } from '../color/format';
import { ArrayUtils } from '../common/array-utils';
import { MathUtils } from '../common/math-utils';
import { MemoryImage } from './image';
import { MemoryImageDataUint8 } from './image-data-uint8';
import { Palette } from './palette';
import { Pixel } from './pixel';

export class PixelUint8 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private _index: number;

  private readonly _image: MemoryImageDataUint8;
  public get image(): MemoryImageDataUint8 {
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
    return this.data[this._index];
  }
  public set index(i: number) {
    this.data[this._index] = MathUtils.clampInt255(i);
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
    return Format.uint8;
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
    return this.palette === undefined
      ? this.numChannels > 0
        ? this.data[this._index]
        : 0
      : this.palette.getRed(this.data[this._index]);
  }
  public set r(r: number) {
    if (this.numChannels > 0) {
      this.data[this._index] = MathUtils.clampInt255(r);
    }
  }

  public get g(): number {
    return this.palette === undefined
      ? this.numChannels > 1
        ? this.data[this._index + 1]
        : 0
      : this.palette.getGreen(this.data[this._index]);
  }
  public set g(g: number) {
    if (this.numChannels > 1) {
      this.data[this._index + 1] = MathUtils.clampInt255(g);
    }
  }

  public get b(): number {
    return this.palette === undefined
      ? this.numChannels > 2
        ? this.data[this._index + 2]
        : 0
      : this.palette.getBlue(this.data[this._index]);
  }
  public set b(b: number) {
    if (this.numChannels > 2) {
      this.data[this._index + 2] = MathUtils.clampInt255(b);
    }
  }

  public get a(): number {
    return this.palette === undefined
      ? this.numChannels > 3
        ? this.data[this._index + 3]
        : 255
      : this.palette.getAlpha(this.data[this._index]);
  }
  public set a(a: number) {
    if (this.numChannels > 3) {
      this.data[this._index + 3] = MathUtils.clampInt255(a);
    }
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
    image: MemoryImageDataUint8
  ) {
    this._image = image;
    this._index = index;
    this._x = x;
    this._y = y;
  }

  public static imageData(image: MemoryImageDataUint8) {
    return new PixelUint8(-1, 0, -image.numChannels, image);
  }

  public static image(image: MemoryImage) {
    return new PixelUint8(
      -1,
      0,
      -image.numChannels,
      image.data instanceof MemoryImageDataUint8
        ? (image.data as MemoryImageDataUint8)
        : new MemoryImageDataUint8(0, 0, 0)
    );
  }

  public static from(other: PixelUint8) {
    return new PixelUint8(other.x, other.y, other._index, other.image);
  }

  public next(): IteratorResult<Pixel> {
    this._x++;
    if (this._x === this.width) {
      this._x = 0;
      this._y++;
      if (this._y === this.height) {
        return <IteratorResult<Pixel>>{
          done: true,
          value: this,
        };
      }
    }
    this._index += this.palette === undefined ? this.numChannels : 1;
    return <IteratorResult<Pixel>>{
      done: this._index >= this.image.data.length,
      value: this,
    };
  }

  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
    this._index =
      this._y * this._image.width * this._image.numChannels +
      this._x * this._image.numChannels;
  }

  public setPositionNormalized(x: number, y: number): void {
    return this.setPosition(
      Math.floor(x * (this.width - 1)),
      Math.floor(y * (this.height - 1))
    );
  }

  public getChannel(channel: number | Channel): number {
    if (this.palette !== undefined) {
      return this.palette.get(this.data[this._index], channel);
    } else {
      if (channel === Channel.luminance) {
        return this.luminance;
      } else {
        return channel < this.data.length
          ? this.data[this._index + channel]
          : 0;
      }
    }
  }

  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  public setChannel(channel: number, value: number): void {
    if (channel < this.numChannels) {
      this.data[this._index + channel] = MathUtils.clampInt255(value);
    }
  }

  public set(color: Color): void {
    if (this._image.hasPalette) {
      this._index = color.index;
    } else {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
      this.a = color.a;
    }
  }

  public setRgb(r: number, g: number, b: number): void {
    if (this.numChannels > 0) {
      this.data[this._index] = Math.trunc(r);
      if (this.numChannels > 1) {
        this.data[this._index + 1] = Math.trunc(g);
        if (this.numChannels > 2) {
          this.data[this._index + 2] = Math.trunc(b);
        }
      }
    }
  }

  public setRgba(r: number, g: number, b: number, a: number): void {
    if (this.numChannels > 0) {
      this.data[this._index] = Math.trunc(r);
      if (this.numChannels > 1) {
        this.data[this._index + 1] = Math.trunc(g);
        if (this.numChannels > 2) {
          this.data[this._index + 2] = Math.trunc(b);
          if (this.numChannels > 3) {
            this.data[this._index + 3] = Math.trunc(a);
          }
        }
      }
    }
  }

  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelUint8) {
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

  public clone(): PixelUint8 {
    return PixelUint8.from(this);
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
