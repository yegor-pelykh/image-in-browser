/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { GifColorMap } from './gif-color-map.js';
import { GifImageDesc } from './gif-image-desc.js';

/**
 * Interface for initializing GifInfo options.
 */
export interface GifInfoInitOptions {
  /** Width of the GIF. */
  width?: number;
  /** Height of the GIF. */
  height?: number;
  /** Background color of the GIF. */
  backgroundColor?: Color;
  /** Array of frames in the GIF. */
  frames?: Array<GifImageDesc>;
  /** Color resolution of the GIF. */
  colorResolution?: number;
  /** Global color map of the GIF. */
  globalColorMap?: GifColorMap;
  /** Indicates if the GIF is version 89a. */
  isGif89?: boolean;
}

/**
 * Class representing GIF information.
 */
export class GifInfo implements DecodeInfo {
  /** Width of the GIF. */
  private _width = 0;
  /** Gets the width of the GIF. */
  public get width(): number {
    return this._width;
  }

  /** Height of the GIF. */
  private _height = 0;
  /** Gets the height of the GIF. */
  public get height(): number {
    return this._height;
  }

  /** Background color of the GIF. */
  private _backgroundColor: Color | undefined = undefined;
  /** Gets the background color of the GIF. */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /** Array of frames in the GIF. */
  private _frames: Array<GifImageDesc>;
  /** Gets the array of frames in the GIF. */
  public get frames(): Array<GifImageDesc> {
    return this._frames;
  }

  /** Color resolution of the GIF. */
  private _colorResolution;
  /** Gets the color resolution of the GIF. */
  public get colorResolution(): number {
    return this._colorResolution;
  }

  /** Global color map of the GIF. */
  private _globalColorMap?: GifColorMap;
  /** Gets the global color map of the GIF. */
  public get globalColorMap(): GifColorMap | undefined {
    return this._globalColorMap;
  }

  /** Indicates if the GIF is version 89a. */
  private _isGif89 = false;
  /** Gets the indication if the GIF is version 89a. */
  public get isGif89(): boolean {
    return this._isGif89;
  }

  /** Gets the number of frames in the GIF. */
  public get numFrames(): number {
    return this.frames.length;
  }

  /**
   * Initializes a new instance of the GifInfo class.
   * @param {GifInfoInitOptions} [opt] - Initialization options for the GIF.
   * @param {number} [opt.width] - Width of the GIF.
   * @param {number} [opt.height] - Height of the GIF.
   * @param {string} [opt.backgroundColor] - Background color of the GIF.
   * @param {GifImageDesc[]} [opt.frames] - Array of frames in the GIF.
   * @param {number} [opt.colorResolution] - Color resolution of the GIF.
   * @param {any} [opt.globalColorMap] - Global color map of the GIF.
   * @param {boolean} [opt.isGif89] - Indicates if the GIF is version 89a.
   */
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
