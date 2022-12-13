/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';
import { BitOperators } from '../../common/bit-operators';

export class ExifSLongValue extends ExifValue {
  private value: Int32Array;

  public get type(): ExifValueType {
    return ExifValueType.slong;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Int32Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Int32Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Int32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readInt32();
    }
    return new ExifSLongValue(array);
  }

  public toInt(index = 0): number {
    return this.value[index];
  }

  public toData(): Uint8Array {
    return new Uint8Array(this.value.buffer);
  }

  public toString(): string {
    return this.value.length === 1 ? `${this.value[0]}` : `${this.value}`;
  }

  public write(out: OutputBuffer): void {
    for (let i = 0, l = this.value.length; i < l; ++i) {
      out.writeUint32(BitOperators.toUint32(this.value[i]));
    }
  }

  public setInt(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifSLongValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifSLongValue(this.value);
  }
}
