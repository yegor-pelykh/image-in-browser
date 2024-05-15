/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, SeparableKernel } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
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

    // Compute coefficients
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
});
