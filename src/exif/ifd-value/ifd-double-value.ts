/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';
import { ArrayUtils } from '../../common/array-utils';

export class IfdDoubleValue extends IfdValue {
  private _value: Float64Array;

  public get type(): IfdValueType {
    return IfdValueType.double;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Float64Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Float64Array(1);
      this._value[0] = value;
    } else {
      this._value = Float64Array.from(value);
    }
  }

  public static data(data: InputBuffer<Uint8Array>, length: number) {
    const array = new Float64Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readFloat64();
    }
    return new IfdDoubleValue(array);
  }

  public toDouble(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeFloat64(this._value[i]);
    }
  }

  public setDouble(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdDoubleValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdDoubleValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
