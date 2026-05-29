/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  ColorRgba8,
  Draw,
  encodePng,
  MemoryImage,
  Rectangle,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { expectSolidColor, solidImage } from '../_utils/test-helpers.js';

/**
 * Draw fillRect operations.
 */
describe('Draw', () => {
  /**
   * Fills overlapping rectangles with varied color, opacity, and rounded corners.
   */
  test('fillRect', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    Draw.fillRect({
      image: i0,
      rect: new Rectangle(50, 50, 150, 150),
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.fillRect({
      image: i0,
      rect: new Rectangle(100, 100, 200, 200),
      color: new ColorRgba8(0, 255, 0, 128),
    });

    Draw.fillRect({
      image: i0,
      rect: new Rectangle(75, 75, 175, 175),
      radius: 20,
      color: new ColorRgba8(255, 255, 0, 128),
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillRect.png',
      output
    );

    let p = i0.getPixel(51, 51);
    expect(p.r).toBe(255);
    expect(p.g).toBe(0);
    expect(p.b).toBe(0);
    expect(p.a).toBe(255);

    p = i0.getPixel(195, 195);
    expect(p.r).toBe(0);
    expect(p.g).toBe(128);
    expect(p.b).toBe(0);
    expect(p.a).toBe(128);
  });

  /**
   * Fill interior has correct draw color at center, edges, and outside.
   */
  test('fillRect fills interior: center and edges have the draw color', () => {
    const image = new MemoryImage({ width: 60, height: 60 });
    const x1 = 10;
    const y1 = 10;
    const x2 = 50;
    const y2 = 50;

    Draw.fillRect({
      image,
      rect: new Rectangle(x1, y1, x2, y2),
      color: new ColorRgb8(255, 0, 0),
      alphaBlend: false,
    });

    expect(image.getPixel(x1, y1).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(x2, y2).equals([255, 0, 0])).toBe(true);

    const cx = Math.trunc((x1 + x2) / 2);
    const cy = Math.trunc((y1 + y2) / 2);
    expect(image.getPixel(cx, cy).equals([255, 0, 0])).toBe(true);

    expect(image.getPixel(x1 - 1, y1).equals([0, 0, 0])).toBe(true);
    expect(image.getPixel(x1, y1 - 1).equals([0, 0, 0])).toBe(true);
    expect(image.getPixel(x2 + 1, y2).equals([0, 0, 0])).toBe(true);
    expect(image.getPixel(x2, y2 + 1).equals([0, 0, 0])).toBe(true);
  });

  /**
   * Fill with alpha 0 does not modify the image.
   */
  test('fillRect with alpha=0 leaves the image unchanged', () => {
    const src = solidImage(20, 20, new ColorRgb8(100, 100, 100));

    Draw.fillRect({
      image: src,
      rect: new Rectangle(5, 5, 15, 15),
      color: new ColorRgba8(255, 0, 0, 0),
    });

    expectSolidColor(src, new ColorRgb8(100, 100, 100));
  });
});
