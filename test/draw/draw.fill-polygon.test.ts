/** @format */

import { describe, test } from 'vitest';
import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for drawing operations.
 */
describe('Draw', TestUtils.testOptions, () => {
  /**
   * Test case for the fillPolygon function.
   * This test creates an image, defines a set of vertices for a polygon,
   * fills the polygon with a specified color, and then encodes the image
   * as a PNG file which is written to the output directory.
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
   * Test case for the fillPolygon function with a concave polygon.
   * This test creates an image, defines a set of vertices for a concave polygon,
   * fills the polygon with a specified color, draws the polygon outline with another color,
   * and then encodes the image as a PNG file which is written to the output directory.
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
});
