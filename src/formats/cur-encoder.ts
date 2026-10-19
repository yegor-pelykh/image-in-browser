/** @format */

import { Point } from '../common/point.js';
import { WinEncoder } from './win-encoder.js';

/**
 * CurEncoder class extends WinEncoder to handle CUR encoding specifics.
 */
export class CurEncoder extends WinEncoder {
  /**
   * Number of images mapped with x and y hotspot coordinates.
   */
  public hotSpots?: Map<number, Point>;

  /**
   * Creates a CUR encoder.
   * @param {Map<number, Point>} [hotSpots] - The hotspot of each image.
   */
  constructor(hotSpots?: Map<number, Point>) {
    super();
    this.hotSpots = hotSpots;
    this._type = 2;
  }

  /**
   * Gets the color planes or X hot spot for the given index.
   * @param {number} index - The index for which to retrieve the value.
   * @returns {number} The X hot spot value.
   * @protected
   */
  protected colorPlanesOrXHotSpot(index: number): number {
    if (this.hotSpots !== undefined) {
      const p = this.hotSpots.get(index);
      if (p !== undefined) {
        return Math.trunc(p.x);
      }
    }
    return 0;
  }

  /**
   * Gets the bits per pixel or Y hot spot for the given index.
   * @param {number} index - The index for which to retrieve the value.
   * @returns {number} The Y hot spot value.
   * @protected
   */
  protected bitsPerPixelOrYHotSpot(index: number): number {
    if (this.hotSpots !== undefined) {
      const p = this.hotSpots.get(index);
      if (p !== undefined) {
        return Math.trunc(p.y);
      }
    }
    return 0;
  }
}
