/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the monochrome filter.
   */
  test('monochrome', () => {
    // Read the input PNG file
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

    // Apply the monochrome filter to the image
    Filter.monochrome({
      image: i0,
      color: new ColorRgb8(100, 160, 64),
    });

    // Encode the modified image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'monochrome.png',
      output
    );
  });
});
