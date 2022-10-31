/** @format */

export enum TrimMode {
  /**
   * Trim an image to the top-left and bottom-right most non-transparent pixels
   */
  transparent,

  /**
   * Trim an image to the top-left and bottom-right most pixels that are not the
   * same as the top-left most pixel of the image.
   */
  topLeftColor,

  /**
   * Trim an image to the top-left and bottom-right most pixels that are not the
   * same as the bottom-right most pixel of the image.
   */
  bottomRightColor,
}
