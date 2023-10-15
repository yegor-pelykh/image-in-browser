/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';
import { ArrayUtils } from '../../common/array-utils';

export class IfdByteValue extends IfdValue {
  private _value: Uint8Array;

  public get type(): IfdValueType {
    return IfdValueType.byte;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Uint8Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Uint8Array(1);
      this._value[0] = value;
    } else {
      this._value = Uint8Array.from(value);
    }
  }

  public static data(
    data: InputBuffer<Uint8Array>,
    offset?: number,
    length?: number
  ) {
    const array = data.toUint8Array(offset, length);
    return new IfdByteValue(array);
  }

  public toInt(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return this._value;
  }

  public write(out: OutputBuffer): void {
    out.writeBytes(this._value);
  }

  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdByteValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdByteValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
