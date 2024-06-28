/** @format */

import { ColorUint8 } from '../../color/color-uint8.js';
import { PaletteUint8 } from '../../image/palette-uint8.js';

/**
 * Class representing a GIF color map.
 */
export class GifColorMap {
  /**
   * Number of colors in the color map.
   */
  private readonly _numColors: number;

  /**
   * Gets the number of colors.
   * @returns {number} The number of colors.
   */
  public get numColors(): number {
    return this._numColors;
  }

  /**
   * The palette used in the color map.
   */
  private readonly _palette: PaletteUint8;

  /**
   * Gets the palette.
   * @returns {PaletteUint8} The palette.
   */
  public get palette(): PaletteUint8 {
    return this._palette;
  }

  /**
   * Bits per pixel.
   */
  private _bitsPerPixel: number;

  /**
   * Gets the bits per pixel.
   * @returns {number} The bits per pixel.
   */
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  /**
   * Transparent color index.
   */
  private _transparent?: number;

  /**
   * Sets the transparent color index.
   * @param {number | undefined} v - The transparent color index.
   */
  public set transparent(v: number | undefined) {
    this._transparent = v;
  }

  /**
   * Gets the transparent color index.
   * @returns {number | undefined} The transparent color index.
   */
  public get transparent(): number | undefined {
    return this._transparent;
  }

  /**
   * Creates an instance of GifColorMap.
   * @param {number} numColors - The number of colors.
   * @param {PaletteUint8} [palette] - The palette.
   */
  constructor(numColors: number, palette?: PaletteUint8) {
    this._numColors = numColors;
    this._palette = palette ?? new PaletteUint8(numColors, 3);
    this._bitsPerPixel = GifColorMap.bitSize(numColors);
  }

  /**
   * Calculates the bit size required for the given number of colors.
   * @param {number} n - The number of colors.
   * @returns {number} The bit size.
   */
  private static bitSize(n: number): number {
    for (let i = 1; i <= 8; i++) {
      if (1 << i >= n) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Creates a new GifColorMap from an existing one.
   * @param {GifColorMap} other - The existing GifColorMap.
   * @returns {GifColorMap} The new GifColorMap.
   */
  public static from(other: GifColorMap): GifColorMap {
    const palette = PaletteUint8.from(other._palette);
    const r = new GifColorMap(other.numColors, palette);
    r._bitsPerPixel = other._bitsPerPixel;
    r._transparent = other._transparent;
    return r;
  }

  /**
   * Gets the color at the specified index.
   * @param {number} index - The index.
   * @returns {ColorUint8} The color.
   */
  public getColor(index: number): ColorUint8 {
    const r = this.getRed(index);
    const g = this.getGreen(index);
    const b = this.getBlue(index);
    const a = this.getAlpha(index);
    return ColorUint8.rgba(r, g, b, a);
  }

  /**
   * Sets the color at the specified index.
   * @param {number} index - The index.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   */
  public setColor(index: number, r: number, g: number, b: number): void {
    this._palette.setRgb(index, r, g, b);
  }

  /**
   * Finds the closest color index for the given RGBA values.
   * @param {number} r - The red component.
   * @param {number} g - The green component.
   * @param {number} b - The blue component.
   * @param {number} a - The alpha component.
   * @returns {number} The closest color index.
   */
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

  /**
   * Gets the red component of the color at the specified index.
   * @param {number} color - The color index.
   * @returns {number} The red component.
   */
  public getRed(color: number): number {
    return Math.trunc(this._palette.getRed(color));
  }

  /**
   * Gets the green component of the color at the specified index.
   * @param {number} color - The color index.
   * @returns {number} The green component.
   */
  public getGreen(color: number): number {
    return Math.trunc(this._palette.getGreen(color));
  }

  /**
   * Gets the blue component of the color at the specified index.
   * @param {number} color - The color index.
   * @returns {number} The blue component.
   */
  public getBlue(color: number): number {
    return Math.trunc(this._palette.getBlue(color));
  }

  /**
   * Gets the alpha component of the color at the specified index.
   * @param {number} color - The color index.
   * @returns {number} The alpha component.
   */
  public getAlpha(color: number): number {
    return color === this._transparent ? 0 : 255;
  }

  /**
   * Gets the palette with RGBA values.
   * @returns {PaletteUint8} The palette with RGBA values.
   */
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
