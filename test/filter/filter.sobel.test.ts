/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imageVariance } from '../_utils/test-helpers.js';

/**
 * sobel filter: Sobel edge detection.
 */
describe('Filter', () => {
  /**
   * Applies Sobel edge-detection filter and writes output PNG.
   */
  test('sobel', () => {
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

    Filter.sobel({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'sobel.png',
      output
    );
  });

  /**
   * Preserves image dimensions after sobel filter.
   */
  test('sobel preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.sobel({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Sobel edge detection creates non-uniform pixel output.
   */
  test('sobel on a checker image produces non-uniform output', () => {
    const src = checkerImage(64, 64);
    Filter.sobel({ image: src });
    expect(imageVariance(src)).toBeGreaterThan(0);
  });
});
