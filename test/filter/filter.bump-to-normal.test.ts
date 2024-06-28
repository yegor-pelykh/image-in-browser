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
   * Test case for the bumpToNormal function.
   */
  test('bumpToNormal', () => {
    // Read the input PNG file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG file
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Apply the bumpToNormal filter
    const i1 = Filter.bumpToNormal({
      image: i0,
    });

    // Encode the filtered image back to PNG
    const output = encodePng({
      image: i1,
    });

    // Write the output PNG file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'bumpToNormal.png',
      output
    );
  });
});
