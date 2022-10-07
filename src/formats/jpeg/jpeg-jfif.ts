/** @format */

import { InputBuffer } from '../util/input-buffer';

export class JpegJfif {
  private _thumbWidth: number;
  public get thumbWidth(): number {
    return this._thumbWidth;
  }

  private _thumbHeight: number;
  public get thumbHeight(): number {
    return this._thumbHeight;
  }

  private _majorVersion: number;
  public get majorVersion(): number {
    return this._majorVersion;
  }

  private _minorVersion: number;
  public get minorVersion(): number {
    return this._minorVersion;
  }

  private _densityUnits: number;
  public get densityUnits(): number {
    return this._densityUnits;
  }

  private _xDensity: number;
  public get xDensity(): number {
    return this._xDensity;
  }

  private _yDensity: number;
  public get yDensity(): number {
    return this._yDensity;
  }

  private _thumbData: InputBuffer;
  public get thumbData(): InputBuffer {
    return this._thumbData;
  }

  constructor(
    thumbWidth: number,
    thumbHeight: number,
    majorVersion: number,
    minorVersion: number,
    densityUnits: number,
    xDensity: number,
    yDensity: number,
    thumbData: InputBuffer
  ) {
    this._thumbWidth = thumbWidth;
    this._thumbHeight = thumbHeight;
    this._majorVersion = majorVersion;
    this._minorVersion = minorVersion;
    this._densityUnits = densityUnits;
    this._xDensity = xDensity;
    this._yDensity = yDensity;
    this._thumbData = thumbData;
  }
}
