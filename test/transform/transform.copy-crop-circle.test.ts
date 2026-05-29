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
import { imagesAreEqual, solidImage } from '../_utils/test-helpers.js';

/**
 * Transform copyCropCircle operations.
 */
describe('Transform', () => {
  /**
   * Crops a PNG to a circle and validates resulting dimensions.
   */
  test('copyCropCircle', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const image = decodePng({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const i0 = image.convert({
      numChannels: 4,
    });

    const i0_1 = Transform.copyCropCircle({
      image: i0,
    });

    expect(i0_1.width).toBe(186);
    expect(i0_1.height).toBe(186);
    expect(i0_1.format).toBe(i0.format);

    const output = encodePng({
      image: i0_1,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCropCircle.png',
      output
    );
  });

  /**
   * Result dimensions equal the diameter of the circle.
   */
  test('result dimensions equal diameter of the circle', () => {
    const src = solidImage(64, 64, new ColorRgb8(255, 0, 0), 4);
    const r = 20;
    const result = Transform.copyCropCircle({
      image: src,
      radius: r,
    });
    expect(result.width).toBe(r * 2);
    expect(result.height).toBe(r * 2);
  });

  /**
   * Default radius uses half the shorter side of the image.
   */
  test('default radius uses half the shorter side', () => {
    const src = solidImage(40, 30, new ColorRgb8(0, 255, 0), 4);
    const result = Transform.copyCropCircle({ image: src });
    expect(result.width).toBe(30);
    expect(result.height).toBe(30);
  });

  /**
   * CopyCropCircle does not mutate the source image.
   */
  test('copyCropCircle does not mutate source', () => {
    const src = solidImage(32, 32, new ColorRgb8(100, 150, 200), 4);
    const orig = src.clone();
    Transform.copyCropCircle({ image: src, radius: 12 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
