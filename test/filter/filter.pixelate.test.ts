/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, PixelateMode } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', () => {
  /**
   * Test case for the pixelate filter.
   */
  test('pixelate', () => {
    // Read the input image from file
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

    // Clone the decoded image
    const i1 = i0.clone();

    // Apply pixelate filter with default settings
    Filter.pixelate({
      image: i0,
      size: 10,
    });

    // Encode the pixelated image and write to file
    let output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'pixelate_upperLeft.png',
      output
    );

    // Apply pixelate filter with average mode
    Filter.pixelate({
      image: i1,
      size: 10,
      mode: PixelateMode.average,
    });

    // Encode the pixelated image with average mode and write to file
    output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'pixelate_average.png',
      output
    );
  });
});
