/** @format */

export enum IfdValueType {
  none,
  byte,
  ascii,
  short,
  long,
  rational,
  sByte,
  undefined,
  sShort,
  sLong,
  sRational,
  single,
  double,
}

export const IfdValueTypeSize = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];

export function getIfdValueTypeString(type: IfdValueType) {
  return IfdValueType[type];
}

export function getIfdValueTypeSize(type: IfdValueType, length = 1) {
  return IfdValueTypeSize[type] * length;
}
