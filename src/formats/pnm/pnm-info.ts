/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { PnmFormat } from './pnm-format.js';

/**
 * Class representing PNM (Portable Any Map) image information.
 * Implements the DecodeInfo interface.
 */
export class PnmInfo implements DecodeInfo {
  /**
   * The width of the image canvas.
   */
  private _width = 0;

  /**
   * Gets the width of the image canvas.
   * @returns {number} The width of the image canvas.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Sets the width of the image canvas.
   * @param {number} v - The width of the image canvas.
   */
  public set width(v: number) {
    this._width = v;
  }

  /**
   * The height of the image canvas.
   */
  private _height = 0;

  /**
   * Sets the height of the image canvas.
   * @param {number} v - The height of the image canvas.
   */
  public set height(v: number) {
    this._height = v;
  }

  /**
   * Gets the height of the image canvas.
   * @returns {number} The height of the image canvas.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * The suggested background color of the canvas.
   */
  private _backgroundColor: Color | undefined = undefined;

  /**
   * Gets the suggested background color of the canvas.
   * @returns {Color | undefined} The background color of the canvas.
   */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * The number of frames that can be decoded.
   */
  private _numFrames = 1;

  /**
   * Gets the number of frames that can be decoded.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._numFrames;
  }

  /**
   * The format of the PNM image.
   */
  private _format: PnmFormat = PnmFormat.invalid;

  /**
   * Gets the format of the PNM image.
   * @returns {PnmFormat} The format of the PNM image.
   */
  public get format(): PnmFormat {
    return this._format;
  }

  /**
   * Initializes a new instance of the PnmInfo class.
   * @param {PnmFormat} format - The format of the PNM image.
   */
  constructor(format: PnmFormat) {
    this._format = format;
  }
}
