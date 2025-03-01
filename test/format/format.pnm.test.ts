/** @format */

import { describe, expect, test } from 'vitest';
import { encodePng, PnmDecoder } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for PNM format.
 */
describe('Format: PNM', TestUtils.testOptions, () => {
  // List all files in the input folder for the PNM section.
  const resFiles = TestUtils.listFiles(TestFolder.input, TestSection.pnm);

  // Iterate over each file in the list.
  for (const file of resFiles) {
    /**
     * Test case for each PNM file.
     * @param {string} file.nameExt - The name and extension of the file.
     */
    test(`pnm ${file.nameExt}`, () => {
      // Read the file content from the given path.
      const input = TestUtils.readFromFilePath(file.path);
      const decoder = new PnmDecoder();

      // Check if the file is a valid PNM file.
      const isValidFile = decoder.isValidFile(input);
      expect(isValidFile).toBeTruthy();

      // Decode the PNM file to an image object.
      const image = decoder.decode({
        bytes: input,
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      // Encode the image object to PNG format.
      const output = encodePng({
        image: image,
      });

      // Write the PNG output to the specified folder.
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.pnm,
        `${file.nameExt}.png`,
        output
      );
    });
  }
});
