/** @format */

import { decodeImage, MemoryImage } from '../../src';
import { TestFolder } from './test-folder';
import { TestSection } from './test-section';
import { TestUtils } from './test-utils';

/**
 * Decodes a test input image.
 * @param {TestSection} section - The test input section.
 * @param {string} name - The file name.
 * @returns {MemoryImage} The decoded image.
 */
export function decodeTestImage(
  section: TestSection,
  name: string
): MemoryImage {
  const bytes = TestUtils.readFromFile(TestFolder.input, section, name);
  const image = decodeImage({ data: bytes });
  if (image === undefined) {
    throw new Error(`Failed to decode ${name}`);
  }
  return image;
}

/**
 * Counts the pixels of **actual** that differ from the pixel of the same
 * frame in **expected** at a position shifted by **offsetX** and **offsetY**.
 * @param {MemoryImage} actual - The actual image.
 * @param {MemoryImage} expected - The expected image.
 * @param {object} [opt] - Options.
 * @param {number} [opt.offsetX=0] - The expected X offset.
 * @param {number} [opt.offsetY=0] - The expected Y offset.
 * @param {boolean} [opt.withAlpha=true] - Whether to compare alpha.
 * @returns {number} The number of differing pixels.
 */
export function differingPixels(
  actual: MemoryImage,
  expected: MemoryImage,
  {
    offsetX = 0,
    offsetY = 0,
    withAlpha = true,
  }: { offsetX?: number; offsetY?: number; withAlpha?: boolean } = {}
): number {
  let count = 0;
  for (let index = 0; index < actual.numFrames; index++) {
    const expectedFrame = expected.frames[index];

    for (const pixel of actual.frames[index]) {
      const other = expectedFrame.getPixel(
        pixel.x + offsetX,
        pixel.y + offsetY
      );
      const sameColor =
        pixel.r === other.r && pixel.g === other.g && pixel.b === other.b;

      if (!sameColor || (withAlpha && pixel.a !== other.a)) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Counts the visible pixels of **resized** with a color outside the range of
 * the visible pixels in their block of **source**, which average resize cannot
 * produce.
 * @param {MemoryImage} source - The source image.
 * @param {MemoryImage} resized - The resized image.
 * @returns {number} The number of hidden-color pixels.
 */
export function hiddenColorPixels(
  source: MemoryImage,
  resized: MemoryImage
): number {
  let count = 0;
  for (let index = 0; index < source.numFrames; index++) {
    const frame = source.frames[index];
    const target = resized.frames[index];
    const verticalScale = frame.height / target.height;
    const horizontalScale = frame.width / target.width;

    for (const pixel of target) {
      if (pixel.a === 0) {
        continue;
      }

      const blockTop = Math.trunc(pixel.y * verticalScale);
      const blockLeft = Math.trunc(pixel.x * horizontalScale);
      let blockBottom = Math.trunc((pixel.y + 1) * verticalScale);
      let blockRight = Math.trunc((pixel.x + 1) * horizontalScale);
      blockBottom = blockBottom === blockTop ? blockTop + 1 : blockBottom;
      blockRight = blockRight === blockLeft ? blockLeft + 1 : blockRight;

      const lowest = [Infinity, Infinity, Infinity];
      const highest = [-1, -1, -1];
      for (let y = blockTop; y < blockBottom; y++) {
        for (let x = blockLeft; x < blockRight; x++) {
          const visible = frame.getPixel(x, y);
          if (visible.a === 0) {
            continue;
          }

          for (let channel = 0; channel < 3; channel++) {
            const value = visible.getChannel(channel);
            lowest[channel] = value < lowest[channel] ? value : lowest[channel];
            highest[channel] =
              value > highest[channel] ? value : highest[channel];
          }
        }
      }

      for (let channel = 0; channel < 3; channel++) {
        if (
          pixel.getChannel(channel) < lowest[channel] ||
          pixel.getChannel(channel) > highest[channel]
        ) {
          count++;
          break;
        }
      }
    }
  }

  return count;
}

/**
 * Resizes **source** by average per pixel in doubles: a plain mean in a block
 * with one alpha value, and a mean weighted by alpha in a block with mixed
 * alpha.
 * @param {MemoryImage} source - The source image.
 * @param {number} width - The destination width.
 * @param {number} height - The destination height.
 * @returns {MemoryImage} The expected image.
 */
export function alphaWeightedAverage(
  source: MemoryImage,
  width: number,
  height: number
): MemoryImage {
  let first: MemoryImage | undefined = undefined;
  for (const frame of source.frames) {
    const target = MemoryImage.fromResized(frame, width, height, true);
    first?.addFrame(target);
    first ??= target;
    const verticalScale = frame.height / height;
    const horizontalScale = frame.width / width;

    for (const pixel of target) {
      const blockTop = Math.trunc(pixel.y * verticalScale);
      const blockLeft = Math.trunc(pixel.x * horizontalScale);
      let blockBottom = Math.trunc((pixel.y + 1) * verticalScale);
      let blockRight = Math.trunc((pixel.x + 1) * horizontalScale);
      blockBottom = blockBottom === blockTop ? blockTop + 1 : blockBottom;
      blockRight = blockRight === blockLeft ? blockLeft + 1 : blockRight;

      const sums = [0, 0, 0];
      const weighted = [0, 0, 0];
      let alphaSum = 0;
      let lowestAlpha = Infinity;
      let highestAlpha = -Infinity;

      for (let y = blockTop; y < blockBottom; y++) {
        for (let x = blockLeft; x < blockRight; x++) {
          const sample = frame.getPixel(x, y);
          const alpha = sample.a;
          const colors = [sample.r, sample.g, sample.b];
          alphaSum += alpha;
          lowestAlpha = alpha < lowestAlpha ? alpha : lowestAlpha;
          highestAlpha = alpha > highestAlpha ? alpha : highestAlpha;

          for (let channel = 0; channel < 3; channel++) {
            sums[channel] += colors[channel];
            weighted[channel] += colors[channel] * alpha;
          }
        }
      }

      const count = (blockBottom - blockTop) * (blockRight - blockLeft);
      const isMixed = lowestAlpha >= 0 && lowestAlpha < highestAlpha;
      const colors = [
        isMixed ? weighted[0] / alphaSum : sums[0] / count,
        isMixed ? weighted[1] / alphaSum : sums[1] / count,
        isMixed ? weighted[2] / alphaSum : sums[2] / count,
      ];

      pixel.setRgba(colors[0], colors[1], colors[2], alphaSum / count);
    }
  }

  return first!;
}

/**
 * Returns a copy of **source** with the color of every fully transparent pixel
 * replaced, which must not change the visible pixels of a resized image.
 * @param {MemoryImage} source - The source image.
 * @returns {MemoryImage} The changed copy.
 */
export function withHiddenColorChanged(source: MemoryImage): MemoryImage {
  const copy = source.clone();
  for (const frame of copy.frames) {
    const highest = frame.maxChannelValue;
    const colorChannels = frame.numChannels - 1;

    for (const pixel of frame) {
      if (pixel.a !== 0) {
        continue;
      }

      for (let channel = 0; channel < colorChannels; channel++) {
        pixel.setChannel(channel, highest - pixel.getChannel(channel));
      }
    }
  }

  return copy;
}

/**
 * Counts the pixels with different alpha, and the visible pixels with
 * different color, between **actual** and **expected**.
 * @param {MemoryImage} actual - The actual image.
 * @param {MemoryImage} expected - The expected image.
 * @returns {number} The number of differences.
 */
export function visibleDifferences(
  actual: MemoryImage,
  expected: MemoryImage
): number {
  let count = 0;
  for (let index = 0; index < actual.numFrames; index++) {
    const expectedFrame = expected.frames[index];

    for (const pixel of actual.frames[index]) {
      const other = expectedFrame.getPixel(pixel.x, pixel.y);
      const sameColor =
        pixel.r === other.r && pixel.g === other.g && pixel.b === other.b;

      if (pixel.a !== other.a || (pixel.a !== 0 && !sameColor)) {
        count++;
      }
    }
  }

  return count;
}
