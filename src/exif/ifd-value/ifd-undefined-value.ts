/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing an undefined IFD value.
 */
export class IfdUndefinedValue extends IfdValue {
  /**
   * The value stored as a Uint8Array.
   */
  private _value: Uint8Array;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.undefined;
  }

  /**
   * Gets the length of the value.
   * @returns {number} The length of the value.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Creates an instance of IfdUndefinedValue.
   * @param {Uint8Array | number} value - The value to initialize.
   */
  constructor(value: Uint8Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Uint8Array(1);
      this._value[0] = value;
    } else {
      this._value = value;
    }
  }

  /**
   * Creates an IfdUndefinedValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} [offset] - The offset to start reading from.
   * @param {number} [length] - The length of data to read.
   * @returns {IfdUndefinedValue} The created IfdUndefinedValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    offset?: number,
    length?: number
  ): IfdUndefinedValue {
    const array = new Uint8Array(data.toUint8Array(offset, length));
    return new IfdUndefinedValue(array);
  }

  /**
   * Converts the value to a Uint8Array.
   * @returns {Uint8Array} The value as a Uint8Array.
   */
  public toData(): Uint8Array {
    return this._value;
  }

  /**
   * Writes the value to an output buffer.
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    out.writeBytes(this._value);
  }

  /**
   * Checks if this value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdUndefinedValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  /**
   * Creates a clone of this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdUndefinedValue(this._value);
  }

  /**
   * Returns a string representation of the IFD value.
   * @returns {string} The string representation of the IFD value.
   */
  public toString(): string {
    return `${this.constructor.name} (undefined)`;
  }
}
