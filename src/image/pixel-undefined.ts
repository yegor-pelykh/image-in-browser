/** @format */

import { Channel } from '../color/channel';
import { Color, ColorConvertOptions } from '../color/color';
import { Format } from '../color/format';
import { MemoryImageData } from './image-data';
import { MemoryImageDataUint8 } from './image-data-uint8';
import { Palette } from './palette';
import { Pixel } from './pixel';

/**
 * Represents an invalid pixel.
 */
export class PixelUndefined implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  private static readonly _nullImageData = new MemoryImageDataUint8(0, 0, 0);

  public get image(): MemoryImageData {
    return PixelUndefined._nullImageData;
  }

  public get isValid(): boolean {
    return false;
  }

  public get width(): number {
    return 0;
  }

  public get height(): number {
    return 0;
  }

  public get x(): number {
    return 0;
  }

  public get y(): number {
    return 0;
  }

  public get xNormalized(): number {
    return 0;
  }

  public get yNormalized(): number {
    return 0;
  }

  public get length(): number {
    return 0;
  }

  public get maxChannelValue(): number {
    return 0;
  }

  public get maxIndexValue(): number {
    return 0;
  }

  public get format(): Format {
    return Format.uint8;
  }

  public get isLdrFormat(): boolean {
    return false;
  }

  public get isHdrFormat(): boolean {
    return false;
  }

  public get hasPalette(): boolean {
    return false;
  }

  public get palette(): Palette | undefined {
    return undefined;
  }

  public get index(): number {
    return 0;
  }

  public set index(_i: number) {}

  public get r(): number {
    return 0;
  }

  public set r(_r: number) {}

  public get g(): number {
    return 0;
  }

  public set g(_g: number) {}

  public get b(): number {
    return 0;
  }

  public set b(_b: number) {}

  public get a(): number {
    return 0;
  }

  public set a(_a: number) {}

  public get rNormalized(): number {
    return 0;
  }

  public set rNormalized(_v: number) {}

  public get gNormalized(): number {
    return 0;
  }

  public set gNormalized(_v: number) {}

  public get bNormalized(): number {
    return 0;
  }

  public set bNormalized(_v: number) {}

  public get aNormalized(): number {
    return 0;
  }

  public set aNormalized(_v: number) {}

  public get luminance(): number {
    return 0;
  }

  public get luminanceNormalized(): number {
    return 0;
  }

  public getChannel(_channel: number): number {
    return 0;
  }

  public getChannelNormalized(_channel: Channel): number {
    return 0;
  }

  public setChannel(_channel: number, _value: number): void {}

  public set(_color: Color): void {}

  public setRgb(_r: number, _g: number, _b: number): void {}

  public setRgba(_r: number, _g: number, _b: number, _a: number): void {}

  public clone(): Color {
    return new PixelUndefined();
  }

  public convert(_options: ColorConvertOptions): Color {
    return this;
  }

  public setPosition(_x: number, _y: number): void {}

  public setPositionNormalized(_x: number, _y: number): void {}

  public equals(other: Pixel): boolean {
    return other instanceof PixelUndefined;
  }

  public next(): IteratorResult<Pixel> {
    return {
      done: true,
      value: this,
    };
  }

  public toArray(): number[] {
    return [];
  }

  public toString(): string {
    return `${this.constructor.name} (undefined)`;
  }

  public [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }
}
