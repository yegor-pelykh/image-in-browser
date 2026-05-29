/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * bleachBypass filter: simulates bleach bypass film processing.
 */
describe('Filter', () => {
  /**
   * Applies bleachBypass with default parameters and writes output PNG.
   */
  test('bleachBypass', () => {
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

    Filter.bleachBypass({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'bleachBypass.png',
      output
    );
  });

  /**
   * Preserves dimensions after bleach-bypass filter.
   */
  test('bleachBypass preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.bleachBypass({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Amount 0 produces no pixel change.
   */
  test('bleachBypass with amount 0 leaves image unchanged', () => {
    const src = checkerImage(32, 32);
    const orig = src.clone();
    Filter.bleachBypass({ image: src, amount: 0 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
