/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter module.
 */
describe('Filter', () => {
  /**
   * Test case for the scaleRgba function.
   */
  test('scaleRgba', () => {
    // Read the input image file.
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

    // Apply the scaleRgba filter to the image.
    Filter.scaleRgba({
      image: i0,
      scale: new ColorRgb8(128, 128, 128),
    });

    // Encode the modified image back to PNG format.
    const output = encodePng({
      image: i0,
    });

    // Write the output image file.
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'scaleRgba.png',
      output
    );
  });
});
