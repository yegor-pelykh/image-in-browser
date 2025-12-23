/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { StringUtils } from '../../common/string-utils.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';

/**
 * Class representing an ASCII value in an IFD (Image File Directory).
 */
export class IfdAsciiValue extends IfdValue {
  /**
   * The ASCII value stored as a string.
   */
  private _value: string;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.ascii;
  }

  /**
   * Gets the length of the ASCII value including the null terminator.
   * @returns {number} The length of the ASCII value.
   */
  public get length(): number {
    const codeUnits = StringUtils.getCodePoints(this._value);
    return codeUnits.length + 1;
  }

  /**
   * Creates an instance of IfdAsciiValue.
   * @param {number[] | string} value - The ASCII value as an array of code points or a string.
   */
  constructor(value: number[] | string) {
    super();
    if (typeof value === 'string') {
      this._value = value;
    } else {
      this._value = String.fromCodePoint(...value);
    }
  }

  /**
   * Creates an IfdAsciiValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the ASCII data.
   * @param {number} length - The length of the ASCII data.
   * @returns {IfdAsciiValue} The created IfdAsciiValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdAsciiValue {
    // The final byte is a null terminator
    const value = length > 0 ? data.readString(length - 1) : '';
    return new IfdAsciiValue(value);
  }

  /**
   * Converts the ASCII value to a Uint8Array.
   * @returns {Uint8Array} The ASCII value as a Uint8Array.
   */
  public toData(): Uint8Array {
    return StringUtils.getCodePoints(this._value);
  }

  /**
   * Writes the ASCII value to an output buffer.
   * @param {OutputBuffer} out - The output buffer to write the ASCII value to.
   */
  public write(out: OutputBuffer): void {
    const bytes = StringUtils.getCodePoints(this._value);
    out.writeBytes(bytes);
    out.writeByte(0);
  }

  /**
   * Sets the ASCII value as a string.
   * @param {string} v - The new ASCII value.
   */
  public setString(v: string): void {
    this._value = v;
  }

  /**
   * Checks if this ASCII value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdAsciiValue &&
      this.length === other.length &&
      this._value === this._value
    );
  }

  /**
   * Creates a clone of this ASCII value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdAsciiValue(this._value);
  }

  /**
   * Returns a string representation of the ASCII value.
   * @returns {string} The string representation of the ASCII value.
   */
  public toString(): string {
    return this._value;
  }
}
