/** @format */

import { InputBuffer } from '../../common/input-buffer';

export class PsdImageResource {
  private _id: number;
  public get id(): number {
    return this._id;
  }

  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _data: InputBuffer<Uint8Array>;
  public get data(): InputBuffer<Uint8Array> {
    return this._data;
  }

  constructor(id: number, name: string, data: InputBuffer<Uint8Array>) {
    this._id = id;
    this._name = name;
    this._data = data;
  }
}
