/** @format */

/**
 * Interface representing a core RGB color with generic type T.
 */
export interface PvrColorRgbCore<T> {
  /**
   * Creates a copy of the color.
   * @returns {T} A copy of the color.
   */
  copy(): T;

  /**
   * Sets the minimum color value.
   * @param {T} c - The color value to set as minimum.
   */
  setMin(c: T): void;

  /**
   * Sets the maximum color value.
   * @param {T} c - The color value to set as maximum.
   */
  setMax(c: T): void;
}
