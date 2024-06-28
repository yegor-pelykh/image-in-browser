/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { WebPInfo } from './webp-info.js';

/**
 * Class representing internal information about a WebP image.
 * Extends the WebPInfo class.
 */
export class WebPInfoInternal extends WebPInfo {
  /**
   * The number of frames in the WebP image.
   * @private
   */
  private _frameCount: number = 0;

  /**
   * Gets the number of frames in the WebP image.
   * @returns {number} The number of frames.
   */
  public get frameCount(): number {
    return this._frameCount;
  }

  /**
   * Sets the number of frames in the WebP image.
   * @param {number} v - The number of frames.
   */
  public set frameCount(v: number) {
    this._frameCount = v;
  }

  /**
   * The current frame index.
   * @private
   */
  private _frame: number = 0;

  /**
   * Gets the current frame index.
   * @returns {number} The current frame index.
   */
  public get frame(): number {
    return this._frame;
  }

  /**
   * Sets the current frame index.
   * @param {number} v - The current frame index.
   */
  public set frame(v: number) {
    this._frame = v;
  }

  /**
   * The alpha data buffer.
   * @private
   */
  private _alphaData?: InputBuffer<Uint8Array>;

  /**
   * Gets the alpha data buffer.
   * @returns {InputBuffer<Uint8Array> | undefined} The alpha data buffer.
   */
  public get alphaData(): InputBuffer<Uint8Array> | undefined {
    return this._alphaData;
  }

  /**
   * Sets the alpha data buffer.
   * @param {InputBuffer<Uint8Array> | undefined} v - The alpha data buffer.
   */
  public set alphaData(v: InputBuffer<Uint8Array> | undefined) {
    this._alphaData = v;
  }

  /**
   * The size of the alpha data.
   * @private
   */
  private _alphaSize: number = 0;

  /**
   * Gets the size of the alpha data.
   * @returns {number} The size of the alpha data.
   */
  public get alphaSize(): number {
    return this._alphaSize;
  }

  /**
   * Sets the size of the alpha data.
   * @param {number} v - The size of the alpha data.
   */
  public set alphaSize(v: number) {
    this._alphaSize = v;
  }

  /**
   * The position of the VP8 data.
   * @private
   */
  private _vp8Position: number = 0;

  /**
   * Gets the position of the VP8 data.
   * @returns {number} The position of the VP8 data.
   */
  public get vp8Position(): number {
    return this._vp8Position;
  }

  /**
   * Sets the position of the VP8 data.
   * @param {number} v - The position of the VP8 data.
   */
  public set vp8Position(v: number) {
    this._vp8Position = v;
  }

  /**
   * The size of the VP8 data.
   * @private
   */
  private _vp8Size: number = 0;

  /**
   * Gets the size of the VP8 data.
   * @returns {number} The size of the VP8 data.
   */
  public get vp8Size(): number {
    return this._vp8Size;
  }

  /**
   * Sets the size of the VP8 data.
   * @param {number} v - The size of the VP8 data.
   */
  public set vp8Size(v: number) {
    this._vp8Size = v;
  }
}
