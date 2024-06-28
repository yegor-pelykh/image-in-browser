/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core.js';

/**
 * Class representing an RGB color.
 */
export class PvrColorRgb implements PvrColorRgbCore<PvrColorRgb> {
  /**
   * Red component of the color.
   * @private
   */
  private _r: number;

  /**
   * Gets the red component of the color.
   * @returns {number} The red component.
   */
  public get r(): number {
    return this._r;
  }

  /**
   * Green component of the color.
   * @private
   */
  private _g: number;

  /**
   * Gets the green component of the color.
   * @returns {number} The green component.
   */
  public get g(): number {
    return this._g;
  }

  /**
   * Blue component of the color.
   * @private
   */
  private _b: number;

  /**
   * Gets the blue component of the color.
   * @returns {number} The blue component.
   */
  public get b(): number {
    return this._b;
  }

  /**
   * Creates an instance of PvrColorRgb.
   * @param {number} [r=0] - The red component.
   * @param {number} [g=0] - The green component.
   * @param {number} [b=0] - The blue component.
   */
  constructor(r: number = 0, g: number = 0, b: number = 0) {
    this._r = r;
    this._g = g;
    this._b = b;
  }

  /**
   * Creates a new PvrColorRgb instance from another instance.
   * @param {PvrColorRgb} other - The other PvrColorRgb instance.
   * @returns {PvrColorRgb} A new PvrColorRgb instance.
   */
  public static from(other: PvrColorRgb): PvrColorRgb {
    return new PvrColorRgb(other._r, other._g, other._b);
  }

  /**
   * Creates a copy of the current PvrColorRgb instance.
   * @returns {PvrColorRgb} A new PvrColorRgb instance.
   */
  public copy(): PvrColorRgb {
    return PvrColorRgb.from(this);
  }

  /**
   * Sets the minimum RGB values between the current instance and another instance.
   * @param {PvrColorRgb} c - The other PvrColorRgb instance.
   */
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

  /**
   * Sets the maximum RGB values between the current instance and another instance.
   * @param {PvrColorRgb} c - The other PvrColorRgb instance.
   */
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

  /**
   * Multiplies the RGB values by a scalar.
   * @param {number} x - The scalar value.
   * @returns {PvrColorRgb} A new PvrColorRgb instance with multiplied values.
   */
  public mul(x: number): PvrColorRgb {
    return new PvrColorRgb(this._r * x, this._g * x, this._b * x);
  }

  /**
   * Adds the RGB values of another instance to the current instance.
   * @param {PvrColorRgb} x - The other PvrColorRgb instance.
   * @returns {PvrColorRgb} A new PvrColorRgb instance with added values.
   */
  public add(x: PvrColorRgb): PvrColorRgb {
    return new PvrColorRgb(this._r + x._r, this._g + x._g, this._b + x._b);
  }

  /**
   * Subtracts the RGB values of another instance from the current instance.
   * @param {PvrColorRgb} x - The other PvrColorRgb instance.
   * @returns {PvrColorRgb} A new PvrColorRgb instance with subtracted values.
   */
  public sub(x: PvrColorRgb): PvrColorRgb {
    return new PvrColorRgb(this._r - x._r, this._g - x._g, this._b - x._b);
  }

  /**
   * Calculates the dot product of the current instance and another instance.
   * @param {PvrColorRgb} x - The other PvrColorRgb instance.
   * @returns {number} The dot product.
   */
  public dotProd(x: PvrColorRgb): number {
    return this._r * x._r + this._g * x._g + this._b * x._b;
  }
}
