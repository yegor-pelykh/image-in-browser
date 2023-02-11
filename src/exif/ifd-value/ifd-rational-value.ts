/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';
import { Rational } from '../../common/rational';
import { ArrayUtils } from '../../common/array-utils';

export class IfdRationalValue extends IfdValue {
  private _value: Rational[];

  public get type(): IfdValueType {
    return IfdValueType.rational;
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

  public static data(data: InputBuffer, length: number) {
    const array = new Array<Rational>();
    for (let i = 0; i < length; i++) {
      const r = new Rational(data.readUint32(), data.readUint32());
      array.push(r);
    }
    return new IfdRationalValue(array);
  }

  public static from(other: Rational) {
    const r = new Rational(other.numerator, other.denominator);
    return new IfdRationalValue(r);
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
      out.writeUint32(v.numerator);
      out.writeUint32(v.denominator);
    }
  }

  public setRational(numerator: number, denomitator: number, index = 0): void {
    this._value[index] = new Rational(numerator, denomitator);
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdRationalValue &&
      this.length === other.length &&
      ArrayUtils.equalsRationalArray(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdRationalValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
