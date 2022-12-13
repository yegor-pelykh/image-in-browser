/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { TextCodec } from '../../common/text-codec';
import { ExifValue } from './exif-value';
import { ExifValueType } from '../exif-value-type';

export class ExifAsciiValue extends ExifValue {
  private value: string;

  public get type(): ExifValueType {
    return ExifValueType.ascii;
  }

  public get length(): number {
    return this.value.length;
  }

  constructor(value: number[] | string) {
    super();
    if (typeof value === 'string') {
      this.value = value;
    } else {
      this.value = String.fromCharCode(...value);
    }
  }

  public static fromData(data: InputBuffer, length: number) {
    const value = length > 0 ? data.readString(length - 1) : data.readString();
    return new ExifAsciiValue(value);
  }

  public toData(): Uint8Array {
    return TextCodec.getCodePoints(this.value);
  }

  public toString(): string {
    return this.value;
  }

  public write(out: OutputBuffer): void {
    const bytes = TextCodec.getCodePoints(this.value);
    out.writeBytes(bytes);
  }

  public setString(v: string): void {
    this.value = v;
  }

  public equalsTo(other: unknown): boolean {
    return other instanceof ExifAsciiValue && this.length === other.length;
  }

  public clone(): ExifValue {
    return new ExifAsciiValue(this.value);
  }
}
