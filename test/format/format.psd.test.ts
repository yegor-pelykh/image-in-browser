/** @format */

import { describe, expect, test } from 'vitest';
import { decodePsd, encodePng, PsdDecoder } from '../../src';
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
      // Read the input file from the specified file path
      const input = TestUtils.readFromFilePath(file.path);

      // Create a new instance of PsdDecoder to handle PSD file decoding
      const decoder = new PsdDecoder();

      // Decode the input bytes into a PSD object
      const psd = decoder.decode({
        bytes: input,
      });

      // Ensure the PSD file is decoded properly
      expect(psd).toBeDefined();
      if (psd === undefined) {
        // Exit the test if the PSD is not defined
        return;
      }

      // Encode the decoded PSD file into PNG format
      const png = encodePng({
        image: psd,
      });

      // Write the encoded PNG file to the output folder
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.psd,
        `${file.name}.png`,
        png
      );

      // Initialize a layer index counter
      let li = 0;

      // Iterate over each layer in the PSD file
      for (const layer of decoder.info!.layers) {
        // Get the image data for the current layer
        const layerImg = layer.layerImage;

        // If the layer image data is defined, encode it to PNG
        if (layerImg !== undefined) {
          const pngLayer = encodePng({
            image: psd,
          });

          // Write the encoded layer PNG file to the output folder
          TestUtils.writeToFile(
            TestFolder.output,
            TestSection.psd,
            `${file.name}_${li}_${layer.name}.png`,
            pngLayer
          );
        }

        // Increment the layer index counter
        ++li;
      }
    });
  }
});
