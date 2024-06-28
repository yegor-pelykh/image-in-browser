/** @format */

import { OutputBuffer } from '../common/output-buffer.js';
import { MemoryImage } from '../image/image.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';

/**
 * Encode a TGA image. This only supports the 24-bit uncompressed format.
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
    const image = opt.image;

    const out = new OutputBuffer({
      bigEndian: true,
    });

    const header = new Uint8Array(18);
    header.fill(0);

    header[2] = 2;
    header[12] = image.width & 0xff;
    header[13] = (image.width >>> 8) & 0xff;
    header[14] = image.height & 0xff;
    header[15] = (image.height >>> 8) & 0xff;
    const nc = image.palette?.numChannels ?? image.numChannels;
    header[16] = nc === 3 ? 24 : 32;

    out.writeBytes(header);

    if (nc === 4) {
      for (let y = image.height - 1; y >= 0; --y) {
        for (let x = 0; x < image.width; ++x) {
          const c = image.getPixel(x, y);
          out.writeByte(Math.trunc(c.b));
          out.writeByte(Math.trunc(c.g));
          out.writeByte(Math.trunc(c.r));
          out.writeByte(Math.trunc(c.a));
        }
      }
    } else {
      for (let y = image.height - 1; y >= 0; --y) {
        for (let x = 0; x < image.width; ++x) {
          const c = image.getPixel(x, y);
          out.writeByte(Math.trunc(c.b));
          out.writeByte(Math.trunc(c.g));
          out.writeByte(Math.trunc(c.r));
        }
      }
    }

    return out.getBytes();
  }
}
