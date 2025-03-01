/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, decodePng, encodePng, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform functionality.
 */
describe('Transform', TestUtils.testOptions, () => {
  /**
   * Test case for the copyRotate function.
   */
  test('copyRotate', () => {
    // Read the input image file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the PNG image
    const img = decodePng({
      data: input,
    });

    // Ensure the image is defined
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    // Set the background color of the image
    img.backgroundColor = new ColorRgb8(255, 255, 255);

    // Rotate the image in 45-degree increments and save the output
    for (let i = 0; i < 360; i += 45) {
      const i0 = Transform.copyRotate({
        image: img,
        angle: i,
      });

      // Verify the number of channels in the rotated image
      expect(i0.numChannels).toBe(img.numChannels);

      // Encode the rotated image to PNG format
      const output = encodePng({
        image: i0,
      });

      // Write the output image file
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.transform,
        `copyRotate_${i}.png`,
        output
      );
    }
  });
});
