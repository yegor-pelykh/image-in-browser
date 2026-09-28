/** @format */

import { describe, expect, test } from 'vitest';
import { decodeWebP, LibError, MemoryImage } from '../../src';
import { VP8Config } from '../../src/formats/webp/vp8-config';
import { VP8Encoder } from '../../src/formats/webp/vp8-encoder';
import { importYuv } from '../../src/formats/webp/vp8-yuv';
import { WebPChunk, buildRiff } from '../../src/formats/webp/webp-chunk';

/**
 * Partition #0 holds every macroblock's modes and the format caps it at 512k,
 * which only a picture of well over 100 megapixels reaches. The limit is
 * lowered here so the same code paths run on a small one.
 */
describe('Format: WEBP lossy partition #0', () => {
  /**
   * Busy enough that the mode search wants 4x4 modes in most macroblocks.
   */
  const noise = (w: number, h: number): MemoryImage => {
    let seed = 7;
    const image = new MemoryImage({ width: w, height: h });
    for (const p of image) {
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      const r = (seed >> 16) & 0xff;
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      const g = (seed >> 16) & 0xff;
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      const b = (seed >> 16) & 0xff;
      p.r = r;
      p.g = g;
      p.b = b;
    }
    return image;
  };

  const decode = (encoder: VP8Encoder): MemoryImage => {
    const image = decodeWebP({
      data: buildRiff([new WebPChunk('VP8 ', encoder.encode())]),
    });
    if (image === undefined) {
      throw new LibError('failed to decode the encoded picture');
    }
    return image;
  };

  const fullI4Bits = 256 * 16 * 16;

  test('a picture that fits codes in one pass with 4x4 modes on', () => {
    const encoder = new VP8Encoder(new VP8Config(), importYuv(noise(64, 64)));
    decode(encoder);
    expect(encoder.enc.maxI4HeaderBits).toBe(fullI4Bits);
    expect(Array.from(encoder.enc.mbType)).toContain(0);
  });

  test('modes that overflow are coded again with fewer 4x4 bits', () => {
    // 52 bytes over the headroom: too few for the first pass, enough once
    // 4x4 modes are held back.
    const encoder = new VP8Encoder(
      new VP8Config(),
      importYuv(noise(64, 64)),
      2100
    );
    const decoded = decode(encoder);

    expect(encoder.enc.maxI4HeaderBits).toBeLessThan(fullI4Bits);
    // The retries stop as soon as the modes fit.
    expect(encoder.enc.maxI4HeaderBits).toBeGreaterThan(0);
    expect(decoded.width).toBe(64);
    expect(decoded.height).toBe(64);
  });

  test('the retries go as far as turning 4x4 modes off', () => {
    // Under the headroom no estimate fits, so only the floor stops them.
    const encoder = new VP8Encoder(
      new VP8Config(),
      importYuv(noise(64, 64)),
      2047
    );
    const decoded = decode(encoder);

    expect(encoder.enc.maxI4HeaderBits).toBe(0);
    // With no bits left for 4x4 modes every macroblock is 16x16.
    expect(Array.from(encoder.enc.mbType)).toEqual(
      new Array(encoder.enc.mbType.length).fill(1)
    );
    expect(decoded.width).toBe(64);
  });

  test('the retried picture decodes as closely as a normal one', () => {
    const source = noise(64, 64);
    const error = (decoded: MemoryImage): number => {
      let sum = 0;
      for (const p of source) {
        const q = decoded.getPixel(p.x, p.y);
        sum += Math.abs(p.r - q.r) + Math.abs(p.g - q.g) + Math.abs(p.b - q.b);
      }
      return sum / (3 * 64 * 64);
    };

    const normal = error(
      decode(new VP8Encoder(new VP8Config(), importYuv(source)))
    );
    const retried = error(
      decode(new VP8Encoder(new VP8Config(), importYuv(source), 2047))
    );
    // 16x16 modes alone cost some quality, not the picture.
    expect(retried).toBeLessThan(normal * 1.5);
  });

  test('modes that cannot fit even as 16x16 fail cleanly', () => {
    const encoder = new VP8Encoder(
      new VP8Config(),
      importYuv(noise(64, 64)),
      64
    );
    expect(() => encoder.encode()).toThrow(LibError);
  });
});
