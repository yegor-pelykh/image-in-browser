/**
 * Enum representing various JPEG markers.
 *
 * @format
 */

export enum JpegMarker {
  /** Start of Frame 0 */
  sof0 = 0xc0,
  /** Start of Frame 1 */
  sof1 = 0xc1,
  /** Start of Frame 2 */
  sof2 = 0xc2,
  /** Start of Frame 3 */
  sof3 = 0xc3,
  /** Start of Frame 5 */
  sof5 = 0xc5,
  /** Start of Frame 6 */
  sof6 = 0xc6,
  /** Start of Frame 7 */
  sof7 = 0xc7,

  /** JPEG */
  jpg = 0xc8,
  /** Start of Frame 9 */
  sof9 = 0xc9,
  /** Start of Frame 10 */
  sof10 = 0xca,
  /** Start of Frame 11 */
  sof11 = 0xcb,

  /** Start of Frame 13 */
  sof13 = 0xcd,
  /** Start of Frame 14 */
  sof14 = 0xce,
  /** Start of Frame 15 */
  sof15 = 0xcf,

  /** Define Huffman Table */
  dht = 0xc4,

  /** Define Arithmetic Coding */
  dac = 0xcc,

  /** Restart 0 */
  rst0 = 0xd0,
  /** Restart 1 */
  rst1 = 0xd1,
  /** Restart 2 */
  rst2 = 0xd2,
  /** Restart 3 */
  rst3 = 0xd3,
  /** Restart 4 */
  rst4 = 0xd4,
  /** Restart 5 */
  rst5 = 0xd5,
  /** Restart 6 */
  rst6 = 0xd6,
  /** Restart 7 */
  rst7 = 0xd7,

  /** Start of Image */
  soi = 0xd8,
  /** End of Image */
  eoi = 0xd9,
  /** Start of Scan */
  sos = 0xda,
  /** Define Quantization Table */
  dqt = 0xdb,
  /** Define Number of Lines */
  dnl = 0xdc,
  /** Define Restart Interval */
  dri = 0xdd,
  /** Define Hierarchical Progression */
  dhp = 0xde,
  /** Expand Reference Component */
  exp = 0xdf,

  /** Application-specific 0 (JFIF, JFXX, CIFF, AVI1, Ocad) */
  app0 = 0xe0,
  /** Application-specific 1 (EXIF, ExtendedXMP, XMP, QVCI, FLIR) */
  app1 = 0xe1,
  /** Application-specific 2 (ICC_Profile, FPXR, MPF, PreviewImage) */
  app2 = 0xe2,
  /** Application-specific 3 (Meta, Stim, PreviewImage) */
  app3 = 0xe3,
  /** Application-specific 4 (Scalado, FPXR, PreviewImage) */
  app4 = 0xe4,
  /** Application-specific 5 (RMETA, PreviewImage) */
  app5 = 0xe5,
  /** Application-specific 6 (EPPIM, NITF, HP_TDHD, GoPro) */
  app6 = 0xe6,
  /** Application-specific 7 (Pentax, Qualcomm) */
  app7 = 0xe7,
  /** Application-specific 8 (SPIFF) */
  app8 = 0xe8,
  /** Application-specific 9 (MediaJukebox) */
  app9 = 0xe9,
  /** Application-specific 10 (Comment) */
  app10 = 0xea,
  /** Application-specific 11 (Jpeg-HDR) */
  app11 = 0xeb,
  /** Application-specific 12 (PictureInfo, Ducky) */
  app12 = 0xec,
  /** Application-specific 13 (Photoshop, Adobe_CM) */
  app13 = 0xed,
  /** Application-specific 14 (ADOBE) */
  app14 = 0xee,
  /** Application-specific 15 (GraphicConverter) */
  app15 = 0xef,

  /** JPEG extension 0 */
  jpg0 = 0xf0,
  /** JPEG extension 13 */
  jpg13 = 0xfd,
  /** Comment */
  com = 0xfe,

  /** Temporary marker */
  tem = 0x01,

  /** Error marker */
  error = 0x100,
}
