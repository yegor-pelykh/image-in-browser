/** @format */

import { describe, expect, test } from 'vitest';
import {
  CurEncoder,
  decodeGif,
  decodePng,
  encodeNamedImage,
  encodePng,
  findEncoderForNamedImage,
  IcoDecoder,
  IcoEncoder,
  LibError,
  MemoryImage,
  PsdDecoder,
  Rational,
  WebPDecoder,
  WebPFrame,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

// Palette for the test GIFs: black, red, green, blue.
const black = [0, 0, 0];
const red = [255, 0, 0];
const green = [0, 255, 0];
const blue = [0, 0, 255];

/**
 * A frame of a test GIF.
 */
interface GifFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  disposal: number;
  transparent?: number;
  pixels: number[];
}

/**
 * Builds a GIF89a with a 4 color global palette (black, red, green, blue).
 * @param {number} width - The logical screen width.
 * @param {number} height - The logical screen height.
 * @param {GifFrame[]} frames - The frames to include.
 * @returns {Uint8Array} The GIF bytes.
 */
function buildGif(
  width: number,
  height: number,
  frames: GifFrame[]
): Uint8Array {
  const out: number[] = [];
  const u16 = (v: number): void => {
    out.push(v & 0xff, v >> 8);
  };
  const ascii = (s: string): void => {
    for (let i = 0; i < s.length; i++) {
      out.push(s.charCodeAt(i));
    }
  };
  ascii('GIF89a');
  u16(width);
  u16(height);
  // Global color table of 4 colors, background color 0.
  out.push(0x81, 0, 0);
  for (const c of [black, red, green, blue]) {
    out.push(...c);
  }
  for (const f of frames) {
    const t = f.transparent;
    out.push(0x21, 0xf9, 4, (f.disposal << 2) | (t !== undefined ? 1 : 0), 0, 0);
    out.push(t ?? 0, 0);
    // Image descriptor, no local color table.
    out.push(0x2c);
    u16(f.x);
    u16(f.y);
    u16(f.width);
    u16(f.height);
    out.push(0);
    // LZW data with a minimum code size of 2: a clear code before every
    // pixel keeps the code size at 3 bits.
    out.push(2);
    let bits = 0;
    let numBits = 0;
    const data: number[] = [];
    const code = (c: number): void => {
      bits |= c << numBits;
      numBits += 3;
      while (numBits >= 8) {
        data.push(bits & 0xff);
        bits >>>= 8;
        numBits -= 8;
      }
    };
    for (const p of f.pixels) {
      code(4);
      code(p);
    }
    code(5);
    if (numBits > 0) {
      data.push(bits & 0xff);
    }
    for (let i = 0; i < data.length; i += 255) {
      const end = i + 255 < data.length ? i + 255 : data.length;
      out.push(end - i);
      out.push(...data.slice(i, end));
    }
    out.push(0);
  }
  out.push(0x3b);
  return Uint8Array.from(out);
}

/**
 * Asserts that the pixel is transparent, or has the given color and is opaque.
 * @param {MemoryImage} image - The image to check.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number[]} [rgb] - The expected RGB, or undefined for transparent.
 */
function expectRgba(
  image: MemoryImage,
  x: number,
  y: number,
  rgb?: number[]
): void {
  const p = image.getPixel(x, y);
  if (rgb === undefined) {
    expect(p.a, `(${x}, ${y}) should be transparent`).toBe(0);
  } else {
    expect([p.r, p.g, p.b, p.a], `(${x}, ${y})`).toEqual([...rgb, 255]);
  }
}

/**
 * Format bug fixes for ICO, CUR, PSD and GIF.
 */
describe('Format: bug fixes', () => {
  describe('ico', () => {
    test('decodeImageLargest treats a size of 0 as 256', () => {
      const ico = new IcoEncoder().encodeImages([
        new MemoryImage({ width: 48, height: 48 }),
        new MemoryImage({ width: 256, height: 256 }),
      ]);
      // The 256 entry is stored as 0 in the directory.
      expect(ico[6 + 16]).toBe(0);
      const decoder = new IcoDecoder();
      const info = decoder.startDecode(ico);
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      expect(info.images[1].width).toBe(256);
      expect(info.images[1].height).toBe(256);
      const largest = decoder.decodeImageLargest(ico);
      expect(largest).toBeDefined();
      if (largest === undefined) {
        return;
      }
      expect(largest.width).toBe(256);
      expect(largest.height).toBe(256);
    });

    test('icons larger than 256 throw a LibError', () => {
      expect(() =>
        new IcoEncoder().encode({
          image: new MemoryImage({ width: 257, height: 16 }),
        })
      ).toThrow(LibError);
    });
  });

  describe('cur', () => {
    test('findEncoderForNamedImage returns a CurEncoder for .cur', () => {
      expect(findEncoderForNamedImage('cursor.cur')).toBeInstanceOf(CurEncoder);
      const bytes = encodeNamedImage({
        name: 'cursor.cur',
        image: new MemoryImage({ width: 8, height: 8 }),
      });
      expect(bytes).toBeDefined();
      if (bytes === undefined) {
        return;
      }
      // Type 2 is CUR, type 1 is ICO.
      expect(bytes[2]).toBe(2);
    });
  });

  describe('psd', () => {
    test('startDecode returns undefined for non-PSD data', () => {
      const png = encodePng({ image: new MemoryImage({ width: 8, height: 8 }) });
      const decoder = new PsdDecoder();
      expect(decoder.isValidFile(png)).toBe(false);
      expect(decoder.startDecode(png)).toBeUndefined();
      expect(decoder.numFrames).toBe(0);
      expect(decoder.decodeFrame(0)).toBeUndefined();
      expect(decoder.decode({ bytes: png })).toBeUndefined();
    });

    test('startDecode still accepts PSD data', () => {
      const bytes = TestUtils.readFromFile(
        TestFolder.input,
        TestSection.psd,
        'psd1.psd'
      );
      expect(new PsdDecoder().startDecode(bytes)).toBeDefined();
    });
  });

  describe('exports', () => {
    test('Rational and WebPFrame are exported', () => {
      expect(new Rational(1, 2).toDouble).toBe(0.5);
      const info = new WebPDecoder().startDecode(
        TestUtils.readFromFile(
          TestFolder.input,
          TestSection.webp,
          'animated_lossy.webp'
        )
      );
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      const frames: WebPFrame[] = info.frames;
      expect(frames.length).toBeGreaterThan(0);
    });
  });

  describe('gif animation', () => {
    test('first frame is placed on the logical screen and disposal 2 clears only the frame area', () => {
      const gif = buildGif(4, 4, [
        { x: 1, y: 1, width: 2, height: 2, disposal: 2, transparent: 0, pixels: [1, 1, 1, 1] },
        { x: 0, y: 0, width: 1, height: 1, disposal: 1, transparent: 0, pixels: [2] },
        { x: 3, y: 3, width: 1, height: 1, disposal: 0, transparent: 0, pixels: [3] },
      ]);
      const anim = decodeGif({ data: gif });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }
      expect(anim.numFrames).toBe(3);
      for (const frame of anim.frames) {
        expect(frame.width).toBe(4);
        expect(frame.height).toBe(4);
      }

      const f0 = anim.frames[0];
      expectRgba(f0, 0, 0);
      expectRgba(f0, 1, 1, red);
      expectRgba(f0, 2, 2, red);
      expectRgba(f0, 3, 3);

      // Frame 0's disposal 2 cleared its area before frame 1 was drawn.
      const f1 = anim.frames[1];
      expectRgba(f1, 0, 0, green);
      expectRgba(f1, 1, 1);
      expectRgba(f1, 2, 2);

      // Frame 1's disposal 1 keeps it on the canvas for frame 2.
      const f2 = anim.frames[2];
      expectRgba(f2, 0, 0, green);
      expectRgba(f2, 1, 1);
      expectRgba(f2, 3, 3, blue);
    });

    test('disposal applies after the frame is displayed', () => {
      // Frame 0 disposes to background, frame 1 is drawn with disposal 1 over
      // the cleared area, and frame 2 must still see frame 1.
      const gif = buildGif(2, 1, [
        { x: 0, y: 0, width: 2, height: 1, disposal: 1, pixels: [1, 1] },
        { x: 0, y: 0, width: 1, height: 1, disposal: 2, transparent: 0, pixels: [2] },
        { x: 1, y: 0, width: 1, height: 1, disposal: 1, transparent: 0, pixels: [3] },
      ]);
      const anim = decodeGif({ data: gif });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }
      expect(anim.numFrames).toBe(3);
      expectRgba(anim.frames[0], 0, 0, red);
      expectRgba(anim.frames[0], 1, 0, red);
      // Frame 1 is shown on top of frame 0 even though it disposes to
      // background afterwards.
      expectRgba(anim.frames[1], 0, 0, green);
      expectRgba(anim.frames[1], 1, 0, red);
      // Frame 1's area was restored to the background for frame 2.
      expectRgba(anim.frames[2], 0, 0);
      expectRgba(anim.frames[2], 1, 0, blue);
    });

    test('disposal 3 restores the previous canvas', () => {
      const gif = buildGif(4, 4, [
        { x: 0, y: 0, width: 4, height: 4, disposal: 1, pixels: Array(16).fill(1) },
        { x: 1, y: 1, width: 1, height: 1, disposal: 3, pixels: [2] },
        { x: 2, y: 2, width: 1, height: 1, disposal: 0, pixels: [3] },
      ]);
      const anim = decodeGif({ data: gif });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }
      expect(anim.numFrames).toBe(3);

      const f1 = anim.frames[1];
      expectRgba(f1, 0, 0, red);
      expectRgba(f1, 1, 1, green);
      expectRgba(f1, 2, 2, red);

      const f2 = anim.frames[2];
      expectRgba(f2, 0, 0, red);
      expectRgba(f2, 1, 1, red);
      expectRgba(f2, 2, 2, blue);
    });

    test('frames without a local palette keep the previous canvas', () => {
      const gif = buildGif(2, 1, [
        { x: 0, y: 0, width: 2, height: 1, disposal: 1, pixels: [1, 2] },
        { x: 1, y: 0, width: 1, height: 1, disposal: 0, pixels: [3] },
      ]);
      const anim = decodeGif({ data: gif });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }
      expectRgba(anim.frames[1], 0, 0, red);
      expectRgba(anim.frames[1], 1, 0, blue);
    });

    test('frames decoded before a bad frame are kept', () => {
      const gif = buildGif(2, 2, [
        { x: 0, y: 0, width: 2, height: 2, disposal: 0, pixels: [1, 1, 1, 1] },
        { x: 0, y: 0, width: 1, height: 1, disposal: 0, pixels: [2] },
        // Outside of the logical screen.
        { x: 1, y: 1, width: 2, height: 2, disposal: 0, pixels: [3, 3, 3, 3] },
      ]);
      const anim = decodeGif({ data: gif });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }
      expect(anim.numFrames).toBe(2);
      expectRgba(anim.frames[1], 0, 0, green);
      expectRgba(anim.frames[1], 1, 1, red);
    });
  });
});
