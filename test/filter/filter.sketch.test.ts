/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imageVariance } from '../_utils/test-helpers.js';

/**
 * sketch filter: creates a pencil-sketch effect.
 */
describe('Filter', () => {
  /**
   * Applies sketch filter to a sample image and writes output PNG.
   */
  test('sketch', () => {
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

    Filter.sketch({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'sketch.png',
      output
    );
  });

  /**
   * Preserves image dimensions after sketch filter.
   */
  test('sketch preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.sketch({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Sketch filter creates non-uniform pixel variation.
   */
  test('sketch on a checker image produces non-uniform output', () => {
    const src = checkerImage(64, 64);
    Filter.sketch({ image: src });
    expect(imageVariance(src)).toBeGreaterThan(0);
  });
});
