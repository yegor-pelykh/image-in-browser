/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { PnmFormat } from './pnm-format.js';

export class PnmInfo implements DecodeInfo {
  /**
   * The width of the image canvas.
   */
  private _width = 0;
  public get width(): number {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
  }

  /**
   * The height of the image canvas.
   */
  private _height = 0;
  public set height(v: number) {
    this._height = v;
  }
  public get height(): number {
    return this._height;
  }

  /**
   * The suggested background color of the canvas.
   */
  private _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * The number of frames that can be decoded.
   */
  private _numFrames = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private _format: PnmFormat = PnmFormat.invalid;
  public get format(): PnmFormat {
    return this._format;
  }

  constructor(format: PnmFormat) {
    this._format = format;
  }
}
