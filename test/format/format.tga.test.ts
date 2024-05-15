/** @format */

import { describe, expect, test } from 'vitest';
import { decodeTga, encodePng } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: TGA', () => {
  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.tga,
    '.tga'
  );

  for (const f of resFiles) {
    test(f.nameExt, () => {
      const input = TestUtils.readFromFilePath(f.path);
      const image = decodeTga({
        data: input,
      });

      expect(image).toBeDefined();
      if (image === undefined) {
        return;
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
