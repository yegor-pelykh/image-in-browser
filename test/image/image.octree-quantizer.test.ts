/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  Filter,
  MemoryImage,
  OctreeQuantizer,
  QuantizeMethod,
} from '../../src';
import { solidImage } from '../_utils/test-helpers.js';

/**
 * OctreeQuantizer tests: palette building, color lookup, and index image generation.
 */
describe('OctreeQuantizer', () => {
  /**
   * Test basic octree quantization and index image generation.
   */
  test('octreeQuantizer', () => {
    const img = new MemoryImage({ width: 256, height: 256 });
    for (const p of img) {
      p.setRgb(p.x, p.y, 0);
    }

    const quantizer = new OctreeQuantizer(img);
    const img2 = quantizer.getIndexImage(img);

    expect(img2.width).toBe(img.width);
    expect(img2.height).toBe(img.height);
  });

  /**
   * Palette must have at most numberOfColors entries.
   */
  test('palette has at most numberOfColors entries', () => {
    const img = solidImage(32, 32, new ColorRgb8(10, 20, 30));
    const q = new OctreeQuantizer(img, 16);
    expect(q.palette.numColors).toBeLessThanOrEqual(16);
  });

  /**
   * getColorIndex must return a valid palette index.
   */
  test('getColorIndex returns valid palette index', () => {
    const img = solidImage(16, 16, new ColorRgb8(200, 100, 50));
    const q = new OctreeQuantizer(img);
    const idx = q.getColorIndex(new ColorRgb8(200, 100, 50));
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(q.palette.numColors);
  });

  /**
   * getQuantizedColor must return a valid color with channels in 0-255.
   */
  test('getQuantizedColor returns a valid color', () => {
    const img = solidImage(16, 16, new ColorRgb8(80, 160, 240));
    const q = new OctreeQuantizer(img);
    const c = q.getQuantizedColor(new ColorRgb8(80, 160, 240));
    expect(c.r).toBeGreaterThanOrEqual(0);
    expect(c.r).toBeLessThanOrEqual(255);
    expect(c.g).toBeGreaterThanOrEqual(0);
    expect(c.g).toBeLessThanOrEqual(255);
    expect(c.b).toBeGreaterThanOrEqual(0);
    expect(c.b).toBeLessThanOrEqual(255);
  });

  /**
   * getIndexImage must preserve width and height.
   */
  test('index image has same dimensions as source', () => {
    const img = new MemoryImage({ width: 32, height: 32 });
    for (const p of img) {
      p.setRgb(p.x * 8, p.y * 8, 0);
    }
    const q = new OctreeQuantizer(img);
    const idx = q.getIndexImage(img);
    expect(idx.width).toBe(32);
    expect(idx.height).toBe(32);
  });

  /**
   * Folded colors must map to nearby palette entries.
   * https://github.com/brendan-duncan/image/issues/792
   */
  test('folded colors map to nearby palette entries', () => {
    const src = new MemoryImage({ width: 256, height: 256 });
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        if (x < 48) {
          src.setPixelRgb(x, y, x % 40, x % 40, x % 40);
        } else {
          src.setPixelRgb(
            x,
            y,
            100 + (Math.trunc(x / 2) % 156),
            100 + (Math.trunc(y / 2) % 156),
            150
          );
        }
      }
    }

    const q = new OctreeQuantizer(src);
    const pal = q.palette;

    let worst = 0;
    for (const p of src) {
      const idx = q.getColorIndex(p);
      const dr = Math.trunc(p.r) - Math.trunc(pal.get(idx, 0));
      const dg = Math.trunc(p.g) - Math.trunc(pal.get(idx, 1));
      const db = Math.trunc(p.b) - Math.trunc(pal.get(idx, 2));
      const d = dr * dr + dg * dg + db * db;
      if (d > worst) {
        worst = d;
      }
    }
    expect(worst).toBeLessThan(32 * 32);
  });

  /**
   * getColorIndex must be consistent with getQuantizedColor.
   */
  test('getColorIndex consistent with getQuantizedColor', () => {
    const img = solidImage(16, 16, new ColorRgb8(128, 64, 32));
    const q = new OctreeQuantizer(img);
    const testColor = new ColorRgb8(128, 64, 32);
    const idx = q.getColorIndex(testColor);
    const qc = q.getQuantizedColor(testColor);
    expect(q.palette.get(idx, 0)).toBe(Math.trunc(qc.r));
    expect(q.palette.get(idx, 1)).toBe(Math.trunc(qc.g));
    expect(q.palette.get(idx, 2)).toBe(Math.trunc(qc.b));
  });
});
