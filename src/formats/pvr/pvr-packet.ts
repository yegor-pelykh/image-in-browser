/** @format */

import { TypedArray } from '../../common/typings.js';
import { PvrBitUtility } from './pvr-bit-utility.js';
import { PvrColorRgb } from './pvr-color-rgb.js';
import { PvrColorRgba } from './pvr-color-rgba.js';

/**
 * Ported from Jeffrey Lim's PVRTC encoder/decoder,
 * https://bitbucket.org/jthlim/pvrtccompressor
 */
export class PvrPacket {
  private static readonly bits14 = (1 << 14) - 1;
  private static readonly bits15 = (1 << 15) - 1;

  private static readonly mortonTable = [
    0x0000, 0x0001, 0x0004, 0x0005, 0x0010, 0x0011, 0x0014, 0x0015, 0x0040,
    0x0041, 0x0044, 0x0045, 0x0050, 0x0051, 0x0054, 0x0055, 0x0100, 0x0101,
    0x0104, 0x0105, 0x0110, 0x0111, 0x0114, 0x0115, 0x0140, 0x0141, 0x0144,
    0x0145, 0x0150, 0x0151, 0x0154, 0x0155, 0x0400, 0x0401, 0x0404, 0x0405,
    0x0410, 0x0411, 0x0414, 0x0415, 0x0440, 0x0441, 0x0444, 0x0445, 0x0450,
    0x0451, 0x0454, 0x0455, 0x0500, 0x0501, 0x0504, 0x0505, 0x0510, 0x0511,
    0x0514, 0x0515, 0x0540, 0x0541, 0x0544, 0x0545, 0x0550, 0x0551, 0x0554,
    0x0555, 0x1000, 0x1001, 0x1004, 0x1005, 0x1010, 0x1011, 0x1014, 0x1015,
    0x1040, 0x1041, 0x1044, 0x1045, 0x1050, 0x1051, 0x1054, 0x1055, 0x1100,
    0x1101, 0x1104, 0x1105, 0x1110, 0x1111, 0x1114, 0x1115, 0x1140, 0x1141,
    0x1144, 0x1145, 0x1150, 0x1151, 0x1154, 0x1155, 0x1400, 0x1401, 0x1404,
    0x1405, 0x1410, 0x1411, 0x1414, 0x1415, 0x1440, 0x1441, 0x1444, 0x1445,
    0x1450, 0x1451, 0x1454, 0x1455, 0x1500, 0x1501, 0x1504, 0x1505, 0x1510,
    0x1511, 0x1514, 0x1515, 0x1540, 0x1541, 0x1544, 0x1545, 0x1550, 0x1551,
    0x1554, 0x1555, 0x4000, 0x4001, 0x4004, 0x4005, 0x4010, 0x4011, 0x4014,
    0x4015, 0x4040, 0x4041, 0x4044, 0x4045, 0x4050, 0x4051, 0x4054, 0x4055,
    0x4100, 0x4101, 0x4104, 0x4105, 0x4110, 0x4111, 0x4114, 0x4115, 0x4140,
    0x4141, 0x4144, 0x4145, 0x4150, 0x4151, 0x4154, 0x4155, 0x4400, 0x4401,
    0x4404, 0x4405, 0x4410, 0x4411, 0x4414, 0x4415, 0x4440, 0x4441, 0x4444,
    0x4445, 0x4450, 0x4451, 0x4454, 0x4455, 0x4500, 0x4501, 0x4504, 0x4505,
    0x4510, 0x4511, 0x4514, 0x4515, 0x4540, 0x4541, 0x4544, 0x4545, 0x4550,
    0x4551, 0x4554, 0x4555, 0x5000, 0x5001, 0x5004, 0x5005, 0x5010, 0x5011,
    0x5014, 0x5015, 0x5040, 0x5041, 0x5044, 0x5045, 0x5050, 0x5051, 0x5054,
    0x5055, 0x5100, 0x5101, 0x5104, 0x5105, 0x5110, 0x5111, 0x5114, 0x5115,
    0x5140, 0x5141, 0x5144, 0x5145, 0x5150, 0x5151, 0x5154, 0x5155, 0x5400,
    0x5401, 0x5404, 0x5405, 0x5410, 0x5411, 0x5414, 0x5415, 0x5440, 0x5441,
    0x5444, 0x5445, 0x5450, 0x5451, 0x5454, 0x5455, 0x5500, 0x5501, 0x5504,
    0x5505, 0x5510, 0x5511, 0x5514, 0x5515, 0x5540, 0x5541, 0x5544, 0x5545,
    0x5550, 0x5551, 0x5554, 0x5555,
  ];

  public static readonly bilinearFactors = [
    [4, 4, 4, 4],
    [2, 6, 2, 6],
    [8, 0, 8, 0],
    [6, 2, 6, 2],
    [2, 2, 6, 6],
    [1, 3, 3, 9],
    [4, 0, 12, 0],
    [3, 1, 9, 3],
    [8, 8, 0, 0],
    [4, 12, 0, 0],
    [16, 0, 0, 0],
    [12, 4, 0, 0],
    [6, 6, 2, 2],
    [3, 9, 1, 3],
    [12, 0, 4, 0],
    [9, 3, 3, 1],
  ];

  // Weights are { colorA, colorB, alphaA, alphaB }
  public static readonly weights = [
    // Weights for Mode = 0
    [8, 0, 8, 0],
    [5, 3, 5, 3],
    [3, 5, 3, 5],
    [0, 8, 0, 8],

    // Weights for Mode = 1
    [8, 0, 8, 0],
    [4, 4, 4, 4],
    [4, 4, 0, 0],
    [0, 8, 0, 8],
  ];

  private _rawData: Uint32Array;
  public get rawData(): Uint32Array {
    return this._rawData;
  }

  private _index: number = 0;
  public get index(): number {
    return this._index;
  }

  public get modulationData(): number {
    return this._rawData[this._index];
  }
  public set modulationData(x: number) {
    this._rawData[this._index] = x;
  }

  public get colorData(): number {
    return this._rawData[this._index + 1];
  }
  public set colorData(x: number) {
    this._rawData[this._index + 1] = x;
  }

  private _usePunchthroughAlpha: boolean = false;
  public get usePunchthroughAlpha(): boolean {
    return this._usePunchthroughAlpha;
  }
  public set usePunchthroughAlpha(x: boolean) {
    this._usePunchthroughAlpha = x;
    this.colorData = this.getColorData();
  }

  private _colorA: number = 0;
  public get colorA(): number {
    return this._colorA;
  }
  public set colorA(x: number) {
    this._colorA = x;
    this.colorData = this.getColorData();
  }

  private _colorAIsOpaque: boolean = false;
  public get colorAIsOpaque(): boolean {
    return this._colorAIsOpaque;
  }
  public set colorAIsOpaque(x: boolean) {
    this._colorAIsOpaque = x;
    this.colorData = this.getColorData();
  }

  private _colorB: number = 0;
  public get colorB(): number {
    return this._colorB;
  }
  public set colorB(x: number) {
    this._colorB = x;
    this.colorData = this.getColorData();
  }

  private _colorBIsOpaque: boolean = false;
  public get colorBIsOpaque(): boolean {
    return this._colorBIsOpaque;
  }
  public set colorBIsOpaque(x: boolean) {
    this._colorBIsOpaque = x;
    this.colorData = this.getColorData();
  }

  constructor(data: TypedArray) {
    this._rawData = new Uint32Array(data.buffer);
  }

  private static getMortonNumber(x: number, y: number): number {
    return (
      (this.mortonTable[x >> 8] << 17) |
      (this.mortonTable[y >> 8] << 16) |
      (this.mortonTable[x & 0xff] << 1) |
      this.mortonTable[y & 0xff]
    );
  }

  private getColorData(): number {
    return (
      (this.usePunchthroughAlpha ? 1 : 0) |
      ((this.colorA & PvrPacket.bits14) << 1) |
      ((this.colorAIsOpaque ? 1 : 0) << 15) |
      ((this.colorB & PvrPacket.bits15) << 16) |
      ((this.colorBIsOpaque ? 1 : 0) << 31)
    );
  }

  private update(): void {
    const x = this.colorData;
    this.usePunchthroughAlpha = (x & 1) === 1;
    this.colorA = (x >> 1) & PvrPacket.bits14;
    this.colorAIsOpaque = ((x >> 15) & 1) === 1;
    this.colorB = (x >> 16) & PvrPacket.bits15;
    this.colorBIsOpaque = ((x >> 31) & 1) === 1;
  }

  public setBlock(x: number, y: number): void {
    this.setIndex(PvrPacket.getMortonNumber(x, y));
  }

  public setIndex(i: number): void {
    // A PvrPacket uses 2 uint32 values, so get the physical index
    // from the logical index by multiplying by 2.
    this._index = i << 1;
    // Pull in the values from the raw data.
    this.update();
  }

  public setColorRgbA(c: PvrColorRgb): void {
    const r = PvrBitUtility.bitScale8To5Floor[c.r];
    const g = PvrBitUtility.bitScale8To5Floor[c.g];
    const b = PvrBitUtility.bitScale8To4Floor[c.b];
    this.colorA = (r << 9) | (g << 4) | b;
    this.colorAIsOpaque = true;
  }

  public setColorRgbaA(c: PvrColorRgba): void {
    const a = PvrBitUtility.bitScale8To3Floor[c.a];
    if (a === 7) {
      const r = PvrBitUtility.bitScale8To5Floor[c.r];
      const g = PvrBitUtility.bitScale8To5Floor[c.g];
      const b = PvrBitUtility.bitScale8To4Floor[c.b];
      this.colorA = (r << 9) | (g << 4) | b;
      this.colorAIsOpaque = true;
    } else {
      const r = PvrBitUtility.bitScale8To4Floor[c.r];
      const g = PvrBitUtility.bitScale8To4Floor[c.g];
      const b = PvrBitUtility.bitScale8To3Floor[c.b];
      this.colorA = (a << 11) | (r << 7) | (g << 3) | b;
      this.colorAIsOpaque = false;
    }
  }

  public setColorRgbB(c: PvrColorRgb): void {
    const r = PvrBitUtility.bitScale8To5Ceil[c.r];
    const g = PvrBitUtility.bitScale8To5Ceil[c.g];
    const b = PvrBitUtility.bitScale8To5Ceil[c.b];
    this.colorB = (r << 10) | (g << 5) | b;
    this.colorBIsOpaque = false;
  }

  public setColorRgbaB(c: PvrColorRgba): void {
    const a = PvrBitUtility.bitScale8To3Ceil[c.a];
    if (a === 7) {
      const r = PvrBitUtility.bitScale8To5Ceil[c.r];
      const g = PvrBitUtility.bitScale8To5Ceil[c.g];
      const b = PvrBitUtility.bitScale8To5Ceil[c.b];
      this.colorB = (r << 10) | (g << 5) | b;
      this.colorBIsOpaque = true;
    } else {
      const r = PvrBitUtility.bitScale8To4Ceil[c.r];
      const g = PvrBitUtility.bitScale8To4Ceil[c.g];
      const b = PvrBitUtility.bitScale8To4Ceil[c.b];
      this.colorB = (a << 12) | (r << 8) | (g << 4) | b;
      this.colorBIsOpaque = false;
    }
  }

  public getColorRgbA(): PvrColorRgb {
    if (this.colorAIsOpaque) {
      const r = this.colorA >> 9;
      const g = (this.colorA >> 4) & 0x1f;
      const b = this.colorA & 0xf;
      return new PvrColorRgb(
        PvrBitUtility.bitScale5To8[r],
        PvrBitUtility.bitScale5To8[g],
        PvrBitUtility.bitScale4To8[b]
      );
    } else {
      const r = (this.colorA >> 7) & 0xf;
      const g = (this.colorA >> 3) & 0xf;
      const b = this.colorA & 7;
      return new PvrColorRgb(
        PvrBitUtility.bitScale4To8[r],
        PvrBitUtility.bitScale4To8[g],
        PvrBitUtility.bitScale3To8[b]
      );
    }
  }

  public getColorRgbaA(): PvrColorRgba {
    if (this.colorAIsOpaque) {
      const r = this.colorA >> 9;
      const g = (this.colorA >> 4) & 0x1f;
      const b = this.colorA & 0xf;
      return new PvrColorRgba(
        PvrBitUtility.bitScale5To8[r],
        PvrBitUtility.bitScale5To8[g],
        PvrBitUtility.bitScale4To8[b],
        255
      );
    } else {
      const a = (this.colorA >> 11) & 7;
      const r = (this.colorA >> 7) & 0xf;
      const g = (this.colorA >> 3) & 0xf;
      const b = this.colorA & 7;
      return new PvrColorRgba(
        PvrBitUtility.bitScale4To8[r],
        PvrBitUtility.bitScale4To8[g],
        PvrBitUtility.bitScale3To8[b],
        PvrBitUtility.bitScale3To8[a]
      );
    }
  }

  public getColorRgbB(): PvrColorRgb {
    if (this.colorBIsOpaque) {
      const r = this.colorB >> 10;
      const g = (this.colorB >> 5) & 0x1f;
      const b = this.colorB & 0x1f;
      return new PvrColorRgb(
        PvrBitUtility.bitScale5To8[r],
        PvrBitUtility.bitScale5To8[g],
        PvrBitUtility.bitScale5To8[b]
      );
    } else {
      const r = (this.colorB >> 8) & 0xf;
      const g = (this.colorB >> 4) & 0xf;
      const b = this.colorB & 0xf;
      return new PvrColorRgb(
        PvrBitUtility.bitScale4To8[r],
        PvrBitUtility.bitScale4To8[g],
        PvrBitUtility.bitScale4To8[b]
      );
    }
  }

  public getColorRgbaB(): PvrColorRgba {
    if (this.colorBIsOpaque) {
      const r = this.colorB >> 10;
      const g = (this.colorB >> 5) & 0x1f;
      const b = this.colorB & 0x1f;
      return new PvrColorRgba(
        PvrBitUtility.bitScale5To8[r],
        PvrBitUtility.bitScale5To8[g],
        PvrBitUtility.bitScale5To8[b],
        255
      );
    } else {
      const a = (this.colorB >> 12) & 7;
      const r = (this.colorB >> 8) & 0xf;
      const g = (this.colorB >> 4) & 0xf;
      const b = this.colorB & 0xf;
      return new PvrColorRgba(
        PvrBitUtility.bitScale4To8[r],
        PvrBitUtility.bitScale4To8[g],
        PvrBitUtility.bitScale4To8[b],
        PvrBitUtility.bitScale3To8[a]
      );
    }
  }
}
