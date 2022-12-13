/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifSByteValue extends ExifValue {
  private value: Int8Array;

  public get type(): ExifValueType {
    return ExifValueType.sbyte;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Int8Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Int8Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, offset?: number, length?: number) {
    const array = new Int8Array(
      new Int8Array(data.toUint8Array(offset, length).buffer)
    );
    return new ExifSByteValue(array);
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
    out.writeBytes(new Uint8Array(this.value.buffer));
  }

  public setInt(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifSByteValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifSByteValue(this.value);
  }
}
