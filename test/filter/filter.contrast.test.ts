/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imagesAreEqual } from '../_utils/test-helpers.js';

/**
 * contrast filter: adjusts image contrast.
 */
describe('Filter', () => {
  /**
   * Applies contrast at 150 and writes output PNG.
   */
  test('colorHalftone', () => {
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

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'contrast.png',
      output
    );
  });

  /**
   * Preserves image dimensions after contrast adjustment.
   */
  test('contrast preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.contrast({ image: src, contrast: 100 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Contrast 100 leaves the image unchanged.
   */
  test('contrast 0 leaves image unchanged', () => {
    const src = checkerImage(32, 32);
    const orig = src.clone();
    Filter.contrast({ image: src, contrast: 100 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
