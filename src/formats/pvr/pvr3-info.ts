/** @format */

import { Color } from '../../color/color';
import { DecodeInfo } from '../decode-info';

export interface Pvr3InfoOptions {
  width: number;
  height: number;
  mipCount: number;
  flags: number;
  format: number;
  order: number[];
  colorSpace: number;
  channelType: number;
  depth: number;
  numSurfaces: number;
  numFaces: number;
  metadataSize: number;
}

export class Pvr3Info implements DecodeInfo {
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

  private _format: number = 0;
  public get format(): number {
    return this._format;
  }

  private _order: number[] = [0, 0, 0, 0];
  public get order(): number[] {
    return this._order;
  }

  private _colorSpace: number = 0;
  public get colorSpace(): number {
    return this._colorSpace;
  }

  private _channelType: number = 0;
  public get channelType(): number {
    return this._channelType;
  }

  private _depth: number = 0;
  public get depth(): number {
    return this._depth;
  }

  private _numSurfaces: number = 0;
  public get numSurfaces(): number {
    return this._numSurfaces;
  }

  private _numFaces: number = 0;
  public get numFaces(): number {
    return this._numFaces;
  }

  private _metadataSize: number = 0;
  public get metadataSize(): number {
    return this._metadataSize;
  }

  constructor(opt: Pvr3InfoOptions) {
    this._width = opt.width;
    this._height = opt.height;
    this._mipCount = opt.mipCount;
    this._flags = opt.flags;
    this._format = opt.format;
    this._order = opt.order;
    this._colorSpace = opt.colorSpace;
    this._channelType = opt.channelType;
    this._depth = opt.depth;
    this._numSurfaces = opt.numSurfaces;
    this._numFaces = opt.numFaces;
    this._metadataSize = opt.metadataSize;
  }
}
