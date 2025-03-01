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
   * Test case for the edgeGlow filter.
   */
  test('edgeGlow', () => {
    // Read the input PNG file for testing
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the PNG file into an image object
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Apply the edgeGlow filter to the image
    Filter.edgeGlow({
      image: i0,
    });

    // Encode the modified image back into a PNG file
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file to the specified location
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'edgeGlow.png',
      output
    );
  });
});
