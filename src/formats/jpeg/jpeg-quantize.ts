/** @format */

import { BitUtils } from '../../common/bit-utils.js';
import { LibError } from '../../error/lib-error.js';
import { ExifData } from '../../exif/exif-data.js';
import { MemoryImage } from '../../image/image.js';
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
   * @param {Int16Array} coefficients - The flat list of DCT coefficients.
   * @param {number} offset - The offset of the block's coefficients.
   * @param {Uint8Array} dataOut - The output data array.
   * @param {Int32Array} dataIn - The input data array.
   */
  public static quantizeAndInverse(
    quantizationTable: Int16Array,
    coefficients: Int16Array,
    offset: number,
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
      p[i] = coefficients[offset + i] * quantizationTable[i];
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
    image.iccProfile = jpeg.iccProfile;

    const data = image.data!.toUint8Array();
    const stride = image.data!.rowStride;
    const w1 = w - 1;
    const h1 = h - 1;

    let start = 0;
    let xStep = 3;
    let yStep = stride;
    switch (orientation) {
      case 2:
        start = w1 * 3;
        xStep = -3;
        yStep = stride;
        break;
      case 3:
        start = h1 * stride + w1 * 3;
        xStep = -3;
        yStep = -stride;
        break;
      case 4:
        start = h1 * stride;
        xStep = 3;
        yStep = -stride;
        break;
      case 5:
        start = 0;
        xStep = stride;
        yStep = 3;
        break;
      case 6:
        start = h1 * 3;
        xStep = stride;
        yStep = -3;
        break;
      case 7:
        start = w1 * stride + h1 * 3;
        xStep = -stride;
        yStep = -3;
        break;
      case 8:
        start = w1 * stride;
        xStep = -stride;
        yStep = 3;
        break;
      default:
        start = 0;
        xStep = 3;
        yStep = stride;
        break;
    }

    const clip = JpegQuantize._dctClip;
    const clipBias = 256 << 8;

    const components = jpeg.components;
    switch (components.length) {
      case 1:
        {
          const c1 = components[0];
          const hShift1 = c1.hScaleShift;
          const vShift1 = c1.vScaleShift;
          let rowStart = start;
          for (let y = 0; y < h; y++, rowStart += yStep) {
            const line1 = c1.lines[y >> vShift1]!;
            let di = rowStart;
            for (let x = 0; x < w; x++, di += xStep) {
              const cy = line1[x >> hShift1];
              data[di] = cy;
              data[di + 1] = cy;
              data[di + 2] = cy;
            }
          }
        }
        break;
      case 3:
        {
          const colorTransform =
            jpeg.adobe === undefined || jpeg.adobe.transformCode === 1;
          const c1 = components[0];
          const c2 = components[1];
          const c3 = components[2];
          const hShift1 = c1.hScaleShift;
          const vShift1 = c1.vScaleShift;
          const hShift2 = c2.hScaleShift;
          const vShift2 = c2.vScaleShift;
          const hShift3 = c3.hScaleShift;
          const vShift3 = c3.vScaleShift;
          let rowStart = start;
          for (let y = 0; y < h; y++, rowStart += yStep) {
            const line1 = c1.lines[y >> vShift1]!;
            const line2 = c2.lines[y >> vShift2]!;
            const line3 = c3.lines[y >> vShift3]!;
            let di = rowStart;
            if (colorTransform) {
              for (let x = 0; x < w; x++, di += xStep) {
                const cy = (line1[x >> hShift1] << 8) + clipBias;
                const cb = line2[x >> hShift2] - 128;
                const cr = line3[x >> hShift3] - 128;
                data[di] = clip[(cy + 359 * cr) >> 8];
                data[di + 1] = clip[(cy - 88 * cb - 183 * cr) >> 8];
                data[di + 2] = clip[(cy + 454 * cb) >> 8];
              }
            } else {
              for (let x = 0; x < w; x++, di += xStep) {
                data[di] = line1[x >> hShift1];
                data[di + 1] = line2[x >> hShift2];
                data[di + 2] = line3[x >> hShift3];
              }
            }
          }
        }
        break;
      case 4:
        {
          if (jpeg.adobe === undefined) {
            throw new LibError('Unsupported color mode (4 components)');
          }
          const colorTransform = jpeg.adobe.transformCode !== 0;
          const c1 = components[0];
          const c2 = components[1];
          const c3 = components[2];
          const c4 = components[3];
          const hShift1 = c1.hScaleShift;
          const vShift1 = c1.vScaleShift;
          const hShift2 = c2.hScaleShift;
          const vShift2 = c2.vScaleShift;
          const hShift3 = c3.hScaleShift;
          const vShift3 = c3.vScaleShift;
          const hShift4 = c4.hScaleShift;
          const vShift4 = c4.vScaleShift;
          let rowStart = start;
          for (let y = 0; y < h; y++, rowStart += yStep) {
            const line1 = c1.lines[y >> vShift1]!;
            const line2 = c2.lines[y >> vShift2]!;
            const line3 = c3.lines[y >> vShift3]!;
            const line4 = c4.lines[y >> vShift4]!;
            let di = rowStart;
            for (let x = 0; x < w; x++, di += xStep) {
              let cc = 0;
              let cm = 0;
              let cy = 0;
              const ck = line4[x >> hShift4];
              if (!colorTransform) {
                cc = line1[x >> hShift1];
                cm = line2[x >> hShift2];
                cy = line3[x >> hShift3];
              } else {
                const cyScaled = (line1[x >> hShift1] << 8) + clipBias;
                const cb = line2[x >> hShift2] - 128;
                const cr = line3[x >> hShift3] - 128;
                cc = 255 - clip[(cyScaled + 359 * cr) >> 8];
                cm = 255 - clip[(cyScaled - 88 * cb - 183 * cr) >> 8];
                cy = 255 - clip[(cyScaled + 454 * cb) >> 8];
              }
              data[di] = (cc * ck) >> 8;
              data[di + 1] = (cm * ck) >> 8;
              data[di + 2] = (cy * ck) >> 8;
            }
          }
        }
        break;
      default:
        throw new LibError('Unsupported color mode');
    }

    return image;
  }
}
