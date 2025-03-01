/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform module.
 */
describe('Transform', TestUtils.testOptions, () => {
  /**
   * Test case for the copyCropCircle function.
   */
  test('copyCropCircle', () => {
    // Read the input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input image
    const image = decodePng({
      data: input,
    });

    // Ensure the image is defined
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    // Convert the image to have 4 channels
    const i0 = image.convert({
      numChannels: 4,
    });

    // Apply the copyCropCircle transformation
    const i0_1 = Transform.copyCropCircle({
      image: i0,
    });

    // Validate the dimensions and format of the transformed image
    expect(i0_1.width).toBe(186);
    expect(i0_1.height).toBe(186);
    expect(i0_1.format).toBe(i0.format);

    // Encode the transformed image to PNG format
    const output = encodePng({
      image: i0_1,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCropCircle.png',
      output
    );
  });
});
