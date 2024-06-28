/** @format */

import { WinEncoder } from './win-encoder.js';

/**
 * IcoEncoder class extends WinEncoder to handle ICO encoding specifics.
 */
export class IcoEncoder extends WinEncoder {
  /**
   * Type of the encoder, specific to ICO format.
   * @protected
   */
  protected _type = 1;
  /**
   * Returns the color planes or X hot spot for the given index.
   * @param {number} _index - The index for which to retrieve the value.
   * @returns {number} The color planes or X hot spot value.
   * @protected
   */
  protected colorPlanesOrXHotSpot(_index: number): number {
    return 0;
  }

  /**
   * Returns the bits per pixel or Y hot spot for the given index.
   * @param {number} _index - The index for which to retrieve the value.
   * @returns {number} The bits per pixel or Y hot spot value.
   * @protected
   */
  protected bitsPerPixelOrYHotSpot(_index: number): number {
    return 32;
  }
}
