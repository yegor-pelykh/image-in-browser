/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

/**
 * Represents a JPEG JFIF (JPEG File Interchange Format) structure.
 */
export class JpegJfif {
  /**
   * The width of the thumbnail image.
   */
  private _thumbWidth: number;

  /**
   * Gets the width of the thumbnail image.
   */
  public get thumbWidth(): number {
    return this._thumbWidth;
  }

  /**
   * The height of the thumbnail image.
   */
  private _thumbHeight: number;

  /**
   * Gets the height of the thumbnail image.
   */
  public get thumbHeight(): number {
    return this._thumbHeight;
  }

  /**
   * The major version of the JFIF standard.
   */
  private _majorVersion: number;

  /**
   * Gets the major version of the JFIF standard.
   */
  public get majorVersion(): number {
    return this._majorVersion;
  }

  /**
   * The minor version of the JFIF standard.
   */
  private _minorVersion: number;

  /**
   * Gets the minor version of the JFIF standard.
   */
  public get minorVersion(): number {
    return this._minorVersion;
  }

  /**
   * The units used for pixel density.
   */
  private _densityUnits: number;

  /**
   * Gets the units used for pixel density.
   */
  public get densityUnits(): number {
    return this._densityUnits;
  }

  /**
   * The horizontal pixel density.
   */
  private _xDensity: number;

  /**
   * Gets the horizontal pixel density.
   */
  public get xDensity(): number {
    return this._xDensity;
  }

  /**
   * The vertical pixel density.
   */
  private _yDensity: number;

  /**
   * Gets the vertical pixel density.
   */
  public get yDensity(): number {
    return this._yDensity;
  }

  /**
   * The thumbnail image data.
   */
  private _thumbData: InputBuffer<Uint8Array>;

  /**
   * Gets the thumbnail image data.
   */
  public get thumbData(): InputBuffer<Uint8Array> {
    return this._thumbData;
  }

  /**
   * Initializes a new instance of the JpegJfif class.
   * @param {number} thumbWidth - The width of the thumbnail image.
   * @param {number} thumbHeight - The height of the thumbnail image.
   * @param {number} majorVersion - The major version of the JFIF standard.
   * @param {number} minorVersion - The minor version of the JFIF standard.
   * @param {number} densityUnits - The units used for pixel density.
   * @param {number} xDensity - The horizontal pixel density.
   * @param {number} yDensity - The vertical pixel density.
   * @param {InputBuffer<Uint8Array>} thumbData - The thumbnail image data.
   */
  constructor(
    thumbWidth: number,
    thumbHeight: number,
    majorVersion: number,
    minorVersion: number,
    densityUnits: number,
    xDensity: number,
    yDensity: number,
    thumbData: InputBuffer<Uint8Array>
  ) {
    this._thumbWidth = thumbWidth;
    this._thumbHeight = thumbHeight;
    this._majorVersion = majorVersion;
    this._minorVersion = minorVersion;
    this._densityUnits = densityUnits;
    this._xDensity = xDensity;
    this._yDensity = yDensity;
    this._thumbData = thumbData;
  }
}
