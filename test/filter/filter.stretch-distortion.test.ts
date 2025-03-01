/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, Interpolation } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the stretchDistortion filter.
   */
  test('stretchDistortion', () => {
    // Read the input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the PNG image
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Apply the stretchDistortion filter to the image
    Filter.stretchDistortion({
      image: i0,
      interpolation: Interpolation.cubic,
    });

    // Encode the modified image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'stretchDistortion.png',
      output
    );
  });
});
