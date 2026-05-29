/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodeGif,
  decodePng,
  encodeGif,
  encodePng,
  MemoryImage,
  Rectangle,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import {
  expectSolidColor,
  horizontalGradient,
  quadrantImage,
  solidImage,
  imagesAreEqual,
} from '../_utils/test-helpers.js';

/**
 * Transform copyCrop operations.
 */
describe('Transform', () => {
  /**
   * Crops an image to 100×100 and also with 20px rounded corners.
   */
  test('copyCrop', () => {
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

    const i0_1 = Transform.copyCrop({
      image: i0,
      rect: Rectangle.fromXYWH(50, 50, 100, 100),
    });

    expect(i0_1.width).toBe(100);
    expect(i0_1.height).toBe(100);
    expect(i0_1.format).toBe(i0.format);

    let output = encodePng({
      image: i0_1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop.png',
      output
    );

    const i1 = i0.convert({
      numChannels: 4,
    });

    const i0_2 = Transform.copyCrop({
      image: i1,
      rect: Rectangle.fromXYWH(50, 50, 100, 100),
      radius: 20,
    });

    expect(i0_2.width).toBe(100);
    expect(i0_2.height).toBe(100);
    expect(i0_2.format).toBe(i0.format);

    output = encodePng({
      image: i0_2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_rounded.png',
      output
    );
  });

  /**
   * Crops an animated GIF with 100px rounded corners and encodes to GIF and PNG.
   */
  test('copyCrop animated', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'homer.gif'
    );

    const g1 = decodeGif({
      data: input,
    });

    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const g2 = Transform.copyCrop({
      image: g1,
      rect: new Rectangle(0, 0, 500, 375),
      radius: 100,
    });

    const output1 = encodeGif({
      image: g2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_radius.gif',
      output1
    );

    const output2 = encodePng({
      image: g2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_radius.png',
      output2
    );
  });

  /**
   * CopyCrop result has the requested width and height.
   */
  test('copyCrop result has the requested dimensions', () => {
    const src = solidImage(64, 64, new ColorRgb8(100, 150, 200));
    const result = Transform.copyCrop({
      image: src,
      rect: Rectangle.fromXYWH(10, 10, 30, 20),
    });
    expect(result.width).toBe(30);
    expect(result.height).toBe(20);
  });

  /**
   * CopyCrop does not mutate the source image.
   */
  test('copyCrop does not mutate the source', () => {
    const src = horizontalGradient(64, 32);
    const orig = src.clone();
    Transform.copyCrop({ image: src, rect: Rectangle.fromXYWH(0, 0, 32, 16) });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });

  /**
   * Cropping the full image returns an identical copy.
   */
  test('copyCrop of the full image equals the source', () => {
    const src = quadrantImage(16, 16);
    const result = Transform.copyCrop({
      image: src,
      rect: Rectangle.fromXYWH(0, 0, 16, 16),
    });
    expect(imagesAreEqual(result, src)).toBe(true);
  });

  /**
   * Cropping a solid image preserves the original color.
   */
  test('copyCrop of solid image preserves color', () => {
    const src = solidImage(32, 32, new ColorRgb8(255, 128, 0));
    const result = Transform.copyCrop({
      image: src,
      rect: Rectangle.fromXYWH(5, 5, 10, 10),
    });
    expectSolidColor(result, new ColorRgb8(255, 128, 0));
  });
});
