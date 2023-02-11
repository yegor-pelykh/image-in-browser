/** @format */

import { Color } from '../../color/color';
import { DecodeInfo } from '../decode-info';
import { GifColorMap } from './gif-color-map';
import { GifImageDesc } from './gif-image-desc';

export interface GifInfoInitOptions {
  width?: number;
  height?: number;
  backgroundColor?: Color;
  frames?: Array<GifImageDesc>;
  colorResolution?: number;
  globalColorMap?: GifColorMap;
  isGif89?: boolean;
}

export class GifInfo implements DecodeInfo {
  private _width = 0;
  public get width(): number {
    return this._width;
  }

  private _height = 0;
  public get height(): number {
    return this._height;
  }

  private _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  private _frames: Array<GifImageDesc>;
  public get frames(): Array<GifImageDesc> {
    return this._frames;
  }

  private _colorResolution;
  public get colorResolution(): number {
    return this._colorResolution;
  }

  private _globalColorMap?: GifColorMap;
  public get globalColorMap(): GifColorMap | undefined {
    return this._globalColorMap;
  }

  private _isGif89 = false;
  public get isGif89(): boolean {
    return this._isGif89;
  }

  public get numFrames(): number {
    return this.frames.length;
  }

  constructor(opt?: GifInfoInitOptions) {
    this._width = opt?.width ?? 0;
    this._height = opt?.height ?? 0;
    this._backgroundColor = opt?.backgroundColor;
    this._frames = opt?.frames ?? new Array<GifImageDesc>();
    this._colorResolution = opt?.colorResolution ?? 0;
    this._globalColorMap = opt?.globalColorMap;
    this._isGif89 = opt?.isGif89 ?? false;
  }
}
