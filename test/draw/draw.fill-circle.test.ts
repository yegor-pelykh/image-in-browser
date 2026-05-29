/** @format */

import { describe, expect, test } from 'vitest';
import {
  BlendMode,
  ColorRgb8,
  ColorRgba8,
  Draw,
  encodePng,
  MemoryImage,
  Point,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Draw fillCircle operations.
 */
describe('Draw', () => {
  /**
   * Fills two concentric circles with antialiasing and alpha blending.
   */
  test('fillCircle', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      antialias: true,
      color: new ColorRgba8(255, 255, 0, 200),
    });

    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(0, 255, 0, 255),
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillCircle.png',
      output
    );
  });

  /**
   * Fills a circle with direct blend; inner circle uses fully transparent alpha.
   */
  test('fillCircleWithBlendDirect', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      antialias: true,
      color: new ColorRgba8(255, 255, 0, 200),
    });

    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(0, 255, 0, 0),
      blend: BlendMode.direct,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillCircleWithBlendDirect.png',
      output
    );
  });

  /**
   * FillCircle interior center has the draw color and outline is painted.
   */
  test('fillCircle fills interior: center has the draw color', () => {
    const image = new MemoryImage({ width: 100, height: 100 });
    const cx = 50;
    const cy = 50;
    const r = 20;

    Draw.fillCircle({
      image,
      center: new Point(cx, cy),
      radius: r,
      color: new ColorRgb8(255, 0, 0),
      blend: BlendMode.direct,
    });

    expect(image.getPixel(cx, cy).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(cx, cy + r - 1).equals([255, 0, 0])).toBe(true);
    expect(image.getPixel(0, 0).equals([0, 0, 0])).toBe(true);
    expect(image.getPixel(cx, cy + r + 2).equals([0, 0, 0])).toBe(true);
  });
});
