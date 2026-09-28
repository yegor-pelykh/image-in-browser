/** @format */

import { existsSync } from 'fs';
import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  ColorRgba8,
  Format,
  IccProfile,
  IccProfileCompression,
  IfdShortValue,
  LibError,
  MemoryImage,
  Pixel,
  decodePng,
  decodeWebP,
  encodePng,
  encodeWebP,
} from '../../src';
import { WebPDecoder } from '../../src/formats/webp-decoder';
import { VP8Config } from '../../src/formats/webp/vp8-config';
import { encodeVP8 } from '../../src/formats/webp/vp8-encoder';
import { WebPFormat } from '../../src/formats/webp/webp-format';
import { VP8LEncoder, maxDimension } from '../../src/formats/webp/vp8l-encoder';
import { computeMatches } from '../../src/formats/webp/vp8l-backward-refs';
import { VP8LCostModel } from '../../src/formats/webp/vp8l-cost-model';
import { VP8LCover } from '../../src/formats/webp/vp8l-cover';
import {
  VP8LMatches,
  maxMatchDistance,
  maxMatchLength,
  matchLengthBits,
} from '../../src/formats/webp/vp8l-matches';
import { optimalCover } from '../../src/formats/webp/vp8l-optimal-parse';
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
   * A skipped macroblock's inner edges are not deblocked, so a soft step on a
   * 4x4 edge next to coded macroblocks has to survive.
   */
  test('skipped macroblocks keep their inner edges unfiltered', () => {
    // `cwebp -q 30 -segments 1 -f 100` of a 48x48 synthetic image, and
    // dwebp 1.6.0's decode of it. One segment and a strong filter put skipped
    // 16x16 macroblocks with a soft step on a 4x4 edge next to coded ones,
    // and the step has to survive. The one level of slack is libwebp's own
    // YUV to RGB rounding.
    const decoded = decodeWebP({
      data: TestUtils.readFromFile(
        TestFolder.input,
        TestSection.webp,
        'inner_filter_skip.webp'
      ),
    });
    const libwebp = decodePng({
      data: TestUtils.readFromFile(
        TestFolder.input,
        TestSection.webp,
        'inner_filter_skip_libwebp.png'
      ),
    });
    expect(decoded).toBeDefined();
    expect(libwebp).toBeDefined();
    if (decoded === undefined || libwebp === undefined) {
      return;
    }
    expect(decoded.width).toBe(libwebp.width);
    expect(decoded.height).toBe(libwebp.height);
    for (const p of decoded) {
      const q = libwebp.getPixel(p.x, p.y);
      const worst = Math.max(
        Math.abs(p.r - q.r),
        Math.abs(p.g - q.g),
        Math.abs(p.b - q.b)
      );
      expect(worst).toBeLessThanOrEqual(1);
    }
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

  /**
   * An animated file reads its ICCP chunk on a path of its own, and the name
   * the decoder supplies has to be one a PNG keyword can hold.
   */
  test('an animation carries a profile name a PNG keyword can hold', () => {
    const anim = new MemoryImage({ width: 4, height: 4, numChannels: 4 });
    anim.clear(new ColorRgba8(10, 20, 30, 255));
    anim.iccProfile = new IccProfile(
      'p',
      IccProfileCompression.none,
      Uint8Array.from({ length: 64 }, (_, i) => i)
    );
    const frame = new MemoryImage({ width: 4, height: 4, numChannels: 4 });
    frame.clear(new ColorRgba8(200, 20, 30, 255));
    anim.addFrame(frame);
    const decoded = decodeWebP({ data: encodeWebP({ image: anim }) });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    expect(decoded.numFrames).toBe(2);
    const profile = decoded.iccProfile;
    expect(profile).toBeDefined();
    if (profile === undefined) {
      return;
    }
    expect(profile.name.length).toBeGreaterThanOrEqual(1);
    expect(profile.name.length).toBeLessThanOrEqual(79);
    expect(pngKeyword(encodePng({ image: decoded }), 'iCCP')).toBe(
      profile.name
    );
  });

  /**
   * An ICCP chunk carries no name of its own, so the decoder supplies one.
   * PNG writes it as the iCCP keyword, which has to be 1 to 79 printable
   * bytes: an empty one makes the PNG it lands in invalid.
   */
  for (const name of ['red', 'test']) {
    test(`a decoded profile carries a name a PNG keyword can hold, ${name}`, () => {
      const image = decodeWebP({
        data: TestUtils.readFromFile(
          TestFolder.input,
          TestSection.webp,
          `${name}.webp`
        ),
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }
      const profile = image.iccProfile;
      expect(profile).toBeDefined();
      if (profile === undefined) {
        return;
      }
      expect(profile.name.length).toBeGreaterThanOrEqual(1);
      expect(profile.name.length).toBeLessThanOrEqual(79);
      for (let i = 0; i < profile.name.length; i++) {
        const c = profile.name.charCodeAt(i);
        expect(c).toBeGreaterThanOrEqual(0x21);
        expect(c).toBeLessThanOrEqual(0x7e);
      }

      expect(pngKeyword(encodePng({ image }), 'iCCP')).toBe(profile.name);
    });
  }

  /**
   * The lossless match search and optimal parse, which run with bounds checks
   * off and so cannot be observed through a round trip alone.
   */
  describe('match search', () => {
    /**
     * A deterministic linear congruential generator for the content tests.
     */
    const rnd = (seed: number): (() => number) => {
      let s = seed >>> 0;
      return () => {
        s = (Math.imul(s, 1103515245) + 12345) >>> 0;
        return s;
      };
    };

    test('a match packs into one word whatever it holds', () => {
      // The word carries the distance above the length. Both fields have to
      // fit, and together they have to fit an unsigned thirty two bit element,
      // or one silently eats into the other.
      expect(maxMatchLength).toBe((1 << matchLengthBits) - 1);
      expect(maxMatchDistance).toBeLessThan(1 << (32 - matchLengthBits));
      const widest = (maxMatchDistance << matchLengthBits) | maxMatchLength;
      expect(widest >>> 0).toBeLessThanOrEqual(0xffffffff);

      const packed = new Uint32Array(1);
      packed[0] = widest;
      expect(packed[0] & maxMatchLength).toBe(maxMatchLength);
      expect(packed[0] >>> matchLengthBits).toBe(maxMatchDistance);
      expect(maxMatchLength).toBeLessThan(1 << 16);
    });

    test('every near-neighbour offset stays inside the planes', () => {
      // They index the planes backwards with bounds checks off, and the width
      // they come from is capped well below the largest distance.
      for (const width of [1, 2, 3, 4, 17, 1024, maxDimension]) {
        const numPixels = width * 4;
        const planes = Array.from(
          { length: 4 },
          () => new Uint8Array(numPixels)
        );
        const matches = computeMatches(
          planes[0],
          planes[1],
          planes[2],
          planes[3],
          numPixels,
          width
        );
        for (const d of matches.cheapDistances) {
          expect(d).toBeGreaterThanOrEqual(1);
          expect(d).toBeLessThan(numPixels);
          expect(d).toBeLessThanOrEqual(maxMatchDistance);
        }
        expect(matches.cheapDistances.length).toBeLessThanOrEqual(5);
      }
    });

    /**
     * Every match computeMatches reports has to be real: inside the image,
     * behind the position, and repeating pixel for pixel.
     */
    const expectMatchesHold = (
      matches: VP8LMatches,
      r: Uint8Array,
      g: Uint8Array,
      b: Uint8Array,
      a: Uint8Array,
      n: number
    ): void => {
      expect(matches.match.length).toBe(n);
      for (let i = 0; i < n; i++) {
        const len = matches.lengthAt(i);
        if (len === 0) {
          continue;
        }
        const d = matches.distanceAt(i);
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(i);
        expect(i + len).toBeLessThanOrEqual(n);
        for (let t = i; t < i + len; t++) {
          if (
            r[t] !== r[t - d] ||
            g[t] !== g[t - d] ||
            b[t] !== b[t - d] ||
            a[t] !== a[t - d]
          ) {
            throw new Error(
              `match at ${i}, length ${len}, distance ${d} breaks at ${t}`
            );
          }
        }
      }
    };

    test('a run at distance 1 is clipped to the length field', () => {
      // One colour over 9000 pixels: every position repeats the one before for
      // the rest of the image, more than one match can say.
      const width = 100;
      const n = width * 90;
      const zero = new Uint8Array(n);
      const g = new Uint8Array(n);
      g.fill(7);
      const matches = computeMatches(zero, g, zero, zero, n, width);
      expect(matches.lengthAt(0)).toBe(0);
      for (let i = 1; i < n; i++) {
        const want = n - i < maxMatchLength ? n - i : maxMatchLength;
        expect(matches.lengthAt(i)).toBe(want);
        expect(matches.distanceAt(i)).toBe(1);
      }
      expectMatchesHold(matches, zero, g, zero, zero, n);
    });

    test('a run at distance 2 is clipped to the length field', () => {
      // Two colours alternating, so only even offsets repeat and the counter
      // for distance 2 is the one that has to stop at the cap.
      const width = 101;
      const n = width * 90;
      const zero = new Uint8Array(n);
      const g = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        g[i] = (i & 1) === 0 ? 10 : 200;
      }
      const matches = computeMatches(zero, g, zero, zero, n, width);
      expect(matches.lengthAt(0)).toBe(0);
      expect(matches.lengthAt(1)).toBe(0);
      for (let i = 2; i < n; i++) {
        const want = n - i < maxMatchLength ? n - i : maxMatchLength;
        expect(matches.lengthAt(i)).toBe(want);
        expect(matches.distanceAt(i)).toBe(2);
      }
      expectMatchesHold(matches, zero, g, zero, zero, n);
    });

    test('every reported match repeats, on mixed content', () => {
      for (const size of [
        [1, 1],
        [2, 3],
        [5, 1],
        [37, 23],
        [64, 80],
        [150, 60],
      ]) {
        const w = size[0];
        const n = w * size[1];
        const r = new Uint8Array(n);
        const g = new Uint8Array(n);
        const b = new Uint8Array(n);
        const a = new Uint8Array(n);
        const next = rnd(n);
        for (let i = 0; i < n; i++) {
          // Rows that repeat, stretches of one colour, and noise.
          const y = Math.trunc(i / w);
          const kind = y % 3;
          r[i] = kind === 0 ? (i % w) & 0xff : next() % 4;
          g[i] = kind === 1 ? 9 : next() % 4;
          b[i] = kind === 2 ? next() % 256 : 5;
          a[i] = 255;
        }
        expectMatchesHold(computeMatches(r, g, b, a, n, w), r, g, b, a, n);
      }
    });

    test('the parse refuses matches computed for another image', () => {
      // optimalCover indexes its own tables by position plus match length, so a
      // table from a longer image would write past their end.
      const w = 16;
      const n = w * 8;
      const plane = new Uint8Array(n * 2);
      const matches = computeMatches(plane, plane, plane, plane, n * 2, w);
      const r = new Uint8Array(n);
      const cover = new VP8LCover(n);
      cover.cover.fill(1, 0, n);
      const costs = VP8LCostModel.fromCover(cover, r, r, r, r, w);
      // The guard, not an out of range index.
      expect(() =>
        { optimalCover(matches, costs, r, r, r, r, w, new VP8LCover(n)); }
      ).toThrow(LibError);
    });

    test('lossless output of a real image is stable and decodes exactly', () => {
      // A candidate the parse stops weighing, or the wrong distance traced back
      // for one, still decodes exactly and only shows as other bytes. The
      // output has to at least be deterministic, and the round trip exact.
      for (const name of ['alpha', 'alpha_edge', 'png_LA']) {
        const image = decodePng({
          data: TestUtils.readFromFile(
            TestFolder.input,
            TestSection.png,
            `${name}.png`
          ),
        });
        expect(image).toBeDefined();
        if (image === undefined) {
          continue;
        }
        const a = encodeWebP({ image });
        const b = encodeWebP({ image });
        expect(a).toEqual(b);
        const back = decodeWebP({ data: a });
        expect(back).toBeDefined();
        if (back === undefined) {
          continue;
        }
        expect(back.width).toBe(image.width);
        expect(back.height).toBe(image.height);
        for (const p of image) {
          const q = back.getPixel(p.x, p.y);
          expect([q.r, q.g, q.b, q.a]).toEqual([p.r, p.g, p.b, p.a]);
        }
      }
    });

    // Where the run walks can step off the end: runs touching the last pixel,
    // runs at exactly the near-neighbour offsets, and widths too narrow for
    // five distinct offsets.
    for (const shape of [
      [1, 1],
      [1, 64],
      [64, 1],
      [2, 2],
      [3, 5],
      [4, 4],
      [17, 17],
      [64, 80],
      [80, 64],
    ]) {
      const w = shape[0];
      const h = shape[1];
      test(`lossless round-trip is exact at ${w}x${h}`, () => {
        const next = rnd(w * 1000 + h);
        for (const kind of ['flat', 'rows', 'noise', 'runs']) {
          const src = new MemoryImage({ width: w, height: h, numChannels: 4 });
          for (const p of src) {
            switch (kind) {
              case 'flat':
                p.r = 9;
                p.g = 9;
                p.b = 9;
                p.a = 255;
                break;
              case 'rows':
                // Repeats at exactly width, and at width plus and minus one on
                // the diagonal.
                p.r = p.x & 1;
                p.g = p.y & 1;
                p.b = (p.x + p.y) & 1;
                p.a = 255;
                break;
              case 'noise':
                p.r = next() % 256;
                p.g = next() % 256;
                p.b = next() % 256;
                p.a = next() % 256;
                break;
              case 'runs': {
                // Long stretches of one colour broken by single pixels, so a
                // run can end on the last pixel of the image.
                const v = Math.trunc((p.y * w + p.x) / 97) & 1;
                p.r = v * 255;
                p.g = v * 255;
                p.b = v * 255;
                p.a = 255;
                break;
              }
            }
          }
          const back = decodeWebP({ data: encodeWebP({ image: src }) });
          expect(back).toBeDefined();
          if (back === undefined) {
            return;
          }
          expect(back.width).toBe(w);
          expect(back.height).toBe(h);
          for (const p of src) {
            const q = back.getPixel(p.x, p.y);
            expect([q.r, q.g, q.b, q.a]).toEqual([p.r, p.g, p.b, p.a]);
          }
        }
      });
    }

    test('a run longer than the length field round-trips', () => {
      // One colour across more pixels than a single match can cover, so the
      // search has to clip and start again rather than wrap the field.
      const w = Math.trunc(maxMatchLength / 4);
      const src = new MemoryImage({ width: w, height: 9, numChannels: 4 });
      src.clear(new ColorRgba8(3, 200, 77, 255));
      const back = decodeWebP({ data: encodeWebP({ image: src }) });
      expect(back).toBeDefined();
      if (back === undefined) {
        return;
      }
      for (const p of src) {
        const q = back.getPixel(p.x, p.y);
        expect([q.r, q.g, q.b, q.a]).toEqual([3, 200, 77, 255]);
      }
    });
  });
});

/**
 * The null terminated keyword a PNG chunk opens with.
 */
function pngKeyword(bytes: Uint8Array, id: string): string | undefined {
  let p = 8;
  while (p + 8 <= bytes.length) {
    const size =
      (bytes[p] << 24) |
      (bytes[p + 1] << 16) |
      (bytes[p + 2] << 8) |
      bytes[p + 3];
    if (String.fromCharCode(...bytes.subarray(p + 4, p + 8)) === id) {
      const start = p + 8;
      let end = start;
      while (end < start + size && bytes[end] !== 0) {
        end++;
      }
      return String.fromCharCode(...bytes.subarray(start, end));
    }
    p += 12 + size;
  }
  return undefined;
}

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
