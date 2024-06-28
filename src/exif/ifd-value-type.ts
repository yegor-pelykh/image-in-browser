/** @format */

/** Enumeration representing different IFD value types */
export enum IfdValueType {
  /** No value type */
  none,
  /** Byte value type */
  byte,
  /** ASCII value type */
  ascii,
  /** Short value type */
  short,
  /** Long value type */
  long,
  /** Rational value type */
  rational,
  /** Signed byte value type */
  sByte,
  /** Undefined value type */
  undefined,
  /** Signed short value type */
  sShort,
  /** Signed long value type */
  sLong,
  /** Signed rational value type */
  sRational,
  /** Single precision floating point value type */
  single,
  /** Double precision floating point value type */
  double,
}

/** Array representing the size of each IFD value type */
export const IfdValueTypeSize = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];

/**
 * Function to get the string representation of an IFD value type
 * @param {IfdValueType} type - The IFD value type
 * @returns {string} The string representation of the IFD value type
 */
export function getIfdValueTypeString(type: IfdValueType): string {
  return IfdValueType[type];
}

/**
 * Function to get the size of an IFD value type
 * @param {IfdValueType} type - The IFD value type
 * @param {number} [length=1] - The length multiplier (default is 1)
 * @returns {number} The size of the IFD value type
 */
export function getIfdValueTypeSize(type: IfdValueType, length = 1): number {
  return IfdValueTypeSize[type] * length;
}
