/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Draw fillPolygon operations.
 */
describe('Draw', () => {
  /**
   * Fills a 4-vertex convex polygon with red and encodes to PNG.
   */
  test('fillPolygon', () => {
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

    Draw.fillPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(176, 0, 0),
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillPolygon.png',
      output
    );
  });

  /**
   * Fills a concave bow-tie polygon then outlines it with green.
   */
  test('fillPolygon concave', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    const vertices = [
      new Point(50, 50),
      new Point(50, 150),
      new Point(150, 150),
      new Point(150, 50),
      new Point(100, 100),
    ];

    Draw.fillPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(176, 0, 0),
    });

    Draw.drawPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(0, 255, 0),
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillPolygon2.png',
      output
    );
  });

  /**
   * Interior pixel has the fill color.
   */
  test('fillPolygon: interior pixel has fill color', () => {
    const img = new MemoryImage({ width: 64, height: 64 });
    const fillColor = new ColorRgb8(200, 100, 50);

    Draw.fillPolygon({
      image: img,
      vertices: [
        new Point(10, 10),
        new Point(50, 10),
        new Point(50, 50),
        new Point(10, 50),
      ],
      color: fillColor,
    });

    const p = img.getPixel(30, 30);
    expect(p.r).toBe(fillColor.r);
    expect(p.g).toBe(fillColor.g);
    expect(p.b).toBe(fillColor.b);
  });

  /**
   * Pixel outside the polygon stays the background color.
   */
  test('fillPolygon: pixel clearly outside polygon stays background', () => {
    const img = new MemoryImage({ width: 64, height: 64 });

    Draw.fillPolygon({
      image: img,
      vertices: [
        new Point(10, 10),
        new Point(30, 10),
        new Point(30, 30),
        new Point(10, 30),
      ],
      color: new ColorRgb8(255, 0, 0),
    });

    const far = img.getPixel(63, 63);
    expect(far.r).toBe(0);
    expect(far.g).toBe(0);
    expect(far.b).toBe(0);
  });

  /**
   * Image dimensions are unchanged after fill.
   */
  test('fillPolygon: image dimensions unchanged', () => {
    const img = new MemoryImage({ width: 64, height: 64 });

    Draw.fillPolygon({
      image: img,
      vertices: [
        new Point(5, 5),
        new Point(30, 5),
        new Point(30, 30),
        new Point(5, 30),
      ],
      color: new ColorRgb8(0, 128, 0),
    });

    expect(img.width).toBe(64);
    expect(img.height).toBe(64);
  });
});
