/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * monochrome filter: tints image to a single color.
 */
describe('Filter', () => {
  /**
   * Applies monochrome with ColorRgb8(100,160,64) tint and writes output PNG.
   */
  test('monochrome', () => {
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

    Filter.monochrome({
      image: i0,
      color: new ColorRgb8(100, 160, 64),
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'monochrome.png',
      output
    );
  });

  /**
   * Preserves image dimensions after monochrome filter.
   */
  test('monochrome preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.monochrome({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
