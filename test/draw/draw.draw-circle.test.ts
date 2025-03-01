/** @format */

import { describe, test } from 'vitest';
import { ColorRgba8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for drawing operations.
 */
describe('Draw', TestUtils.testOptions, () => {
  /**
   * Test case for drawing circles on an image.
   */
  test('drawCircle', () => {
    // Create a new image with specified width and height
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Draw a red circle with radius 50 at the center of the image
    Draw.drawCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(255, 0, 0, 255),
    });

    // Draw a green circle with radius 100 at the center of the image
    Draw.drawCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      color: new ColorRgba8(0, 255, 0, 255),
    });

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file to the specified location
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawCircle.png',
      output
    );
  });
});
