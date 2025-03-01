/** @format */

import { describe, expect, test } from 'vitest';
import { Channel, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the remapColors function.
   */
  test('remapColors', () => {
    // Read input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Remap the colors of the image
    Filter.remapColors({
      image: i0,
      red: Channel.green,
      green: Channel.luminance,
      blue: Channel.red,
    });

    // Encode the modified image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'remapColors.png',
      output
    );
  });
});
