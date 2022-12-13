/** @format */

import { ExifValue } from './exif-value/exif-value';

export class ExifEntry {
  private readonly _tag: number;
  public get tag(): number {
    return this._tag;
  }

  private _value: ExifValue | undefined;
  public get value(): ExifValue | undefined {
    return this._value;
  }
  public set value(v: ExifValue | undefined) {
    this._value = v;
  }

  constructor(tag: number, value?: ExifValue) {
    this._tag = tag;
    this._value = value;
  }
}
