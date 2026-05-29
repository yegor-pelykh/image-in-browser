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
});
