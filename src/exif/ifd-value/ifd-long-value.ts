/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Represents a long value in an IFD (Image File Directory).
 */
export class IfdLongValue extends IfdValue {
  /**
   * The underlying value stored as a Uint32Array.
   */
  private _value: Uint32Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.long;
  }

  /**
   * Gets the length of the value.
   * @returns {number} The length of the value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Constructs an IfdLongValue instance.
   * @param {Uint32Array | number} value - The value to be stored.
   */
  constructor(value: Uint32Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Uint32Array(1);
      this._value[0] = value;
    } else {
      this._value = Uint32Array.from(value);
    }
  }

  /**
   * Creates an IfdLongValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} length - The length of the data to read.
   * @returns {IfdLongValue} The created IfdLongValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdLongValue {
    const array = new Uint32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readUint32();
    }
    return new IfdLongValue(array);
  }

  /**
   * Converts the value at the specified index to an integer.
   * @param {number} [index=0] - The index of the value to convert.
   * @returns {number} The integer value.
   */
  public toInt(index = 0): number {
    return this._value[index];
  }

  /**
   * Converts the value to a Uint8Array.
   * @returns {Uint8Array} The converted value.
   */
  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  /**
   * Writes the value to the output buffer.
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeUint32(this._value[i]);
    }
  }

  /**
   * Sets the integer value at the specified index.
   * @param {number} v - The integer value to set.
   * @param {number} [index=0] - The index at which to set the value.
   */
  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  /**
   * Checks if this value is equal to another IfdValue.
   * @param {IfdValue} other - The other IfdValue to compare with.
   * @returns {boolean} True if the values are equal, otherwise false.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdLongValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Creates a clone of this IfdLongValue.
   * @returns {IfdValue} The cloned IfdLongValue.
   */
  public clone(): IfdValue {
    return new IfdLongValue(this._value);
  }

  /**
   * Converts the value to a string representation.
   * @returns {string} The string representation of the value.
   */
  public toString(): string {
    return `[${this._value.toString()}]`;
  }
}
