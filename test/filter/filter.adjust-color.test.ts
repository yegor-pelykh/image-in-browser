/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * adjustColor filter: applies gamma-based color adjustment.
 */
describe('Filter', () => {
  /**
   * Applies adjustColor with gamma 2.2 to a sample image and writes output PNG.
   */
  test('adjustColor', () => {
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

    Filter.adjustColor({
      image: i0,
      gamma: 2.2,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'adjustColor.png',
      output
    );
  });

  /**
   * Preserves image dimensions after adjustColor.
   */
  test('adjustColor preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.adjustColor({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Amount 0 produces no pixel change.
   */
  test('adjustColor with amount 0 leaves image unchanged', () => {
    const src = checkerImage(32, 32);
    const orig = src.clone();
    Filter.adjustColor({ image: src, amount: 0 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
