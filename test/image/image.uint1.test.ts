/** @format */

import { Format, MemoryImage } from '../../src';

describe('Image', () => {
  test('uint1 nc:1', () => {
    const i1 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      numChannels: 1,
    });
    expect(i1.width).toBe(32);
    expect(i1.height).toBe(32);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.uint1);

    i1.setPixelRgb(0, 0, 1, 0, 0);
    i1.setPixelRgb(3, 0, 1, 0, 0);
    i1.setPixelRgb(0, 1, 1, 0, 0);
    i1.setPixelRgb(3, 1, 1, 0, 0);

    expect(i1.getPixel(0, 0).equals([1])).toBe(true);
    expect(i1.getPixel(1, 0).equals([0])).toBe(true);
    expect(i1.getPixel(2, 0).equals([0])).toBe(true);
    expect(i1.getPixel(3, 0).equals([1])).toBe(true);

    for (const p of i1) {
      const p2 = i1.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBe(true);
      const v = p.x & 0x1;
      p.r = v;
      expect(p.equals([v])).toBe(true);
    }
  });

  test('uint1 nc:2', () => {
    const i2 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      numChannels: 2,
    });

    expect(i2.width).toBe(32);
    expect(i2.height).toBe(32);
    expect(i2.numChannels).toBe(2);
    expect(i2.format).toBe(Format.uint1);

    i2.setPixelRgb(0, 0, 0, 0, 0);
    i2.setPixelRgb(1, 0, 1, 0, 0);
    i2.setPixelRgb(0, 1, 0, 1, 0);
    i2.setPixelRgb(1, 1, 1, 1, 0);

    expect(i2.getPixel(0, 0).equals([0, 0])).toBe(true);
    expect(i2.getPixel(1, 0).equals([1, 0])).toBe(true);
    expect(i2.getPixel(0, 1).equals([0, 1])).toBe(true);
    expect(i2.getPixel(1, 1).equals([1, 1])).toBe(true);

    for (const p of i2) {
      const p2 = i2.getPixel(p.x, p.y);
      const eq = p2.equals(p);
      expect(eq).toBe(true);
      const v = p.x & 0x1;
      p.r = v;
      p.g = v;
      expect(p.equals([v, v])).toBe(true);
    }
  });

  test('uint1 nc:3', () => {
    const i3 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      numChannels: 3,
    });

    expect(i3.width).toBe(32);
    expect(i3.height).toBe(32);
    expect(i3.numChannels).toBe(3);
    expect(i3.format).toBe(Format.uint1);

    i3.setPixelRgb(0, 0, 0, 0, 0);
    i3.setPixelRgb(1, 0, 1, 0, 1);
    i3.setPixelRgb(0, 1, 0, 1, 0);
    i3.setPixelRgb(1, 1, 1, 1, 1);

    expect(i3.getPixel(0, 0).equals([0, 0, 0])).toBe(true);
    expect(i3.getPixel(1, 0).equals([1, 0, 1])).toBe(true);
    expect(i3.getPixel(0, 1).equals([0, 1, 0])).toBe(true);
    expect(i3.getPixel(1, 1).equals([1, 1, 1])).toBe(true);

    for (const p of i3) {
      const p2 = i3.getPixel(p.x, p.y);
      const eq = p2.equals(p);
      expect(eq).toBe(true);
      const v = p.x & 0x1;
      p.r = v;
      p.g = v;
      p.b = v;
      expect(p.equals([v, v, v])).toBe(true);
    }
  });

  test('uint1 nc:4', () => {
    const i4 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      numChannels: 4,
    });
    expect(i4.width).toBe(32);
    expect(i4.height).toBe(32);
    expect(i4.numChannels).toBe(4);
    expect(i4.format).toBe(Format.uint1);

    i4.setPixelRgba(0, 0, 0, 0, 0, 0);
    i4.setPixelRgba(1, 0, 1, 0, 1, 1);
    i4.setPixelRgba(0, 1, 0, 1, 0, 0);
    i4.setPixelRgba(1, 1, 1, 1, 1, 1);

    expect(i4.getPixel(0, 0).equals([0, 0, 0, 0])).toBe(true);
    expect(i4.getPixel(1, 0).equals([1, 0, 1, 1])).toBe(true);
    expect(i4.getPixel(0, 1).equals([0, 1, 0, 0])).toBe(true);
    expect(i4.getPixel(1, 1).equals([1, 1, 1, 1])).toBe(true);

    for (const p of i4) {
      const p2 = i4.getPixel(p.x, p.y);
      const eq = p2.equals(p);
      expect(eq).toBe(true);
      const v = p.x & 0x1;
      p.r = v;
      p.g = v;
      p.b = v;
      p.a = v;
      expect(p.equals([v, v, v, v])).toBe(true);
    }
  });

  test('uint1 nc:3 palette', () => {
    const i5 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      withPalette: true,
    });
    expect(i5.width).toBe(32);
    expect(i5.height).toBe(32);
    expect(i5.numChannels).toBe(3);
    expect(i5.palette!.numChannels).toBe(3);

    i5.palette!.setRgb(0, 123, 42, 86);
    i5.palette!.setRgb(1, 84, 231, 52);

    i5.setPixelRgb(0, 0, 0, 0, 0);
    i5.setPixelRgb(1, 0, 1, 0, 0);
    i5.setPixelRgb(0, 1, 0, 0, 0);
    i5.setPixelRgb(1, 1, 1, 0, 0);

    expect(i5.getPixel(0, 0).equals([123, 42, 86])).toBe(true);
    expect(i5.getPixel(1, 0).equals([84, 231, 52])).toBe(true);
    expect(i5.getPixel(0, 1).equals([123, 42, 86])).toBe(true);
    expect(i5.getPixel(1, 1).equals([84, 231, 52])).toBe(true);

    expect(Math.floor(i5.getPixel(0, 0).rNormalized * 255)).toBe(123);

    for (const p of i5) {
      const p2 = i5.getPixel(p.x, p.y);
      const eq = p2.equals(p);
      expect(eq).toBe(true);
      const v = p.x & 0x1;
      p.r = v;
      p.g = v;
      p.b = v;
      p.a = v;
      expect(p.r).toBe(v === 0 ? 123 : 84);
      expect(p.g).toBe(v === 0 ? 42 : 231);
      expect(p.b).toBe(v === 0 ? 86 : 52);
    }
  });

  test('nc:4 palette', () => {
    const i6 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      numChannels: 4,
      withPalette: true,
    });
    expect(i6.width).toBe(32);
    expect(i6.height).toBe(32);
    expect(i6.numChannels).toBe(4);
    expect(i6.palette!.numChannels).toBe(4);

    i6.palette!.setRgba(0, 123, 42, 86, 128);
    i6.palette!.setRgba(1, 84, 231, 52, 200);

    i6.setPixelRgb(0, 0, 0, 0, 0);
    i6.setPixelRgb(1, 0, 1, 0, 0);
    i6.setPixelRgb(0, 1, 1, 0, 0);
    i6.setPixelRgb(1, 1, 0, 0, 0);
    expect(i6.getPixel(0, 0).equals([123, 42, 86, 128])).toBe(true);
    expect(i6.getPixel(1, 0).equals([84, 231, 52, 200])).toBe(true);
    expect(i6.getPixel(0, 1).equals([84, 231, 52, 200])).toBe(true);
    expect(i6.getPixel(1, 1).equals([123, 42, 86, 128])).toBe(true);

    for (const p of i6) {
      const p2 = i6.getPixel(p.x, p.y);
      const eq = p2.equals(p);
      expect(eq).toBe(true);
      const v = p.x & 0x1;
      p.r = v;
      p.g = v;
      p.b = v;
      p.a = v;
      expect(p.r).toBe(v === 0 ? 123 : 84);
      expect(p.g).toBe(v === 0 ? 42 : 231);
      expect(p.b).toBe(v === 0 ? 86 : 52);
      expect(p.a).toBe(v === 0 ? 128 : 200);
    }
  });
});
