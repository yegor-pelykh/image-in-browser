/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorRgba8, Format, MemoryImage } from '../../src';

/**
 * Test suite for the MemoryImage class.
 */
describe('MemoryImage', TestUtils.testOptions, () => {
  /**
   * Test case for an image with uint8 format and 1 channel.
   */
  test('uint8 nc:1', () => {
    const i1 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint8,
      numChannels: 1,
    });
    expect(i1.width).toBe(32);
    expect(i1.height).toBe(32);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.uint8);

    i1.setPixelRgb(0, 0, 32, 0, 0);
    i1.setPixelRgb(1, 0, 64, 0, 0);
    i1.setPixelRgb(0, 1, 128, 0, 0);
    i1.setPixelRgb(1, 1, 255, 0, 0);

    expect(i1.getPixel(0, 0).equals([32])).toBeTruthy();
    expect(i1.getPixel(1, 0).equals([64])).toBeTruthy();
    expect(i1.getPixel(0, 1).equals([128])).toBeTruthy();
    expect(i1.getPixel(1, 1).equals([255])).toBeTruthy();

    for (const p of i1) {
      const p2 = i1.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = (p.x * 8) & 0xff;
      p.r = v;
      expect(p.equals([v])).toBeTruthy();
    }
  });

  /**
   * Test case for an image with uint8 format and 2 channels.
   */
  test('uint8 nc:2', () => {
    const i2 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint8,
      numChannels: 2,
    });

    expect(i2.width).toBe(32);
    expect(i2.height).toBe(32);
    expect(i2.numChannels).toBe(2);
    expect(i2.format).toBe(Format.uint8);

    i2.setPixelRgb(0, 0, 32, 64, 0);
    i2.setPixelRgb(1, 0, 64, 32, 0);
    i2.setPixelRgb(0, 1, 128, 52, 0);
    i2.setPixelRgb(1, 1, 255, 84, 0);

    expect(i2.getPixel(0, 0).equals([32, 64])).toBeTruthy();
    expect(i2.getPixel(1, 0).equals([64, 32])).toBeTruthy();
    expect(i2.getPixel(0, 1).equals([128, 52])).toBeTruthy();
    expect(i2.getPixel(1, 1).equals([255, 84])).toBeTruthy();

    for (const p of i2) {
      const p2 = i2.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = (p.x * 8) & 0xff;
      p.r = v;
      p.a = v;
      expect(p.equals([v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for an image with uint8 format and 3 channels.
   */
  test('uint8 nc:3', () => {
    const i3 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint8,
      numChannels: 3,
    });

    expect(i3.width).toBe(32);
    expect(i3.height).toBe(32);
    expect(i3.numChannels).toBe(3);
    expect(i3.format).toBe(Format.uint8);

    i3.setPixelRgb(0, 0, 32, 64, 86);
    i3.setPixelRgb(1, 0, 64, 32, 14);
    i3.setPixelRgb(0, 1, 128, 52, 5);
    i3.setPixelRgb(1, 1, 255, 84, 94);

    expect(i3.getPixel(0, 0).equals([32, 64, 86])).toBeTruthy();
    expect(i3.getPixel(1, 0).equals([64, 32, 14])).toBeTruthy();
    expect(i3.getPixel(0, 1).equals([128, 52, 5])).toBeTruthy();
    expect(i3.getPixel(1, 1).equals([255, 84, 94])).toBeTruthy();

    for (const p of i3) {
      const p2 = i3.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = (p.x * 8) & 0xff;
      p.r = v;
      p.g = v;
      p.b = v;
      expect(p.equals([v, v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for an image with uint8 format and 4 channels.
   */
  test('uint8 nc:4', () => {
    const i4 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint8,
      numChannels: 4,
    });
    expect(i4.width).toBe(32);
    expect(i4.height).toBe(32);
    expect(i4.numChannels).toBe(4);
    expect(i4.format).toBe(Format.uint8);

    i4.setPixelRgba(0, 0, 32, 64, 86, 144);
    i4.setPixelRgba(1, 0, 64, 32, 14, 214);
    i4.setPixelRgba(0, 1, 128, 52, 5, 52);
    i4.setPixelRgba(1, 1, 255, 84, 94, 82);

    expect(i4.getPixel(0, 0).equals([32, 64, 86, 144])).toBeTruthy();
    expect(i4.getPixel(1, 0).equals([64, 32, 14, 214])).toBeTruthy();
    expect(i4.getPixel(0, 1).equals([128, 52, 5, 52])).toBeTruthy();
    expect(i4.getPixel(1, 1).equals([255, 84, 94, 82])).toBeTruthy();

    for (const p of i4) {
      const p2 = i4.getPixel(p.x, p.y);
      expect(p2.equals(p)).toBeTruthy();
      const v = (p.x * 8) & 0xff;
      p.r = v;
      p.g = v;
      p.b = v;
      p.a = v;
      expect(p.equals([v, v, v, v])).toBeTruthy();
    }
  });

  /**
   * Test case for an image with uint8 format, 3 channels, and a palette.
   */
  test('uint8 nc:3 palette', () => {
    const i5 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint8,
      withPalette: true,
    });
    expect(i5.width).toBe(32);
    expect(i5.height).toBe(32);
    expect(i5.numChannels).toBe(3);
    expect(i5.palette!.numChannels).toBe(3);

    i5.palette!.setRgb(50, 123, 42, 86);
    i5.palette!.setRgb(125, 84, 231, 52);

    i5.setPixelRgb(0, 0, 50, 0, 0);
    i5.setPixelRgb(1, 0, 125, 0, 0);
    i5.setPixelRgb(0, 1, 42, 0, 0);
    i5.setPixelRgb(1, 1, 0, 0, 0);

    expect(i5.getPixel(0, 0).equals([123, 42, 86])).toBeTruthy();
    expect(i5.getPixel(1, 0).equals([84, 231, 52])).toBeTruthy();
    expect(i5.getPixel(0, 1).equals([0, 0, 0])).toBeTruthy();
    expect(i5.getPixel(1, 1).equals([0, 0, 0])).toBeTruthy();

    i5.clear(new ColorRgba8(50, 10, 5, 10));

    for (const p of i5) {
      const i = p.index;
      i5.setPixel(p.x, p.y, p);
      expect(p.index).toBe(i);
    }
  });

  /**
   * Test case for an image with uint8 format, 4 channels, and a palette.
   */
  test('uint8 nc:4 palette', () => {
    const i6 = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint8,
      numChannels: 4,
      withPalette: true,
    });
    expect(i6.width).toBe(32);
    expect(i6.height).toBe(32);
    expect(i6.numChannels).toBe(4);
    expect(i6.palette!.numChannels).toBe(4);

    i6.palette!.setRgba(50, 123, 42, 86, 128);
    i6.palette!.setRgba(125, 84, 231, 52, 200);

    i6.setPixelRgb(0, 0, 50, 0, 0);
    i6.setPixelRgb(1, 0, 125, 0, 0);
    i6.setPixelRgb(0, 1, 42, 0, 0);
    i6.setPixelRgb(1, 1, 0, 0, 0);

    expect(i6.getPixel(0, 0).equals([123, 42, 86, 128])).toBeTruthy();
    expect(i6.getPixel(1, 0).equals([84, 231, 52, 200])).toBeTruthy();
    expect(i6.getPixel(0, 1).equals([0, 0, 0, 0])).toBeTruthy();
    expect(i6.getPixel(1, 1).equals([0, 0, 0, 0])).toBeTruthy();

    i6.clear(new ColorRgba8(50, 10, 5, 10));
  });
});
