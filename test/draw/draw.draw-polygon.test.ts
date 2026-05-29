/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Draw drawPolygon operations.
 */
describe('Draw', () => {
  /**
   * Draws three offset polygons with antialiasing and varied thickness.
   */
  test('drawPolygon', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    const vertices = [
      new Point(50, 50),
      new Point(200, 20),
      new Point(120, 70),
      new Point(30, 150),
    ];

    Draw.drawPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.drawPolygon({
      image: i0,
      vertices: vertices.map((p) => new Point(p.x + 20, p.y + 20)),
      color: new ColorRgb8(0, 255, 0),
      antialias: true,
      thickness: 1.1,
    });

    Draw.drawPolygon({
      image: i0,
      vertices: vertices.map((p) => new Point(p.x + 40, p.y + 40)),
      color: new ColorRgb8(0, 0, 255),
      antialias: true,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawPolygon.png',
      output
    );
  });

  /**
   * Image dimensions are unchanged after drawPolygon.
   */
  test('drawPolygon: image dimensions unchanged', () => {
    const img = new MemoryImage({ width: 64, height: 64 });
    Draw.drawPolygon({
      image: img,
      vertices: [
        new Point(10, 10),
        new Point(50, 10),
        new Point(50, 50),
        new Point(10, 50),
      ],
      color: new ColorRgb8(255, 0, 0),
    });
    expect(img.width).toBe(64);
    expect(img.height).toBe(64);
  });

  /**
   * Pixels far from the outline remain the background color.
   */
  test('drawPolygon: pixels far from outline stay background', () => {
    const img = new MemoryImage({ width: 64, height: 64 });
    Draw.drawPolygon({
      image: img,
      vertices: [
        new Point(2, 2),
        new Point(10, 2),
        new Point(10, 10),
        new Point(2, 10),
      ],
      color: new ColorRgb8(255, 0, 0),
    });
    const far = img.getPixel(63, 63);
    expect(far.r).toBe(0);
    expect(far.g).toBe(0);
    expect(far.b).toBe(0);
  });
});
