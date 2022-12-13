/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifDoubleValue extends ExifValue {
  private value: Float64Array;

  public get type(): ExifValueType {
    return ExifValueType.double;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Float64Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Float64Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Float64Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readFloat64();
    }
    return new ExifDoubleValue(array);
  }

  public toDouble(index = 0): number {
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
      out.writeFloat64(this.value[i]);
    }
  }

  public setDouble(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifDoubleValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifDoubleValue(this.value);
  }
}
