/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * emboss filter: creates a 3D embossed relief effect.
 */
describe('Filter', () => {
  /**
   * Applies emboss with default parameters and writes output PNG.
   */
  test('emboss', () => {
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

    Filter.emboss({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'emboss.png',
      output
    );
  });

  /**
   * Preserves image dimensions after emboss filter.
   */
  test('emboss preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.emboss({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
