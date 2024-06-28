/** @format */

import { describe, expect, test } from 'vitest';
import { Format, MemoryImage } from '../../src';

/**
 * Test suite for the MemoryImage class.
 */
describe('MemoryImage', () => {
  /**
   * Test case for a 32x32 image with uint2 format and 1 channel.
   */
  test('uint2 nc:1', () => {
    const i1 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      numChannels: 1,
    });
    expect(i1.width).toBe(32);
    expect(i1.height).toBe(32);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.uint2);

    i1.setPixelRgb(0, 0, 1, 0, 0);
    i1.setPixelRgb(1, 0, 3, 0, 0);
    i1.setPixelRgb(0, 1, 1, 0, 0);
    i1.setPixelRgb(1, 1, 2, 0, 0);

    expect(i1.getPixel(0, 0).equals([1])).toBeTruthy();
    expect(i1.getPixel(1, 0).equals([3])).toBeTruthy();
    expect(i1.getPixel(0, 1).equals([1])).toBeTruthy();
    expect(i1.getPixel(1, 1).equals([2])).toBeTruthy();

    for (const p of i1) {
      const p2 = i1.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0x3;
      p.r = v;
      expect(p.equals([v])).toBeTruthy();
    }
  });

  /**
   * Test case for a 32x32 image with uint2 format and 2 channels.
   */
  test('uint2 nc:2', () => {
    const i2 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      numChannels: 2,
    });

    expect(i2.width).toBe(32);
    expect(i2.height).toBe(32);
    expect(i2.numChannels).toBe(2);
    expect(i2.format).toBe(Format.uint2);

    i2.setPixelRgb(0, 0, 0, 3, 0);
    i2.setPixelRgb(1, 0, 3, 0, 0);
    i2.setPixelRgb(0, 1, 2, 1, 0);
    i2.setPixelRgb(1, 1, 1, 2, 0);

    expect(i2.getPixel(0, 0).equals([0, 3])).toBeTruthy();
    expect(i2.getPixel(1, 0).equals([3, 0])).toBeTruthy();
    expect(i2.getPixel(0, 1).equals([2, 1])).toBeTruthy();
    expect(i2.getPixel(1, 1).equals([1, 2])).toBeTruthy();

    for (const p of i2) {
      const p2 = i2.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0x3;
      p.r = v;
      p.g = v;
      expect(p.equals([v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for a 32x32 image with uint2 format and 3 channels.
   */
  test('uint2 nc:3', () => {
    const i3 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      numChannels: 3,
    });

    expect(i3.width).toBe(32);
    expect(i3.height).toBe(32);
    expect(i3.numChannels).toBe(3);
    expect(i3.format).toBe(Format.uint2);

    i3.setPixelRgb(0, 0, 3, 0, 3);
    i3.setPixelRgb(1, 0, 3, 0, 3);
    i3.setPixelRgb(0, 1, 2, 1, 0);
    i3.setPixelRgb(1, 1, 3, 1, 3);

    expect(i3.getPixel(0, 0).equals([3, 0, 3])).toBeTruthy();
    expect(i3.getPixel(1, 0).equals([3, 0, 3])).toBeTruthy();
    expect(i3.getPixel(0, 1).equals([2, 1, 0])).toBeTruthy();
    expect(i3.getPixel(1, 1).equals([3, 1, 3])).toBeTruthy();

    for (const p of i3) {
      const p2 = i3.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0x3;
      p.r = v;
      p.g = v;
      p.b = v;
      expect(p.equals([v, v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for a 32x32 image with uint2 format and 4 channels.
   */
  test('uint2 nc:4', () => {
    const i4 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      numChannels: 4,
    });
    expect(i4.width).toBe(32);
    expect(i4.height).toBe(32);
    expect(i4.numChannels).toBe(4);
    expect(i4.format).toBe(Format.uint2);

    i4.setPixelRgba(0, 0, 0, 1, 2, 3);
    i4.setPixelRgba(1, 0, 3, 2, 1, 0);
    i4.setPixelRgba(0, 1, 1, 0, 3, 2);
    i4.setPixelRgba(1, 1, 2, 3, 0, 1);

    expect(i4.getPixel(0, 0).equals([0, 1, 2, 3])).toBeTruthy();
    expect(i4.getPixel(1, 0).equals([3, 2, 1, 0])).toBeTruthy();
    expect(i4.getPixel(0, 1).equals([1, 0, 3, 2])).toBeTruthy();
    expect(i4.getPixel(1, 1).equals([2, 3, 0, 1])).toBeTruthy();

    for (const p of i4) {
      const p2 = i4.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0x3;
      p.r = v;
      p.g = v;
      p.b = v;
      p.a = v;
      expect(p.equals([v, v, v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for a 32x32 image with uint2 format, 3 channels, and a palette.
   */
  test('uint2 nc:3 palette', () => {
    const i5 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      withPalette: true,
    });
    expect(i5.width).toBe(32);
    expect(i5.height).toBe(32);
    expect(i5.numChannels).toBe(3);
    expect(i5.palette!.numChannels).toBe(3);

    i5.palette!.setRgb(0, 123, 42, 86);
    i5.palette!.setRgb(1, 84, 231, 52);
    i5.palette!.setRgb(2, 41, 151, 252);
    i5.palette!.setRgb(3, 184, 31, 152);

    i5.setPixelRgb(0, 0, 0, 0, 0);
    i5.setPixelRgb(1, 0, 1, 0, 0);
    i5.setPixelRgb(0, 1, 2, 0, 0);
    i5.setPixelRgb(1, 1, 3, 0, 0);

    expect(i5.getPixel(0, 0).equals([123, 42, 86])).toBeTruthy();
    expect(i5.getPixel(1, 0).equals([84, 231, 52])).toBeTruthy();
    expect(i5.getPixel(0, 1).equals([41, 151, 252])).toBeTruthy();
    expect(i5.getPixel(1, 1).equals([184, 31, 152])).toBeTruthy();
  });

  /**
   * Test case for a 32x32 image with uint2 format, 4 channels, and a palette.
   */
  test('uint2 nc:4 palette', () => {
    const i6 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      numChannels: 4,
      withPalette: true,
    });
    expect(i6.width).toBe(32);
    expect(i6.height).toBe(32);
    expect(i6.numChannels).toBe(4);
    expect(i6.palette!.numChannels).toBe(4);

    i6.palette!.setRgba(0, 123, 42, 86, 54);
    i6.palette!.setRgba(1, 84, 231, 52, 192);
    i6.palette!.setRgba(2, 41, 151, 252, 8);
    i6.palette!.setRgba(3, 184, 31, 152, 131);

    i6.setPixelRgb(0, 0, 0, 0, 0);
    i6.setPixelRgb(1, 0, 1, 0, 0);
    i6.setPixelRgb(0, 1, 3, 0, 0);
    i6.setPixelRgb(1, 1, 2, 0, 0);

    expect(i6.getPixel(0, 0).equals([123, 42, 86, 54])).toBeTruthy();
    expect(i6.getPixel(1, 0).equals([84, 231, 52, 192])).toBeTruthy();
    expect(i6.getPixel(0, 1).equals([184, 31, 152, 131])).toBeTruthy();
    expect(i6.getPixel(1, 1).equals([41, 151, 252, 8])).toBeTruthy();
  });
});
