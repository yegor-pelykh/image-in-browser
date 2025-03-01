/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { Format, MemoryImage } from '../../src';

/**
 * Test suite for the MemoryImage class.
 */
describe('MemoryImage', TestUtils.testOptions, () => {
  /**
   * Test case for creating and manipulating images with float16 format.
   */
  test('float16', () => {
    // Create a 2x2 image with float16 format and 1 channel
    const i1 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
      numChannels: 1,
    });

    // Validate the properties of the image
    expect(i1.width).toBe(2);
    expect(i1.height).toBe(2);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.float16);

    // Set pixel values and validate them
    i1.setPixelRgb(0, 0, 32, 0, 0);
    i1.setPixelRgb(1, 0, 64, 0, 0);
    i1.setPixelRgb(0, 1, -75, 0, 0);
    i1.setPixelRgb(1, 1, -115, 0, 0);

    expect(i1.getPixel(0, 0).equals([32])).toBeTruthy();
    expect(i1.getPixel(1, 0).equals([64])).toBeTruthy();
    expect(i1.getPixel(0, 1).equals([-75])).toBeTruthy();
    expect(i1.getPixel(1, 1).equals([-115])).toBeTruthy();

    // Create a 2x2 image with float16 format and 2 channels
    const i2 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
      numChannels: 2,
    });

    // Validate the properties of the image
    expect(i2.width).toBe(2);
    expect(i2.height).toBe(2);
    expect(i2.numChannels).toBe(2);

    // Set pixel values and validate them
    i2.setPixelRgb(0, 0, 32, 64, 0);
    i2.setPixelRgb(1, 0, 64, 32, 0);
    i2.setPixelRgb(0, 1, -58, 52, 0);
    i2.setPixelRgb(1, 1, 110, 84, 0);

    expect(i2.getPixel(0, 0).equals([32, 64])).toBeTruthy();
    expect(i2.getPixel(1, 0).equals([64, 32])).toBeTruthy();
    expect(i2.getPixel(0, 1).equals([-58, 52])).toBeTruthy();
    expect(i2.getPixel(1, 1).equals([110, 84])).toBeTruthy();

    // Create a 2x2 image with float16 format and default 3 channels
    const i3 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
    });

    // Validate the properties of the image
    expect(i3.width).toBe(2);
    expect(i3.height).toBe(2);
    expect(i3.numChannels).toBe(3);

    // Set pixel values and validate them
    i3.setPixelRgb(0, 0, 32, 64, 86);
    i3.setPixelRgb(1, 0, 64, 32, 14);
    i3.setPixelRgb(0, 1, -58, 52, 5);
    i3.setPixelRgb(1, 1, 110, 84, 94);

    expect(i3.getPixel(0, 0).equals([32, 64, 86])).toBeTruthy();
    expect(i3.getPixel(1, 0).equals([64, 32, 14])).toBeTruthy();
    expect(i3.getPixel(0, 1).equals([-58, 52, 5])).toBeTruthy();
    expect(i3.getPixel(1, 1).equals([110, 84, 94])).toBeTruthy();

    // Create a 2x2 image with float16 format and 4 channels
    const i4 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
      numChannels: 4,
    });

    // Validate the properties of the image
    expect(i4.width).toBe(2);
    expect(i4.height).toBe(2);
    expect(i4.numChannels).toBe(4);

    // Set pixel values and validate them
    i4.setPixelRgba(0, 0, 32, 64, 86, 44);
    i4.setPixelRgba(1, 0, 64, 32, 14, 14);
    i4.setPixelRgba(0, 1, 12, 52, 5, 52);
    i4.setPixelRgba(1, 1, 100, 84, 94, 82);

    expect(i4.getPixel(0, 0).equals([32, 64, 86, 44])).toBeTruthy();
    expect(i4.getPixel(1, 0).equals([64, 32, 14, 14])).toBeTruthy();
    expect(i4.getPixel(0, 1).equals([12, 52, 5, 52])).toBeTruthy();
    expect(i4.getPixel(1, 1).equals([100, 84, 94, 82])).toBeTruthy();
  });
});
