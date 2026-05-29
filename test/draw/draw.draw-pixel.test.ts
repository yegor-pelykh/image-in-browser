/** @format */

import { describe, expect, test } from 'vitest';
import {
  BlendMode,
  ColorRgb8,
  ColorRgba8,
  Draw,
  encodePng,
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
    Draw.drawPixel({
      image,
      pos: new Point(0, 0),
      color: new ColorRgba8(255, 255, 255, 128),
    });
    const p = image.getPixel(0, 0);
    expect(p.r).toBeGreaterThan(100);
    expect(p.r).toBeLessThan(150);
  });
});
