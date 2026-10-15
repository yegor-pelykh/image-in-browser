/** @format */

import { describe, expect, test } from 'vitest';
import {
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
import { solidImage } from '../_utils/test-helpers.js';

/**
 * Draw fillFlood operations.
 */
describe('Draw', () => {
  /**
   * Flood-fills interior of a drawn circle with green using threshold 1.
   */
  test('fillFlood', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 100,
    });

    Draw.drawCircle({
      image: i0,
      center: new Point(50, 50),
      radius: 49,
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.fillFlood({
      image: i0,
      start: new Point(50, 50),
      color: new ColorRgb8(0, 255, 0),
      threshold: 1,
    });

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillFlood.png',
      output
    );
  });

  /**
   * Seed pixel becomes the fill color.
   */
  test('fillFlood: seed pixel becomes fill color', () => {
    const img = solidImage(20, 20, new ColorRgb8(0, 0, 0));
    const fillColor = new ColorRgb8(0, 200, 0);
    Draw.fillFlood({
      image: img,
      start: new Point(5, 5),
      color: fillColor,
      threshold: 1,
    });
    const p = img.getPixel(6, 5);
    expect(p.r).toBe(0);
    expect(p.g).toBe(200);
    expect(p.b).toBe(0);
  });

  /**
   * Image dimensions are unchanged after fill.
   */
  test('fillFlood: image dimensions unchanged after fill', () => {
    const img = new MemoryImage({ width: 30, height: 30 });
    Draw.fillFlood({
      image: img,
      start: new Point(15, 15),
      color: new ColorRgb8(128, 0, 128),
    });
    expect(img.width).toBe(30);
    expect(img.height).toBe(30);
  });

  /**
   * Fills a whole uniform RGBA image.
   */
  test('fillFlood: fills a whole uniform RGBA image', () => {
    const img = new MemoryImage({ width: 64, height: 64, numChannels: 4 });
    img.clear(new ColorRgba8(10, 20, 30, 255));
    const color = new ColorRgba8(255, 0, 0, 255);
    Draw.fillFlood({ image: img, start: new Point(0, 0), color: color });
    for (const p of img) {
      expect([p.r, p.g, p.b, p.a], `${p.x},${p.y}`).toEqual([255, 0, 0, 255]);
    }
    expect(color.a).toBe(255);
  });

  /**
   * maskFlood leaves the image unchanged.
   */
  test('maskFlood: leaves the image unchanged', () => {
    const img = new MemoryImage({ width: 8, height: 8, numChannels: 4 });
    img.clear(new ColorRgba8(10, 20, 30, 255));
    const mask = Draw.maskFlood({ image: img, start: new Point(0, 0) });
    expect(mask.every((v) => v === 255)).toBe(true);
    expect([...img].every((p) => p.a === 255)).toBe(true);
  });

  /**
   * A maze one pixel wide, which a recursive fill would overflow the stack on.
   */
  test('fillFlood: a long winding shape', () => {
    const w = 10000;
    const h = 4;
    const img = new MemoryImage({ width: w, height: h });
    for (let x = 1; x < w; x += 2) {
      const gap = Math.trunc(x / 2) % 2 === 0 ? h - 1 : 0;
      for (let y = 0; y < h; y++) {
        if (y !== gap) {
          img.setPixelRgb(x, y, 255, 255, 255);
        }
      }
    }
    for (const threshold of [0, 1]) {
      const copy = img.clone();
      Draw.fillFlood({
        image: copy,
        start: new Point(0, 0),
        color: new ColorRgb8(255, 0, 0),
        threshold: threshold,
      });
      expect(copy.getPixel(w - 1, 0).r, `threshold ${threshold}`).toBe(255);
      expect(copy.getPixel(w - 1, 0).g, `threshold ${threshold}`).toBe(0);
    }
  });
});
