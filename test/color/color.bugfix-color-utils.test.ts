/** @format */

import { describe, expect, test } from 'vitest';
import {
  BinaryQuantizer,
  ColorRgb8,
  Filter,
  Format,
  MemoryImage,
} from '../../src';
import { solidImage } from '../_utils/test-helpers.js';

/**
 * Asserts that **actual** is within **delta** of **expected**.
 * @param {number} actual - The actual value.
 * @param {number} expected - The expected value.
 * @param {number} delta - The maximum allowed difference.
 */
function expectClose(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
}

describe('Color bug fixes', () => {
  test('BinaryQuantizer getColorIndexRgb matches getColorIndex', () => {
    const q = new BinaryQuantizer();
    for (const v of [0, 50, 127, 128, 200, 255]) {
      expect(q.getColorIndexRgb(v, v, v)).toBe(
        q.getColorIndex(new ColorRgb8(v, v, v))
      );
    }
    expect(q.getColorIndexRgb(200, 200, 200)).toBe(1);
  });

  test('ditherImage with BinaryQuantizer keeps dark pixels black', () => {
    const src = solidImage(8, 8, new ColorRgb8(30, 30, 30));
    const dithered = Filter.ditherImage({
      image: src,
      quantizer: new BinaryQuantizer(),
    });
    let black = 0;
    for (const p of dithered) {
      if (p.r === 0) {
        black++;
      }
    }
    expect(black).toBeGreaterThan(32);
  });

  test('convert float to 1 channel keeps fractional luminance', () => {
    const src = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float32,
    });
    for (const p of src) {
      p.setRgb(0.5, 0.5, 0.5);
    }
    const gray = src.convert({ numChannels: 1 });
    for (const p of gray) {
      expectClose(p.r, 0.5, 1e-6);
    }
  });

  test('convert uint8 to 1 channel floors luminance', () => {
    const src = solidImage(2, 2, new ColorRgb8(100, 150, 200));
    const gray = src.convert({ numChannels: 1 });
    for (const p of gray) {
      // 0.299 * 100 + 0.587 * 150 + 0.114 * 200 = 140.75
      expect(p.r).toBe(140);
    }
  });

  test('convert RGBA withPalette keeps alpha', () => {
    const src = new MemoryImage({ width: 2, height: 1, numChannels: 4 });
    src.getPixel(0, 0).setRgba(10, 20, 30, 255);
    src.getPixel(1, 0).setRgba(10, 20, 30, 128);
    const indexed = src.convert({ withPalette: true });
    expect(indexed.hasPalette).toBe(true);
    expect(indexed.getPixel(0, 0).a).toBe(255);
    expect(indexed.getPixel(1, 0).a).toBe(128);
    expect(indexed.getPixel(1, 0).r).toBe(10);
    expect(indexed.getPixel(1, 0).b).toBe(30);
  });
});
