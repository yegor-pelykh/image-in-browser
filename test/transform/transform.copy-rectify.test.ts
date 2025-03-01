/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodeJpg,
  encodePng,
  Interpolation,
  Point,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform functionality.
 */
describe('Transform', TestUtils.testOptions, () => {
  /**
   * Test case for the copyRectify function.
   */
  test('copyRectify', () => {
    // Read the input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'oblique.jpg'
    );

    // Decode the JPEG image
    const img = decodeJpg({
      data: input,
    });

    // Ensure the image is defined
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    // Perform the copyRectify transformation
    const i0 = Transform.copyRectify({
      image: img,
      topLeft: new Point(16, 32),
      topRight: new Point(79, 39),
      bottomLeft: new Point(16, 151),
      bottomRight: new Point(108, 141),
      interpolation: Interpolation.cubic,
    });

    // Encode the transformed image as PNG
    const output = encodePng({
      image: i0,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyRectify.png',
      output
    );
  });
});
