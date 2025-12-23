/** @format */

import { OutputBuffer } from '../../common/output-buffer.js';
import { Rational } from '../../common/rational.js';
import { LibError } from '../../error/lib-error.js';
import {
  getIfdValueTypeSize,
  getIfdValueTypeString,
  IfdValueType,
} from '../ifd-value-type.js';

/**
 * Abstract class representing an IFD (Image File Directory) value.
 */
export abstract class IfdValue {
  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.none;
  }

  /**
   * Gets the length of the IFD value.
   * @returns {number} The length of the IFD value.
   */
  public get length(): number {
    return 0;
  }

  /**
   * Gets the data size of the IFD value.
   * @returns {number} The data size of the IFD value.
   */
  public get dataSize(): number {
    return getIfdValueTypeSize(this.type, this.length);
  }

  /**
   * Gets the type string of the IFD value.
   * @returns {string} The type string of the IFD value.
   */
  public get typeString(): string {
    return getIfdValueTypeString(this.type);
  }

  /**
   * Converts the IFD value to a boolean.
   * @param {number} [_index] - Optional index.
   * @returns {boolean} The boolean representation of the IFD value.
   */
  public toBool(_index?: number): boolean {
    return false;
  }

  /**
   * Converts the IFD value to an integer.
   * @param {number} [_index] - Optional index.
   * @returns {number} The integer representation of the IFD value.
   */
  public toInt(_index?: number): number {
    return 0;
  }

  /**
   * Converts the IFD value to a double.
   * @param {number} [_index] - Optional index.
   * @returns {number} The double representation of the IFD value.
   */
  public toDouble(_index?: number): number {
    return 0;
  }

  /**
   * Converts the IFD value to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the IFD value.
   */
  public toData(): Uint8Array {
    return new Uint8Array();
  }

  /**
   * Converts the IFD value to a Rational.
   * @param {number} [_index] - Optional index.
   * @returns {Rational} The Rational representation of the IFD value.
   */
  public toRational(_index?: number): Rational {
    return new Rational(0, 1);
  }

  /**
   * Writes the IFD value to an output buffer.
   * @param {OutputBuffer} _out - The output buffer.
   */
  public write(_out: OutputBuffer): void {}

  /**
   * Sets the IFD value to a boolean.
   * @param {boolean} _v - The boolean value.
   * @param {number} [_index] - Optional index.
   */
  public setBool(_v: boolean, _index?: number): void {}

  /**
   * Sets the IFD value to an integer.
   * @param {number} _v - The integer value.
   * @param {number} [_index] - Optional index.
   */
  public setInt(_v: number, _index?: number): void {}

  /**
   * Sets the IFD value to a double.
   * @param {number} _v - The double value.
   * @param {number} [_index] - Optional index.
   */
  public setDouble(_v: number, _index?: number): void {}

  /**
   * Sets the IFD value to a Rational.
   * @param {number} _numerator - The numerator of the Rational.
   * @param {number} _denomitator - The denominator of the Rational.
   * @param {number} [_index] - Optional index.
   */
  public setRational(
    _numerator: number,
    _denomitator: number,
    _index?: number
  ): void {}

  /**
   * Sets the IFD value to a string.
   * @param {string} _v - The string value.
   */
  public setString(_v: string): void {}

  /**
   * Checks if the IFD value is equal to another IFD value.
   * @param {IfdValue} _other - The other IFD value.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(_other: IfdValue): boolean {
    return false;
  }

  /**
   * Clones the IFD value.
   * @returns {IfdValue} The cloned IFD value.
   * @throws {LibError} If the value cannot be copied.
   */
  public clone(): IfdValue {
    throw new LibError('Cannot be copied.');
  }

  /**
   * Converts the IFD value to a string.
   * @returns {string} The string representation of the IFD value.
   */
  public toString(): string {
    return '';
  }
}
