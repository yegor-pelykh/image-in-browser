/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodePng,
  encodePng,
  Filter,
  Interpolation,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { expectSolidColor, solidImage } from '../_utils/test-helpers.js';

/**
 * stretchDistortion filter: applies stretch distortion.
 */
describe('Filter', () => {
  /**
   * Applies stretchDistortion with cubic interpolation and writes output PNG.
   */
  test('stretchDistortion', () => {
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

    Filter.stretchDistortion({
      image: i0,
      interpolation: Interpolation.cubic,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'stretchDistortion.png',
      output
    );
  });

  /**
   * Preserves image dimensions after stretch distortion.
   */
  test('stretchDistortion preserves dimensions', () => {
    const src = solidImage(40, 30, new ColorRgb8(100, 150, 200));
    Filter.stretchDistortion({ image: src });
    expect(src.width).toBe(40);
    expect(src.height).toBe(30);
  });

  /**
   * Uniform input stays uniform after stretch distortion.
   */
  test('stretchDistortion on a solid-color image yields solid color', () => {
    const color = new ColorRgb8(60, 120, 180);
    const src = solidImage(32, 32, color);
    Filter.stretchDistortion({ image: src });
    expectSolidColor(src, color);
  });
});
