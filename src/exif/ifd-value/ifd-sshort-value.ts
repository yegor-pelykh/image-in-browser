/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Represents a signed short IFD value.
 */
export class IfdSShortValue extends IfdValue {
  /**
   * The internal value stored as an Int16Array.
   */
  private _value: Int16Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.sShort;
  }

  /**
   * Gets the length of the IFD value.
   * @returns {number} The length of the IFD value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Constructs an IfdSShortValue instance.
   * @param {Int16Array | number} value - The initial value.
   */
  constructor(value: Int16Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Int16Array(1);
      this._value[0] = value;
    } else {
      this._value = Int16Array.from(value);
    }
  }

  /**
   * Creates an IfdSShortValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer.
   * @param {number} length - The length of the data.
   * @returns {IfdSShortValue} The created IfdSShortValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdSShortValue {
    const array = new Int16Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readInt16();
    }
    return new IfdSShortValue(array);
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
    const v = new Int16Array(1);
    const vb = new Uint16Array(v.buffer);
    for (let i = 0, l = this._value.length; i < l; ++i) {
      v[0] = this._value[i];
      out.writeUint16(vb[0]);
    }
  }

  /**
   * Sets the value at the specified index.
   * @param {number} v - The value to set.
   * @param {number} [index=0] - The index at which to set the value.
   */
  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  /**
   * Checks if this value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSShortValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Clones this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdSShortValue(this._value);
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
