/** @format */

import { describe, expect, test } from 'vitest';
import { encodePng, PnmDecoder } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: PNM', () => {
  const resFiles = TestUtils.listFiles(TestFolder.input, TestSection.pnm);

  for (const file of resFiles) {
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
