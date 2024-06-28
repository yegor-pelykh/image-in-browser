/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Transform, TrimMode } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform functionality.
 */
describe('Transform', () => {
  /**
   * Test case for the trim function.
   */
  test('trim', () => {
    // Read the input PNG file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'trim.png'
    );

    // Decode the PNG file into an image object
    const img = decodePng({
      data: input,
    });

    // Ensure the image is defined
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    // Trim the image using the default mode
    let trimmed = Transform.trim({
      image: img,
    });

    // Encode the trimmed image back to PNG
    let output = encodePng({
      image: trimmed,
    });

    // Write the trimmed image to the output folder
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim.png',
      output
    );

    // Validate the dimensions of the trimmed image
    expect(trimmed.width).toBe(64);
    expect(trimmed.height).toBe(56);

    // Trim the image using the transparent mode
    trimmed = Transform.trim({
      image: img,
      mode: TrimMode.transparent,
    });

    // Encode the trimmed image back to PNG
    output = encodePng({
      image: trimmed,
    });

    // Write the trimmed image to the output folder
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim_transparent.png',
      output
    );

    // Validate the dimensions of the trimmed image
    expect(trimmed.width).toBe(img.width);
    expect(trimmed.height).toBe(img.height);

    // Trim the image using the bottomRightColor mode
    trimmed = Transform.trim({
      image: img,
      mode: TrimMode.bottomRightColor,
    });

    // Encode the trimmed image back to PNG
    output = encodePng({
      image: trimmed,
    });

    // Write the trimmed image to the output folder
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim_bottomRightColor.png',
      output
    );

    // Validate the dimensions of the trimmed image
    expect(trimmed.width).toBe(64);
    expect(trimmed.height).toBe(56);
  });
});
