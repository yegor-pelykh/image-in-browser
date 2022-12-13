/** @format */

import { decodeJpg, encodeJpg, JpegDecoder } from '../src';
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

  test('exif', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.jpeg,
      'big_buck_bunny.jpg'
    );
    const image = decodeJpg(input)!;
    image.exifData.imageIfd.setValue('XResolution', [300, 1]);
    image.exifData.imageIfd.setValue('YResolution', [300, 1]);
    const jpg = encodeJpg(image);
    const image2 = decodeJpg(jpg)!;

    const imageResolutionX = image.exifData.imageIfd.getValue('XResolution');
    expect(imageResolutionX).toBeDefined();
    const image2ResolutionX = image2.exifData.imageIfd.getValue('XResolution');
    expect(image2ResolutionX).toBeDefined();
    const isResXEquals = imageResolutionX!.equalsTo(image2ResolutionX!);
    expect(isResXEquals).toBe(true);

    const imageResolutionY = image.exifData.imageIfd.getValue('YResolution');
    expect(imageResolutionY).toBeDefined();
    const image2ResolutionY = image2.exifData.imageIfd.getValue('YResolution');
    expect(image2ResolutionY).toBeDefined();
    const isResYEquals = imageResolutionY!.equalsTo(image2ResolutionY!);
    expect(isResYEquals).toBe(true);
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
