/** @format */

import { describe, expect, test } from 'vitest';
import {
  BmpDecoder,
  decodeBmp,
  DitherKernel,
  encodeBmp,
  Filter,
  Format,
  MemoryImage,
} from '../../src';
import { ImageTestUtils } from '../_utils/image-test-utils';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * BMP format encoding, decoding, and sub-format tests.
 */
describe('Format: BMP', () => {
  /**
   * List of input BMP files for testing.
   */
  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.bmp,
    '.bmp'
  );

  for (const f of inputFiles) {
    /**
     * Decodes, re-encodes, and re-decodes BMP file; compares original with round-tripped image for pixel equality.
     */
    test(f.nameExt, () => {
      const input1 = TestUtils.readFromFilePath(f.path);
      const image1 = decodeBmp({
        data: input1,
      });

      expect(image1).toBeDefined();
      if (image1 === undefined) {
        return;
      }

      const output1 = encodeBmp({
        image: image1,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.bmp,
        f.nameExt,
        output1
      );

      const input2 = TestUtils.readFromFile(
        TestFolder.output,
        TestSection.bmp,
        f.nameExt
      );
      const image2 = decodeBmp({
        data: input2,
      });
      expect(image2).toBeDefined();
      if (image2 === undefined) {
        return;
      }

      ImageTestUtils.testImageEquals(image1, image2);
    });
  }

  /**
   * Creates a 256×256 Floyd-Steinberg dithered grayscale uint1 image with palette.
   */
  test('uint1', () => {
    let image = new MemoryImage({
      width: 256,
      height: 256,
    });

    for (const p of image) {
      p.r = p.x % 255;
      p.g = p.y % 255;
    }

    image = Filter.grayscale({
      image: image,
    });

    image = Filter.quantize({
      image: image,
      numberOfColors: 2,
      dither: DitherKernel.floydSteinberg,
    });

    image = image.convert({
      format: Format.uint1,
      withPalette: true,
    });

    const output = encodeBmp({
      image: image,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.bmp,
      'bmp_1.bmp',
      output
    );
  });

  /**
   * Creates a 256×256 uint4 image with per-pixel RGBA channels.
   */
  test('uint4', () => {
    const image = new MemoryImage({
      width: 256,
      height: 256,
      format: Format.uint4,
    });

    for (const p of image) {
      p.r = Math.trunc(p.x / p.maxChannelValue);
      p.g = Math.trunc(p.y / p.maxChannelValue);
      p.a = p.maxChannelValue - Math.trunc(p.y / p.maxChannelValue);
    }

    const output = encodeBmp({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.bmp,
      'bmp_16.bmp',
      output
    );
  });

  /**
   * BmpDecoder rejects an invalid BMP file with a BM header.
   */
  test('rejects a non-BMP file with a BM signature', () => {
    const notBmp = new Uint8Array([
      0x42, 0x4d, 0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1a, 0x00,
      0x00, 0x00, 0x0c, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    const dec = new BmpDecoder();
    expect(dec.isValidFile(notBmp)).toBe(false);
  });
});
