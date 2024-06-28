/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { WebPFormat } from './webp-format.js';
import { WebPFrame } from './webp-frame.js';

/**
 * Features gathered from the bitstream
 */
export class WebPInfo implements DecodeInfo {
  /**
   * Width of the WebP image
   */
  private _width = 0;
  /**
   * Gets the width of the WebP image
   * @returns {number} The width of the WebP image
   */
  public get width(): number {
    return this._width;
  }
  /**
   * Sets the width of the WebP image
   * @param {number} v - The width to set
   */
  public set width(v: number) {
    this._width = v;
  }

  /**
   * Height of the WebP image
   */
  private _height = 0;
  /**
   * Gets the height of the WebP image
   * @returns {number} The height of the WebP image
   */
  public get height(): number {
    return this._height;
  }
  /**
   * Sets the height of the WebP image
   * @param {number} v - The height to set
   */
  public set height(v: number) {
    this._height = v;
  }

  /**
   * Background color of the WebP image
   */
  private _backgroundColor?: Color;
  /**
   * Gets the background color of the WebP image
   * @returns {Color | undefined} The background color of the WebP image
   */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }
  /**
   * Sets the background color of the WebP image
   * @param {Color | undefined} v - The background color to set
   */
  public set backgroundColor(v: Color | undefined) {
    this._backgroundColor = v;
  }

  /**
   * Indicates if the bitstream contains an alpha channel
   */
  private _hasAlpha: boolean = false;
  /**
   * Gets the alpha channel status
   * @returns {boolean} True if the bitstream contains an alpha channel
   */
  public get hasAlpha(): boolean {
    return this._hasAlpha;
  }
  /**
   * Sets the alpha channel status
   * @param {boolean} v - The alpha channel status to set
   */
  public set hasAlpha(v: boolean) {
    this._hasAlpha = v;
  }

  /**
   * Format of the WebP image
   */
  private _format: WebPFormat = WebPFormat.undefined;
  /**
   * Gets the format of the WebP image
   * @returns {WebPFormat} The format of the WebP image
   */
  public get format(): WebPFormat {
    return this._format;
  }
  /**
   * Sets the format of the WebP image
   * @param {WebPFormat} v - The format to set
   */
  public set format(v: WebPFormat) {
    this._format = v;
  }

  /**
   * Indicates if the bitstream is an animation
   */
  private _hasAnimation: boolean = false;
  /**
   * Gets the animation status
   * @returns {boolean} True if the bitstream is an animation
   */
  public get hasAnimation(): boolean {
    return this._hasAnimation;
  }
  /**
   * Sets the animation status
   * @param {boolean} v - The animation status to set
   */
  public set hasAnimation(v: boolean) {
    this._hasAnimation = v;
  }

  /**
   * ICCP data of the WebP image
   */
  private _iccpData?: Uint8Array;
  /**
   * Gets the ICCP data
   * @returns {Uint8Array | undefined} The ICCP data
   */
  public get iccpData(): Uint8Array | undefined {
    return this._iccpData;
  }
  /**
   * Sets the ICCP data
   * @param {Uint8Array | undefined} v - The ICCP data to set
   */
  public set iccpData(v: Uint8Array | undefined) {
    this._iccpData = v;
  }

  /**
   * EXIF data string of the WebP image
   */
  private _exifData: string = '';
  /**
   * Gets the EXIF data string
   * @returns {string} The EXIF data string
   */
  public get exifData(): string {
    return this._exifData;
  }
  /**
   * Sets the EXIF data string
   * @param {string} v - The EXIF data string to set
   */
  public set exifData(v: string) {
    this._exifData = v;
  }

  /**
   * XMP data string of the WebP image
   */
  private _xmpData: string = '';
  /**
   * Gets the XMP data string
   * @returns {string} The XMP data string
   */
  public get xmpData(): string {
    return this._xmpData;
  }
  /**
   * Sets the XMP data string
   * @param {string} v - The XMP data string to set
   */
  public set xmpData(v: string) {
    this._xmpData = v;
  }

  /**
   * Number of times the animation should loop
   */
  private _animLoopCount: number = 0;
  /**
   * Gets the animation loop count
   * @returns {number} The number of times the animation should loop
   */
  public get animLoopCount(): number {
    return this._animLoopCount;
  }
  /**
   * Sets the animation loop count
   * @param {number} v - The animation loop count to set
   */
  public set animLoopCount(v: number) {
    this._animLoopCount = v;
  }

  /**
   * Information about each animation frame
   */
  private readonly _frames: WebPFrame[] = [];
  /**
   * Gets the frames of the animation
   * @returns {WebPFrame[]} The frames of the animation
   */
  public get frames(): WebPFrame[] {
    return this._frames;
  }

  /**
   * Gets the number of frames in the animation
   * @returns {number} The number of frames in the animation
   */
  public get numFrames(): number {
    return this._frames.length;
  }
}
