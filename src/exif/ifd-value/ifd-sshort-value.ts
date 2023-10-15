/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';
import { ArrayUtils } from '../../common/array-utils';

export class IfdSShortValue extends IfdValue {
  private _value: Int16Array;

  public get type(): IfdValueType {
    return IfdValueType.sShort;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Int16Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Int16Array(1);
      this._value[0] = value;
    } else {
      this._value = Int16Array.from(value);
    }
  }

  public static data(data: InputBuffer<Uint8Array>, length: number) {
    const array = new Int16Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readInt16();
    }
    return new IfdSShortValue(array);
  }

  public toInt(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  public write(out: OutputBuffer): void {
    const v = new Int16Array(1);
    const vb = new Uint16Array(v.buffer);
    for (let i = 0, l = this._value.length; i < l; ++i) {
      v[0] = this._value[i];
      out.writeUint16(vb[0]);
    }
  }

  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSShortValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdSShortValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
