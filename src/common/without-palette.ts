/** @format */

import { MemoryImage } from '../image/image.js';

/**
 * Returns **src** with each palette frame converted to the channels of its
 * own palette: converting with the source's channel count gives every frame
 * the channels of the first, so GIF frames with a 4 channel palette lost
 * alpha.
 * @param {MemoryImage} src - The source image.
 * @returns {MemoryImage} The image without palettes.
 */
export function withoutPalette(src: MemoryImage): MemoryImage {
  let first: MemoryImage | undefined = undefined;
  for (const frame of src.frames) {
    const converted = frame.hasPalette
      ? frame.convert({ numChannels: frame.numChannels, skipAnimation: true })
      : MemoryImage.from(frame, true);
    first?.addFrame(converted);
    first ??= converted;
  }

  return first!;
}

/**
 * Returns **src** converted by {@link withoutPalette} if any of its frames
 * has a palette, otherwise **src** itself.
 * @param {MemoryImage} src - The source image.
 * @returns {MemoryImage} The image without palettes.
 */
export function withoutPalettes(src: MemoryImage): MemoryImage {
  return src.frames.some((frame) => frame.hasPalette)
    ? withoutPalette(src)
    : src;
}

/**
 * Returns **src** with its palette frames converted when the first frame has
 * no palette. Transforms write blended colors into a copy of each frame, and
 * the copy of a later palette frame stored those colors as palette indices.
 * @param {MemoryImage} src - The source image.
 * @returns {MemoryImage} The image without later palettes.
 */
export function withoutLaterPalettes(src: MemoryImage): MemoryImage {
  return src.hasPalette ? src : withoutPalettes(src);
}
