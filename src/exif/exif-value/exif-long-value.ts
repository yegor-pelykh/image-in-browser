/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifLongValue extends ExifValue {
  private value: Uint32Array;

  public get type(): ExifValueType {
    return ExifValueType.long;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Uint32Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Uint32Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Uint32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readUint32();
    }
    return new ExifLongValue(array);
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
      out.writeUint32(this.value[i]);
    }
  }

  public setInt(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifLongValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifLongValue(this.value);
  }
}
