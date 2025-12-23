/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { BitUtils } from '../../common/bit-utils.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing a signed long IFD value.
 */
export class IfdSLongValue extends IfdValue {
  /**
   * The internal value stored as an Int32Array.
   */
  private _value: Int32Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.sLong;
  }

  /**
   * Gets the length of the IFD value.
   * @returns {number} The length of the IFD value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Creates an instance of IfdSLongValue.
   * @param {Int32Array | number} value - The initial value.
   */
  constructor(value: Int32Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Int32Array(1);
      this._value[0] = value;
    } else {
      this._value = Int32Array.from(value);
    }
  }

  /**
   * Creates an IfdSLongValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer.
   * @param {number} length - The length of the data.
   * @returns {IfdSLongValue} The created IfdSLongValue.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdSLongValue {
    const array = new Int32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readInt32();
    }
    return new IfdSLongValue(array);
  }

  /**
   * Converts the value to an integer.
   * @param {number} [index=0] - The index of the value to convert.
   * @returns {number} The integer value.
   */
  public toInt(index = 0): number {
    return this._value[index];
  }

  /**
   * Converts the value to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the value.
   */
  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  /**
   * Writes the value to an output buffer.
   * @param {OutputBuffer} out - The output buffer.
   */
  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeUint32(BitUtils.int32ToUint32(this._value[i]));
    }
  }

  /**
   * Sets the integer value at the specified index.
   * @param {number} v - The value to set.
   * @param {number} [index=0] - The index at which to set the value.
   */
  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  /**
   * Checks if this value equals another IFD value.
   * @param {IfdValue} other - The other IFD value.
   * @returns {boolean} True if the values are equal, otherwise false.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSLongValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Clones this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdSLongValue(this._value);
  }

  /**
   * Converts the value to a string.
   * @returns {string} The string representation of the value.
   */
  public toString(): string {
    return `[${this._value.toString()}]`;
  }
}
