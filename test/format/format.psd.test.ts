/** @format */

import { describe, expect, test } from 'vitest';
import { decodePsd, encodePng, PsdDecoder } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * PSD format decoding, PNG export, and layer extraction.
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

  for (const file of resFiles) {
    /**
     * Decodes PSD, encodes composite as PNG, exports each layer as a separate PNG.
     */
    test(file.nameExt, () => {
      const input = TestUtils.readFromFilePath(file.path);

      const decoder = new PsdDecoder();

      const psd = decoder.decode({
        bytes: input,
      });

      expect(psd).toBeDefined();
      if (psd === undefined) {
        return;
      }

      const png = encodePng({
        image: psd,
      });

      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.psd,
        `${file.name}.png`,
        png
      );

      let li = 0;

      for (const layer of decoder.info!.layers) {
        const layerImg = layer.layerImage;

        if (layerImg !== undefined) {
          const pngLayer = encodePng({
            image: psd,
          });

          TestUtils.writeToFile(
            TestFolder.output,
            TestSection.psd,
            `${file.name}_${li}_${layer.name}.png`,
            pngLayer
          );
        }

        ++li;
      }
    });
  }
});
