/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgba8,
  FlipDirection,
  Format,
  Interpolation,
  MemoryImage,
  Point,
  Rectangle,
  Transform,
  TrimMode,
} from '../../src';
import { TestSection } from '../_utils/test-section';
import {
  decodeTestImage,
  differingPixels,
} from '../_utils/transform-test-helpers';

const operations = new Map<string, (image: MemoryImage) => MemoryImage>([
  ['trim', (image) => Transform.trim({ image, mode: TrimMode.transparent })],
  ['copyCropCircle', (image) => Transform.copyCropCircle({ image })],
  ['copyRotate 90', (image) => Transform.copyRotate({ image, angle: 90 })],
  ['copyRotate 180', (image) => Transform.copyRotate({ image, angle: 180 })],
  ['copyRotate 270', (image) => Transform.copyRotate({ image, angle: 270 })],
  ['copyRotate 30', (image) => Transform.copyRotate({ image, angle: 30 })],
  [
    'copyRotate 30 linear',
    (image) =>
      Transform.copyRotate({
        image,
        angle: 30,
        interpolation: Interpolation.linear,
      }),
  ],
  [
    'copyRotate 30 linearBlend',
    (image) =>
      Transform.copyRotate({
        image,
        angle: 30,
        interpolation: Interpolation.linear,
        linearBlend: true,
      }),
  ],
  [
    'copyResizeCropSquare',
    (image) => Transform.copyResizeCropSquare({ image, size: 40 }),
  ],
  [
    'copyResizeCropSquare linear with radius',
    (image) =>
      Transform.copyResizeCropSquare({
        image,
        size: 40,
        interpolation: Interpolation.linear,
        radius: 5,
      }),
  ],
  [
    'copyFlip',
    (image) =>
      Transform.copyFlip({ image, direction: FlipDirection.horizontal }),
  ],
  [
    'copyExpandCanvas',
    (image) =>
      Transform.copyExpandCanvas({
        image,
        padding: 3,
        backgroundColor: new ColorRgba8(9, 99, 199, 255),
      }),
  ],
  [
    'copyRectify',
    (image) =>
      Transform.copyRectify({
        image,
        topLeft: new Point(1, 1),
        topRight: new Point(50, 2),
        bottomLeft: new Point(2, 50),
        bottomRight: new Point(50, 50),
      }),
  ],
  [
    'copyRectify linear',
    (image) =>
      Transform.copyRectify({
        image,
        topLeft: new Point(1, 1),
        topRight: new Point(50, 2),
        bottomLeft: new Point(2, 50),
        bottomRight: new Point(50, 50),
        interpolation: Interpolation.linear,
      }),
  ],
  [
    'bakeOrientation',
    (image) => {
      image.exifData.imageIfd.orientation = 6;
      return Transform.bakeOrientation({ image });
    },
  ],
  [
    'copyCrop',
    (image) =>
      Transform.copyCrop({ image, rect: Rectangle.fromXYWH(5, 5, 40, 30) }),
  ],
  [
    'copyCrop with radius',
    (image) =>
      Transform.copyCrop({
        image,
        rect: Rectangle.fromXYWH(5, 5, 40, 30),
        radius: 4,
      }),
  ],
  [
    'copyResize linear',
    (image) =>
      Transform.copyResize({
        image,
        width: 33,
        interpolation: Interpolation.linear,
      }),
  ],
  ['resize', (image) => Transform.resize({ image, width: 33 })],
]);

/**
 * Decodes an animation and gives its frames distinct durations.
 * @param {TestSection} section - The test input section.
 * @param {string} name - The file name.
 * @returns {MemoryImage} The animation.
 */
function animation(section: TestSection, name: string): MemoryImage {
  const image = decodeTestImage(section, name);
  for (let index = 0; index < image.numFrames; index++) {
    image.frames[index].frameDuration = 30 + index * 10;
  }

  return image;
}

/**
 * Tests that transforms keep the frames of animations.
 */
describe('Transform animation frames', () => {
  const animations: [TestSection, string][] = [
    [TestSection.gif, 'animated.gif'],
    [TestSection.gif, 'palette_remap.gif'],
    [TestSection.gif, 'anim_palette.gif'],
    [TestSection.apng, 'test_apng1.png'],
  ];

  for (const [section, name] of animations) {
    for (const [operationName, operation] of operations) {
      test(`${operationName} keeps duration and content of every frame of ${name}`, () => {
        const source = animation(section, name);
        const result = operation(source.clone());

        expect(result.frames.map((frame) => frame.frameDuration)).toEqual(
          source.frames.map((frame) => frame.frameDuration)
        );

        if (operationName === 'trim') {
          return;
        }

        for (let index = 0; index < source.numFrames; index++) {
          const single = MemoryImage.from(source.frames[index], true);
          const expected = operation(single);
          const frame = result.frames[index];

          expect([frame.width, frame.height, frame.numChannels]).toEqual([
            expected.width,
            expected.height,
            expected.numChannels,
          ]);
          expect(differingPixels(MemoryImage.from(frame, true), expected)).toBe(
            0
          );
        }
      });
    }
  }

  const paletteOperations = new Map<
    string,
    (image: MemoryImage) => MemoryImage
  >([
    ['copyCropCircle', (image) => Transform.copyCropCircle({ image })],
    [
      'copyResizeCropSquare with radius',
      (image) => Transform.copyResizeCropSquare({ image, size: 16, radius: 4 }),
    ],
    [
      'copyRotate linear',
      (image) =>
        Transform.copyRotate({
          image,
          angle: 33,
          interpolation: Interpolation.linear,
        }),
    ],
    [
      'copyRectify linear',
      (image) =>
        Transform.copyRectify({
          image,
          topLeft: new Point(1, 1),
          topRight: new Point(21, 2),
          bottomLeft: new Point(2, 21),
          bottomRight: new Point(20, 20),
          interpolation: Interpolation.linear,
        }),
    ],
  ]);

  for (const [operationName, operation] of paletteOperations) {
    test(`${operationName} writes colors of palette frame that follows frame without palette`, () => {
      const source = new MemoryImage({
        width: 24,
        height: 24,
        numChannels: 4,
      });
      source.clear(new ColorRgba8(40, 80, 120, 255));
      const indexed = new MemoryImage({
        width: 24,
        height: 24,
        withPalette: true,
      });
      for (let index = 0; index < 256; index++) {
        indexed.palette!.setRgb(index, index, 255 - index, (index * 7) % 256);
      }

      for (const pixel of indexed) {
        pixel.index = (pixel.x * 9 + pixel.y * 5) % 256;
      }

      source.addFrame(indexed);
      const result = operation(source);
      const expected = operation(indexed.convert({ numChannels: 3 }));

      expect(
        differingPixels(MemoryImage.from(result.frames[1], true), expected)
      ).toBe(0);
    });
  }

  test('copyCropCircle leaves pixels outside image transparent', () => {
    const source = new MemoryImage({ width: 20, height: 12, numChannels: 4 });
    source.clear(new ColorRgba8(200, 100, 50, 255));

    const corner = Transform.copyCropCircle({
      image: source,
      center: new Point(3, 3),
      radius: 8,
    });
    const inside = corner.getPixel(8, 8);
    const outside = corner.getPixel(2, 8);

    expect([corner.width, corner.height]).toEqual([16, 16]);
    expect([inside.r, inside.g, inside.b, inside.a]).toEqual([
      200, 100, 50, 255,
    ]);
    expect(outside.a).toBe(0);
  });

  test('copyExpandCanvas fills padding of every frame', () => {
    const source = animation(TestSection.apng, 'test_apng1.png');
    const expanded = Transform.copyExpandCanvas({
      image: source,
      padding: 4,
      backgroundColor: new ColorRgba8(9, 99, 199, 255),
    });

    for (const frame of expanded.frames) {
      const corner = frame.getPixel(1, 1);
      expect([corner.r, corner.g, corner.b, corner.a]).toEqual([
        9, 99, 199, 255,
      ]);
    }
  });

  const paletteFormats = [
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

  for (const format of paletteFormats) {
    test(`pixel alpha of 3-channel ${Format[format]} palette is opaque`, () => {
      const image = new MemoryImage({
        width: 2,
        height: 1,
        withPalette: true,
        paletteFormat: format,
      });
      const palette = image.palette!;
      palette.setRgb(0, 1, 1, 1);

      expect(palette.numChannels).toBe(3);
      expect(palette.getAlpha(0)).toBe(palette.maxChannelValue);
      expect(image.getPixel(0, 0).a).toBe(palette.maxChannelValue);
    });
  }

  test('pixel alpha of 16-bit palette TIFF is opaque', () => {
    const source = decodeTestImage(TestSection.tiff, 'CNSW_crop.tif');

    expect(source.palette!.numChannels).toBe(3);
    for (const pixel of source) {
      if (pixel.a !== 65535) {
        throw new Error(`alpha ${pixel.a} at ${pixel.x},${pixel.y}`);
      }
    }
  });
});
