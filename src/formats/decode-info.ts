/** @format */

import { Color } from '../color/color.js';

/**
 * Provides information about the image being decoded.
 */
export interface DecodeInfo {
  /**
   * Gets the width of the image canvas.
   */
  get width(): number;

  /**
   * Gets the height of the image canvas.
   */
  get height(): number;

  /**
   * Gets the suggested background color of the canvas.
   */
  get backgroundColor(): Color | undefined;

  /**
   * Gets the number of frames that can be decoded.
   */
  get numFrames(): number;
}
