/** @format */

import { Color } from '../../color/color';
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

  private _numFrames = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  public setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }
}
