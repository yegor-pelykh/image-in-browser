/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Rectangle, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform module.
 */
describe('Transform', () => {
  /**
   * Test case for the copyCrop function.
   */
  test('copyCrop', () => {
    // Read the input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input image
    const i0 = decodePng({
      data: input,
    });

    // Ensure the image is defined
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Perform the copyCrop transformation
    const i0_1 = Transform.copyCrop({
      image: i0,
      rect: Rectangle.fromXYWH(50, 50, 100, 100),
    });

    // Validate the dimensions and format of the cropped image
    expect(i0_1.width).toBe(100);
    expect(i0_1.height).toBe(100);
    expect(i0_1.format).toBe(i0.format);

    // Encode the cropped image and write to file
    let output = encodePng({
      image: i0_1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop.png',
      output
    );

    // Convert the image to have 4 channels
    const i1 = i0.convert({
      numChannels: 4,
    });

    // Perform the copyCrop transformation with a radius
    const i0_2 = Transform.copyCrop({
      image: i1,
      rect: Rectangle.fromXYWH(50, 50, 100, 100),
      radius: 20,
    });

    // Validate the dimensions and format of the cropped image with radius
    expect(i0_2.width).toBe(100);
    expect(i0_2.height).toBe(100);
    expect(i0_2.format).toBe(i0.format);

    // Encode the cropped image with radius and write to file
    output = encodePng({
      image: i0_2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_rounded.png',
      output
    );
  });
});
