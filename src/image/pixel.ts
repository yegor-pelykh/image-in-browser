/** @format */

import { Color } from '../color/color';
import { MemoryImageData } from './image-data';
import { PixelUndefined } from './pixel-undefined';

export interface Pixel extends Color, Iterator<Pixel> {
  /**
   * The [MemoryImageData] this pixel refers to.
   */
  get image(): MemoryImageData;
  /**
   * True if this points to a valid pixel, otherwise false.
   */
  get isValid(): boolean;
  /**
   * The width in pixels of the image data this pixel refers to.
   */
  get width(): number;
  /**
   * The height in pixels of the image data this pixel refers to.
   */
  get height(): number;
  /**
   * The x coordinate of the pixel.
   */
  get x(): number;
  /**
   * The y coordinate of the pixel.
   */
  get y(): number;
  /**
   * The normalized x coordinate of the pixel, in the range [0, 1].
   */
  get xNormalized(): number;
  /**
   * The normalized y coordinate of the pixel, in the range [0, 1].
   */
  get yNormalized(): number;
  /**
   * Set the coordinates of the pixel.
   */
  setPosition(x: number, y: number): void;
  /**
   * Set the normalized coordinates of the pixel, in the range [0, 1].
   */
  setPositionNormalized(x: number, y: number): void;
  /**
   * Tests if this pixel has the same values as the given pixel or color.
   */
  equals(other: Pixel | number[]): boolean;
}

/**
 * UndefinedPixel is used to represent an invalid pixel.
 */
export const UndefinedPixel = new PixelUndefined();
