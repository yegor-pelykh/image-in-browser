/** @format */

import { describe, expect, test } from 'vitest';
import { decodeTga, encodePng } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for TGA format.
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

  // Iterate over each TGA file found
  for (const f of resFiles) {
    /**
     * Test case for each TGA file.
     * @param {string} f.nameExt - The name of the file with extension.
     */
    test(f.nameExt, () => {
      // Read the input file
      const input = TestUtils.readFromFilePath(f.path);

      // Decode the TGA file
      const image = decodeTga({
        data: input,
      });

      // Ensure the image is defined
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      // Encode the image to PNG format
      const output = encodePng({
        image: image,
      });

      // Write the PNG output to the output test folder
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tga,
        `${f.name}.png`,
        output
      );

      // Write the original TGA file to the output test folder
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tga,
        f.nameExt,
        output
      );
    });
  }
});
