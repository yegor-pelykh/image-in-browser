/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodePng,
  encodePng,
  Format,
  MemoryImage,
  PngFilterType,
} from '../../src';
import { ImageTestUtils } from '../_utils/image-test-utils';

/**
 * Creates a non-smooth pattern so every filter predictor is exercised.
 * @param {number} numChannels - The number of channels.
 * @param {Format} format - The channel format.
 * @returns {MemoryImage} The pattern image.
 */
function pattern(numChannels: number, format: Format): MemoryImage {
  const image = new MemoryImage({ width: 23, height: 11, numChannels, format });
  const max = image.maxChannelValue;
  for (const p of image) {
    p.r = ((p.x * 37 + p.y * 11) * 97) % (max + 1);
    p.g = ((p.x * 13 + p.y * 29) * 89) % (max + 1);
    p.b = ((p.x * 7 + p.y * 53) * 83) % (max + 1);
    p.a = ((p.x * 3 + p.y * 17) * 79) % (max + 1);
  }
  return image;
}

/**
 * PNG decoding that has to hold on the web as well as on the VM.
 */
describe('Format: PNG (web)', () => {
  const images = new Map<string, MemoryImage>([
    ['gray8', pattern(1, Format.uint8)],
    ['grayAlpha8', pattern(2, Format.uint8)],
    ['rgb8', pattern(3, Format.uint8)],
    ['rgba8', pattern(4, Format.uint8)],
    ['rgb16', pattern(3, Format.uint16)],
    ['rgba16', pattern(4, Format.uint16)],
    [
      'palette8',
      pattern(3, Format.uint8).convert({
        numChannels: 3,
        withPalette: true,
      }),
    ],
  ]);
  for (const [name, image] of images) {
    for (const filter of [
      PngFilterType.none,
      PngFilterType.sub,
      PngFilterType.up,
      PngFilterType.average,
      PngFilterType.paeth,
    ]) {
      test(`round trip ${name} ${PngFilterType[filter]}`, () => {
        const decoded = decodePng({ data: encodePng({ image, filter }) });
        expect(decoded).toBeDefined();
        if (decoded === undefined) {
          return;
        }
        ImageTestUtils.testImageEquals(decoded, image);
      });
    }
  }
});
