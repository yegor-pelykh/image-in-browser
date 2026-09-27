/** @format */

import { existsSync } from 'fs';
import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  Format,
  IfdShortValue,
  MemoryImage,
  Pixel,
  decodePng,
  decodeWebP,
  encodeWebP,
} from '../../src';
import { WebPDecoder } from '../../src/formats/webp-decoder';
import { VP8Config } from '../../src/formats/webp/vp8-config';
import { encodeVP8 } from '../../src/formats/webp/vp8-encoder';
import { WebPFormat } from '../../src/formats/webp/webp-format';
import { VP8LEncoder } from '../../src/formats/webp/vp8l-encoder';
import {
  WebPChunk,
  buildRiff,
  vp8xChunkData,
  vp8xFlags,
} from '../../src/formats/webp/webp-chunk';
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
 * WEBP format handling.
 */
describe('Format: WEBP', () => {
  /**
   * Decodes buck_24.webp and verifies Orientation EXIF tag equals 1.
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
      webp.exifData.imageIfd.get('Orientation')?.equals(correctOrientation)
    ).toBeTruthy();
  });

  /**
   * Decoding and processing animated lossy WEBP images.
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
      const output = encodeWebP({
        image: frame,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.webp,
        `animated_lossy_${frame.frameIndex}.webp`,
        output
      );
    }
  });

  /**
   * Decodes test_animated.webp and verifies at least one visible non-transparent pixel exists.
   */
  test('lossless with subtractGreen transform', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'test_animated.webp'
    );
    const image = decodeWebP({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    let hasVisiblePixel = false;
    for (const pixel of image) {
      if (pixel.a > 0 && (pixel.r > 0 || pixel.g > 0 || pixel.b > 0)) {
        hasVisiblePixel = true;
        break;
      }
    }
    expect(hasVisiblePixel).toBeTruthy();
  });

  /**
   * Decodes 2b.webp, re-encodes, and compares pixel data against reference 2b.png.
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

    const output = encodeWebP({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.webp,
      'decode.webp',
      output
    );

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

  /**
   * Decoding a WebP image with an invalid last row,
   * Ensuring pixel alpha values are correctly processed.
   */
  test('webp invalid decode', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'invalid_last_row.webp'
    );
    const webp = decodeWebP({
      data: input,
    });
    expect(webp).toBeDefined();
    if (webp === undefined) {
      return;
    }

    let pixelAlpha = webp.getPixel(0, webp.height - 2).a;
    expect(pixelAlpha).not.toBe(0);

    pixelAlpha = webp.getPixel(0, webp.height - 1).a;
    expect(pixelAlpha).not.toBe(0);
  });

  /**
   * Decodes animated_transparency.webp, verifies 20 frames, and checks frame 2 pixel is fully transparent.
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
      const output = encodeWebP({
        image: image,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.webp,
        `animated_transparency_${i}.webp`,
        output
      );
    }
    expect(anim.getFrame(2).getPixel(0, 0).equals([0, 0, 0, 0])).toBeTruthy();
  });

  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.webp,
    '.webp'
  );

  for (const file of resFiles) {
    /**
     * Retrieving information from a WEBP file.
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
     * Decoding a WEBP file and saving it as a PNG.
     */
    test(`decode webp - ${file.nameExt}`, () => {
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

      const output = encodeWebP({
        image: image,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.webp,
        file.nameExt,
        output
      );

      const pngPath = TestUtils.preparePath(
        TestFolder.output,
        TestSection.webp,
        `${file.name}.png`
      );
      if (!existsSync(pngPath)) {
        return;
      }

      const input2 = TestUtils.readFromFilePath(pngPath);
      const image2 = decodePng({
        data: input2,
      });
      expect(image2).toBeDefined();
      if (image2 === undefined) {
        return;
      }

      const png4 =
        image2.numChannels !== 4
          ? image2.convert({
              numChannels: 4,
              alpha: 255,
            })
          : image2;

      expect(image.width).toBe(png4.width);
      expect(image.height).toBe(png4.height);
    });
  }

  /**
   * Round-trip encodes/decodes 1_webp_ll.webp and verifies pixel-perfect RGBA equality.
   */
  test('encode round-trip lossless', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      '1_webp_ll.webp'
    );
    const original = decodeWebP({
      data: input,
    });
    expect(original).toBeDefined();
    if (original === undefined) {
      return;
    }

    const encoded = encodeWebP({
      image: original,
    });
    const decoded = decodeWebP({
      data: encoded,
    });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }

    expect(decoded.width).toBe(original.width);
    expect(decoded.height).toBe(original.height);

    for (let y = 0; y < original.height; y++) {
      for (let x = 0; x < original.width; x++) {
        const op = original.getPixel(x, y);
        const dp = decoded.getPixel(x, y);
        expect(dp.r).toBe(op.r);
        expect(dp.g).toBe(op.g);
        expect(dp.b).toBe(op.b);
        expect(dp.a).toBe(op.a);
      }
    }
  });

  /**
   * Encodes a 4×4 RGB image to WebP and verifies pixel-perfect round-trip.
   */
  test('encode rgb image', () => {
    const image = new MemoryImage({
      width: 4,
      height: 4,
    });
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const p = image.getPixel(x, y);
        p.r = x * 60;
        p.g = y * 60;
        p.b = 128;
      }
    }

    const encoded = encodeWebP({
      image: image,
    });
    const decoded = decodeWebP({
      data: encoded,
    });

    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }

    expect(decoded.width).toBe(4);
    expect(decoded.height).toBe(4);

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const dp = decoded.getPixel(x, y);
        expect(dp.r).toBe(x * 60);
        expect(dp.g).toBe(y * 60);
        expect(dp.b).toBe(128);
        expect(dp.a).toBe(255);
      }
    }
  });

  /**
   * Encodes a 4×4 RGBA image with varying per-pixel alpha and verifies round-trip.
   */
  test('encode rgba image with alpha', () => {
    const image = new MemoryImage({
      width: 4,
      height: 4,
      numChannels: 4,
    });
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const p = image.getPixel(x, y);
        p.r = 100;
        p.g = 150;
        p.b = 200;
        p.a = (x + y * 4) * 16;
      }
    }

    const encoded = encodeWebP({
      image: image,
    });
    const decoded = decodeWebP({
      data: encoded,
    });

    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }

    expect(decoded.width).toBe(4);
    expect(decoded.height).toBe(4);

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const dp = decoded.getPixel(x, y);
        expect(dp.r).toBe(100);
        expect(dp.g).toBe(150);
        expect(dp.b).toBe(200);
        expect(dp.a).toBe((x + y * 4) * 16);
      }
    }
  });

  /**
   * A plane whose last backward reference reaches the end of the image decodes
   * correctly for a variety of sizes.
   */
  for (const size of [
    [65, 32],
    [65, 64],
    [32, 32],
    [32, 64],
  ]) {
    const w = size[0];
    const h = size[1];
    test(`a plane whose last backward reference reaches the end of the image decodes, at ${w}x${h}`, () => {
      const source = new MemoryImage({
        width: w,
        height: h,
        numChannels: 4,
      });
      for (const pixel of source) {
        pixel.r = 128;
        pixel.g = 128;
        pixel.b = 128;
        pixel.a = (pixel.y * w + pixel.x) % 256;
      }

      const encoded = encodeWebP({
        image: source,
        lossless: false,
        quality: 100,
        method: 6,
      });
      const decoded = decodeWebP({
        data: encoded,
      });
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        return;
      }
      expect(decoded.width).toBe(w);
      expect(decoded.height).toBe(h);
      for (const pixel of source) {
        const q = decoded.getPixel(pixel.x, pixel.y);
        expect(q.a).toBe(pixel.a);
      }
    });
  }

  /**
   * The same end of band case on the full ARGB path, which a plane that is not
   * a bare palette takes.
   */
  test('a plane without a palette whose last backward reference reaches the end of the image decodes', () => {
    // The encoder here always writes the alpha plane as a palette, so noise in
    // red keeps it from being one; only green is read back as alpha. The bottom
    // half repeats the top, so the plane ends on a long backward reference.
    const w = 16;
    const h = 64;
    const plane = new Uint8Array(w * h);
    const red = new Uint8Array(w * h);
    let seed = 1;
    for (let y = 0; y < h; y++) {
      const sy = y >= h >> 1 ? y - (h >> 1) : y;
      for (let x = 0; x < w; x++) {
        plane[y * w + x] = (x + sy) & 0xff;
        if (sy === y) {
          seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
          red[y * w + x] = (seed >> 16) & 0xff;
        } else {
          red[y * w + x] = red[sy * w + x];
        }
      }
    }
    // The encoder transforms its input in place
    const stream = new VP8LEncoder({ exact: true }).encodeStream(
      red.slice(),
      plane.slice(),
      new Uint8Array(w * h),
      new Uint8Array(w * h),
      w,
      h,
      true
    );
    // The first transform is not color indexing
    expect(stream[0] & 7).not.toBe(7);

    const opaque = new MemoryImage({ width: w, height: h });
    opaque.clear(new ColorRgb8(128, 128, 128));
    const bytes = buildRiff([
      new WebPChunk(
        'VP8X',
        vp8xChunkData(vp8xFlags(false, true, false, false, false), w, h)
      ),
      // Lossless compression, no filter
      new WebPChunk('ALPH', new Uint8Array([1, ...stream])),
      new WebPChunk('VP8 ', encodeVP8(opaque, new VP8Config()).bitstream),
    ]);

    const decoded = decodeWebP({ data: bytes });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    for (let i = 0; i < w * h; i++) {
      expect(decoded.getPixel(i % w, Math.trunc(i / w)).a).toBe(plane[i]);
    }
  });

  /**
   * Sixteen-bit two-channel grey+alpha images keep their transparency when
   * round-tripped through the lossless WebP encoder.
   */
  for (const name of [
    'basi4a16.png',
    'basn4a16.png',
    'bgai4a16.png',
    'bggn4a16.png',
  ]) {
    test(`a sixteen bit two channel image keeps its transparency, ${name}`, () => {
      const input = TestUtils.readFromFile(
        TestFolder.input,
        TestSection.png,
        name
      );
      const source = decodePng({
        data: input,
      });
      expect(source).toBeDefined();
      if (source === undefined) {
        return;
      }
      expect(source.format).toBe(Format.uint16);
      expect(source.numChannels).toBe(2);

      const encoded = encodeWebP({
        image: source,
      });
      const back = decodeWebP({
        data: encoded,
      });
      expect(back).toBeDefined();
      if (back === undefined) {
        return;
      }
      expect(back.width).toBe(source.width);
      expect(back.height).toBe(source.height);
      for (const p of source) {
        const grey = Math.round((p.r * 255) / 65535);
        const alpha = Math.round((p.a * 255) / 65535);
        const q = back.getPixel(p.x, p.y);
        expect(q.a).toBe(alpha);
        if (alpha !== 0) {
          expect([q.r, q.g, q.b]).toEqual([grey, grey, grey]);
        }
      }
    });
  }

  /**
   * Encodes a 2×2 RGBA image to WebP, writes to disk, and verifies decode.
   */
  test('encodeWebP', () => {
    const image = new MemoryImage({
      width: 2,
      height: 2,
      numChannels: 4,
    });
    let p: Pixel | undefined = undefined;
    p = image.getPixel(0, 0);
    p.r = 255;
    p.g = 0;
    p.b = 0;
    p.a = 255;
    p = image.getPixel(1, 0);
    p.r = 0;
    p.g = 255;
    p.b = 0;
    p.a = 128;
    p = image.getPixel(0, 1);
    p.r = 0;
    p.g = 0;
    p.b = 255;
    p.a = 64;
    p = image.getPixel(1, 1);
    p.r = 255;
    p.g = 255;
    p.b = 0;
    p.a = 0;

    const output = encodeWebP({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.webp,
      'encode_test.webp',
      output
    );

    const input = TestUtils.readFromFile(
      TestFolder.output,
      TestSection.webp,
      'encode_test.webp'
    );
    const decoded = decodeWebP({
      data: input,
    });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }

    expect(decoded.width).toBe(2);
    expect(decoded.height).toBe(2);
    expect(decoded.getPixel(0, 0).r).toBe(255);
    expect(decoded.getPixel(1, 0).g).toBe(255);
    expect(decoded.getPixel(0, 1).b).toBe(255);
    expect(decoded.getPixel(1, 1).a).toBe(0);
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
