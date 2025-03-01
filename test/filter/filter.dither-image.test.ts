/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, DitherKernel, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter module.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the ditherImage function.
   * This test reads an input image, applies various dithering kernels,
   * and writes the output images to the file system.
   */
  test('ditherImage', () => {
    // Read the input image from file
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Apply Atkinson dithering and write the output image to file
    let id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.atkinson,
    });

    let output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_atkinson.png',
      output
    );

    // Apply Floyd-Steinberg dithering and write the output image to file
    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.floydSteinberg,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_floydSteinberg.png',
      output
    );

    // Apply False Floyd-Steinberg dithering and write the output image to file
    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.falseFloydSteinberg,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_falseFloydSteinberg.png',
      output
    );

    // Apply Stucki dithering and write the output image to file
    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.stucki,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_stucki.png',
      output
    );

    // Apply no dithering and write the output image to file
    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.none,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_none.png',
      output
    );
  });
});
