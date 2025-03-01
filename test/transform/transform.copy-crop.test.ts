/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodeGif,
  decodePng,
  encodeGif,
  encodePng,
  Rectangle,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform module.
 */
describe('Transform', TestUtils.testOptions, () => {
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

  /**
   * Test case for the copyCrop function and animated image.
   */
  test('copyCrop animated', () => {
    // Read the input GIF file from the specified input folder and section
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'homer.gif'
    );

    // Decode the GIF data into an image object
    const g1 = decodeGif({
      data: input,
    });

    // Ensure the image was successfully decoded
    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    // Perform a crop operation on the image with a specified rectangle and radius
    const g2 = Transform.copyCrop({
      image: g1,
      rect: new Rectangle(0, 0, 500, 375),
      radius: 100,
    });

    // Encode the cropped image back into a GIF format
    const output1 = encodeGif({
      image: g2,
    });
    // Write the encoded GIF to the output folder
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_radius.gif',
      output1
    );

    // Encode the cropped image into a PNG format
    const output2 = encodePng({
      image: g2,
    });
    // Write the encoded PNG to the output folder
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_radius.png',
      output2
    );
  });
});
