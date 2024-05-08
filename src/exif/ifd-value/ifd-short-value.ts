/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';
import { ArrayUtils } from '../../common/array-utils';

export class IfdShortValue extends IfdValue {
  private _value: Uint16Array;

  public get type(): IfdValueType {
    return IfdValueType.short;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Uint16Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Uint16Array(1);
      this._value[0] = value;
    } else {
      this._value = Uint16Array.from(value);
    }
  }

  public static data(data: InputBuffer<Uint8Array>, length: number) {
    const array = new Uint16Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readUint16();
    }
    return new IfdShortValue(array);
  }

  public toInt(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeUint16(this._value[i]);
    }
  }

  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdShortValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdShortValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
