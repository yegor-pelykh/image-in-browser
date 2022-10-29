/** @format */

import { decodeTga, encodePng, encodeTga } from '../src';
import { TestFolder, TestFormat, TestHelpers } from './test-helpers';

describe('TGA', () => {
  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestFormat.tga,
    '.tga'
  );

  for (const file of resFiles) {
    test(`${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const image = decodeTga(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const output = encodePng(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestFormat.tga,
          TestHelpers.replaceFileName(file.name, (ext) => 'png'),
          output
        );
      }
    });
  }

  test('decode/encode', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestFormat.tga,
      'globe.tga'
    );

    // Decode the image from file.
    const image = decodeTga(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.width).toBe(128);
      expect(image.height).toBe(128);

      // Encode the image as a tga
      const output = encodeTga(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestFormat.tga,
        'globe.tga',
        output
      );

      // Decode the encoded image, make sure it's the same as the original.
      const image2 = decodeTga(output);
      expect(image2).not.toBeUndefined();
      if (image2 !== undefined) {
        expect(image2.width).toBe(128);
        expect(image2.height).toBe(128);
      }
    }
  });
});
