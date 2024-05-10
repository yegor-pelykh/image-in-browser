/** @format */

import { Color } from '../../color/color';
import { DecodeInfo } from '../decode-info';

export interface Pvr2InfoOptions {
  width: number;
  height: number;
  mipCount: number;
  flags: number;
  texDataSize: number;
  bitsPerPixel: number;
  redMask: number;
  greenMask: number;
  blueMask: number;
  alphaMask: number;
  magic: number;
  numTex: number;
}

export class Pvr2Info implements DecodeInfo {
  private readonly _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private _width: number = 0;
  public get width(): number {
    return this._width;
  }

  private _height: number = 0;
  public get height(): number {
    return this._height;
  }

  private _mipCount: number = 0;
  public get mipCount(): number {
    return this._mipCount;
  }

  private _flags: number = 0;
  public get flags(): number {
    return this._flags;
  }

  private _texDataSize: number = 0;
  public get texDataSize(): number {
    return this._texDataSize;
  }

  private _bitsPerPixel: number = 0;
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  private _redMask: number = 0;
  public get redMask(): number {
    return this._redMask;
  }

  private _greenMask: number = 0;
  public get greenMask(): number {
    return this._greenMask;
  }

  private _blueMask: number = 0;
  public get blueMask(): number {
    return this._blueMask;
  }

  private _alphaMask: number = 0;
  public get alphaMask(): number {
    return this._alphaMask;
  }

  private _magic: number = 0;
  public get magic(): number {
    return this._magic;
  }

  private _numTex: number = 0;
  public get numTex(): number {
    return this._numTex;
  }

  constructor(opt: Pvr2InfoOptions) {
    this._width = opt.width;
    this._height = opt.height;
    this._mipCount = opt.mipCount;
    this._flags = opt.flags;
    this._texDataSize = opt.texDataSize;
    this._bitsPerPixel = opt.bitsPerPixel;
    this._redMask = opt.redMask;
    this._greenMask = opt.greenMask;
    this._blueMask = opt.blueMask;
    this._alphaMask = opt.alphaMask;
    this._magic = opt.magic;
    this._numTex = opt.numTex;
  }
}
