/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * normalize filter: stretches pixel range to specified min/max.
 */
describe('Filter', () => {
  /**
   * Applies normalize with min=50, max=150 and writes output PNG.
   */
  test('normalize', () => {
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

    Filter.normalize({
      image: i0,
      min: 50,
      max: 150,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'normalize.png',
      output
    );
  });

  /**
   * Preserves image dimensions after normalize filter.
   */
  test('normalize preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.normalize({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
