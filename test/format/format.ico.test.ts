/** @format */

import {
  ColorRgb8,
  decodeIco,
  encodeGif,
  encodeIcoImages,
  encodePng,
  Format,
  MemoryImage,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: ICO', () => {
  test('encode', () => {
    const image = new MemoryImage({
      width: 64,
      height: 64,
    });

    image.clear(new ColorRgb8(100, 200, 255));

    const output = encodeGif({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.ico,
      'encode.ico',
      output
    );

    const image2 = new MemoryImage({
      width: 64,
      height: 64,
    });

    image2.clear(new ColorRgb8(100, 255, 200));

    const output2 = encodeIcoImages({
      images: [image, image2],
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.ico,
      'encode2.ico',
      output2
    );

    const image3 = new MemoryImage({
      width: 32,
      height: 64,
    });

    image3.clear(new ColorRgb8(255, 100, 200));

    const output3 = encodeIcoImages({
      images: [image, image2, image3],
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.ico,
      'encode3.ico',
      output3
    );
  });

  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.ico,
    '.ico'
  );

  for (const f of inputFiles) {
    test(`decode ${f.fileName}`, () => {
      const input = TestUtils.readFromFilePath(f.path);
      const image = decodeIco({
        data: input,
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      const i8 = image.convert({
        format: Format.uint8,
      });

      const output = encodePng({
        image: i8,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.ico,
        `${f.name}.png`,
        output
      );
    });
  }
});
