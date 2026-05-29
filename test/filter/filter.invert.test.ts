/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * invert filter: inverts pixel colors.
 */
describe('Filter', () => {
  /**
   * Applies invert filter to a sample image and writes output PNG.
   */
  test('invert', () => {
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

    Filter.invert({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'invert.png',
      output
    );
  });

  /**
   * Preserves image dimensions after invert filter.
   */
  test('invert preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.invert({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Inverting twice restores the original pixel values.
   */
  test('invert twice is identity', () => {
    const src = checkerImage(32, 32);
    const orig = src.clone();
    Filter.invert({ image: src });
    Filter.invert({ image: src });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
