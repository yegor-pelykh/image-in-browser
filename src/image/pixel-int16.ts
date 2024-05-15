/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format } from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MemoryImage } from './image.js';
import { MemoryImageDataInt16 } from './image-data-int16.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

export class PixelInt16 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private _index: number;

  private readonly _image: MemoryImageDataInt16;
  public get image(): MemoryImageDataInt16 {
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
    return this.r;
  }
  public set index(i: number) {
    this.r = i;
  }

  public get data(): Int16Array {
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
    return this._image.height;
  }

  public get length(): number {
    return this._image.numChannels;
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
    return Format.int16;
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
    return undefined;
  }

  public get r(): number {
    return this.numChannels > 0 ? this.data[this._index] : 0;
  }
  public set r(r: number) {
    if (this.numChannels > 0) {
      this.data[this._index] = Math.trunc(r);
    }
  }

  public get g(): number {
    return this.numChannels > 1 ? this.data[this._index + 1] : 0;
  }
  public set g(g: number) {
    if (this.numChannels > 1) {
      this.data[this._index + 1] = Math.trunc(g);
    }
  }

  public get b(): number {
    return this.numChannels > 2 ? this.data[this._index + 2] : 0;
  }
  public set b(b: number) {
    if (this.numChannels > 2) {
      this.data[this._index + 2] = Math.trunc(b);
    }
  }

  public get a(): number {
    return this.numChannels > 3 ? this.data[this._index + 3] : 0;
  }
  public set a(a: number) {
    if (this.numChannels > 3) {
      this.data[this._index + 3] = Math.trunc(a);
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
    image: MemoryImageDataInt16
  ) {
    this._image = image;
    this._index = index;
    this._x = x;
    this._y = y;
  }

  public static imageData(image: MemoryImageDataInt16) {
    return new PixelInt16(-1, 0, -image.numChannels, image);
  }

  public static image(image: MemoryImage) {
    return new PixelInt16(
      -1,
      0,
      -image.numChannels,
      image.data instanceof MemoryImageDataInt16
        ? (image.data as MemoryImageDataInt16)
        : new MemoryImageDataInt16(0, 0, 0)
    );
  }

  public static from(other: PixelInt16) {
    return new PixelInt16(other.x, other.y, other._index, other.image);
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
    this._index += this.numChannels;
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
    if (channel === Channel.luminance) {
      return this.luminance;
    } else {
      return channel < this.numChannels ? this.data[this._index + channel] : 0;
    }
  }

  public getChannelNormalized(channel: Channel): number {
    return this.getChannel(channel) / this.maxChannelValue;
  }

  public setChannel(channel: number, value: number): void {
    if (channel < this.numChannels) {
      this.data[this._index + channel] = Math.trunc(value);
    }
  }

  public set(color: Color): void {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
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

  public toArray(): number[] {
    return ArrayUtils.generate<number>(this.length, (i) => this.getChannel(i));
  }

  public equals(other: Pixel | number[]): boolean {
    if (other instanceof PixelInt16) {
      return ArrayUtils.equals(this.toArray(), other.toArray());
    }
    if (Array.isArray(other)) {
      return ArrayUtils.equals(this.toArray(), other);
    }
    return false;
  }

  public clone(): PixelInt16 {
    return PixelInt16.from(this);
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
