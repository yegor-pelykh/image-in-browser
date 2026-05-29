/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * luminanceThreshold filter: converts to black and white based on luminance.
 */
describe('Filter', () => {
  /**
   * Applies luminanceThreshold with default parameters and writes output PNG.
   */
  test('luminanceThreshold', () => {
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

    Filter.luminanceThreshold({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'luminanceThreshold.png',
      output
    );
  });

  /**
   * Preserves image dimensions after luminanceThreshold.
   */
  test('luminanceThreshold preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.luminanceThreshold({ image: src, threshold: 0.5 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
