/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { BitUtils } from '../../common/bit-utils.js';
import { Rational } from '../../common/rational.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing a signed rational IFD value.
 */
export class IfdSRationalValue extends IfdValue {
  /**
   * Array of Rational values.
   */
  private _value: Rational[];

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.sRational;
  }

  /**
   * Gets the length of the value array.
   * @returns {number} The length of the value array.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Creates an instance of IfdSRationalValue.
   * @param {Rational[] | Rational} value - The rational value(s).
   */
  constructor(value: Rational[] | Rational) {
    super();
    if (value instanceof Rational) {
      this._value = [value];
    } else {
      this._value = value;
    }
  }

  /**
   * Creates an IfdSRationalValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer.
   * @param {number} length - The length of the data.
   * @returns {IfdSRationalValue} The created IfdSRationalValue.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdSRationalValue {
    const array = new Array<Rational>();
    for (let i = 0; i < length; i++) {
      const r = new Rational(data.readInt32(), data.readInt32());
      array.push(r);
    }
    return new IfdSRationalValue(array);
  }

  /**
   * Creates an IfdSRationalValue from another Rational.
   * @param {Rational} other - The other rational value.
   * @returns {IfdSRationalValue} The created IfdSRationalValue.
   */
  public static from(other: Rational): IfdSRationalValue {
    const r = new Rational(other.numerator, other.denominator);
    return new IfdSRationalValue(r);
  }

  /**
   * Converts the value at the specified index to an integer.
   * @param {number} [index=0] - The index of the value.
   * @returns {number} The integer representation of the value.
   */
  public toInt(index: number = 0): number {
    return this._value[index].toInt;
  }

  /**
   * Converts the value at the specified index to a double.
   * @param {number} [index=0] - The index of the value.
   * @returns {number} The double representation of the value.
   */
  public toDouble(index: number = 0): number {
    return this._value[index].toDouble;
  }

  /**
   * Gets the rational value at the specified index.
   * @param {number} [index=0] - The index of the value.
   * @returns {Rational} The rational value.
   */
  public toRational(index: number = 0): Rational {
    return this._value[index];
  }

  /**
   * Writes the value to the output buffer.
   * @param {OutputBuffer} out - The output buffer.
   */
  public write(out: OutputBuffer): void {
    for (const v of this._value) {
      out.writeUint32(BitUtils.int32ToUint32(v.numerator));
      out.writeUint32(BitUtils.int32ToUint32(v.denominator));
    }
  }

  /**
   * Sets the rational value at the specified index.
   * @param {number} numerator - The numerator of the rational value.
   * @param {number} denomitator - The denominator of the rational value.
   * @param {number} [index=0] - The index of the value.
   */
  public setRational(
    numerator: number,
    denomitator: number,
    index: number = 0
  ): void {
    this._value[index] = new Rational(numerator, denomitator);
  }

  /**
   * Checks if this value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSRationalValue &&
      this.length === other.length &&
      ArrayUtils.equalsRationalArray(this._value, other._value)
    );
  }

  /**
   * Clones this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdSRationalValue(this._value);
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
