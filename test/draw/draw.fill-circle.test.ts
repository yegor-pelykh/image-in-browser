/** @format */

import { describe, test } from 'vitest';
import { ColorRgba8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for Draw functionalities.
 */
describe('Draw', () => {
  /**
   * Test case for the fillCircle function.
   */
  test('fillCircle', () => {
    // Create a new MemoryImage with specified width and height
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Draw a filled circle with antialiasing and a specific color
    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      antialias: true,
      color: new ColorRgba8(255, 255, 0, 200),
    });

    // Draw another filled circle with a different color
    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(0, 255, 0, 255),
    });

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillCircle.png',
      output
    );
  });
});
