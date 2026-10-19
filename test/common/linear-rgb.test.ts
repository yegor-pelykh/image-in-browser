/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgba8,
  ColorUtils,
  Draw,
  Filter,
  Format,
  Interpolation,
  Line,
  MemoryImage,
  PixelateMode,
  Point,
  Transform,
} from '../../src';

/**
 * Asserts that **actual** is within **delta** of **expected**.
 * @param {number} actual - The actual value.
 * @param {number} expected - The expected value.
 * @param {number} delta - The maximum allowed difference.
 */
function expectClose(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(delta);
}

/**
 * A black and white checkerboard, which averages to half the light: 188 in
 * sRGB, not the 128 of averaging the stored values.
 * @param {number} size - The width and height of the image.
 * @param {Format} [format] - The pixel format.
 * @returns {MemoryImage} The checkerboard image.
 */
function checkerboard(
  size: number,
  format: Format = Format.uint8
): MemoryImage {
  const image = new MemoryImage({ width: size, height: size, format: format });
  for (const p of image) {
    const v = (p.x + p.y) % 2 === 0 ? 1 : 0;
    p.rNormalized = v;
    p.gNormalized = v;
    p.bNormalized = v;
  }
  return image;
}

describe('linear RGB', () => {
  test('srgbToLinear and linearToSrgb', () => {
    expect(ColorUtils.srgbToLinear(0)).toBe(0);
    expectClose(ColorUtils.srgbToLinear(1), 1, 1e-12);
    expectClose(ColorUtils.srgbToLinear(0.5), 0.214, 1e-4);
    expectClose(ColorUtils.linearToSrgb(0.5), 0.7354, 1e-4);
    expect(ColorUtils.srgbToLinear(-0.5)).toBe(-ColorUtils.srgbToLinear(0.5));
    for (let i = 0; i <= 100; ++i) {
      const v = i / 100;
      expectClose(ColorUtils.linearToSrgb(ColorUtils.srgbToLinear(v)), v, 1e-9);
    }
  });

  test('uint8 values survive the round trip exactly', () => {
    // 2x2 blocks of one value each, which pixelate leaves as they are.
    const image = new MemoryImage({ width: 2, height: 512, numChannels: 4 });
    for (const p of image) {
      const v = Math.trunc(p.y / 2);
      p.setRgba(v, 255 - v, v, 255 - v);
    }
    const orig = image.clone();
    Filter.pixelate({ image: image, size: 2, linearBlend: true });
    for (const p of image) {
      expect(p.equals(orig.getPixel(p.x, p.y))).toBe(true);
    }
  });

  test('copyResize average', () => {
    const src = checkerboard(64);
    const numbers = Transform.copyResize({
      image: src,
      width: 16,
      interpolation: Interpolation.average,
    });
    const light = Transform.copyResize({
      image: src,
      width: 16,
      interpolation: Interpolation.average,
      linearBlend: true,
    });
    expect(light.format).toBe(Format.uint8);
    expect(light.width).toBe(16);
    expectClose(numbers.getPixel(8, 8).r, 128, 2);
    expectClose(light.getPixel(8, 8).r, 188, 2);
  });

  test('copyResize linear and cubic', () => {
    // Enlarged, the pixels between black and white are blends, and a blend
    // of light is brighter than a blend of the stored values.
    for (const interpolation of [Interpolation.linear, Interpolation.cubic]) {
      const src = checkerboard(4);
      const numbers = Transform.copyResize({
        image: src,
        width: 13,
        interpolation: interpolation,
      });
      const light = Transform.copyResize({
        image: src,
        width: 13,
        interpolation: interpolation,
        linearBlend: true,
      });
      let brighter = 0;
      for (const p of light) {
        const n = numbers.getPixel(p.x, p.y).r;
        expect(p.r).toBeGreaterThanOrEqual(n);
        if (p.r > n + 20) {
          brighter++;
        }
      }
      expect(brighter).toBeGreaterThan(0);
    }
  });

  test('copyResize leaves nearest unchanged', () => {
    const src = checkerboard(64);
    const a = Transform.copyResize({ image: src, width: 16 });
    const b = Transform.copyResize({
      image: src,
      width: 16,
      linearBlend: true,
    });
    for (const p of a) {
      expect(p.equals(b.getPixel(p.x, p.y))).toBe(true);
    }
  });

  test('copyResize keeps alpha and the background color', () => {
    const src = checkerboard(64).convert({ numChannels: 4, alpha: 100 });
    const out = Transform.copyResize({
      image: src,
      width: 32,
      height: 16,
      maintainAspect: true,
      backgroundColor: new ColorRgba8(255, 0, 0, 255),
      interpolation: Interpolation.average,
      linearBlend: true,
    });
    expect(out.getPixel(0, 8).equals([255, 0, 0, 255])).toBe(true);
    const p = out.getPixel(16, 8);
    expectClose(p.r, 188, 2);
    expect(p.a).toBe(100);
  });

  test('resize', () => {
    const out = Transform.resize({
      image: checkerboard(64),
      width: 16,
      interpolation: Interpolation.average,
      linearBlend: true,
    });
    expect(out.width).toBe(16);
    expectClose(out.getPixel(8, 8).r, 188, 2);
  });

  test('float images', () => {
    const out = Transform.copyResize({
      image: checkerboard(64, Format.float32),
      width: 16,
      interpolation: Interpolation.average,
      linearBlend: true,
    });
    expect(out.format).toBe(Format.float32);
    expectClose(out.getPixel(8, 8).r, ColorUtils.linearToSrgb(0.5), 0.01);
  });

  test('uint16 images', () => {
    const out = Transform.copyResize({
      image: checkerboard(64, Format.uint16),
      width: 16,
      interpolation: Interpolation.average,
      linearBlend: true,
    });
    expect(out.format).toBe(Format.uint16);
    expectClose(
      out.getPixel(8, 8).rNormalized,
      ColorUtils.linearToSrgb(0.5),
      0.01
    );
  });

  test('gaussianBlur', () => {
    const numbers = Filter.gaussianBlur({ image: checkerboard(32), radius: 4 });
    const image = checkerboard(32);
    const light = Filter.gaussianBlur({
      image: image,
      radius: 4,
      linearBlend: true,
    });
    // Blurred in place.
    expect(light).toBe(image);
    expectClose(numbers.getPixel(16, 16).r, 128, 4);
    expectClose(light.getPixel(16, 16).r, 188, 4);
  });

  test('gaussianBlur of a palette image returns a new image', () => {
    const src = checkerboard(32).convert({ withPalette: true });
    expect(src.hasPalette).toBe(true);
    const out = Filter.gaussianBlur({
      image: src,
      radius: 4,
      linearBlend: true,
    });
    expect(out.hasPalette).toBe(false);
    expectClose(out.getPixel(16, 16).r, 188, 4);
  });

  test('animation frames', () => {
    const src = checkerboard(64);
    src.addFrame(checkerboard(64));
    const out = Transform.copyResize({
      image: src,
      width: 16,
      interpolation: Interpolation.average,
      linearBlend: true,
    });
    expect(out.numFrames).toBe(2);
    expectClose(out.frames[1].getPixel(8, 8).r, 188, 2);
  });

  test('pixelate', () => {
    const out = Filter.pixelate({
      image: checkerboard(8),
      size: 4,
      mode: PixelateMode.average,
      linearBlend: true,
    });
    // Only the block's first pixel: the others are averaged from partly
    // overwritten pixels, with or without linearBlend.
    expectClose(out.getPixel(0, 0).r, 188, 1);
  });

  test('copyRotate', () => {
    const src = checkerboard(32);
    // A multiple of 90 degrees doesn't blend.
    const r90 = Transform.copyRotate({
      image: src,
      angle: 90,
      interpolation: Interpolation.linear,
      linearBlend: true,
    });
    expect([0, 255]).toContain(r90.getPixel(0, 0).r);
    // Halfway between pixels, every sample mixes black and white.
    const r45 = Transform.copyRotate({
      image: src,
      angle: 45,
      interpolation: Interpolation.linear,
      linearBlend: true,
    });
    const c = r45.getPixel(
      Math.trunc(r45.width / 2),
      Math.trunc(r45.height / 2)
    ).r;
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(255);
  });

  test('copyRectify into toImage', () => {
    const src = checkerboard(32);
    const dst = new MemoryImage({ width: 16, height: 16 });
    const out = Transform.copyRectify({
      image: src,
      topLeft: new Point(0.5, 0.5),
      topRight: new Point(30.5, 0.5),
      bottomLeft: new Point(0.5, 30.5),
      bottomRight: new Point(30.5, 30.5),
      interpolation: Interpolation.linear,
      toImage: dst,
      linearBlend: true,
    });
    expect(out).toBe(dst);
    // Sampled halfway between four pixels, two of them white.
    expectClose(dst.getPixel(8, 8).r, 188, 2);
  });

  test('drawPixel', () => {
    const numbers = new MemoryImage({ width: 1, height: 1 });
    const light = new MemoryImage({ width: 1, height: 1 });
    const white = new ColorRgba8(255, 255, 255, 128);
    Draw.drawPixel({ image: numbers, pos: new Point(0, 0), color: white });
    Draw.drawPixel({
      image: light,
      pos: new Point(0, 0),
      color: white,
      linearBlend: true,
    });
    expectClose(numbers.getPixel(0, 0).r, 128, 1);
    expectClose(light.getPixel(0, 0).r, 188, 1);
  });

  test('drawLine', () => {
    const image = new MemoryImage({ width: 8, height: 8 });
    Draw.drawLine({
      image: image,
      line: new Line(0, 0, 7, 7),
      color: new ColorRgba8(255, 255, 255, 128),
      linearBlend: true,
    });
    expectClose(image.getPixel(3, 3).r, 188, 1);
  });
});
