/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * gamma filter: applies gamma luminance correction.
 */
describe('Filter', () => {
  /**
   * Applies gamma at 2.2 and writes output PNG.
   */
  test('gamma', () => {
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

    Filter.gamma({
      image: i0,
      gamma: 2.2,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'gamma.png',
      output
    );
  });

  /**
   * Preserves image dimensions after gamma correction.
   */
  test('gamma preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.gamma({ image: src, gamma: 1.5 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Gamma 1.0 produces no pixel change.
   */
  test('gamma 1.0 leaves image unchanged', () => {
    const src = checkerImage(32, 32);
    const orig = src.clone();
    Filter.gamma({ image: src, gamma: 1.0 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
