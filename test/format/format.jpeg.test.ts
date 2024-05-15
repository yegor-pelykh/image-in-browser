/** @format */

import { describe, expect, test } from 'vitest';
import {
  JpegChroma,
  decodeJpg,
  decodeJpgExif,
  encodeJpg,
  encodePng,
  injectJpgExif,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: JPEG', () => {
  test('exif', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'kodak-dc210.jpg'
    );
    const image = decodeJpg({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(image.exifData.size).toBeGreaterThan(0);
  });

  test('decode / inject Exif', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'buck_24.jpg'
    );
    const exif = decodeJpgExif({
      data: input,
    });

    expect(exif).toBeDefined();
    if (exif === undefined) {
      return;
    }

    let orientation = exif.imageIfd.getValue('Orientation')?.toInt();
    expect(orientation).toBe(1);

    exif.imageIfd.setValue('Orientation', 4);
    orientation = exif.imageIfd.getValue('Orientation')?.toInt();
    expect(orientation).toBe(4);

    const output = injectJpgExif({
      data: input,
      exifData: exif,
    });

    expect(output).toBeDefined();
    if (output === undefined) {
      return;
    }

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.jpeg,
      'inject_exif.jpg',
      output
    );

    const image2 = decodeJpg({
      data: output,
    });

    expect(image2).toBeDefined();
    if (image2 === undefined) {
      return;
    }

    const output2 = encodePng({
      image: image2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.jpeg,
      'inject_exif2.jpg',
      output2
    );
  });

  test('encode (default 4:4:4 chroma)', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'buck_24.jpg'
    );
    const image = decodeJpg({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const output = encodeJpg({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.jpeg,
      'encode.jpg',
      output
    );
  });

  test('encode (4:2:0 chroma)', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'buck_24.jpg'
    );
    const image = decodeJpg({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const output = encodeJpg({
      image: image,
      chroma: JpegChroma.yuv420,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.jpeg,
      'encode.jpg',
      output
    );
  });

  test('progressive', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'progress.jpg'
    );
    const image = decodeJpg({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(image.width).toBe(341);
    expect(image.height).toBe(486);

    const output = encodePng({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.jpeg,
      'progressive.png',
      output
    );
  });
});
