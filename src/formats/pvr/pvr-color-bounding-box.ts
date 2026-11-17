/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core.js';

/**
 * Type representing a PvrColor.
 */
export type PvrColor = PvrColorRgbCore<PvrColor>;

/**
 * Class representing a bounding box for PvrColor.
 */
export class PvrColorBoundingBox<T extends PvrColorRgbCore<T> = PvrColor> {
  /**
   * The minimum color value in the bounding box.
   */
  private _min: T;

  /**
   * Gets the minimum color value in the bounding box.
   * @returns {T} The minimum color value.
   */
  public get min(): T {
    return this._min;
  }

  /**
   * The maximum color value in the bounding box.
   */
  private _max: T;

  /**
   * Gets the maximum color value in the bounding box.
   * @returns {T} The maximum color value.
   */
  public get max(): T {
    return this._max;
  }

  /**
   * Creates an instance of PvrColorBoundingBox.
   * @param {T} min - The minimum color value.
   * @param {T} max - The maximum color value.
   */
  constructor(min: T, max: T) {
    this._min = min.copy();
    this._max = max.copy();
  }

  /**
   * Adds a color to the bounding box, updating the min and max values.
   * @param {T} c - The color to add.
   */
  public add(c: T): void {
    this._min.setMin(c);
    this._max.setMax(c);
  }
}
