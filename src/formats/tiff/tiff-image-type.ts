/**
 * Enum representing different types of TIFF images.
 *
 * @format
 */

export enum TiffImageType {
  /** Bilevel image type */
  bilevel,
  /** 4-bit grayscale image type */
  gray4bit,
  /** Grayscale image type */
  gray,
  /** Grayscale image with alpha channel */
  grayAlpha,
  /** Palette-based image type */
  palette,
  /** RGB image type */
  rgb,
  /** RGBA image type */
  rgba,
  /** YCbCr subsampled image type */
  yCbCrSub,
  /** Generic image type */
  generic,
  /** Invalid image type */
  invalid,
}
