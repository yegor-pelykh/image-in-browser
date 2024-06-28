/** @format */

/**
 * Enum representing various types of TIFF compression methods.
 */
export enum TiffCompression {
  /** No compression */
  none = 1,
  /** CCITT RLE compression */
  ccittRle = 2,
  /** CCITT Fax3 compression */
  ccittFax3 = 3,
  /** CCITT Fax4 compression */
  ccittFax4 = 4,
  /** LZW compression */
  lzw = 5,
  /** Old JPEG compression */
  oldJpeg = 6,
  /** JPEG compression */
  jpeg = 7,
  /** Next compression */
  next = 32766,
  /** CCITT RLEW compression */
  ccittRlew = 32771,
  /** PackBits compression */
  packBits = 32773,
  /** ThunderScan compression */
  thunderScan = 32809,
  /** IT8CTPAD compression */
  it8ctpad = 32895,
  /** TT8LW compression */
  tt8lw = 32896,
  /** IT8MP compression */
  it8mp = 32897,
  /** IT8BL compression */
  it8bl = 32898,
  /** Pixar Film compression */
  pixarFilm = 32908,
  /** Pixar Log compression */
  pixarLog = 32909,
  /** Deflate compression */
  deflate = 32946,
  /** ZIP compression */
  zip = 8,
  /** DCS compression */
  dcs = 32947,
  /** JBIG compression */
  jbig = 34661,
  /** SGI Log compression */
  sgiLog = 34676,
  /** SGI Log24 compression */
  sgiLog24 = 34677,
  /** JP2000 compression */
  jp2000 = 34712,
}
