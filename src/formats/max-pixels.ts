/** @format */

import { LibError } from '../error/lib-error.js';

/**
 * Throws a {@link LibError} if a {@link width} x {@link height} image is empty,
 * unless {@link allowEmpty}, or has more than {@link maxPixels} pixels. A
 * {@link maxPixels} <= 0 disables the limit.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {number} maxPixels - The maximum number of pixels, or <= 0 to disable.
 * @param {object} [opt] - Options.
 * @param {boolean} [opt.allowEmpty=false] - Allow empty (zero-sized) images.
 * @throws {LibError} If the image dimensions are invalid or exceed maxPixels.
 */
export function checkPixels(
  width: number,
  height: number,
  maxPixels: number,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): void {
  if (allowEmpty ? width < 0 || height < 0 : width < 1 || height < 1) {
    throw new LibError(`Invalid image dimensions ${width}x${height}`);
  }
  if (maxPixels > 0 && width * height > maxPixels) {
    throw new LibError(
      `Image dimensions ${width}x${height} exceed the maximum of ` +
        `${maxPixels} pixels`
    );
  }
}

/**
 * Tracks the pixels of the frames decoded for an animation, throwing a
 * {@link LibError} once they exceed {@link maxPixels}.
 */
export class PixelBudget {
  /**
   * The maximum number of pixels.
   */
  public readonly maxPixels: number;

  /**
   * What the pixels are of, for the exception message.
   */
  public readonly what: string;

  private _total = 0;

  /**
   * Creates a PixelBudget.
   * @param {number} maxPixels - The maximum number of pixels, or <= 0 to disable.
   * @param {object} [opt] - Options.
   * @param {string} [opt.what='Animation frames'] - What the pixels are of.
   */
  constructor(
    maxPixels: number,
    { what = 'Animation frames' }: { what?: string } = {}
  ) {
    this.maxPixels = maxPixels;
    this.what = what;
  }

  /**
   * Adds a frame of {@link width} x {@link height} pixels to the budget.
   * @param {number} width - The width of the frame.
   * @param {number} height - The height of the frame.
   * @throws {LibError} If the total exceeds maxPixels.
   */
  public add(width: number, height: number): void {
    this._total += width * height;
    if (this.maxPixels > 0 && this._total > this.maxPixels) {
      throw new LibError(
        `${this.what} exceed the maximum of ${this.maxPixels} pixels`
      );
    }
  }
}
