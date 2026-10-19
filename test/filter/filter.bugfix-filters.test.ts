/** @format */

import { describe, expect, test } from 'vitest';
import {
  Channel,
  ColorRgb8,
  ColorRgba8,
  ContrastMode,
  Filter,
  Format,
  MemoryImage,
  PixelateMode,
} from '../../src';
import { ImageTestUtils } from '../_utils/image-test-utils';
import {
  expectSolidColor,
  horizontalGradient,
  imagesAreEqual,
  solidImage,
} from '../_utils/test-helpers.js';

/**
 * Asserts that **actual** is within **delta** of **expected**.
 * @param {number} actual - The actual value.
 * @param {number} expected - The expected value.
 * @param {number} delta - The maximum allowed difference.
 */
function expectClose(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
}

/**
 * Creates an image with a deterministic pseudo-random color pattern.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @returns {MemoryImage} The pattern image.
 */
function pattern(width: number, height: number): MemoryImage {
  const img = new MemoryImage({ width: width, height: height });
  for (const p of img) {
    p.setRgb(
      (p.x * 37 + p.y * 11) % 256,
      (p.x * 5 + p.y * 53) % 256,
      (p.x * p.y) % 256
    );
  }
  return img;
}

describe('Filter bug fixes', () => {
  test('contrast scurve applies the scurve table', () => {
    // Runs first in this file, so no table has been computed yet.
    const src = horizontalGradient(256, 1);
    const result = Filter.contrast({
      image: src.clone(),
      contrast: 150,
      mode: ContrastMode.scurve,
    });
    const c = 1.5 - 0.12;
    for (const p of result) {
      const i = src.getPixel(p.x, p.y).r;
      const e = Math.trunc(
        Math.max(
          0,
          Math.min(255, ((Math.tan((i / 128 - 1) * c) + 1) / 2) * 255)
        )
      );
      expect(p.r).toBe(e);
    }
  });

  test('contrast table is keyed on the mode', () => {
    const src = horizontalGradient(256, 1);
    const proportional = Filter.contrast({
      image: src.clone(),
      contrast: 70,
    });
    const scurve = Filter.contrast({
      image: src.clone(),
      contrast: 70,
      mode: ContrastMode.scurve,
    });
    const proportional2 = Filter.contrast({
      image: src.clone(),
      contrast: 70,
    });
    expect(imagesAreEqual(proportional, scurve)).toBe(false);
    ImageTestUtils.testImageEquals(proportional, proportional2);
  });

  test('luminanceThreshold outputColor keeps blue', () => {
    const src = solidImage(2, 2, new ColorRgb8(250, 250, 100));
    Filter.luminanceThreshold({ image: src, outputColor: true });
    expectSolidColor(src, new ColorRgb8(250, 250, 100));
  });

  test('hexagonPixelate center offsets the grid in pixels', () => {
    const a = pattern(64, 48);
    // b is a shifted right by 3 and down by 2 pixels.
    const b = new MemoryImage({ width: 64, height: 48 });
    for (const p of b) {
      p.set(
        a.getPixel((((p.x - 3) % 64) + 64) % 64, (((p.y - 2) % 48) + 48) % 48)
      );
    }
    const ha = Filter.hexagonPixelate({
      image: a.clone(),
      centerX: 20,
      centerY: 10,
    });
    const hb = Filter.hexagonPixelate({
      image: b.clone(),
      centerX: 23,
      centerY: 12,
    });
    for (let y = 10; y < 38; ++y) {
      for (let x = 10; x < 54; ++x) {
        expect(hb.getPixel(x + 3, y + 2).equals(ha.getPixel(x, y))).toBe(true);
      }
    }
  });

  test('hexagonPixelate handles a single row or column', () => {
    const row = pattern(16, 1);
    Filter.hexagonPixelate({ image: row });
    const col = pattern(1, 16);
    Filter.hexagonPixelate({ image: col });
  });

  test('copyImageChannels with a mask mixes normalized values', () => {
    const src = solidImage(4, 4, new ColorRgb8(100, 100, 100));
    const from = solidImage(4, 4, new ColorRgb8(200, 200, 200));
    const mask = solidImage(4, 4, new ColorRgb8(128, 128, 128));
    Filter.copyImageChannels({
      image: src,
      from: from,
      red: Channel.red,
      mask: mask,
    });
    for (const p of src) {
      expectClose(p.r, 150, 1);
      expect(p.g).toBe(100);
      expect(p.b).toBe(100);
    }
  });

  test('pixelate average uses the original block pixels', () => {
    const src = pattern(8, 8);
    const result = Filter.pixelate({
      image: src.clone(),
      size: 4,
      mode: PixelateMode.average,
    });
    for (let by = 0; by < 8; by += 4) {
      for (let bx = 0; bx < 8; bx += 4) {
        const sum = [0, 0, 0];
        for (let y = by; y < by + 4; ++y) {
          for (let x = bx; x < bx + 4; ++x) {
            const o = src.getPixel(x, y);
            for (let c = 0; c < 3; ++c) {
              sum[c] += Math.trunc(o.getChannel(c));
            }
          }
        }
        for (let y = by; y < by + 4; ++y) {
          for (let x = bx; x < bx + 4; ++x) {
            const p = result.getPixel(x, y);
            for (let c = 0; c < 3; ++c) {
              expect(p.getChannel(c)).toBe(Math.floor(sum[c] / 16));
            }
          }
        }
      }
    }
  });

  test('pixelate average partial edge blocks keep their color', () => {
    const color = new ColorRgba8(100, 150, 200, 255);
    const src = solidImage(6, 6, color, 4);
    Filter.pixelate({ image: src, size: 4, mode: PixelateMode.average });
    expectSolidColor(src, color);
  });

  test('reinhardTonemap compresses luminance into 0-1', () => {
    const hdr = new MemoryImage({
      width: 16,
      height: 16,
      format: Format.float32,
    });
    for (const p of hdr) {
      const v = 0.01 * Math.pow(1.06, p.y * 16 + p.x);
      p.setRgb(v, v, v);
    }
    const maxV = 0.01 * Math.pow(1.06, 255);
    Filter.reinhardToneMap({ image: hdr });
    let prev = -1.0;
    for (const p of hdr) {
      expect(p.r).toBeLessThanOrEqual(1.0 + 1e-5);
      expect(p.r).toBeGreaterThan(prev);
      prev = p.r;
    }
    // The brightest pixel maps to white.
    expectClose(hdr.getPixel(15, 15).r, 1.0, 1e-5);
    expect(maxV).toBeGreaterThan(1);
  });
});
