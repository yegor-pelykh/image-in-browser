/** @format */

import { encodeIco, encodePng } from '../src';
import { ColorUtils } from '../src/common/color-utils';
import { MemoryImage } from '../src/common/memory-image';
import { IcoDecoder } from '../src/formats/ico-decoder';
import { IcoEncoder } from '../src/formats/ico-encoder';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';

describe('ICO', () => {
  test('encode', () => {
    const image = new MemoryImage({
      width: 64,
      height: 64,
    });
    image.fill(ColorUtils.getColor(100, 200, 255));
    const output = encodeIco(image);
    TestHelpers.writeToFile(
      TestFolder.out,
      TestSection.ico,
      'encode.ico',
      output
    );

    // ---

    const image2 = new MemoryImage({
      width: 64,
      height: 64,
    });
    image2.fill(ColorUtils.getColor(100, 255, 200));

    const output2 = new IcoEncoder().encodeImages([image, image2]);
    TestHelpers.writeToFile(
      TestFolder.out,
      TestSection.ico,
      'encode2.ico',
      output2
    );

    // ---

    const image3 = new MemoryImage({
      width: 32,
      height: 64,
    });
    image3.fill(ColorUtils.getColor(255, 100, 200));

    const output3 = new IcoEncoder().encodeImages([image, image2, image3]);
    TestHelpers.writeToFile(
      TestFolder.out,
      TestSection.ico,
      'encode3.ico',
      output3
    );
  });

  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestSection.ico,
    '.ico'
  );

  for (const file of resFiles) {
    test(`decode ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const image = new IcoDecoder().decodeImageLargest(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const output = encodePng(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.ico,
          TestHelpers.replaceFileName(file.name, (ext) => 'png'),
          output
        );
      }
    });
  }
});
