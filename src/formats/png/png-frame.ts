/** @format */

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
  // DisposeMode
  public static readonly APNG_DISPOSE_OP_NONE = 0;

  public static readonly APNG_DISPOSE_OP_BACKGROUND = 1;

  public static readonly APNG_DISPOSE_OP_PREVIOUS = 2;

  // BlendMode
  public static readonly APNG_BLEND_OP_SOURCE = 0;

  public static readonly APNG_BLEND_OP_OVER = 1;

  private readonly _fdat: number[] = [];
  public get fdat(): number[] {
    return this._fdat;
  }

  private _sequenceNumber?: number;
  public get sequenceNumber(): number | undefined {
    return this._sequenceNumber;
  }

  private _width?: number;
  public get width(): number | undefined {
    return this._width;
  }

  private _height?: number;
  public get height(): number | undefined {
    return this._height;
  }

  private _xOffset?: number;
  public get xOffset(): number | undefined {
    return this._xOffset;
  }

  private _yOffset?: number;
  public get yOffset(): number | undefined {
    return this._yOffset;
  }

  private _delayNum?: number;
  public get delayNum(): number | undefined {
    return this._delayNum;
  }

  private _delayDen?: number;
  public get delayDen(): number | undefined {
    return this._delayDen;
  }

  private _dispose?: number;
  public get dispose(): number | undefined {
    return this._dispose;
  }

  private _blend?: number;
  public get blend(): number | undefined {
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

  constructor(options: PngFrameInitOptions) {
    this._sequenceNumber = options?.sequenceNumber;
    this._width = options?.width;
    this._height = options?.height;
    this._xOffset = options?.xOffset;
    this._yOffset = options?.yOffset;
    this._delayNum = options?.delayNum;
    this._delayDen = options?.delayDen;
    this._dispose = options?.dispose;
    this._blend = options?.blend;
  }
}
