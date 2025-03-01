/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the normalize function.
   */
  test('normalize', () => {
    // Read input PNG file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the PNG file
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Apply normalization filter to the image
    Filter.normalize({
      image: i0,
      min: 50,
      max: 150,
    });

    // Encode the image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'normalize.png',
      output
    );
  });
});
