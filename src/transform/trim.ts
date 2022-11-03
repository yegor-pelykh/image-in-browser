/** @format */

import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { Rectangle } from '../common/rectangle';
import { TrimMode } from './trim-mode';
import { TrimSide } from './trim-side';
import { ImageTransform } from './image-transform';
import { Color } from '../common/color';

export abstract class TrimTransform {
  /**
   * Find the crop area to be used by the trim function.
   * Returns the Rectangle. You could pass these constraints
   * to the **copyCrop** function to crop the image.
   */
  private static findTrim(
    src: MemoryImage,
    mode: TrimMode = TrimMode.transparent,
    sides: TrimSide = TrimSide.all
  ) {
    let h = src.height;
    let w = src.width;

    const bg =
      mode === TrimMode.topLeftColor
        ? src.getPixel(0, 0)
        : mode === TrimMode.bottomRightColor
        ? src.getPixel(w - 1, h - 1)
        : 0;

    let xmin = w;
    let xmax = 0;
    let ymin: number | undefined = undefined;
    let ymax = 0;

    for (let y = 0; y < h; ++y) {
      let first = true;
      for (let x = 0; x < w; ++x) {
        const c = src.getPixel(x, y);
        if (
          (mode === TrimMode.transparent && Color.getAlpha(c) !== 0) ||
          (mode !== TrimMode.transparent && c !== bg)
        ) {
          if (xmin > x) {
            xmin = x;
          }
          if (xmax < x) {
            xmax = x;
          }
          ymin ??= y;

          ymax = y;

          if (first) {
            x = xmax;
            first = false;
          }
        }
      }
    }

    // A trim wasn't found
    if (ymin === undefined) {
      return new Rectangle(0, 0, w, h);
    }

    if (!sides.has(TrimSide.top)) {
      ymin = 0;
    }
    if (!sides.has(TrimSide.bottom)) {
      ymax = h - 1;
    }
    if (!sides.has(TrimSide.left)) {
      xmin = 0;
    }
    if (!sides.has(TrimSide.right)) {
      xmax = w - 1;
    }

    // Image width in pixels
    w = 1 + xmax - xmin;
    // Image height in pixels
    h = 1 + ymax - ymin;

    return new Rectangle(xmin, ymin, w, h);
  }

  /**
   * Automatically crops the image by finding the corners of the image that
   * meet the **mode** criteria (not transparent or a different color).
   *
   * **mode** can be either **TrimMode.transparent**, **TrimMode.topLeftColor** or
   * **TrimMode.bottomRightColor**.
   *
   * **sides** can be used to control which sides of the image get trimmed,
   * and can be any combination of **TrimSide.top**, **TrimSide.bottom**, **TrimSide.left**,
   * and **TrimSide.right**.
   */
  public static trim(
    src: MemoryImage,
    mode: TrimMode = TrimMode.transparent,
    sides: TrimSide = TrimSide.all
  ): MemoryImage {
    if (
      mode === TrimMode.transparent &&
      src.rgbChannelSet === RgbChannelSet.rgb
    ) {
      return MemoryImage.from(src);
    }

    const crop = TrimTransform.findTrim(src, mode, sides);

    const dst = new MemoryImage({
      width: crop.width,
      height: crop.height,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    ImageTransform.copyInto({
      dst: dst,
      src: src,
      srcX: crop.left,
      srcY: crop.top,
      srcW: crop.width,
      srcH: crop.height,
      blend: false,
    });

    return dst;
  }
}
