/** @format */

import { BitUtils } from '../../common/bit-utils.js';
import { MathUtils } from '../../common/math-utils.js';
import { LibError } from '../../error/lib-error.js';
import { ExifData } from '../../exif/exif-data.js';
import { MemoryImage } from '../../image/image.js';
import { JpegComponentData } from './jpeg-component-data.js';
import { JpegData } from './jpeg-data.js';

/**
 * Abstract class for JPEG quantization and inverse DCT operations.
 */
export abstract class JpegQuantize {
  /**
   * Offset for DCT clipping.
   */
  private static readonly _dctClipOffset = 256;

  /**
   * Length for DCT clipping.
   */
  private static readonly _dctClipLength = 768;

  /**
   * DCT clipping array.
   */
  private static readonly _dctClip = JpegQuantize.createDctClip();

  /**
   * Creates the DCT clipping array.
   * @returns {Uint8Array} The DCT clipping array.
   */
  private static createDctClip(): Uint8Array {
    const result = new Uint8Array(JpegQuantize._dctClipLength);
    for (let i = 0; i < 256; ++i) {
      result[JpegQuantize._dctClipOffset + i] = i;
    }
    for (let i = 256; i < 512; ++i) {
      result[JpegQuantize._dctClipOffset + i] = 255;
    }
    return result;
  }

  /**
   * Quantizes the coefficients and applies the Inverse Discrete Cosine Transform (IDCT).
   *
   * A port of poppler's IDCT method which in turn is taken from:
   * Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
   * "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
   * IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989, 988-991.
   *
   * @param {Int16Array} quantizationTable - The quantization table.
   * @param {Int32Array} coefBlock - The coefficient block.
   * @param {Uint8Array} dataOut - The output data array.
   * @param {Int32Array} dataIn - The input data array.
   */
  public static quantizeAndInverse(
    quantizationTable: Int16Array,
    coefBlock: Int32Array,
    dataOut: Uint8Array,
    dataIn: Int32Array
  ): void {
    const p = dataIn;

    // IDCT constants (20.12 fixed point format)
    // cos(pi/16)*4096
    const cos1 = 4017;
    // sin(pi/16)*4096
    const sin1 = 799;
    // cos(3*pi/16)*4096
    const cos3 = 3406;
    // sin(3*pi/16)*4096
    const sin3 = 2276;
    // cos(6*pi/16)*4096
    const cos6 = 1567;
    // sin(6*pi/16)*4096
    const sin6 = 3784;
    // sqrt(2)*4096
    const sqrt2 = 5793;
    // sqrt(2) / 2
    const sqrt102 = 2896;

    // de-quantize
    for (let i = 0; i < 64; i++) {
      p[i] = coefBlock[i] * quantizationTable[i];
    }

    // inverse DCT on rows
    let row = 0;
    for (let i = 0; i < 8; ++i, row += 8) {
      // check for all-zero AC coefficients
      if (
        p[1 + row] === 0 &&
        p[2 + row] === 0 &&
        p[3 + row] === 0 &&
        p[4 + row] === 0 &&
        p[5 + row] === 0 &&
        p[6 + row] === 0 &&
        p[7 + row] === 0
      ) {
        const t = BitUtils.sshR(sqrt2 * p[0 + row] + 512, 10);
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

      // stage 4
      let v0 = BitUtils.sshR(sqrt2 * p[0 + row] + 128, 8);
      let v1 = BitUtils.sshR(sqrt2 * p[4 + row] + 128, 8);
      let v2 = p[2 + row];
      let v3 = p[6 + row];
      let v4 = BitUtils.sshR(sqrt102 * (p[1 + row] - p[7 + row]) + 128, 8);
      let v7 = BitUtils.sshR(sqrt102 * (p[1 + row] + p[7 + row]) + 128, 8);
      let v5 = p[3 + row] << 4;
      let v6 = p[5 + row] << 4;

      // stage 3
      let t = BitUtils.sshR(v0 - v1 + 1, 1);
      v0 = BitUtils.sshR(v0 + v1 + 1, 1);
      v1 = t;
      t = BitUtils.sshR(v2 * sin6 + v3 * cos6 + 128, 8);
      v2 = BitUtils.sshR(v2 * cos6 - v3 * sin6 + 128, 8);
      v3 = t;
      t = BitUtils.sshR(v4 - v6 + 1, 1);
      v4 = BitUtils.sshR(v4 + v6 + 1, 1);
      v6 = t;
      t = BitUtils.sshR(v7 + v5 + 1, 1);
      v5 = BitUtils.sshR(v7 - v5 + 1, 1);
      v7 = t;

      // stage 2
      t = BitUtils.sshR(v0 - v3 + 1, 1);
      v0 = BitUtils.sshR(v0 + v3 + 1, 1);
      v3 = t;
      t = BitUtils.sshR(v1 - v2 + 1, 1);
      v1 = BitUtils.sshR(v1 + v2 + 1, 1);
      v2 = t;
      t = BitUtils.sshR(v4 * sin3 + v7 * cos3 + 2048, 12);
      v4 = BitUtils.sshR(v4 * cos3 - v7 * sin3 + 2048, 12);
      v7 = t;
      t = BitUtils.sshR(v5 * sin1 + v6 * cos1 + 2048, 12);
      v5 = BitUtils.sshR(v5 * cos1 - v6 * sin1 + 2048, 12);
      v6 = t;

      // stage 1
      p[0 + row] = v0 + v7;
      p[7 + row] = v0 - v7;
      p[1 + row] = v1 + v6;
      p[6 + row] = v1 - v6;
      p[2 + row] = v2 + v5;
      p[5 + row] = v2 - v5;
      p[3 + row] = v3 + v4;
      p[4 + row] = v3 - v4;
    }

    // inverse DCT on columns
    for (let i = 0; i < 8; ++i) {
      const col = i;
      const p0 = col;
      const p1 = 8 + col;
      const p2 = 16 + col;
      const p3 = 24 + col;
      const p4 = 32 + col;
      const p5 = 40 + col;
      const p6 = 48 + col;
      const p7 = 56 + col;

      // check for all-zero AC coefficients
      if (
        p[p1] === 0 &&
        p[p2] === 0 &&
        p[p3] === 0 &&
        p[p4] === 0 &&
        p[p5] === 0 &&
        p[p6] === 0 &&
        p[p7] === 0
      ) {
        const t = BitUtils.sshR(sqrt2 * dataIn[i] + 8192, 14);
        p[p0] = t;
        p[p1] = t;
        p[p2] = t;
        p[p3] = t;
        p[p4] = t;
        p[p5] = t;
        p[p6] = t;
        p[p7] = t;
        continue;
      }

      // stage 4
      let v0 = BitUtils.sshR(sqrt2 * p[p0] + 2048, 12);
      let v1 = BitUtils.sshR(sqrt2 * p[p4] + 2048, 12);
      let v2 = p[p2];
      let v3 = p[p6];
      let v4 = BitUtils.sshR(sqrt102 * (p[p1] - p[p7]) + 2048, 12);
      let v7 = BitUtils.sshR(sqrt102 * (p[p1] + p[p7]) + 2048, 12);
      let v5 = p[p3];
      let v6 = p[p5];

      // stage 3
      let t = BitUtils.sshR(v0 - v1 + 1, 1);
      v0 = BitUtils.sshR(v0 + v1 + 1, 1);
      v1 = t;
      t = BitUtils.sshR(v2 * sin6 + v3 * cos6 + 2048, 12);
      v2 = BitUtils.sshR(v2 * cos6 - v3 * sin6 + 2048, 12);
      v3 = t;
      t = BitUtils.sshR(v4 - v6 + 1, 1);
      v4 = BitUtils.sshR(v4 + v6 + 1, 1);
      v6 = t;
      t = BitUtils.sshR(v7 + v5 + 1, 1);
      v5 = BitUtils.sshR(v7 - v5 + 1, 1);
      v7 = t;

      // stage 2
      t = BitUtils.sshR(v0 - v3 + 1, 1);
      v0 = BitUtils.sshR(v0 + v3 + 1, 1);
      v3 = t;
      t = BitUtils.sshR(v1 - v2 + 1, 1);
      v1 = BitUtils.sshR(v1 + v2 + 1, 1);
      v2 = t;
      t = BitUtils.sshR(v4 * sin3 + v7 * cos3 + 2048, 12);
      v4 = BitUtils.sshR(v4 * cos3 - v7 * sin3 + 2048, 12);
      v7 = t;
      t = BitUtils.sshR(v5 * sin1 + v6 * cos1 + 2048, 12);
      v5 = BitUtils.sshR(v5 * cos1 - v6 * sin1 + 2048, 12);
      v6 = t;

      // stage 1
      p[p0] = v0 + v7;
      p[p7] = v0 - v7;
      p[p1] = v1 + v6;
      p[p6] = v1 - v6;
      p[p2] = v2 + v5;
      p[p5] = v2 - v5;
      p[p3] = v3 + v4;
      p[p4] = v3 - v4;
    }

    // convert to 8-bit integers
    for (let i = 0; i < 64; ++i) {
      const index =
        JpegQuantize._dctClipOffset + 128 + BitUtils.sshR(p[i] + 8, 4);
      if (index < 0) {
        break;
      }
      dataOut[i] = JpegQuantize._dctClip[index];
    }
  }

  /**
   * Converts a JPEG data object to a MemoryImage object.
   *
   * @param {JpegData} jpeg - The JPEG data object.
   * @returns {MemoryImage} The resulting MemoryImage object.
   */
  public static getImageFromJpeg(jpeg: JpegData): MemoryImage {
    const orientation = jpeg.exifData.imageIfd.hasOrientation
      ? jpeg.exifData.imageIfd.orientation!
      : 0;

    const w = jpeg.width;
    const h = jpeg.height;
    const flipWidthHeight = orientation >= 5 && orientation <= 8;
    const width = flipWidthHeight ? h : w;
    const height = flipWidthHeight ? w : h;

    const image = new MemoryImage({
      width: width,
      height: height,
    });

    image.exifData = ExifData.from(jpeg.exifData);
    image.exifData.imageIfd.orientation = undefined;

    let component1: JpegComponentData | undefined = undefined;
    let component2: JpegComponentData | undefined = undefined;
    let component3: JpegComponentData | undefined = undefined;
    let component4: JpegComponentData | undefined = undefined;
    let component1Line: Uint8Array | undefined = undefined;
    let component2Line: Uint8Array | undefined = undefined;
    let component3Line: Uint8Array | undefined = undefined;
    let component4Line: Uint8Array | undefined = undefined;
    let colorTransform = false;

    const h1 = h - 1;
    const w1 = w - 1;

    let setPixel:
      | ((x: number, y: number, r: number, g: number, b: number) => void)
      | undefined = undefined;
    switch (orientation) {
      case 2:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(w1 - x, y, r, g, b);
        };
        break;
      case 3:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(w1 - x, h1 - y, r, g, b);
        };
        break;
      case 4:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(x, h1 - y, r, g, b);
        };
        break;
      case 5:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(y, x, r, g, b);
        };
        break;
      case 6:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(h1 - y, x, r, g, b);
        };
        break;
      case 7:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(h1 - y, w1 - x, r, g, b);
        };
        break;
      case 8:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(y, w1 - x, r, g, b);
        };
        break;
      default:
        setPixel = (x, y, r, g, b) => {
          image.setPixelRgb(x, y, r, g, b);
        };
        break;
    }

    switch (jpeg.components.length) {
      case 1:
        {
          component1 = jpeg.components[0];
          const lines = component1.lines;
          const hShift1 = component1.hScaleShift;
          const vShift1 = component1.vScaleShift;
          for (let y = 0; y < h; y++) {
            const y1 = y >>> vShift1;
            component1Line = lines[y1];
            for (let x = 0; x < w; x++) {
              const x1 = x >>> hShift1;
              const cy = component1Line![x1];
              setPixel(x, y, cy, cy, cy);
            }
          }
        }
        break;
      case 2:
        break;
      case 3:
        {
          // The default transform for three components is true
          colorTransform = true;
          if (jpeg.adobe !== undefined) {
            colorTransform = jpeg.adobe.transformCode === 1;
          }

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

          for (let y = 0; y < h; y++) {
            const y1 = y >>> vShift1;
            const y2 = y >>> vShift2;
            const y3 = y >>> vShift3;

            component1Line = lines1[y1]!;
            component2Line = lines2[y2]!;
            component3Line = lines3[y3]!;

            for (let x = 0; x < w; x++) {
              const x1 = x >>> hShift1;
              const x2 = x >>> hShift2;
              const x3 = x >>> hShift3;

              let r = component1Line[x1];
              let g = component2Line[x2];
              let b = component3Line[x3];

              if (colorTransform) {
                const cy = r << 8;
                const cb = g - 128;
                const cr = b - 128;
                r = MathUtils.clamp((cy + 359 * cr) >> 8, 0, 255);
                g = MathUtils.clamp((cy - 88 * cb - 183 * cr) >> 8, 0, 255);
                b = MathUtils.clamp((cy + 454 * cb) >> 8, 0, 255);
              }

              setPixel(x, y, r, g, b);
            }
          }
        }
        break;
      case 4:
        {
          if (jpeg.adobe === undefined) {
            throw new LibError('Unsupported color mode (4 components)');
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

          for (let y = 0; y < h; y++) {
            const y1 = y >>> vShift1;
            const y2 = y >>> vShift2;
            const y3 = y >>> vShift3;
            const y4 = y >>> vShift4;
            component1Line = lines1[y1];
            component2Line = lines2[y2];
            component3Line = lines3[y3];
            component4Line = lines4[y4];
            for (let x = 0; x < w; x++) {
              const x1 = x >>> hShift1;
              const x2 = x >>> hShift2;
              const x3 = x >>> hShift3;
              const x4 = x >>> hShift4;
              let cc = 0;
              let cm = 0;
              let cy = 0;
              let ck = 0;
              if (!colorTransform) {
                cc = component1Line![x1];
                cm = component2Line![x2];
                cy = component3Line![x3];
                ck = component4Line![x4];
              } else {
                cy = component1Line![x1];
                const cb = component2Line![x2];
                const cr = component3Line![x3];
                ck = component4Line![x4];

                const crShifted = cr - 128;
                const cbShifted = cb - 128;
                const cyScaled = cy << 8;
                cc =
                  255 -
                  MathUtils.clampInt255((cyScaled + 359 * crShifted) >> 8);
                cm =
                  255 -
                  MathUtils.clampInt255(
                    (cyScaled - 88 * cbShifted - 183 * crShifted) >> 8
                  );
                cy =
                  255 -
                  MathUtils.clampInt255((cyScaled + 454 * cbShifted) >> 8);
              }
              const r = BitUtils.sshR(cc * ck, 8);
              const g = BitUtils.sshR(cm * ck, 8);
              const b = BitUtils.sshR(cy * ck, 8);

              setPixel(x, y, r, g, b);
            }
          }
        }
        break;
      default:
        throw new LibError('Unsupported color mode');
    }

    if (jpeg.iccProfile !== undefined) {
      image.iccProfile = jpeg.iccProfile;
    }

    return image;
  }
}
