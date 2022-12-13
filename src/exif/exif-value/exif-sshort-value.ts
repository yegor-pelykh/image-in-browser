/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifSShortValue extends ExifValue {
  private value: Int16Array;

  public get type(): ExifValueType {
    return ExifValueType.sshort;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Int16Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Int16Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Int16Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readInt16();
    }
    return new ExifSShortValue(array);
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
    const v = new Int16Array(1);
    const vb = new Uint16Array(v.buffer);
    for (let i = 0, l = this.value.length; i < l; ++i) {
      v[0] = this.value[i];
      out.writeUint16(vb[0]);
    }
  }

  public setInt(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifSShortValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifSShortValue(this.value);
  }
}
