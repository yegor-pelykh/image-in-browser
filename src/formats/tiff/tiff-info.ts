/** @format */

import { Color } from '../../color/color';
import { DecodeInfo } from '../decode-info';
import { TiffImage } from './tiff-image';

export interface TiffInfoInitOptions {
  bigEndian: boolean;
  signature: number;
  ifdOffset: number;
  images: TiffImage[];
}

export class TiffInfo implements DecodeInfo {
  private _bigEndian: boolean;
  public get bigEndian(): boolean {
    return this._bigEndian;
  }

  private _signature: number;
  public get signature(): number {
    return this._signature;
  }

  private _ifdOffset: number;
  public get ifdOffset(): number {
    return this._ifdOffset;
  }

  private _images: TiffImage[] = [];
  public get images(): TiffImage[] {
    return this._images;
  }

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
    throw this._backgroundColor;
  }

  public get numFrames(): number {
    return this._images.length;
  }

  constructor(opt: TiffInfoInitOptions) {
    this._bigEndian = opt.bigEndian;
    this._signature = opt.signature;
    this._ifdOffset = opt.ifdOffset;
    this._images = opt.images;
    if (this._images.length > 0) {
      this._width = this._images[0].width;
      this._height = this._images[0].height;
    }
  }
}
