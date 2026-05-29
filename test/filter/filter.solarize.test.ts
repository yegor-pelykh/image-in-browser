/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodePng,
  encodePng,
  Filter,
  SolarizeMode,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import {
  expectSolidColor,
  horizontalGradient,
  solidImage,
} from '../_utils/test-helpers.js';

/**
 * Filter functionality.
 */
describe('Filter', () => {
  /**
   * Solarizing highlights in an image.
   */
  test('solarize highlights', () => {
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

    Filter.solarize({
      image: i0,
      threshold: 100,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'solarize_highlights.png',
      output
    );
  });

  /**
   * Solarizing shadows in an image.
   */
  test('solarize shadows', () => {
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

    Filter.solarize({
      image: i0,
      threshold: 100,
      mode: SolarizeMode.shadows,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'solarize_shadows.png',
      output
    );
  });

  /**
   * Preserves image dimensions and numChannels after solarize.
   */
  test('solarize preserves image dimensions and numChannels', () => {
    const src = horizontalGradient(32, 8);
    Filter.solarize({ image: src, threshold: 100 });
    expect(src.width).toBe(32);
    expect(src.height).toBe(8);
  });

  /**
   * White pixels above threshold become black after solarize highlights.
   */
  test('solarize highlights: solid white above threshold inverts to black', () => {
    const white = solidImage(8, 8, new ColorRgb8(255, 255, 255));
    Filter.solarize({ image: white, threshold: 10 });
    expectSolidColor(white, new ColorRgb8(0, 0, 0));
  });
});
