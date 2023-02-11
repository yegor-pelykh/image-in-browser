/** @format */

import { PngBlendMode } from './png-blend-mode';
import { PngDisposeMode } from './png-dispose-mode';

export interface PngFrameInitOptions {
  sequenceNumber?: number;
  width?: number;
  height?: number;
  xOffset?: number;
  yOffset?: number;
  delayNum?: number;
  delayDen?: number;
  dispose?: number;
  blend?: number;
}

// Decodes a frame from a PNG animation.
export class PngFrame {
  private readonly _fdat: number[] = [];
  public get fdat(): number[] {
    return this._fdat;
  }

  private _sequenceNumber: number;
  public get sequenceNumber(): number {
    return this._sequenceNumber;
  }

  private _width: number;
  public get width(): number {
    return this._width;
  }

  private _height: number;
  public get height(): number {
    return this._height;
  }

  private _xOffset: number;
  public get xOffset(): number {
    return this._xOffset;
  }

  private _yOffset: number;
  public get yOffset(): number {
    return this._yOffset;
  }

  private _delayNum: number;
  public get delayNum(): number {
    return this._delayNum;
  }

  private _delayDen: number;
  public get delayDen(): number {
    return this._delayDen;
  }

  private _dispose: PngDisposeMode;
  public get dispose(): PngDisposeMode {
    return this._dispose;
  }

  private _blend: PngBlendMode;
  public get blend(): PngBlendMode {
    return this._blend;
  }

  public get delay() {
    if (this._delayNum === undefined || this._delayDen === undefined) {
      return 0;
    }
    if (this._delayDen === 0) {
      return 0;
    }
    return this._delayNum / this._delayDen;
  }

  constructor(opt: PngFrameInitOptions) {
    this._sequenceNumber = opt?.sequenceNumber ?? 0;
    this._width = opt?.width ?? 0;
    this._height = opt?.height ?? 0;
    this._xOffset = opt?.xOffset ?? 0;
    this._yOffset = opt?.yOffset ?? 0;
    this._delayNum = opt?.delayNum ?? 0;
    this._delayDen = opt?.delayDen ?? 0;
    this._dispose = opt?.dispose ?? PngDisposeMode.none;
    this._blend = opt?.blend ?? PngBlendMode.source;
  }
}
