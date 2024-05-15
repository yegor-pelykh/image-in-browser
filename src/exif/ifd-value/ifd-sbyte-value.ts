/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

export class IfdSByteValue extends IfdValue {
  private _value: Int8Array;

  public get type(): IfdValueType {
    return IfdValueType.sByte;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Int8Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Int8Array(1);
      this._value[0] = value;
    } else {
      this._value = Int8Array.from(value);
    }
  }

  public static data(
    data: InputBuffer<Uint8Array>,
    offset?: number,
    length?: number
  ) {
    const array = new Int8Array(
      new Int8Array(data.toUint8Array(offset, length).buffer)
    );
    return new IfdSByteValue(array);
  }

  public toInt(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  public write(out: OutputBuffer): void {
    out.writeBytes(new Uint8Array(this._value.buffer));
  }

  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSByteValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdSByteValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
