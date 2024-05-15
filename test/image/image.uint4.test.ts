/** @format */

import { describe, expect, test } from 'vitest';
import { Format, MemoryImage } from '../../src';

describe('Image', () => {
  test('uint4 nc:1', () => {
    const i1 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      numChannels: 1,
    });
    expect(i1.width).toBe(32);
    expect(i1.height).toBe(32);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.uint4);

    i1.setPixelRgb(0, 0, 15, 0, 0);
    i1.setPixelRgb(1, 0, 12, 0, 0);
    i1.setPixelRgb(0, 1, 5, 0, 0);
    i1.setPixelRgb(1, 1, 15, 0, 0);

    expect(i1.getPixel(0, 0).equals([15])).toBeTruthy();
    expect(i1.getPixel(1, 0).equals([12])).toBeTruthy();
    expect(i1.getPixel(0, 1).equals([5])).toBeTruthy();
    expect(i1.getPixel(1, 1).equals([15])).toBeTruthy();

    for (const p of i1) {
      const p2 = i1.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0xf;
      p.r = v;
      expect(p.equals([v])).toBeTruthy();
    }
  });

  test('uint4 nc:2', () => {
    const i2 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      numChannels: 2,
    });

    expect(i2.width).toBe(32);
    expect(i2.height).toBe(32);
    expect(i2.numChannels).toBe(2);
    expect(i2.format).toBe(Format.uint4);

    i2.setPixelRgb(0, 0, 9, 3, 0);
    i2.setPixelRgb(1, 0, 3, 5, 0);
    i2.setPixelRgb(0, 1, 7, 14, 0);
    i2.setPixelRgb(1, 1, 15, 2, 0);

    expect(i2.getPixel(0, 0).equals([9, 3])).toBeTruthy();
    expect(i2.getPixel(1, 0).equals([3, 5])).toBeTruthy();
    expect(i2.getPixel(0, 1).equals([7, 14])).toBeTruthy();
    expect(i2.getPixel(1, 1).equals([15, 2])).toBeTruthy();

    for (const p of i2) {
      const p2 = i2.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0xf;
      p.r = v;
      p.g = v;
      expect(p.equals([v, v])).toBeTruthy();
    }
  });

  test('uint4 nc:3', () => {
    const i3 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      numChannels: 3,
    });

    expect(i3.width).toBe(32);
    expect(i3.height).toBe(32);
    expect(i3.numChannels).toBe(3);
    expect(i3.format).toBe(Format.uint4);

    i3.setPixelRgb(0, 0, 0, 14, 3);
    i3.setPixelRgb(1, 0, 1, 0, 2);
    i3.setPixelRgb(i3.width - 1, 0, 1, 13, 6);
    i3.setPixelRgb(0, 1, 2, 11, 9);
    i3.setPixelRgb(i3.width - 1, i3.height - 1, 3, 1, 13);

    expect(i3.getPixel(0, 0).equals([0, 14, 3])).toBeTruthy();
    expect(i3.getPixel(1, 0).equals([1, 0, 2])).toBeTruthy();
    expect(i3.getPixel(i3.width - 1, 0).equals([1, 13, 6])).toBeTruthy();
    expect(i3.getPixel(0, 1).equals([2, 11, 9])).toBeTruthy();
    expect(i3.getPixel(i3.width - 1, i3.height - 1).equals([3, 1, 13])).toBe(
      true
    );

    for (const p of i3) {
      const p2 = i3.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0xf;
      p.r = v;
      p.g = v;
      p.b = v;
      expect(p.equals([v, v, v])).toBeTruthy();
    }
  });

  test('uint4 nc:4', () => {
    const i4 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      numChannels: 4,
    });
    expect(i4.width).toBe(32);
    expect(i4.height).toBe(32);
    expect(i4.numChannels).toBe(4);
    expect(i4.format).toBe(Format.uint4);

    i4.setPixelRgba(0, 0, 10, 1, 2, 3);
    i4.setPixelRgba(1, 0, 3, 12, 1, 0);
    i4.setPixelRgba(0, 1, 1, 0, 15, 2);
    i4.setPixelRgba(1, 1, 2, 13, 0, 1);

    expect(i4.getPixel(0, 0).equals([10, 1, 2, 3])).toBeTruthy();
    expect(i4.getPixel(1, 0).equals([3, 12, 1, 0])).toBeTruthy();
    expect(i4.getPixel(0, 1).equals([1, 0, 15, 2])).toBeTruthy();
    expect(i4.getPixel(1, 1).equals([2, 13, 0, 1])).toBeTruthy();

    for (const p of i4) {
      const p2 = i4.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0xf;
      p.r = v;
      p.g = v;
      p.b = v;
      p.a = v;
      expect(p.equals([v, v, v, v])).toBeTruthy();
    }
  });

  test('uint4 nc:3 palette', () => {
    const i5 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      withPalette: true,
    });
    expect(i5.width).toBe(32);
    expect(i5.height).toBe(32);
    expect(i5.numChannels).toBe(3);
    expect(i5.palette!.numChannels).toBe(3);

    i5.palette!.setRgb(0, 123, 42, 86);
    i5.palette!.setRgb(7, 84, 231, 52);
    i5.palette!.setRgb(12, 41, 151, 252);
    i5.palette!.setRgb(14, 184, 31, 152);

    i5.setPixelRgb(0, 0, 0, 0, 0);
    i5.setPixelRgb(1, 0, 12, 0, 0);
    i5.setPixelRgb(0, 1, 14, 0, 0);
    i5.setPixelRgb(1, 1, 7, 0, 0);

    expect(i5.getPixel(0, 0).equals([123, 42, 86])).toBeTruthy();
    expect(i5.getPixel(1, 0).equals([41, 151, 252])).toBeTruthy();
    expect(i5.getPixel(0, 1).equals([184, 31, 152])).toBeTruthy();
    expect(i5.getPixel(1, 1).equals([84, 231, 52])).toBeTruthy();

    for (let i = 0; i < 16; ++i) {
      i5.palette!.setRgb(i, i, i, i);
    }

    for (const p of i5) {
      const p2 = i5.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = p.x & 0xf;
      i5.setPixelRgb(p.x, p.y, v, 0, 0);
      expect(p.equals([v, v, v])).toBeTruthy();
    }
  });

  test('uint4 nc:4 palette', () => {
    const i6 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      numChannels: 4,
      withPalette: true,
    });
    expect(i6.width).toBe(32);
    expect(i6.height).toBe(32);
    expect(i6.numChannels).toBe(4);
    expect(i6.palette!.numChannels).toBe(4);

    i6.palette!.setRgba(0, 123, 42, 86, 54);
    i6.palette!.setRgba(11, 84, 231, 52, 192);
    i6.palette!.setRgba(7, 41, 151, 252, 8);
    i6.palette!.setRgba(13, 184, 31, 152, 131);

    i6.setPixelRgb(0, 0, 0, 0, 0);
    i6.setPixelRgb(1, 0, 11, 0, 0);
    i6.setPixelRgb(0, 1, 13, 0, 0);
    i6.setPixelRgb(1, 1, 7, 0, 0);

    expect(i6.getPixel(0, 0).equals([123, 42, 86, 54])).toBeTruthy();
    expect(i6.getPixel(1, 0).equals([84, 231, 52, 192])).toBeTruthy();
    expect(i6.getPixel(0, 1).equals([184, 31, 152, 131])).toBeTruthy();
    expect(i6.getPixel(1, 1).equals([41, 151, 252, 8])).toBeTruthy();
  });
});
