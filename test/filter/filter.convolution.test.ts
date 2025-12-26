/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', () => {
  /**
   * Test case for the convolution filter.
   */
  test('convolution', () => {
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

    // Apply contrast filter to the image
    Filter.contrast({
      image: i0,
      contrast: 150,
    });

    // Define convolution filter matrix
    const filter = [0, 1, 0, 1, -4, 1, 0, 1, 0];

    // Apply convolution filter to the image
    Filter.convolution({
      image: i0,
      filter: filter,
      div: 1,
      offset: 0,
    });

    // Encode the processed image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'convolution.png',
      output
    );
  });
});
