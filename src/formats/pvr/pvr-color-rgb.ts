/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core';

export class PvrColorRgb implements PvrColorRgbCore<PvrColorRgb> {
  private _r: number;
  public get r(): number {
    return this._r;
  }

  private _g: number;
  public get g(): number {
    return this._g;
  }

  private _b: number;
  public get b(): number {
    return this._b;
  }

  constructor(r: number = 0, g: number = 0, b: number = 0) {
    this._r = r;
    this._g = g;
    this._b = b;
  }

  public static from(other: PvrColorRgb): PvrColorRgb {
    return new PvrColorRgb(other._r, other._g, other._b);
  }

  public copy(): PvrColorRgb {
    return PvrColorRgb.from(this);
  }

  public setMin(c: PvrColorRgb): void {
    if (c._r < this._r) {
      this._r = c._r;
    }
    if (c._g < this._g) {
      this._g = c._g;
    }
    if (c._b < this._b) {
      this._b = c._b;
    }
  }

  public setMax(c: PvrColorRgb): void {
    if (c._r > this._r) {
      this._r = c._r;
    }
    if (c._g > this._g) {
      this._g = c._g;
    }
    if (c._b > this._b) {
      this._b = c._b;
    }
  }

  public mul(x: number): PvrColorRgb {
    return new PvrColorRgb(this._r * x, this._g * x, this._b * x);
  }

  public add(x: PvrColorRgb): PvrColorRgb {
    return new PvrColorRgb(this._r + x._r, this._g + x._g, this._b + x._b);
  }

  public sub(x: PvrColorRgb): PvrColorRgb {
    return new PvrColorRgb(this._r - x._r, this._g - x._g, this._b - x._b);
  }

  public dotProd(x: PvrColorRgb): number {
    return this._r * x._r + this._g * x._g + this._b * x._b;
  }
}
