/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodeJpg,
  encodeJpg,
  JpegChroma,
  MemoryImage,
  Transform,
} from '../../src';

/**
 * Creates a color gradient image.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @returns {MemoryImage} The gradient image.
 */
function gradient(width: number, height: number): MemoryImage {
  const image = new MemoryImage({ width, height });
  for (const p of image) {
    p.r = Math.trunc((p.x * 255) / (width - 1));
    p.g = Math.trunc((p.y * 255) / (height - 1));
    p.b = 255 - Math.trunc((p.x * 255) / (width - 1));
  }
  return image;
}

/**
 * JPEG behaviour that has to hold on the web as well as on the VM.
 */
describe('Format: JPEG (web)', () => {
  /**
   * Round trips every chroma subsampling format.
   */
  for (const chroma of [JpegChroma.yuv444, JpegChroma.yuv420]) {
    test(`round trip ${JpegChroma[chroma]}`, () => {
      // Odd dimensions exercise the MCU padding blocks.
      const src = gradient(37, 29);
      const decoded = decodeJpg({
        data: encodeJpg({ image: src, chroma: chroma }),
      });
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        return;
      }
      expect(decoded.width).toBe(src.width);
      expect(decoded.height).toBe(src.height);
      let maxDiff = 0;
      for (const p of src) {
        const q = decoded.getPixel(p.x, p.y);
        for (const [a, b] of [
          [p.r, q.r],
          [p.g, q.g],
          [p.b, q.b],
        ]) {
          const d = Math.trunc(Math.abs(a - b));
          if (d > maxDiff) {
            maxDiff = d;
          }
        }
      }
      expect(maxDiff).toBeLessThan(chroma === JpegChroma.yuv444 ? 8 : 24);
    });
  }

  /**
   * The EXIF orientation is baked into the decoded pixels.
   */
  for (const gray of [false, true]) {
    test(`orientation is baked in${gray ? ' (grayscale)' : ''}`, () => {
      let src = gradient(37, 29);
      if (gray) {
        src = src.convert({ numChannels: 1 });
      }
      const upright = decodeJpg({ data: encodeJpg({ image: src }) });
      expect(upright).toBeDefined();
      if (upright === undefined) {
        return;
      }
      for (let orientation = 2; orientation <= 8; ++orientation) {
        src.exifData.imageIfd.orientation = orientation;
        const decoded = decodeJpg({ data: encodeJpg({ image: src }) });
        expect(decoded).toBeDefined();
        if (decoded === undefined) {
          return;
        }
        const rotated = upright.clone();
        rotated.exifData.imageIfd.orientation = orientation;
        const expected = Transform.bakeOrientation({ image: rotated });
        expect(decoded.width, `orientation ${orientation}`).toBe(
          expected.width
        );
        expect(decoded.height, `orientation ${orientation}`).toBe(
          expected.height
        );
        for (const p of expected) {
          const q = decoded.getPixel(p.x, p.y);
          expect(
            [q.r, q.g, q.b],
            `orientation ${orientation} at ${p.x},${p.y}`
          ).toEqual([p.r, p.g, p.b]);
        }
      }
    });
  }
});
