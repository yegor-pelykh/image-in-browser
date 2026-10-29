/** @format */

import { describe, expect, test } from 'vitest';
import { decodeTga, encodePng, encodeTga } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * TGA format decode, TGA round-trip, and PNG export.
 */
describe('Format: TGA', () => {
  /**
   * List all TGA files in the input test folder.
   */
  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.tga,
    '.tga'
  );

  for (const f of resFiles) {
    /**
     * Decodes TGA, round-trip re-encodes/re-decodes to verify dimensions, exports as PNG and TGA.
     */
    test(f.nameExt, () => {
      const input = TestUtils.readFromFilePath(f.path);

      const image = decodeTga({
        data: input,
      });

      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      const tgaBytes = encodeTga({
        image: image,
      });
      const rtImage = decodeTga({
        data: tgaBytes,
      });
      expect(rtImage).toBeDefined();
      if (rtImage !== undefined) {
        expect(rtImage.width).toBe(image.width);
        expect(rtImage.height).toBe(image.height);
      }

      const output = encodePng({
        image: image,
      });

      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tga,
        `${f.name}.png`,
        output
      );

      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tga,
        f.nameExt,
        output
      );
    });
  }

  /**
   * Builds the header of a 2x2 TGA image with 8 bits per pixel.
   * @param {number} imageType - The TGA image type.
   * @returns {number[]} The header bytes.
   */
  function grayHeader(imageType: number): number[] {
    return [0, 0, imageType, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 8, 0];
  }

  /**
   * Decodes an uncompressed grayscale image (image type 3).
   */
  test('grayscale', () => {
    // Rows are stored from bottom to top.
    const image = decodeTga({
      data: new Uint8Array([...grayHeader(3), 0x10, 0x20, 0x30, 0x40]),
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }
    expect(image.numChannels).toBe(1);
    expect(image.getPixel(0, 0).r).toBe(0x30);
    expect(image.getPixel(1, 0).r).toBe(0x40);
    expect(image.getPixel(0, 1).r).toBe(0x10);
    expect(image.getPixel(1, 1).r).toBe(0x20);
  });

  /**
   * Decodes a run-length encoded grayscale image (image type 11).
   */
  test('grayscale RLE', () => {
    // A run packet of two 0x10 pixels, then a raw packet of 0x30 and 0x40.
    const image = decodeTga({
      data: new Uint8Array([...grayHeader(11), 0x81, 0x10, 0x01, 0x30, 0x40]),
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }
    expect(image.numChannels).toBe(1);
    expect(image.getPixel(0, 0).r).toBe(0x30);
    expect(image.getPixel(1, 0).r).toBe(0x40);
    expect(image.getPixel(0, 1).r).toBe(0x10);
    expect(image.getPixel(1, 1).r).toBe(0x10);
  });
});
