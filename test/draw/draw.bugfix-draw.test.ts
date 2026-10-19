/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, ColorRgba8, Draw, MemoryImage, Rectangle } from '../../src';

describe('Draw bug fixes', () => {
  test('fillRect blends a translucent color over an opaque image', () => {
    const img = new MemoryImage({ width: 4, height: 4, numChannels: 4 });
    img.clear(new ColorRgba8(255, 255, 255, 255));
    Draw.fillRect({
      image: img,
      rect: new Rectangle(0, 0, 3, 3),
      color: new ColorRgba8(0, 0, 0, 160),
    });
    const p = img.getPixel(1, 1);
    // 255 * (1 - 160/255) = 95
    expect(p.r).toBe(95);
    expect(p.g).toBe(95);
    expect(p.b).toBe(95);
    expect(p.a).toBe(255);
  });

  test('fillRect blends a translucent color over a transparent image', () => {
    const img = new MemoryImage({ width: 4, height: 4, numChannels: 4 });
    Draw.fillRect({
      image: img,
      rect: new Rectangle(0, 0, 3, 3),
      color: new ColorRgba8(255, 0, 0, 160),
    });
    expect(img.getPixel(1, 1).a).toBe(160);
  });

  test('fillRect translucent square matches the rounded interior', () => {
    const color = new ColorRgba8(10, 200, 30, 100);
    const square = new MemoryImage({ width: 40, height: 40, numChannels: 4 });
    square.clear(new ColorRgba8(50, 60, 70, 200));
    const rounded = square.clone();
    Draw.fillRect({
      image: square,
      rect: new Rectangle(0, 0, 39, 39),
      color: color,
    });
    Draw.fillRect({
      image: rounded,
      rect: new Rectangle(0, 0, 39, 39),
      color: color,
      radius: 5,
    });
    expect(square.getPixel(20, 20).equals(rounded.getPixel(20, 20))).toBe(true);
  });

  test('fillRect with a mask blends alpha by the mask', () => {
    const img = new MemoryImage({ width: 40, height: 40, numChannels: 4 });
    const mask = new MemoryImage({ width: 40, height: 40 });
    mask.clear(new ColorRgb8(128, 128, 128));
    Draw.fillRect({
      image: img,
      rect: new Rectangle(0, 0, 39, 39),
      color: new ColorRgba8(255, 0, 0, 255),
      mask: mask,
    });
    expect(img.getPixel(20, 20).a).toBe(128);

    const rounded = new MemoryImage({ width: 40, height: 40, numChannels: 4 });
    Draw.fillRect({
      image: rounded,
      rect: new Rectangle(0, 0, 39, 39),
      radius: 5,
      color: new ColorRgba8(255, 0, 0, 255),
      mask: mask,
    });
    expect(rounded.getPixel(20, 20).a).toBe(128);
  });

  test('drawRect with a radius applies the mask to the edges', () => {
    const img = new MemoryImage({ width: 20, height: 20, numChannels: 4 });
    // A black mask blocks all drawing.
    const mask = new MemoryImage({ width: 20, height: 20 });
    Draw.drawRect({
      image: img,
      rect: new Rectangle(0, 0, 19, 19),
      radius: 4,
      color: new ColorRgba8(255, 255, 255, 255),
      mask: mask,
    });
    for (const p of img) {
      expect(p.a).toBe(0);
    }
  });
});
