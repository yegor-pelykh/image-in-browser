/** @format */

import { describe, expect, test } from 'vitest';
import {
  BlendMode,
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

/**
 * Draw drawRect operations.
 */
describe('Draw', () => {
  /**
   * Draws three overlapping rectangle outlines with varied thickness, radius, and alpha.
   */
  test('drawRect', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.drawRect({
      image: i0,
      rect: new Rectangle(50, 50, 150, 150),
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.drawRect({
      image: i0,
      rect: new Rectangle(100, 100, 200, 200),
      color: new ColorRgba8(0, 255, 0, 128),
      thickness: 14,
    });

    Draw.drawRect({
      image: i0,
      rect: new Rectangle(75, 75, 175, 175),
      color: new ColorRgb8(0, 0, 255),
      radius: 20,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawRect.png',
      output
    );

    let p = i0.getPixel(50, 50);
    expect(p.r).toBe(255);
    expect(p.g).toBe(0);
    expect(p.b).toBe(0);

    p = i0.getPixel(100, 100);
    expect(p.r).toBe(0);
    expect(p.g).toBe(128);
    expect(p.b).toBe(0);
  });

  /**
   * DrawRect draws only the outline, interior remains unchanged.
   */
  test('drawRect draws only the outline, leaving the interior unchanged', () => {
    const image = new MemoryImage({ width: 60, height: 60 });
    const x1 = 10;
    const y1 = 10;
    const x2 = 50;
    const y2 = 50;
    const cx = Math.trunc((x1 + x2) / 2);
    const cy = Math.trunc((y1 + y2) / 2);
    const red = new ColorRgb8(255, 0, 0);
    Draw.drawRect({
      image,
      rect: new Rectangle(x1, y1, x2, y2),
      color: red,
      blend: BlendMode.direct,
    });

    expect(image.getPixel(x1, y1).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(x2, y1).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(x1, y2).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(x2, y2).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx, y1).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx, cy).equals([0, 0, 0])).toBe(true);
    expect(image.getPixel(0, 0).equals([0, 0, 0])).toBe(true);
  });
});
