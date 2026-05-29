/** @format */

import { describe, expect, test } from 'vitest';
import {
  BlendMode,
  ColorRgb8,
  Draw,
  encodePng,
  Line,
  MemoryImage,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Draw drawLine operations.
 */
describe('Draw', () => {
  /**
   * Draws two crossing diagonal lines with varying antialiasing and thickness.
   */
  test('drawLine', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.drawLine({
      image: i0,
      line: new Line(0, 0, 255, 255),
      color: new ColorRgb8(255, 255, 255),
    });
    Draw.drawLine({
      image: i0,
      line: new Line(255, 0, 0, 255),
      color: new ColorRgb8(255, 0, 0),
      antialias: true,
      thickness: 4,
    });

    expect(i0.width).toBe(256);
    expect(i0.height).toBe(256);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawLine.png',
      output
    );
  });

  /**
   * Renders a fan of 80 antialiased lines radiating from center using Wu's algorithm.
   */
  test('drawLineWu', () => {
    const i0 = new MemoryImage({
      width: 800,
      height: 400,
    });

    for (let x = 0; x < 400; x += 10) {
      Draw.drawLine({
        image: i0,
        line: new Line(400, 0, x, 400),
        color: new ColorRgb8(0, 255, 0),
        antialias: true,
        thickness: 1.1,
      });
    }
    for (let x = 400; x <= 800; x += 10) {
      Draw.drawLine({
        image: i0,
        line: new Line(400, 0, x, 400),
        color: new ColorRgb8(255, 0, 0),
        antialias: true,
      });
    }

    expect(i0.width).toBe(800);
    expect(i0.height).toBe(400);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawLineWu.png',
      output
    );
  });

  /**
   * Non-antialiased line passes through its start, mid, and end points.
   */
  test('drawLine non-antialiased passes through its endpoints', () => {
    const image = new MemoryImage({ width: 200, height: 120 });
    Draw.drawLine({
      image,
      line: new Line(0, 0, 100, 50),
      color: new ColorRgb8(255, 255, 255),
      blend: BlendMode.direct,
    });
    expect(image.getPixel(0, 0).r).toBe(255);
    expect(image.getPixel(50, 25).r).toBe(255);
    expect(image.getPixel(100, 50).r).toBe(255);
  });

  /**
   * Every pixel on a horizontal line has the draw color.
   */
  test('drawLine horizontal: every pixel on the line has the draw color', () => {
    const image = new MemoryImage({ width: 100, height: 20 });
    const lineY = 10;
    const x1 = 10;
    const x2 = 80;
    Draw.drawLine({
      image,
      line: new Line(x1, lineY, x2, lineY),
      color: new ColorRgb8(255, 0, 0),
      blend: BlendMode.direct,
    });
    for (let x = x1; x <= x2; x++) {
      expect(image.getPixel(x, lineY).equals([255, 0, 0])).toBe(true);
    }
    expect(image.getPixel(x1, 0).equals([0, 0, 0])).toBe(true);
  });

  /**
   * Every pixel on a vertical line has the draw color.
   */
  test('drawLine vertical: every pixel on the line has the draw color', () => {
    const image = new MemoryImage({ width: 20, height: 100 });
    const lineX = 5;
    const y1 = 10;
    const y2 = 80;
    Draw.drawLine({
      image,
      line: new Line(lineX, y1, lineX, y2),
      color: new ColorRgb8(0, 255, 0),
      blend: BlendMode.direct,
    });
    for (let y = y1; y <= y2; y++) {
      expect(image.getPixel(lineX, y).equals([0, 255, 0])).toBe(true);
    }
    expect(image.getPixel(15, y1).equals([0, 0, 0])).toBe(true);
  });

  /**
   * DrawLine does not change image dimensions.
   */
  test('drawLine returns the image (mutates in place)', () => {
    const image = new MemoryImage({ width: 10, height: 10 });
    Draw.drawLine({
      image,
      line: new Line(0, 0, 9, 9),
      color: new ColorRgb8(255, 255, 255),
    });
    expect(image.width).toBe(10);
    expect(image.height).toBe(10);
  });
});
