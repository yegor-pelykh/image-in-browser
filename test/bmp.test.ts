/** @format */

import { decodeBmp, encodeBmp } from '../src';
import { ColorUtils } from '../src/common/color-utils';
import { MemoryImage } from '../src/common/memory-image';
import { TestFolder, TestFormat, TestHelpers } from './test-helpers';

describe('BMP', () => {
  test('encode', () => {
    const image = new MemoryImage({
      width: 64,
      height: 64,
    });
    image.fill(ColorUtils.getColor(100, 200, 255));

    const png = encodeBmp(image);

    TestHelpers.writeToFile(TestFolder.out, TestFormat.bmp, 'encode.bmp', png);
  });

  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestFormat.bmp,
    '.bmp'
  );

  for (const file of resFiles) {
    test(`decode ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const image = decodeBmp(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const output = encodeBmp(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestFormat.bmp,
          file.name,
          output
        );
      }
    });
  }
});
