/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { MathOperators } from '../common/math-operators';
import { MemoryImage } from '../common/memory-image';
import { OutputBuffer } from '../common/output-buffer';
import { ExifData } from '../exif/exif-data';
import { Encoder } from './encoder';
import { Jpeg } from './jpeg/jpeg';

/**
 * Encode an image to the JPEG format.
 */
export class JpegEncoder implements Encoder {
  private static readonly ZIGZAG: number[] = [
    0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25,
    30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54,
    20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48,
    49, 57, 58, 62, 63,
  ];

  private static readonly STD_DC_LUMINANCE_NR_CODES: number[] = [
    0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  ];

  private static readonly STD_DC_LUMINANCE_VALUES: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  ];

  private static readonly STD_AC_LUMINANCE_NR_CODES: number[] = [
    0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d,
  ];

  private static readonly STD_AC_LUMINANCE_VALUES: number[] = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
  ];

  private static readonly STD_DC_CHROMINANCE_NR_CODES: number[] = [
    0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
  ];

  private static readonly STD_DC_CHROMINANCE_VALUES: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  ];

  private static readonly STD_AC_CHROMINANCE_NR_CODES: number[] = [
    0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77,
  ];

  private static readonly STD_AC_CHROMINANCE_VALUES: number[] = [
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41,
    0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
    0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1,
    0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
    0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44,
    0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
    0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74,
    0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a,
    0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
    0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7,
    0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
    0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
  ];

  private readonly tableY = new Uint8Array(64);
  private readonly tableUV = new Uint8Array(64);
  private readonly ftableY = new Float32Array(64);
  private readonly ftableUV = new Float32Array(64);

  private readonly bitcode = new Array<Array<number> | undefined>(65535).fill(
    undefined
  );
  private readonly category = new Array<number | undefined>(65535).fill(
    undefined
  );
  private readonly outputfDCTQuant = new Array<number | undefined>(64).fill(
    undefined
  );
  private readonly DU = new Array<number | undefined>(64).fill(undefined);

  private readonly YDU: Float32Array = new Float32Array(64);
  private readonly UDU: Float32Array = new Float32Array(64);
  private readonly VDU: Float32Array = new Float32Array(64);
  private readonly tableRGBYUV: Int32Array = new Int32Array(2048);

  private htYDC: Array<Array<number> | undefined> | undefined;
  private htUVDC: Array<Array<number> | undefined> | undefined;
  private htYAC!: Array<Array<number> | undefined>;
  private htUVAC!: Array<Array<number> | undefined>;

  private currentQuality?: number;

  private byteNew = 0;
  private bytePos = 7;

  private _supportsAnimation = false;
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  constructor(quality = 100) {
    this.initHuffmanTable();
    this.initCategoryNumber();
    this.initRGBYUVTable();
    this.setQuality(quality);
  }

  private static computeHuffmanTable(
    nrcodes: number[],
    stdTable: number[]
  ): Array<Array<number> | undefined> {
    let codevalue = 0;
    let posInTable = 0;
    const HT = new Array<Array<number> | undefined>();
    for (let k = 1; k <= 16; k++) {
      for (let j = 1; j <= nrcodes[k]; j++) {
        const index = stdTable[posInTable];
        if (HT.length <= index) {
          HT.length = index + 1;
        }
        HT[index] = [codevalue, k];
        posInTable++;
        codevalue++;
      }
      codevalue *= 2;
    }
    return HT;
  }

  private static writeMarker(fp: OutputBuffer, marker: number): void {
    fp.writeByte(0xff);
    fp.writeByte(marker & 0xff);
  }

  private static writeAPP0(out: OutputBuffer): void {
    JpegEncoder.writeMarker(out, Jpeg.M_APP0);
    // Length
    out.writeUint16(16);
    // J
    out.writeByte(0x4a);
    // F
    out.writeByte(0x46);
    // I
    out.writeByte(0x49);
    // F
    out.writeByte(0x46);
    // '\0'
    out.writeByte(0);
    // versionhi
    out.writeByte(1);
    // versionlo
    out.writeByte(1);
    // xyunits
    out.writeByte(0);
    // xdensity
    out.writeUint16(1);
    // ydensity
    out.writeUint16(1);
    // thumbnwidth
    out.writeByte(0);
    // thumbnheight
    out.writeByte(0);
  }

  private static writeAPP1(out: OutputBuffer, exif: ExifData): void {
    if (exif.isEmpty) {
      return;
    }

    const exifData = new OutputBuffer();
    exif.write(exifData);
    const exifBytes = exifData.getBytes();

    this.writeMarker(out, Jpeg.M_APP1);
    out.writeUint16(exifBytes.length + 8);
    // Exif\0\0
    const exifSignature = 0x45786966;
    out.writeUint32(exifSignature);
    out.writeUint16(0);
    out.writeBytes(exifBytes);
  }

  private static writeSOF0(
    out: OutputBuffer,
    width: number,
    height: number
  ): void {
    JpegEncoder.writeMarker(out, Jpeg.M_SOF0);
    // Length, truecolor YUV JPG
    out.writeUint16(17);
    // Precision
    out.writeByte(8);
    out.writeUint16(height);
    out.writeUint16(width);
    // nrofcomponents
    out.writeByte(3);
    // IdY
    out.writeByte(1);
    // HVY
    out.writeByte(0x11);
    // QTY
    out.writeByte(0);
    // IdU
    out.writeByte(2);
    // HVU
    out.writeByte(0x11);
    // QTU
    out.writeByte(1);
    // IdV
    out.writeByte(3);
    // HVV
    out.writeByte(0x11);
    // QTV
    out.writeByte(1);
  }

  private static writeSOS(out: OutputBuffer): void {
    JpegEncoder.writeMarker(out, Jpeg.M_SOS);
    // Length
    out.writeUint16(12);
    // Nrofcomponents
    out.writeByte(3);
    // IdY
    out.writeByte(1);
    // HTY
    out.writeByte(0);
    // IdU
    out.writeByte(2);
    // HTU
    out.writeByte(0x11);
    // IdV
    out.writeByte(3);
    // HTV
    out.writeByte(0x11);
    // Ss
    out.writeByte(0);
    // Se
    out.writeByte(0x3f);
    // Bf
    out.writeByte(0);
  }

  private static writeDHT(out: OutputBuffer): void {
    JpegEncoder.writeMarker(out, Jpeg.M_DHT);
    // Length
    out.writeUint16(0x01a2);

    // HTYDCinfo
    out.writeByte(0);
    for (let i = 0; i < 16; i++) {
      out.writeByte(JpegEncoder.STD_DC_LUMINANCE_NR_CODES[i + 1]);
    }
    for (let j = 0; j <= 11; j++) {
      out.writeByte(JpegEncoder.STD_DC_LUMINANCE_VALUES[j]);
    }

    // HTYACinfo
    out.writeByte(0x10);
    for (let k = 0; k < 16; k++) {
      out.writeByte(JpegEncoder.STD_AC_LUMINANCE_NR_CODES[k + 1]);
    }
    for (let l = 0; l <= 161; l++) {
      out.writeByte(JpegEncoder.STD_AC_LUMINANCE_VALUES[l]);
    }

    // HTUDCinfo
    out.writeByte(1);
    for (let m = 0; m < 16; m++) {
      out.writeByte(JpegEncoder.STD_DC_CHROMINANCE_NR_CODES[m + 1]);
    }
    for (let n = 0; n <= 11; n++) {
      out.writeByte(JpegEncoder.STD_DC_CHROMINANCE_VALUES[n]);
    }

    // HTUACinfo
    out.writeByte(0x11);
    for (let o = 0; o < 16; o++) {
      out.writeByte(JpegEncoder.STD_AC_CHROMINANCE_NR_CODES[o + 1]);
    }
    for (let p = 0; p <= 161; p++) {
      out.writeByte(JpegEncoder.STD_AC_CHROMINANCE_VALUES[p]);
    }
  }

  private initHuffmanTable(): void {
    this.htYDC = JpegEncoder.computeHuffmanTable(
      JpegEncoder.STD_DC_LUMINANCE_NR_CODES,
      JpegEncoder.STD_DC_LUMINANCE_VALUES
    );
    this.htUVDC = JpegEncoder.computeHuffmanTable(
      JpegEncoder.STD_DC_CHROMINANCE_NR_CODES,
      JpegEncoder.STD_DC_CHROMINANCE_VALUES
    );
    this.htYAC = JpegEncoder.computeHuffmanTable(
      JpegEncoder.STD_AC_LUMINANCE_NR_CODES,
      JpegEncoder.STD_AC_LUMINANCE_VALUES
    );
    this.htUVAC = JpegEncoder.computeHuffmanTable(
      JpegEncoder.STD_AC_CHROMINANCE_NR_CODES,
      JpegEncoder.STD_AC_CHROMINANCE_VALUES
    );
  }

  private initCategoryNumber(): void {
    let nrlower = 1;
    let nrupper = 2;
    for (let cat = 1; cat <= 15; cat++) {
      // Positive numbers
      for (let nr = nrlower; nr < nrupper; nr++) {
        this.category[32767 + nr] = cat;
        this.bitcode[32767 + nr] = [nr, cat];
      }
      // Negative numbers
      for (let nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
        this.category[32767 + nrneg] = cat;
        this.bitcode[32767 + nrneg] = [nrupper - 1 + nrneg, cat];
      }
      nrlower <<= 1;
      nrupper <<= 1;
    }
  }

  private initRGBYUVTable(): void {
    for (let i = 0; i < 256; i++) {
      this.tableRGBYUV[i] = 19595 * i;
      this.tableRGBYUV[i + 256] = 38470 * i;
      this.tableRGBYUV[i + 512] = 7471 * i + 0x8000;
      this.tableRGBYUV[i + 768] = -11059 * i;
      this.tableRGBYUV[i + 1024] = -21709 * i;
      this.tableRGBYUV[i + 1280] = 32768 * i + 0x807fff;
      this.tableRGBYUV[i + 1536] = -27439 * i;
      this.tableRGBYUV[i + 1792] = -5329 * i;
    }
  }

  private setQuality(quality: number): void {
    const q = MathOperators.clampInt(quality, 1, 100);

    if (this.currentQuality === q) {
      // Don't re-calc if unchanged
      return;
    }

    let sf = 0;
    if (q < 50) {
      sf = Math.floor(5000 / q);
    } else {
      sf = Math.floor(200 - q * 2);
    }

    this.initQuantTables(sf);
    this.currentQuality = q;
  }

  private initQuantTables(sf: number): void {
    const YQT: number[] = [
      16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13,
      16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56,
      68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103,
      121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
    ];

    for (let i = 0; i < 64; i++) {
      let t = Math.floor((YQT[i] * sf + 50) / 100);
      if (t < 1) {
        t = 1;
      } else if (t > 255) {
        t = 255;
      }
      this.tableY[JpegEncoder.ZIGZAG[i]] = t;
    }

    const UVQT: number[] = [
      17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26,
      56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
      99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
      99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    ];

    for (let j = 0; j < 64; j++) {
      let u = Math.floor((UVQT[j] * sf + 50) / 100);
      if (u < 1) {
        u = 1;
      } else if (u > 255) {
        u = 255;
      }
      this.tableUV[JpegEncoder.ZIGZAG[j]] = u;
    }

    const aasf: number[] = [
      1.0, 1.387039845, 1.306562965, 1.175875602, 1.0, 0.785694958, 0.5411961,
      0.275899379,
    ];

    let k = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.ftableY[k] =
          1.0 /
          (this.tableY[JpegEncoder.ZIGZAG[k]] * aasf[row] * aasf[col] * 8.0);
        this.ftableUV[k] =
          1.0 /
          (this.tableUV[JpegEncoder.ZIGZAG[k]] * aasf[row] * aasf[col] * 8.0);
        k++;
      }
    }
  }

  // DCT & quantization core
  private fDCTQuant(
    data: Float32Array,
    fdtbl: Float32Array
  ): Array<number | undefined> {
    // Pass 1: process rows.
    let dataOff = 0;
    const I8 = 8;
    const I64 = 64;
    for (let i = 0; i < I8; ++i) {
      const d0 = data[dataOff];
      const d1 = data[dataOff + 1];
      const d2 = data[dataOff + 2];
      const d3 = data[dataOff + 3];
      const d4 = data[dataOff + 4];
      const d5 = data[dataOff + 5];
      const d6 = data[dataOff + 6];
      const d7 = data[dataOff + 7];

      const tmp0 = d0 + d7;
      const tmp7 = d0 - d7;
      const tmp1 = d1 + d6;
      const tmp6 = d1 - d6;
      const tmp2 = d2 + d5;
      const tmp5 = d2 - d5;
      const tmp3 = d3 + d4;
      const tmp4 = d3 - d4;

      // Even part
      // Phase 2
      let tmp10 = tmp0 + tmp3;
      const tmp13 = tmp0 - tmp3;
      let tmp11 = tmp1 + tmp2;
      let tmp12 = tmp1 - tmp2;

      // Phase 3
      data[dataOff] = tmp10 + tmp11;
      data[dataOff + 4] = tmp10 - tmp11;

      // C4
      const z1 = (tmp12 + tmp13) * 0.707106781;
      // Phase 5
      data[dataOff + 2] = tmp13 + z1;
      data[dataOff + 6] = tmp13 - z1;

      // Odd part
      // Phase 2
      tmp10 = tmp4 + tmp5;
      tmp11 = tmp5 + tmp6;
      tmp12 = tmp6 + tmp7;

      // The rotator is modified from fig 4-8 to avoid extra negations.
      // c6
      const z5 = (tmp10 - tmp12) * 0.382683433;
      // c2 - c6
      const z2 = 0.5411961 * tmp10 + z5;
      // c2 + c6
      const z4 = 1.306562965 * tmp12 + z5;
      // c4
      const z3 = tmp11 * 0.707106781;

      // Phase 5
      const z11 = tmp7 + z3;
      const z13 = tmp7 - z3;

      // Phase 6
      data[dataOff + 5] = z13 + z2;
      data[dataOff + 3] = z13 - z2;
      data[dataOff + 1] = z11 + z4;
      data[dataOff + 7] = z11 - z4;

      // Advance pointer to next row
      dataOff += 8;
    }

    // Pass 2: process columns.
    dataOff = 0;
    for (let i = 0; i < I8; ++i) {
      const d0 = data[dataOff];
      const d1 = data[dataOff + 8];
      const d2 = data[dataOff + 16];
      const d3 = data[dataOff + 24];
      const d4 = data[dataOff + 32];
      const d5 = data[dataOff + 40];
      const d6 = data[dataOff + 48];
      const d7 = data[dataOff + 56];

      const tmp0p2 = d0 + d7;
      const tmp7p2 = d0 - d7;
      const tmp1p2 = d1 + d6;
      const tmp6p2 = d1 - d6;
      const tmp2p2 = d2 + d5;
      const tmp5p2 = d2 - d5;
      const tmp3p2 = d3 + d4;
      const tmp4p2 = d3 - d4;

      // Even part
      // Phase 2
      let tmp10p2 = tmp0p2 + tmp3p2;
      const tmp13p2 = tmp0p2 - tmp3p2;
      let tmp11p2 = tmp1p2 + tmp2p2;
      let tmp12p2 = tmp1p2 - tmp2p2;

      // Phase 3
      data[dataOff] = tmp10p2 + tmp11p2;
      data[dataOff + 32] = tmp10p2 - tmp11p2;

      // c4
      const z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
      // Phase 5
      data[dataOff + 16] = tmp13p2 + z1p2;
      data[dataOff + 48] = tmp13p2 - z1p2;

      // Odd part
      // Phase 2
      tmp10p2 = tmp4p2 + tmp5p2;
      tmp11p2 = tmp5p2 + tmp6p2;
      tmp12p2 = tmp6p2 + tmp7p2;

      // The rotator is modified from fig 4-8 to avoid extra negations.
      // c6
      const z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
      // c2 - c6
      const z2p2 = 0.5411961 * tmp10p2 + z5p2;
      // c2 + c6
      const z4p2 = 1.306562965 * tmp12p2 + z5p2;
      // c4
      const z3p2 = tmp11p2 * 0.707106781;
      // Phase 5
      const z11p2 = tmp7p2 + z3p2;
      const z13p2 = tmp7p2 - z3p2;

      // Phase 6
      data[dataOff + 40] = z13p2 + z2p2;
      data[dataOff + 24] = z13p2 - z2p2;
      data[dataOff + 8] = z11p2 + z4p2;
      data[dataOff + 56] = z11p2 - z4p2;

      // Advance pointer to next column
      dataOff++;
    }

    // Quantize/descale the coefficients
    for (let i = 0; i < I64; ++i) {
      // Apply the quantization and scaling factor & Round to nearest integer
      const fDCTQuant = data[i] * fdtbl[i];
      this.outputfDCTQuant[i] =
        fDCTQuant > 0.0
          ? Math.trunc(fDCTQuant + 0.5)
          : Math.trunc(fDCTQuant - 0.5);
    }

    return this.outputfDCTQuant;
  }

  private writeDQT(out: OutputBuffer): void {
    JpegEncoder.writeMarker(out, Jpeg.M_DQT);
    // Length
    out.writeUint16(132);
    out.writeByte(0);
    for (let i = 0; i < 64; i++) {
      out.writeByte(this.tableY[i]);
    }
    out.writeByte(1);
    for (let j = 0; j < 64; j++) {
      out.writeByte(this.tableUV[j]);
    }
  }

  private writeBits(out: OutputBuffer, bits: number[]): void {
    const value = bits[0];
    let posval = bits[1] - 1;
    while (posval >= 0) {
      if ((value & (1 << posval)) !== 0) {
        this.byteNew |= 1 << this.bytePos;
      }
      posval--;
      this.bytePos--;
      if (this.bytePos < 0) {
        if (this.byteNew === 0xff) {
          out.writeByte(0xff);
          out.writeByte(0);
        } else {
          out.writeByte(this.byteNew);
        }
        this.bytePos = 7;
        this.byteNew = 0;
      }
    }
  }

  private resetBits(): void {
    this.byteNew = 0;
    this.bytePos = 7;
  }

  private processDU(
    out: OutputBuffer,
    CDU: Float32Array,
    fdtbl: Float32Array,
    DC: number,
    HTAC: Array<Array<number> | undefined>,
    HTDC?: Array<Array<number> | undefined>
  ): number | undefined {
    const EOB = HTAC[0x00];
    const M16zeroes = HTAC[0xf0];
    const I16 = 16;
    const I63 = 63;
    const I64 = 64;
    const DU_DCT = this.fDCTQuant(CDU, fdtbl);
    let dc = DC;
    let pos = 0;

    // ZigZag reorder
    for (let j = 0; j < I64; ++j) {
      this.DU[JpegEncoder.ZIGZAG[j]] = DU_DCT[j];
    }

    const Diff = this.DU[0]! - dc;
    dc = this.DU[0]!;
    // Encode DC
    if (Diff === 0) {
      // Diff might be 0
      this.writeBits(out, HTDC![0]!);
    } else {
      pos = 32767 + Diff;
      this.writeBits(out, HTDC![this.category[pos]!]!);
      this.writeBits(out, this.bitcode[pos]!);
    }

    // Encode ACs
    let end0pos = 63;
    // eslint-disable-next-line no-empty
    for (; end0pos > 0 && this.DU[end0pos] === 0; end0pos--) {}
    //End0pos = first element in reverse order !=0
    if (end0pos === 0) {
      this.writeBits(out, EOB!);
      return dc;
    }

    let i = 1;
    while (i <= end0pos) {
      const startpos = i;
      // eslint-disable-next-line no-empty
      for (; this.DU[i] === 0 && i <= end0pos; ++i) {}

      let nrzeroes = i - startpos;
      if (nrzeroes >= I16) {
        const lng = nrzeroes >> 4;
        for (let nrmarker = 1; nrmarker <= lng; ++nrmarker) {
          this.writeBits(out, M16zeroes!);
        }
        nrzeroes &= 0xf;
      }
      pos = 32767 + this.DU[i]!;
      this.writeBits(out, HTAC[(nrzeroes << 4) + this.category[pos]!]!);
      this.writeBits(out, this.bitcode[pos]!);
      i++;
    }

    if (end0pos !== I63) {
      this.writeBits(out, EOB!);
    }

    return dc;
  }

  public encodeImage(image: MemoryImage): Uint8Array {
    const fp = new OutputBuffer({
      bigEndian: true,
    });

    // Add JPEG headers
    JpegEncoder.writeMarker(fp, Jpeg.M_SOI);
    JpegEncoder.writeAPP0(fp);
    JpegEncoder.writeAPP1(fp, image.exifData);
    this.writeDQT(fp);
    JpegEncoder.writeSOF0(fp, image.width, image.height);
    JpegEncoder.writeDHT(fp);
    JpegEncoder.writeSOS(fp);

    // Encode 8x8 macroblocks
    let DCY: number | undefined = 0;
    let DCU: number | undefined = 0;
    let DCV: number | undefined = 0;

    this.resetBits();

    const width = image.width;
    const height = image.height;

    const imageData = image.getBytes();
    const quadWidth = width * 4;
    // Let tripleWidth: number = width * 3;
    // let first: Boolean = true;

    let y = 0;
    while (y < height) {
      let x = 0;
      while (x < quadWidth) {
        const start = quadWidth * y + x;
        for (let pos = 0; pos < 64; pos++) {
          // / 8
          const row = pos >> 3;
          // % 8
          const col = (pos & 7) * 4;
          let p = start + row * quadWidth + col;

          if (y + row >= height) {
            // Padding bottom
            p -= quadWidth * (y + 1 + row - height);
          }

          if (x + col >= quadWidth) {
            // Padding right
            p -= x + col - quadWidth + 4;
          }

          const r = imageData[p++];
          const g = imageData[p++];
          const b = imageData[p++];

          // Calculate YUV values
          this.YDU[pos] =
            ((this.tableRGBYUV[r] +
              this.tableRGBYUV[g + 256] +
              this.tableRGBYUV[b + 512]) >>
              16) -
            128.0;

          this.UDU[pos] =
            ((this.tableRGBYUV[r + 768] +
              this.tableRGBYUV[g + 1024] +
              this.tableRGBYUV[b + 1280]) >>
              16) -
            128.0;

          this.VDU[pos] =
            ((this.tableRGBYUV[r + 1280] +
              this.tableRGBYUV[g + 1536] +
              this.tableRGBYUV[b + 1792]) >>
              16) -
            128.0;
        }

        DCY = this.processDU(
          fp,
          this.YDU,
          this.ftableY,
          DCY!,
          this.htYAC,
          this.htYDC
        );
        DCU = this.processDU(
          fp,
          this.UDU,
          this.ftableUV,
          DCU!,
          this.htUVAC,
          this.htUVDC
        );
        DCV = this.processDU(
          fp,
          this.VDU,
          this.ftableUV,
          DCV!,
          this.htUVAC,
          this.htUVDC
        );

        x += 32;
      }

      y += 8;
    }

    // Do the bit alignment of the EOI marker
    if (this.bytePos >= 0) {
      const fillBits = [(1 << (this.bytePos + 1)) - 1, this.bytePos + 1];
      this.writeBits(fp, fillBits);
    }

    JpegEncoder.writeMarker(fp, Jpeg.M_EOI);

    return fp.getBytes();
  }

  public encodeAnimation(_: FrameAnimation): Uint8Array | undefined {
    return undefined;
  }
}
