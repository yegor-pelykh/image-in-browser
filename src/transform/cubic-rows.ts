/** @format */

import { MemoryImage } from '../image/image.js';
import type { Pixel } from '../image/pixel.js';

/**
 * A read-through view over a source image that caches the four rows used by
 * each output row of a cubic resize into a small ring buffer, so an in-place
 * downscale never reads pixels that have already been overwritten.
 *
 * This reuses MemoryImage's cubic arithmetic and bounds handling, replacing
 * only reads. It relies on getPixelCubic -> getPixelSafe -> getPixel dispatch;
 * direct data reads in that chain would bypass the cache and require adapting
 * this sampler. During downscaling, output row y ends before source row y + 1,
 * so newly needed future rows are untouched and overlapping neighbors stay in
 * the ring.
 */
export class CubicRows extends MemoryImage {
  private readonly _rows: MemoryImage;
  private readonly _tags: number[] = [-1, -1, -1, -1];

  /**
   * Constructs a CubicRows sampler over **source**.
   * @param {MemoryImage} source - The source image to cache rows from.
   */
  constructor(source: MemoryImage) {
    super();
    this._rows = new MemoryImage({
      width: source.width,
      height: 4,
      numChannels: source.numChannels,
    });
    this._data = source.data;
  }

  /**
   * Caches the source rows surrounding **centerY** needed by a cubic sample.
   * @param {number} centerY - The center source row of the output row.
   */
  public prepare(centerY: number): void {
    const stride = this.width * this.numChannels;
    const source = this.data!.toUint8Array();
    const cached = this._rows.data!.toUint8Array();
    for (let y = centerY - 1; y <= centerY + 2; y++) {
      if (y < 0 || y >= this.height) {
        continue;
      }
      const slot = y % 4;
      if (this._tags[slot] === y) {
        continue;
      }
      cached.set(source.subarray(y * stride, (y + 1) * stride), slot * stride);
      this._tags[slot] = y;
    }
  }

  /**
   * Retrieves a pixel from the cached ring buffer.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel object to populate.
   * @returns {Pixel} The cached pixel at the specified coordinates.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    return this._rows.getPixel(x, y % 4, pixel);
  }
}
