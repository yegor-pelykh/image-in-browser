/** @format */

import { decodeJpg, encodeJpg } from '../src';
import { JpegDecoder } from '../src/formats/jpeg-decoder';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';

describe('JPEG', () => {
  test('progressive', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.jpeg,
      'progress.jpg'
    );
    const image = decodeJpg(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.width).toBe(341);
      expect(image.height).toBe(486);
    }
  });

  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestSection.jpeg,
    '.jpg'
  );

  for (const file of resFiles) {
    test(`${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const isValid = new JpegDecoder().isValidFile(input);
      expect(isValid).toBe(true);
      const image = new JpegDecoder().decodeImage(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const encoded = encodeJpg(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.jpeg,
          file.name,
          encoded
        );
        const image2 = decodeJpg(encoded);
        expect(image2).not.toBeUndefined();
        if (image2 !== undefined) {
          expect(image.width).toBe(image2.width);
          expect(image.height).toBe(image2.height);
        }
      }
    });
  }

  for (let i = 1; i < 9; i++) {
    test(`exif/orientation_${i}/landscape`, () => {
      const input = TestHelpers.readFromFile(
        TestFolder.res,
        TestSection.jpeg,
        `landscape_${i}.jpg`
      );
      const image = decodeJpg(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const output = encodeJpg(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.jpeg,
          `landscape_${i}.jpg`,
          output
        );
      }
    });

    test(`exif/orientation_${i}/portrait`, () => {
      const input = TestHelpers.readFromFile(
        TestFolder.res,
        TestSection.jpeg,
        `portrait_${i}.jpg`
      );
      const image = decodeJpg(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const output = encodeJpg(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.jpeg,
          `portrait_${i}.jpg`,
          output
        );
      }
    });
  }
});
