/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core.js';

export class PvrColorRgba implements PvrColorRgbCore<PvrColorRgba> {
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

  private _a: number;
  public get a(): number {
    return this._a;
  }

  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }

  public static from(other: PvrColorRgba): PvrColorRgba {
    return new PvrColorRgba(other._r, other._g, other._b, other._a);
  }

  public copy(): PvrColorRgba {
    return PvrColorRgba.from(this);
  }

  public setMin(c: PvrColorRgba): void {
    if (c._r < this._r) {
      this._r = c._r;
    }
    if (c._g < this._g) {
      this._g = c._g;
    }
    if (c._b < this._b) {
      this._b = c._b;
    }
    if (c._a < this._a) {
      this._a = c._a;
    }
  }

  public setMax(c: PvrColorRgba): void {
    if (c._r > this._r) {
      this._r = c._r;
    }
    if (c._g > this._g) {
      this._g = c._g;
    }
    if (c._b > this._b) {
      this._b = c._b;
    }
    if (c._a > this._a) {
      this._a = c._a;
    }
  }

  public mul(x: number): PvrColorRgba {
    return new PvrColorRgba(this._r * x, this._g * x, this._b * x, this._a * x);
  }

  public add(x: PvrColorRgba): PvrColorRgba {
    return new PvrColorRgba(
      this._r + x._r,
      this._g + x._g,
      this._b + x._b,
      this._a + x._a
    );
  }

  public sub(x: PvrColorRgba): PvrColorRgba {
    return new PvrColorRgba(
      this._r - x._r,
      this._g - x._g,
      this._b - x._b,
      this._a - x._a
    );
  }

  public dotProd(x: PvrColorRgba): number {
    return this._r * x._r + this._g * x._g + this._b * x._b + this._a * x._a;
  }
}
