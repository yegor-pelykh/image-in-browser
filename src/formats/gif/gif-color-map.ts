/** @format */

import { ColorUint8 } from '../../color/color-uint8';
import { PaletteUint8 } from '../../image/palette-uint8';

export class GifColorMap {
  private readonly _numColors: number;
  public get numColors(): number {
    return this._numColors;
  }

  private readonly _palette: PaletteUint8;
  public get palette(): PaletteUint8 {
    return this._palette;
  }

  private _bitsPerPixel: number;
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

  constructor(numColors: number, palette?: PaletteUint8) {
    this._numColors = numColors;
    this._palette = palette ?? new PaletteUint8(numColors, 3);
    this._bitsPerPixel = GifColorMap.bitSize(numColors);
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
    const palette = PaletteUint8.from(other._palette);
    const r = new GifColorMap(other.numColors, palette);
    r._bitsPerPixel = other._bitsPerPixel;
    r._transparent = other._transparent;
    return r;
  }

  public getColor(index: number): ColorUint8 {
    const r = this.getRed(index);
    const g = this.getGreen(index);
    const b = this.getBlue(index);
    const a = this.getAlpha(index);
    return ColorUint8.rgba(r, g, b, a);
  }

  public setColor(index: number, r: number, g: number, b: number): void {
    this._palette.setRgb(index, r, g, b);
  }

  public findColor(r: number, g: number, b: number, a: number): number {
    let closestDistance: number = -1;
    let closestIndex: number = -1;
    for (let i = 0; i < this._numColors; ++i) {
      const pr = this._palette.getRed(i);
      const pg = this._palette.getGreen(i);
      const pb = this._palette.getBlue(i);
      const pa = this._palette.getAlpha(i);
      if (pr === r && pg === g && pb === b && pa === a) {
        return i;
      }
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const da = a - pa;
      const d2 = dr * dr + dg * dg + db * db + da * da;
      if (closestIndex === -1 || d2 < closestDistance) {
        closestIndex = i;
        closestDistance = d2;
      }
    }
    return closestIndex;
  }

  public getRed(color: number): number {
    return Math.trunc(this._palette.getRed(color));
  }

  public getGreen(color: number): number {
    return Math.trunc(this._palette.getGreen(color));
  }

  public getBlue(color: number): number {
    return Math.trunc(this._palette.getBlue(color));
  }

  public getAlpha(color: number): number {
    return color === this._transparent ? 0 : 255;
  }

  public getPalette(): PaletteUint8 {
    if (this._transparent === undefined) {
      return this._palette;
    }
    const p = new PaletteUint8(this._palette.numColors, 4);
    const l = this._palette.numColors;
    for (let i = 0; i < l; ++i) {
      p.setRgba(
        i,
        this.getRed(i),
        this.getGreen(i),
        this.getBlue(i),
        this.getAlpha(i)
      );
    }
    return p;
  }
}
