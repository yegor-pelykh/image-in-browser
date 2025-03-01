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
   * Test case for drawing polygons on an image.
   */
  test('drawPolygon', () => {
    // Create a new image with specified width and height
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Define vertices for the polygon
    const vertices = [
      new Point(50, 50),
      new Point(200, 20),
      new Point(120, 70),
      new Point(30, 150),
    ];

    // Draw the first polygon with red color
    Draw.drawPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(255, 0, 0),
    });

    // Draw the second polygon with green color, antialiasing, and thickness
    Draw.drawPolygon({
      image: i0,
      vertices: vertices.map((p) => new Point(p.x + 20, p.y + 20)),
      color: new ColorRgb8(0, 255, 0),
      antialias: true,
      thickness: 1.1,
    });

    // Draw the third polygon with blue color and antialiasing
    Draw.drawPolygon({
      image: i0,
      vertices: vertices.map((p) => new Point(p.x + 40, p.y + 40)),
      color: new ColorRgb8(0, 0, 255),
      antialias: true,
    });

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file to the specified location
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawPolygon.png',
      output
    );
  });
});
