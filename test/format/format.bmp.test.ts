/** @format */

import { decodeBmp, encodeBmp, Format, MemoryImage } from '../../src';
import { ImageTestUtils } from '../_utils/image-test-utils';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: BMP', () => {
  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.bmp,
    '.bmp'
  );

  for (const f of inputFiles) {
    test(f.nameExt, () => {
      const input1 = TestUtils.readFromFilePath(f.path);
      const image1 = decodeBmp({
        data: input1,
      });

      expect(image1).toBeDefined();
      if (image1 === undefined) {
        return;
      }

      const output1 = encodeBmp({
        image: image1,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.bmp,
        f.nameExt,
        output1
      );

      const input2 = TestUtils.readFromFile(
        TestFolder.output,
        TestSection.bmp,
        f.nameExt
      );
      const image2 = decodeBmp({
        data: input2,
      });
      expect(image2).toBeDefined();
      if (image2 === undefined) {
        return;
      }

      ImageTestUtils.testImageEquals(image1, image2);
    });
  }

  test('uint4', () => {
    const image = new MemoryImage({
      width: 256,
      height: 256,
      format: Format.uint4,
    });

    for (const p of image) {
      p.r = Math.trunc(p.x / p.maxChannelValue);
      p.g = Math.trunc(p.y / p.maxChannelValue);
      p.a = p.maxChannelValue - Math.trunc(p.y / p.maxChannelValue);
    }

    const output = encodeBmp({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.bmp,
      'bmp_16.bmp',
      output
    );
  });
});
