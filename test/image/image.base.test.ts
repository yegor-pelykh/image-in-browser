/** @format */

import { describe, expect, test } from 'vitest';
import {
  ArrayUtils,
  ChannelOrder,
  ColorRgb8,
  decodePng,
  Draw,
  encodeBmp,
  Format,
  MemoryImage,
  Pixel,
} from '../../src';
import { getRowStride } from '../../src/color/format';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the MemoryImage class.
 */
describe('MemoryImage', () => {
  /**
   * Test the creation of an empty MemoryImage.
   */
  test('empty', () => {
    const i0 = new MemoryImage();
    expect(i0.isValid).toBeFalsy();

    const i1 = new MemoryImage();
    expect(i1.isValid).toBeFalsy();
  });

  /**
   * Test the rowStride calculation for different formats.
   */
  test('rowStride', () => {
    for (const format of ArrayUtils.getNumEnumValues(Format)) {
      const img = new MemoryImage({
        width: 10,
        height: 1,
        format: format,
      });
      const rowStride = getRowStride(10, 3, format);
      expect(img.rowStride).toBe(rowStride);
    }
  });

  /**
   * Test resizing a MemoryImage and preserving the palette.
   */
  test('fromResized', () => {
    const i1 = new MemoryImage({
      width: 20,
      height: 20,
      withPalette: true,
      numChannels: 4,
    });

    i1.addFrame(
      new MemoryImage({
        width: 20,
        height: 20,
        palette: i1.palette,
      })
    );
    i1.addFrame(
      new MemoryImage({
        width: 20,
        height: 20,
        palette: i1.palette,
      })
    );

    for (let i = 0; i < 256; ++i) {
      i1.palette?.setRgba(i, i, i, i, i);
    }

    const i2 = MemoryImage.fromResized(i1, 10, 10);

    for (const img of i2.frames) {
      for (let i = 0; i < 256; ++i) {
        expect(img.palette?.get(i, 0)).toBe(i);
        expect(img.palette?.get(i, 1)).toBe(i);
        expect(img.palette?.get(i, 2)).toBe(i);
        expect(img.palette?.get(i, 3)).toBe(i);
      }
    }
  });

  /**
   * Test creating a MemoryImage from raw bytes.
   */
  test('fromBytes', () => {
    const w = 256;
    const h = 256;
    const w2 = 300;
    const stride = w2 * 3;
    const bytes = new Uint8Array(h * stride);
    for (let y = 0, i = 0; y < h; ++y) {
      for (let x = 0; x < w2; ++x) {
        bytes[i++] = x < 256 ? x : 255;
        bytes[i++] = x < 256 ? y : 0;
        bytes[i++] = x < 256 ? 0 : 255;
      }
    }

    const img = MemoryImage.fromBytes({
      width: w,
      height: h,
      bytes: bytes.buffer,
      rowStride: stride,
    });
    expect(img.width).toBe(w);
    expect(img.height).toBe(h);
    expect(img.numChannels).toBe(3);
    for (const p of img) {
      expect(p.r).toBe(p.x);
      expect(p.g).toBe(p.y);
      expect(p.b).toBe(0);
    }

    const img2 = MemoryImage.fromBytes({
      width: w,
      height: h,
      bytes: bytes.buffer,
      rowStride: stride,
      channelOrder: ChannelOrder.bgr,
    });
    expect(img.width).toBe(w);
    expect(img.height).toBe(h);
    expect(img.numChannels).toBe(3);
    for (const p of img2) {
      expect(p.r).toBe(0);
      expect(p.g).toBe(p.y);
      expect(p.b).toBe(p.x);
    }

    img2.remapChannels(ChannelOrder.bgr);
    for (const p of img2) {
      expect(p.r).toBe(p.x);
      expect(p.g).toBe(p.y);
      expect(p.b).toBe(0);
    }
  });

  /**
   * Test creating a MemoryImage from raw bytes with different channel orders.
   */
  test('fromBytes order', () => {
    const w = 256;
    const h = 256;
    const w2 = 300;
    const stride = w2 * 4;
    const bytes = new Uint8Array(h * stride);
    for (let y = 0, i = 0; y < h; ++y) {
      for (let x = 0; x < w2; ++x) {
        bytes[i++] = 255;
        bytes[i++] = 200;
        bytes[i++] = 128;
        bytes[i++] = 64;
      }
    }

    const img = MemoryImage.fromBytes({
      width: 256,
      height: 256,
      bytes: bytes.buffer,
      rowStride: stride,
      channelOrder: ChannelOrder.bgra,
    });
    expect(img.width).toBe(w);
    expect(img.height).toBe(h);
    expect(img.numChannels).toBe(4);
    for (const p of img) {
      expect(p.r).toBe(128);
      expect(p.g).toBe(200);
      expect(p.b).toBe(255);
      expect(p.a).toBe(64);
    }

    img.remapChannels(ChannelOrder.bgra);
    for (const p of img) {
      expect(p.r).toBe(255);
      expect(p.g).toBe(200);
      expect(p.b).toBe(128);
      expect(p.a).toBe(64);
    }
  });

  /**
   * Test pixel iteration over a MemoryImage.
   */
  test('Pixel iteration', () => {
    const image = new MemoryImage({
      width: 10,
      height: 10,
    });

    let ctrFor = 0;
    for (const p of image) {
      ctrFor++;
    }
    expect(ctrFor).toBe(100);

    const it = image[Symbol.iterator]();
    let itr: IteratorResult<Pixel> | undefined = undefined;
    let ctrWhile = 0;
    while (((itr = it.next()), !itr.done)) {
      ctrWhile++;
    }
    expect(ctrWhile).toBe(100);
  });

  /**
   * Test the getPixel iterator of a MemoryImage.
   */
  test('getPixel iterator', () => {
    const i0 = new MemoryImage({
      width: 10,
      height: 10,
    });
    const p = i0.getPixel(0, 5);
    let x = 0;
    let y = 5;
    let itr: IteratorResult<Pixel> | undefined = undefined;
    do {
      expect(x).toBe(p.x);
      expect(y).toBe(p.y);
      x++;
      if (x === 10) {
        x = 0;
        y++;
      }
    } while (((itr = p.next()), !itr.done));
  });

  /**
   * Test the getRange method of a MemoryImage.
   */
  test('getRange', () => {
    const i0 = new MemoryImage({
      width: 10,
      height: 10,
    });
    let x = 0;
    let y = 0;
    const iter = i0.getRange(0, 0, 10, 10);
    let iterRes: IteratorResult<Pixel> | undefined = undefined;
    while (((iterRes = iter.next()), !iterRes.done)) {
      expect(x).toBe(iterRes.value.x);
      expect(y).toBe(iterRes.value.y);
      x++;
      if (x === 10) {
        x = 0;
        y++;
      }
    }
  });

  /**
   * Test converting an image with alpha channel to 1-bit per pixel BMP format.
   */
  test('alpha_bmp_1bpp', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'alpha_bmp.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const bg = new MemoryImage({
      width: img.width,
      height: img.height,
    });
    bg.clear(new ColorRgb8(255, 255, 255));

    Draw.compositeImage({
      dst: bg,
      src: img,
    });

    const bpp1 = bg.convert({
      format: Format.uint1,
      numChannels: 1,
    });

    const output = encodeBmp({
      image: bpp1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.bmp,
      'alpha_bmp_cvt.bmp',
      output
    );
  });

  /**
   * Test getting bytes from an image with RGB to ARGB channel order conversion.
   */
  test('GetBytes rgb -> argb', () => {
    const i1 = new MemoryImage({
      width: 1,
      height: 1,
    });
    i1.setPixelRgb(0, 0, 32, 64, 128);

    const b1 = i1.getBytes({
      order: ChannelOrder.argb,
    });

    expect(b1.length).toBe(4);
    expect(b1[0]).toBe(255);
    expect(b1[1]).toBe(32);
    expect(b1[2]).toBe(64);
    expect(b1[3]).toBe(128);
  });
});
