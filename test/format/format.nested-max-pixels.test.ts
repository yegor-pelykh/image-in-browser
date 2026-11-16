/** @format */

import { describe, expect, test } from 'vitest';
import {
  BmpDecoder,
  ColorRgba8,
  Crc32,
  decodeJpg,
  encodeJpg,
  encodePng,
  encodeWebP,
  LibError,
  MemoryImage,
  PngDecoder,
  PnmDecoder,
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

  test('WebP frame holding its own animation is refused', () => {
    const inner = new WebPChunk(
      'ANMF',
      anmfChunkData(0, 0, 16, 16, 100, false, false, [
        new WebPChunk('VP8L', vp8l(16, 16)),
      ])
    );
    const bytes = buildRiff([
      new WebPChunk('VP8X', vp8xChunkData(2, 16, 16)),
      new WebPChunk('ANIM', animChunkData(0, 0, 0, 0, 0)),
      new WebPChunk(
        'ANMF',
        anmfChunkData(0, 0, 16, 16, 100, false, false, [
          new WebPChunk('VP8X', vp8xChunkData(2, 16, 16)),
          new WebPChunk('ANIM', animChunkData(0, 0, 0, 0, 0)),
          inner,
        ])
      ),
    ]);
    expectRefused(() => webp().decode({ bytes }), 'holds an animation');
  });

  test('WebP frame outside the canvas is refused', () => {
    const bytes = buildRiff([
      new WebPChunk('VP8X', vp8xChunkData(2, 16, 16)),
      new WebPChunk('ANIM', animChunkData(0, 0, 0, 0, 0)),
      new WebPChunk(
        'ANMF',
        anmfChunkData(8, 0, 16, 16, 100, false, false, [
          new WebPChunk('VP8L', vp8l(16, 16)),
        ])
      ),
    ]);
    expectRefused(() => webp().decode({ bytes }), 'outside the 16x16 canvas');
  });

  test('APNG frame outside the canvas is refused', () => {
    const anim = new MemoryImage({ width: 16, height: 16 });
    anim.addFrame(new MemoryImage({ width: 16, height: 16 }));
    const png = encodePng({ image: anim });
    const fctl = chunkOffsets(png, 'fcTL')[1];
    new DataView(png.buffer, png.byteOffset, png.byteLength).setUint32(
      fctl + 12,
      32
    );
    fixCrc(png, fctl);
    expectRefused(
      () => new PngDecoder(maxPixels).decode({ bytes: png }),
      'outside the 16x16 canvas'
    );
    expect(
      new PngDecoder(maxPixels).decode({ bytes: encodePng({ image: anim }) })
        ?.numFrames
    ).toBe(2);
  });

  test('PNG size whose product overflows is refused', () => {
    const png = encodePng({ image: new MemoryImage({ width: 1, height: 1 }) });
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    view.setUint32(16, 0xffffffff);
    view.setUint32(20, 0x80000001);
    fixCrc(png, 8);
    expectRefused(
      () => new PngDecoder(40000000).startDecode(png),
      'exceed the maximum'
    );
  });

  test('PNM size whose product overflows is refused', () => {
    const header = 'P5\n274177 67280421310721\n255\n';
    const pnm = new Uint8Array(header.length + 1);
    for (let i = 0; i < header.length; i++) {
      pnm[i] = header.charCodeAt(i);
    }
    expectRefused(
      () => new PnmDecoder().decode({ bytes: pnm }),
      'exceed the maximum'
    );
  });

  test('JPEG with 4 components and no Adobe marker is refused at once', () => {
    const jpeg = Uint8Array.from([
      0xff, 0xd8, 0xff, 0xc2, 0, 20, 8, 0, 8, 0, 8, 4, 1, 0x11, 0, 2, 0x11, 0,
      3, 0x11, 0, 4, 0x11, 0, 0xff, 0xda, 0, 14, 4, 1, 0, 2, 0, 3, 0, 4, 0, 0,
      0, 0, 0, 0, 0xff, 0xd9,
    ]);
    expectRefused(() => decodeJpg({ data: jpeg }), '4 components');
  });

  test('BMP palette larger than the file is refused', () => {
    const bmp = new Uint8Array(58);
    const view = new DataView(bmp.buffer);
    view.setUint8(0, 0x42);
    view.setUint8(1, 0x4d);
    view.setUint32(2, 58, true);
    view.setUint32(10, 58, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, 1, true);
    view.setInt32(22, 1, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 8, true);
    view.setUint32(46, 0xffffffff, true);
    expectRefused(
      () => new BmpDecoder().decode({ bytes: bmp }),
      'larger than the file'
    );
  });

  test('TIFF samples per pixel count against maxPixels', () => {
    const tiff = lzwTiff(100, 100, 30);
    expectRefused(
      () => new TiffDecoder(10000).decode({ bytes: tiff }),
      '30 samples a pixel'
    );
    expect(new TiffDecoder(80000).decode({ bytes: tiff })?.numChannels).toBe(
      30
    );
    expect(
      new TiffDecoder(10000).decode({ bytes: lzwTiff(100, 100, 4) })
        ?.numChannels
    ).toBe(4);
  });
});

/**
 * Returns the offsets of the PNG chunks of **type** in **png**.
 * @param {Uint8Array} png - The PNG bytes.
 * @param {string} type - The chunk type.
 * @returns {number[]} The chunk offsets.
 */
function chunkOffsets(png: Uint8Array, type: string): number[] {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const offsets: number[] = [];
  for (
    let offset = 8;
    offset < png.length;
    offset += 12 + view.getUint32(offset)
  ) {
    const chunkType = String.fromCharCode(
      ...png.subarray(offset + 4, offset + 8)
    );
    if (chunkType === type) {
      offsets.push(offset);
    }
  }
  return offsets;
}

/**
 * Recomputes the CRC of the PNG chunk at **offset**.
 * @param {Uint8Array} png - The PNG bytes.
 * @param {number} offset - The chunk offset.
 */
function fixCrc(png: Uint8Array, offset: number): void {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const length = view.getUint32(offset);
  view.setUint32(
    offset + 8 + length,
    Crc32.getChecksum({ buffer: png.subarray(offset + 4, offset + 8 + length) })
  );
}

/**
 * A **width** x **height** LZW TIFF with one strip holding only a clear code.
 * @param {number} width - The width.
 * @param {number} height - The height.
 * @param {number} samplesPerPixel - The number of samples per pixel.
 * @returns {Uint8Array} The TIFF bytes.
 */
function lzwTiff(
  width: number,
  height: number,
  samplesPerPixel: number
): Uint8Array {
  const entries = 9;
  const out = new Uint8Array(12 + 2 + entries * 12 + 4);
  const view = new DataView(out.buffer);
  view.setUint8(0, 0x49);
  view.setUint8(1, 0x49);
  view.setUint16(2, 42, true);
  view.setUint32(4, 12, true);
  view.setUint8(8, 0x80);
  view.setUint16(12, entries, true);
  let at = 14;
  const tags: [number, number, number][] = [
    [256, 4, width],
    [257, 4, height],
    [258, 3, 8],
    [259, 3, 5],
    [262, 3, 2],
    [273, 4, 8],
    [277, 3, samplesPerPixel],
    [278, 4, height],
    [279, 4, 4],
  ];
  for (const [id, type, value] of tags) {
    view.setUint16(at, id, true);
    view.setUint16(at + 2, type, true);
    view.setUint32(at + 4, 1, true);
    view.setUint32(at + 8, value, true);
    at += 12;
  }
  return out;
}
