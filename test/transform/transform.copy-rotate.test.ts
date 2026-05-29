/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodePng,
  encodePng,
  MemoryImage,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { imagesAreEqual, quadrantImage } from '../_utils/test-helpers.js';

/**
 * Transform copyRotate operations.
 */
describe('Transform', () => {
  /**
   * Rotates an image in 45-degree increments from 0 to 315 degrees.
   */
  test('copyRotate', () => {
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

    img.backgroundColor = new ColorRgb8(255, 255, 255);

    for (let i = 0; i < 360; i += 45) {
      const i0 = Transform.copyRotate({
        image: img,
        angle: i,
      });

      expect(i0.numChannels).toBe(img.numChannels);

      const output = encodePng({
        image: i0,
      });

      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.transform,
        `copyRotate_${i}.png`,
        output
      );
    }
  });

  /**
   * Rotating by zero degrees returns the same image.
   */
  test('angle 0 is identity', () => {
    const src = quadrantImage(16, 16);
    expect(
      imagesAreEqual(Transform.copyRotate({ image: src, angle: 0 }), src)
    ).toBe(true);
  });

  /**
   * A 90-degree rotation swaps image dimensions.
   */
  test('90-degree rotation swaps width and height', () => {
    const src = new MemoryImage({ width: 20, height: 10 });
    const r90 = Transform.copyRotate({ image: src, angle: 90 });
    expect(r90.width).toBe(10);
    expect(r90.height).toBe(20);
  });

  /**
   * A 180-degree rotation preserves the original dimensions.
   */
  test('180-degree rotation preserves dimensions', () => {
    const src = new MemoryImage({ width: 20, height: 10 });
    const r180 = Transform.copyRotate({
      image: src,
      angle: 180,
    });
    expect(r180.width).toBe(20);
    expect(r180.height).toBe(10);
  });

  /**
   * CopyRotate does not mutate the source image.
   */
  test('copyRotate does not mutate source', () => {
    const src = quadrantImage(16, 16);
    const orig = src.clone();
    Transform.copyRotate({ image: src, angle: 90 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });

  /**
   * Top-left pixel moves to top-right after 90-degree rotation.
   */
  test('90-degree rotation moves top-left pixel to top-right', () => {
    const src = quadrantImage(16, 16);
    const r90 = Transform.copyRotate({ image: src, angle: 90 });
    const p = r90.getPixel(15, 0);
    expect(p.r).toBe(255);
    expect(p.g).toBe(0);
    expect(p.b).toBe(0);
  });
});
