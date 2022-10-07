/** @format */

export abstract class Jpeg {
  public static readonly dctZigZag = [
    0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36,
    29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61,
    54, 47, 55, 62, 63,
    // Extra entries for safety in decoder
    63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
  ];

  // The basic DCT block is 8x8 samples
  public static readonly DCTSIZE = 8;
  // DCTSIZE squared; # of elements in a block
  public static readonly DCTSIZE2 = 64;
  // Quantization tables are numbered 0..3
  public static readonly NUM_QUANT_TBLS = 4;
  // Huffman tables are numbered 0..3
  public static readonly NUM_HUFF_TBLS = 4;
  // Arith-coding tables are numbered 0..15
  public static readonly NUM_ARITH_TBLS = 16;
  // JPEG limit on # of components in one scan
  public static readonly MAX_COMPS_IN_SCAN = 4;
  // JPEG limit on sampling factors
  public static readonly MAX_SAMP_FACTOR = 4;

  public static readonly M_SOF0 = 0xc0;
  public static readonly M_SOF1 = 0xc1;
  public static readonly M_SOF2 = 0xc2;
  public static readonly M_SOF3 = 0xc3;

  public static readonly M_SOF5 = 0xc5;
  public static readonly M_SOF6 = 0xc6;
  public static readonly M_SOF7 = 0xc7;

  public static readonly M_JPG = 0xc8;
  public static readonly M_SOF9 = 0xc9;
  public static readonly M_SOF10 = 0xca;
  public static readonly M_SOF11 = 0xcb;

  public static readonly M_SOF13 = 0xcd;
  public static readonly M_SOF14 = 0xce;
  public static readonly M_SOF15 = 0xcf;

  public static readonly M_DHT = 0xc4;

  public static readonly M_DAC = 0xcc;

  public static readonly M_RST0 = 0xd0;
  public static readonly M_RST1 = 0xd1;
  public static readonly M_RST2 = 0xd2;
  public static readonly M_RST3 = 0xd3;
  public static readonly M_RST4 = 0xd4;
  public static readonly M_RST5 = 0xd5;
  public static readonly M_RST6 = 0xd6;
  public static readonly M_RST7 = 0xd7;

  public static readonly M_SOI = 0xd8;
  public static readonly M_EOI = 0xd9;
  public static readonly M_SOS = 0xda;
  public static readonly M_DQT = 0xdb;
  public static readonly M_DNL = 0xdc;
  public static readonly M_DRI = 0xdd;
  public static readonly M_DHP = 0xde;
  public static readonly M_EXP = 0xdf;

  // JFIF, JFXX, CIFF, AVI1, Ocad
  public static readonly M_APP0 = 0xe0;
  // EXIF, ExtendedXMP, XMP, QVCI, FLIR
  public static readonly M_APP1 = 0xe1;
  // ICC_Profile, FPXR, MPF, PreviewImage
  public static readonly M_APP2 = 0xe2;
  // Meta, Stim, PreviewImage
  public static readonly M_APP3 = 0xe3;
  // Scalado, FPXR, PreviewImage
  public static readonly M_APP4 = 0xe4;
  // RMETA, PreviewImage
  public static readonly M_APP5 = 0xe5;
  // EPPIM, NITF, HP_TDHD, GoPro
  public static readonly M_APP6 = 0xe6;
  // Pentax, Qualcomm
  public static readonly M_APP7 = 0xe7;
  // SPIFF
  public static readonly M_APP8 = 0xe8;
  // MediaJukebox
  public static readonly M_APP9 = 0xe9;
  // Comment
  public static readonly M_APP10 = 0xea;
  // Jpeg-HDR
  public static readonly M_APP11 = 0xeb;
  // PictureInfo, Ducky
  public static readonly M_APP12 = 0xec;
  // Photoshop, Adobe_CM
  public static readonly M_APP13 = 0xed;
  // ADOBE
  public static readonly M_APP14 = 0xee;
  // GraphicConverter
  public static readonly M_APP15 = 0xef;

  public static readonly M_JPG0 = 0xf0;
  public static readonly M_JPG13 = 0xfd;
  public static readonly M_COM = 0xfe;

  public static readonly M_TEM = 0x01;

  public static readonly M_ERROR = 0x100;
}
