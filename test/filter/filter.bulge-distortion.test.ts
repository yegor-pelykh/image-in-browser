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
import { solidImage } from '../_utils/test-helpers.js';

/**
 * bulgeDistortion filter: spherical lens distortion effect.
 */
describe('Filter', () => {
  /**
   * Applies bulgeDistortion with cubic interpolation and writes output PNG.
   */
  test('bulgeDistortion', () => {
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

    Filter.bulgeDistortion({
      image: i0,
      interpolation: Interpolation.cubic,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'bulgeDistortion.png',
      output
    );
  });

  /**
   * Preserves image dimensions after bulge distortion.
   */
  test('bulgeDistortion preserves dimensions', () => {
    const src = solidImage(40, 30, new ColorRgb8(100, 150, 200));
    Filter.bulgeDistortion({ image: src });
    expect(src.width).toBe(40);
    expect(src.height).toBe(30);
  });
});
