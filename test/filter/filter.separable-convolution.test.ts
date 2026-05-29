/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, SeparableKernel } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * separableConvolution filter: efficient separable kernel convolution.
 */
describe('Filter', () => {
  /**
   * Applies a Gaussian separable convolution kernel (radius=5) and writes output PNG.
   */
  test('separableConvolution', () => {
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

    const radius = 5;
    const kernel = new SeparableKernel(radius);

    const sigma = radius * (2 / 3);
    const s = 2 * sigma * sigma;

    let sum = 0;
    for (let x = -radius; x <= radius; ++x) {
      const c = Math.exp(-(x * x) / s);
      sum += c;
      kernel.setCoefficient(x + radius, c);
    }

    kernel.scaleCoefficients(1 / sum);

    Filter.separableConvolution({
      image: i0,
      kernel: kernel,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'separableConvolution.png',
      output
    );
  });

  /**
   * Preserves image dimensions after separable convolution.
   */
  test('separableConvolution preserves dimensions', () => {
    const src = checkerImage(32, 32);
    const kernel = new SeparableKernel(1);
    kernel.setCoefficient(0, 1);
    kernel.setCoefficient(1, 2);
    kernel.setCoefficient(2, 1);
    Filter.separableConvolution({ image: src, kernel });
    expect(src.width).toBe(32);
    expect(src.height).toBe(32);
  });
});
