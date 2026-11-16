/** @format */

import { describe, expect, test } from 'vitest';
import {
  Format,
  Interpolation,
  MemoryImage,
  PaletteUint8,
  type Pixel,
  Transform,
} from '../../src';
import { TestSection } from '../_utils/test-section';
import {
  decodeTestImage,
  differingPixels,
} from '../_utils/transform-test-helpers';

/**
 * Creates a seeded pseudo random number generator.
 * @param {number} seed - The seed.
 * @returns {() => number} A random number generator in [0, 1).
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Creates a 16x16 palette image with 256 colors.
 * @param {number} paletteChannels - The number of palette channels.
 * @returns {MemoryImage} The palette image.
 */
function paletteImage(paletteChannels: number): MemoryImage {
  const image = new MemoryImage({
    width: 16,
    height: 16,
    numChannels: paletteChannels,
    withPalette: true,
  });
  for (let index = 0; index < 256; index++) {
    image.palette!.setRgba(
      index,
      index,
      255 - index,
      (index * 7) % 256,
      (index * 13) % 256
    );
  }

  for (const pixel of image) {
    pixel.index = pixel.y * 16 + pixel.x;
  }

  return image;
}

/**
 * Returns the colors of the palette image built by {@link paletteImage}.
 * @param {object} opt - Options.
 * @param {number} opt.channels - The number of output channels.
 * @param {number} [opt.alpha] - The alpha to use for a 3-channel palette.
 * @returns {number[]} The expected colors.
 */
function paletteColors({
  channels,
  alpha,
}: {
  channels: number;
  alpha?: number;
}): number[] {
  const colors: number[] = [];
  for (let index = 0; index < 256; index++) {
    colors.push(index, 255 - index, (index * 7) % 256);
    if (channels === 4) {
      colors.push(alpha ?? (index * 13) % 256);
    }
  }
  return colors;
}

/**
 * Palette conversion and iteration tests.
 */
describe('Image palette', () => {
  test('convert expands uint8 palette to RGB and RGBA', () => {
    const opaque = paletteImage(3);
    const translucent = paletteImage(4);

    expect([...opaque.convert({ numChannels: 3 }).toUint8Array()]).toEqual(
      paletteColors({ channels: 3 })
    );
    expect([...opaque.convert({ numChannels: 4 }).toUint8Array()]).toEqual(
      paletteColors({ channels: 4, alpha: 255 })
    );
    expect([
      ...opaque.convert({ numChannels: 4, alpha: 128 }).toUint8Array(),
    ]).toEqual(paletteColors({ channels: 4, alpha: 128 }));

    expect([...translucent.convert({ numChannels: 3 }).toUint8Array()]).toEqual(
      paletteColors({ channels: 3 })
    );
    expect([...translucent.convert({ numChannels: 4 }).toUint8Array()]).toEqual(
      paletteColors({ channels: 4 })
    );
  });

  test('convert of uint8 palette to 1 and 2 channels matches RGB source', () => {
    for (const paletteChannels of [3, 4]) {
      const indexed = paletteImage(paletteChannels);
      const direct = new MemoryImage({
        width: 16,
        height: 16,
        numChannels: 4,
      });
      direct.toUint8Array().set(
        paletteColors({
          channels: 4,
          alpha: paletteChannels === 3 ? 255 : undefined,
        })
      );
      const source =
        paletteChannels === 3 ? direct.convert({ numChannels: 3 }) : direct;

      for (const channels of [1, 2]) {
        expect([
          ...indexed.convert({ numChannels: channels }).toUint8Array(),
        ]).toEqual([
          ...source.convert({ numChannels: channels }).toUint8Array(),
        ]);
      }
    }
  });

  test('convert uses palette of every animation frame', () => {
    const animation = paletteImage(3);
    animation.frameDuration = 80;
    const second = paletteImage(3);
    second.frameDuration = 90;
    for (let index = 0; index < 256; index++) {
      second.palette!.setRgb(index, 255 - index, index, 7);
    }
    animation.addFrame(second);

    const converted = animation.convert({ numChannels: 4 });
    const first = converted.frames[0].getPixel(5, 0);
    const last = converted.frames[1].getPixel(5, 0);

    expect([first.r, first.g, first.b, first.a]).toEqual([5, 250, 35, 255]);
    expect([last.r, last.g, last.b, last.a]).toEqual([250, 5, 7, 255]);
    expect(converted.frames.map((frame) => frame.frameDuration)).toEqual([
      80, 90,
    ]);
  });

  test('convert of 16-color palette reads index 16 as black', () => {
    const palette = new PaletteUint8(16, 3);
    for (let index = 0; index < 16; index++) {
      palette.setRgb(index, 10 + index, 20 + index, 30 + index);
    }

    const image = new MemoryImage({ width: 3, height: 1, palette: palette });
    image.setPixelIndex(0, 0, 3);
    image.setPixelIndex(1, 0, 15);
    image.setPixelIndex(2, 0, 16);

    expect([...image.convert({ numChannels: 3 }).toUint8Array()]).toEqual([
      13, 23, 33, 25, 35, 45, 0, 0, 0,
    ]);
  });

  const paletteImages: [TestSection, string][] = [
    [TestSection.gif, 'animated.gif'],
    [TestSection.gif, 'anim_palette.gif'],
    [TestSection.gif, 'palette_remap.gif'],
    [TestSection.gif, 'buck_24.gif'],
    [TestSection.bmp, 'buck_8.bmp'],
    [TestSection.bmp, 'buck_4.bmp'],
    [TestSection.bmp, 'buck_1.bmp'],
    [TestSection.png, 'bkgd.png'],
    [TestSection.png, 'buck_8.png'],
    [TestSection.png, 'basn3p08.png'],
    [TestSection.png, 'basn3p02.png'],
    [TestSection.png, 'tbbn3p08.png'],
  ];

  for (const [section, name] of paletteImages) {
    test(`convert keeps color of every pixel of palette image ${name}`, () => {
      const source = decodeTestImage(section, name);
      expect(source.hasPalette).toBe(true);

      const opaque = source.convert({ format: Format.uint8, numChannels: 3 });
      const translucent = source.convert({
        format: Format.uint8,
        numChannels: 4,
      });

      expect(translucent.frames.map((frame) => frame.frameDuration)).toEqual(
        source.frames.map((frame) => frame.frameDuration)
      );
      expect(differingPixels(opaque, source, { withAlpha: false })).toBe(0);
      expect(differingPixels(translucent, source)).toBe(0);
    });
  }

  test('convert keeps pixels of palette image after in-place resize', () => {
    const source = decodeTestImage(TestSection.gif, 'buck_24.gif');
    const shrunk = Transform.resize({ image: source, width: 100 });
    const converted = shrunk.convert({ numChannels: 4 });

    expect([converted.width, converted.height]).toEqual([100, 62]);
    expect(differingPixels(converted, shrunk)).toBe(0);
  });

  for (const name of ['buck_1.bmp', 'buck_4.bmp', 'basn3p02.png']) {
    test(`pixel alpha of 3-channel palette image ${name} is opaque`, () => {
      const section = name.endsWith('.bmp') ? TestSection.bmp : TestSection.png;
      const source = decodeTestImage(section, name);
      expect(source.palette!.numChannels).toBe(3);

      for (const pixel of source) {
        if (pixel.a !== 255) {
          throw new Error(`alpha ${pixel.a} at ${pixel.x},${pixel.y}`);
        }
      }
    });
  }

  for (const format of [Format.uint1, Format.uint2, Format.uint4]) {
    test(`iteration over ${Format[format]} image matches getPixel after in-place resize`, () => {
      const mismatches: string[] = [];
      for (let channels = 1; channels <= 4; channels++) {
        for (let width = 3; width <= 30; width++) {
          const source = new MemoryImage({
            width: width,
            height: 6,
            format: format,
            numChannels: channels,
          });
          const range = source.maxChannelValue + 1;
          for (let y = 0; y < 6; y++) {
            for (let x = 0; x < width; x++) {
              const pixel = source.getPixel(x, y);
              for (let channel = 0; channel < channels; channel++) {
                pixel.setChannel(channel, (x * 5 + y * 3 + channel) % range);
              }
            }
          }

          const shrunk = Transform.resize({
            image: source,
            width: 1 + Math.floor((width * 2) / 3),
            height: 4,
          });
          let isSame = true;
          for (const pixel of shrunk) {
            const direct = shrunk.getPixel(pixel.x, pixel.y);
            for (let channel = 0; channel < channels; channel++) {
              isSame =
                isSame &&
                pixel.getChannel(channel) === direct.getChannel(channel);
            }
          }

          if (!isSame) {
            mismatches.push(`${channels} channels, width ${width}`);
          }
        }
      }

      expect(mismatches).toEqual([]);
    });
  }

  for (const format of [Format.uint1, Format.uint2, Format.uint4]) {
    test(`iteration over ${Format[format]} image matches getPixel`, () => {
      const mismatches: string[] = [];
      for (let channels = 1; channels <= 4; channels++) {
        for (let width = 1; width <= 40; width++) {
          const written = new MemoryImage({
            width: width,
            height: 5,
            format: format,
            numChannels: channels,
          });
          const range = written.maxChannelValue + 1;
          for (const pixel of written) {
            for (let channel = 0; channel < channels; channel++) {
              pixel.setChannel(
                channel,
                (pixel.x * 7 + pixel.y * 3 + channel) % range
              );
            }
          }

          const readChannel = (pixel: Pixel, channel: number): number =>
            channels === 2 && channel === 1
              ? pixel.a
              : pixel.getChannel(channel);

          let isSame = true;
          for (const pixel of written) {
            const direct = written.getPixel(pixel.x, pixel.y);
            for (let channel = 0; channel < channels; channel++) {
              const expected = (pixel.x * 7 + pixel.y * 3 + channel) % range;
              isSame =
                isSame &&
                readChannel(pixel, channel) === expected &&
                readChannel(direct, channel) === expected;
            }
          }

          if (!isSame) {
            mismatches.push(`${channels} channels, width ${width}`);
          }
        }
      }

      expect(mismatches).toEqual([]);
    });
  }

  for (const name of ['buck_1.bmp', 'basn3p02.png', 'buck_4.bmp']) {
    test(`iteration over ${name} matches getPixel after in-place resize`, () => {
      const section = name.endsWith('.bmp') ? TestSection.bmp : TestSection.png;
      const source = decodeTestImage(section, name);
      const expected = Transform.copyResize({
        image: source,
        width: Math.floor((source.width * 2) / 3),
      });
      const shrunk = Transform.resize({
        image: source,
        width: Math.floor((source.width * 2) / 3),
      });

      expect(shrunk).toBe(source);
      expect(differingPixels(shrunk, expected)).toBe(0);

      const indices: number[] = [];
      for (const pixel of shrunk) {
        indices.push(pixel.index);
      }
      const byPosition: number[] = [];
      for (let y = 0; y < shrunk.height; y++) {
        for (let x = 0; x < shrunk.width; x++) {
          byPosition.push(shrunk.getPixelIndex(x, y));
        }
      }
      expect(indices).toEqual(byPosition);
    });
  }

  test('float cubic with mixed alpha keeps colors near the taps', () => {
    const random = seededRandom(7);
    let worst = 0;
    for (let t = 0; t < 300; t++) {
      const image = new MemoryImage({
        width: 4,
        height: 4,
        format: Format.float32,
        numChannels: 4,
      });
      for (const p of image) {
        p.r = random();
        p.g = random();
        p.b = random();
        p.a = random() < 0.7 ? 0 : random() * 0.05;
      }
      for (let k = 0; k < 20; k++) {
        const c = image.getPixelCubic(1 + random(), 1 + random());
        worst = Math.max(worst, Math.abs(c.r), Math.abs(c.g), Math.abs(c.b));
      }
    }
    expect(worst).toBeLessThan(1.5);
  });

  for (const format of [Format.uint8, Format.uint16]) {
    test(`${Format[format]} cubic with mixed alpha keeps colors within range of visible pixels`, () => {
      const random = seededRandom(7);
      const outside: string[] = [];
      for (let round = 0; round < 300; round++) {
        const image = new MemoryImage({
          width: 4,
          height: 4,
          format: format,
          numChannels: 4,
        });
        const top = image.maxChannelValue;
        const lowest = Math.floor(top / 2);
        const highest = lowest + Math.floor(top / 8);

        for (const pixel of image) {
          const isHidden = random() < 0.7;
          const alpha = isHidden ? 0 : 1 + Math.floor(random() * (top / 20));
          const color = isHidden
            ? Math.floor(random() * (top + 1))
            : lowest + Math.floor(random() * (Math.floor(top / 8) + 1));

          pixel.setRgba(color, color, color, alpha);
        }

        const verify = (color: { a: number; r: number }): void => {
          if (color.a > 0 && (color.r < lowest || color.r > highest)) {
            outside.push(`round ${round}: ${color.r} with alpha ${color.a}`);
          }
        };

        for (let index = 0; index < 20; index++) {
          verify(image.getPixelCubic(1 + random(), 1 + random()));
        }

        for (const pixel of Transform.copyResize({
          image: image,
          width: 11,
          interpolation: Interpolation.cubic,
        })) {
          verify(pixel);
        }
      }

      expect(outside).toEqual([]);
    });
  }

  for (const format of [Format.int8, Format.float32]) {
    test(`${Format[format]} cubic with negative alpha keeps colors finite`, () => {
      const image = new MemoryImage({
        width: 4,
        height: 4,
        format: format,
        numChannels: 4,
      });
      for (const pixel of image) {
        pixel.setRgba(10, 10, 10, 0);
      }

      const alpha = format === Format.int8 ? -100 : -0.5;
      image.getPixel(0, 1).a = alpha;
      image.getPixel(0, 2).a = alpha;

      const color = image.getPixelCubic(1.5, 1.5);
      expect(color.a).toBeGreaterThan(0);
      expect(color.r).toBe(10);
    });
  }
});
