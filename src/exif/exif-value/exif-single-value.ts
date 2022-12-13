/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifSingleValue extends ExifValue {
  private value: Float32Array;

  public get type(): ExifValueType {
    return ExifValueType.single;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: Float32Array | number) {
    super();
    if (typeof value === 'number') {
      this.value = new Float32Array(1);
      this.value[0] = value;
    } else {
      this.value = value;
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const array = new Float32Array(length);
    for (let i = 0; i < length; ++i) {
      array[i] = data.readFloat32();
    }
    return new ExifSingleValue(array);
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
      out.writeFloat32(this.value[i]);
    }
  }

  public setDouble(v: number, index = 0): void {
    this.value[index] = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifSingleValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifSingleValue(this.value);
  }
}
