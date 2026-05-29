/** @format */

import { describe, expect, test } from 'vitest';
import {
  Channel,
  ColorRgb8,
  decodePng,
  Draw,
  encodePng,
  Filter,
  MemoryImage,
  Point,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * copyImageChannels: copies channels from one image into another.
 */
describe('Filter', () => {
  /**
   * Copies luminance channel from a radial mask into sample image alpha channel.
   */
  test('copyImageChannels', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    let i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    i0 = i0.convert({
      numChannels: 4,
    });

    const maskImage = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.fillCircle({
      image: maskImage,
      center: new Point(128, 128),
      radius: 128,
      color: new ColorRgb8(255, 255, 255),
    });

    Filter.copyImageChannels({
      image: i0,
      from: maskImage,
      scaled: true,
      alpha: Channel.luminance,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'copyImageChannels.png',
      output
    );
  });

  /**
   * Preserves image dimensions after copyImageChannels.
   */
  test('copyImageChannels preserves dimensions', () => {
    const src = checkerImage(64, 48);
    const from = checkerImage(64, 48);
    Filter.copyImageChannels({ image: src, from });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
