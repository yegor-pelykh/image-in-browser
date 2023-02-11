/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';
import { ArrayUtils } from '../../common/array-utils';

export class IfdSingleValue extends IfdValue {
  private _value: Float32Array;

  public get type(): IfdValueType {
    return IfdValueType.single;
  }

  public get length(): number {
    return this._value.length;
  }

  constructor(value: Float32Array | number) {
    super();
    if (typeof value === 'number') {
      this._value = new Float32Array(1);
      this._value[0] = value;
    } else {
      this._value = Float32Array.from(value);
    }
  }

  public static data(data: InputBuffer, length: number) {
    const array = new Float32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readFloat32();
    }
    return new IfdSingleValue(array);
  }

  public toDouble(index = 0): number {
    return this._value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this._value.buffer);
  }

  public write(out: OutputBuffer): void {
    for (let i = 0, l = this._value.length; i < l; ++i) {
      out.writeFloat32(this._value[i]);
    }
  }

  public setDouble(v: number, index = 0): void {
    this._value[index] = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdSingleValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdSingleValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${
      this._value.length === 1 ? `${this._value[0]}` : `${this._value}`
    })`;
  }
}
