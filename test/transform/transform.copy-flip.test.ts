/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodePng,
  encodePng,
  FlipDirection,
  MemoryImage,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { imagesAreEqual, quadrantImage } from '../_utils/test-helpers.js';

/**
 * Transform copyFlip operations.
 */
describe('Transform', () => {
  /**
   * Flips an image horizontally, vertically, and in both directions.
   */
  test('copyFlip', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const img = decodePng({
      data: input,
    });

    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const ih = Transform.copyFlip({
      image: img,
      direction: FlipDirection.horizontal,
    });

    expect(ih.numChannels).toBe(img.numChannels);

    let output = encodePng({
      image: ih,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_h.png',
      output
    );

    const iv = Transform.copyFlip({
      image: img,
      direction: FlipDirection.vertical,
    });

    expect(iv.numChannels).toBe(img.numChannels);

    output = encodePng({
      image: iv,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_v.png',
      output
    );

    const ib = Transform.copyFlip({
      image: img,
      direction: FlipDirection.both,
    });

    expect(ib.numChannels).toBe(img.numChannels);

    output = encodePng({
      image: ib,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_b.png',
      output
    );
  });

  /**
   * CopyFlip does not mutate the source image.
   */
  test('copyFlip does not mutate the source image', () => {
    const src = quadrantImage(16, 16);
    const orig = src.clone();
    Transform.copyFlip({ image: src, direction: FlipDirection.horizontal });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });

  /**
   * Horizontal flip applied twice restores the original image.
   */
  test('horizontal flip twice restores the original', () => {
    const src = quadrantImage(16, 16);
    const flippedTwice = Transform.copyFlip({
      image: Transform.copyFlip({
        image: src,
        direction: FlipDirection.horizontal,
      }),
      direction: FlipDirection.horizontal,
    });
    expect(imagesAreEqual(flippedTwice, src)).toBe(true);
  });

  /**
   * Vertical flip applied twice restores the original image.
   */
  test('vertical flip twice restores the original', () => {
    const src = quadrantImage(16, 16);
    const flippedTwice = Transform.copyFlip({
      image: Transform.copyFlip({
        image: src,
        direction: FlipDirection.vertical,
      }),
      direction: FlipDirection.vertical,
    });
    expect(imagesAreEqual(flippedTwice, src)).toBe(true);
  });

  /**
   * Both-axis flip applied twice restores the original image.
   */
  test('both-axis flip twice restores the original', () => {
    const src = quadrantImage(16, 16);
    const flippedTwice = Transform.copyFlip({
      image: Transform.copyFlip({ image: src, direction: FlipDirection.both }),
      direction: FlipDirection.both,
    });
    expect(imagesAreEqual(flippedTwice, src)).toBe(true);
  });

  /**
   * Horizontal flip swaps left and right quadrant pixels.
   */
  test('horizontal flip swaps left/right quadrants', () => {
    const src = quadrantImage(16, 16);
    const flipped = Transform.copyFlip({
      image: src,
      direction: FlipDirection.horizontal,
    });
    const topLeft = flipped.getPixel(0, 0);
    expect(topLeft.r).toBe(0);
    expect(topLeft.g).toBe(255);
    expect(topLeft.b).toBe(0);
    const topRight = flipped.getPixel(15, 0);
    expect(topRight.r).toBe(255);
    expect(topRight.g).toBe(0);
    expect(topRight.b).toBe(0);
  });

  /**
   * Vertical flip swaps top and bottom quadrant pixels.
   */
  test('vertical flip swaps top/bottom quadrants', () => {
    const src = quadrantImage(16, 16);
    const flipped = Transform.copyFlip({
      image: src,
      direction: FlipDirection.vertical,
    });
    const topLeft = flipped.getPixel(0, 0);
    expect(topLeft.r).toBe(0);
    expect(topLeft.g).toBe(0);
    expect(topLeft.b).toBe(255);
    const bottomLeft = flipped.getPixel(0, 15);
    expect(bottomLeft.r).toBe(255);
    expect(bottomLeft.g).toBe(0);
    expect(bottomLeft.b).toBe(0);
  });

  /**
   * CopyFlip preserves the original image dimensions.
   */
  test('copyFlip preserves image dimensions', () => {
    const src = quadrantImage(20, 10);
    for (const dir of [
      FlipDirection.horizontal,
      FlipDirection.vertical,
      FlipDirection.both,
    ]) {
      const result = Transform.copyFlip({
        image: src,
        direction: dir,
      });
      expect(result.width).toBe(src.width);
      expect(result.height).toBe(src.height);
    }
  });
});
