/** @format */

import { OutputBuffer } from '../../common/output-buffer.js';
import { Rational } from '../../common/rational.js';
import { LibError } from '../../error/lib-error.js';
import {
  getIfdValueTypeSize,
  getIfdValueTypeString,
  IfdValueType,
} from '../ifd-value-type.js';

export abstract class IfdValue {
  public get type(): IfdValueType {
    return IfdValueType.none;
  }

  public get length(): number {
    return 0;
  }

  public get dataSize(): number {
    return getIfdValueTypeSize(this.type, this.length);
  }

  public get typeString(): string {
    return getIfdValueTypeString(this.type);
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

  public toData(): Uint8Array {
    return new Uint8Array();
  }

  public toRational(_index?: number): Rational {
    return new Rational(0, 1);
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

  public equals(_other: IfdValue): boolean {
    return false;
  }

  public clone(): IfdValue {
    throw new LibError('Cannot be copied.');
  }

  public toString(): string {
    return `${this.constructor.name}`;
  }
}
