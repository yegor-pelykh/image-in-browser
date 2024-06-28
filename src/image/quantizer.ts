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
  /**
   * Get the palette used by the quantizer.
   */
  get palette(): Palette;

  /**
   * Get the index of the color **c** in the palette.
   * @param {Color} c - The color to find the index for.
   * @returns {number} The index of the color in the palette.
   */
  getColorIndex(c: Color): number;

  /**
   * Get the index of the color specified by RGB values in the palette.
   * @param {number} r - The red component of the color.
   * @param {number} g - The green component of the color.
   * @param {number} b - The blue component of the color.
   * @returns {number} The index of the color in the palette.
   */
  getColorIndexRgb(r: number, g: number, b: number): number;

  /**
   * Find the index of the closest color to **c** in the **palette**.
   * @param {Color} c - The color to find the closest match for.
   * @returns {Color} The closest color in the palette.
   */
  getQuantizedColor(c: Color): Color;

  /**
   * Convert the **image** to a palette image.
   * @param {MemoryImage} image - The image to convert.
   * @returns {MemoryImage} The converted palette image.
   */
  getIndexImage(image: MemoryImage): MemoryImage;
}
