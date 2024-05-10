/** @format */

import { decodePsd, encodePng } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: PSD', () => {
  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.psd,
    '.psd'
  );

  for (const file of resFiles) {
    test(file.nameExt, () => {
      const input = TestUtils.readFromFilePath(file.path);
      const psd = decodePsd({
        data: input,
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
    });
  }
});
