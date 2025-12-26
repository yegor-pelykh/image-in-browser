/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodeIco,
  decodePng,
  encodeGif,
  encodeIco,
  encodeIcoImages,
  encodePng,
  Filter,
  Format,
  MemoryImage,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for ICO format encoding and decoding.
 */
describe('Format: ICO', () => {
  /**
   * Test case for encoding a palette-based PNG image to ICO format.
   */
  test('encode palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_8.png'
    );
    let image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    image = Transform.copyResize({
      image: image,
      width: 256,
    });
    image = Filter.vignette({
      image: image,
    });

    const output = encodeIco({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.ico,
      `buck_8.ico`,
      output
    );
  });

  /**
   * Test case for encoding multiple images to ICO format.
   */
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

  /**
   * List of input ICO files for decoding tests.
   */
  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.ico,
    '.ico'
  );

  /**
   * Test case for decoding ICO files to PNG format.
   */
  for (const f of inputFiles) {
    test(`decode ${f.nameExt}`, () => {
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
