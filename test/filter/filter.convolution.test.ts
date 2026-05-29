/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * convolution filter: applies arbitrary convolution kernel matrices.
 */
describe('Filter', () => {
  /**
   * Applies contrast then a Laplacian edge-detect kernel [0,1,0, 1,-4,1, 0,1,0] and writes output PNG.
   */
  test('convolution', () => {
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

    Filter.contrast({
      image: i0,
      contrast: 150,
    });

    const filter = [0, 1, 0, 1, -4, 1, 0, 1, 0];

    Filter.convolution({
      image: i0,
      filter: filter,
      div: 1,
      offset: 0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'convolution.png',
      output
    );
  });

  /**
   * Preserves image dimensions after convolution filter.
   */
  test('convolution preserves dimensions', () => {
    const src = checkerImage(64, 48);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    Filter.convolution({ image: src, filter: kernel, div: 1, offset: 0 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
