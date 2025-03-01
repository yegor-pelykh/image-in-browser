/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';

/**
 * Class representing JPEG information.
 * Implements the DecodeInfo interface.
 */
export class JpegInfo implements DecodeInfo {
  /**
   * Width of the JPEG image.
   * @private
   */
  private _width = 0;

  /**
   * Gets the width of the JPEG image.
   * @returns {number} The width of the image.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Height of the JPEG image.
   * @private
   */
  private _height = 0;

  /**
   * Gets the height of the JPEG image.
   * @returns {number} The height of the image.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Number of frames in the JPEG image.
   * @private
   */
  private _numFrames = 1;

  /**
   * Gets the number of frames in the JPEG image.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._numFrames;
  }

  /**
   * Background color of the JPEG image.
   * @private
   */
  private _backgroundColor: Color | undefined = undefined;

  /**
   * Gets the background color of the JPEG image.
   * @returns {Color | undefined} The background color of the image.
   */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * The number of components in the image
   * @private
   */
  private _numComponents: number = 0;

  /**
   * Gets the number of components in the image
   * @returns {number} The number of components in the image
   */
  public get numComponents(): number {
    return this._numComponents;
  }

  /**
   * Sets the number of components in the image
   */
  public set numComponents(v: number) {
    this._numComponents = v;
  }

  /**
   * Sets the size of the JPEG image.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   */
  public setSize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }
}
