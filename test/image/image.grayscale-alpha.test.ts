/** @format */

import { describe, expect, test } from 'vitest';
import {
  Channel,
  ColorFloat16,
  ColorFloat32,
  ColorFloat64,
  ColorInt8,
  ColorInt16,
  ColorInt32,
  ColorRgba8,
  ColorUint1,
  ColorUint2,
  ColorUint4,
  ColorUint8,
  ColorUint16,
  ColorUint32,
  decodeBmp,
  decodePng,
  encodeBmp,
  encodePng,
  FlipDirection,
  Format,
  Interpolation,
  MemoryImage,
  Rectangle,
  Transform,
  type Color,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * A two channel image is grayscale+alpha: channel 0 is the gray sample and
 * channel 1 is alpha. `r`, `g` and `b` all read and write the gray sample, and
 * `a` reads and writes alpha, for every format.
 */
const formats = [
  Format.uint1,
  Format.uint2,
  Format.uint4,
  Format.uint8,
  Format.uint16,
  Format.uint32,
  Format.int8,
  Format.int16,
  Format.int32,
  Format.float16,
  Format.float32,
  Format.float64,
];

/**
 * A gray and an alpha value that are distinct in the given format, so that
 * writing one where the other belongs is visible.
 */
function samples(format: Format): { gray: number; alpha: number } {
  switch (format) {
    case Format.uint1:
      return { gray: 0, alpha: 1 };
    case Format.float16:
    case Format.float32:
    case Format.float64:
      return { gray: 0.25, alpha: 1.0 };
    default:
      return { gray: 1, alpha: 2 };
  }
}

/**
 * Builds a 2 channel grayscale+alpha image.
 */
function grayAlpha(format: Format, width = 8, height = 8): MemoryImage {
  const image = new MemoryImage({
    width: width,
    height: height,
    format: format,
    numChannels: 2,
  });
  const s = samples(format);
  for (const p of image) {
    p.r = s.gray;
    p.a = s.alpha;
  }
  return image;
}

/**
 * Asserts that every pixel keeps its gray and alpha samples.
 */
function expectGrayAlpha(image: MemoryImage, format: Format, reason: string) {
  const s = samples(format);
  for (const p of image) {
    expect(p.r, `${reason}: gray at ${p.x},${p.y}`).toBe(s.gray);
    expect(p.a, `${reason}: alpha at ${p.x},${p.y}`).toBe(s.alpha);
  }
}

/**
 * Creates a new, empty Color of the given format with numChannels channels.
 */
function color(format: Format, numChannels: number): Color {
  switch (format) {
    case Format.uint1:
      return new ColorUint1(numChannels);
    case Format.uint2:
      return new ColorUint2(numChannels);
    case Format.uint4:
      return new ColorUint4(numChannels);
    case Format.uint8:
      return new ColorUint8(numChannels);
    case Format.uint16:
      return new ColorUint16(numChannels);
    case Format.uint32:
      return new ColorUint32(numChannels);
    case Format.int8:
      return new ColorInt8(numChannels);
    case Format.int16:
      return new ColorInt16(numChannels);
    case Format.int32:
      return new ColorInt32(numChannels);
    case Format.float16:
      return new ColorFloat16(numChannels);
    case Format.float32:
      return new ColorFloat32(numChannels);
    case Format.float64:
      return new ColorFloat64(numChannels);
  }
  throw new Error('Unknown format');
}

/**
 * Grayscale+alpha channel handling.
 */
describe('MemoryImage', () => {
  describe('grayscale+alpha', () => {
    for (const format of formats) {
      describe(Format[format], () => {
        const s = samples(format);

        test('r, g and b are the gray sample; a is channel 1', () => {
          const image = grayAlpha(format, 1, 1);
          const p = image.getPixel(0, 0);
          expect(p.r).toBe(s.gray);
          expect(p.g).toBe(s.gray);
          expect(p.b).toBe(s.gray);
          expect(p.a).toBe(s.alpha);
          expect(p.toArray()).toEqual([s.gray, s.alpha]);
        });

        test('setRgba writes gray and alpha', () => {
          const image = new MemoryImage({
            width: 1,
            height: 1,
            format: format,
            numChannels: 2,
          });
          image.getPixel(0, 0).setRgba(s.gray, 0, 0, s.alpha);
          const p = image.getPixel(0, 0);
          expect([p.r, p.a]).toEqual([s.gray, s.alpha]);
        });

        test('setPixelRgba writes gray and alpha', () => {
          const image = new MemoryImage({
            width: 1,
            height: 1,
            format: format,
            numChannels: 2,
          });
          image.setPixelRgba(0, 0, s.gray, 0, 0, s.alpha);
          const p = image.getPixel(0, 0);
          expect([p.r, p.a]).toEqual([s.gray, s.alpha]);
        });

        test('setRgb leaves alpha alone', () => {
          const image = grayAlpha(format, 1, 1);
          image.getPixel(0, 0).setRgb(0, s.alpha, s.alpha);
          const p = image.getPixel(0, 0);
          expect([p.r, p.a]).toEqual([0, s.alpha]);
        });

        test('setPixelRgb leaves alpha alone', () => {
          const image = grayAlpha(format, 1, 1);
          image.setPixelRgb(0, 0, 0, s.alpha, s.alpha);
          const p = image.getPixel(0, 0);
          expect([p.r, p.a]).toEqual([0, s.alpha]);
        });

        test('luminance is the gray sample', () => {
          const image = grayAlpha(format, 1, 1);
          expect(image.getPixel(0, 0).luminance).toBe(s.gray);
        });

        for (const interpolation of [
          Interpolation.nearest,
          Interpolation.linear,
          Interpolation.cubic,
          Interpolation.average,
        ]) {
          test(`copyResize preserves alpha (${Interpolation[interpolation]})`, () => {
            const resized = Transform.copyResize({
              image: grayAlpha(format),
              width: 4,
              interpolation: interpolation,
            });
            expectGrayAlpha(resized, format, 'copyResize');
          });
        }

        test('getChannel agrees with r, g, b and a', () => {
          const p = grayAlpha(format, 1, 1).getPixel(0, 0);
          expect(p.getChannel(Channel.red)).toBe(p.r);
          expect(p.getChannel(Channel.green)).toBe(p.g);
          expect(p.getChannel(Channel.blue)).toBe(p.b);
          expect(p.getChannel(Channel.alpha)).toBe(p.a);
          expect(p.getChannel(Channel.luminance)).toBe(s.gray);
        });

        test('resize preserves alpha', () => {
          const resized = Transform.resize({
            image: grayAlpha(format),
            width: 4,
          });
          expectGrayAlpha(resized, format, 'resize');
        });

        test('copyRotate preserves alpha', () => {
          const rotated = Transform.copyRotate({
            image: grayAlpha(format),
            angle: 90,
          });
          expectGrayAlpha(rotated, format, 'copyRotate');
        });

        test('copyCrop preserves alpha', () => {
          const cropped = Transform.copyCrop({
            image: grayAlpha(format),
            rect: Rectangle.fromXYWH(1, 1, 4, 4),
          });
          expectGrayAlpha(cropped, format, 'copyCrop');
        });

        test('copyFlip preserves alpha', () => {
          const flipped = Transform.copyFlip({
            image: grayAlpha(format),
            direction: FlipDirection.horizontal,
          });
          expectGrayAlpha(flipped, format, 'copyFlip');
        });

        test('a 2 channel Color reads as gray+alpha', () => {
          const c = color(format, 2);
          c.r = s.gray;
          c.a = s.alpha;
          expect(c.r).toBe(s.gray);
          expect(c.g).toBe(s.gray);
          expect(c.b).toBe(s.gray);
          expect(c.a).toBe(s.alpha);
          expect(c.luminance).toBe(s.gray);
          expect(c.getChannel(Channel.green)).toBe(s.gray);
          expect(c.getChannel(Channel.alpha)).toBe(s.alpha);
          expect(c.toArray()).toEqual([s.gray, s.alpha]);
        });

        test('Color.setRgba writes gray and alpha', () => {
          const c = color(format, 2);
          c.setRgba(s.gray, 0, 0, s.alpha);
          expect([c.r, c.a]).toEqual([s.gray, s.alpha]);
        });

        test('Color.setRgb leaves alpha alone', () => {
          const c = color(format, 2);
          c.a = s.alpha;
          c.setRgb(0, s.alpha, s.alpha);
          expect([c.r, c.a]).toEqual([0, s.alpha]);
        });
      });
    }

    test('clear fills alpha, not the background green', () => {
      const image = new MemoryImage({ width: 4, height: 4, numChannels: 2 });
      image.clear(new ColorRgba8(12, 34, 56, 200));
      for (const p of image) {
        expect(p.r).toBe(12);
        expect(p.a).toBe(200);
      }
    });

    test('copyResize letterbox padding keeps the background alpha', () => {
      const resized = Transform.copyResize({
        image: grayAlpha(Format.uint8, 8, 4),
        width: 8,
        height: 8,
        maintainAspect: true,
        backgroundColor: new ColorRgba8(0, 0, 0, 255),
      });
      expect(resized.getPixel(0, 0).a).toBe(255);
      expect(resized.getPixel(0, 0).r).toBe(0);
    });

    test('a wider color converts to gray+alpha, not red+green', () => {
      const c = new ColorRgba8(10, 200, 30, 128).convert({ numChannels: 2 });
      expect(c.length).toBe(2);
      expect(c.a).toBe(128);
      expect(c.r).toBe(Math.floor(new ColorRgba8(10, 200, 30, 128).luminance));
    });

    test('cubic resampling keeps float samples', () => {
      for (const nc of [2, 3, 4]) {
        const image = new MemoryImage({
          width: 8,
          height: 8,
          format: Format.float32,
          numChannels: nc,
        });
        for (const p of image) {
          p.r = 0.25;
          p.g = 0.25;
          p.b = 0.25;
        }
        const resized = Transform.copyResize({
          image: image,
          width: 4,
          interpolation: Interpolation.cubic,
        });
        expect(resized.getPixel(0, 0).r, `numChannels ${nc}`).toBeCloseTo(
          0.25,
          6
        );
      }
    });

    test('bmp keeps the alpha of a grayscale+alpha image', () => {
      const image = new MemoryImage({ width: 4, height: 4, numChannels: 2 });
      for (const p of image) {
        p.r = 100;
        p.a = 200;
      }
      const decoded = decodeBmp({ data: encodeBmp({ image: image }) })!;
      const p = decoded.getPixel(0, 0);
      expect(p.r).toBe(100);
      expect(p.a).toBe(200);
    });

    test('png grayscale+alpha round trips', () => {
      const png = decodePng({
        data: TestUtils.readFromFile(
          TestFolder.input,
          TestSection.png,
          'png_LA.png'
        ),
      })!;
      expect(png.numChannels).toBe(2);

      const encoded = encodePng({ image: png });
      const decoded = decodePng({ data: encoded })!;
      expect(decoded.numChannels).toBe(2);
      for (const p of png) {
        const p2 = decoded.getPixel(p.x, p.y);
        expect(p2.r, `gray at ${p.x},${p.y}`).toBe(p.r);
        expect(p2.a, `alpha at ${p.x},${p.y}`).toBe(p.a);
      }

      let transparent = 0;
      for (const p of png) {
        if (p.a === 0) {
          transparent++;
        }
      }
      expect(transparent).toBeGreaterThan(0);
      expect(transparent).toBeLessThan(png.width * png.height);
    });
  });
});
