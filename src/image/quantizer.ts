/** @format */

import { Color } from '../color/color.js';
import { MemoryImage } from './image.js';
import { Palette } from './palette.js';

/**
 * Interface for color quantizers, which reduce the total number of colors
 * used by an image to a given maximum, used to convert images to palette
 * images.
 */
export interface Quantizer {
  get palette(): Palette;

  getColorIndex(c: Color): number;

  getColorIndexRgb(r: number, g: number, b: number): number;

  /**
   * Find the index of the closest color to **c** in the **palette**.
   */
  getQuantizedColor(c: Color): Color;

  /**
   * Convert the **image** to a palette image.
   */
  getIndexImage(image: MemoryImage): MemoryImage;
}
