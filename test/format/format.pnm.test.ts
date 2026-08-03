/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodeImage,
  encodePng,
  findFormatForData,
  ImageFormat,
  PnmDecoder,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * PNM format decoding, determinism check, and PNG export.
 */
describe('Format: PNM', () => {
  const resFiles = TestUtils.listFiles(TestFolder.input, TestSection.pnm);

  for (const file of resFiles) {
    /**
     * Validates PNM file header, decodes, verifies deterministic re-decode yields same dimensions, encodes to PNG.
     */
    test(`pnm ${file.nameExt}`, () => {
      const input = TestUtils.readFromFilePath(file.path);
      const decoder = new PnmDecoder();

      const isValidFile = decoder.isValidFile(input);
      expect(isValidFile).toBeTruthy();

      const image = decoder.decode({
        bytes: input,
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      const pnmDecoder2 = new PnmDecoder();
      const image2 = pnmDecoder2.decode({ bytes: input });
      expect(image2).toBeDefined();
      if (image2 !== undefined) {
        expect(image2.width).toBe(image.width);
        expect(image2.height).toBe(image.height);
      }

      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);

      const output = encodePng({
        image: image,
      });

      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.pnm,
        `${file.nameExt}.png`,
        output
      );
    });
  }

  test('binary PNM is not misdetected as TGA', () => {
    const header = new TextEncoder().encode('P5\n4 4\n255\n');
    const pixels = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      pixels[i] = i === 5 ? 24 : (i * 15) % 256;
    }
    const bytes = new Uint8Array(header.length + pixels.length);
    bytes.set(header);
    bytes.set(pixels, header.length);

    expect(bytes[16]).toBe(24);

    const a = findFormatForData(bytes);
    expect(a).toBe(ImageFormat.pnm);

    const image = decodeImage({ data: bytes });
    expect(image).toBeDefined();
    if (image !== undefined) {
      expect(image.width).toBe(4);
      expect(image.height).toBe(4);
    }
  });
});
