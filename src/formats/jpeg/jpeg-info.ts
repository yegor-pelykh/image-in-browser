/** @format */

import { DecodeInfo } from '../decode-info';

export class JpegInfo implements DecodeInfo {
  private _width = 0;
  public get width(): number {
    return this._width;
  }

  private _height = 0;
  public get height(): number {
    return this._height;
  }

  private _backgroundColor = 0xffffffff;
  public get backgroundColor(): number {
    return this._backgroundColor;
  }

  private _numFrames = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  public setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }
}
