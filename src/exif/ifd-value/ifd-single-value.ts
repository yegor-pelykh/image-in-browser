/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Represents a single value in an IFD (Image File Directory).
 */
export class IfdSingleValue extends IfdValue {
  /**
   * The value stored as a Float32Array.
   */
  private _value: Float32Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.single;
  }

  /**
   * Gets the length of the value array.
   * @returns {number} The length of the value array.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Constructs an IfdSingleValue instance.
   * @param {Float32Array | number} value - The initial value.
   */
  constructor(value: Float32Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Float32Array(1);
      this._value[0] = value;
    } else {
      this._value = Float32Array.from(value);
    }
  }

  /**
   * Creates an IfdSingleValue instance from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} length - The length of the data to read.
   * @returns {IfdSingleValue} The created IfdSingleValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdSingleValue {
    const array = new Float32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readFloat32();
    }
    return new IfdSingleValue(array);
  }

  /**
   * Converts the value at the specified index to a double.
   * @param {number} [index=0] - The index of the value to convert.
   * @returns {number} The converted double value.
   */
  public toDouble(index = 0): number {
    return this._value[index];
  }

  /**
   * Converts the value to a Uint8Array.
   * @returns {Uint8Array} The converted Uint8Array.
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
      out.writeFloat32(this._value[i]);
    }
  }

  /**
   * Sets the value at the specified index to the given double.
   * @param {number} v - The value to set.
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
      other instanceof IfdSingleValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Clones this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdSingleValue(this._value);
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
