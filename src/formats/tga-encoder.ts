/** @format */

import { Format } from '../color/format.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { MemoryImage } from '../image/image.js';
import { Pixel } from '../image/pixel.js';
import { checkEncode } from './check-encode.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';

/**
 * Encode a TGA image. This only supports the 24-bit and 32-bit uncompressed
 * formats.
 */
export class TgaEncoder implements Encoder {
  /**
   * Indicates whether the encoder supports animation.
   * @private
   */
  private _supportsAnimation = false;

  /**
   * Gets the value indicating whether the encoder supports animation.
   * @returns {boolean} True if the encoder supports animation, otherwise false.
   */
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  /**
   * Encodes the given image into a TGA format.
   * @param {EncoderEncodeOptions} opt - The options for encoding.
   * @param {MemoryImage} opt.image - The image to encode.
   * @returns {Uint8Array} The encoded image in TGA format.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    checkEncode(opt.image);
    let image = opt.image;

    if (image.format !== Format.uint8) {
      image = image.convert({ format: Format.uint8 });
    }
    const nc = image.palette?.numChannels ?? image.numChannels;
    // Grayscale+alpha is written as RGBA, and grayscale as RGB.
    const hasAlpha = nc === 4 || nc === 2;
    const bytesPerPixel = hasAlpha ? 4 : 3;
    const width = image.width;
    const height = image.height;

    const out = new OutputBuffer({
      size: 18 + width * height * bytesPerPixel,
      bigEndian: true,
    });

    const header = new Uint8Array(18);
    header.fill(0);

    header[2] = 2;
    header[12] = width & 0xff;
    header[13] = (width >>> 8) & 0xff;
    header[14] = height & 0xff;
    header[15] = (height >>> 8) & 0xff;
    header[16] = hasAlpha ? 32 : 24;

    out.writeBytes(header);

    // Rows are stored bottom to top, as BGR(A).
    const row = new Uint8Array(width * bytesPerPixel);
    if (!image.hasPalette) {
      const data = image.toUint8Array();
      const stride = image.data!.rowStride;
      for (let y = height - 1; y >= 0; --y) {
        TgaEncoder.swizzleRow(data, y * stride, nc, row, bytesPerPixel);
        out.writeBytes(row);
      }
    } else {
      let p: Pixel | undefined = undefined;
      for (let y = height - 1; y >= 0; --y) {
        p = image.getPixel(0, y, p);
        for (let x = 0, i = 0; x < width; ++x, p.next()) {
          row[i++] = Math.trunc(p.b);
          row[i++] = Math.trunc(p.g);
          row[i++] = Math.trunc(p.r);
          if (hasAlpha) {
            row[i++] = Math.trunc(p.a);
          }
        }
        out.writeBytes(row);
      }
    }

    return out.getBytes();
  }

  /**
   * Converts a row of nc channel pixels at offset o of src to BGR(A) in row.
   * @param {Uint8Array} src - The source row of pixels.
   * @param {number} o - The offset into the source.
   * @param {number} nc - The number of channels.
   * @param {Uint8Array} row - The destination row.
   * @param {number} bytesPerPixel - The number of bytes per pixel.
   */
  private static swizzleRow(
    src: Uint8Array,
    o: number,
    nc: number,
    row: Uint8Array,
    bytesPerPixel: number
  ): void {
    const n = row.length;
    for (let i = 0, s = o; i < n; i += bytesPerPixel, s += nc) {
      if (nc >= 3) {
        row[i] = src[s + 2];
        row[i + 1] = src[s + 1];
        row[i + 2] = src[s];
        if (bytesPerPixel === 4) {
          row[i + 3] = src[s + 3];
        }
      } else {
        const l = src[s];
        row[i] = l;
        row[i + 1] = l;
        row[i + 2] = l;
        if (bytesPerPixel === 4) {
          row[i + 3] = src[s + 1];
        }
      }
    }
  }
}
