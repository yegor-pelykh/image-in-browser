/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { LibError } from '../../error/lib-error';

export interface TiffFaxDecoderInitOptions {
  fillOrder: number;
  width: number;
  height: number;
}

export class TiffFaxDecoder {
  private static readonly _table1: number[] = [
    // 0 bits are left in first byte - SHOULD NOT HAPPEN
    0x00,
    // 1 bits are left in first byte
    0x01,
    // 2 bits are left in first byte
    0x03,
    // 3 bits are left in first byte
    0x07,
    // 4 bits are left in first byte
    0x0f,
    // 5 bits are left in first byte
    0x1f,
    // 6 bits are left in first byte
    0x3f,
    // 7 bits are left in first byte
    0x7f,
    // 8 bits are left in first byte
    0xff,
  ];

  private static readonly _table2: number[] = [
    // 0
    0x00,
    // 1
    0x80,
    // 2
    0xc0,
    // 3
    0xe0,
    // 4
    0xf0,
    // 5
    0xf8,
    // 6
    0xfc,
    // 7
    0xfe,
    // 8
    0xff,
  ];

  /**
   * Table to be used when **fillOrder** = 2, for flipping bytes.
   */
  private static readonly _flipTable: number[] = [
    0, -128, 64, -64, 32, -96, 96, -32, 16, -112, 80, -48, 48, -80, 112, -16, 8,
    -120, 72, -56, 40, -88, 104, -24, 24, -104, 88, -40, 56, -72, 120, -8, 4,
    -124, 68, -60, 36, -92, 100, -28, 20, -108, 84, -44, 52, -76, 116, -12, 12,
    -116, 76, -52, 44, -84, 108, -20, 28, -100, 92, -36, 60, -68, 124, -4, 2,
    -126, 66, -62, 34, -94, 98, -30, 18, -110, 82, -46, 50, -78, 114, -14, 10,
    -118, 74, -54, 42, -86, 106, -22, 26, -102, 90, -38, 58, -70, 122, -6, 6,
    -122, 70, -58, 38, -90, 102, -26, 22, -106, 86, -42, 54, -74, 118, -10, 14,
    -114, 78, -50, 46, -82, 110, -18, 30, -98, 94, -34, 62, -66, 126, -2, 1,
    -127, 65, -63, 33, -95, 97, -31, 17, -111, 81, -47, 49, -79, 113, -15, 9,
    -119, 73, -55, 41, -87, 105, -23, 25, -103, 89, -39, 57, -71, 121, -7, 5,
    -123, 69, -59, 37, -91, 101, -27, 21, -107, 85, -43, 53, -75, 117, -11, 13,
    -115, 77, -51, 45, -83, 109, -19, 29, -99, 93, -35, 61, -67, 125, -3, 3,
    -125, 67, -61, 35, -93, 99, -29, 19, -109, 83, -45, 51, -77, 115, -13, 11,
    -117, 75, -53, 43, -85, 107, -21, 27, -101, 91, -37, 59, -69, 123, -5, 7,
    -121, 71, -57, 39, -89, 103, -25, 23, -105, 87, -41, 55, -73, 119, -9, 15,
    -113, 79, -49, 47, -81, 111, -17, 31, -97, 95, -33, 63, -65, 127, -1,
  ];

  /**
   * The main 10 bit white runs lookup table
   */
  private static readonly _white: number[] = [
    // 0 - 7
    6430, 6400, 6400, 6400, 3225, 3225, 3225, 3225,
    // 8 - 15
    944, 944, 944, 944, 976, 976, 976, 976,
    // 16 - 23
    1456, 1456, 1456, 1456, 1488, 1488, 1488, 1488,
    // 24 - 31
    718, 718, 718, 718, 718, 718, 718, 718,
    // 32 - 39
    750, 750, 750, 750, 750, 750, 750, 750,
    // 40 - 47
    1520, 1520, 1520, 1520, 1552, 1552, 1552, 1552,
    // 48 - 55
    428, 428, 428, 428, 428, 428, 428, 428,
    // 56 - 63
    428, 428, 428, 428, 428, 428, 428, 428,
    // 64 - 71
    654, 654, 654, 654, 654, 654, 654, 654,
    // 72 - 79
    1072, 1072, 1072, 1072, 1104, 1104, 1104, 1104,
    // 80 - 87
    1136, 1136, 1136, 1136, 1168, 1168, 1168, 1168,
    // 88 - 95
    1200, 1200, 1200, 1200, 1232, 1232, 1232, 1232,
    // 96 - 103
    622, 622, 622, 622, 622, 622, 622, 622,
    // 104 - 111
    1008, 1008, 1008, 1008, 1040, 1040, 1040, 1040,
    // 112 - 119
    44, 44, 44, 44, 44, 44, 44, 44,
    // 120 - 127
    44, 44, 44, 44, 44, 44, 44, 44,
    // 128 - 135
    396, 396, 396, 396, 396, 396, 396, 396,
    // 136 - 143
    396, 396, 396, 396, 396, 396, 396, 396,
    // 144 - 151
    1712, 1712, 1712, 1712, 1744, 1744, 1744, 1744,
    // 152 - 159
    846, 846, 846, 846, 846, 846, 846, 846,
    // 160 - 167
    1264, 1264, 1264, 1264, 1296, 1296, 1296, 1296,
    // 168 - 175
    1328, 1328, 1328, 1328, 1360, 1360, 1360, 1360,
    // 176 - 183
    1392, 1392, 1392, 1392, 1424, 1424, 1424, 1424,
    // 184 - 191
    686, 686, 686, 686, 686, 686, 686, 686,
    // 192 - 199
    910, 910, 910, 910, 910, 910, 910, 910,
    // 200 - 207
    1968, 1968, 1968, 1968, 2000, 2000, 2000, 2000,
    // 208 - 215
    2032, 2032, 2032, 2032, 16, 16, 16, 16,
    // 216 - 223
    10257, 10257, 10257, 10257, 12305, 12305, 12305, 12305,
    // 224 - 231
    330, 330, 330, 330, 330, 330, 330, 330,
    // 232 - 239
    330, 330, 330, 330, 330, 330, 330, 330,
    // 240 - 247
    330, 330, 330, 330, 330, 330, 330, 330,
    // 248 - 255
    330, 330, 330, 330, 330, 330, 330, 330,
    // 256 - 263
    362, 362, 362, 362, 362, 362, 362, 362,
    // 264 - 271
    362, 362, 362, 362, 362, 362, 362, 362,
    // 272 - 279
    362, 362, 362, 362, 362, 362, 362, 362,
    // 280 - 287
    362, 362, 362, 362, 362, 362, 362, 362,
    // 288 - 295
    878, 878, 878, 878, 878, 878, 878, 878,
    // 296 - 303
    1904, 1904, 1904, 1904, 1936, 1936, 1936, 1936,
    // 304 - 311
    -18413, -18413, -16365, -16365, -14317, -14317, -10221, -10221,
    // 312 - 319
    590, 590, 590, 590, 590, 590, 590, 590,
    // 320 - 327
    782, 782, 782, 782, 782, 782, 782, 782,
    // 328 - 335
    1584, 1584, 1584, 1584, 1616, 1616, 1616, 1616,
    // 336 - 343
    1648, 1648, 1648, 1648, 1680, 1680, 1680, 1680,
    // 344 - 351
    814, 814, 814, 814, 814, 814, 814, 814,
    // 352 - 359
    1776, 1776, 1776, 1776, 1808, 1808, 1808, 1808,
    // 360 - 367
    1840, 1840, 1840, 1840, 1872, 1872, 1872, 1872,
    // 368 - 375
    6157, 6157, 6157, 6157, 6157, 6157, 6157, 6157,
    // 376 - 383
    6157, 6157, 6157, 6157, 6157, 6157, 6157, 6157,
    // 384 - 391
    -12275, -12275, -12275, -12275, -12275, -12275, -12275, -12275,
    // 392 - 399
    -12275, -12275, -12275, -12275, -12275, -12275, -12275, -12275,
    // 400 - 407
    14353, 14353, 14353, 14353, 16401, 16401, 16401, 16401,
    // 408 - 415
    22547, 22547, 24595, 24595, 20497, 20497, 20497, 20497,
    // 416 - 423
    18449, 18449, 18449, 18449, 26643, 26643, 28691, 28691,
    // 424 - 431
    30739, 30739, -32749, -32749, -30701, -30701, -28653, -28653,
    // 432 - 439
    -26605, -26605, -24557, -24557, -22509, -22509, -20461, -20461,
    // 440 - 447
    8207, 8207, 8207, 8207, 8207, 8207, 8207, 8207,
    // 448 - 455
    72, 72, 72, 72, 72, 72, 72, 72,
    // 456 - 463
    72, 72, 72, 72, 72, 72, 72, 72,
    // 464 - 471
    72, 72, 72, 72, 72, 72, 72, 72,
    // 472 - 479
    72, 72, 72, 72, 72, 72, 72, 72,
    // 480 - 487
    72, 72, 72, 72, 72, 72, 72, 72,
    // 488 - 495
    72, 72, 72, 72, 72, 72, 72, 72,
    // 496 - 503
    72, 72, 72, 72, 72, 72, 72, 72,
    // 504 - 511
    72, 72, 72, 72, 72, 72, 72, 72,
    // 512 - 519
    104, 104, 104, 104, 104, 104, 104, 104,
    // 520 - 527
    104, 104, 104, 104, 104, 104, 104, 104,
    // 528 - 535
    104, 104, 104, 104, 104, 104, 104, 104,
    // 536 - 543
    104, 104, 104, 104, 104, 104, 104, 104,
    // 544 - 551
    104, 104, 104, 104, 104, 104, 104, 104,
    // 552 - 559
    104, 104, 104, 104, 104, 104, 104, 104,
    // 560 - 567
    104, 104, 104, 104, 104, 104, 104, 104,
    // 568 - 575
    104, 104, 104, 104, 104, 104, 104, 104,
    // 576 - 583
    4107, 4107, 4107, 4107, 4107, 4107, 4107, 4107,
    // 584 - 591
    4107, 4107, 4107, 4107, 4107, 4107, 4107, 4107,
    // 592 - 599
    4107, 4107, 4107, 4107, 4107, 4107, 4107, 4107,
    // 600 - 607
    4107, 4107, 4107, 4107, 4107, 4107, 4107, 4107,
    // 608 - 615
    266, 266, 266, 266, 266, 266, 266, 266,
    // 616 - 623
    266, 266, 266, 266, 266, 266, 266, 266,
    // 624 - 631
    266, 266, 266, 266, 266, 266, 266, 266,
    // 632 - 639
    266, 266, 266, 266, 266, 266, 266, 266,
    // 640 - 647
    298, 298, 298, 298, 298, 298, 298, 298,
    // 648 - 655
    298, 298, 298, 298, 298, 298, 298, 298,
    // 656 - 663
    298, 298, 298, 298, 298, 298, 298, 298,
    // 664 - 671
    298, 298, 298, 298, 298, 298, 298, 298,
    // 672 - 679
    524, 524, 524, 524, 524, 524, 524, 524,
    // 680 - 687
    524, 524, 524, 524, 524, 524, 524, 524,
    // 688 - 695
    556, 556, 556, 556, 556, 556, 556, 556,
    // 696 - 703
    556, 556, 556, 556, 556, 556, 556, 556,
    // 704 - 711
    136, 136, 136, 136, 136, 136, 136, 136,
    // 712 - 719
    136, 136, 136, 136, 136, 136, 136, 136,
    // 720 - 727
    136, 136, 136, 136, 136, 136, 136, 136,
    // 728 - 735
    136, 136, 136, 136, 136, 136, 136, 136,
    // 736 - 743
    136, 136, 136, 136, 136, 136, 136, 136,
    // 744 - 751
    136, 136, 136, 136, 136, 136, 136, 136,
    // 752 - 759
    136, 136, 136, 136, 136, 136, 136, 136,
    // 760 - 767
    136, 136, 136, 136, 136, 136, 136, 136,
    // 768 - 775
    168, 168, 168, 168, 168, 168, 168, 168,
    // 776 - 783
    168, 168, 168, 168, 168, 168, 168, 168,
    // 784 - 791
    168, 168, 168, 168, 168, 168, 168, 168,
    // 792 - 799
    168, 168, 168, 168, 168, 168, 168, 168,
    // 800 - 807
    168, 168, 168, 168, 168, 168, 168, 168,
    // 808 - 815
    168, 168, 168, 168, 168, 168, 168, 168,
    // 816 - 823
    168, 168, 168, 168, 168, 168, 168, 168,
    // 824 - 831
    168, 168, 168, 168, 168, 168, 168, 168,
    // 832 - 839
    460, 460, 460, 460, 460, 460, 460, 460,
    // 840 - 847
    460, 460, 460, 460, 460, 460, 460, 460,
    // 848 - 855
    492, 492, 492, 492, 492, 492, 492, 492,
    // 856 - 863
    492, 492, 492, 492, 492, 492, 492, 492,
    // 864 - 871
    2059, 2059, 2059, 2059, 2059, 2059, 2059, 2059,
    // 872 - 879
    2059, 2059, 2059, 2059, 2059, 2059, 2059, 2059,
    // 880 - 887
    2059, 2059, 2059, 2059, 2059, 2059, 2059, 2059,
    // 888 - 895
    2059, 2059, 2059, 2059, 2059, 2059, 2059, 2059,
    // 896 - 903
    200, 200, 200, 200, 200, 200, 200, 200,
    // 904 - 911
    200, 200, 200, 200, 200, 200, 200, 200,
    // 912 - 919
    200, 200, 200, 200, 200, 200, 200, 200,
    // 920 - 927
    200, 200, 200, 200, 200, 200, 200, 200,
    // 928 - 935
    200, 200, 200, 200, 200, 200, 200, 200,
    // 936 - 943
    200, 200, 200, 200, 200, 200, 200, 200,
    // 944 - 951
    200, 200, 200, 200, 200, 200, 200, 200,
    // 952 - 959
    200, 200, 200, 200, 200, 200, 200, 200,
    // 960 - 967
    232, 232, 232, 232, 232, 232, 232, 232,
    // 968 - 975
    232, 232, 232, 232, 232, 232, 232, 232,
    // 976 - 983
    232, 232, 232, 232, 232, 232, 232, 232,
    // 984 - 991
    232, 232, 232, 232, 232, 232, 232, 232,
    // 992 - 999
    232, 232, 232, 232, 232, 232, 232, 232,
    // 1000 - 1007
    232, 232, 232, 232, 232, 232, 232, 232,
    // 1008 - 1015
    232, 232, 232, 232, 232, 232, 232, 232,
    // 1016 - 1023
    232, 232, 232, 232, 232, 232, 232, 232,
  ];

  /**
   * Additional make up codes for both White and Black runs
   */
  private static readonly _additionalMakeup: number[] = [
    28679, 28679, 31752, -32759, -31735, -30711, -29687, -28663, 29703, 29703,
    30727, 30727, -27639, -26615, -25591, -24567,
  ];

  /**
   * Initial black run look up table, uses the first 4 bits of a code
   */
  private static readonly _initBlack: number[] = [
    // 0 - 7
    3226, 6412, 200, 168, 38, 38, 134, 134,
    // 8 - 15
    100, 100, 100, 100, 68, 68, 68, 68,
  ];

  private static readonly _twoBitBlack: number[] = [292, 260, 226, 226];

  /**
   * Main black run table, using the last 9 bits of possible 13 bit code
   */
  private static readonly _black: number[] = [
    // 0 - 7
    62, 62, 30, 30, 0, 0, 0, 0,
    // 8 - 15
    0, 0, 0, 0, 0, 0, 0, 0,
    // 16 - 23
    0, 0, 0, 0, 0, 0, 0, 0,
    // 24 - 31
    0, 0, 0, 0, 0, 0, 0, 0,
    // 32 - 39
    3225, 3225, 3225, 3225, 3225, 3225, 3225, 3225,
    // 40 - 47
    3225, 3225, 3225, 3225, 3225, 3225, 3225, 3225,
    // 48 - 55
    3225, 3225, 3225, 3225, 3225, 3225, 3225, 3225,
    // 56 - 63
    3225, 3225, 3225, 3225, 3225, 3225, 3225, 3225,
    // 64 - 71
    588, 588, 588, 588, 588, 588, 588, 588,
    // 72 - 79
    1680, 1680, 20499, 22547, 24595, 26643, 1776, 1776,
    // 80 - 87
    1808, 1808, -24557, -22509, -20461, -18413, 1904, 1904,
    // 88 - 95
    1936, 1936, -16365, -14317, 782, 782, 782, 782,
    // 96 - 103
    814, 814, 814, 814, -12269, -10221, 10257, 10257,
    // 104 - 111
    12305, 12305, 14353, 14353, 16403, 18451, 1712, 1712,
    // 112 - 119
    1744, 1744, 28691, 30739, -32749, -30701, -28653, -26605,
    // 120 - 127
    2061, 2061, 2061, 2061, 2061, 2061, 2061, 2061,
    // 128 - 135
    424, 424, 424, 424, 424, 424, 424, 424,
    // 136 - 143
    424, 424, 424, 424, 424, 424, 424, 424,
    // 144 - 151
    424, 424, 424, 424, 424, 424, 424, 424,
    // 152 - 159
    424, 424, 424, 424, 424, 424, 424, 424,
    // 160 - 167
    750, 750, 750, 750, 1616, 1616, 1648, 1648,
    // 168 - 175
    1424, 1424, 1456, 1456, 1488, 1488, 1520, 1520,
    // 176 - 183
    1840, 1840, 1872, 1872, 1968, 1968, 8209, 8209,
    // 184 - 191
    524, 524, 524, 524, 524, 524, 524, 524,
    // 192 - 199
    556, 556, 556, 556, 556, 556, 556, 556,
    // 200 - 207
    1552, 1552, 1584, 1584, 2000, 2000, 2032, 2032,
    // 208 - 215
    976, 976, 1008, 1008, 1040, 1040, 1072, 1072,
    // 216 - 223
    1296, 1296, 1328, 1328, 718, 718, 718, 718,
    // 224 - 231
    456, 456, 456, 456, 456, 456, 456, 456,
    // 232 - 239
    456, 456, 456, 456, 456, 456, 456, 456,
    // 240 - 247
    456, 456, 456, 456, 456, 456, 456, 456,
    // 248 - 255
    456, 456, 456, 456, 456, 456, 456, 456,
    // 256 - 263
    326, 326, 326, 326, 326, 326, 326, 326,
    // 264 - 271
    326, 326, 326, 326, 326, 326, 326, 326,
    // 272 - 279
    326, 326, 326, 326, 326, 326, 326, 326,
    // 280 - 287
    326, 326, 326, 326, 326, 326, 326, 326,
    // 288 - 295
    326, 326, 326, 326, 326, 326, 326, 326,
    // 296 - 303
    326, 326, 326, 326, 326, 326, 326, 326,
    // 304 - 311
    326, 326, 326, 326, 326, 326, 326, 326,
    // 312 - 319
    326, 326, 326, 326, 326, 326, 326, 326,
    // 320 - 327
    358, 358, 358, 358, 358, 358, 358, 358,
    // 328 - 335
    358, 358, 358, 358, 358, 358, 358, 358,
    // 336 - 343
    358, 358, 358, 358, 358, 358, 358, 358,
    // 344 - 351
    358, 358, 358, 358, 358, 358, 358, 358,
    // 352 - 359
    358, 358, 358, 358, 358, 358, 358, 358,
    // 360 - 367
    358, 358, 358, 358, 358, 358, 358, 358,
    // 368 - 375
    358, 358, 358, 358, 358, 358, 358, 358,
    // 376 - 383
    358, 358, 358, 358, 358, 358, 358, 358,
    // 384 - 391
    490, 490, 490, 490, 490, 490, 490, 490,
    // 392 - 399
    490, 490, 490, 490, 490, 490, 490, 490,
    // 400 - 407
    4113, 4113, 6161, 6161, 848, 848, 880, 880,
    // 408 - 415
    912, 912, 944, 944, 622, 622, 622, 622,
    // 416 - 423
    654, 654, 654, 654, 1104, 1104, 1136, 1136,
    // 424 - 431
    1168, 1168, 1200, 1200, 1232, 1232, 1264, 1264,
    // 432 - 439
    686, 686, 686, 686, 1360, 1360, 1392, 1392,
    // 440 - 447
    12, 12, 12, 12, 12, 12, 12, 12,
    // 448 - 455
    390, 390, 390, 390, 390, 390, 390, 390,
    // 456 - 463
    390, 390, 390, 390, 390, 390, 390, 390,
    // 464 - 471
    390, 390, 390, 390, 390, 390, 390, 390,
    // 472 - 479
    390, 390, 390, 390, 390, 390, 390, 390,
    // 480 - 487
    390, 390, 390, 390, 390, 390, 390, 390,
    // 488 - 495
    390, 390, 390, 390, 390, 390, 390, 390,
    // 496 - 503
    390, 390, 390, 390, 390, 390, 390, 390,
    // 504 - 511
    390, 390, 390, 390, 390, 390, 390, 390,
  ];

  private static readonly _twoDCodes: number[] = [
    // 0 - 7
    80, 88, 23, 71, 30, 30, 62, 62,
    // 8 - 15
    4, 4, 4, 4, 4, 4, 4, 4,
    // 16 - 23
    11, 11, 11, 11, 11, 11, 11, 11,
    // 24 - 31
    11, 11, 11, 11, 11, 11, 11, 11,
    // 32 - 39
    35, 35, 35, 35, 35, 35, 35, 35,
    // 40 - 47
    35, 35, 35, 35, 35, 35, 35, 35,
    // 48 - 55
    51, 51, 51, 51, 51, 51, 51, 51,
    // 56 - 63
    51, 51, 51, 51, 51, 51, 51, 51,
    // 64 - 71
    41, 41, 41, 41, 41, 41, 41, 41,
    // 72 - 79
    41, 41, 41, 41, 41, 41, 41, 41,
    // 80 - 87
    41, 41, 41, 41, 41, 41, 41, 41,
    // 88 - 95
    41, 41, 41, 41, 41, 41, 41, 41,
    // 96 - 103
    41, 41, 41, 41, 41, 41, 41, 41,
    // 104 - 111
    41, 41, 41, 41, 41, 41, 41, 41,
    // 112 - 119
    41, 41, 41, 41, 41, 41, 41, 41,
    // 120 - 127
    41, 41, 41, 41, 41, 41, 41, 41,
  ];

  private _width: number;
  public get width(): number {
    return this._width;
  }

  private _height: number;
  public get height(): number {
    return this._height;
  }

  private _fillOrder: number;
  public get fillOrder(): number {
    return this._fillOrder;
  }

  // Data structures needed to store changing elements for the previous
  // and the current scanline
  private _changingElemSize = 0;
  private _prevChangingElements?: Array<number>;
  private _currChangingElements?: Array<number>;
  private _data!: InputBuffer;
  private _bitPointer = 0;
  private _bytePointer = 0;

  // Element at which to start search in getNextChangingElement
  private _lastChangingElement = 0;
  private _compression = 2;

  // Variables set by T4Options
  private _uncompressedMode = 0;
  private _fillBits = 0;
  private _oneD = 0;

  constructor(opt: TiffFaxDecoderInitOptions) {
    this._fillOrder = opt.fillOrder;
    this._width = opt.width;
    this._height = opt.height;
    this._prevChangingElements = new Array<number>(this._width);
    this._prevChangingElements.fill(0);
    this._currChangingElements = new Array<number>(this._width);
    this._currChangingElements.fill(0);
  }

  private nextNBits(bitsToGet: number): number {
    let b = 0;
    let next = 0;
    let next2next = 0;
    const l = this._data.length - 1;
    const bp = this._bytePointer;

    if (this._fillOrder === 1) {
      b = this._data.getByte(bp);

      if (bp === l) {
        next = 0x00;
        next2next = 0x00;
      } else if (bp + 1 === l) {
        next = this._data.getByte(bp + 1);
        next2next = 0x00;
      } else {
        next = this._data.getByte(bp + 1);
        next2next = this._data.getByte(bp + 2);
      }
    } else if (this._fillOrder === 2) {
      b = TiffFaxDecoder._flipTable[this._data.getByte(bp) & 0xff];

      if (bp === l) {
        next = 0x00;
        next2next = 0x00;
      } else if (bp + 1 === l) {
        next = TiffFaxDecoder._flipTable[this._data.getByte(bp + 1) & 0xff];
        next2next = 0x00;
      } else {
        next = TiffFaxDecoder._flipTable[this._data.getByte(bp + 1) & 0xff];
        next2next =
          TiffFaxDecoder._flipTable[this._data.getByte(bp + 2) & 0xff];
      }
    } else {
      throw new LibError('TIFFFaxDecoder7');
    }

    const bitsLeft = 8 - this._bitPointer;
    let bitsFromNextByte = bitsToGet - bitsLeft;
    let bitsFromNext2NextByte = 0;
    if (bitsFromNextByte > 8) {
      bitsFromNext2NextByte = bitsFromNextByte - 8;
      bitsFromNextByte = 8;
    }

    this._bytePointer = this._bytePointer! + 1;

    const i1 = (b & TiffFaxDecoder._table1[bitsLeft]) << (bitsToGet - bitsLeft);
    let i2 =
      (next & TiffFaxDecoder._table2[bitsFromNextByte]) >>
      (8 - bitsFromNextByte);

    let i3 = 0;
    if (bitsFromNext2NextByte !== 0) {
      i2 <<= bitsFromNext2NextByte;
      i3 =
        (next2next & TiffFaxDecoder._table2[bitsFromNext2NextByte]) >>
        (8 - bitsFromNext2NextByte);
      i2 |= i3;
      this._bytePointer += 1;
      this._bitPointer = bitsFromNext2NextByte;
    } else {
      if (bitsFromNextByte === 8) {
        this._bitPointer = 0;
        this._bytePointer += 1;
      } else {
        this._bitPointer = bitsFromNextByte;
      }
    }

    return i1 | i2;
  }

  private nextLesserThan8Bits(bitsToGet: number): number {
    let b = 0;
    let next = 0;
    const l = this._data.length - 1;
    const bp = this._bytePointer;

    if (this._fillOrder === 1) {
      b = this._data.getByte(bp);
      if (bp === l) {
        next = 0x00;
      } else {
        next = this._data.getByte(bp + 1);
      }
    } else if (this._fillOrder === 2) {
      b = TiffFaxDecoder._flipTable[this._data.getByte(bp) & 0xff];
      if (bp === l) {
        next = 0x00;
      } else {
        next = TiffFaxDecoder._flipTable[this._data.getByte(bp + 1) & 0xff];
      }
    } else {
      throw new LibError('TIFFFaxDecoder7');
    }

    const bitsLeft = 8 - this._bitPointer;
    const bitsFromNextByte = bitsToGet - bitsLeft;

    const shift = bitsLeft - bitsToGet;
    let i1 = 0;
    let i2 = 0;
    if (shift >= 0) {
      i1 = (b & TiffFaxDecoder._table1[bitsLeft]) >> shift;
      this._bitPointer += bitsToGet;
      if (this._bitPointer === 8) {
        this._bitPointer = 0;
        this._bytePointer += 1;
      }
    } else {
      i1 = (b & TiffFaxDecoder._table1[bitsLeft]) << -shift;
      i2 =
        (next & TiffFaxDecoder._table2[bitsFromNextByte]) >>
        (8 - bitsFromNextByte);

      i1 |= i2;
      this._bytePointer += 1;
      this._bitPointer = bitsFromNextByte;
    }

    return i1;
  }

  /**
   * Move pointer backwards by given amount of bits
   */
  private updatePointer(bitsToMoveBack: number): void {
    const i = this._bitPointer - bitsToMoveBack;

    if (i < 0) {
      this._bytePointer -= 1;
      this._bitPointer = 8 + i;
    } else {
      this._bitPointer = i;
    }
  }

  /**
   * Move to the next byte boundary
   */
  private advancePointer(): boolean {
    if (this._bitPointer !== 0) {
      this._bytePointer += 1;
      this._bitPointer = 0;
    }

    return true;
  }

  private setToBlack(
    buffer: InputBuffer,
    lineOffset: number,
    bitOffset: number,
    numBits: number
  ): void {
    let bitNum = 8 * lineOffset + bitOffset;
    const lastBit = bitNum + numBits;

    let byteNum = bitNum >> 3;

    // Handle bits in first byte
    const shift = bitNum & 0x7;
    if (shift > 0) {
      let maskVal = 1 << (7 - shift);
      let val = buffer.getByte(byteNum);
      while (maskVal > 0 && bitNum < lastBit) {
        val |= maskVal;
        maskVal >>= 1;
        ++bitNum;
      }
      buffer.setByte(byteNum, val);
    }

    // Fill in 8 bits at a time
    byteNum = bitNum >> 3;
    while (bitNum < lastBit - 7) {
      buffer.setByte(byteNum++, 255);
      bitNum += 8;
    }

    // Fill in remaining bits
    while (bitNum < lastBit) {
      byteNum = bitNum >> 3;
      buffer.setByte(
        byteNum,
        buffer.getByte(byteNum) | (1 << (7 - (bitNum & 0x7)))
      );
      ++bitNum;
    }
  }

  private decodeNextScanline(
    buffer: InputBuffer,
    lineOffset: number,
    bitOffset: number
  ): void {
    let offset = bitOffset;
    let bits = 0;
    let code = 0;
    let isT = 0;
    let current = 0;
    let entry = 0;
    let twoBits = 0;
    let isWhite = true;

    // Initialize starting of the changing elements array
    this._changingElemSize = 0;

    // While scanline not complete
    while (offset < this._width) {
      while (isWhite) {
        // White run
        current = this.nextNBits(10);
        entry = TiffFaxDecoder._white[current];

        // Get the 3 fields from the entry
        isT = entry & 0x0001;
        bits = (entry >> 1) & 0x0f;

        if (bits === 12) {
          // Additional Make up code
          // Get the next 2 bits
          twoBits = this.nextLesserThan8Bits(2);
          // Consolidate the 2 bits and last 2 bits into 4 bits
          current = ((current << 2) & 0x000c) | twoBits;
          entry = TiffFaxDecoder._additionalMakeup[current];
          // 3 bits 0000 0111
          bits = (entry >> 1) & 0x07;
          // 12 bits
          code = (entry >> 4) & 0x0fff;
          // Skip white run
          offset += code;

          this.updatePointer(4 - bits);
        } else if (bits === 0) {
          // ERROR
          throw new LibError('TIFFFaxDecoder0');
        } else if (bits === 15) {
          // EOL
          throw new LibError('TIFFFaxDecoder1');
        } else {
          // 11 bits - 0000 0111 1111 1111 = 0x07ff
          code = (entry >> 5) & 0x07ff;
          offset += code;

          this.updatePointer(10 - bits);
          if (isT === 0) {
            isWhite = false;
            this._currChangingElements![this._changingElemSize++] = offset;
          }
        }
      }

      // Check whether this run completed one width, if so
      // advance to next byte boundary for compression = 2.
      if (offset === this._width) {
        if (this._compression === 2) {
          this.advancePointer();
        }
        break;
      }

      while (isWhite === false) {
        // Black run
        current = this.nextLesserThan8Bits(4);
        entry = TiffFaxDecoder._initBlack[current];

        // Get the 3 fields from the entry
        isT = entry & 0x0001;
        bits = (entry >> 1) & 0x000f;
        code = (entry >> 5) & 0x07ff;

        if (code === 100) {
          current = this.nextNBits(9);
          entry = TiffFaxDecoder._black[current];

          // Get the 3 fields from the entry
          isT = entry & 0x0001;
          bits = (entry >> 1) & 0x000f;
          code = (entry >> 5) & 0x07ff;

          if (bits === 12) {
            // Additional makeup codes
            this.updatePointer(5);
            current = this.nextLesserThan8Bits(4);
            entry = TiffFaxDecoder._additionalMakeup[current];
            // 3 bits 0000 0111
            bits = (entry >> 1) & 0x07;
            // 12 bits
            code = (entry >> 4) & 0x0fff;

            this.setToBlack(buffer, lineOffset, offset, code);
            offset += code;

            this.updatePointer(4 - bits);
          } else if (bits === 15) {
            // EOL code
            throw new LibError('TIFFFaxDecoder2');
          } else {
            this.setToBlack(buffer, lineOffset, offset, code);
            offset += code;

            this.updatePointer(9 - bits);
            if (isT === 0) {
              isWhite = true;
              this._currChangingElements![this._changingElemSize++] = offset;
            }
          }
        } else if (code === 200) {
          // Is a Terminating code
          current = this.nextLesserThan8Bits(2);
          entry = TiffFaxDecoder._twoBitBlack[current];
          code = (entry >> 5) & 0x07ff;
          bits = (entry >> 1) & 0x0f;

          this.setToBlack(buffer, lineOffset, offset, code);
          offset += code;

          this.updatePointer(2 - bits);
          isWhite = true;
          this._currChangingElements![this._changingElemSize++] = offset;
        } else {
          // Is a Terminating code
          this.setToBlack(buffer, lineOffset, offset, code);
          offset += code;

          this.updatePointer(4 - bits);
          isWhite = true;
          this._currChangingElements![this._changingElemSize++] = offset;
        }
      }

      // Check whether this run completed one width
      if (offset === this._width) {
        if (this._compression === 2) {
          this.advancePointer();
        }
        break;
      }
    }

    this._currChangingElements![this._changingElemSize++] = offset;
  }

  private readEOL(): number {
    if (this._fillBits === 0) {
      if (this.nextNBits(12) !== 1) {
        throw new LibError('TIFFFaxDecoder6');
      }
    } else if (this._fillBits === 1) {
      // First EOL code word xxxx 0000 0000 0001 will occur
      // As many fill bits will be present as required to make
      // the EOL code of 12 bits end on a byte boundary.
      const bitsLeft = 8 - this._bitPointer;

      if (this.nextNBits(bitsLeft) !== 0) {
        throw new LibError('TIFFFaxDecoder8');
      }

      // If the number of bitsLeft is less than 8, then to have a 12
      // bit EOL sequence, two more bytes are certainly going to be
      // required. The first of them has to be all zeros, so ensure
      // that.
      if (bitsLeft < 4) {
        if (this.nextNBits(8) !== 0) {
          throw new LibError('TIFFFaxDecoder8');
        }
      }

      // There might be a random number of fill bytes with 0s, so
      // loop till the EOL of 0000 0001 is found, as long as all
      // the bytes preceding it are 0's.
      let n = 0;
      while ((n = this.nextNBits(8)) !== 1) {
        // If not all zeros
        if (n !== 0) {
          throw new LibError('TIFFFaxDecoder8');
        }
      }
    }

    // If one dimensional encoding mode, then always return 1
    if (this._oneD === 0) {
      return 1;
    } else {
      // Otherwise for 2D encoding mode,
      // The next one bit signifies 1D/2D encoding of next line.
      return this.nextLesserThan8Bits(1);
    }
  }

  private getNextChangingElement(
    a0: number | undefined,
    isWhite: boolean,
    ret: Array<number | undefined>
  ): void {
    // Local copies of instance variables
    const pce = this._prevChangingElements;
    const ces = this._changingElemSize;

    // If the previous match was at an odd element, we still
    // have to search the preceeding element.
    // int start = lastChangingElement & ~0x1;
    let start =
      this._lastChangingElement > 0 ? this._lastChangingElement - 1 : 0;
    if (isWhite) {
      // Search even numbered elements
      start &= ~0x1;
    } else {
      // Search odd numbered elements
      start |= 0x1;
    }

    let i = start;
    for (; i < ces; i += 2) {
      const temp = pce![i]!;
      if (temp > a0!) {
        this._lastChangingElement = i;
        ret[0] = temp;
        break;
      }
    }

    if (i + 1 < ces) {
      ret[1] = pce![i + 1];
    }
  }

  /**
   * Returns run length
   */
  private decodeWhiteCodeWord(): number {
    let current = 0;
    let entry = 0;
    let bits = 0;
    let isT = 0;
    let twoBits = 0;
    let code = -1;
    let runLength = 0;
    let isWhite = true;

    while (isWhite) {
      current = this.nextNBits(10);
      entry = TiffFaxDecoder._white[current];

      // Get the 3 fields from the entry
      isT = entry & 0x0001;
      bits = (entry >> 1) & 0x0f;

      if (bits === 12) {
        // Additional Make up code
        // Get the next 2 bits
        twoBits = this.nextLesserThan8Bits(2);
        // Consolidate the 2 new bits and last 2 bits into 4 bits
        current = ((current << 2) & 0x000c) | twoBits;
        entry = TiffFaxDecoder._additionalMakeup[current];
        // 3 bits 0000 0111
        bits = (entry >> 1) & 0x07;
        // 12 bits
        code = (entry >> 4) & 0x0fff;
        runLength += code;
        this.updatePointer(4 - bits);
      } else if (bits === 0) {
        // ERROR
        throw new LibError('TIFFFaxDecoder0');
      } else if (bits === 15) {
        // EOL
        throw new LibError('TIFFFaxDecoder1');
      } else {
        // 11 bits - 0000 0111 1111 1111 = 0x07ff
        code = (entry >> 5) & 0x07ff;
        runLength += code;
        this.updatePointer(10 - bits);
        if (isT === 0) {
          isWhite = false;
        }
      }
    }

    return runLength;
  }

  /**
   * Returns run length
   */
  private decodeBlackCodeWord() {
    let current = 0;
    let entry = 0;
    let bits = 0;
    let isT = 0;
    let code = -1;
    let runLength = 0;
    let isWhite = false;

    while (!isWhite) {
      current = this.nextLesserThan8Bits(4);
      entry = TiffFaxDecoder._initBlack[current];

      // Get the 3 fields from the entry
      isT = entry & 0x0001;
      bits = (entry >> 1) & 0x000f;
      code = (entry >> 5) & 0x07ff;

      if (code === 100) {
        current = this.nextNBits(9);
        entry = TiffFaxDecoder._black[current];

        // Get the 3 fields from the entry
        isT = entry & 0x0001;
        bits = (entry >> 1) & 0x000f;
        code = (entry >> 5) & 0x07ff;

        if (bits === 12) {
          // Additional makeup codes
          this.updatePointer(5);
          current = this.nextLesserThan8Bits(4);
          entry = TiffFaxDecoder._additionalMakeup[current];
          // 3 bits 0000 0111
          bits = (entry >> 1) & 0x07;
          // 12 bits
          code = (entry >> 4) & 0x0fff;
          runLength += code;

          this.updatePointer(4 - bits);
        } else if (bits === 15) {
          // EOL code
          throw new LibError('TIFFFaxDecoder2');
        } else {
          runLength += code;
          this.updatePointer(9 - bits);
          if (isT === 0) {
            isWhite = true;
          }
        }
      } else if (code === 200) {
        // Is a Terminating code
        current = this.nextLesserThan8Bits(2);
        entry = TiffFaxDecoder._twoBitBlack[current];
        code = (entry >> 5) & 0x07ff;
        runLength += code;
        bits = (entry >> 1) & 0x0f;
        this.updatePointer(2 - bits);
        isWhite = true;
      } else {
        // Is a Terminating code
        runLength += code;
        this.updatePointer(4 - bits);
        isWhite = true;
      }
    }

    return runLength;
  }

  /**
   * One-dimensional decoding methods
   */
  public decode1D(
    out: InputBuffer,
    compData: InputBuffer,
    startX: number,
    height: number
  ): void {
    this._data = compData;
    this._bitPointer = 0;
    this._bytePointer = 0;

    let lineOffset = 0;
    const scanlineStride = Math.trunc((this._width + 7) / 8);

    for (let i = 0; i < height; i++) {
      this.decodeNextScanline(out, lineOffset, startX);
      lineOffset += scanlineStride;
    }
  }

  /**
   * Two-dimensional decoding methods
   */
  public decode2D(
    out: InputBuffer,
    compData: InputBuffer,
    startX: number,
    height: number,
    tiffT4Options: number
  ): void {
    this._data = compData;
    this._compression = 3;

    this._bitPointer = 0;
    this._bytePointer = 0;

    const scanlineStride = Math.trunc((this._width + 7) / 8);

    let a0 = 0;
    let a1 = 0;
    let entry = 0;
    let code = 0;
    let bits = 0;
    let isWhite = false;
    let currIndex = 0;
    let temp: Array<number> | undefined = undefined;

    const b = new Array<number>(2);
    b.fill(0);

    // fillBits - dealt with this in readEOL
    // 1D/2D encoding - dealt with this in readEOL

    // uncompressedMode - haven't dealt with this yet.
    this._oneD = tiffT4Options & 0x01;
    this._uncompressedMode = (tiffT4Options & 0x02) >> 1;
    this._fillBits = (tiffT4Options & 0x04) >> 2;

    // The data must start with an EOL code
    if (this.readEOL() !== 1) {
      throw new LibError('TIFFFaxDecoder3');
    }

    let lineOffset = 0;
    let bitOffset = 0;

    // Then the 1D encoded scanline data will occur, changing elements
    // array gets set.
    this.decodeNextScanline(out, lineOffset, startX);
    lineOffset += scanlineStride;

    for (let lines = 1; lines < height; lines++) {
      // Every line must begin with an EOL followed by a bit which
      // indicates whether the following scanline is 1D or 2D encoded.
      if (this.readEOL() === 0) {
        // 2D encoded scanline follows

        // Initialize previous scanlines changing elements, and
        // initialize current scanline's changing elements array
        temp = this._prevChangingElements;
        this._prevChangingElements = this._currChangingElements;
        this._currChangingElements = temp;
        currIndex = 0;

        // a0 has to be set just before the start of this scanline.
        a0 = -1;
        isWhite = true;
        bitOffset = startX;

        this._lastChangingElement = 0;

        while (bitOffset < this._width) {
          // Get the next changing element
          this.getNextChangingElement(a0, isWhite, b);

          const b1 = b[0];
          const b2 = b[1];

          // Get the next seven bits
          entry = this.nextLesserThan8Bits(7);

          // Run these through the 2DCodes table
          entry = TiffFaxDecoder._twoDCodes[entry] & 0xff;

          // Get the code and the number of bits used up
          code = (entry & 0x78) >> 3;
          bits = entry & 0x07;

          if (code === 0) {
            if (!isWhite) {
              this.setToBlack(out, lineOffset, bitOffset, b2 - bitOffset);
            }
            a0 = b2;
            bitOffset = a0;

            // Set pointer to consume the correct number of bits.
            this.updatePointer(7 - bits);
          } else if (code === 1) {
            // Horizontal
            this.updatePointer(7 - bits);

            // identify the next 2 codes.
            let number = 0;
            if (isWhite) {
              number = this.decodeWhiteCodeWord();
              bitOffset += number;
              this._currChangingElements![currIndex++] = bitOffset;

              number = this.decodeBlackCodeWord();
              this.setToBlack(out, lineOffset, bitOffset, number);
              bitOffset += number;
              this._currChangingElements![currIndex++] = bitOffset;
            } else {
              number = this.decodeBlackCodeWord();
              this.setToBlack(out, lineOffset, bitOffset, number);
              bitOffset += number;
              this._currChangingElements![currIndex++] = bitOffset;

              number = this.decodeWhiteCodeWord();
              bitOffset += number;
              this._currChangingElements![currIndex++] = bitOffset;
            }

            a0 = bitOffset;
          } else if (code <= 8) {
            // Vertical
            a1 = b1 + (code - 5);

            this._currChangingElements![currIndex++] = a1;

            // We write the current color till a1 - 1 pos,
            // since a1 is where the next color starts
            if (!isWhite) {
              this.setToBlack(out, lineOffset, bitOffset, a1 - bitOffset);
            }
            a0 = a1;
            bitOffset = a0;
            isWhite = !isWhite;

            this.updatePointer(7 - bits);
          } else {
            throw new LibError('TIFFFaxDecoder4');
          }
        }

        // Add the changing element beyond the current scanline for the
        // other color too
        this._currChangingElements![currIndex++] = bitOffset;
        this._changingElemSize = currIndex;
      } else {
        // 1D encoded scanline follows
        this.decodeNextScanline(out, lineOffset, startX);
      }

      lineOffset += scanlineStride;
    }
  }

  public decodeT6(
    out: InputBuffer,
    compData: InputBuffer,
    startX: number,
    height: number,
    tiffT6Options: number
  ): void {
    this._data = compData;
    this._compression = 4;

    this._bitPointer = 0;
    this._bytePointer = 0;

    const scanlineStride = Math.trunc((this._width + 7) / 8);

    let a0 = 0;
    let a1 = 0;
    let b1 = 0;
    let b2 = 0;
    let entry = 0;
    let code = 0;
    let bits = 0;
    let isWhite = false;
    let currIndex = 0;
    let temp: Array<number> | undefined = undefined;

    // Return values from getNextChangingElement
    const b = new Array<number>(2);
    b.fill(0);

    this._uncompressedMode = (tiffT6Options & 0x02) >> 1;

    // Local cached reference
    let cce = this._currChangingElements!;

    // Assume invisible preceding row of all white pixels and insert
    // both black and white changing elements beyond the end of this
    // imaginary scanline.
    this._changingElemSize = 0;
    cce[this._changingElemSize++] = this._width;
    cce[this._changingElemSize++] = this._width;

    let lineOffset = 0;
    let bitOffset = 0;

    for (let lines = 0; lines < height; lines++) {
      // a0 has to be set just before the start of the scanline.
      a0 = -1;
      isWhite = true;

      // Assign the changing elements of the previous scanline to
      // prevChangingElems and start putting this new scanline's
      // changing elements into the currChangingElems.
      temp = this._prevChangingElements;
      this._prevChangingElements = this._currChangingElements;
      cce = (this._currChangingElements = temp)!;
      currIndex = 0;

      // Start decoding the scanline at startX in the raster
      bitOffset = startX;

      // Reset search start position for getNextChangingElement
      this._lastChangingElement = 0;

      // Till one whole scanline is decoded
      while (bitOffset < this._width) {
        // Get the next changing element
        this.getNextChangingElement(a0, isWhite, b);
        b1 = b[0];
        b2 = b[1];

        // Get the next seven bits
        entry = this.nextLesserThan8Bits(7);
        // Run these through the 2DCodes table
        entry = TiffFaxDecoder._twoDCodes[entry] & 0xff;

        // Get the code and the number of bits used up
        code = (entry & 0x78) >> 3;
        bits = entry & 0x07;

        if (code === 0) {
          // Pass
          // We always assume WhiteIsZero format for fax.
          if (!isWhite) {
            this.setToBlack(out, lineOffset, bitOffset, b2! - bitOffset);
          }
          a0 = b2;
          bitOffset = a0;

          // Set pointer to only consume the correct number of bits.
          this.updatePointer(7 - bits);
        } else if (code === 1) {
          // Horizontal
          // Set pointer to only consume the correct number of bits.
          this.updatePointer(7 - bits);

          // identify the next 2 alternating color codes.
          let number = 0;
          if (isWhite) {
            // Following are white and black runs
            number = this.decodeWhiteCodeWord();
            bitOffset += number;
            cce[currIndex++] = bitOffset;

            number = this.decodeBlackCodeWord();
            this.setToBlack(out, lineOffset, bitOffset, number);
            bitOffset += number;
            cce[currIndex++] = bitOffset;
          } else {
            // First a black run and then a white run follows
            number = this.decodeBlackCodeWord();
            this.setToBlack(out, lineOffset, bitOffset, number);
            bitOffset += number;
            cce[currIndex++] = bitOffset;

            number = this.decodeWhiteCodeWord();
            bitOffset += number;
            cce[currIndex++] = bitOffset;
          }

          a0 = bitOffset;
        } else if (code <= 8) {
          // Vertical
          a1 = b1 + (code - 5);
          cce[currIndex++] = a1;

          // We write the current color till a1 - 1 pos,
          // since a1 is where the next color starts
          if (!isWhite) {
            this.setToBlack(out, lineOffset, bitOffset, a1 - bitOffset);
          }
          a0 = a1;
          bitOffset = a0;
          isWhite = !isWhite;

          this.updatePointer(7 - bits);
        } else if (code === 11) {
          if (this.nextLesserThan8Bits(3) !== 7) {
            throw new LibError('TIFFFaxDecoder5');
          }

          let zeros = 0;
          let exit = false;

          while (!exit) {
            while (this.nextLesserThan8Bits(1) !== 1) {
              zeros++;
            }

            if (zeros > 5) {
              // Exit code

              // Zeros before exit code
              zeros -= 6;

              if (!isWhite && zeros > 0) {
                cce[currIndex++] = bitOffset;
              }

              // Zeros before the exit code
              bitOffset += zeros;
              if (zeros > 0) {
                // Some zeros have been written
                isWhite = true;
              }

              // Read in the bit which specifies the color of
              // the following run
              if (this.nextLesserThan8Bits(1) === 0) {
                if (!isWhite) {
                  cce[currIndex++] = bitOffset;
                }
                isWhite = true;
              } else {
                if (isWhite) {
                  cce[currIndex++] = bitOffset;
                }
                isWhite = false;
              }

              exit = true;
            }

            if (zeros === 5) {
              if (!isWhite) {
                cce[currIndex++] = bitOffset;
              }
              bitOffset += zeros;

              // Last thing written was white
              isWhite = true;
            } else {
              bitOffset += zeros;

              cce[currIndex++] = bitOffset;
              this.setToBlack(out, lineOffset, bitOffset, 1);
              ++bitOffset;

              // Last thing written was black
              isWhite = false;
            }
          }
        } else {
          throw new LibError(`TIFFFaxDecoder5 ${code}`);
        }
      }

      // Add the changing element beyond the current scanline for the
      // other color too
      cce[currIndex++] = bitOffset;

      // Number of changing elements in this scanline.
      this._changingElemSize = currIndex;

      lineOffset += scanlineStride;
    }
  }
}
