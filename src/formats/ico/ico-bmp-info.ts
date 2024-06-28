/** @format */

import { BmpInfo } from '../bmp/bmp-info.js';

/**
 * Class representing ICO BMP information.
 * Extends the BmpInfo class.
 */
export class IcoBmpInfo extends BmpInfo {
  /**
   * Gets the height of the ICO BMP.
   * @returns {number} The height divided by 2.
   */
  public get height(): number {
    return Math.floor(this._height / 2);
  }

  /**
   * Determines whether to ignore the alpha channel.
   * @returns {boolean} False if header size is 40 and bits per pixel is 32, otherwise calls the parent method.
   */
  public get ignoreAlphaChannel(): boolean {
    return this.headerSize === 40 && this.bitsPerPixel === 32
      ? false
      : super.ignoreAlphaChannel;
  }
}
