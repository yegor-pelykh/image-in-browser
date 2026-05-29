/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodePng,
  encodePng,
  MemoryImage,
  Transform,
  TrimMode,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import {
  expectSolidColor,
  solidImage,
  imagesAreEqual,
} from '../_utils/test-helpers.js';

/**
 * Transform trim operations.
 */
describe('Transform', () => {
  /**
   * Trims a logo PNG with default, transparent, and bottomRightColor modes.
   */
  test('trim', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'logo.png'
    );

    const img = decodePng({
      data: input,
    });

    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    let trimmed = Transform.trim({
      image: img,
    });

    let output = encodePng({
      image: trimmed,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim.png',
      output
    );

    expect(trimmed.width).toBe(465);
    expect(trimmed.height).toBe(150);

    trimmed = Transform.trim({
      image: img,
      mode: TrimMode.transparent,
    });

    output = encodePng({
      image: trimmed,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim_transparent.png',
      output
    );

    expect(trimmed.width).toBe(465);
    expect(trimmed.height).toBe(150);

    trimmed = Transform.trim({
      image: img,
      mode: TrimMode.bottomRightColor,
    });

    output = encodePng({
      image: trimmed,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim_bottomRightColor.png',
      output
    );

    expect(trimmed.width).toBe(465);
    expect(trimmed.height).toBe(150);
  });

  /**
   * Trims a known solid-color border from the image.
   */
  test('trim removes known solid border', () => {
    const img = solidImage(20, 20, new ColorRgb8(255, 255, 255));
    for (let y = 5; y < 15; y++) {
      for (let x = 5; x < 15; x++) {
        img.setPixelRgb(x, y, 255, 0, 0);
      }
    }
    const trimmed = Transform.trim({ image: img });
    expect(trimmed.width).toBe(10);
    expect(trimmed.height).toBe(10);
  });

  /**
   * Trimmed image content matches the inner block color.
   */
  test('trimmed image content matches inner block', () => {
    const img = solidImage(20, 20, new ColorRgb8(0, 0, 0));
    for (let y = 4; y < 14; y++) {
      for (let x = 3; x < 13; x++) {
        img.setPixelRgb(x, y, 0, 200, 100);
      }
    }
    const trimmed = Transform.trim({ image: img });
    expectSolidColor(trimmed, new ColorRgb8(0, 200, 100));
  });

  /**
   * Trim does not mutate the source image.
   */
  test('trim does not mutate source', () => {
    const src = solidImage(16, 16, new ColorRgb8(255, 255, 255));
    for (let y = 4; y < 12; y++) {
      for (let x = 4; x < 12; x++) {
        src.setPixelRgb(x, y, 100, 100, 100);
      }
    }
    const orig = src.clone();
    Transform.trim({ image: src });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });

  /**
   * Trimming a uniform image returns the original dimensions.
   */
  test('trim of uniform image returns original size', () => {
    const src = solidImage(10, 10, new ColorRgb8(128, 128, 128));
    const trimmed = Transform.trim({ image: src });
    expect(trimmed.width).toBe(10);
    expect(trimmed.height).toBe(10);
  });
});
