/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, PixelateMode } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * pixelate filter: creates blocky pixelation effect.
 */
describe('Filter', () => {
  /**
   * Applies pixelate in upperLeft and average modes (size=10) and writes both variants.
   */
  test('pixelate', () => {
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

    const i1 = i0.clone();

    Filter.pixelate({
      image: i0,
      size: 10,
    });

    let output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'pixelate_upperLeft.png',
      output
    );

    Filter.pixelate({
      image: i1,
      size: 10,
      mode: PixelateMode.average,
    });

    output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'pixelate_average.png',
      output
    );
  });

  /**
   * Preserves image dimensions after pixelate filter.
   */
  test('pixelate preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.pixelate({ image: src, size: 8 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
