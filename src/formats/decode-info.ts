/** @format */

import { Color } from '../color/color';

/**
 * Provides information about the image being decoded.
 */
export interface DecodeInfo {
  /**
   * The width of the image canvas.
   */
  get width(): number;

  /**
   * The height of the image canvas.
   */
  get height(): number;

  /**
   * The suggested background color of the canvas.
   */
  get backgroundColor(): Color | undefined;

  /**
   * The number of frames that can be decoded.
   */
  get numFrames(): number;
}
