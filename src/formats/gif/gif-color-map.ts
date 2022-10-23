/** @format */

import { ColorUtils } from '../../common/color-utils';

export interface GifColorMapInitOptions {
  numColors: number;
  bitsPerPixel?: number;
  colors?: Uint8Array;
  transparent?: number;
}

export class GifColorMap {
  private readonly _colors: Uint8Array;
  public get colors(): Uint8Array {
    return this._colors;
  }

  private readonly _numColors: number;
  public get numColors(): number {
    return this._numColors;
  }

  private readonly _bitsPerPixel: number;
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  private _transparent?: number;
  public set transparent(v: number | undefined) {
    this._transparent = v;
  }
  public get transparent(): number | undefined {
    return this._transparent;
  }

  constructor(options: GifColorMapInitOptions) {
    this._numColors = options.numColors;
    this._bitsPerPixel =
      options.bitsPerPixel ?? GifColorMap.bitSize(options.numColors);
    this._colors = options.colors ?? new Uint8Array(options.numColors * 3);
    this._transparent = options.transparent;
  }

  private static bitSize(n: number): number {
    for (let i = 1; i <= 8; i++) {
      if (1 << i >= n) {
        return i;
      }
    }
    return 0;
  }

  public static from(other: GifColorMap) {
    return new GifColorMap({
      numColors: other.numColors,
      bitsPerPixel: other.bitsPerPixel,
      colors: other.colors,
      transparent: other.transparent,
    });
  }

  public getByte(index: number): number {
    return this._colors[index];
  }

  public setByte(index: number, value: number): number {
    return (this._colors[index] = value);
  }

  public getColor(index: number): number {
    const ci = index * 3;
    const a = index === this._transparent ? 0 : 255;
    return ColorUtils.getColor(
      this._colors[ci],
      this._colors[ci + 1],
      this._colors[ci + 2],
      a
    );
  }

  public setColor(index: number, r: number, g: number, b: number): void {
    const ci = index * 3;
    this._colors[ci] = r;
    this._colors[ci + 1] = g;
    this._colors[ci + 2] = b;
  }

  public getRed(color: number): number {
    return this._colors[color * 3];
  }

  public getGreen(color: number): number {
    return this._colors[color * 3 + 1];
  }

  public getBlue(color: number): number {
    return this._colors[color * 3 + 2];
  }

  public getAlpha(color: number): number {
    return color === this._transparent ? 0 : 255;
  }
}
