/** @format */

import { describe, expect, test } from 'vitest';
import { Channel, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * remapColors filter: rearranges color channels.
 */
describe('Filter', () => {
  /**
   * Remaps R→green, G→luminance, B→red channels and writes output PNG.
   */
  test('remapColors', () => {
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

    Filter.remapColors({
      image: i0,
      red: Channel.green,
      green: Channel.luminance,
      blue: Channel.red,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'remapColors.png',
      output
    );
  });

  /**
   * Preserves image dimensions after remapColors filter.
   */
  test('remapColors preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.remapColors({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
