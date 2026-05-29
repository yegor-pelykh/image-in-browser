/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  Draw,
  encodePng,
  Filter,
  MemoryImage,
  Rectangle,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage } from '../_utils/test-helpers.js';

/**
 * dropShadow filter: adds a blurred drop shadow to image content.
 */
describe('Filter', () => {
  /**
   * Draws a red rectangle, applies dropShadow with hShadow=-5, vShadow=5, blur=3.
   */
  test('dropShadow', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    Draw.drawRect({
      image: i0,
      rect: Rectangle.fromXYWH(80, 100, 130, 100),
      color: new ColorRgb8(255, 0, 0),
      thickness: 3,
    });

    const id = Filter.dropShadow({
      image: i0,
      hShadow: -5,
      vShadow: 5,
      blur: 3,
    });

    const i1 = new MemoryImage({
      width: 256,
      height: 256,
    });
    i1.clear(new ColorRgb8(255, 255, 255));

    Draw.compositeImage({
      dst: i1,
      src: id,
    });

    const output = encodePng({
      image: i1,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dropShadow.png',
      output
    );
  });

  /**
   * Preserves source dimensions after dropShadow filter.
   */
  test('dropShadow preserves source dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.dropShadow({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });
});
