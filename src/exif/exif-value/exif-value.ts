/** @format */

import { OutputBuffer } from '../../common/output-buffer';
import { Rational } from '../../common/rational';
import { ImageError } from '../../error/image-error';
import {
  ExifValueType,
  getExifValueTypeSize,
  getExifValueTypeString,
} from '../exif-value-type';

export abstract class ExifValue {
  public get type(): ExifValueType {
    return ExifValueType.none;
  }

  public get length(): number {
    return 0;
  }

  public get dataSize(): number {
    return getExifValueTypeSize(this.type, this.length);
  }

  public get typeString(): string {
    return getExifValueTypeString(this.type);
  }

  public toBool(_index?: number): boolean {
    return false;
  }

  public toInt(_index?: number): number {
    return 0;
  }

  public toDouble(_index?: number): number {
    return 0;
  }

  public toRational(_index?: number): Rational {
    return new Rational(0, 1);
  }

  public toString(): string {
    return '';
  }

  public write(_out: OutputBuffer): void {}

  public setBool(_v: boolean, _index?: number): void {}

  public setInt(_v: number, _index?: number): void {}

  public setDouble(_v: number, _index?: number): void {}

  public setRational(
    _numerator: number,
    _denomitator: number,
    _index?: number
  ): void {}

  public setString(_v: string): void {}

  public equalsTo(_other: ExifValue): boolean {
    return false;
  }

  public clone(): ExifValue {
    throw new ImageError('Cannot be copied.');
  }
}
