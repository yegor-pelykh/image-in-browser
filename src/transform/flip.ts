/** @format */

import { MemoryImage } from '../common/memory-image';
import { FlipDirection } from './flip-direction';

export abstract class FlipTransform {
  /**
   * Flips the [src] image using the given [mode], which can be one of:
   * [Flip.horizontal], [Flip.vertical], or [Flip.both].
   */
  public static flip(src: MemoryImage, direction: FlipDirection): MemoryImage {
    switch (direction) {
      case FlipDirection.horizontal:
        FlipTransform.flipHorizontal(src);
        break;
      case FlipDirection.vertical:
        FlipTransform.flipVertical(src);
        break;
      case FlipDirection.both:
        FlipTransform.flipVertical(src);
        FlipTransform.flipHorizontal(src);
        break;
    }
    return src;
  }

  /**
   * Flip the [src] image vertically.
   */
  public static flipVertical(src: MemoryImage): MemoryImage {
    const w = src.width;
    const h = src.height;
    const h2 = Math.floor(h / 2);
    for (let y = 0; y < h2; ++y) {
      const y1 = y * w;
      const y2 = (h - 1 - y) * w;
      for (let x = 0; x < w; ++x) {
        const t = src.getPixelByIndex(y2 + x);
        src.setPixelByIndex(y2 + x, src.getPixelByIndex(y1 + x));
        src.setPixelByIndex(y1 + x, t);
      }
    }
    return src;
  }

  /**
   * Flip the src image horizontally.
   */
  public static flipHorizontal(src: MemoryImage): MemoryImage {
    const w = src.width;
    const h = src.height;
    const w2 = Math.floor(src.width / 2);
    for (let y = 0; y < h; ++y) {
      const y1 = y * w;
      for (let x = 0; x < w2; ++x) {
        const x2 = w - 1 - x;
        const t = src.getPixelByIndex(y1 + x2);
        src.setPixelByIndex(y1 + x2, src.getPixelByIndex(y1 + x));
        src.setPixelByIndex(y1 + x, t);
      }
    }
    return src;
  }
}
