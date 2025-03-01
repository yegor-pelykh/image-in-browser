/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  Draw,
  encodePng,
  Filter,
  MemoryImage,
  Rectangle,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the dropShadow filter.
   */
  test('dropShadow', () => {
    // Create a new image with specified width, height, and number of channels.
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    // Draw a red rectangle on the image with specified dimensions and thickness.
    Draw.drawRect({
      image: i0,
      rect: Rectangle.fromXYWH(80, 100, 130, 100),
      color: new ColorRgb8(255, 0, 0),
      thickness: 3,
    });

    // Apply a drop shadow filter to the image with specified horizontal and vertical shadow offsets and blur radius.
    const id = Filter.dropShadow({
      image: i0,
      hShadow: -5,
      vShadow: 5,
      blur: 3,
    });

    // Create a new blank image with specified width and height, and clear it with a white color.
    const i1 = new MemoryImage({
      width: 256,
      height: 256,
    });
    i1.clear(new ColorRgb8(255, 255, 255));

    // Composite the drop shadow image onto the blank image.
    Draw.compositeImage({
      dst: i1,
      src: id,
    });

    // Encode the final image to PNG format.
    const output = encodePng({
      image: i1,
    });

    // Write the output PNG file to the specified test folder and section.
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dropShadow.png',
      output
    );
  });
});
