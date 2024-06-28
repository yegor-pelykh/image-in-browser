/** @format */

/**
 * Enum representing various PNM (Portable Any Map) formats.
 */
export enum PnmFormat {
  /**
   * Invalid format.
   */
  invalid,

  /**
   * Portable Bitmap format.
   */
  pbm,

  /**
   * Portable Graymap format (plain text).
   */
  pgm2,

  /**
   * Portable Graymap format (binary).
   */
  pgm5,

  /**
   * Portable Pixmap format (plain text).
   */
  ppm3,

  /**
   * Portable Pixmap format (binary).
   */
  ppm6,
}
