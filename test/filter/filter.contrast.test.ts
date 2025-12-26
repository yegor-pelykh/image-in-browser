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
   * Test case for the colorHalftone filter.
   */
  test('colorHalftone', () => {
    // Read the input image file
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

    // Apply the contrast filter to the image
    Filter.contrast({
      image: i0,
      contrast: 150,
    });

    // Encode the modified image back to PNG
    const output = encodePng({
      image: i0,
    });

    // Write the output image file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'contrast.png',
      output
    );
  });
});
