/** @format */

import { Clamp } from '../common/clamp';
import { MemoryImage } from '../common/memory-image';
import { ImageError } from '../error/image-error';
import { HdrImage } from './hdr-image';

export abstract class HdrToImage {
  /**
   * Convert a high dynamic range image to a low dynamic range image,
   * with optional exposure control.
   */
  public static hdrToImage(hdr: HdrImage, exposure?: number): MemoryImage {
    const knee = (x: number, f: number) => Math.log(x * f + 1.0) / f;
    const gamma = (h: number, m: number) => {
      let x = Math.max(0, h * m);
      if (x > 1.0) {
        x = 1.0 + knee(x - 1, 0.184874);
      }
      return Math.pow(x, 0.4545) * 84.66;
    };

    const image = new MemoryImage({
      width: hdr.width,
      height: hdr.height,
    });
    const pixels = image.getBytes();

    if (!hdr.hasColor) {
      throw new ImageError('Only RGB[A] images are currently supported.');
    }

    const m =
      exposure !== undefined
        ? Math.pow(2.0, Clamp.clamp(exposure + 2.47393, -20.0, 20.0))
        : 1.0;

    for (let y = 0, di = 0; y < hdr.height; ++y) {
      for (let x = 0; x < hdr.width; ++x) {
        let r = hdr.getRed(x, y);
        let g = hdr.numberOfChannels == 1 ? r : hdr.getGreen(x, y);
        let b = hdr.numberOfChannels == 1 ? r : hdr.getBlue(x, y);

        if (!Number.isFinite(r) || Number.isNaN(r)) {
          r = 0.0;
        }
        if (!Number.isFinite(g) || Number.isNaN(g)) {
          g = 0.0;
        }
        if (!Number.isFinite(b) || Number.isNaN(b)) {
          b = 0.0;
        }

        let ri = 0;
        let gi = 0;
        let bi = 0;
        if (exposure !== undefined) {
          ri = gamma(r, m);
          gi = gamma(g, m);
          bi = gamma(b, m);
        } else {
          ri = r * 255.0;
          gi = g * 255.0;
          bi = b * 255.0;
        }

        // Normalize the color
        const mi = Math.max(ri, Math.max(gi, bi));
        if (mi > 255.0) {
          ri = 255.0 * (ri / mi);
          gi = 255.0 * (gi / mi);
          bi = 255.0 * (bi / mi);
        }

        pixels[di++] = Clamp.clampInt255(ri);
        pixels[di++] = Clamp.clampInt255(gi);
        pixels[di++] = Clamp.clampInt255(bi);

        if (hdr.alpha !== undefined) {
          let a = hdr.alpha!.getFloat(x, y);
          if (!Number.isFinite(a) || Number.isNaN(a)) {
            a = 1.0;
          }
          pixels[di++] = Clamp.clampInt255(a * 255.0);
        } else {
          pixels[di++] = 255;
        }
      }
    }

    return image;
  }
}
