/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifUndefinedValue extends ExifValue {
  private value: Uint8Array;

  public get type(): ExifValueType {
    return ExifValueType.undefined;
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
    const array = new Uint8Array(data.toUint8Array(offset, length));
    return new ExifUndefinedValue(array);
  }

  public toData(): Uint8Array {
    return this.value;
  }

  public toString(): string {
    return '<data>';
  }

  public write(out: OutputBuffer): void {
    out.writeBytes(this.value);
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifUndefinedValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifUndefinedValue(this.value);
  }
}
