/** @format */

/**
 * Reflects **x** into the range [0, max), for sampling past the edges of an
 * image. Clamped, for kernels larger than the image.
 * @param {number} max - The maximum index.
 * @param {number} x - The index to reflect.
 * @returns {number} The reflected index.
 */
export function reflectIndex(max: number, x: number): number {
  let v = x;
  if (v < 0) {
    v = -v;
  }
  if (v >= max) {
    v = max - (v - max) - 1;
  }
  return v < 0 ? 0 : v >= max ? max - 1 : v;
}
