/** @format */

import { ColorUtils } from '../common/color-utils';
import { MemoryImage } from '../common/memory-image';

/**
 * Draw a single pixel into the image, applying alpha and opacity blending.
 */
export function drawPixel(
  image: MemoryImage,
  x: number,
  y: number,
  color: number,
  opacity = 0xff
): MemoryImage {
  if (image.boundsSafe(x, y)) {
    const index = image.getBufferIndex(x, y);
    const dst = image.getPixelByIndex(index);
    image.setPixelByIndex(
      index,
      ColorUtils.alphaBlendColors(dst, color, opacity)
    );
  }
  return image;
}
