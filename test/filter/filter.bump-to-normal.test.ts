/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * bumpToNormal filter: converts a heightmap to a normal map.
 */
describe('Filter', () => {
  /**
   * Converts a sample image to a normal map and writes output PNG.
   */
  test('bumpToNormal', () => {
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

    const i1 = Filter.bumpToNormal({
      image: i0,
    });

    const output = encodePng({
      image: i1,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'bumpToNormal.png',
      output
    );
  });

  /**
   * Preserves image dimensions after bumpToNormal.
   */
  test('bumpToNormal preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.bumpToNormal({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
