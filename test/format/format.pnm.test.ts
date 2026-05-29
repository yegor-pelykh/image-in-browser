/** @format */

import { describe, expect, test } from 'vitest';
import { encodePng, PnmDecoder } from '../../src';
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
});
