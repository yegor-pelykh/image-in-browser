/** @format */

/**
 * Enum representing different photometric types for TIFF images.
 */
export enum TiffPhotometricType {
  /** White is zero (0) */
  whiteIsZero,
  /** Black is zero (1) */
  blackIsZero,
  /** RGB color model (2) */
  rgb,
  /** Palette color (3) */
  palette,
  /** Transparency mask (4) */
  transparencyMask,
  /** CMYK color model (5) */
  cmyk,
  /** YCbCr color model (6) */
  yCbCr,
  /** Reserved (7) */
  reserved7,
  /** CIE L*a*b* color model (8) */
  cieLab,
  /** ICC L*a*b* color model (9) */
  iccLab,
  /** ITU L*a*b* color model (10) */
  ituLab,
  /** Logarithmic luminance (32844) */
  logL,
  /** Logarithmic luminance and chrominance (32845) */
  logLuv,
  /** Color filter array (32803) */
  colorFilterArray,
  /** Linear raw (34892) */
  linearRaw,
  /** Depth map (51177) */
  depth,
  /** Unknown photometric type */
  unknown,
}

/**
 * Constant representing the length of the TiffPhotometricType enum.
 */
export const TiffPhotometricTypeLength = 17;
