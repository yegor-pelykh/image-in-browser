/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter module.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the adjustColor function.
   */
  test('adjustColor', () => {
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

    // Adjust the color of the image with a gamma value of 2.2
    Filter.adjustColor({
      image: i0,
      gamma: 2.2,
    });

    // Encode the adjusted image back to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'adjustColor.png',
      output
    );
  });
});
