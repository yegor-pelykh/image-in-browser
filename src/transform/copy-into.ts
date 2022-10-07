/** @format */

import { MemoryImage } from '../common/memory-image';
import { drawPixel } from '../draw/draw-pixel';

/**
 * Copies a rectangular portion of one image to another image. [dst] is the
 * destination image, [src] is the source image identifier.
 *
 * In other words, copyInto will take an rectangular area from src of
 * width [src_w] and height [src_h] at position ([src_x],[src_y]) and place it
 * in a rectangular area of [dst] of width [dst_w] and height [dst_h] at
 * position ([dst_x],[dst_y]).
 *
 * If the source and destination coordinates and width and heights differ,
 * appropriate stretching or shrinking of the image fragment will be performed.
 * The coordinates refer to the upper left corner. This function can be used to
 * copy regions within the same image (if [dst] is the same as [src])
 * but if the regions overlap the results will be unpredictable.
 *
 * [dstX] and [dstY] represent the X and Y position where the [src] will start
 * printing.
 */
export interface CopyIntoOptions {
  dst: MemoryImage;
  src: MemoryImage;
  dstX?: number;
  dstY?: number;
  srcX?: number;
  srcY?: number;
  srcW?: number;
  srcH?: number;
  blend?: boolean;
  center?: boolean;
}

export abstract class CopyIntoTransform {
  /**
   * if [center] is true, the [src] will be centered in [dst].
   */
  public static copyInto(options: CopyIntoOptions): MemoryImage {
    options.dstX ??= 0;
    options.dstY ??= 0;
    options.srcX ??= 0;
    options.srcY ??= 0;
    options.srcW ??= options.src.width;
    options.srcH ??= options.src.height;
    options.blend ??= true;
    options.center ??= false;

    if (options.center) {
      {
        // If [src] is wider than [dst]
        let wdt = options.dst.width - options.src.width;
        if (wdt < 0) {
          wdt = 0;
        }
        options.dstX = Math.floor(wdt / 2);
      }
      {
        // If [src] is higher than [dst]
        let hight = options.dst.height - options.src.height;
        if (hight < 0) {
          hight = 0;
        }
        options.dstY = Math.floor(hight / 2);
      }
    }

    if (options.blend) {
      for (let y = 0; y < options.srcH; ++y) {
        for (let x = 0; x < options.srcW; ++x) {
          drawPixel(
            options.dst,
            options.dstX + x,
            options.dstY + y,
            options.src.getPixel(options.srcX + x, options.srcY + y)
          );
        }
      }
    } else {
      for (let y = 0; y < options.srcH; ++y) {
        for (let x = 0; x < options.srcW; ++x) {
          options.dst.setPixel(
            options.dstX + x,
            options.dstY + y,
            options.src.getPixel(options.srcX + x, options.srcY + y)
          );
        }
      }
    }

    return options.dst;
  }
}
