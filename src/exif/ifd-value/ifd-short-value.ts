/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Represents a short value in an IFD (Image File Directory).
 */
export class IfdShortValue extends IfdValue {
  /**
   * The underlying Uint16Array value.
   */
  private _value: Uint16Array;

  /**
   * Gets the type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.short;
  }

  /**
   * Gets the length of the IFD value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Constructs an IfdShortValue instance.
   * @param {Uint16Array | number} value - The initial value, either a Uint16Array or a number.
   */
  constructor(value: Uint16Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Uint16Array(1);
      this._value[0] = value;
    } else {
      this._value = Uint16Array.from(value);
    }
  }

  /**
   * Creates an IfdShortValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} length - The length of the data to read.
   * @returns {IfdShortValue} A new IfdShortValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdShortValue {
    const array = new Uint16Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readUint16();
    }
    return new IfdShortValue(array);
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
   * Converts the IFD value to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the IFD value.
   */
  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  /**
   * Writes the IFD value to the output buffer.
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeUint16(this._value[i]);
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
   * Checks if this IFD value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, otherwise false.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdShortValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Creates a clone of this IFD value.
   * @returns {IfdValue} A new IfdShortValue instance that is a clone of this instance.
   */
  public clone(): IfdValue {
    return new IfdShortValue(this._value);
  }

  /**
   * Converts the IFD value to a string representation.
   * @returns {string} The string representation of the IFD value.
   */
  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
