/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import {
  checkerImage,
  imageVariance,
  imagesAreEqual,
  solidImage,
} from '../_utils/test-helpers.js';

/**
 * smooth filter: applies edge-preserving smoothing.
 */
describe('Filter', () => {
  /**
   * Applies smooth filter with weight=0.5 and writes output PNG.
   */
  test('smooth', () => {
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

    Filter.smooth({
      image: i0,
      weight: 0.5,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'smooth.png',
      output
    );
  });

  /**
   * Preserves image dimensions after smooth filter.
   */
  test('smooth preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.smooth({ image: src, weight: 0.5 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Smooth has no effect on a uniformly colored image.
   */
  test('smooth on a solid-color image leaves it unchanged', () => {
    const src = solidImage(32, 32, new ColorRgb8(80, 160, 40));
    const orig = src.clone();
    Filter.smooth({ image: src, weight: 0.5 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });

  /**
   * Smooth filter decreases pixel variance.
   */
  test('smooth reduces variance of a checker image', () => {
    const src = checkerImage(64, 64, 4);
    const before = imageVariance(src);
    Filter.smooth({ image: src, weight: 0.5 });
    expect(imageVariance(src)).toBeLessThan(before);
  });
});
