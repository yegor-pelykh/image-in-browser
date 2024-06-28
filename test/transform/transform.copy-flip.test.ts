/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, FlipDirection, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform module.
 */
describe('Transform', () => {
  /**
   * Test case for the copyFlip function.
   */
  test('copyFlip', () => {
    // Read the input image file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image
    const img = decodePng({
      data: input,
    });

    // Ensure the image is defined
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    // Perform horizontal flip transformation
    const ih = Transform.copyFlip({
      image: img,
      direction: FlipDirection.horizontal,
    });

    // Verify the number of channels remains the same
    expect(ih.numChannels).toBe(img.numChannels);

    // Encode the horizontally flipped image and write to file
    let output = encodePng({
      image: ih,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_h.png',
      output
    );

    // Perform vertical flip transformation
    const iv = Transform.copyFlip({
      image: img,
      direction: FlipDirection.vertical,
    });

    // Verify the number of channels remains the same
    expect(iv.numChannels).toBe(img.numChannels);

    // Encode the vertically flipped image and write to file
    output = encodePng({
      image: iv,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_v.png',
      output
    );

    // Perform both horizontal and vertical flip transformation
    const ib = Transform.copyFlip({
      image: img,
      direction: FlipDirection.both,
    });

    // Verify the number of channels remains the same
    expect(ib.numChannels).toBe(img.numChannels);

    // Encode the flipped image (both directions) and write to file
    output = encodePng({
      image: ib,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_b.png',
      output
    );
  });
});
