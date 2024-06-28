/** @format */

/**
 * Enum representing the different types of TGA images.
 */
export enum TgaImageType {
  /** No image data is present */
  none,
  /** Image with a color palette */
  palette,
  /** RGB image */
  rgb,
  /** Grayscale image */
  gray,
  /** Reserved type 4 */
  reserved4,
  /** Reserved type 5 */
  reserved5,
  /** Reserved type 6 */
  reserved6,
  /** Reserved type 7 */
  reserved7,
  /** Reserved type 8 */
  reserved8,
  /** Run-length encoded image with a color palette */
  paletteRle,
  /** Run-length encoded RGB image */
  rgbRle,
  /** Run-length encoded grayscale image */
  grayRle,
}

/**
 * Constant representing the length of the TgaImageType enum.
 */
export const TgaImageTypeLength = 12;
