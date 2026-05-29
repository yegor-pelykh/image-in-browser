/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * hexagonPixelate filter: pixelates image into hexagonal cells.
 */
describe('Filter', () => {
  /**
   * Applies hexagonPixelate with centerX=50 and writes output PNG.
   */
  test('hexagonPixelate', () => {
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

    Filter.hexagonPixelate({
      image: i0,
      centerX: 50,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'hexagonPixelate.png',
      output
    );
  });

  /**
   * Preserves image dimensions after hexagonPixelate.
   */
  test('hexagonPixelate preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.hexagonPixelate({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
