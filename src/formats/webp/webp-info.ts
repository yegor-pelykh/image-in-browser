/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { WebPFormat } from './webp-format.js';
import { WebPFrame } from './webp-frame.js';

/**
 * Features gathered from the bitstream
 */
export class WebPInfo implements DecodeInfo {
  private _width = 0;
  public get width(): number {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
  }

  private _height = 0;
  public get height(): number {
    return this._height;
  }
  public set height(v: number) {
    this._height = v;
  }

  private _backgroundColor?: Color;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }
  public set backgroundColor(v: Color | undefined) {
    this._backgroundColor = v;
  }

  private _hasAlpha: boolean = false;
  /**
   * True if the bitstream contains an alpha channel
   */
  public get hasAlpha(): boolean {
    return this._hasAlpha;
  }
  public set hasAlpha(v: boolean) {
    this._hasAlpha = v;
  }

  private _format: WebPFormat = WebPFormat.undefined;
  /**
   * 0 = undefined (/mixed), 1 = lossy, 2 = lossless, 3 = animated
   */
  public get format(): WebPFormat {
    return this._format;
  }
  public set format(v: WebPFormat) {
    this._format = v;
  }

  private _hasAnimation: boolean = false;
  /**
   * True if the bitstream is an animation
   */
  public get hasAnimation(): boolean {
    return this._hasAnimation;
  }
  public set hasAnimation(v: boolean) {
    this._hasAnimation = v;
  }

  private _iccpData?: Uint8Array;
  /**
   * ICCP data
   */
  public get iccpData(): Uint8Array | undefined {
    return this._iccpData;
  }
  public set iccpData(v: Uint8Array | undefined) {
    this._iccpData = v;
  }

  private _exifData: string = '';
  /**
   * EXIF data string
   */
  public get exifData(): string {
    return this._exifData;
  }
  public set exifData(v: string) {
    this._exifData = v;
  }

  private _xmpData: string = '';
  /**
   * XMP data string
   */
  public get xmpData(): string {
    return this._xmpData;
  }
  public set xmpData(v: string) {
    this._xmpData = v;
  }

  private _animLoopCount: number = 0;
  /**
   * How many times the animation should loop
   */
  public get animLoopCount(): number {
    return this._animLoopCount;
  }
  public set animLoopCount(v: number) {
    this._animLoopCount = v;
  }

  private readonly _frames: WebPFrame[] = [];
  /**
   * Information about each animation frame
   */
  public get frames(): WebPFrame[] {
    return this._frames;
  }

  public get numFrames(): number {
    return this._frames.length;
  }
}
