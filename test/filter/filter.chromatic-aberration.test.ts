/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter module.
 */
describe('Filter', () => {
  /**
   * Test case for the chromaticAberration filter.
   */
  test('chromaticAberration', () => {
    // Read the input image file
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

    // Apply the chromatic aberration filter to the image
    Filter.chromaticAberration({
      image: i0,
    });

    // Encode the processed image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output image file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'chromaticAberration.png',
      output
    );
  });
});
