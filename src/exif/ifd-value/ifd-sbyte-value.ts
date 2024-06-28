/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing an IFD SByte value.
 */
export class IfdSByteValue extends IfdValue {
  /**
   * The value stored as an Int8Array.
   */
  private _value: Int8Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.sByte;
  }

  /**
   * Gets the length of the value.
   * @returns {number} The length of the value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Creates an instance of IfdSByteValue.
   * @param {Int8Array | number} value - The value to initialize.
   */
  constructor(value: Int8Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Int8Array(1);
      this._value[0] = value;
    } else {
      this._value = Int8Array.from(value);
    }
  }

  /**
   * Creates an IfdSByteValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} [offset] - The offset to start reading from.
   * @param {number} [length] - The length of data to read.
   * @returns {IfdSByteValue} The created IfdSByteValue.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    offset?: number,
    length?: number
  ): IfdSByteValue {
    const array = new Int8Array(
      new Int8Array(data.toUint8Array(offset, length).buffer)
    );
    return new IfdSByteValue(array);
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
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    out.writeBytes(new Uint8Array(this._value.buffer));
  }

  /**
   * Sets an integer value at a specified index.
   * @param {number} v - The integer value to set.
   * @param {number} [index=0] - The index to set the value at.
   */
  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  /**
   * Checks if this value equals another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSByteValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Clones this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdSByteValue(this._value);
  }

  /**
   * Converts the value to a string representation.
   * @returns {string} The string representation of the value.
   */
  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
