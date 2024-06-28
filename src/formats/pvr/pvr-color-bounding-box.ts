/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core.js';

/**
 * Type representing a PvrColor.
 */
export type PvrColor = PvrColorRgbCore<PvrColor>;

/**
 * Class representing a bounding box for PvrColor.
 */
export class PvrColorBoundingBox {
  /**
   * The minimum PvrColor value in the bounding box.
   */
  private _min: PvrColor;

  /**
   * Gets the minimum PvrColor value in the bounding box.
   * @returns {PvrColor} The minimum PvrColor value.
   */
  public get min(): PvrColor {
    return this._min;
  }

  /**
   * The maximum PvrColor value in the bounding box.
   */
  private _max: PvrColor;

  /**
   * Gets the maximum PvrColor value in the bounding box.
   * @returns {PvrColor} The maximum PvrColor value.
   */
  public get max(): PvrColor {
    return this._max;
  }

  /**
   * Creates an instance of PvrColorBoundingBox.
   * @param {PvrColor} min - The minimum PvrColor value.
   * @param {PvrColor} max - The maximum PvrColor value.
   */
  constructor(min: PvrColor, max: PvrColor) {
    this._min = min.copy();
    this._max = max.copy();
  }

  /**
   * Adds a PvrColor to the bounding box, updating the min and max values.
   * @param {PvrColor} c - The PvrColor to add.
   */
  public add(c: PvrColor): void {
    this._min.setMin(c);
    this._max.setMax(c);
  }
}
