/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { solidImage } from '../_utils/test-helpers.js';

/**
 * Draw fillFlood operations.
 */
describe('Draw', () => {
  /**
   * Flood-fills interior of a drawn circle with green using threshold 1.
   */
  test('fillFlood', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 100,
    });

    Draw.drawCircle({
      image: i0,
      center: new Point(50, 50),
      radius: 49,
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.fillFlood({
      image: i0,
      start: new Point(50, 50),
      color: new ColorRgb8(0, 255, 0),
      threshold: 1,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillFlood.png',
      output
    );
  });

  /**
   * Seed pixel becomes the fill color.
   */
  test('fillFlood: seed pixel becomes fill color', () => {
    const img = solidImage(20, 20, new ColorRgb8(0, 0, 0));
    const fillColor = new ColorRgb8(0, 200, 0);
    Draw.fillFlood({
      image: img,
      start: new Point(5, 5),
      color: fillColor,
      threshold: 1,
    });
    const p = img.getPixel(6, 5);
    expect(p.r).toBe(0);
    expect(p.g).toBe(200);
    expect(p.b).toBe(0);
  });

  /**
   * Image dimensions are unchanged after fill.
   */
  test('fillFlood: image dimensions unchanged after fill', () => {
    const img = new MemoryImage({ width: 30, height: 30 });
    Draw.fillFlood({
      image: img,
      start: new Point(15, 15),
      color: new ColorRgb8(128, 0, 128),
    });
    expect(img.width).toBe(30);
    expect(img.height).toBe(30);
  });
});
