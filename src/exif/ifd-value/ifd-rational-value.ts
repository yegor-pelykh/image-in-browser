/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { Rational } from '../../common/rational.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing a rational value in an IFD (Image File Directory).
 */
export class IfdRationalValue extends IfdValue {
  /**
   * Array of Rational values.
   */
  private _value: Rational[];

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.rational;
  }

  /**
   * Gets the length of the rational value array.
   * @returns {number} The length of the array.
   */
  public get length(): number {
    return this._value.length;
  }

  /**
   * Constructs an IfdRationalValue instance.
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
   * Creates an IfdRationalValue from input buffer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data.
   * @param {number} length - The number of rational values to read.
   * @returns {IfdRationalValue} The created IfdRationalValue instance.
   */
  public static data(
    data: InputBuffer<Uint8Array>,
    length: number
  ): IfdRationalValue {
    const array = new Array<Rational>();
    for (let i = 0; i < length; i++) {
      const r = new Rational(data.readUint32(), data.readUint32());
      array.push(r);
    }
    return new IfdRationalValue(array);
  }

  /**
   * Creates an IfdRationalValue from another Rational instance.
   * @param {Rational} other - The other Rational instance.
   * @returns {IfdRationalValue} The created IfdRationalValue instance.
   */
  public static from(other: Rational): IfdRationalValue {
    const r = new Rational(other.numerator, other.denominator);
    return new IfdRationalValue(r);
  }

  /**
   * Converts the rational value at the specified index to an integer.
   * @param {number} [index=0] - The index of the rational value.
   * @returns {number} The integer representation of the rational value.
   */
  public toInt(index = 0): number {
    return this._value[index].toInt;
  }

  /**
   * Converts the rational value at the specified index to a double.
   * @param {number} [index=0] - The index of the rational value.
   * @returns {number} The double representation of the rational value.
   */
  public toDouble(index = 0): number {
    return this._value[index].toDouble;
  }

  /**
   * Gets the rational value at the specified index.
   * @param {number} [index=0] - The index of the rational value.
   * @returns {Rational} The rational value.
   */
  public toRational(index = 0): Rational {
    return this._value[index];
  }

  /**
   * Writes the rational values to the output buffer.
   * @param {OutputBuffer} out - The output buffer.
   */
  public write(out: OutputBuffer): void {
    for (const v of this._value) {
      out.writeUint32(v.numerator);
      out.writeUint32(v.denominator);
    }
  }

  /**
   * Sets the rational value at the specified index.
   * @param {number} numerator - The numerator of the rational value.
   * @param {number} denominator - The denominator of the rational value.
   * @param {number} [index=0] - The index to set the rational value at.
   */
  public setRational(numerator: number, denominator: number, index = 0): void {
    this._value[index] = new Rational(numerator, denominator);
  }

  /**
   * Checks if this IfdRationalValue is equal to another IfdValue.
   * @param {IfdValue} other - The other IfdValue to compare with.
   * @returns {boolean} True if equal, otherwise false.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdRationalValue &&
      this.length === other.length &&
      ArrayUtils.equalsRationalArray(this._value, other._value)
    );
  }

  /**
   * Clones this IfdRationalValue.
   * @returns {IfdValue} The cloned IfdRationalValue.
   */
  public clone(): IfdValue {
    return new IfdRationalValue(this._value);
  }

  /**
   * Converts this IfdRationalValue to a string representation.
   * @returns {string} The string representation of this IfdRationalValue.
   */
  public toString(): string {
    return `[${this._value.toString()}]`;
  }
}
