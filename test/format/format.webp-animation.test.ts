/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgba8, MemoryImage, decodeWebP, encodeWebP } from '../../src';
import {
  WebPChunk,
  animChunkData,
  anmfChunkData,
  buildRiff,
  vp8xChunkData,
} from '../../src/formats/webp/webp-chunk';
import { VP8LEncoder } from '../../src/formats/webp/vp8l-encoder';

import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * WEBP animation handling.
 */
describe('Format: WEBP animation', () => {
  /**
   * Builds a simple blended animation with the given color.
   */
  const blendedAnimation = (color: ColorRgba8): Uint8Array => {
    const image = new MemoryImage({
      width: 2,
      height: 2,
      numChannels: 4,
    });
    image.clear(color);
    const frame = [new WebPChunk('VP8L', new VP8LEncoder().encodeVP8L(image))];
    return buildRiff([
      new WebPChunk('VP8X', vp8xChunkData(18, 2, 2)),
      new WebPChunk('ANIM', animChunkData(0, 0, 0, 0, 0)),
      new WebPChunk('ANMF', anmfChunkData(0, 0, 2, 2, 100, false, true, frame)),
      new WebPChunk('ANMF', anmfChunkData(0, 0, 2, 2, 100, false, true, frame)),
    ]);
  };

  /**
   * A translucent frame keeps its colour over the empty canvas.
   */
  test('translucent frame keeps colour over empty canvas', () => {
    const decoded = decodeWebP({
      data: blendedAnimation(new ColorRgba8(200, 100, 50, 128)),
    });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    const p = decoded.frames[0].getPixel(0, 0);
    expect([p.r, p.g, p.b, p.a]).toEqual([200, 100, 50, 128]);
  });

  /**
   * Two translucent frames of one colour keep that colour.
   */
  test('two translucent frames keep colour', () => {
    const decoded = decodeWebP({
      data: blendedAnimation(new ColorRgba8(200, 100, 50, 128)),
    });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    const p = decoded.frames[1].getPixel(0, 0);
    expect(Math.abs(p.a - 192)).toBeLessThanOrEqual(1);
    expect(Math.abs(p.r - 200)).toBeLessThanOrEqual(1);
    expect(Math.abs(p.g - 100)).toBeLessThanOrEqual(1);
    expect(Math.abs(p.b - 50)).toBeLessThanOrEqual(1);
  });

  /**
   * An opaque frame over a translucent one replaces it.
   */
  test('opaque frame replaces translucent one', () => {
    const decoded = decodeWebP({
      data: blendedAnimation(new ColorRgba8(200, 100, 50, 255)),
    });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    const p = decoded.frames[1].getPixel(0, 0);
    expect([p.r, p.g, p.b, p.a]).toEqual([200, 100, 50, 255]);
  });

  /**
   * Decode keeps what a partial frame did not dispose.
   */
  test('decode keeps partial dispose area', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'dispose_partial.webp'
    );
    const decoded = decodeWebP({ data: input });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    expect(decoded.numFrames).toBe(3);
    const last = decoded.frames[2];
    expect(last.getPixel(120, 80).a).toBe(0);
    const bg = last.getPixel(12, 12);
    expect([bg.r, bg.g, bg.b, bg.a]).toEqual([40, 170, 70, 255]);
  });

  /**
   * A frame that cannot be decoded does not dispose in place of the frame
   * before it.
   */
  test('skipped frame does not dispose previous frame', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'dispose_skipped_frame.webp'
    );
    const decoded = decodeWebP({ data: input });
    expect(decoded).toBeDefined();
    if (decoded === undefined) {
      return;
    }
    expect(decoded.numFrames).toBe(4);
    for (let i = 2; i < decoded.numFrames; i++) {
      expect(decoded.frames[i].getPixel(120, 80).a).toBe(0);
    }
  });

  /**
   * Every frame knows its own index.
   */
  test('frame indices are correct', () => {
    for (const file of ['dispose_partial.webp', 'dispose_skipped_frame.webp']) {
      const input = TestUtils.readFromFile(
        TestFolder.input,
        TestSection.webp,
        file
      );
      const decoded = decodeWebP({ data: input });
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        continue;
      }
      for (let i = 0; i < decoded.numFrames; i++) {
        expect(decoded.frames[i].frameIndex).toBe(i);
      }
    }
  });

  /**
   * Decode then encode does not lose the background.
   */
  test('round-trip preserves animation background', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.webp,
      'dispose_partial.webp'
    );
    const original = decodeWebP({ data: input });
    expect(original).toBeDefined();
    if (original === undefined) {
      return;
    }
    const again = decodeWebP({ data: encodeWebP({ image: original }) });
    expect(again).toBeDefined();
    if (again === undefined) {
      return;
    }
    expect(again.numFrames).toBe(original.numFrames);
    for (let i = 0; i < again.numFrames; i++) {
      for (const at of [
        [12, 12],
        [200, 140],
        [30, 30],
        [120, 80],
      ] as const) {
        const a = original.frames[i].getPixel(at[0], at[1]);
        const b = again.frames[i].getPixel(at[0], at[1]);
        expect([b.r, b.g, b.b, b.a]).toEqual([a.r, a.g, a.b, a.a]);
      }
    }
  });
});
