/** @format */

export interface Quantizer {
  /**
   * Find the index of the closest color to **c** in the **colorMap**.
   */
  getQuantizedColor(c: number): number;
}
