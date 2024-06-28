/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, Interpolation } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', () => {
  /**
   * Test case for the bulgeDistortion filter.
   */
  test('bulgeDistortion', () => {
    // Read the input image from the file system.
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image.
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Apply the bulgeDistortion filter to the image.
    Filter.bulgeDistortion({
      image: i0,
      interpolation: Interpolation.cubic,
    });

    // Encode the processed image back to PNG format.
    const output = encodePng({
      image: i0,
    });

    // Write the output image to the file system.
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'bulgeDistortion.png',
      output
    );
  });
});
