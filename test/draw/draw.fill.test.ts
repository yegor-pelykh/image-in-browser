/** @format */

import { describe, test } from 'vitest';
import { ColorRgba8, Draw, encodePng, MemoryImage } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Draw functionality.
 */
describe('Draw', () => {
  /**
   * Test case for the fill function.
   */
  test('fill', () => {
    // Create a new MemoryImage with specified width and height.
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Fill the image with a specified color.
    Draw.fill({
      image: i0,
      color: new ColorRgba8(120, 64, 85, 90),
    });

    // Encode the image to PNG format.
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file.
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fill.png',
      output
    );
  });
});
