/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * chromaticAberration filter: shifts red/blue channels to simulate lens aberration.
 */
describe('Filter', () => {
  /**
   * Applies chromaticAberration with default parameters and writes output PNG.
   */
  test('chromaticAberration', () => {
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

    Filter.chromaticAberration({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'chromaticAberration.png',
      output
    );
  });

  /**
   * Preserves image dimensions after chromatic aberration filter.
   */
  test('chromaticAberration preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.chromaticAberration({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
