/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core.js';

/**
 * Represents an RGBA color.
 */
export class PvrColorRgba implements PvrColorRgbCore<PvrColorRgba> {
  /**
   * Red component of the color.
   */
  private _r: number;

  /**
   * Gets the red component of the color.
   */
  public get r(): number {
    return this._r;
  }

  /**
   * Green component of the color.
   */
  private _g: number;

  /**
   * Gets the green component of the color.
   */
  public get g(): number {
    return this._g;
  }

  /**
   * Blue component of the color.
   */
  private _b: number;

  /**
   * Gets the blue component of the color.
   */
  public get b(): number {
    return this._b;
  }

  /**
   * Alpha component of the color.
   */
  private _a: number;

  /**
   * Gets the alpha component of the color.
   */
  public get a(): number {
    return this._a;
  }

  /**
   * Initializes a new instance of the PvrColorRgba class.
   * @param {number} r - Red component of the color.
   * @param {number} g - Green component of the color.
   * @param {number} b - Blue component of the color.
   * @param {number} a - Alpha component of the color.
   */
  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }

  /**
   * Creates a new PvrColorRgba instance from another instance.
   * @param {PvrColorRgba} other - The other PvrColorRgba instance.
   * @returns {PvrColorRgba} A new PvrColorRgba instance.
   */
  public static from(other: PvrColorRgba): PvrColorRgba {
    return new PvrColorRgba(other._r, other._g, other._b, other._a);
  }

  /**
   * Creates a copy of the current PvrColorRgba instance.
   * @returns {PvrColorRgba} A new PvrColorRgba instance.
   */
  public copy(): PvrColorRgba {
    return PvrColorRgba.from(this);
  }

  /**
   * Sets the minimum values for each color component.
   * @param {PvrColorRgba} c - The PvrColorRgba instance to compare with.
   */
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

  /**
   * Sets the maximum values for each color component.
   * @param {PvrColorRgba} c - The PvrColorRgba instance to compare with.
   */
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

  /**
   * Multiplies each color component by a given factor.
   * @param {number} x - The factor to multiply by.
   * @returns {PvrColorRgba} A new PvrColorRgba instance with multiplied components.
   */
  public mul(x: number): PvrColorRgba {
    return new PvrColorRgba(this._r * x, this._g * x, this._b * x, this._a * x);
  }

  /**
   * Adds the color components of another PvrColorRgba instance.
   * @param {PvrColorRgba} x - The PvrColorRgba instance to add.
   * @returns {PvrColorRgba} A new PvrColorRgba instance with added components.
   */
  public add(x: PvrColorRgba): PvrColorRgba {
    return new PvrColorRgba(
      this._r + x._r,
      this._g + x._g,
      this._b + x._b,
      this._a + x._a
    );
  }

  /**
   * Subtracts the color components of another PvrColorRgba instance.
   * @param {PvrColorRgba} x - The PvrColorRgba instance to subtract.
   * @returns {PvrColorRgba} A new PvrColorRgba instance with subtracted components.
   */
  public sub(x: PvrColorRgba): PvrColorRgba {
    return new PvrColorRgba(
      this._r - x._r,
      this._g - x._g,
      this._b - x._b,
      this._a - x._a
    );
  }

  /**
   * Calculates the dot product of the current instance and another PvrColorRgba instance.
   * @param {PvrColorRgba} x - The PvrColorRgba instance to calculate the dot product with.
   * @returns {number} The dot product of the two instances.
   */
  public dotProd(x: PvrColorRgba): number {
    return this._r * x._r + this._g * x._g + this._b * x._b + this._a * x._a;
  }
}
