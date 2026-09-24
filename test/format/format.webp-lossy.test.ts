/** @format */

import { describe, expect, test } from 'vitest';
import { MemoryImage, decodeWebP, encodeWebP } from '../../src';
import { VP8Config } from '../../src/formats/webp/vp8-config';
import { maxCost } from '../../src/formats/webp/vp8-rd';
import { sar } from '../../src/formats/webp/vp8-sar';
import { VP8EncState } from '../../src/formats/webp/vp8-state';
import { importYuv } from '../../src/formats/webp/vp8-yuv';
import { maxDimension } from '../../src/formats/webp/vp8l-encoder';

/**
 * WEBP lossy encoder behavior.
 */
describe('Format: WEBP lossy', () => {
  /**
   * A picture with smooth areas, an edge and some texture, which is
   * enough to exercise every prediction mode.
   */
  const scene = (w: number, h: number, alpha = false): MemoryImage => {
    const image = new MemoryImage({
      width: w,
      height: h,
      numChannels: alpha ? 4 : 3,
    });
    let seed = 3;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
        const noise = (seed >> 16) & 7;
        const edge = x > Math.trunc(w / 2) ? 60 : 0;
        const p = image.getPixel(x, y);
        p.r = clamp255(Math.trunc((x * 255) / w) + edge + noise);
        p.g = clamp255(Math.trunc((y * 255) / h) + noise);
        p.b = clamp255(128 - edge + noise);
        if (alpha) {
          // A hard-edged transparent corner, which is where the alpha
          // plane and the colour under it are most likely to go wrong.
          p.a = x < Math.trunc(w / 3) && y < Math.trunc(h / 3) ? 0 : 255;
        }
      }
    }
    return image;
  };

  const clamp255 = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);

  const psnr = (
    a: MemoryImage,
    b: MemoryImage,
    visibleOnly = false
  ): number => {
    let sse = 0.0;
    let count = 0;
    for (let y = 0; y < a.height; y++) {
      for (let x = 0; x < a.width; x++) {
        const p = a.getPixel(x, y);
        const q = b.getPixel(x, y);
        if (visibleOnly && p.a === 0) {
          continue;
        }
        for (const d of [p.r - q.r, p.g - q.g, p.b - q.b]) {
          sse += d * d;
          count++;
        }
      }
    }
    if (sse === 0) {
      return 99;
    }
    return 10 * (Math.log((255 * 255 * count) / sse) / Math.LN10);
  };

  test('round-trips close to the source', () => {
    const source = scene(96, 64);
    const bytes = encodeWebP({ image: source, lossless: false });
    const decoded = decodeWebP({ data: bytes });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    expect(decoded.width).toBe(96);
    expect(decoded.height).toBe(64);
    // Lossy, so not pixel for pixel, but nothing like a different image.
    expect(psnr(source, decoded)).toBeGreaterThan(30);
  });

  test('is a lossy VP8 bitstream, not a lossless one', () => {
    const bytes = encodeWebP({ image: scene(64, 64), lossless: false });
    expect(String.fromCharCode(...bytes.subarray(12, 16))).toBe('VP8 ');
    expect(bytes.length).toBeLessThan(
      encodeWebP({ image: scene(64, 64) }).length
    );
  });

  test('quality trades size against fidelity', () => {
    const source = scene(128, 96);
    const low = encodeWebP({ image: source, lossless: false, quality: 20 });
    const high = encodeWebP({ image: source, lossless: false, quality: 95 });
    expect(low.length).toBeLessThan(high.length);
    const lowDecoded = decodeWebP({ data: low });
    const highDecoded = decodeWebP({ data: high });
    expect(lowDecoded).toBeDefined();
    expect(highDecoded).toBeDefined();
    if (lowDecoded === undefined || highDecoded === undefined) {
      return;
    }
    expect(psnr(source, lowDecoded)).toBeLessThan(psnr(source, highDecoded));
  });

  test('every effort level codes a valid stream', () => {
    // The trellis only runs at the two highest levels, and the fast
    // levels take a different path through the mode search entirely, so
    // nothing below exercises them.
    const source = scene(64, 48);
    for (let method = 0; method <= 6; method++) {
      const bytes = encodeWebP({ image: source, lossless: false, method });
      const decoded = decodeWebP({ data: bytes });
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        continue;
      }
      expect(psnr(source, decoded)).toBeGreaterThan(30);
    }
  });

  test('diffuses the chroma DC error below quality 98', () => {
    // Banding is what this is for: on a smooth ramp every block rounds
    // its chroma DC the same way and the result is a staircase, so the
    // leftover is spread into the neighbours instead. It is off at the
    // top of the quality range, where there is nothing to spread.
    const ramp = (w: number, h: number): MemoryImage => {
      const image = new MemoryImage({ width: w, height: h });
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = image.getPixel(x, y);
          p.r = 128 + Math.trunc((x * 32) / w);
          p.g = 128;
          p.b = 128 - Math.trunc((x * 16) / w);
        }
      }
      return image;
    };

    const yuv = importYuv(ramp(16, 16));
    expect(
      new VP8EncState(new VP8Config({ quality: 98 }), yuv).topDerr
    ).not.toBeUndefined();
    expect(
      new VP8EncState(new VP8Config({ quality: 99 }), yuv).topDerr
    ).toBeUndefined();

    const source = ramp(128, 64);
    for (const quality of [10, 50, 98, 99]) {
      const bytes = encodeWebP({ image: source, lossless: false, quality });
      const decoded = decodeWebP({ data: bytes });
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        continue;
      }
      expect(psnr(source, decoded)).toBeGreaterThan(30);
    }

    // The error travels between macroblocks, so it has to survive a
    // picture that is not a whole number of them in either direction.
    expect(
      decodeWebP({
        data: encodeWebP({ image: ramp(37, 21), lossless: false }),
      })
    ).toBeDefined();
  });

  test('alphaQuality reduces the alpha plane, and 100 keeps it', () => {
    // A radial falloff, as in a real soft mask: a linear ramp is what
    // the horizontal filter predicts perfectly, so its alpha plane is
    // already almost free and there is nothing for this to save.
    const size = 128;
    const source = new MemoryImage({
      width: size,
      height: size,
      numChannels: 4,
    });
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x - size / 2) / (size / 2);
        const dy = (y - size / 2) / (size / 2);
        const r = Math.sqrt(dx * dx + dy * dy);
        const p = source.getPixel(x, y);
        p.r = 40 + x;
        p.g = 90;
        p.b = 200 - y;
        p.a = Math.round(255 * Math.min(Math.max(1 - r, 0), 1));
      }
    }
    const levels = (image: MemoryImage): number => {
      const seen = new Set<number>();
      for (const p of image) {
        seen.add(Math.trunc(p.a));
      }
      return seen.size;
    };

    // The default keeps every level, whatever the lossy quality is.
    const exact = decodeWebP({
      data: encodeWebP({
        image: source,
        lossless: false,
        quality: 40,
        alphaQuality: 100,
      }),
    });
    expect(exact).toBeDefined();
    if (exact === undefined) {
      return;
    }
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(exact.getPixel(x, y).a).toBe(source.getPixel(x, y).a);
      }
    }

    // Lower settings quantize it, to libwebp's mapping: quality 70 is
    // sixteen levels, and below that fewer.
    const reduced = decodeWebP({
      data: encodeWebP({ image: source, lossless: false, alphaQuality: 70 }),
    });
    expect(reduced).toBeDefined();
    if (reduced === undefined) {
      return;
    }
    expect(levels(reduced)).toBe(16);
    const reduced20 = decodeWebP({
      data: encodeWebP({ image: source, lossless: false, alphaQuality: 20 }),
    });
    expect(reduced20).toBeDefined();
    if (reduced20 === undefined) {
      return;
    }
    expect(levels(reduced20)).toBeLessThan(16);

    // Which is the point: fewer levels, smaller plane, monotonically.
    const atFull = encodeWebP({
      image: source,
      lossless: false,
      alphaQuality: 100,
    }).length;
    const atSeventy = encodeWebP({
      image: source,
      lossless: false,
      alphaQuality: 70,
    }).length;
    const atTwenty = encodeWebP({
      image: source,
      lossless: false,
      alphaQuality: 20,
    }).length;
    expect(atSeventy).toBeLessThan(atFull);
    expect(atTwenty).toBeLessThan(atSeventy);
  });

  test('the arithmetic the encoder relies on is web-safe', () => {
    // The transforms shift signed intermediates on every block, and
    // getting this wrong once cost 26 dB without failing a single test.
    expect(maxCost).toBeGreaterThan(1 << 30);
    expect(maxCost).toBe(1125899906842624);
    for (const v of [-5, -1, -7, -8, -9, -20091000, -1812, 5, 0]) {
      for (const n of [1, 2, 3, 9, 16]) {
        expect(sar(v, n)).toBe(Math.floor(v / (1 << n)));
      }
    }
  });

  test('keeps the alpha channel exactly', () => {
    const source = scene(80, 48, true);
    const bytes = encodeWebP({ image: source, lossless: false });
    // Transparency cannot ride in the VP8 bitstream, so it needs the
    // extended container and its own chunk.
    expect(String.fromCharCode(...bytes.subarray(12, 16))).toBe('VP8X');
    const decoded = decodeWebP({ data: bytes });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        expect(decoded.getPixel(x, y).a).toBe(source.getPixel(x, y).a);
      }
    }
    expect(psnr(source, decoded, true)).toBeGreaterThan(30);
  });

  test('handles sizes that are not whole macroblocks', () => {
    for (const size of [
      [1, 1],
      [1, 17],
      [17, 1],
      [15, 15],
      [17, 33],
      [64, 3],
    ]) {
      const source = scene(size[0], size[1]);
      const decoded = decodeWebP({
        data: encodeWebP({ image: source, lossless: false }),
      });
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        continue;
      }
      expect(decoded.width).toBe(size[0]);
      expect(decoded.height).toBe(size[1]);
    }
  });

  test('refuses an image the format cannot describe', () => {
    expect(() =>
      encodeWebP({
        image: new MemoryImage({ width: maxDimension + 1, height: 2 }),
        lossless: false,
      })
    ).toThrow();
  });
});
