/** @format */

import { describe, expect, test } from 'vitest';
import {
  ArrayUtils,
  ColorRgb8,
  decodeGif,
  decodeJpg,
  decodePng,
  decodeTga,
  encodeBmp,
  encodeGif,
  encodeJpg,
  encodePng,
  encodeTga,
  Filter,
  HistogramEqualizeMode,
  MemoryImage,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for image filter operations.
 */
describe('Filter', () => {
  /*
   * Test case for basic histogram equalization on a JPEG image.
   */
  test('histogramEqualization_jpg1', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'oblique.jpg'
    );
    const i0 = decodeJpg({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    Filter.histogramEqualization({
      image: i0,
    });
    const output = encodeJpg({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_jpg1.jpg',
      output
    );
  });

  /*
   * Test case for histogram equalization with specified
   * output min/max range on a JPEG image.
   */
  test('histogramEqualization_minmax', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'progress.jpg'
    );
    const i0 = decodeJpg({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    Filter.histogramEqualization({
      image: i0,
      outputRangeMin: 5,
      outputRangeMax: 220,
    });
    const output = encodeJpg({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_minmax.jpg',
      output
    );
  });

  /*
   * Test case for color histogram equalization
   * with custom output range on a PNG image.
   */
  test('histogramEqualization Color', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const i0 = decodePng({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    Filter.histogramEqualization({
      image: i0,
      mode: HistogramEqualizeMode.color,
      outputRangeMin: -20,
      outputRangeMax: 999,
    });
    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_color.png',
      output
    );
  });

  /*
   * Test case for histogram equalization on a synthetic image
   * to verify pixel distribution.
   */
  test('histogramEqualization synthetic1', () => {
    const i0 = new MemoryImage({
      width: 64,
      height: 5,
    });
    i0.clear(new ColorRgb8(0, 0, 0));

    let v = 0;
    for (const p of i0) {
      p.setRgb((v % 64) * 2, (v % 64) * 2, (v % 64) * 2);
      v++;
    }
    Filter.histogramEqualization({
      image: i0,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }
    let pCounter = 0;
    for (let l = 0; l < 128; ++l) {
      pCounter += Math.floor(H[l]);
    }

    const numOfPixel = i0.width * i0.height;
    expect(pCounter / numOfPixel).toBeLessThan(0.5001);
    expect(pCounter / numOfPixel).toBeGreaterThanOrEqual(0.4999);

    const output = encodeBmp({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_synthetic1.bmp',
      output
    );
  });

  /*
   * Test case for histogram equalization on a synthetic image
   * with output range constraints and histogram verification.
   */
  test('histogramEqualization synthetic2', () => {
    const i0 = new MemoryImage({
      width: 729,
      height: 1,
    });
    i0.clear(new ColorRgb8(0, 0, 0));

    let v = 0;
    for (const p of i0) {
      p.setRgb(
        Math.round(v / 3 + 6),
        Math.round(v / 5 + 8),
        Math.round(v / 7 + 22)
      );
      v++;
    }
    Filter.histogramEqualization({
      image: i0,
      outputRangeMin: 5,
      outputRangeMax: 250,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }
    let pCounterLow = 0;
    for (let l = 0; l < 128; ++l) {
      pCounterLow += Math.floor(H[l]);
    }

    const numOfPixel = i0.width * i0.height;
    expect(pCounterLow / numOfPixel).toBeLessThan(0.51);
    expect(pCounterLow / numOfPixel).toBeGreaterThanOrEqual(0.49);

    for (let l = 0; l < 5; ++l) {
      expect(H[l]).toEqual(0);
    }
    for (let l = 251; l < 256; ++l) {
      expect(H[l]).toEqual(0);
    }

    const output = encodeBmp({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_synthetic2.bmp',
      output
    );
  });

  /*
   * Test case for histogram equalization on another synthetic image
   * with detailed histogram distribution verification.
   */
  test('histogramEqualization synthetic3', () => {
    const i0 = new MemoryImage({
      width: 1024,
      height: 1,
    });
    i0.clear(new ColorRgb8(0, 0, 0));

    let v = 0;
    for (const p of i0) {
      p.setRgb(Math.round(v / 4), Math.round(v / 4), Math.round(v / 4));
      v++;
    }
    Filter.histogramEqualization({
      image: i0,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }
    let pCounter = 0;
    for (let l = 0; l < 128; ++l) {
      pCounter += Math.floor(H[l]);
    }

    const numOfPixel = i0.width * i0.height;
    expect(pCounter / numOfPixel).toBeLessThan(0.5001);
    expect(pCounter / numOfPixel).toBeGreaterThanOrEqual(0.4999);

    let pCounterK = 0;
    for (let l = 120; l < 120 + 96; l += 3) {
      pCounterK += Math.floor(H[l]);
    }
    expect(pCounterK / numOfPixel).toBeLessThan(0.126);
    expect(pCounterK / numOfPixel).toBeGreaterThanOrEqual(0.124);

    const output = encodeBmp({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_synthetic3.bmp',
      output
    );
  });

  /*
   * Test case for histogram equalization on a single-channel PNG image,
   * verifying luminance computation and pixel distribution.
   */
  test('histogramEqualization format1', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'basn0g04.png'
    );
    let i0 = decodePng({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramEqualization({
      image: i0,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }

    let pCounter = 0;
    for (let l = 0; l < 8; ++l) {
      pCounter += Math.floor(H[l]);
    }

    const numOfPixel = i0.width * i0.height;
    expect(pCounter / numOfPixel).toBeLessThan(0.57);
    expect(pCounter / numOfPixel).toBeGreaterThanOrEqual(0.43);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_format1.png',
      output
    );
  });

  /*
   * Test case for color histogram equalization on a multi-channel
   * PNG image, verifying pixel distribution.
   */
  test('histogramEqualization format2', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'david.png'
    );
    const i0 = decodePng({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    Filter.histogramEqualization({
      image: i0,
      mode: HistogramEqualizeMode.color,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }

    let pCounter = 0;
    for (let l = 0; l < 128; ++l) {
      pCounter += Math.floor(H[l]);
    }

    const numOfPixel = i0.width * i0.height;
    expect(pCounter / numOfPixel).toBeLessThan(0.51);
    expect(pCounter / numOfPixel).toBeGreaterThanOrEqual(0.49);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_format2.png',
      output
    );
  });

  /*
   * Test case for histogram equalization on a 4-bit grayscale PNG image.
   */
  test('histogramEqualization format3', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'cten0g04.png'
    );
    let i0 = decodePng({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramEqualization({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_format3.png',
      output
    );
  });

  /*
   * Test case for histogram equalization on a 4-channel TGA image.
   */
  test('histogramEqualization format4', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.tga,
      'buck_32_rle.tga'
    );
    let i0 = decodeTga({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramEqualization({
      image: i0,
    });

    const output = encodeTga({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_format4.tga',
      output
    );
  });

  /*
   * Test case for color histogram equalization on an animated GIF image,
   * checking a specific frame's pixel distribution.
   */
  test('histogramEqualization format5', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'cars.gif'
    );
    let i0 = decodeGif({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramEqualization({
      image: i0,
      mode: HistogramEqualizeMode.color,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[15]) {
      H[Math.round(p.luminance)]++;
    }

    let pCounter = 0;
    for (let l = 0; l < 128; ++l) {
      pCounter += Math.floor(H[l]);
    }

    const numOfPixel = i0.width * i0.height;
    expect(pCounter / numOfPixel).toBeLessThan(0.55);
    expect(pCounter / numOfPixel).toBeGreaterThanOrEqual(0.45);

    const output = encodeGif({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_format5.gif',
      output
    );
  });

  /*
   * Test case for histogram equalization on an animated GIF with transparency,
   * accounting for valid pixels in histogram calculation.
   */
  test('histogramEqualization format6', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'bounce.gif'
    );
    let i0 = decodeGif({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramEqualization({
      image: i0,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    let validPixelCounts = 0;
    for (const p of i0.frames[15]) {
      if (i0.hasAlpha && p.a === 0) {
        continue;
      }
      H[Math.round(p.luminance)]++;
      validPixelCounts++;
    }

    let pCounter = 0;
    for (let l = 0; l < 128; ++l) {
      pCounter += Math.floor(H[l]);
    }

    expect(pCounter / validPixelCounts).toBeLessThan(0.51);
    expect(pCounter / validPixelCounts).toBeGreaterThanOrEqual(0.49);

    const output = encodeGif({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramEqualization_format6.gif',
      output
    );
  });

  /*
   * Test case for basic histogram stretching on a JPEG image.
   */
  test('histogramStretch_jpg1', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'oblique.jpg'
    );
    const i0 = decodeJpg({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    Filter.histogramStretch({
      image: i0,
    });
    const output = encodeJpg({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramStretch_jpg1.jpg',
      output
    );
  });

  /*
   * Test case for histogram stretching with specified output min/max range
   * on a JPEG image, verifying pixel bounds.
   */
  test('histogramStretch_minmax', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'progress.jpg'
    );
    const i0 = decodeJpg({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    Filter.histogramStretch({
      image: i0,
      outputRangeMin: 5,
      outputRangeMax: 220,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }

    for (let l = 0; l < 5; ++l) {
      expect(H[l]).toEqual(0);
    }
    for (let l = 221; l < 256; ++l) {
      expect(H[l]).toEqual(0);
    }

    const output = encodeJpg({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramStretch_minmax.jpg',
      output
    );
  });

  /*
   * Test case for color histogram stretching with a stretch clip ratio
   * on a PNG image, verifying pixel distribution at output extremes.
   */
  test('histogramStretch Color', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    let i0 = decodePng({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramStretch({
      image: i0,
      mode: HistogramEqualizeMode.color,
      stretchClipRatio: 0.06,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    for (const p of i0.frames[0]) {
      H[Math.round(p.luminance)]++;
    }

    const numOfPixel = i0.width * i0.height;
    expect(H[0] / numOfPixel).toBeLessThan(0.067);
    expect(H[0] / numOfPixel).toBeGreaterThanOrEqual(0.059);
    expect(H[H.length - 1] / numOfPixel).toBeLessThan(0.067);
    expect(H[H.length - 1] / numOfPixel).toBeGreaterThanOrEqual(0.059);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramStretch_color.png',
      output
    );
  });

  /*
   * Test case for color histogram stretching on an animated GIF with transparency
   * and output range maximum, accounting for valid pixels.
   */
  test('histogramStretch format1', () => {
    const bytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'bounce.gif'
    );
    let i0 = decodeGif({
      data: bytes,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }
    i0 = Filter.histogramStretch({
      image: i0,
      mode: HistogramEqualizeMode.color,
      outputRangeMax: 200,
    });

    const H: number[] = ArrayUtils.generate(
      Math.ceil(i0.maxChannelValue) + 1,
      (_) => 0
    );
    let validPixelCounts = 0;
    for (const p of i0.frames[15]) {
      if (i0.hasAlpha && p.a === 0) {
        continue;
      }
      H[Math.round(p.luminance)]++;
      validPixelCounts++;
    }

    let pCounter = 0;
    for (let l = 0; l < 100; ++l) {
      pCounter += Math.floor(H[l]);
    }

    expect(pCounter / validPixelCounts).toBeLessThan(0.3);
    expect(pCounter / validPixelCounts).toBeGreaterThanOrEqual(0.2);

    const output = encodeGif({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'histogramStretch_format1.gif',
      output
    );
  });
});
