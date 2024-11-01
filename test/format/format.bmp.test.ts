/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodeBmp,
  DitherKernel,
  encodeBmp,
  Filter,
  Format,
  MemoryImage,
} from '../../src';
import { ImageTestUtils } from '../_utils/image-test-utils';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for BMP format.
 */
describe('Format: BMP', () => {
  /**
   * List of input BMP files for testing.
   */
  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.bmp,
    '.bmp'
  );

  // Iterate over each input file and run tests
  for (const f of inputFiles) {
    /**
     * Test case for each BMP file.
     */
    test(f.nameExt, () => {
      // Read the input BMP file
      const input1 = TestUtils.readFromFilePath(f.path);
      // Decode the BMP file
      const image1 = decodeBmp({
        data: input1,
      });

      // Ensure the image is defined
      expect(image1).toBeDefined();
      if (image1 === undefined) {
        return;
      }

      // Encode the image back to BMP format
      const output1 = encodeBmp({
        image: image1,
      });
      // Write the encoded BMP file to output
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.bmp,
        f.nameExt,
        output1
      );

      // Read the output BMP file
      const input2 = TestUtils.readFromFile(
        TestFolder.output,
        TestSection.bmp,
        f.nameExt
      );
      // Decode the output BMP file
      const image2 = decodeBmp({
        data: input2,
      });
      // Ensure the decoded image is defined
      expect(image2).toBeDefined();
      if (image2 === undefined) {
        return;
      }

      // Compare the original and decoded images
      ImageTestUtils.testImageEquals(image1, image2);
    });
  }

  /**
   * Test case for uint1 format BMP image.
   */
  test('uint1', () => {
    // Create a new image
    let image = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Iterate over each pixel in the image
    for (const p of image) {
      // Set the red channel to the x-coordinate modulo 255
      p.r = p.x % 255;
      // Set the green channel to the y-coordinate modulo 255
      p.g = p.y % 255;
    }

    // Apply a grayscale filter to the image
    image = Filter.grayscale({
      image: image,
    });

    // Quantize the image to 2 colors using the Floyd-Steinberg dithering algorithm
    image = Filter.quantize({
      image: image,
      numberOfColors: 2,
      dither: DitherKernel.floydSteinberg,
    });

    // Convert the image format to uint1 with a palette
    image = image.convert({
      format: Format.uint1,
      withPalette: true,
    });

    // Encode the image to BMP format
    const output = encodeBmp({
      image: image,
    });

    // Write the encoded BMP file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.bmp,
      'bmp_1.bmp',
      output
    );
  });

  /**
   * Test case for uint4 format BMP image.
   */
  test('uint4', () => {
    // Create a new image with uint4 format
    const image = new MemoryImage({
      width: 256,
      height: 256,
      format: Format.uint4,
    });

    // Populate the image with test data
    for (const p of image) {
      p.r = Math.trunc(p.x / p.maxChannelValue);
      p.g = Math.trunc(p.y / p.maxChannelValue);
      p.a = p.maxChannelValue - Math.trunc(p.y / p.maxChannelValue);
    }

    // Encode the image to BMP format
    const output = encodeBmp({
      image: image,
    });
    // Write the encoded BMP file to output
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.bmp,
      'bmp_16.bmp',
      output
    );
  });
});
