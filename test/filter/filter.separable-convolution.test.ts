/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, SeparableKernel } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter module.
 */
describe('Filter', () => {
  /**
   * Test case for the separableConvolution function.
   */
  test('separableConvolution', () => {
    // Read input image from file
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

    const radius = 5;
    const kernel = new SeparableKernel(radius);

    // Compute coefficients for the separable kernel
    const sigma = radius * (2 / 3);
    const s = 2 * sigma * sigma;

    let sum = 0;
    for (let x = -radius; x <= radius; ++x) {
      const c = Math.exp(-(x * x) / s);
      sum += c;
      kernel.setCoefficient(x + radius, c);
    }

    // Normalize the coefficients
    kernel.scaleCoefficients(1 / sum);

    // Apply the separable convolution filter
    Filter.separableConvolution({
      image: i0,
      kernel: kernel,
    });

    // Encode the output image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output image to file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'separableConvolution.png',
      output
    );
  });
});
