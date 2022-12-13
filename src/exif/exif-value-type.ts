/** @format */

export enum ExifValueType {
  none,
  byte,
  ascii,
  short,
  long,
  rational,
  sbyte,
  undefined,
  sshort,
  slong,
  srational,
  single,
  double,
}

export const ExifValueTypeString = [
  'None',
  'Byte',
  'Ascii',
  'Short',
  'Long',
  'Rational',
  'SByte',
  'Undefined',
  'SShort',
  'SLong',
  'SRational',
  'Single',
  'Double',
];

export const ExifValueTypeSize = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];

export function getExifValueTypeString(type: ExifValueType) {
  return ExifValueTypeString[type];
}

export function getExifValueTypeSize(type: ExifValueType, length = 1) {
  return ExifValueTypeSize[type] * length;
}
