/** @format */

import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { Interpolation } from '../formats/util/interpolation';

export abstract class CopyRotateTransform {
  /**
   * Returns a copy of the [src] image, rotated by [angle] degrees.
   */
  public static copyRotate(
    src: MemoryImage,
    angle: number,
    interpolation: Interpolation = Interpolation.nearest
  ): MemoryImage {
    const nangle: number = angle % 360.0;

    // Optimized version for orthogonal angles.
    if (nangle % 90 === 0) {
      const wm1 = src.width - 1;
      const hm1 = src.height - 1;

      const iangle = Math.floor(nangle / 90.0);
      switch (iangle) {
        case 1: {
          // 90 deg.
          const dst = new MemoryImage({
            width: src.height,
            height: src.width,
            rgbChannelSet: src.rgbChannelSet,
            exifData: src.exifData,
            iccProfile: src.iccProfile,
          });
          for (let y = 0; y < dst.height; ++y) {
            for (let x = 0; x < dst.width; ++x) {
              dst.setPixel(x, y, src.getPixel(y, hm1 - x));
            }
          }
          return dst;
        }
        case 2: {
          // 180 deg.
          const dst = new MemoryImage({
            width: src.width,
            height: src.height,
            rgbChannelSet: src.rgbChannelSet,
            exifData: src.exifData,
            iccProfile: src.iccProfile,
          });
          for (let y = 0; y < dst.height; ++y) {
            for (let x = 0; x < dst.width; ++x) {
              dst.setPixel(x, y, src.getPixel(wm1 - x, hm1 - y));
            }
          }
          return dst;
        }
        case 3: {
          // 270 deg.
          const dst = new MemoryImage({
            width: src.height,
            height: src.width,
            rgbChannelSet: src.rgbChannelSet,
            exifData: src.exifData,
            iccProfile: src.iccProfile,
          });
          for (let y = 0; y < dst.height; ++y) {
            for (let x = 0; x < dst.width; ++x) {
              dst.setPixel(x, y, src.getPixel(wm1 - y, x));
            }
          }
          return dst;
        }
        default: {
          // 0 deg.
          return MemoryImage.from(src);
        }
      }
    }

    // Generic angle.
    const rad = (nangle * Math.PI) / 180.0;
    const ca = Math.cos(rad);
    const sa = Math.sin(rad);
    const ux = Math.abs(src.width * ca);
    const uy = Math.abs(src.width * sa);
    const vx = Math.abs(src.height * sa);
    const vy = Math.abs(src.height * ca);
    const w2 = 0.5 * src.width;
    const h2 = 0.5 * src.height;
    const dw2 = 0.5 * (ux + vx);
    const dh2 = 0.5 * (uy + vy);

    const dst = new MemoryImage({
      width: Math.trunc(ux + vx),
      height: Math.trunc(uy + vy),
      rgbChannelSet: RgbChannelSet.rgba,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    for (let y = 0; y < dst.height; ++y) {
      for (let x = 0; x < dst.width; ++x) {
        const c = src.getPixelInterpolate(
          w2 + (x - dw2) * ca + (y - dh2) * sa,
          h2 - (x - dw2) * sa + (y - dh2) * ca,
          interpolation
        );
        dst.setPixel(x, y, c);
      }
    }

    return dst;
  }
}
