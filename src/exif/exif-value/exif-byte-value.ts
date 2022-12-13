/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifByteValue extends ExifValue {
  private value: Uint8Array;

  public get type(): ExifValueType {
    return ExifValueType.byte;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Uint8Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Uint8Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, offset?: number, length?: number) {
    const array = data.toUint8Array(offset, length);
    return new ExifByteValue(array);
  }

  public toInt(index = 0): number {
    return this.value[index];
  }

  public toData(): Uint8Array {
    return this.value;
  }

  public toString(): string {
    return this.value.length === 1 ? `${this.value[0]}` : `${this.value}`;
  }

  public write(out: OutputBuffer): void {
    out.writeBytes(this.value);
  }

  public setInt(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifByteValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifByteValue(this.value);
  }
}
