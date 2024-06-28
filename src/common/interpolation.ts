/** @format */

/**
 * Enumeration representing different interpolation methods for resizing images.
 */
export enum Interpolation {
  /**
   * Selects the closest pixel. Fastest method with the lowest quality.
   */
  nearest,

  /**
   * Linearly blends between the neighboring pixels. Moderate speed and quality.
   */
  linear,

  /**
   * Uses cubic interpolation between neighboring pixels. Slowest method with the highest quality.
   */
  cubic,

  /**
   * Averages the colors of the neighboring pixels. Balanced speed and quality.
   */
  average,
}
