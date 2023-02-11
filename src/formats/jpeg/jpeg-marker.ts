/** @format */

export enum JpegMarker {
  sof0 = 0xc0,
  sof1 = 0xc1,
  sof2 = 0xc2,
  sof3 = 0xc3,
  sof5 = 0xc5,
  sof6 = 0xc6,
  sof7 = 0xc7,

  jpg = 0xc8,
  sof9 = 0xc9,
  sof10 = 0xca,
  sof11 = 0xcb,

  sof13 = 0xcd,
  sof14 = 0xce,
  sof15 = 0xcf,

  dht = 0xc4,

  dac = 0xcc,

  rst0 = 0xd0,
  rst1 = 0xd1,
  rst2 = 0xd2,
  rst3 = 0xd3,
  rst4 = 0xd4,
  rst5 = 0xd5,
  rst6 = 0xd6,
  rst7 = 0xd7,

  soi = 0xd8,
  eoi = 0xd9,
  sos = 0xda,
  dqt = 0xdb,
  dnl = 0xdc,
  dri = 0xdd,
  dhp = 0xde,
  exp = 0xdf,

  // JFIF, JFXX, CIFF, AVI1, Ocad
  app0 = 0xe0,
  // EXIF, ExtendedXMP, XMP, QVCI, FLIR
  app1 = 0xe1,
  // ICC_Profile, FPXR, MPF, PreviewImage
  app2 = 0xe2,
  // Meta, Stim, PreviewImage
  app3 = 0xe3,
  // Scalado, FPXR, PreviewImage
  app4 = 0xe4,
  // RMETA, PreviewImage
  app5 = 0xe5,
  // EPPIM, NITF, HP_TDHD, GoPro
  app6 = 0xe6,
  // Pentax, Qualcomm
  app7 = 0xe7,
  // SPIFF
  app8 = 0xe8,
  // MediaJukebox
  app9 = 0xe9,
  // Comment
  app10 = 0xea,
  // Jpeg-HDR
  app11 = 0xeb,
  // PictureInfo, Ducky
  app12 = 0xec,
  // Photoshop, Adobe_CM
  app13 = 0xed,
  // ADOBE
  app14 = 0xee,
  // GraphicConverter
  app15 = 0xef,

  jpg0 = 0xf0,
  jpg13 = 0xfd,
  com = 0xfe,

  tem = 0x01,

  error = 0x100,
}
