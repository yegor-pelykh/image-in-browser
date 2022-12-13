/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifShortValue extends ExifValue {
  private value: Uint16Array;

  public get type(): ExifValueType {
    return ExifValueType.short;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Uint16Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Uint16Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Uint16Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readUint16();
    }
    return new ExifShortValue(array);
  }

  public toInt(index = 0): number {
    return this.value[index];
  }

  public toString(): string {
    return this.value.length === 1 ? `${this.value[0]}` : `${this.value}`;
  }

  public write(out: OutputBuffer): void {
    for (let i = 0, l = this.value.length; i < l; ++i) {
      out.writeUint16(this.value[i]);
    }
  }

  public setInt(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifShortValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifShortValue(this.value);
  }
}
