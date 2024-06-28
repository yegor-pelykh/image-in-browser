/** @format */

import { describe, expect, test } from 'vitest';
import { IfdShortValue, decodePng, decodeWebP, encodePng } from '../../src';
import { WebPDecoder } from '../../src/formats/webp-decoder';
import { WebPFormat } from '../../src/formats/webp/webp-format';
import { ImageTestUtils } from '../_utils/image-test-utils';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Contains information about a WebP file.
 */
type WebPFileInfo = {
  /**
   * The format of the WebP file.
   */
  format: WebPFormat;

  /**
   * The width of the WebP file in pixels.
   */
  width: number;

  /**
   * The height of the WebP file in pixels.
   */
  height: number;

  /**
   * Indicates whether the WebP file has an alpha channel.
   */
  hasAlpha: boolean;

  /**
   * Indicates whether the WebP file contains animation.
   */
  hasAnimation: boolean;

  /**
   * The number of frames in the WebP file, if it is animated.
   */
  numFrames?: number;
};

/**
 * Test suite for WEBP format handling.
 */
describe('Format: WEBP', () => {
  /**
   * Test for reading EXIF data from a WEBP image.
   */
  test('exif', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'buck_24.webp'
    );
    const webp = decodeWebP({
      data: input,
    });
    expect(webp).toBeDefined();
    if (webp === undefined) {
      return;
    }
    const correctOrientation = new IfdShortValue(1);
    expect(
      webp.exifData.imageIfd.getValue('Orientation')?.equals(correctOrientation)
    ).toBeTruthy();
  });

  /**
   * Test for decoding and processing animated lossy WEBP images.
   */
  test('animated_lossy', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'animated_lossy.webp'
    );
    const anim = decodeWebP({
      data: input,
    });
    expect(anim).toBeDefined();
    if (anim === undefined) {
      return;
    }
    for (const frame of anim.frames) {
      const output = encodePng({
        image: frame,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.webp,
        `animated_lossy_${frame.frameIndex}.png`,
        output
      );
    }
  });

  /**
   * Test for decoding a lossless WEBP image and comparing it to a PNG.
   */
  test("decode lossless 'test.webp'", () => {
    const inputWebp = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'test.webp'
    );
    const webp = decodeWebP({
      data: inputWebp,
    });
    expect(webp).toBeDefined();
    if (webp === undefined) {
      return;
    }

    const inputPng = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'test.png'
    );
    const png = decodePng({
      data: inputPng,
    });
    expect(png).toBeDefined();
    if (png === undefined) {
      return;
    }

    const outputPng = encodePng({
      image: webp,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.webp,
      'test.png',
      outputPng
    );

    ImageTestUtils.testImageEquals(webp, png);
  });

  /**
   * Test for validating the decoding of a WEBP image.
   */
  test('validate', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      '2b.webp'
    );
    const image = decodeWebP({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const output = encodePng({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.webp,
      'decode.png',
      output
    );

    // Validate decoding
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      '2b.png'
    );
    const debugImage = decodePng({
      data: bytes,
    });
    expect(debugImage).toBeDefined();
    if (debugImage === undefined) {
      return;
    }
    ImageTestUtils.testImageEquals(image, debugImage);
  });

  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.webp,
    '.webp'
  );

  for (const file of resFiles) {
    /**
     * Test for retrieving information from a WEBP file.
     */
    test(`get info - ${file.nameExt}`, () => {
      const input = TestUtils.readFromFilePath(file.path);
      const webpDecoder = new WebPDecoder(input);
      const data = webpDecoder.info;

      expect(data).toBeDefined();
      if (data === undefined) {
        return;
      }

      const test = webpTests.get(file.nameExt);
      if (test !== undefined) {
        expect(data.format).toBe(test.format);
        expect(data.width).toBe(test.width);
        expect(data.height).toBe(test.height);
        expect(data.hasAlpha).toBe(test.hasAlpha);
        expect(data.hasAnimation).toBe(test.hasAnimation);
        if (data.hasAnimation) {
          expect(webpDecoder.numFrames).toBe(test.numFrames);
        }
      }
    });

    /**
     * Test for decoding a WEBP file and saving it as a PNG.
     */
    test(`decode - ${file.nameExt}`, () => {
      const input = TestUtils.readFromFile(
        TestFolder.input,
        TestSection.webp,
        file.nameExt
      );
      const image = decodeWebP({
        data: input,
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      const output = encodePng({
        image: image,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.webp,
        `${file.nameExt}.png`,
        output
      );
    });
  }

  /**
   * Test for decoding a transparent animated WEBP image.
   */
  test('decode transparent animation', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'animated_transparency.webp'
    );
    const anim = decodeWebP({
      data: input,
    });
    expect(anim).toBeDefined();
    if (anim === undefined) {
      return;
    }

    expect(anim.numFrames).toBe(20);

    for (let i = 0; i < anim.numFrames; ++i) {
      const image = anim.getFrame(i);
      const output = encodePng({
        image: image,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.webp,
        `animated_transparency_${i}.png`,
        output
      );
    }
    expect(anim.getFrame(2).getPixel(0, 0).equals([0, 0, 0, 0])).toBeTruthy();
  });
});

const webpTests = new Map<string, WebPFileInfo>([
  [
    '1.webp',
    {
      format: WebPFormat.lossy,
      width: 550,
      height: 368,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    '1_webp_a.webp',
    {
      format: WebPFormat.lossy,
      width: 400,
      height: 301,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '1_webp_ll.webp',
    {
      format: WebPFormat.lossless,
      width: 400,
      height: 301,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '2.webp',
    {
      format: WebPFormat.lossy,
      width: 550,
      height: 404,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    '2b.webp',
    {
      format: WebPFormat.lossy,
      width: 75,
      height: 55,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    '2_webp_a.webp',
    {
      format: WebPFormat.lossy,
      width: 386,
      height: 395,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '2_webp_ll.webp',
    {
      format: WebPFormat.lossless,
      width: 386,
      height: 395,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '3.webp',
    {
      format: WebPFormat.lossy,
      width: 1280,
      height: 720,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    '3_webp_a.webp',
    {
      format: WebPFormat.lossy,
      width: 800,
      height: 600,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '3_webp_ll.webp',
    {
      format: WebPFormat.lossless,
      width: 800,
      height: 600,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '4.webp',
    {
      format: WebPFormat.lossy,
      width: 1024,
      height: 772,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    '4_webp_a.webp',
    {
      format: WebPFormat.lossy,
      width: 421,
      height: 163,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '4_webp_ll.webp',
    {
      format: WebPFormat.lossless,
      width: 421,
      height: 163,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '5.webp',
    {
      format: WebPFormat.lossy,
      width: 1024,
      height: 752,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    '5_webp_a.webp',
    {
      format: WebPFormat.lossy,
      width: 300,
      height: 300,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    '5_webp_ll.webp',
    {
      format: WebPFormat.lossless,
      width: 300,
      height: 300,
      hasAlpha: true,
      hasAnimation: false,
    },
  ],
  [
    'BladeRunner.webp',
    {
      format: WebPFormat.animated,
      width: 500,
      height: 224,
      hasAlpha: true,
      hasAnimation: true,
      numFrames: 75,
    },
  ],
  [
    'BladeRunner_lossy.webp',
    {
      format: WebPFormat.animated,
      width: 500,
      height: 224,
      hasAlpha: true,
      hasAnimation: true,
      numFrames: 75,
    },
  ],
  [
    'red.webp',
    {
      format: WebPFormat.lossy,
      width: 32,
      height: 32,
      hasAlpha: false,
      hasAnimation: false,
    },
  ],
  [
    'SteamEngine.webp',
    {
      format: WebPFormat.animated,
      width: 320,
      height: 240,
      hasAlpha: true,
      hasAnimation: true,
      numFrames: 31,
    },
  ],
  [
    'SteamEngine_lossy.webp',
    {
      format: WebPFormat.animated,
      width: 320,
      height: 240,
      hasAlpha: true,
      hasAnimation: true,
      numFrames: 31,
    },
  ],
]);
