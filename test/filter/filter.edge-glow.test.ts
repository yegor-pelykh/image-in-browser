/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * edgeGlow filter: applies a neon-like glow to detected edges.
 */
describe('Filter', () => {
  /**
   * Applies edgeGlow with default parameters and writes output PNG.
   */
  test('edgeGlow', () => {
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

    Filter.edgeGlow({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'edgeGlow.png',
      output
    );
  });

  /**
   * Preserves image dimensions after edgeGlow filter.
   */
  test('edgeGlow preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.edgeGlow({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
