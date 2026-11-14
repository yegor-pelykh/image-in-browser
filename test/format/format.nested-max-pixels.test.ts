/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgba8,
  encodeJpg,
  encodeWebP,
  LibError,
  MemoryImage,
  TiffDecoder,
  WebPDecoder,
} from '../../src';
import {
  WebPChunk,
  animChunkData,
  anmfChunkData,
  buildRiff,
  vp8xChunkData,
} from '../../src/formats/webp/webp-chunk';
import { VP8LEncoder } from '../../src/formats/webp/vp8l-encoder';

/**
 * Calls {@link decode} and asserts that it is refused with a {@link LibError}
 * whose message contains {@link message}.
 */
function expectRefused(decode: () => unknown, message: string): void {
  try {
    decode();
  } catch (e) {
    expect(e).toBeInstanceOf(LibError);
    expect(e instanceof Error ? e.message : '').toContain(message);
    return;
  }
  throw new Error(`Expected decoding to be refused with: ${message}`);
}

/**
 * An RGB TIFF with one 16 x 16 JPEG tile whose SOF0 declares {@link size} x
 * {@link size}.
 */
function tiffWithJpegTile(
  size: number,
  width: number = 1,
  height: number = 1
): Uint8Array {
  const jpeg = encodeJpg({ image: new MemoryImage({ width: 16, height: 16 }) });
  const jpegView = new DataView(jpeg.buffer, jpeg.byteOffset, jpeg.byteLength);
  for (let i = 0; i + 8 < jpeg.length; i++) {
    if (jpeg[i] === 0xff && jpeg[i + 1] === 0xc0) {
      jpegView.setUint16(i + 5, size);
      jpegView.setUint16(i + 7, size);
      break;
    }
  }
  const entries = 10;
  const ifdOffset = 8;
  const dataOffset = ifdOffset + 2 + entries * 12 + 4;
  const out = new Uint8Array(dataOffset + jpeg.length);
  const data = new DataView(out.buffer);
  data.setUint8(0, 0x49);
  data.setUint8(1, 0x49);
  data.setUint16(2, 42, true);
  data.setUint32(4, ifdOffset, true);
  data.setUint16(ifdOffset, entries, true);
  let at = ifdOffset + 2;
  const tags: [number, number, number][] = [
    [256, 4, width],
    [257, 4, height],
    [258, 3, 8],
    [259, 3, 7],
    [262, 3, 2],
    [277, 3, 3],
    [322, 3, 16],
    [323, 3, 16],
    [324, 4, dataOffset],
    [325, 4, jpeg.length],
  ];
  for (const [id, type, value] of tags) {
    data.setUint16(at, id, true);
    data.setUint16(at + 2, type, true);
    data.setUint32(at + 4, 1, true);
    data.setUint32(at + 8, value, true);
    at += 12;
  }
  out.set(jpeg, dataOffset);
  return out;
}

/**
 * Bitstreams nested inside another container declare their own size, which
 * must not get past the size the container's maxPixels check was run on.
 * The refusals are checked by message: the old decoders also threw, but only
 * after allocating the declared size.
 */
describe('Format: nested max pixels', () => {
  const maxPixels = 40000000;
  const source = new MemoryImage({ width: 16, height: 16, numChannels: 4 });
  source.clear(new ColorRgba8(10, 200, 30, 255));

  const animated = (bitstream: WebPChunk): Uint8Array =>
    buildRiff([
      new WebPChunk('VP8X', vp8xChunkData(2, 16, 16)),
      new WebPChunk('ANIM', animChunkData(0, 0, 0, 0, 0)),
      new WebPChunk(
        'ANMF',
        anmfChunkData(0, 0, 16, 16, 100, false, false, [bitstream])
      ),
    ]);

  /**
   * A VP8L bitstream whose header declares {@link width} x {@link height}.
   * The header packs width - 1 and height - 1 in 14 bits each after the
   * signature byte.
   */
  const vp8l = (width: number, height: number): Uint8Array => {
    const data = new VP8LEncoder().encodeVP8L(source);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const bits = view.getUint32(1, true) & ~0x0fffffff;
    view.setUint32(1, bits | (width - 1) | ((height - 1) << 14), true);
    return data;
  };

  /**
   * The 'VP8 ' payload of a simple lossy file whose header declares
   * {@link width} x {@link height}. Its size is at bytes 6 to 9.
   */
  const vp8 = (width: number, height: number): Uint8Array => {
    const file = encodeWebP({ image: source, lossless: false });
    expect(String.fromCharCode(...file.subarray(12, 16))).toBe('VP8 ');
    const fileView = new DataView(
      file.buffer,
      file.byteOffset,
      file.byteLength
    );
    const size = fileView.getUint32(16, true);
    const data = file.slice(20, 20 + size);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    view.setUint16(6, width, true);
    view.setUint16(8, height, true);
    return data;
  };

  const webp = (): WebPDecoder => {
    const decoder = new WebPDecoder();
    decoder.maxPixels = maxPixels;
    return decoder;
  };

  test('WebP lossless frame matching its ANMF size decodes', () => {
    const image = webp().decode({
      bytes: animated(new WebPChunk('VP8L', vp8l(16, 16))),
    });
    expect(image?.width).toBe(16);
    expect(image?.getPixel(3, 3).g).toBe(200);
  });

  test('WebP lossless frame larger than its ANMF size is refused', () => {
    const bytes = animated(new WebPChunk('VP8L', vp8l(12000, 12000)));
    expectRefused(() => webp().decode({ bytes }), 'does not match');
  });

  test('WebP lossy frame matching its ANMF size decodes', () => {
    const image = webp().decode({
      bytes: animated(new WebPChunk('VP8 ', vp8(16, 16))),
    });
    expect(image?.width).toBe(16);
    expect(Math.abs(image!.getPixel(3, 3).g - 200)).toBeLessThanOrEqual(8);
  });

  test('WebP lossy frame larger than its ANMF size is refused', () => {
    const bytes = animated(new WebPChunk('VP8 ', vp8(12000, 12000)));
    expectRefused(() => webp().decode({ bytes }), 'does not match');
  });

  test('WebP lossy size ignores the upscaling bits', () => {
    const bytes = animated(new WebPChunk('VP8 ', vp8(0xc010, 0x4010)));
    const image = webp().decode({ bytes });
    expect(image?.width).toBe(16);
    expect(image?.height).toBe(16);
  });

  test('TIFF JPEG tile larger than the tile is refused', () => {
    const bytes = tiffWithJpegTile(16000);
    expectRefused(
      () => new TiffDecoder(maxPixels).decode({ bytes }),
      'exceed the maximum of 256 pixels'
    );
  });

  test('TIFF JPEG tile matching the tile decodes', () => {
    const image = new TiffDecoder(maxPixels).decode({
      bytes: tiffWithJpegTile(16, 16, 16),
    });
    expect(image?.width).toBe(16);
  });
});
