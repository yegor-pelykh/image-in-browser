/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';
import { Rational } from '../../common/rational';

export class ExifRationalValue extends ExifValue {
  private value: Rational[];

  public get type(): ExifValueType {
    return ExifValueType.rational;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Rational[] | Rational) {
    super();
    if (value instanceof Rational) {
      this.value = [value];
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Array<Rational>();
    for (let i = 0; i < length; i++) {
      const r = new Rational(data.readUint32(), data.readUint32());
      array.push(r);
    }
    return new ExifRationalValue(array);
  }

  public static from(other: Rational) {
    const r = new Rational(other.numerator, other.denominator);
    return new ExifRationalValue(r);
  }

  public toInt(index = 0): number {
    return this.value[index].asInt;
  }

  public toDouble(index = 0): number {
    return this.value[index].asDouble;
  }

  public toRational(index = 0): Rational {
    return this.value[index];
  }

  public toString(): string {
    return this.value.length === 1 ? `${this.value[0]}` : `${this.value}`;
  }

  public write(out: OutputBuffer): void {
    for (const v of this.value) {
      out.writeUint32(v.numerator);
      out.writeUint32(v.denominator);
    }
  }

  public setRational(numerator: number, denomitator: number, index = 0): void {
    this.value[index] = new Rational(numerator, denomitator);
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifRationalValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifRationalValue(this.value);
  }
}
