/** @format */

/**
 * Enum representing the pixelation mode.
 */
export enum PixelateMode {
  /**
   * Use the top-left pixel of a block for the block color.
   */
  upperLeft,

  /**
   * Use the average of the pixels within a block for the block color.
   */
  average,
}
