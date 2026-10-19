/** @format */

import { MemoryImage } from '../image/image.js';

/**
 * The number of bytes per pixel of **image**'s data, for transforms that move
 * whole pixels by copying their bytes. Returns 0 if a pixel isn't a whole
 * number of bytes, or the rows aren't tightly packed.
 * @param {MemoryImage} image - The image.
 * @returns {number} The number of bytes per pixel, or 0.
 */
export function bytesPerPixel(image: MemoryImage): number {
  const data = image.data;
  if (data === undefined) {
    return 0;
  }
  const bits = image.bitsPerChannel * data.numChannels;
  if ((bits & 7) !== 0) {
    return 0;
  }
  const k = bits >>> 3;
  return data.rowStride === image.width * k ? k : 0;
}

/**
 * Swaps the **k** byte pixels at byte offsets **i** and **j** of **bytes**.
 * @param {Uint8Array} bytes - The pixel data.
 * @param {number} i - The first byte offset.
 * @param {number} j - The second byte offset.
 * @param {number} k - The number of bytes per pixel.
 */
export function swapPixels(
  bytes: Uint8Array,
  i: number,
  j: number,
  k: number
): void {
  for (let c = 0; c < k; ++c) {
    const t = bytes[i + c];
    bytes[i + c] = bytes[j + c];
    bytes[j + c] = t;
  }
}

/**
 * Reverses the order of the **n** **k** byte pixels starting at byte offset
 * **start** of **bytes**.
 * @param {Uint8Array} bytes - The pixel data.
 * @param {number} start - The start byte offset.
 * @param {number} n - The number of pixels.
 * @param {number} k - The number of bytes per pixel.
 */
export function reversePixels(
  bytes: Uint8Array,
  start: number,
  n: number,
  k: number
): void {
  for (let i = start, j = start + (n - 1) * k; i < j; i += k, j -= k) {
    swapPixels(bytes, i, j, k);
  }
}

/**
 * Copies **n** **k** byte pixels from **src**, starting at byte offset **si**
 * and stepping **srcStep** bytes per pixel, to consecutive pixels of **dst**
 * starting at **di**.
 * @param {Uint8Array} src - The source data.
 * @param {number} si - The source byte offset.
 * @param {number} srcStep - The source step, in bytes, between pixels.
 * @param {Uint8Array} dst - The destination data.
 * @param {number} di - The destination byte offset.
 * @param {number} n - The number of pixels.
 * @param {number} k - The number of bytes per pixel.
 */
export function copyPixels(
  src: Uint8Array,
  si: number,
  srcStep: number,
  dst: Uint8Array,
  di: number,
  n: number,
  k: number
): void {
  let s = si;
  let d = di;
  for (let x = 0; x < n; ++x, s += srcStep) {
    for (let c = 0; c < k; ++c) {
      dst[d++] = src[s + c];
    }
  }
}
