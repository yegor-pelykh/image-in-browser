/** @format */

import { IfdValue } from './ifd-value/ifd-value.js';

export class ExifEntry {
  private readonly _tag: number;
  public get tag(): number {
    return this._tag;
  }

  private _value: IfdValue | undefined;
  public get value(): IfdValue | undefined {
    return this._value;
  }
  public set value(v: IfdValue | undefined) {
    this._value = v;
  }

  constructor(tag: number, value?: IfdValue) {
    this._tag = tag;
    this._value = value;
  }
}
