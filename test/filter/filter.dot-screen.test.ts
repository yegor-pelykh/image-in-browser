/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * dotScreen filter: creates a halftone dot pattern effect.
 */
describe('Filter', () => {
  /**
   * Applies dotScreen with default parameters and writes output PNG.
   */
  test('dotScreen', () => {
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

    Filter.dotScreen({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dotScreen.png',
      output
    );
  });

  /**
   * Preserves image dimensions after dotScreen filter.
   */
  test('dotScreen preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.dotScreen({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
