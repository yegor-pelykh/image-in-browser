/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { BitUtils } from '../../common/bit-utils.js';
import { Rational } from '../../common/rational.js';
import { ArrayUtils } from '../../common/array-utils.js';

export class IfdSRationalValue extends IfdValue {
  private _value: Rational[];

  public get type(): IfdValueType {
    return IfdValueType.sRational;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Rational[] | Rational) {
    super();
    if (value instanceof Rational) {
      this._value = [value];
    } else {
      this._value = value;
    }
  }

  public static data(data: InputBuffer<Uint8Array>, length: number) {
    const array = new Array<Rational>();
    for (let i = 0; i < length; i++) {
      const r = new Rational(data.readInt32(), data.readInt32());
      array.push(r);
    }
    return new IfdSRationalValue(array);
  }

  public static from(other: Rational) {
    const r = new Rational(other.numerator, other.denominator);
    return new IfdSRationalValue(r);
  }

  public toInt(index = 0): number {
    return this._value[index].toInt;
  }

  public toDouble(index = 0): number {
    return this._value[index].toDouble;
  }

  public toRational(index = 0): Rational {
    return this._value[index];
  }

  public write(out: OutputBuffer): void {
    for (const v of this._value) {
      out.writeUint32(BitUtils.int32ToUint32(v.numerator));
      out.writeUint32(BitUtils.int32ToUint32(v.denominator));
    }
  }

  public setRational(numerator: number, denomitator: number, index = 0): void {
    this._value[index] = new Rational(numerator, denomitator);
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSRationalValue &&
      this.length === other.length &&
      ArrayUtils.equalsRationalArray(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdSRationalValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
