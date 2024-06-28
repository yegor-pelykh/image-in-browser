/** @format */

import { describe, expect, test } from 'vitest';
import { decodePsd, encodePng } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for PSD format.
 */
describe('Format: PSD', () => {
  /**
   * List all PSD files in the input test folder.
   */
  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.psd,
    '.psd'
  );

  // Iterate over each PSD file found
  for (const file of resFiles) {
    /**
     * Test case for each PSD file.
     * @param {string} file.nameExt - The name of the file with extension.
     */
    test(file.nameExt, () => {
      // Read the input file
      const input = TestUtils.readFromFilePath(file.path);

      // Decode the PSD file
      const psd = decodePsd({
        data: input,
      });

      // Ensure the PSD file is decoded properly
      expect(psd).toBeDefined();
      if (psd === undefined) {
        return;
      }

      // Encode the PSD file to PNG format
      const png = encodePng({
        image: psd,
      });

      // Write the PNG file to the output folder
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.psd,
        `${file.name}.png`,
        png
      );
    });
  }
});
