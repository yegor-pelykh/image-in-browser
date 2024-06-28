/** @format */

import { describe, expect, test } from 'vitest';
import { Format, MemoryImage } from '../../src';

/**
 * Test suite for the MemoryImage class.
 */
describe('MemoryImage', () => {
  /**
   * Test case for a 32x32 image with uint16 format and 1 channel.
   */
  test('uint16 nc:1', () => {
    const i1 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint16,
      numChannels: 1,
    });

    expect(i1.width).toBe(32);
    expect(i1.height).toBe(32);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.uint16);

    i1.setPixelRgb(0, 0, 32, 0, 0);
    i1.setPixelRgb(1, 0, 64, 0, 0);
    i1.setPixelRgb(0, 1, 7425, 0, 0);
    i1.setPixelRgb(1, 1, 52145, 0, 0);

    expect(i1.getPixel(0, 0).equals([32])).toBeTruthy();
    expect(i1.getPixel(1, 0).equals([64])).toBeTruthy();
    expect(i1.getPixel(0, 1).equals([7425])).toBeTruthy();
    expect(i1.getPixel(1, 1).equals([52145])).toBeTruthy();
  });

  /**
   * Test case for a 32x32 image with uint16 format and 2 channels.
   */
  test('uint16 nc:2', () => {
    const i2 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint16,
      numChannels: 2,
    });

    expect(i2.width).toBe(32);
    expect(i2.height).toBe(32);
    expect(i2.numChannels).toBe(2);
    expect(i2.format).toBe(Format.uint16);

    i2.setPixelRgb(0, 0, 32, 64, 0);
    i2.setPixelRgb(1, 0, 64, 32, 0);
    i2.setPixelRgb(0, 1, 58, 52, 0);
    i2.setPixelRgb(1, 1, 110, 84, 0);

    expect(i2.getPixel(0, 0).equals([32, 64])).toBeTruthy();
    expect(i2.getPixel(1, 0).equals([64, 32])).toBeTruthy();
    expect(i2.getPixel(0, 1).equals([58, 52])).toBeTruthy();
    expect(i2.getPixel(1, 1).equals([110, 84])).toBeTruthy();
  });

  /**
   * Test case for a 32x32 image with uint16 format and 3 channels.
   */
  test('uint16 nc:3', () => {
    const i3 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint16,
      numChannels: 3,
    });

    expect(i3.width).toBe(32);
    expect(i3.height).toBe(32);
    expect(i3.numChannels).toBe(3);
    expect(i3.format).toBe(Format.uint16);

    i3.setPixelRgb(0, 0, 32, 64, 86);
    i3.setPixelRgb(1, 0, 64, 32, 14);
    i3.setPixelRgb(0, 1, 58, 52, 5);
    i3.setPixelRgb(1, 1, 110, 84, 94);

    expect(i3.getPixel(0, 0).equals([32, 64, 86])).toBeTruthy();
    expect(i3.getPixel(1, 0).equals([64, 32, 14])).toBeTruthy();
    expect(i3.getPixel(0, 1).equals([58, 52, 5])).toBeTruthy();
    expect(i3.getPixel(1, 1).equals([110, 84, 94])).toBeTruthy();

    for (const p of i3) {
      const p2 = i3.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x * 2114;
      p.r = v;
      p.g = v;
      p.b = v;
      expect(p.equals([v, v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for a 32x32 image with uint16 format and 4 channels.
   */
  test('uint16 nc:4', () => {
    const i4 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint16,
      numChannels: 4,
    });
    expect(i4.width).toBe(32);
    expect(i4.height).toBe(32);
    expect(i4.numChannels).toBe(4);
    expect(i4.format).toBe(Format.uint16);

    i4.setPixelRgba(0, 0, 32, 64, 86, 44);
    i4.setPixelRgba(1, 0, 64, 32, 14, 14);
    i4.setPixelRgba(0, 1, 12, 52, 5, 52);
    i4.setPixelRgba(1, 1, 100, 84, 94, 82);

    expect(i4.getPixel(0, 0).equals([32, 64, 86, 44])).toBeTruthy();
    expect(i4.getPixel(1, 0).equals([64, 32, 14, 14])).toBeTruthy();
    expect(i4.getPixel(0, 1).equals([12, 52, 5, 52])).toBeTruthy();
    expect(i4.getPixel(1, 1).equals([100, 84, 94, 82])).toBeTruthy();
  });
});
