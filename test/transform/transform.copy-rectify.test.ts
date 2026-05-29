/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodeJpg,
  encodePng,
  Interpolation,
  MemoryImage,
  Point,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import {
  expectSolidColor,
  imagesAreEqual,
  quadrantImage,
  solidImage,
} from '../_utils/test-helpers.js';

/**
 * Transform copyRectify operations.
 */
describe('Transform', () => {
  /**
   * Perspective-corrects an oblique JPEG using cubic interpolation.
   */
  test('copyRectify', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'oblique.jpg'
    );

    const img = decodeJpg({
      data: input,
    });

    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyRectify({
      image: img,
      topLeft: new Point(16, 32),
      topRight: new Point(79, 39),
      bottomLeft: new Point(16, 151),
      bottomRight: new Point(108, 141),
      interpolation: Interpolation.cubic,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyRectify.png',
      output
    );
  });

  /**
   * CopyRectify does not mutate the source image.
   */
  test('copyRectify does not mutate source', () => {
    const src = quadrantImage(16, 16);
    const orig = src.clone();
    const p0 = new Point(0, 0);
    const p1 = new Point(15, 0);
    const p2 = new Point(0, 15);
    const p3 = new Point(15, 15);
    Transform.copyRectify({
      image: src,
      topLeft: p0,
      topRight: p1,
      bottomLeft: p2,
      bottomRight: p3,
    });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });

  /**
   * The toImage target parameter is used and returned.
   */
  test('toImage target is used and returned', () => {
    const src = solidImage(8, 8, new ColorRgb8(255, 0, 0));
    const target = new MemoryImage({ width: 8, height: 8 });
    const p0 = new Point(0, 0);
    const p1 = new Point(7, 0);
    const p2 = new Point(0, 7);
    const p3 = new Point(7, 7);
    const result = Transform.copyRectify({
      image: src,
      topLeft: p0,
      topRight: p1,
      bottomLeft: p2,
      bottomRight: p3,
      toImage: target,
    });
    expect(result).toBe(target);
    expectSolidColor(result, new ColorRgb8(255, 0, 0));
  });
});
