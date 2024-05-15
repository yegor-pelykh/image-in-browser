/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { ArrayUtils } from '../../common/array-utils.js';

export class IfdUndefinedValue extends IfdValue {
  private _value: Uint8Array;

  public get type(): IfdValueType {
    return IfdValueType.undefined;
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
      this._value = value;
    }
  }

  public static data(
    data: InputBuffer<Uint8Array>,
    offset?: number,
    length?: number
  ) {
    const array = new Uint8Array(data.toUint8Array(offset, length));
    return new IfdUndefinedValue(array);
  }

  public toData(): Uint8Array {
    return this._value;
  }

  public write(out: OutputBuffer): void {
    out.writeBytes(this._value);
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdUndefinedValue &&
      this.length === other.length &&
      ArrayUtils.equals(this._value, other._value)
    );
  }

  public clone(): IfdValue {
    return new IfdUndefinedValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (undefined)`;
  }
}
