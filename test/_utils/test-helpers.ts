/** @format */

import { expect } from 'vitest';
import { Color, ColorRgb8, ColorRgba8, MemoryImage, Pixel } from '../../src';

/**
 * Creates a solid color image filled entirely with the given color.
 *
 * @param {number} width - The width of the image in pixels.
 * @param {number} height - The height of the image in pixels.
 * @param {Color} color - The color to fill the image with.
 * @param {number} [numChannels=3] - The number of color channels for the image.
 * @returns {MemoryImage} The created solid color image.
 */
export function solidImage(
  width: number,
  height: number,
  color: Color,
  numChannels = 3
): MemoryImage {
  const image = new MemoryImage({ width, height, numChannels });
  for (const p of image) {
    if (numChannels >= 4) p.setRgba(color.r, color.g, color.b, color.a);
    else p.setRgb(color.r, color.g, color.b);
  }
  return image;
}

/**
 * Creates an image with a horizontal grayscale gradient from black (left)
 * to white (right).
 *
 * @param {number} width - The width of the image in pixels.
 * @param {number} height - The height of the image in pixels.
 * @returns {MemoryImage} The created horizontal gradient image.
 */
export function horizontalGradient(width: number, height: number): MemoryImage {
  const image = new MemoryImage({ width, height });
  for (const p of image) {
    const v = width <= 1 ? 0 : Math.round((p.x * 255) / (width - 1));
    p.setRgb(v, v, v);
  }
  return image;
}

/**
 * Creates an image with a vertical grayscale gradient from black (top)
 * to white (bottom).
 *
 * @param {number} width - The width of the image in pixels.
 * @param {number} height - The height of the image in pixels.
 * @returns {MemoryImage} The created vertical gradient image.
 */
export function verticalGradient(width: number, height: number): MemoryImage {
  const image = new MemoryImage({ width, height });
  for (const p of image) {
    const v = height <= 1 ? 0 : Math.round((p.y * 255) / (height - 1));
    p.setRgb(v, v, v);
  }
  return image;
}

/**
 * Creates an image divided into four quadrants, each filled with a
 * different color. Default colors: red (TL), green (TR), blue (BL),
 * yellow (BR). Quadrants are split at the midpoint of width and height.
 *
 * @param {number} width - The width of the image in pixels.
 * @param {number} height - The height of the image in pixels.
 * @param {Color} [tl] - Color for the top-left quadrant. Defaults to red.
 * @param {Color} [tr] - Color for the top-right quadrant. Defaults to green.
 * @param {Color} [bl] - Color for the bottom-left quadrant. Defaults to blue.
 * @param {Color} [br] - Color for the bottom-right quadrant. Defaults to yellow.
 * @returns {MemoryImage} The created quadrant image.
 */
export function quadrantImage(
  width: number,
  height: number,
  tl?: Color,
  tr?: Color,
  bl?: Color,
  br?: Color
): MemoryImage {
  const topLeft = tl ?? new ColorRgb8(255, 0, 0);
  const topRight = tr ?? new ColorRgb8(0, 255, 0);
  const bottomLeft = bl ?? new ColorRgb8(0, 0, 255);
  const bottomRight = br ?? new ColorRgb8(255, 255, 0);
  const image = new MemoryImage({ width, height });
  const mx = Math.trunc(width / 2);
  const my = Math.trunc(height / 2);
  for (const p of image) {
    const c =
      p.y < my
        ? p.x < mx
          ? topLeft
          : topRight
        : p.x < mx
          ? bottomLeft
          : bottomRight;
    p.setRgb(c.r, c.g, c.b);
  }
  return image;
}

/**
 * Creates a checkerboard pattern image with alternating black and white
 * cells.
 *
 * @param {number} width - The width of the image in pixels.
 * @param {number} height - The height of the image in pixels.
 * @param {number} [cell=8] - The size of each checker cell in pixels.
 * @returns {MemoryImage} The created checkerboard image.
 */
export function checkerImage(
  width: number,
  height: number,
  cell = 8
): MemoryImage {
  const image = new MemoryImage({ width, height });
  for (const p of image) {
    const on = (Math.trunc(p.x / cell) + Math.trunc(p.y / cell)) % 2 === 0;
    const v = on ? 255 : 0;
    p.setRgb(v, v, v);
  }
  return image;
}

/**
 * Computes the mean pixel value (average of R, G, B across all pixels).
 *
 * @param {MemoryImage} image - The image to compute the mean of.
 * @returns {number} The mean value, or 0 if the image has no pixels.
 */
export function imageMean(image: MemoryImage): number {
  let sum = 0;
  let count = 0;
  for (const p of image) {
    sum += p.r + p.g + p.b;
    count += 3;
  }
  return count === 0 ? 0 : sum / count;
}

/**
 * Computes the variance of pixel values (R, G, B channels) around the
 * image mean.
 *
 * @param {MemoryImage} image - The image to compute the variance of.
 * @returns {number} The variance, or 0 if the image has no pixels.
 */
export function imageVariance(image: MemoryImage): number {
  const mean = imageMean(image);
  let sum = 0;
  let count = 0;
  for (const p of image) {
    for (const v of [p.r, p.g, p.b]) {
      const d = v - mean;
      sum += d * d;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

/**
 * Asserts that every pixel in the image matches the given color.
 *
 * @param {MemoryImage} image - The image to check.
 * @param {Color} color - The expected color of every pixel.
 * @param {string} [reason] - Custom error message for failed assertions.
 */
export function expectSolidColor(
  image: MemoryImage,
  color: Color,
  reason?: string
): void {
  for (const p of image) {
    const ok = p.r === color.r && p.g === color.g && p.b === color.b;
    expect(
      ok,
      reason ??
        `pixel ${p.x},${p.y} is (${p.r},${p.g},${p.b}), expected (${color.r},${color.g},${color.b})`
    ).toBe(true);
  }
}

/**
 * Compares two images for pixel-level equality.
 *
 * @param {MemoryImage} a - The first image to compare.
 * @param {MemoryImage} b - The second image to compare.
 * @returns {boolean} True if the images have the same dimensions and all
 * pixels are equal, false otherwise.
 */
export function imagesAreEqual(a: MemoryImage, b: MemoryImage): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;
  const it: Iterator<Pixel> = b[Symbol.iterator]();
  for (const pa of a) {
    const next = it.next();
    if (next.done === true) return false;
    const pb = next.value;
    if (!pa.equals(pb)) return false;
  }
  return true;
}

/**
 * Asserts that two images are of the same size and that all corresponding
 * pixel channels differ by no more than the given tolerance.
 *
 * @param {MemoryImage} a - The first image to compare.
 * @param {MemoryImage} b - The second image to compare.
 * @param {number} [tolerance=1] - The maximum allowed per-channel difference.
 */
export function expectImagesClose(
  a: MemoryImage,
  b: MemoryImage,
  tolerance = 1
): void {
  expect(b.width).toBe(a.width);
  expect(b.height).toBe(a.height);
  const it: Iterator<Pixel> = b[Symbol.iterator]();
  for (const pa of a) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pb: Pixel | undefined = it.next().value;
    expect(pb).toBeDefined();
    if (pb === undefined) continue;
    const n = Math.min(pa.length, pb.length);
    for (let c = 0; c < n; ++c) {
      expect(Math.abs(pa.getChannel(c) - pb.getChannel(c)) <= tolerance).toBe(
        true
      );
    }
  }
}
