/** @format */

import { describe, test } from 'vitest';
import {
  ColorRgb8,
  Draw,
  encodePng,
  MemoryImage,
  Point,
  RandomUtils,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for drawing operations.
 */
describe('Draw', TestUtils.testOptions, () => {
  /**
   * Test case for drawing a circle by plotting random pixels.
   */
  test('drawCircle', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Plot 10,000 random pixels on the image
    for (let i = 0; i < 10000; ++i) {
      const x = RandomUtils.intrand(i0.width - 1);
      const y = RandomUtils.intrand(i0.height - 1);
      Draw.drawPixel({
        image: i0,
        pos: new Point(x, y),
        color: new ColorRgb8(x, y, 0),
      });
    }

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawPixel.png',
      output
    );
  });
});
