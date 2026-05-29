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
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Draw drawCircle operations.
 */
describe('Draw', () => {
  /**
   * Draws two concentric circles with different colors and radii.
   */
  test('drawCircle', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.drawCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(255, 0, 0, 255),
    });

    Draw.drawCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      color: new ColorRgba8(0, 255, 0, 255),
    });

    expect(i0.width).toBe(256);
    expect(i0.height).toBe(256);

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawCircle.png',
      output
    );
  });

  /**
   * DrawCircle draws only the outline ring; axis points painted, center not.
   */
  test('drawCircle draws only outline: axis points painted, center not', () => {
    const image = new MemoryImage({ width: 100, height: 100 });
    const cx = 50;
    const cy = 50;
    const r = 20;

    Draw.drawCircle({
      image,
      center: new Point(cx, cy),
      radius: r,
      color: new ColorRgb8(255, 0, 0),
      blend: BlendMode.direct,
    });

    expect(image.getPixel(cx - r, cy).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx + r, cy).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx, cy - r).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx, cy + r).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx, cy).equals([0, 0, 0])).toBe(true);
    expect(image.getPixel(0, 0).equals([0, 0, 0])).toBe(true);
  });
});
