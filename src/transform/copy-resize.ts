/** @format */

import { ColorUtils } from '../common/color-utils';
import { MemoryImage } from '../common/memory-image';
import { ImageError } from '../error/image-error';
import { Interpolation } from '../formats/util/interpolation';
import { BakeOrientationTransform } from './bake-orientation';

export interface CopyResizeOptionsUsingWidth {
  image: MemoryImage;
  width: number;
  height?: number;
  interpolation?: Interpolation;
}

export interface CopyResizeOptionsUsingHeight {
  image: MemoryImage;
  height: number;
  width?: number;
  interpolation?: Interpolation;
}

export abstract class CopyResizeTransform {
  /**
   * Returns a resized copy of the [src] image.
   * If [height] isn't specified, then it will be determined by the aspect
   * ratio of [src] and [width].
   * If [width] isn't specified, then it will be determined by the aspect ratio
   * of [src] and [height].
   */
  public static copyResize(
    options: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight
  ): MemoryImage {
    options.interpolation ??= Interpolation.nearest;
    options.width ??= 0;
    options.height ??= 0;

    if (options.width === 0 && options.height === 0) {
      throw new ImageError('CopyResize: wrong size');
    }

    const src = BakeOrientationTransform.bakeOrientation(options.image);

    if (options.height === 0) {
      options.height = Math.trunc(options.width * (src.height / src.width));
    }

    if (options.width === 0) {
      options.width = Math.trunc(options.height * (src.width / src.height));
    }

    if (options.width === src.width && options.height === src.height) {
      return src.clone();
    }

    const dst = new MemoryImage({
      width: options.width,
      height: options.height,
      rgbChannelSet: src.rgbChannelSet,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    const dy = src.height / options.height;
    const dx = src.width / options.width;

    if (options.interpolation === Interpolation.average) {
      const sData = src.getBytes();
      const sw4 = src.width * 4;

      for (let y = 0; y < options.height; ++y) {
        const y1 = Math.trunc(y * dy);
        let y2 = Math.trunc((y + 1) * dy);
        if (y2 === y1) {
          y2++;
        }

        for (let x = 0; x < options.width; ++x) {
          const x1 = Math.trunc(x * dx);
          let x2 = Math.trunc((x + 1) * dx);
          if (x2 === x1) {
            x2++;
          }

          let r = 0;
          let g = 0;
          let b = 0;
          let a = 0;
          let np = 0;
          for (let sy = y1; sy < y2; ++sy) {
            let si = sy * sw4 + x1 * 4;
            for (let sx = x1; sx < x2; ++sx, ++np) {
              r += sData[si++];
              g += sData[si++];
              b += sData[si++];
              a += sData[si++];
            }
          }
          dst.setPixel(
            x,
            y,
            ColorUtils.getColor(
              Math.floor(r / np),
              Math.floor(g / np),
              Math.floor(b / np),
              Math.floor(a / np)
            )
          );
        }
      }
    } else if (options.interpolation === Interpolation.nearest) {
      const scaleX = new Int32Array(options.width);
      for (let x = 0; x < options.width; ++x) {
        scaleX[x] = Math.trunc(x * dx);
      }
      for (let y = 0; y < options.height; ++y) {
        const y2 = Math.trunc(y * dy);
        for (let x = 0; x < options.width; ++x) {
          dst.setPixel(x, y, src.getPixel(scaleX[x], y2));
        }
      }
    } else {
      // Copy the pixels from this image to the new image.
      for (let y = 0; y < options.height; ++y) {
        const y2 = y * dy;
        for (let x = 0; x < options.width; ++x) {
          const x2 = x * dx;
          dst.setPixel(
            x,
            y,
            src.getPixelInterpolate(x2, y2, options.interpolation)
          );
        }
      }
    }

    return dst;
  }
}
