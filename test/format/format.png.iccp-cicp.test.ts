/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, PngCicpData, PngDecoder, PngEncoder } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: PNG (ICCP/CICP)', () => {
  test('decodes pixel values correctly (not all-black)', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'rgba_iccp_cicp.png'
    );
    const image = decodePng({
      data: bytes,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(image.width).toBe(4);
    expect(image.height).toBe(4);
    expect(image.numChannels).toBe(4);

    const checkPixel = (
      x: number,
      y: number,
      r: number,
      g: number,
      b: number,
      a: number
    ) => {
      const p = image.getPixel(x, y);
      expect(p.r).toBe(r);
      expect(p.g).toBe(g);
      expect(p.b).toBe(b);
      expect(p.a).toBe(a);
    };

    // Row 0 – fully-opaque colour pixels
    // red
    checkPixel(0, 0, 255, 0, 0, 255);
    // green
    checkPixel(1, 0, 0, 255, 0, 255);
    // blue
    checkPixel(2, 0, 0, 0, 255, 255);
    // white
    checkPixel(3, 0, 255, 255, 255, 255);

    // Row 1 – mixed opacity
    // black opaque
    checkPixel(0, 1, 0, 0, 0, 255);
    // grey
    checkPixel(1, 1, 128, 128, 128, 255);
    // yellow
    checkPixel(2, 1, 255, 255, 0, 255);
    // fully transparent
    checkPixel(3, 1, 0, 0, 0, 0);

    // Row 2 – more colours
    // cyan
    checkPixel(0, 2, 0, 255, 255, 255);
    // magenta
    checkPixel(1, 2, 255, 0, 255, 255);
    // orange
    checkPixel(2, 2, 255, 128, 0, 255);
    // semi-transparent red
    checkPixel(3, 2, 200, 0, 0, 128);

    // Row 3 – all transparent
    for (let x = 0; x < 4; x++) {
      checkPixel(x, 3, 0, 0, 0, 0);
    }
  });

  test('iCCP name is preserved in iccProfile metadata', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'rgba_iccp_cicp.png'
    );
    const image = decodePng({
      data: bytes,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(image.iccProfile).toBeDefined();
    if (image.iccProfile === undefined) {
      return;
    }
    expect(image.iccProfile.name).toBe('Display P3');
  });

  test('cICP chunk is parsed and stored (not silently discarded)', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'rgba_iccp_cicp.png'
    );

    const decoder = new PngDecoder();
    decoder.startDecode(bytes);

    expect(decoder.info.cicpData).toBeDefined();
    if (decoder.info.cicpData === undefined) {
      return;
    }

    const cicp = decoder.info.cicpData;

    // Our test PNG has cICP = [12, 13, 0, 1] (Display P3, sRGB transfer,
    // identity matrix, full range).
    expect(cicp.colorPrimaries).toBe(12);
    expect(cicp.transferCharacteristics).toBe(13);
    expect(cicp.matrixCoefficients).toBe(0);
    expect(cicp.videoFullRangeFlag).toBe(1);
  });

  test('cICP round-trips through encoder', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'rgba_iccp_cicp.png'
    );
    const original = decodePng({
      data: bytes,
    });
    expect(original).toBeDefined();
    if (original === undefined) {
      return;
    }

    const expectedCicp: PngCicpData = {
      colorPrimaries: 12,
      transferCharacteristics: 13,
      matrixCoefficients: 0,
      videoFullRangeFlag: 1,
    };
    const encoded = Uint8Array.from(
      new PngEncoder({
        cicpData: expectedCicp,
      }).encode({
        image: original,
      })
    );

    // Decode the re-encoded PNG
    const reDecoder = new PngDecoder();
    reDecoder.startDecode(encoded);

    expect(reDecoder.info.cicpData).toBeDefined();
    if (reDecoder.info.cicpData === undefined) {
      return;
    }

    const isEqual =
      reDecoder.info.cicpData.colorPrimaries === expectedCicp.colorPrimaries &&
      reDecoder.info.cicpData.transferCharacteristics ===
        expectedCicp.transferCharacteristics &&
      reDecoder.info.cicpData.matrixCoefficients ===
        expectedCicp.matrixCoefficients &&
      reDecoder.info.cicpData.videoFullRangeFlag ===
        expectedCicp.videoFullRangeFlag;
    expect(isEqual).toBeTruthy();
  });
});
