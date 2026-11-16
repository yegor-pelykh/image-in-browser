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
  if (maxPixels > 0 && exceeds(width, height, maxPixels)) {
    throw new LibError(
      `Image dimensions ${width}x${height} exceed the maximum of ` +
        `${maxPixels} pixels`
    );
  }
}

/**
 * How many images of up to 4 samples a pixel an image with **samples** a
 * pixel counts as. A pixel limit bounds memory only for a bounded pixel size,
 * and formats with any number of channels would otherwise multiply it.
 * @param {number} samples - The number of samples per pixel.
 * @returns {number} The number of 4-sample pixels the samples count as.
 */
export function pixelPlanes(samples: number): number {
  return samples <= 4 ? 1 : Math.floor((samples + 3) / 4);
}

/**
 * Throws a {@link LibError} if a {@link width} x {@link height} image with
 * **samples** samples a pixel takes the memory of more than **maxPixels**
 * pixels of 4 samples. The dimensions themselves are for {@link checkPixels}.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {number} samples - The number of samples per pixel.
 * @param {number} maxPixels - The maximum number of pixels, or <= 0 to disable.
 * @throws {LibError} If the image exceeds maxPixels.
 */
export function checkSamples(
  width: number,
  height: number,
  samples: number,
  maxPixels: number
): void {
  const planes = pixelPlanes(samples);
  if (
    maxPixels > 0 &&
    planes > 1 &&
    width > 0 &&
    height > 0 &&
    (exceeds(width, height, maxPixels) ||
      exceeds(width * height, planes, maxPixels))
  ) {
    throw new LibError(
      `Image of ${width}x${height} with ${samples} samples a pixel exceeds ` +
        `the maximum of ${maxPixels} pixels`
    );
  }
}

/**
 * Whether **a** * **b** > **limit** for non-negative values, without
 * computing the product, which overflows for sizes read from 32 or 64 bit
 * fields.
 * @param {number} a - The first factor.
 * @param {number} b - The second factor.
 * @param {number} limit - The limit.
 * @returns {boolean} True if the product exceeds the limit.
 */
function exceeds(a: number, b: number, limit: number): boolean {
  return b !== 0 && a > Math.floor(limit / b);
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
   * Adds **count** frames of {@link width} x {@link height} pixels to the
   * budget.
   * @param {number} width - The width of the frame.
   * @param {number} height - The height of the frame.
   * @param {number} [count=1] - The number of frames.
   * @throws {LibError} If the total exceeds maxPixels.
   */
  public add(width: number, height: number, count = 1): void {
    if (width <= 0 || height <= 0 || count <= 0) {
      return;
    }
    if (this.maxPixels <= 0) {
      return;
    }
    const remaining = this.maxPixels - this._total;
    if (
      exceeds(width, height, remaining) ||
      exceeds(width * height, count, remaining)
    ) {
      throw new LibError(
        `${this.what} exceed the maximum of ${this.maxPixels} pixels`
      );
    }
    this._total += width * height * count;
  }
}
