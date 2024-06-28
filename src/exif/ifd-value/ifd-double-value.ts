/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing a double value in an IFD (Image File Directory).
 */
export class IfdDoubleValue extends IfdValue {
  /**
   * The internal value stored as a Float64Array.
   */
  private _value: Float64Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.double;
  }

  /**
   * Gets the length of the internal Float64Array.
   * @returns {number} The length of the internal Float64Array.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Creates an instance of IfdDoubleValue.
   * @param {Float64Array | number} value - The initial value.
   */
  constructor(value: Float64Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Float64Array(1);
      this._value[0] = value;
    } else {
      this._value = Float64Array.from(value);
    }
  }

  /**
   * Creates an IfdDoubleValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} length - The length of the data to read.
   * @returns {IfdDoubleValue} The created IfdDoubleValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdDoubleValue {
    const array = new Float64Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readFloat64();
    }
    return new IfdDoubleValue(array);
  }

  /**
   * Converts the value at the specified index to a double.
   * @param {number} [index=0] - The index of the value to convert.
   * @returns {number} The double value.
   */
  public toDouble(index = 0): number {
    return this._value[index];
  }

  /**
   * Converts the internal value to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the internal value.
   */
  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  /**
   * Writes the internal value to the output buffer.
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeFloat64(this._value[i]);
    }
  }

  /**
   * Sets the value at the specified index to the given double.
   * @param {number} v - The double value to set.
   * @param {number} [index=0] - The index at which to set the value.
   */
  public setDouble(v: number, index = 0): void {
    this._value[index] = v;
  }

  /**
   * Checks if this value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdDoubleValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Creates a clone of this IFD double value.
   * @returns {IfdValue} The cloned IFD double value.
   */
  public clone(): IfdValue {
    return new IfdDoubleValue(this._value);
  }

  /**
   * Converts the internal value to a string representation.
   * @returns {string} The string representation of the internal value.
   */
  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
