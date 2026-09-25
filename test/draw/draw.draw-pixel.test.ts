/** @format */

import { describe, expect, test } from 'vitest';
import {
  BlendMode,
  ColorRgb8,
  ColorRgba8,
  Draw,
  encodePng,
  Format,
  MemoryImage,
  Point,
  RandomUtils,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { expectSolidColor } from '../_utils/test-helpers.js';

/**
 * Draw drawPixel operations.
 */
describe('Draw', () => {
  /**
   * Plots 10,000 random-position pixels with color derived from coordinates.
   */
  test('drawCircle', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    for (let i = 0; i < 10000; ++i) {
      const x = RandomUtils.intrand(i0.width - 1);
      const y = RandomUtils.intrand(i0.height - 1);
      Draw.drawPixel({
        image: i0,
        pos: new Point(x, y),
        color: new ColorRgb8(x, y, 0),
      });
    }

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawPixel.png',
      output
    );
  });

  /**
   * Sets the exact pixel to the specified color.
   */
  test('drawPixel sets the exact pixel to the given color', () => {
    const image = new MemoryImage({ width: 10, height: 10 });

    Draw.drawPixel({
      image,
      pos: new Point(3, 4),
      color: new ColorRgb8(255, 0, 128),
      blend: BlendMode.direct,
    });
    expect(image.getPixel(3, 4).equals([255, 0, 128])).toBe(true);
    expect(image.getPixel(0, 0).equals([0, 0, 0])).toBe(true);
  });

  /**
   * Out-of-bounds drawPixel does not throw and leaves image unchanged.
   */
  test('drawPixel out-of-bounds does not throw and leaves image unchanged', () => {
    const image = new MemoryImage({ width: 4, height: 4 });
    Draw.drawPixel({
      image,
      pos: new Point(-1, 0),
      color: new ColorRgb8(255, 0, 0),
    });
    Draw.drawPixel({
      image,
      pos: new Point(0, -1),
      color: new ColorRgb8(255, 0, 0),
    });
    Draw.drawPixel({
      image,
      pos: new Point(4, 0),
      color: new ColorRgb8(255, 0, 0),
    });
    Draw.drawPixel({
      image,
      pos: new Point(0, 4),
      color: new ColorRgb8(255, 0, 0),
    });
    expectSolidColor(image, new ColorRgb8(0, 0, 0));
  });

  /**
   * Semi-transparent pixel composites correctly against black background.
   */
  test('drawPixel with alpha blend composites correctly on black background', () => {
    const image = new MemoryImage({ width: 1, height: 1, numChannels: 4 });
    image.clear(new ColorRgba8(0, 0, 0, 255));
    Draw.drawPixel({
      image,
      pos: new Point(0, 0),
      color: new ColorRgba8(255, 255, 255, 128),
    });
    const p = image.getPixel(0, 0);
    expect(p.r).toBeGreaterThan(100);
    expect(p.r).toBeLessThan(150);
  });

  /**
   * A three-channel image without an alpha channel is treated as opaque when
   * alpha-blending a semi-transparent pixel.
   */
  for (const format of [
    Format.uint1,
    Format.uint2,
    Format.uint4,
    Format.uint8,
    Format.uint16,
    Format.uint32,
    Format.int8,
    Format.int16,
    Format.int32,
    Format.float16,
    Format.float32,
    Format.float64,
  ]) {
    test(`drawPixel with alpha blend mixes with an opaque three channel ${Format[format]} image`, () => {
      const image = new MemoryImage({
        width: 1,
        height: 1,
        format: format,
      });
      if (image.hasPalette) {
        return;
      }
      image.getPixel(0, 0).rNormalized = 0;
      image.getPixel(0, 0).gNormalized = 0;
      image.getPixel(0, 0).bNormalized = 1;
      Draw.drawPixel({
        image,
        pos: new Point(0, 0),
        color: new ColorRgba8(255, 0, 0, 128),
      });
      const p = image.getPixel(0, 0);
      expect(p.aNormalized, 'alpha').toBe(1);
      if (format === Format.uint1) {
        return;
      }
      const tolerance =
        format === Format.uint2 ? 0.17 : format === Format.uint4 ? 0.04 : 0.01;
      expect(p.rNormalized, 'red').toBeCloseTo(0.5, tolerance);
      expect(p.bNormalized, 'blue').toBeCloseTo(0.5, tolerance);
    });
  }
});
