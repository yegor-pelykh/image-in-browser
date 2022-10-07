/** @format */

import { BitOperators } from '../../common/bit-operators';
import { ColorUtils } from '../../common/color-utils';
import { ExifData } from '../../common/exif_data';
import { MemoryImage } from '../../common/memory-image';
import { RgbChannelSet } from '../../common/rgb-channel-set';
import { ImageError } from '../../error/image-error';
import { ComponentData } from './component-data';
import { JpegData } from './jpeg-data';

export abstract class JpegQuantize {
  private static dctClip: Uint8Array | undefined;

  private static clamp8(i: number) {
    if (i < 0) {
      return 0;
    }
    if (i > 255) {
      return 255;
    }
    return i;
  }

  // These functions contain bit-shift operations that fail with HTML builds.
  // A conditional import is used to use a modified version for HTML builds
  // to work around this javascript bug, while keeping the native version fast.

  // Quantize the coefficients and apply IDCT.
  //
  // A port of poppler's IDCT method which in turn is taken from:
  // Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
  // "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
  // IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989, 988-991.
  public static quantizeAndInverse(
    quantizationTable: Int16Array,
    coefBlock: Int32Array,
    dataOut: Uint8Array,
    dataIn: Int32Array
  ): void {
    const p = dataIn;

    const dctClipOffset = 256;
    const dctClipLength = 768;
    if (JpegQuantize.dctClip === undefined) {
      JpegQuantize.dctClip = new Uint8Array(dctClipLength);
      for (let i = -256; i < 0; ++i) {
        JpegQuantize.dctClip[dctClipOffset + i] = 0;
      }
      for (let i = 0; i < 256; ++i) {
        JpegQuantize.dctClip[dctClipOffset + i] = i;
      }
      for (let i = 256; i < 512; ++i) {
        JpegQuantize.dctClip[dctClipOffset + i] = 255;
      }
    }

    // IDCT constants (20.12 fixed point format)

    // cos(pi/16)*4096
    const COS_1 = 4017;
    // sin(pi/16)*4096
    const SIN_1 = 799;
    // cos(3*pi/16)*4096
    const COS_3 = 3406;
    // sin(3*pi/16)*4096
    const SIN_3 = 2276;
    // cos(6*pi/16)*4096
    const COS_6 = 1567;
    // sin(6*pi/16)*4096
    const SIN_6 = 3784;
    // sqrt(2)*4096
    const SQRT_2 = 5793;
    // sqrt(2)/2
    const SQRT_1D2 = 2896;

    // De-quantize
    for (let i = 0; i < 64; i++) {
      p[i] = coefBlock[i] * quantizationTable[i];
    }

    // Inverse DCT on rows
    let row = 0;
    for (let i = 0; i < 8; ++i, row += 8) {
      // Check for all-zero AC coefficients
      if (
        p[1 + row] === 0 &&
        p[2 + row] === 0 &&
        p[3 + row] === 0 &&
        p[4 + row] === 0 &&
        p[5 + row] === 0 &&
        p[6 + row] === 0 &&
        p[7 + row] === 0
      ) {
        const t = BitOperators.shiftR(SQRT_2 * p[0 + row] + 512, 10);
        p[row + 0] = t;
        p[row + 1] = t;
        p[row + 2] = t;
        p[row + 3] = t;
        p[row + 4] = t;
        p[row + 5] = t;
        p[row + 6] = t;
        p[row + 7] = t;
        continue;
      }

      // Stage 4
      let v0 = BitOperators.shiftR(SQRT_2 * p[0 + row] + 128, 8);
      let v1 = BitOperators.shiftR(SQRT_2 * p[4 + row] + 128, 8);
      let v2 = p[2 + row];
      let v3 = p[6 + row];
      let v4 = BitOperators.shiftR(
        SQRT_1D2 * (p[1 + row] - p[7 + row]) + 128,
        8
      );
      let v7 = BitOperators.shiftR(
        SQRT_1D2 * (p[1 + row] + p[7 + row]) + 128,
        8
      );
      let v5 = BitOperators.shiftL(p[3 + row], 4);
      let v6 = BitOperators.shiftL(p[5 + row], 4);

      // Stage 3
      let t = BitOperators.shiftR(v0 - v1 + 1, 1);
      v0 = BitOperators.shiftR(v0 + v1 + 1, 1);
      v1 = t;
      t = BitOperators.shiftR(v2 * SIN_6 + v3 * COS_6 + 128, 8);
      v2 = BitOperators.shiftR(v2 * COS_6 - v3 * SIN_6 + 128, 8);
      v3 = t;
      t = BitOperators.shiftR(v4 - v6 + 1, 1);
      v4 = BitOperators.shiftR(v4 + v6 + 1, 1);
      v6 = t;
      t = BitOperators.shiftR(v7 + v5 + 1, 1);
      v5 = BitOperators.shiftR(v7 - v5 + 1, 1);
      v7 = t;

      // Stage 2
      t = BitOperators.shiftR(v0 - v3 + 1, 1);
      v0 = BitOperators.shiftR(v0 + v3 + 1, 1);
      v3 = t;
      t = BitOperators.shiftR(v1 - v2 + 1, 1);
      v1 = BitOperators.shiftR(v1 + v2 + 1, 1);
      v2 = t;
      t = BitOperators.shiftR(v4 * SIN_3 + v7 * COS_3 + 2048, 12);
      v4 = BitOperators.shiftR(v4 * COS_3 - v7 * SIN_3 + 2048, 12);
      v7 = t;
      t = BitOperators.shiftR(v5 * SIN_1 + v6 * COS_1 + 2048, 12);
      v5 = BitOperators.shiftR(v5 * COS_1 - v6 * SIN_1 + 2048, 12);
      v6 = t;

      // Stage 1
      p[0 + row] = v0 + v7;
      p[7 + row] = v0 - v7;
      p[1 + row] = v1 + v6;
      p[6 + row] = v1 - v6;
      p[2 + row] = v2 + v5;
      p[5 + row] = v2 - v5;
      p[3 + row] = v3 + v4;
      p[4 + row] = v3 - v4;
    }

    // Inverse DCT on columns
    for (let i = 0; i < 8; ++i) {
      const col = i;

      // Check for all-zero AC coefficients
      if (
        p[1 * 8 + col] === 0 &&
        p[2 * 8 + col] === 0 &&
        p[3 * 8 + col] === 0 &&
        p[4 * 8 + col] === 0 &&
        p[5 * 8 + col] === 0 &&
        p[6 * 8 + col] === 0 &&
        p[7 * 8 + col] === 0
      ) {
        const t = BitOperators.shiftR(SQRT_2 * dataIn[i] + 8192, 14);
        p[0 * 8 + col] = t;
        p[1 * 8 + col] = t;
        p[2 * 8 + col] = t;
        p[3 * 8 + col] = t;
        p[4 * 8 + col] = t;
        p[5 * 8 + col] = t;
        p[6 * 8 + col] = t;
        p[7 * 8 + col] = t;
        continue;
      }

      // Stage 4
      let v0 = BitOperators.shiftR(SQRT_2 * p[0 * 8 + col] + 2048, 12);
      let v1 = BitOperators.shiftR(SQRT_2 * p[4 * 8 + col] + 2048, 12);
      let v2 = p[2 * 8 + col];
      let v3 = p[6 * 8 + col];
      let v4 = BitOperators.shiftR(
        SQRT_1D2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048,
        12
      );
      let v7 = BitOperators.shiftR(
        SQRT_1D2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048,
        12
      );
      let v5 = p[3 * 8 + col];
      let v6 = p[5 * 8 + col];

      // Stage 3
      let t = BitOperators.shiftR(v0 - v1 + 1, 1);
      v0 = BitOperators.shiftR(v0 + v1 + 1, 1);
      v1 = t;
      t = BitOperators.shiftR(v2 * SIN_6 + v3 * COS_6 + 2048, 12);
      v2 = BitOperators.shiftR(v2 * COS_6 - v3 * SIN_6 + 2048, 12);
      v3 = t;
      t = BitOperators.shiftR(v4 - v6 + 1, 1);
      v4 = BitOperators.shiftR(v4 + v6 + 1, 1);
      v6 = t;
      t = BitOperators.shiftR(v7 + v5 + 1, 1);
      v5 = BitOperators.shiftR(v7 - v5 + 1, 1);
      v7 = t;

      // Stage 2
      t = BitOperators.shiftR(v0 - v3 + 1, 1);
      v0 = BitOperators.shiftR(v0 + v3 + 1, 1);
      v3 = t;
      t = BitOperators.shiftR(v1 - v2 + 1, 1);
      v1 = BitOperators.shiftR(v1 + v2 + 1, 1);
      v2 = t;
      t = BitOperators.shiftR(v4 * SIN_3 + v7 * COS_3 + 2048, 12);
      v4 = BitOperators.shiftR(v4 * COS_3 - v7 * SIN_3 + 2048, 12);
      v7 = t;
      t = BitOperators.shiftR(v5 * SIN_1 + v6 * COS_1 + 2048, 12);
      v5 = BitOperators.shiftR(v5 * COS_1 - v6 * SIN_1 + 2048, 12);
      v6 = t;

      // Stage 1
      p[0 * 8 + col] = v0 + v7;
      p[7 * 8 + col] = v0 - v7;
      p[1 * 8 + col] = v1 + v6;
      p[6 * 8 + col] = v1 - v6;
      p[2 * 8 + col] = v2 + v5;
      p[5 * 8 + col] = v2 - v5;
      p[3 * 8 + col] = v3 + v4;
      p[4 * 8 + col] = v3 - v4;
    }

    // Convert to 8-bit integers
    for (let i = 0; i < 64; ++i) {
      dataOut[i] =
        JpegQuantize.dctClip[
          dctClipOffset + 128 + BitOperators.shiftR(p[i] + 8, 4)
        ];
    }
  }

  public static getImageFromJpeg(jpeg: JpegData): MemoryImage {
    const orientation = jpeg.exifData.orientation ?? 0;
    const flipWidthHeight = orientation >= 5 && orientation <= 8;
    const width = flipWidthHeight ? jpeg.height : jpeg.width;
    const height = flipWidthHeight ? jpeg.width : jpeg.height;

    const image = new MemoryImage({
      width: width,
      height: height,
      rgbChannelSet: RgbChannelSet.rgb,
    });

    // Copy exif data, except for ORIENTATION which we're baking.
    for (const [key, value] of jpeg.exifData.data) {
      if (key !== ExifData.ORIENTATION) {
        image.exifData.data.set(key, value);
      }
    }

    let component1: ComponentData | undefined = undefined;
    let component2: ComponentData | undefined = undefined;
    let component3: ComponentData | undefined = undefined;
    let component4: ComponentData | undefined = undefined;
    let component1Line: Uint8Array | undefined = undefined;
    let component2Line: Uint8Array | undefined = undefined;
    let component3Line: Uint8Array | undefined = undefined;
    let component4Line: Uint8Array | undefined = undefined;
    let offset = 0;
    let Y = 0;
    let Cb = 0;
    let Cr = 0;
    let K = 0;
    let C = 0;
    let M = 0;
    let Ye = 0;
    let R = 0;
    let G = 0;
    let B = 0;
    let colorTransform = false;

    const h1 = jpeg.height - 1;
    const w1 = jpeg.width - 1;

    switch (jpeg.components.length) {
      case 1: {
        const component1 = jpeg.components[0];
        const lines = component1.lines;
        const hShift1 = component1.hScaleShift;
        const vShift1 = component1.vScaleShift;
        for (let y = 0; y < jpeg.height; y++) {
          const y1 = y >> vShift1;
          const component1Line = lines[y1];
          for (let x = 0; x < jpeg.width; x++) {
            const x1 = x >> hShift1;
            const Y = component1Line[x1];
            const c = ColorUtils.getColor(Y, Y, Y);
            if (orientation === 2) {
              image.setPixel(w1 - x, y, c);
            } else if (orientation === 3) {
              image.setPixel(w1 - x, h1 - y, c);
            } else if (orientation === 4) {
              image.setPixel(x, h1 - y, c);
            } else if (orientation === 5) {
              image.setPixel(y, x, c);
            } else if (orientation === 6) {
              image.setPixel(h1 - y, x, c);
            } else if (orientation === 7) {
              image.setPixel(h1 - y, w1 - x, c);
            } else if (orientation === 8) {
              image.setPixel(y, w1 - x, c);
            } else {
              image.setPixelByIndex(offset++, c);
            }
          }
        }
        break;
      }
      // case 2:
      //     {
      //         // PDF might compress two component data in custom color-space
      //         component1 = jpeg.components[0];
      //         component2 = jpeg.components[1];
      //         let hShift1: number = component1.hScaleShift;
      //         let vShift1: number = component1.vScaleShift;
      //         let hShift2: number = component2.hScaleShift;
      //         let vShift2: number = component2.vScaleShift;

      //         for (let y = 0; y < height; y++) {
      //             let y1 = y >> vShift1;
      //             let y2 = y >> vShift2;
      //             component1Line = component1.lines[y1];
      //             component2Line = component2.lines[y2];

      //             for (let x = 0; x < width; x++) {
      //                 let x1 = x >> hShift1;
      //                 let x2 = x >> hShift2;

      //                 Y = component1Line![x1];
      //                 // data[offset++] = Y;

      //                 Y = component2Line![x2];
      //                 // data[offset++] = Y;
      //             }
      //         }
      //         break;
      //     }
      case 3: {
        // The default transform for three components is true
        colorTransform = true;

        component1 = jpeg.components[0];
        component2 = jpeg.components[1];
        component3 = jpeg.components[2];

        const lines1 = component1.lines;
        const lines2 = component2.lines;
        const lines3 = component3.lines;

        const hShift1 = component1.hScaleShift;
        const vShift1 = component1.vScaleShift;
        const hShift2 = component2.hScaleShift;
        const vShift2 = component2.vScaleShift;
        const hShift3 = component3.hScaleShift;
        const vShift3 = component3.vScaleShift;

        for (let y = 0; y < jpeg.height; y++) {
          const y1 = y >> vShift1;
          const y2 = y >> vShift2;
          const y3 = y >> vShift3;

          component1Line = lines1[y1];
          component2Line = lines2[y2];
          component3Line = lines3[y3];

          for (let x = 0; x < jpeg.width; x++) {
            const x1 = x >> hShift1;
            const x2 = x >> hShift2;
            const x3 = x >> hShift3;

            Y = component1Line[x1] << 8;
            Cb = component2Line[x2] - 128;
            Cr = component3Line[x3] - 128;

            R = Y + 359 * Cr + 128;
            G = Y - 88 * Cb - 183 * Cr + 128;
            B = Y + 454 * Cb + 128;

            R = this.clamp8(BitOperators.shiftR(R, 8));
            G = this.clamp8(BitOperators.shiftR(G, 8));
            B = this.clamp8(BitOperators.shiftR(B, 8));
            const c = ColorUtils.getColor(R, G, B);
            if (orientation === 2) {
              image.setPixel(w1 - x, y, c);
            } else if (orientation === 3) {
              image.setPixel(w1 - x, h1 - y, c);
            } else if (orientation === 4) {
              image.setPixel(x, h1 - y, c);
            } else if (orientation === 5) {
              image.setPixel(y, x, c);
            } else if (orientation === 6) {
              image.setPixel(h1 - y, x, c);
            } else if (orientation === 7) {
              image.setPixel(h1 - y, w1 - x, c);
            } else if (orientation === 8) {
              image.setPixel(y, w1 - x, c);
            } else {
              image.setPixelByIndex(offset++, c);
            }
          }
        }
        break;
      }
      case 4: {
        if (jpeg.adobe === undefined) {
          throw new ImageError('Unsupported color mode (4 components)');
        }
        // The default transform for four components is false
        colorTransform = false;
        // The adobe transform marker overrides any previous setting
        if (jpeg.adobe.transformCode !== 0) {
          colorTransform = true;
        }

        component1 = jpeg.components[0];
        component2 = jpeg.components[1];
        component3 = jpeg.components[2];
        component4 = jpeg.components[3];

        const lines1 = component1.lines;
        const lines2 = component2.lines;
        const lines3 = component3.lines;
        const lines4 = component4.lines;

        const hShift1 = component1.hScaleShift;
        const vShift1 = component1.vScaleShift;
        const hShift2 = component2.hScaleShift;
        const vShift2 = component2.vScaleShift;
        const hShift3 = component3.hScaleShift;
        const vShift3 = component3.vScaleShift;
        const hShift4 = component4.hScaleShift;
        const vShift4 = component4.vScaleShift;

        for (let y = 0; y < jpeg.height; y++) {
          const y1 = y >> vShift1;
          const y2 = y >> vShift2;
          const y3 = y >> vShift3;
          const y4 = y >> vShift4;
          component1Line = lines1[y1];
          component2Line = lines2[y2];
          component3Line = lines3[y3];
          component4Line = lines4[y4];
          for (let x = 0; x < jpeg.width; x++) {
            const x1 = x >> hShift1;
            const x2 = x >> hShift2;
            const x3 = x >> hShift3;
            const x4 = x >> hShift4;
            if (!colorTransform) {
              C = component1Line[x1];
              M = component2Line[x2];
              Ye = component3Line[x3];
              K = component4Line[x4];
            } else {
              Y = component1Line[x1];
              Cb = component2Line[x2];
              Cr = component3Line[x3];
              K = component4Line[x4];

              C = 255 - this.clamp8(Math.trunc(Y + 1.402 * (Cr - 128)));
              M =
                255 -
                this.clamp8(
                  Math.trunc(
                    Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128)
                  )
                );
              Ye = 255 - this.clamp8(Math.trunc(Y + 1.772 * (Cb - 128)));
            }
            R = BitOperators.shiftR(C * K, 8);
            G = BitOperators.shiftR(M * K, 8);
            B = BitOperators.shiftR(Ye * K, 8);
            const c = ColorUtils.getColor(R, G, B);
            if (orientation === 2) {
              image.setPixel(w1 - x, y, c);
            } else if (orientation === 3) {
              image.setPixel(w1 - x, h1 - y, c);
            } else if (orientation === 4) {
              image.setPixel(x, h1 - y, c);
            } else if (orientation === 5) {
              image.setPixel(y, x, c);
            } else if (orientation === 6) {
              image.setPixel(h1 - y, x, c);
            } else if (orientation === 7) {
              image.setPixel(h1 - y, w1 - x, c);
            } else if (orientation === 8) {
              image.setPixel(y, w1 - x, c);
            } else {
              image.setPixelByIndex(offset++, c);
            }
          }
        }
        break;
      }
      default:
        throw new ImageError('Unsupported color mode');
    }
    return image;
  }
}
