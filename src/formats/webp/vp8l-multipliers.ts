/** @format */

import { BitUtils } from '../../common/bit-utils.js';

/**
 * Class representing VP8L color multipliers.
 */
export class VP8LMultipliers {
  /**
   * Internal data storage for color multipliers.
   * @private
   */
  private readonly _data = new Uint8Array(3);

  /**
   * Gets the green to red multiplier.
   * @returns {number} The green to red multiplier.
   */
  public get greenToRed(): number {
    return this._data[0];
  }

  /**
   * Sets the green to red multiplier.
   * @param {number} v - The green to red multiplier.
   */
  public set greenToRed(v: number) {
    this._data[0] = v;
  }

  /**
   * Gets the green to blue multiplier.
   * @returns {number} The green to blue multiplier.
   */
  public get greenToBlue(): number {
    return this._data[1];
  }

  /**
   * Sets the green to blue multiplier.
   * @param {number} v - The green to blue multiplier.
   */
  public set greenToBlue(v: number) {
    this._data[1] = v;
  }

  /**
   * Gets the red to blue multiplier.
   * @returns {number} The red to blue multiplier.
   */
  public get redToBlue(): number {
    return this._data[2];
  }

  /**
   * Sets the red to blue multiplier.
   * @param {number} v - The red to blue multiplier.
   */
  public set redToBlue(v: number) {
    this._data[2] = v;
  }

  /**
   * Gets the color code.
   * @returns {number} The color code.
   */
  public get colorCode(): number {
    return (
      0xff000000 | (this._data[2] << 16) | (this._data[1] << 8) | this._data[0]
    );
  }

  /**
   * Sets the color code.
   * @param {number} v - The color code.
   */
  public set colorCode(v: number) {
    this._data[0] = (v >>> 0) & 0xff;
    this._data[1] = (v >>> 8) & 0xff;
    this._data[2] = (v >>> 16) & 0xff;
  }

  /**
   * Clears the color multipliers.
   */
  public clear(): void {
    this._data[0] = 0;
    this._data[1] = 0;
    this._data[2] = 0;
  }

  /**
   * Transforms the color based on the multipliers.
   * @param {number} argb - The ARGB color value.
   * @param {boolean} inverse - Whether to apply the inverse transformation.
   * @returns {number} The transformed color value.
   */
  public transformColor(argb: number, inverse: boolean): number {
    const green = (argb >>> 8) & 0xff;
    const red = (argb >>> 16) & 0xff;
    let newRed = red;
    let newBlue = argb & 0xff;

    if (inverse) {
      const g = this.colorTransformDelta(this.greenToRed, green);
      newRed = (newRed + g) & 0xffffffff;
      newRed &= 0xff;
      newBlue =
        (newBlue + this.colorTransformDelta(this.greenToBlue, green)) &
        0xffffffff;
      newBlue =
        (newBlue + this.colorTransformDelta(this.redToBlue, newRed)) &
        0xffffffff;
      newBlue &= 0xff;
    } else {
      newRed -= this.colorTransformDelta(this.greenToRed, green);
      newRed &= 0xff;
      newBlue -= this.colorTransformDelta(this.greenToBlue, green);
      newBlue -= this.colorTransformDelta(this.redToBlue, red);
      newBlue &= 0xff;
    }

    const c = (argb & 0xff00ff00) | ((newRed << 16) & 0xffffffff) | newBlue;
    return c;
  }

  /**
   * Calculates the color transform delta.
   * @param {number} colorPred - The predicted color value.
   * @param {number} color - The actual color value.
   * @returns {number} The color transform delta.
   */
  public colorTransformDelta(colorPred: number, color: number): number {
    const a = BitUtils.uint8ToInt8(colorPred);
    const b = BitUtils.uint8ToInt8(color);
    const d = BitUtils.int32ToUint32(a * b);
    return d >>> 5;
  }
}
