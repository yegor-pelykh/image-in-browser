/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * scaleRgba filter: multiplies each channel by a scale factor.
 */
describe('Filter', () => {
  /**
   * Scales each channel by ColorRgb8(128,128,128) and writes output PNG.
   */
  test('scaleRgba', () => {
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

    Filter.scaleRgba({
      image: i0,
      scale: new ColorRgb8(128, 128, 128),
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'scaleRgba.png',
      output
    );
  });

  /**
   * Preserves image dimensions after scaleRgba filter.
   */
  test('scaleRgba preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.scaleRgba({ image: src, scale: new ColorRgb8(128, 128, 128) });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
