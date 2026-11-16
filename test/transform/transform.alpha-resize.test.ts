/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgba8,
  Format,
  Interpolation,
  MemoryImage,
  MemoryImageDataUint16,
  Transform,
} from '../../src';
import { TestSection } from '../_utils/test-section';
import {
  alphaWeightedAverage,
  decodeTestImage,
  differingPixels,
  hiddenColorPixels,
  visibleDifferences,
  withHiddenColorChanged,
} from '../_utils/transform-test-helpers';

const blending = [
  Interpolation.linear,
  Interpolation.cubic,
  Interpolation.average,
];

/**
 * Alpha-weighted copyResize and resize tests.
 */
describe('Transform alpha resize', () => {
  test('copyResize average weights color by alpha in mixed-alpha blocks', () => {
    const source = new MemoryImage({ width: 4, height: 2, numChannels: 4 });
    for (const pixel of source) {
      if (pixel.x % 2 === 0) {
        pixel.setRgba(255, 0, 0, 255);
      } else {
        pixel.setRgba(255, 255, 0, 0);
      }
    }

    const resized = Transform.copyResize({
      image: source,
      width: 2,
      interpolation: Interpolation.average,
    });

    expect([...resized.toUint8Array()]).toEqual([
      255, 0, 0, 127, 255, 0, 0, 127,
    ]);
  });

  test('copyResize average weights gray by alpha in 2-channel image', () => {
    const source = new MemoryImage({ width: 4, height: 2, numChannels: 2 });
    const values: number[] = [];
    for (let pair = 0; pair < 4; pair++) {
      values.push(200, 255, 40, 0);
    }
    source.toUint8Array().set(values);

    const resized = Transform.copyResize({
      image: source,
      width: 2,
      interpolation: Interpolation.average,
    });

    expect([...resized.toUint8Array()]).toEqual([200, 127, 200, 127]);
  });

  test('copyResize average weights color by alpha in uint16 image', () => {
    const source = new MemoryImage({
      width: 4,
      height: 2,
      format: Format.uint16,
      numChannels: 4,
    });
    for (const pixel of source) {
      if (pixel.x % 2 === 0) {
        pixel.setRgba(65535, 0, 0, 65535);
      } else {
        pixel.setRgba(65535, 65535, 0, 0);
      }
    }

    const resized = Transform.copyResize({
      image: source,
      width: 2,
      interpolation: Interpolation.average,
    });

    for (const pixel of resized) {
      expect([pixel.r, pixel.g, pixel.b, pixel.a]).toEqual([
        65535, 0, 0, 32767,
      ]);
    }
  });

  test('copyResize average weights color by alpha in large blocks', () => {
    const source = new MemoryImage({ width: 400, height: 200, numChannels: 4 });
    for (const pixel of source) {
      if (pixel.x % 8 === 0) {
        pixel.setRgba(255, 0, 255, 0);
      } else {
        pixel.setRgba(255, 255, 255, 255);
      }
    }

    const resized = Transform.copyResize({
      image: source,
      width: 2,
      interpolation: Interpolation.average,
    });

    expect([...resized.toUint8Array()]).toEqual([
      255, 255, 255, 223, 255, 255, 255, 223,
    ]);
  });

  test('copyResize average keeps unweighted mean in blocks of 1 alpha value', () => {
    const alphas = [255, 128, 0, 77];
    const source = new MemoryImage({ width: 8, height: 2, numChannels: 4 });
    for (const pixel of source) {
      pixel.setRgba(
        pixel.x * 31 + pixel.y * 7,
        255 - pixel.x * 30,
        pixel.y * 200 + pixel.x,
        alphas[Math.floor(pixel.x / 2)]
      );
    }

    const resized = Transform.copyResize({
      image: source,
      width: 4,
      interpolation: Interpolation.average,
    });

    const sourceBytes = source.toUint8Array();
    const expected: number[] = [];
    for (let block = 0; block < 4; block++) {
      for (let channel = 0; channel < 4; channel++) {
        let sum = 0;
        for (const column of [block * 2, block * 2 + 1]) {
          sum += sourceBytes[column * 4 + channel];
          sum += sourceBytes[(8 + column) * 4 + channel];
        }

        expected.push(Math.trunc(sum * (1.0 / 4)));
      }
    }

    expect([...resized.toUint8Array()]).toEqual(expected);
  });

  test('copyResize average with EXIF orientation weights color by alpha', () => {
    for (let orientation = 2; orientation <= 8; orientation++) {
      const source = new MemoryImage({ width: 8, height: 6, numChannels: 4 });
      for (const pixel of source) {
        pixel.setRgba(
          pixel.x * 30,
          pixel.y * 40,
          255 - pixel.x * 9,
          ((pixel.x * 7 + pixel.y * 5) % 3) * 100
        );
      }
      source.exifData.imageIfd.orientation = orientation;

      const width = orientation < 5 ? 4 : 3;
      const expected = Transform.copyResize({
        image: Transform.bakeOrientation({ image: source }),
        width: width,
        interpolation: Interpolation.average,
      });
      const resized = Transform.copyResize({
        image: source,
        width: width,
        interpolation: Interpolation.average,
      });

      expect([...resized.toUint8Array()]).toEqual([...expected.toUint8Array()]);
    }
  });

  const transparentImages: [TestSection, string][] = [
    [TestSection.gif, 'animated.gif'],
    [TestSection.png, 'alpha_edge.png'],
    [TestSection.apng, 'test_apng1.png'],
    [TestSection.apng, 'test_apng3.png'],
    [TestSection.webp, 'animated_transparency.webp'],
    [TestSection.bmp, 'rgba32.bmp'],
  ];

  for (const [section, name] of transparentImages) {
    test(`copyResize average takes color from visible pixels of ${name}`, () => {
      const decoded = decodeTestImage(section, name);
      const source = decoded.hasPalette
        ? decoded.convert({ numChannels: 4 })
        : decoded;
      const resized = Transform.copyResize({
        image: source,
        width: 1 + Math.floor((source.width * 37) / 100),
        interpolation: Interpolation.average,
      });

      expect(hiddenColorPixels(source, resized)).toBe(0);
    });
  }

  const weightedImages: [TestSection, string][] = [
    [TestSection.gif, 'animated.gif'],
    [TestSection.png, 'alpha_edge.png'],
    [TestSection.png, 'basi4a08.png'],
    [TestSection.png, 'basn6a08.png'],
    [TestSection.png, 'basn6a16.png'],
    [TestSection.apng, 'test_apng1.png'],
    [TestSection.png, 'buck_24.png'],
  ];

  for (const [section, name] of weightedImages) {
    test(`copyResize average matches alpha-weighted mean of ${name}`, () => {
      const decoded = decodeTestImage(section, name);
      const source = decoded.hasPalette
        ? decoded.convert({ numChannels: 4 })
        : decoded;

      for (const percent of [37, 50, 170]) {
        const width = 1 + Math.floor((source.width * percent) / 100);
        const resized = Transform.copyResize({
          image: source,
          width: width,
          interpolation: Interpolation.average,
        });
        const expected = alphaWeightedAverage(
          source,
          resized.width,
          resized.height
        );

        expect(differingPixels(resized, expected)).toBe(0);
      }
    });
  }

  for (const format of [Format.uint8, Format.uint16]) {
    test(`copyResize average keeps solid ${Format[format]} color`, () => {
      const changed: string[] = [];
      for (let block = 2; block <= 12; block++) {
        for (let value = 1; value <= 255; value++) {
          const source = new MemoryImage({
            width: block * 2,
            height: block * 2,
            format: format,
            numChannels: 4,
          });
          for (const pixel of source) {
            pixel.setRgba(value, value, value, value);
          }

          const resized = Transform.copyResize({
            image: source,
            width: 2,
            height: 2,
            interpolation: Interpolation.average,
          });
          const pixel = resized.getPixel(1, 1);

          if (pixel.r !== value || pixel.a !== value) {
            changed.push(`${value} in ${block}x${block} block`);
          }
        }
      }

      expect(changed).toEqual([]);
    });
  }

  const sameImages: [TestSection, string][] = [
    [TestSection.png, 'buck_24.png'],
    [TestSection.png, 'alpha_edge.png'],
    [TestSection.png, 'basn6a16.png'],
    [TestSection.png, 'basi4a08.png'],
    [TestSection.gif, 'animated.gif'],
  ];

  for (const [section, name] of sameImages) {
    test(`resize average gives same pixels as copyResize for ${name}`, () => {
      const decoded = decodeTestImage(section, name);
      const source = decoded.hasPalette
        ? decoded.convert({ numChannels: 4 })
        : decoded;

      for (const percent of [13, 37, 50, 88]) {
        const width = 1 + Math.floor((source.width * percent) / 100);
        const copied = Transform.copyResize({
          image: source,
          width: width,
          interpolation: Interpolation.average,
        });
        const inPlace = Transform.resize({
          image: source.clone(),
          width: width,
          interpolation: Interpolation.average,
        });

        expect(differingPixels(inPlace, copied)).toBe(0);
      }
    });
  }

  for (const [section, name] of transparentImages) {
    for (const interpolation of blending) {
      test(`color of transparent pixels of ${name} has no effect on ${Interpolation[interpolation]} copyResize and resize`, () => {
        const decoded = decodeTestImage(section, name);
        const source = decoded.hasPalette
          ? decoded.convert({ numChannels: 4 })
          : decoded;
        const changed = withHiddenColorChanged(source);

        for (const percent of [37, 50, 170]) {
          const width = 1 + Math.floor((source.width * percent) / 100);
          const copied = Transform.copyResize({
            image: source,
            width: width,
            interpolation: interpolation,
          });
          const inPlace = Transform.resize({
            image: source.clone(),
            width: width,
            interpolation: interpolation,
          });

          expect(
            visibleDifferences(
              Transform.copyResize({
                image: changed,
                width: width,
                interpolation: interpolation,
              }),
              copied
            )
          ).toBe(0);
          expect(
            visibleDifferences(
              Transform.resize({
                image: changed.clone(),
                width: width,
                interpolation: interpolation,
              }),
              inPlace
            )
          ).toBe(0);
          expect(differingPixels(inPlace, copied)).toBe(0);
        }
      });
    }
  }

  for (const format of [Format.uint8, Format.uint16, Format.float32]) {
    for (const interpolation of blending) {
      test(`${Interpolation[interpolation]} copyResize keeps solid ${Format[format]} color with mixed alpha`, () => {
        const source = new MemoryImage({
          width: 13,
          height: 9,
          format: format,
          numChannels: 4,
        });
        const opaque = source.maxChannelValue;
        const color = format === Format.float32 ? 0.25 : Math.floor(opaque / 3);
        for (const pixel of source) {
          pixel.setRgba(
            color,
            color,
            color,
            (pixel.x * 5 + pixel.y * 3) % 4 === 0 ? 0 : opaque
          );
        }

        for (const width of [5, 13, 31]) {
          const resized = Transform.copyResize({
            image: source,
            width: width,
            interpolation: interpolation,
          });

          for (const pixel of resized) {
            if (pixel.a > 0 && (pixel.r !== color || pixel.b !== color)) {
              throw new Error(
                `${pixel.r} at ${pixel.x},${pixel.y} of width ${width}`
              );
            }
          }
        }
      });
    }
  }

  for (const [format, value] of [
    [Format.uint8, 200],
    [Format.uint16, 40000],
    [Format.float32, 0.5],
  ] as [Format, number][]) {
    test(`getPixelLinear and getPixelCubic of ${Format[format]} image without alpha channel blend taps outside image as 0`, () => {
      const source = new MemoryImage({ width: 4, height: 4, format: format });
      for (const pixel of source) {
        pixel.setRgb(value, value, value);
      }

      const linear = source.getPixelLinear(-0.5, 1);
      const cubic = source.getPixelCubic(-0.5, 1);

      expect(linear.r).toBe(value / 2);
      expect(cubic.r).toBe(value / 2);
    });
  }

  test('linear copyResize gives color of only weighted tap exactly', () => {
    const changed: string[] = [];
    for (let color = 0; color < 256; color += 5) {
      for (let alpha = 1; alpha < 256; alpha += 7) {
        const source = new MemoryImage({ width: 2, height: 2, numChannels: 4 });
        source.setPixelRgba(0, 0, 255 - color, 9, 9, 0);
        source.setPixelRgba(1, 0, 255 - color, 9, 9, 255);
        source.setPixelRgba(0, 1, color, color, color, alpha);
        source.setPixelRgba(1, 1, 255 - color, 9, 9, 0);

        for (const height of [3, 5, 7, 9, 13]) {
          const resized = Transform.copyResize({
            image: source,
            width: 2,
            height: height,
            interpolation: Interpolation.linear,
          });

          for (let y = 0; y < height; y++) {
            const pixel = resized.getPixel(0, y);
            if (pixel.a > 0 && pixel.r !== color) {
              changed.push(
                `${color} with alpha ${alpha} at row ${y} of ${height}`
              );
            }
          }
        }
      }
    }

    expect(changed).toEqual([]);
  });

  for (const format of [Format.uint16, Format.uint32]) {
    test(`cubic copyResize of ${Format[format]} does not wrap overshoot`, () => {
      const source = new MemoryImage({
        width: 4,
        height: 1,
        format: format,
        numChannels: 1,
      });
      const highest = source.maxChannelValue;
      source.setPixelRgb(0, 0, highest, 0, 0);
      source.setPixelRgb(1, 0, highest, 0, 0);

      const resized = Transform.copyResize({
        image: source,
        width: 9,
        height: 1,
        interpolation: Interpolation.cubic,
      });
      const values: number[] = [];
      for (const pixel of resized) {
        values.push(pixel.r);
      }

      expect(values[0]).toBe(highest);
      expect(values[values.length - 1]).toBe(0);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
      }
    });
  }

  for (const interpolation of [
    Interpolation.nearest,
    Interpolation.linear,
    Interpolation.cubic,
    Interpolation.average,
  ]) {
    test(`resize ${Interpolation[interpolation]} with backgroundColor keeps pixels when maintainAspect adds no padding`, () => {
      const source = new MemoryImage({ width: 8, height: 4, numChannels: 4 });
      for (const pixel of source) {
        pixel.setRgba(pixel.x * 30, pixel.y * 60, 200 - pixel.x * 20, 255);
      }

      const expected = Transform.copyResize({
        image: source,
        width: 4,
        height: 2,
        maintainAspect: true,
        backgroundColor: new ColorRgba8(255, 0, 0, 255),
        interpolation: interpolation,
      });
      const resized = Transform.resize({
        image: source.clone(),
        width: 4,
        height: 2,
        maintainAspect: true,
        backgroundColor: new ColorRgba8(255, 0, 0, 255),
        interpolation: interpolation,
      });

      expect([...resized.toUint8Array()].slice(0, 32)).toEqual([
        ...expected.toUint8Array(),
      ]);
      expect(resized.getPixel(3, 1).b).not.toBe(0);
    });
  }

  const resizeImages: [TestSection, string][] = [
    [TestSection.tiff, 'CNSW_crop.tif'],
    [TestSection.bmp, 'buck_24.bmp'],
    [TestSection.png, 'buck_8.png'],
    [TestSection.bmp, 'buck_4.bmp'],
    [TestSection.png, 'basn6a16.png'],
  ];

  for (const [section, name] of resizeImages) {
    test(`resize gives same pixels as copyResize for ${name}`, () => {
      const source = decodeTestImage(section, name);

      for (const interpolation of [
        Interpolation.nearest,
        Interpolation.linear,
        Interpolation.cubic,
        Interpolation.average,
      ]) {
        for (const percent of [37, 50, 61]) {
          const width = 1 + Math.floor((source.width * percent) / 100);
          const copied = Transform.copyResize({
            image: source,
            width: width,
            interpolation: interpolation,
          });
          const inPlace = Transform.resize({
            image: source.clone(),
            width: width,
            interpolation: interpolation,
          });

          expect(differingPixels(inPlace, copied)).toBe(0);
        }
      }
    });
  }

  test('pixel index of 16-bit palette image is palette index', () => {
    const source = decodeTestImage(TestSection.tiff, 'CNSW_crop.tif');
    expect(source.format).toBe(Format.uint16);
    expect(source.hasPalette).toBe(true);

    const indices = (source.data as MemoryImageDataUint16).data;
    let mismatches = 0;
    for (const pixel of source) {
      const expected = indices[pixel.y * source.width + pixel.x];
      if (
        pixel.index !== expected ||
        source.getPixelIndex(pixel.x, pixel.y) !== expected ||
        pixel.r !== source.palette!.getRed(expected)
      ) {
        mismatches++;
      }
    }

    expect(mismatches).toBe(0);
  });

  for (const format of [
    Format.uint8,
    Format.uint16,
    Format.float32,
    Format.uint4,
  ]) {
    test(`resize nearest of ${Format[format]} reads same pixels as copyResize`, () => {
      const mismatches: string[] = [];
      for (let height = 2; height <= 40; height++) {
        const source = new MemoryImage({
          width: height,
          height: height,
          format: format,
        });
        for (const pixel of source) {
          pixel.setRgb(pixel.y % 16, Math.floor(pixel.y / 16), pixel.x % 16);
        }

        for (let target = 1; target < height; target++) {
          const copied = Transform.copyResize({
            image: source,
            height: target,
          });
          const inPlace = Transform.resize({
            image: source.clone(),
            height: target,
          });
          if (differingPixels(inPlace, copied) !== 0) {
            mismatches.push(`${height} to ${target}`);
          }
        }
      }

      expect(mismatches).toEqual([]);
    });
  }

  for (const format of [Format.uint8, Format.uint16]) {
    test(`resize average weights ${Format[format]} color by alpha`, () => {
      const opaque = format === Format.uint8 ? 255 : 65535;
      const source = new MemoryImage({
        width: 4,
        height: 2,
        format: format,
        numChannels: 4,
      });
      for (const pixel of source) {
        if (pixel.x % 2 === 0) {
          pixel.setRgba(opaque, 0, 0, opaque);
        } else {
          pixel.setRgba(opaque, opaque, 0, 0);
        }
      }

      const resized = Transform.resize({
        image: source,
        width: 2,
        interpolation: Interpolation.average,
      });

      for (const pixel of resized) {
        expect([pixel.r, pixel.g, pixel.b, pixel.a]).toEqual([
          opaque,
          0,
          0,
          Math.floor(opaque / 2),
        ]);
      }
    });
  }

  const resizeHiddenImages: [TestSection, string][] = [
    [TestSection.gif, 'animated.gif'],
    [TestSection.png, 'alpha_edge.png'],
    [TestSection.apng, 'test_apng1.png'],
    [TestSection.webp, 'animated_transparency.webp'],
  ];

  for (const [section, name] of resizeHiddenImages) {
    test(`resize average takes color from visible pixels of ${name}`, () => {
      const decoded = decodeTestImage(section, name);
      const source = decoded.hasPalette
        ? decoded.convert({ numChannels: 4 })
        : decoded;
      const resized = Transform.resize({
        image: source.clone(),
        width: 1 + Math.floor((source.width * 37) / 100),
        interpolation: Interpolation.average,
      });

      expect(hiddenColorPixels(source, resized)).toBe(0);
    });
  }

  const resizeWeightedImages: [TestSection, string][] = [
    [TestSection.gif, 'animated.gif'],
    [TestSection.png, 'alpha_edge.png'],
    [TestSection.png, 'basi4a08.png'],
    [TestSection.png, 'basn6a16.png'],
    [TestSection.png, 'buck_24.png'],
  ];

  for (const [section, name] of resizeWeightedImages) {
    test(`resize average matches alpha-weighted mean of ${name}`, () => {
      const decoded = decodeTestImage(section, name);
      const source = decoded.hasPalette
        ? decoded.convert({ numChannels: 4 })
        : decoded;

      for (const percent of [37, 50]) {
        const resized = Transform.resize({
          image: source.clone(),
          width: 1 + Math.floor((source.width * percent) / 100),
          interpolation: Interpolation.average,
        });
        const expected = alphaWeightedAverage(
          source,
          resized.width,
          resized.height
        );

        expect(differingPixels(resized, expected)).toBe(0);
      }
    });
  }
});
