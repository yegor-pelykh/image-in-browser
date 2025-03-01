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
   * Test case for the fillFlood function.
   */
  test('fillFlood', () => {
    // Create a new image with specified width and height
    const i0 = new MemoryImage({
      width: 100,
      height: 100,
    });

    // Draw a circle on the image with specified center, radius, and color
    Draw.drawCircle({
      image: i0,
      center: new Point(50, 50),
      radius: 49,
      color: new ColorRgb8(255, 0, 0),
    });

    // Perform flood fill on the image starting from a point with specified color and threshold
    Draw.fillFlood({
      image: i0,
      start: new Point(50, 50),
      color: new ColorRgb8(0, 255, 0),
      threshold: 1,
    });

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillFlood.png',
      output
    );
  });
});
