/** @format */

import { PngBlendMode } from './png-blend-mode.js';
import { PngDisposeMode } from './png-dispose-mode.js';

/**
 * Interface for initializing options of a PNG frame.
 */
export interface PngFrameInitOptions {
  /** Sequence number of the frame. */
  sequenceNumber?: number;
  /** Width of the frame. */
  width?: number;
  /** Height of the frame. */
  height?: number;
  /** X offset of the frame. */
  xOffset?: number;
  /** Y offset of the frame. */
  yOffset?: number;
  /** Delay numerator for the frame. */
  delayNum?: number;
  /** Delay denominator for the frame. */
  delayDen?: number;
  /** Dispose mode of the frame. */
  dispose?: number;
  /** Blend mode of the frame. */
  blend?: number;
}

/**
 * Class representing a frame in a PNG animation.
 */
export class PngFrame {
  /** Frame data array. */
  private readonly _fdat: number[] = [];
  /** Gets the frame data array. */
  public get fdat(): number[] {
    return this._fdat;
  }

  /** Sequence number of the frame. */
  private _sequenceNumber: number;
  /** Gets the sequence number of the frame. */
  public get sequenceNumber(): number {
    return this._sequenceNumber;
  }

  /** Width of the frame. */
  private _width: number;
  /** Gets the width of the frame. */
  public get width(): number {
    return this._width;
  }

  /** Height of the frame. */
  private _height: number;
  /** Gets the height of the frame. */
  public get height(): number {
    return this._height;
  }

  /** X offset of the frame. */
  private _xOffset: number;
  /** Gets the X offset of the frame. */
  public get xOffset(): number {
    return this._xOffset;
  }

  /** Y offset of the frame. */
  private _yOffset: number;
  /** Gets the Y offset of the frame. */
  public get yOffset(): number {
    return this._yOffset;
  }

  /** Delay numerator for the frame. */
  private _delayNum: number;
  /** Gets the delay numerator for the frame. */
  public get delayNum(): number {
    return this._delayNum;
  }

  /** Delay denominator for the frame. */
  private _delayDen: number;
  /** Gets the delay denominator for the frame. */
  public get delayDen(): number {
    return this._delayDen;
  }

  /** Dispose mode of the frame. */
  private _dispose: PngDisposeMode;
  /** Gets the dispose mode of the frame. */
  public get dispose(): PngDisposeMode {
    return this._dispose;
  }

  /** Blend mode of the frame. */
  private _blend: PngBlendMode;
  /** Gets the blend mode of the frame. */
  public get blend(): PngBlendMode {
    return this._blend;
  }

  /**
   * Gets the delay of the frame.
   * @returns {number} The delay of the frame.
   */
  public get delay(): number {
    if (this._delayNum === undefined || this._delayDen === undefined) {
      return 0;
    }
    if (this._delayDen === 0) {
      return 0;
    }
    return this._delayNum / this._delayDen;
  }

  /**
   * Initializes a new instance of the PngFrame class.
   * @param {PngFrameInitOptions} opt - Initialization options for the frame.
   * @param {number} opt.sequenceNumber - The sequence number of the frame.
   * @param {number} opt.width - The width of the frame.
   * @param {number} opt.height - The height of the frame.
   * @param {number} opt.xOffset - The x-offset of the frame.
   * @param {number} opt.yOffset - The y-offset of the frame.
   * @param {number} opt.delayNum - The numerator of the delay fraction.
   * @param {number} opt.delayDen - The denominator of the delay fraction.
   * @param {PngDisposeMode} opt.dispose - The disposal method for the frame.
   * @param {PngBlendMode} opt.blend - The blend mode for the frame.
   */
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
