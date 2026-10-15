/** @format */

import { LibError } from '../../error/lib-error.js';
import { ExifData } from '../../exif/exif-data.js';
import { MemoryImage } from '../../image/image.js';
import type { JpegData } from './jpeg-data.js';

/**
 * The bias added to a fixed point (x.8) color value before shifting it, so
 * that the shift is non-negative.
 */
const clipBias = 256 << 8;

/**
 * The fixed point (x.8) color clip table. A value v is clamped to [0, 255] as
 * `clip[(v + clipBias) >> 8]`.
 */
const clip = new Uint8Array(768);
for (let i = 0; i < 256; ++i) {
  clip[256 + i] = i;
}
clip.fill(255, 512, 768);

/**
 * Converts the decoded component lines of a JPEG to an RGB {@link MemoryImage},
 * baking in the EXIF orientation. The rows can be converted in bands, as
 * they're decoded.
 */
export class JpegImageWriter {
  /**
   * The JPEG data being converted.
   */
  private readonly _jpeg: JpegData;

  /**
   * The width of the decoded image.
   */
  private readonly _w: number;

  /**
   * The height of the decoded image.
   */
  private readonly _h: number;

  /**
   * The decoded image.
   */
  private readonly _image: MemoryImage;

  /**
   * The bytes of {@link image}.
   */
  private readonly _data: Uint8Array;

  /**
   * The byte offset of source pixel (0, 0) in the oriented image.
   */
  private readonly _start: number;

  /**
   * The byte step in x of the source pixels in the oriented image.
   */
  private readonly _xStep: number;

  /**
   * The byte step in y of the source pixels in the oriented image.
   */
  private readonly _yStep: number;

  /**
   * Gets the decoded image.
   */
  public get image(): MemoryImage {
    return this._image;
  }

  /**
   * Creates a writer for the decoded component lines of a JPEG.
   * @param {JpegData} jpeg - The JPEG data to convert.
   */
  constructor(jpeg: JpegData) {
    this._jpeg = jpeg;
    this._w = jpeg.scaledWidth;
    this._h = jpeg.scaledHeight;

    const orientation = jpeg.exifData.imageIfd.hasOrientation
      ? jpeg.exifData.imageIfd.orientation!
      : 0;

    const flipWidthHeight = orientation >= 5 && orientation <= 8;
    const width = flipWidthHeight ? this._h : this._w;
    const height = flipWidthHeight ? this._w : this._h;

    const image = new MemoryImage({
      width: width,
      height: height,
    });

    image.exifData = ExifData.from(jpeg.exifData);
    image.exifData.imageIfd.orientation = undefined;
    image.iccProfile = jpeg.iccProfile;
    this._image = image;

    this._data = image.data!.toUint8Array();
    const stride = image.data!.rowStride;
    const w1 = this._w - 1;
    const h1 = this._h - 1;

    switch (orientation) {
      case 2:
        this._start = w1 * 3;
        this._xStep = -3;
        this._yStep = stride;
        break;
      case 3:
        this._start = h1 * stride + w1 * 3;
        this._xStep = -3;
        this._yStep = -stride;
        break;
      case 4:
        this._start = h1 * stride;
        this._xStep = 3;
        this._yStep = -stride;
        break;
      case 5:
        this._start = 0;
        this._xStep = stride;
        this._yStep = 3;
        break;
      case 6:
        this._start = h1 * 3;
        this._xStep = stride;
        this._yStep = -3;
        break;
      case 7:
        this._start = w1 * stride + h1 * 3;
        this._xStep = -stride;
        this._yStep = -3;
        break;
      case 8:
        this._start = w1 * stride;
        this._xStep = -stride;
        this._yStep = 3;
        break;
      default:
        this._start = 0;
        this._xStep = 3;
        this._yStep = stride;
        break;
    }
  }

  /**
   * Converts the source rows [y0, y1).
   * @param {number} y0 - The first source row to convert.
   * @param {number} y1 - The source row to stop before.
   */
  public writeRows(y0: number, y1: number): void {
    const components = this._jpeg.components;
    switch (components.length) {
      case 1:
        {
          const c1 = components[0];
          const hShift1 = c1.hScaleShift;
          const vShift1 = c1.vScaleShift;
          let rowStart = this._start + y0 * this._yStep;
          for (let y = y0; y < y1; y++, rowStart += this._yStep) {
            const line1 = c1.lines[y >> vShift1]!;
            let di = rowStart;
            for (let x = 0; x < this._w; x++, di += this._xStep) {
              const cy = line1[x >> hShift1];
              this._data[di] = cy;
              this._data[di + 1] = cy;
              this._data[di + 2] = cy;
            }
          }
        }
        break;
      case 3:
        {
          const colorTransform =
            this._jpeg.adobe === undefined ||
            this._jpeg.adobe.transformCode === 1;
          const c1 = components[0];
          const c2 = components[1];
          const c3 = components[2];
          const hShift1 = c1.hScaleShift;
          const vShift1 = c1.vScaleShift;
          const hShift2 = c2.hScaleShift;
          const vShift2 = c2.vScaleShift;
          const hShift3 = c3.hScaleShift;
          const vShift3 = c3.vScaleShift;
          let rowStart = this._start + y0 * this._yStep;
          for (let y = y0; y < y1; y++, rowStart += this._yStep) {
            const line1 = c1.lines[y >> vShift1]!;
            const line2 = c2.lines[y >> vShift2]!;
            const line3 = c3.lines[y >> vShift3]!;
            let di = rowStart;
            if (colorTransform) {
              for (let x = 0; x < this._w; x++, di += this._xStep) {
                const cy = (line1[x >> hShift1] << 8) + clipBias;
                const cb = line2[x >> hShift2] - 128;
                const cr = line3[x >> hShift3] - 128;
                this._data[di] = clip[(cy + 359 * cr) >> 8];
                this._data[di + 1] = clip[(cy - 88 * cb - 183 * cr) >> 8];
                this._data[di + 2] = clip[(cy + 454 * cb) >> 8];
              }
            } else {
              for (let x = 0; x < this._w; x++, di += this._xStep) {
                this._data[di] = line1[x >> hShift1];
                this._data[di + 1] = line2[x >> hShift2];
                this._data[di + 2] = line3[x >> hShift3];
              }
            }
          }
        }
        break;
      case 4:
        {
          if (this._jpeg.adobe === undefined) {
            throw new LibError('Unsupported color mode (4 components)');
          }
          const colorTransform = this._jpeg.adobe.transformCode !== 0;
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
          let rowStart = this._start + y0 * this._yStep;
          for (let y = y0; y < y1; y++, rowStart += this._yStep) {
            const line1 = c1.lines[y >> vShift1]!;
            const line2 = c2.lines[y >> vShift2]!;
            const line3 = c3.lines[y >> vShift3]!;
            const line4 = c4.lines[y >> vShift4]!;
            let di = rowStart;
            for (let x = 0; x < this._w; x++, di += this._xStep) {
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
              this._data[di] = (cc * ck) >> 8;
              this._data[di + 1] = (cm * ck) >> 8;
              this._data[di + 2] = (cy * ck) >> 8;
            }
          }
        }
        break;
      default:
        throw new LibError('Unsupported color mode');
    }
  }
}
