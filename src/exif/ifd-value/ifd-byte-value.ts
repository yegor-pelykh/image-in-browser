/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing a byte value in an IFD (Image File Directory).
 */
export class IfdByteValue extends IfdValue {
  /**
   * The byte value stored as a Uint8Array.
   */
  private _value: Uint8Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.byte;
  }

  /**
   * Gets the length of the byte value.
   * @returns {number} The length of the byte value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Creates an instance of IfdByteValue.
   * @param {Uint8Array | number} value - The byte value or a number to initialize the byte value.
   */
  constructor(value: Uint8Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Uint8Array(1);
      this._value[0] = value;
    } else {
      this._value = Uint8Array.from(value);
    }
  }

  /**
   * Creates an IfdByteValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} [offset] - The offset to start reading from.
   * @param {number} [length] - The length of data to read.
   * @returns {IfdByteValue} The created IfdByteValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    offset?: number,
    length?: number
  ): IfdByteValue {
    const array = data.toUint8Array(offset, length);
    return new IfdByteValue(array);
  }

  /**
   * Converts the byte value to an integer.
   * @param {number} [index=0] - The index of the byte to convert.
   * @returns {number} The integer representation of the byte.
   */
  public toInt(index = 0): number {
    return this._value[index];
  }

  /**
   * Converts the byte value to a Uint8Array.
   * @returns {Uint8Array} The byte value as a Uint8Array.
   */
  public toData(): Uint8Array {
    return this._value;
  }

  /**
   * Writes the byte value to an output buffer.
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    out.writeBytes(this._value);
  }

  /**
   * Sets the byte value at a specific index.
   * @param {number} v - The value to set.
   * @param {number} [index=0] - The index to set the value at.
   */
  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  /**
   * Checks if this byte value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdByteValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Creates a clone of this byte value.
   * @returns {IfdValue} The cloned byte value.
   */
  public clone(): IfdValue {
    return new IfdByteValue(this._value);
  }

  /**
   * Converts the byte value to a string representation.
   * @returns {string} The string representation of the byte value.
   */
  public toString(): string {
    return `[${this._value.toString()}]`;
  }
}
