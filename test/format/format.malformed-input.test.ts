/** @format */

// Malformed and malicious inputs must fail quickly and cleanly: no hangs, no
// huge allocations, and no errors other than LibError.

import { describe, expect, test } from 'vitest';
import {
  BmpDecoder,
  ColorRgb8,
  Crc32,
  GifDecoder,
  IccProfile,
  IccProfileCompression,
  IcoDecoder,
  JpegDecoder,
  LibError,
  MemoryImage,
  PngDecoder,
  PnmDecoder,
  PsdDecoder,
  PvrDecoder,
  TgaDecoder,
  TiffDecoder,
  WebPDecoder,
  decodeBmp,
  decodeGif,
  decodeImage,
  decodeJpg,
  decodeJpgExif,
  decodePng,
  decodePnm,
  decodePsd,
  decodeTiff,
  encodeBmp,
  encodeGif,
  encodeIco,
  encodeJpg,
  encodePng,
  encodePvr,
  encodeTga,
  encodeTiff,
  encodeWebP,
  findDecoderForData,
} from '../../src';
import { deflate } from '../../src/packer/packer';
import { setDefaultMaxPixels } from '../../src/formats/decoder';

/**
 * An animation of {@link numFrames} frames of {@link width} x {@link height}.
 */
function animation(
  width: number,
  height: number,
  numFrames: number
): MemoryImage {
  const image = new MemoryImage({ width, height });
  for (let i = 1; i < numFrames; ++i) {
    const frame = new MemoryImage({ width, height });
    frame.clear(new ColorRgb8(i * 40, 0, 0));
    image.addFrame(frame);
  }
  return image;
}

/**
 * A JPEG holding an APP1 EXIF segment with the given TIFF structure.
 */
function jpegWithExif(tiff: number[]): Uint8Array {
  const app1 = [...Array.from('Exif', (c) => c.charCodeAt(0)), 0, 0, ...tiff];
  const length = app1.length + 2;
  return new Uint8Array([
    0xff,
    0xd8,
    0xff,
    0xe1,
    length >> 8,
    length & 0xff,
    ...app1,
    0xff,
    0xd9,
  ]);
}

/**
 * Malformed and malicious input handling.
 */
describe('Format: malformed input', () => {
  describe('malformed input', () => {
    test('EXIF IFDs that form a cycle', () => {
      // Two empty IFDs that point at each other.
      const jpeg = jpegWithExif([
        0x49, 0x49, 0x2a, 0x00, 8, 0, 0,
        // little endian, first IFD at 8
        0, 0, 0, 14, 0, 0,
        // 0 entries, next IFD at 14
        0, 0, 0, 8, 0, 0,
        // 0 entries, next IFD at 8
        0,
      ]);
      const exif = decodeJpgExif({ data: jpeg });
      expect(exif).toBeDefined();
      expect(exif!.size).toBeLessThanOrEqual(2);
    });

    test('TIFF IFDs that form a cycle', () => {
      const tiff = encodeTiff({
        image: new MemoryImage({ width: 2, height: 2 }),
      });
      const littleEndian = tiff[0] !== 0x4d;
      const data = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
      // Point the first IFD's next-IFD offset back at itself.
      const ifd = data.getUint32(4, littleEndian);
      const entries = data.getUint16(ifd, littleEndian);
      data.setUint32(ifd + 2 + entries * 12, ifd, littleEndian);

      expect(new TiffDecoder().isValidFile(tiff)).toBe(true);
      const image = decodeTiff({ data: tiff });
      expect(image).toBeDefined();
      expect(image!.numFrames).toBe(1);
      expect(decodeImage({ data: tiff })?.numFrames).toBe(1);
    });
  });

  test('isValidFile with truncated data', () => {
    const small = new MemoryImage({ width: 8, height: 8 });
    const files = [
      encodePng({ image: small }),
      encodeJpg({ image: small }),
      encodeGif({ image: small }),
      encodeWebP({ image: small }),
      encodeTiff({ image: small }),
      encodeBmp({ image: small }),
      encodeTga({ image: small }),
      encodeIco({ image: small }),
      encodePvr({ image: small }),
      new Uint8Array([0x76, 0x2f, 0x31, 0x01, 2]),
      new Uint8Array(Array.from('8BPS', (c) => c.charCodeAt(0))),
    ];
    const decoders = [
      () => new JpegDecoder(),
      () => new PngDecoder(),
      () => new GifDecoder(),
      () => new WebPDecoder(),
      () => new TiffDecoder(),
      () => new PsdDecoder(),
      () => new BmpDecoder(),
      () => new PnmDecoder(),
      () => new TgaDecoder(),
      () => new IcoDecoder(),
      () => new PvrDecoder(),
    ];
    for (const file of files) {
      for (let n = 0; n < file.length && n < 64; ++n) {
        const bytes = file.subarray(0, n);
        for (const decoder of decoders) {
          expect(() => decoder().isValidFile(bytes)).not.toThrow();
        }
        expect(() => findDecoderForData(bytes)).not.toThrow();
      }
    }
  });

  test('truncated files throw only LibError', () => {
    const small = new MemoryImage({ width: 8, height: 8, numChannels: 4 });
    const anim = new MemoryImage({ width: 8, height: 8 });
    anim.addFrame(new MemoryImage({ width: 8, height: 8 }));
    const files: Record<string, Uint8Array> = {
      png: encodePng({ image: anim }),
      jpg: encodeJpg({ image: small }),
      gif: encodeGif({ image: anim }),
      webp: encodeWebP({ image: anim }),
      tiff: encodeTiff({ image: small }),
      bmp: encodeBmp({ image: small }),
      tga: encodeTga({ image: small }),
      ico: encodeIco({ image: anim }),
      pvr: encodePvr({ image: small }),
    };
    for (const [key, file] of Object.entries(files)) {
      for (let n = 0; n < file.length; n += 1 + Math.trunc(n / 16)) {
        const bytes = file.subarray(0, n);
        try {
          decodeImage({ data: bytes });
          decodeJpgExif({ data: bytes });
        } catch (err) {
          expect(err, `${key} ${n} bytes`).toBeInstanceOf(LibError);
        }
      }
    }
  });

  test('PVR files are detected', () => {
    const pvr = encodePvr({ image: new MemoryImage({ width: 8, height: 8 }) });
    expect(new PvrDecoder().isValidFile(pvr)).toBe(true);
    expect(decodeImage({ data: pvr })?.width).toBe(8);
  });

  test('encoding an empty image', () => {
    const encoders = [
      (image: MemoryImage) => encodePng({ image }),
      (image: MemoryImage) => encodeJpg({ image }),
      (image: MemoryImage) => encodeGif({ image }),
      (image: MemoryImage) => encodeBmp({ image }),
      (image: MemoryImage) => encodeTga({ image }),
      (image: MemoryImage) => encodeTiff({ image }),
      (image: MemoryImage) => encodeIco({ image }),
      (image: MemoryImage) => encodePvr({ image }),
      (image: MemoryImage) => encodeWebP({ image }),
    ];
    for (const image of [
      new MemoryImage(),
      new MemoryImage({ width: 0, height: 10 }),
    ]) {
      for (const encode of encoders) {
        expect(() => encode(image)).toThrow(LibError);
      }
    }
    expect(() => new MemoryImage({ width: -1, height: 10 })).toThrow();
  });

  test('TIFF tag with a huge count', () => {
    const tiff = encodeTiff({
      image: new MemoryImage({ width: 2, height: 2 }),
    });
    const littleEndian = tiff[0] !== 0x4d;
    const data = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
    const ifd = data.getUint32(4, littleEndian);
    for (let i = 0; i < data.getUint16(ifd, littleEndian); ++i) {
      const entry = ifd + 2 + i * 12;
      if (data.getUint16(entry, littleEndian) === 273) {
        // StripOffsets count
        data.setUint32(entry + 4, 0x7fffffff, littleEndian);
      }
    }
    expect(decodeTiff({ data: tiff })).toBeUndefined();
  });

  test('JPEG with too many scans', () => {
    const jpeg = encodeJpg({ image: new MemoryImage({ width: 8, height: 8 }) });
    let sos = 2;
    while (jpeg[sos] !== 0xff || jpeg[sos + 1] !== 0xda) {
      sos++;
    }
    // Repeat the scan, up to the EOI marker at the end.
    const scan = jpeg.subarray(sos, jpeg.length - 2);
    const bytes = new Uint8Array([
      ...jpeg.subarray(0, sos),
      ...Array.from({ length: 1001 }, () => scan).flatMap((s) => [...s]),
      0xff,
      0xd9,
    ]);
    expect(() => decodeJpg({ data: bytes })).toThrow(LibError);
  });

  describe('decompression limits', () => {
    test('ICC profile', () => {
      const deflated = deflate(new Uint8Array(64 << 20));
      const icc = new IccProfile(
        'icc',
        IccProfileCompression.deflate,
        deflated
      );
      expect(icc.decompressed().length).toBe(16 << 20);
    });

    test('TIFF deflate', () => {
      // A 2x2 TIFF whose strip is replaced with 64 MB of deflated zeros.
      const tiff = encodeTiff({
        image: new MemoryImage({ width: 2, height: 2 }),
      });
      const littleEndian = tiff[0] !== 0x4d;
      const bomb = deflate(new Uint8Array(64 << 20));
      const bytes = new Uint8Array([...tiff, ...bomb]);
      const data = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength
      );
      const ifd = data.getUint32(4, littleEndian);
      let patched = 0;
      for (let i = 0; i < data.getUint16(ifd, littleEndian); ++i) {
        const entry = ifd + 2 + i * 12;
        const tag = data.getUint16(entry, littleEndian);
        if (tag === 259 || tag === 273 || tag === 279) {
          patched++;
        }
        if (tag === 259) {
          // deflate
          data.setUint16(entry + 8, 8, littleEndian);
        } else if (tag === 273) {
          data.setUint32(entry + 8, tiff.length, littleEndian);
        } else if (tag === 279) {
          data.setUint32(entry + 8, bomb.length, littleEndian);
        }
      }
      expect(patched).toBe(3);
      const image = decodeTiff({ data: bytes });
      expect(image?.width).toBe(2);
    });
  });

  describe('maxPixels', () => {
    const small = new MemoryImage({ width: 64, height: 64 });

    test('every decoder', () => {
      const gif = new GifDecoder();
      gif.maxPixels = 1000;
      const webp = new WebPDecoder();
      webp.maxPixels = 1000;
      const files: [
        string,
        Uint8Array,
        { decode: (o: { bytes: Uint8Array }) => unknown },
      ][] = [
        ['png', encodePng({ image: small }), new PngDecoder(1000)],
        ['gif', encodeGif({ image: small }), gif],
        ['webp', encodeWebP({ image: small }), webp],
        ['tiff', encodeTiff({ image: small }), new TiffDecoder(1000)],
        ['bmp', encodeBmp({ image: small }), new BmpDecoder(false, 1000)],
        ['tga', encodeTga({ image: small }), new TgaDecoder(1000)],
        ['ico', encodeIco({ image: small }), new IcoDecoder(1000)],
        ['pvr', encodePvr({ image: small }), new PvrDecoder(1000)],
        ['jpg', encodeJpg({ image: small }), new JpegDecoder(1000)],
      ];
      for (const [key, bytes, decoder] of files) {
        expect(() => decoder.decode({ bytes }), key).toThrow(LibError);
      }
    });

    test('defaultMaxPixels', () => {
      const saved = 1 << 28;
      setDefaultMaxPixels(64 * 64);
      try {
        expect(decodeImage({ data: encodePng({ image: small }) })?.width).toBe(
          64
        );
        expect(() =>
          decodeImage({
            data: encodePng({
              image: new MemoryImage({ width: 65, height: 64 }),
            }),
          })
        ).toThrow(LibError);
      } finally {
        setDefaultMaxPixels(saved);
      }
    });

    test('PNG declaring a huge size', () => {
      const png = encodePng({
        image: new MemoryImage({ width: 1, height: 1 }),
      });
      // IHDR data starts at 16: width, height, then the CRC at 29.
      const data = new DataView(png.buffer, png.byteOffset, png.byteLength);
      data.setUint32(16, 100000);
      data.setUint32(20, 100000);
      data.setUint32(
        29,
        Crc32.getChecksum({ buffer: png, position: 12, length: 17 })
      );
      expect(() => decodePng({ data: png })).toThrow(LibError);
    });

    test('GIF declaring a huge canvas', () => {
      const gif = encodeGif({
        image: new MemoryImage({ width: 1, height: 1 }),
      });
      // screen width and height
      gif.fill(0xff, 6, 10);
      expect(() => decodeGif({ data: gif })).toThrow(LibError);
    });

    test('animation frames together', () => {
      // 3 frames of 100 pixels each.
      const anim = animation(10, 10, 3);
      const gif = new GifDecoder();
      gif.maxPixels = 250;
      const webp = new WebPDecoder();
      webp.maxPixels = 250;
      const files: [
        string,
        Uint8Array,
        { decode: (o: { bytes: Uint8Array; frameIndex?: number }) => unknown },
      ][] = [
        ['gif', encodeGif({ image: anim }), gif],
        ['png', encodePng({ image: anim }), new PngDecoder(250)],
        ['webp', encodeWebP({ image: anim }), webp],
        ['ico', encodeIco({ image: anim }), new IcoDecoder(250)],
      ];
      for (const [key, bytes, decoder] of files) {
        expect(() => decoder.decode({ bytes }), key).toThrow(LibError);
        // A single frame is within the limit.
        expect(decoder.decode({ bytes, frameIndex: 0 }), key).toBeDefined();
      }
    });

    test('PSD declaring a huge size', () => {
      const psd = new Uint8Array(26 + 12 + 2);
      const data = new DataView(psd.buffer);
      // 8BPS
      data.setUint32(0, 0x38425053);
      // version
      data.setUint16(4, 1);
      // channels
      data.setUint16(12, 3);
      // height
      data.setUint32(14, 30000);
      // width
      data.setUint32(18, 30000);
      // depth
      data.setUint16(22, 8);
      // RGB
      data.setUint16(24, 3);
      expect(() => decodePsd({ data: psd })).toThrow(LibError);
    });

    test('PSD with large planes and no data', () => {
      const psd = new Uint8Array(26 + 4 + 4 + 12 + 2);
      const data = new DataView(psd.buffer);
      // 8BPS
      data.setUint32(0, 0x38425053);
      // version
      data.setUint16(4, 1);
      // channels
      data.setUint16(12, 4);
      // height
      data.setUint32(14, 8000);
      // width
      data.setUint32(18, 8000);
      // depth
      data.setUint16(22, 8);
      // RGB
      data.setUint16(24, 3);
      // empty layer and mask sections
      data.setUint32(34, 8);
      expect(() => decodePsd({ data: psd })).toThrow(LibError);
    });

    test('BMP with a negative width', () => {
      const bmp = encodeBmp({
        image: new MemoryImage({ width: 2, height: 2 }),
      });
      const data = new DataView(bmp.buffer, bmp.byteOffset, bmp.byteLength);
      data.setInt32(18, -2147483648, true);
      expect(decodeBmp({ data: bmp })).toBeUndefined();
    });

    test('BMP with too little data for its size', () => {
      const bmp = encodeBmp({
        image: new MemoryImage({ width: 2, height: 2 }),
      });
      const data = new DataView(bmp.buffer, bmp.byteOffset, bmp.byteLength);
      data.setInt32(22, 10000, true);
      expect(() => decodeBmp({ data: bmp })).toThrow(LibError);
    });

    test('PNM with a negative size', () => {
      const pnm = new Uint8Array(
        Array.from('P1\n-2 -2\n0 1 0 1\n', (c) => c.charCodeAt(0))
      );
      expect(decodePnm({ data: pnm })).toBeUndefined();
    });

    test('PNM with too little data for its size', () => {
      const pnm = new Uint8Array(
        Array.from('P1\n10000 10000\n0 1 0 1\n', (c) => c.charCodeAt(0))
      );
      expect(() => decodePnm({ data: pnm })).toThrow(LibError);
    });
  });
});
