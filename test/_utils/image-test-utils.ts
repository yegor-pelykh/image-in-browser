/** @format */

import { expect } from 'vitest';
import { ArrayUtils, Crc32, LibError, MemoryImage } from '../../src';
import { TestFolder } from './test-folder';
import { TestSection } from './test-section';
import { TestUtils } from './test-utils';

export abstract class ImageTestUtils {
  public static testImageEquals(
    image1: MemoryImage,
    image2: MemoryImage
  ): void {
    expect(image2.width).toBe(image1.width);
    expect(image2.height).toBe(image1.height);
    expect(image2.numChannels).toBe(image1.numChannels);
    expect(image2.hasPalette).toBe(image1.hasPalette);

    ImageTestUtils.testImageDataEquals(image1, image2);
  }

  public static hashImage(image: MemoryImage) {
    let hash = 0;
    let x = 0;
    let y = 0;

    const rgbaDouble = new Float64Array(4);
    const rgba8 = new Uint8Array(rgbaDouble.buffer);
    for (const p of image) {
      for (let ci = 0; ci < p.length; ++ci) {
        rgbaDouble[ci] = p.getChannel(ci);
      }
      hash = Crc32.getChecksum({
        buffer: rgba8,
        baseCrc: hash,
      });
      if (x !== p.x || y !== p.y) {
        throw new LibError('Invalid Pixel index.');
      }
      x++;
      if (x === image.width) {
        x = 0;
        y++;
      }
    }

    return hash;
  }

  public static testImageDataEquals(image1: MemoryImage, image2: MemoryImage) {
    const imageData = image1.data?.toUint8Array();
    const image2Data = image2.data?.toUint8Array();

    expect(imageData).toBeDefined();
    expect(image2Data).toBeDefined();

    if (imageData === undefined || image2Data === undefined) {
      return;
    }

    expect(ArrayUtils.equals(imageData, image2Data)).toBeTruthy();
  }

  public static dumpData(data: Uint8Array, fileName: string): void {
    TestUtils.writeToFile(TestFolder.output, TestSection.dump, fileName, data);
  }
}
