/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imageVariance } from '../_utils/test-helpers.js';

/**
 * gaussianBlur filter: applies Gaussian blur with configurable radius.
 */
describe('Filter', () => {
  /**
   * Applies gaussianBlur with radius 10 and writes output PNG.
   */
  test('gaussianBlur', () => {
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

    Filter.gaussianBlur({
      image: i0,
      radius: 10,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'gaussianBlur.png',
      output
    );
  });

  /**
   * Preserves image dimensions after gaussianBlur.
   */
  test('gaussianBlur preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.gaussianBlur({ image: src, radius: 3 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Gaussian blur reduces pixel variance of a checker image.
   */
  test('gaussianBlur reduces variance of a checker image', () => {
    const src = checkerImage(64, 64, 4);
    const before = imageVariance(src);
    Filter.gaussianBlur({ image: src, radius: 2 });
    expect(imageVariance(src)).toBeLessThan(before);
  });

  /**
   * Gaussian blur is applied to every frame of an animation.
   */
  test('gaussianBlur blurs every frame', () => {
    const src = checkerImage(32, 32, 4);
    src.addFrame(checkerImage(32, 32, 4));
    const blurred = Filter.gaussianBlur({ image: src.clone(), radius: 3 });
    expect(blurred.numFrames).toBe(2);
    for (const frame of blurred.frames) {
      expect(imageVariance(frame)).toBeLessThan(imageVariance(src));
    }
  });
});
