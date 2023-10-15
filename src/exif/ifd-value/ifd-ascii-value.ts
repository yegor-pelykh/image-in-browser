/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { StringUtils } from '../../common/string-utils';
import { IfdValue } from './ifd-value';
import { IfdValueType } from '../ifd-value-type';

export class IfdAsciiValue extends IfdValue {
  private _value: string;

  public get type(): IfdValueType {
    return IfdValueType.ascii;
  }

  public get length(): number {
    const codeUnits = StringUtils.getCodePoints(this._value);
    return codeUnits.length + 1;
  }

  constructor(value: number[] | string) {
    super();
    if (typeof value === 'string') {
      this._value = value;
    } else {
      this._value = String.fromCharCode(...value);
    }
  }

  public static data(data: InputBuffer<Uint8Array>, length: number) {
    // The final byte is a null terminator
    const value = length > 0 ? data.readString(length - 1) : '';
    return new IfdAsciiValue(value);
  }

  public toData(): Uint8Array {
    return StringUtils.getCodePoints(this._value);
  }

  public write(out: OutputBuffer): void {
    const bytes = StringUtils.getCodePoints(this._value);
    out.writeBytes(bytes);
    out.writeByte(0);
  }

  public setString(v: string): void {
    this._value = v;
  }

  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdAsciiValue &&
      this.length === other.length &&
      this._value === this._value
    );
  }

  public clone(): IfdValue {
    return new IfdAsciiValue(this._value);
  }

  public toString(): string {
    return `${this.constructor.name} (${this._value})`;
  }
}
