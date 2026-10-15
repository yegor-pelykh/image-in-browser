/** @format */

/**
 * Reflects **x** into the range [0, max), for sampling past the edges of an
 * image. Clamped, for kernels larger than the image.
 * @param {number} max - The maximum index.
 * @param {number} x - The index to reflect.
 * @returns {number} The reflected index.
 */
export function reflectIndex(max: number, x: number): number {
  if (x < 0) {
    x = -x;
  }
  if (x >= max) {
    x = max - (x - max) - 1;
  }
  return x < 0 ? 0 : x >= max ? max - 1 : x;
}
