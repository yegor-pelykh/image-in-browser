/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgba8,
  ColorUint8,
  ExifData,
  JpegChroma,
  JpegData,
  JpegDecoder,
  LibError,
  MemoryImage,
  decodeImage,
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
import { ImageTestUtils } from '../_utils/image-test-utils';

/**
 * JPEG format handling.
 */
describe('Format: JPEG', () => {
  /**
   * Re-declares the dimensions in the SOF header of a small valid JPEG,
   * producing a tiny file that claims to be a huge image.
   */
  function jpgWithSize(
    width: number,
    height: number,
    opts: { components?: number } = {}
  ): Uint8Array {
    const components = opts.components ?? 3;
    const jpg = encodeJpg({
      image: new MemoryImage({ width: 8, height: 8, numChannels: 3 }),
    });
    for (let i = 0; i < jpg.length - 9; ++i) {
      if (jpg[i] === 0xff && jpg[i + 1] === 0xc0) {
        jpg[i + 5] = height >> 8;
        jpg[i + 6] = height & 0xff;
        jpg[i + 7] = width >> 8;
        jpg[i + 8] = width & 0xff;
        if (components !== 3) {
          jpg[i + 9] = components;
        }
        return jpg;
      }
    }
    throw new Error('SOF0 not found');
  }

  /**
   * Rejects frames that declare dimensions over the maxPixels limit.
   */
  test('rejects dimensions over maxPixels', () => {
    const jpg = jpgWithSize(65535, 65535);
    const start = Date.now();
    expect(() => decodeJpg({ data: jpg })).toThrow(LibError);
    expect(() => decodeImage({ data: jpg })).toThrow(LibError);
    expect(Date.now() - start).toBeLessThan(1000);

    expect(() =>
      decodeJpg({ data: jpgWithSize(101, 100), maxPixels: 10000 })
    ).toThrow(LibError);
    const image = decodeJpg({ data: jpgWithSize(100, 100), maxPixels: 10000 });
    expect(image?.width).toBe(100);
    expect(image?.height).toBe(100);
  });

  /**
   * The defaultMaxPixels limit applies to decoders created without one.
   */
  test('defaultMaxPixels', () => {
    const saved = JpegDecoder.defaultMaxPixels;
    JpegDecoder.defaultMaxPixels = 64 * 64;
    try {
      expect(() => decodeImage({ data: jpgWithSize(65, 64) })).toThrow(
        LibError
      );
      expect(decodeImage({ data: jpgWithSize(64, 64) })?.width).toBe(64);
    } finally {
      JpegDecoder.defaultMaxPixels = saved;
    }
  });

  /**
   * startDecode should not allocate for huge dimensions, but decodeFrame
   * should still reject them.
   */
  test('startDecode does not allocate for huge dimensions', () => {
    const decoder = new JpegDecoder();
    const info = decoder.startDecode(jpgWithSize(65535, 65535));
    expect(info?.width).toBe(65535);
    expect(info?.height).toBe(65535);
    expect(() => decoder.decodeFrame(0)).toThrow(LibError);
  });

  /**
   * Rejects frames with zero dimensions or no components.
   */
  test('rejects invalid frame headers', () => {
    expect(() => decodeJpg({ data: jpgWithSize(0, 8) })).toThrow(LibError);
    expect(() => decodeJpg({ data: jpgWithSize(8, 8, { components: 0 }) })).toThrow(
      LibError
    );
  });

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

  /**
   * encodeJpg must not modify the pixels of an RGBA source image.
   */
  test('encodeJpg does not modify an RGBA source image', () => {
    const image = new MemoryImage({ width: 16, height: 16, numChannels: 4 });
    image.clear(new ColorRgba8(200, 100, 50, 128));
    const original = image.clone();
    encodeJpg({ image: image });
    ImageTestUtils.testImageEquals(image, original);
  });

  /**
   * JpegData.read releases the DCT coefficients as they are used.
   */
  test('JpegData.read releases DCT coefficients', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'buck_24.jpg'
    );
    const jpeg = new JpegData();
    jpeg.read(bytes);
    for (const component of jpeg.frame!.components.values()) {
      expect(component.coefficients.length).toBe(0);
    }
    expect(jpeg.getImage().width).toBe(jpeg.width);
  });
});
