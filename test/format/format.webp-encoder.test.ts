/** @format */

import { describe, expect, test } from 'vitest';
import { Format, MemoryImage, decodeWebP, encodeWebP } from '../../src';
import { VP8LBitWriter } from '../../src/formats/webp/vp8l-bit-writer';
import { writeHuffmanCode } from '../../src/formats/webp/vp8l-huffman-encoder';

/**
 * WEBP lossless encoder behavior.
 */
describe('Format: WEBP lossless', () => {
  test('a one channel image is grey, not red', () => {
    // Pixel.g and Pixel.b answer zero for a one channel image, so
    // reading them writes the picture in red, while the lossy path
    // converts to YUV and gets it right
    const gray = new MemoryImage({
      width: 32,
      height: 32,
      numChannels: 1,
    });
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        gray.getPixel(x, y).r = x * 8;
      }
    }

    const lossless = decodeWebP({ data: encodeWebP({ image: gray }) });
    expect(lossless).toBeDefined();
    if (lossless === undefined) {
      return;
    }
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const want = gray.getPixel(x, y).r;
        const p = lossless.getPixel(x, y);
        expect([p.r, p.g, p.b]).toEqual([want, want, want]);
      }
    }

    const lossy = decodeWebP({
      data: encodeWebP({ image: gray, lossless: false, quality: 95 }),
    });
    expect(lossy).toBeDefined();
    if (lossy === undefined) {
      return;
    }
    const p = lossy.getPixel(20, 5);
    expect(p.g).toBeCloseTo(p.r, -1);
    expect(p.b).toBeCloseTo(p.r, -1);
  });

  test('a sixteen bit image is scaled down, not clipped', () => {
    // Clamping instead of scaling turns every value above 255 white,
    // which is most of a 16 bit image.
    const deep = new MemoryImage({
      width: 64,
      height: 64,
      numChannels: 4,
      format: Format.uint16,
    });
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const p = deep.getPixel(x, y);
        p.r = x * 1024;
        p.g = y * 1024;
        p.b = 32768;
        p.a = 65535 - y * 512;
      }
    }

    const back = decodeWebP({ data: encodeWebP({ image: deep, exact: true }) });
    expect(back).toBeDefined();
    if (back === undefined) {
      return;
    }
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const p = deep.getPixel(x, y);
        const q = back.getPixel(x, y);
        expect(q.r).toBeCloseTo((p.r * 255) / 65535, 0);
        expect(q.g).toBeCloseTo((p.g * 255) / 65535, 0);
        expect(q.b).toBeCloseTo((p.b * 255) / 65535, 0);
        expect(q.a).toBeCloseTo((p.a * 255) / 65535, 0);
      }
    }
  });

  test('transparent pixels are kept by default and cleared only when asked', () => {
    const withHiddenColour = (): MemoryImage => {
      const image = new MemoryImage({
        width: 40,
        height: 30,
        numChannels: 4,
      });
      let seed = 7;
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 40; x++) {
          seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
          const p = image.getPixel(x, y);
          p.r = (seed >> 8) & 0xff;
          p.g = (seed >> 12) & 0xff;
          p.b = (seed >> 16) & 0xff;
          // A transparent left half against an opaque right half.
          p.a = x < 20 ? 0 : 255;
        }
      }
      return image;
    };

    const original = withHiddenColour();

    const strictImage = decodeWebP({ data: encodeWebP({ image: original }) });
    const looseImage = decodeWebP({
      data: encodeWebP({ image: original, exact: false }),
    });
    expect(strictImage).toBeDefined();
    expect(looseImage).toBeDefined();
    if (strictImage === undefined || looseImage === undefined) {
      return;
    }

    let cleared = 0;
    for (let y = 0; y < original.height; y++) {
      for (let x = 0; x < original.width; x++) {
        const want = original.getPixel(x, y);
        const loose = looseImage.getPixel(x, y);
        const strict = strictImage.getPixel(x, y);

        // Alpha survives either way, and so does every visible pixel.
        expect(loose.a).toBe(want.a);
        expect(strict.a).toBe(want.a);
        if (want.a !== 0) {
          expect([loose.r, loose.g, loose.b]).toEqual([want.r, want.g, want.b]);
        }

        expect([strict.r, strict.g, strict.b]).toEqual([
          want.r,
          want.g,
          want.b,
        ]);
        if (
          want.a === 0 &&
          loose.r === 0 &&
          loose.g === 0 &&
          loose.b === 0 &&
          want.r !== 0
        ) {
          cleared++;
        }
      }
    }
    expect(cleared).toBeGreaterThan(0);

    // The whole point of clearing is that it codes smaller.
    expect(encodeWebP({ image: original, exact: false }).length).toBeLessThan(
      encodeWebP({ image: original }).length
    );
  });

  test('a code with one symbol costs no bits', () => {
    // A length of one puts a spare bit before every token of the group
    // and the rest of the stream decodes as garbage. Only symbols above
    // 255 reach it: the simple format takes the rest.
    for (const symbol of [0, 1, 7, 255, 268, 279]) {
      const lengths = new Array<number>(280).fill(0);
      lengths[symbol] = 1;
      writeHuffmanCode(new VP8LBitWriter(), 280, lengths);
      expect(lengths[symbol]).toBe(0);
    }
  });
});
