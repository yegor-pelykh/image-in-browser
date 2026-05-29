/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, DitherKernel, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * ditherImage filter: quantizes colors using dithering kernels.
 */
describe('Filter', () => {
  /**
   * DitherImage function.
   * This test reads an input image, applies various dithering kernels,
   * And writes the output images to the file system.
   */
  test('ditherImage', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

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

  /**
   * Preserves image dimensions after ditherImage filter.
   */
  test('ditherImage preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.ditherImage({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
