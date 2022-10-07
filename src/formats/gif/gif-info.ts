/** @format */

import { DecodeInfo } from '../decode-info';
import { GifColorMap } from './gif-color-map';
import { GifImageDesc } from './gif-image-desc';

export interface GifInfoInitOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  frames?: Array<GifImageDesc>;
  colorResolution?: number;
  globalColorMap?: GifColorMap;
  isGif89?: boolean;
}

export class GifInfo implements DecodeInfo {
  private _width;
  public get width(): number {
    return this._width;
  }

  private _height;
  public get height(): number {
    return this._height;
  }

  private _backgroundColor;
  public get backgroundColor(): number {
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

  constructor(options?: GifInfoInitOptions) {
    this._width = options?.width ?? 0;
    this._height = options?.height ?? 0;
    this._backgroundColor = options?.backgroundColor ?? 0xffffffff;
    this._frames = options?.frames ?? new Array<GifImageDesc>();
    this._colorResolution = options?.colorResolution ?? 0;
    this._globalColorMap = options?.globalColorMap;
    this._isGif89 = options?.isGif89 ?? false;
  }
}
