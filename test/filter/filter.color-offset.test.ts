/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * colorOffset filter: adds per-channel offset values to pixels.
 */
describe('Filter', () => {
  /**
   * Applies colorOffset with red=50, green=10, blue=30 and writes output PNG.
   */
  test('colorOffset', () => {
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

    Filter.colorOffset({
      image: i0,
      red: 50,
      green: 10,
      blue: 30,
    });

    expect(i0.width).toBeGreaterThan(0);
    expect(i0.height).toBeGreaterThan(0);

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'colorOffset.png',
      output
    );
  });

  /**
   * Preserves image dimensions after colorOffset filter.
   */
  test('colorOffset preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.colorOffset({ image: src, red: 10, green: 20, blue: 30 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * All offsets zero produces no pixel change.
   */
  test('colorOffset with all offsets zero leaves image unchanged', () => {
    const src = checkerImage(32, 32);
    const orig = src.clone();
    Filter.colorOffset({ image: src, red: 0, green: 0, blue: 0, alpha: 0 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
