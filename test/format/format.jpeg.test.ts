/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorUint8,
  ExifData,
  JpegChroma,
  JpegDecoder,
  MemoryImage,
  decodeJpg,
  decodeJpgExif,
  decodePng,
  encodeJpg,
  encodePng,
  injectJpgExif,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * JPEG format handling.
 */
describe('Format: JPEG', () => {
  /**
   * Test to inject new EXIF data into a JPEG image that does not have EXIF,
   * And verify that the injected EXIF data is present and correct.
   */
  test('inject new EXIF', () => {
    const exifData = new ExifData();
    exifData.imageIfd.set('XResolution', [300, 1]);
    exifData.imageIfd.set('YResolution', [300, 1]);

    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'jpeg444.jpg'
    );

    const jpg = injectJpgExif({ data: input, exifData: exifData });
    expect(jpg).toBeDefined();
    if (jpg === undefined) {
      return;
    }

    const image2 = new JpegDecoder().decode({ bytes: jpg });
    expect(image2).toBeDefined();
    if (image2 === undefined) {
      return;
    }

    let ed1 = exifData.imageIfd.get('XResolution');
    let ed2 = image2.exifData.imageIfd.get('XResolution');
    expect(ed1).toBeDefined();
    expect(ed2).toBeDefined();
    if (ed1 === undefined || ed2 === undefined) {
      return;
    }
    expect(ed1.equals(ed2)).toBeTruthy();

    ed1 = exifData.imageIfd.get('YResolution');
    ed2 = image2.exifData.imageIfd.get('YResolution');
    expect(ed1).toBeDefined();
    expect(ed2).toBeDefined();
    if (ed1 === undefined || ed2 === undefined) {
      return;
    }
    expect(ed1.equals(ed2)).toBeTruthy();
  });

  /**
   * Test to replace existing EXIF data in a JPEG image with new EXIF data,
   * And verify that the replacement EXIF data is present and correct.
   */
  test('inject replacement EXIF', () => {
    const exifData = new ExifData();
    exifData.imageIfd.set('XResolution', [300, 1]);
    exifData.imageIfd.set('YResolution', [300, 1]);

    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'big_buck_bunny.jpg'
    );

    const jpg = injectJpgExif({ data: input, exifData: exifData });
    expect(jpg).toBeDefined();
    if (jpg === undefined) {
      return;
    }

    const image2 = new JpegDecoder().decode({ bytes: jpg });
    expect(image2).toBeDefined();
    if (image2 === undefined) {
      return;
    }

    let ed1 = exifData.imageIfd.get('XResolution');
    let ed2 = image2.exifData.imageIfd.get('XResolution');
    expect(ed1).toBeDefined();
    expect(ed2).toBeDefined();
    if (ed1 === undefined || ed2 === undefined) {
      return;
    }
    expect(ed1.equals(ed2)).toBeTruthy();

    ed1 = exifData.imageIfd.get('YResolution');
    ed2 = image2.exifData.imageIfd.get('YResolution');
    expect(ed1).toBeDefined();
    expect(ed2).toBeDefined();
    if (ed1 === undefined || ed2 === undefined) {
      return;
    }
    expect(ed1.equals(ed2)).toBeTruthy();
  });

  /**
   * Decodes a PNG with an ICC profile and re-encodes as JPEG.
   */
  test('png icc_profile', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'iCCP.png'
    );
    const image = decodePng({
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
      'png_icc_profile_data.jpg',
      output
    );
  });

  /**
   * Decodes and re-encodes a JPEG with an ICC profile.
   */
  test('icc_profile', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'icc_profile_data.jpg'
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
      'icc_profile_data.jpg',
      output
    );
  });

  /**
   * Test to verify that EXIF data is present in the JPEG image.
   */
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

  /**
   * Test to decode a JPEG image, modify its EXIF data, and then re-encode it.
   */
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

    let orientation = exif.imageIfd.get('Orientation')?.toInt();
    expect(orientation).toBe(1);

    exif.imageIfd.set('Orientation', 4);
    orientation = exif.imageIfd.get('Orientation')?.toInt();
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

  /**
   * Test to encode a JPEG image with default 4:4:4 chroma subsampling.
   */
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

  /**
   * Test to encode a JPEG image with 4:2:0 chroma subsampling.
   */
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

  /**
   * Test to verify that a progressive JPEG image is correctly decoded and re-encoded as PNG.
   */
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

  /**
   * Test that RSTn and TEM markers before EOI are skipped.
   * https://github.com/brendan-duncan/image/issues/805
   */
  test('restart marker before EOI', () => {
    const src = new MemoryImage({ width: 32, height: 32, numChannels: 3 });
    src.clear(ColorUint8.rgb(200, 100, 50));
    const jpg = encodeJpg({ image: src });
    expect(jpg[jpg.length - 2]).toBe(0xff);
    expect(jpg[jpg.length - 1]).toBe(0xd9);

    for (let rst = 0xd0; rst <= 0xd7; ++rst) {
      const bytes = new Uint8Array([
        ...jpg.subarray(0, jpg.length - 2),
        0xff,
        rst,
        0xff,
        0xd9,
      ]);
      const image = new JpegDecoder().decode({ bytes: bytes });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }
      expect(image.width).toBe(32);
      expect(image.height).toBe(32);
      const p = image.getPixel(16, 16);
      expect(p.r).toBeCloseTo(200, -1);
      expect(p.g).toBeCloseTo(100, -1);
      expect(p.b).toBeCloseTo(50, -1);
    }
  });
});
