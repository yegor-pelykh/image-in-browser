/** @format */

import { InputBuffer } from '../../common/input-buffer';

export class PsdMask {
  private _top: number = 0;
  public get top(): number {
    return this._top;
  }

  private _left: number = 0;
  public get left(): number {
    return this._left;
  }

  private _right: number = 0;
  public get right(): number {
    return this._right;
  }

  private _bottom: number = 0;
  public get bottom(): number {
    return this._bottom;
  }

  private _defaultColor: number = 0;
  public get defaultColor(): number {
    return this._defaultColor;
  }

  private _flags: number = 0;
  public get flags(): number {
    return this._flags;
  }

  private _params: number = 0;
  public get params(): number {
    return this._params;
  }

  public get relative(): boolean {
    return (this._flags & 1) !== 0;
  }

  public get disabled(): boolean {
    return (this._flags & 2) !== 0;
  }

  public get invert(): boolean {
    return (this._flags & 4) !== 0;
  }

  constructor(input: InputBuffer<Uint8Array>) {
    const len = input.length;

    this._top = input.readUint32();
    this._left = input.readUint32();
    this._right = input.readUint32();
    this._bottom = input.readUint32();
    this._defaultColor = input.read();
    this._flags = input.read();

    if (len === 20) {
      input.skip(2);
    } else {
      this._flags = input.read();
      this._defaultColor = input.read();
      this._top = input.readUint32();
      this._left = input.readUint32();
      this._right = input.readUint32();
      this._bottom = input.readUint32();
    }
  }
}
