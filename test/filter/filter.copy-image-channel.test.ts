/** @format */

import { describe, expect, test } from 'vitest';
import {
  Channel,
  ColorRgb8,
  decodePng,
  Draw,
  encodePng,
  Filter,
  MemoryImage,
  Point,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the copyImageChannels method.
   */
  test('copyImageChannels', () => {
    // Read the input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image
    let i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Convert the image to have 4 channels
    i0 = i0.convert({
      numChannels: 4,
    });

    // Create a mask image with specified dimensions
    const maskImage = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Draw a filled circle on the mask image
    Draw.fillCircle({
      image: maskImage,
      center: new Point(128, 128),
      radius: 128,
      color: new ColorRgb8(255, 255, 255),
    });

    // Apply the copyImageChannels filter
    Filter.copyImageChannels({
      image: i0,
      from: maskImage,
      scaled: true,
      alpha: Channel.luminance,
    });

    // Encode the modified image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'copyImageChannels.png',
      output
    );
  });
});
