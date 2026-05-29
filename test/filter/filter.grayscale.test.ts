/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * Filter functionality.
 */
describe('Filter', () => {
  /**
   * Grayscale filter.
   */
  test('grayscale', () => {
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

    Filter.grayscale({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'grayscale.png',
      output
    );
  });

  /**
   * Preserves image dimensions after grayscale filter.
   */
  test('grayscale preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.grayscale({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Applying grayscale twice equals applying once.
   */
  test('grayscale is idempotent', () => {
    const src = checkerImage(32, 32);
    Filter.grayscale({ image: src });
    const after = src.clone();
    Filter.grayscale({ image: src });
    expect(imagesAreEqual(src, after)).toBe(true);
  });
});
