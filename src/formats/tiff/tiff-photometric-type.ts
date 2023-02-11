/** @format */

export enum TiffPhotometricType {
  // 0
  whiteIsZero,
  // 1
  blackIsZero,
  // 2
  rgb,
  // 3
  palette,
  // 4
  transparencyMask,
  // 5
  cmyk,
  // 6
  yCbCr,
  // 7
  reserved7,
  // 8
  cieLab,
  // 9
  iccLab,
  // 10
  ituLab,
  // 32844
  logL,
  // 32845
  logLuv,
  // 32803
  colorFilterArray,
  // 34892
  linearRaw,
  // 51177
  depth,
  unknown,
}

export const TiffPhotometricTypeLength = 17;
