/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { BitUtils } from '../../common/bit-utils.js';
import { ArrayUtils } from '../../common/array-utils.js';

export class IfdSLongValue extends IfdValue {
  private _value: Int32Array;

  public get type(): IfdValueType {
    return IfdValueType.sLong;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Int32Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Int32Array(1);
      this._value[0] = value;
    } else {
      this._value = Int32Array.from(value);
    }
  }

  public static data(data: InputBuffer<Uint8Array>, length: number) {
    const array = new Int32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readInt32();
    }
    return new IfdSLongValue(array);
  }

  public toInt(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeUint32(BitUtils.int32ToUint32(this._value[i]));
    }
  }

  public setInt(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSLongValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdSLongValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
