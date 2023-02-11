/** @format */

import { Format, MemoryImage } from '../../src';

describe('Image', () => {
  test('float16', () => {
    const i1 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
      numChannels: 1,
    });

    expect(i1.width).toBe(2);
    expect(i1.height).toBe(2);
    expect(i1.numChannels).toBe(1);
    expect(i1.format).toBe(Format.float16);

    i1.setPixelRgb(0, 0, 32, 0, 0);
    i1.setPixelRgb(1, 0, 64, 0, 0);
    i1.setPixelRgb(0, 1, -75, 0, 0);
    i1.setPixelRgb(1, 1, -115, 0, 0);

    expect(i1.getPixel(0, 0).equals([32])).toBe(true);
    expect(i1.getPixel(1, 0).equals([64])).toBe(true);
    expect(i1.getPixel(0, 1).equals([-75])).toBe(true);
    expect(i1.getPixel(1, 1).equals([-115])).toBe(true);

    const i2 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
      numChannels: 2,
    });
    expect(i2.width).toBe(2);
    expect(i2.height).toBe(2);
    expect(i2.numChannels).toBe(2);

    i2.setPixelRgb(0, 0, 32, 64, 0);
    i2.setPixelRgb(1, 0, 64, 32, 0);
    i2.setPixelRgb(0, 1, -58, 52, 0);
    i2.setPixelRgb(1, 1, 110, 84, 0);

    expect(i2.getPixel(0, 0).equals([32, 64])).toBe(true);
    expect(i2.getPixel(1, 0).equals([64, 32])).toBe(true);
    expect(i2.getPixel(0, 1).equals([-58, 52])).toBe(true);
    expect(i2.getPixel(1, 1).equals([110, 84])).toBe(true);

    const i3 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
    });

    expect(i3.width).toBe(2);
    expect(i3.height).toBe(2);
    expect(i3.numChannels).toBe(3);

    i3.setPixelRgb(0, 0, 32, 64, 86);
    i3.setPixelRgb(1, 0, 64, 32, 14);
    i3.setPixelRgb(0, 1, -58, 52, 5);
    i3.setPixelRgb(1, 1, 110, 84, 94);

    expect(i3.getPixel(0, 0).equals([32, 64, 86])).toBe(true);
    expect(i3.getPixel(1, 0).equals([64, 32, 14])).toBe(true);
    expect(i3.getPixel(0, 1).equals([-58, 52, 5])).toBe(true);
    expect(i3.getPixel(1, 1).equals([110, 84, 94])).toBe(true);

    const i4 = new MemoryImage({
      width: 2,
      height: 2,
      format: Format.float16,
      numChannels: 4,
    });
    expect(i4.width).toBe(2);
    expect(i4.height).toBe(2);
    expect(i4.numChannels).toBe(4);

    i4.setPixelRgba(0, 0, 32, 64, 86, 44);
    i4.setPixelRgba(1, 0, 64, 32, 14, 14);
    i4.setPixelRgba(0, 1, 12, 52, 5, 52);
    i4.setPixelRgba(1, 1, 100, 84, 94, 82);

    expect(i4.getPixel(0, 0).equals([32, 64, 86, 44])).toBe(true);
    expect(i4.getPixel(1, 0).equals([64, 32, 14, 14])).toBe(true);
    expect(i4.getPixel(0, 1).equals([12, 52, 5, 52])).toBe(true);
    expect(i4.getPixel(1, 1).equals([100, 84, 94, 82])).toBe(true);
  });
});
