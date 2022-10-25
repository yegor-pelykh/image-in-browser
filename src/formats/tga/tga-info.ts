/** @format */

import { DecodeInfo } from '../decode-info';

export interface TgaInfoInitOptions {
  width?: number;
  height?: number;
  imageOffset?: number;
  bitsPerPixel?: number;
}

export class TgaInfo implements DecodeInfo {
  private readonly _width: number = 0;
  public get width(): number {
    return this._width;
  }

  protected readonly _height: number = 0;
  public get height(): number {
    return this._height;
  }

  private readonly _backgroundColor: number = 0xffffffff;
  public get backgroundColor(): number {
    return this._backgroundColor;
  }

  /**
   * The number of frames that can be decoded.
   */
  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  /**
   *  Offset in the input file the image data starts at.
   */
  private readonly _imageOffset: number | undefined = undefined;
  public get imageOffset(): number | undefined {
    return this._imageOffset;
  }

  /**
   *  Bits per pixel.
   */
  private readonly _bitsPerPixel: number | undefined = undefined;
  public get bitsPerPixel(): number | undefined {
    return this._bitsPerPixel;
  }

  constructor(options?: TgaInfoInitOptions) {
    this._width = options?.width ?? 0;
    this._height = options?.height ?? 0;
    this._imageOffset = options?.imageOffset ?? undefined;
    this._bitsPerPixel = options?.bitsPerPixel ?? undefined;
  }
}
