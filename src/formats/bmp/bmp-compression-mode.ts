/** @format */

/**
 * Enum representing BMP compression modes.
 */
export enum BmpCompressionMode {
  /** No compression */
  none,
  /** Run-length encoding with 8 bits */
  rle8,
  /** Run-length encoding with 4 bits */
  rle4,
  /** Bitfields compression */
  bitfields,
  /** JPEG compression */
  jpeg,
  /** PNG compression */
  png,
  /** Alpha bitfields compression */
  alphaBitfields,
  /** Reserved compression mode 7 */
  reserved7,
  /** Reserved compression mode 8 */
  reserved8,
  /** Reserved compression mode 9 */
  reserved9,
  /** Reserved compression mode 10 */
  reserved10,
  /** CMYK compression */
  cmyk,
  /** CMYK with run-length encoding 8 bits */
  cmykRle8,
  /** CMYK with run-length encoding 4 bits */
  cmykRle4,
}
