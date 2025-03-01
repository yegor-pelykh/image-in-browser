/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, ColorRgba8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the vignette filter.
   */
  test('vignette', () => {
    // Read input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    // Apply vignette filter with default settings
    const v1 = Filter.vignette({
      image: img.clone(),
    });
    let output = encodePng({
      image: v1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'vignette.png',
      output
    );

    // Apply vignette filter with white color
    const v2 = Filter.vignette({
      image: img.clone(),
      color: new ColorRgb8(255, 255, 255),
    });
    output = encodePng({
      image: v2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'vignette_2.png',
      output
    );

    // Apply vignette filter with custom settings
    const v3 = Filter.vignette({
      image: img.clone().convert({
        numChannels: 4,
      }),
      color: new ColorRgba8(255, 255, 255, 0),
      start: 0.65,
      end: 0.95,
      amount: 0.5,
    });
    output = encodePng({
      image: v3,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'vignette_3.png',
      output
    );
  });
});
