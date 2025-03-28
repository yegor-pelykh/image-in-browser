/** @format */

import { Format } from '../color/format.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { PaletteUint8 } from '../image/palette-uint8.js';
import { Pixel } from '../image/pixel.js';
import { BmpCompressionMode } from './bmp/bmp-compression-mode.js';
import { BmpFileHeader } from './bmp/bmp-file-header.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';

/**
 * Class representing a BMP encoder.
 * Implements the Encoder interface.
 */
export class BmpEncoder implements Encoder {
  /**
   * Indicates whether the encoder supports animation.
   * @private
   */
  private _supportsAnimation = false;

  /**
   * Gets the value indicating whether the encoder supports animation.
   * @returns {boolean} True if the encoder supports animation; otherwise, false.
   */
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  /**
   * Encodes an image into BMP format.
   * @param {EncoderEncodeOptions} opt - The options for encoding.
   * @param {MemoryImage} opt.image - The image to encode.
   * @returns {Uint8Array} The encoded BMP image.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    let image = opt.image;

    const out = new OutputBuffer();

    const nc = image.numChannels;
    let palette = image.palette;
    const format = image.format;

    if (format === Format.uint1 && nc === 1 && palette === undefined) {
      // add palette
      palette = new PaletteUint8(2, 3);
      palette.setRgb(0, 0, 0, 0);
      palette.setRgb(1, 255, 255, 255);
    } else if (format === Format.uint1 && nc === 2) {
      // => uint2 palette
      image = image.convert({
        format: Format.uint2,
        numChannels: 1,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint1 && nc === 3 && palette === undefined) {
      // => uint4 palette
      image = image.convert({
        format: Format.uint4,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint1 && nc === 4) {
      // => uint8,4 - only 32bpp supports alpha
      image = image.convert({
        format: Format.uint8,
        numChannels: 4,
      });
    } else if (format === Format.uint2 && nc === 1 && palette === undefined) {
      // => uint2 palette
      image = image.convert({
        format: Format.uint2,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint2 && nc === 2) {
      // => uint8 palette
      image = image.convert({
        format: Format.uint8,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint2 && nc === 3 && palette === undefined) {
      // => uint8 palette
      image = image.convert({
        format: Format.uint8,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint2 && nc === 4) {
      // => uint8 palette
      image = image.convert({
        format: Format.uint8,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint4 && nc === 1 && palette === undefined) {
      // => uint8 palette
      image = image.convert({
        format: Format.uint8,
        withPalette: true,
      });
      palette = image.palette;
    } else if (format === Format.uint4 && nc === 2) {
      // => uint8,3
      image = image.convert({
        format: Format.uint8,
        numChannels: 3,
      });
    } else if (format === Format.uint4 && nc === 3 && palette === undefined) {
      // => uint8,3
      image = image.convert({
        format: Format.uint8,
        numChannels: 3,
      });
    } else if (format === Format.uint4 && nc === 4) {
      // => uint8,4
      image = image.convert({
        format: Format.uint8,
        numChannels: 4,
      });
    } else if (format === Format.uint8 && nc === 1 && palette === undefined) {
      // => uint8 palette
      image = image.convert({
        format: Format.uint8,
        withPalette: true,
      });
    } else if (format === Format.uint8 && nc === 2) {
      // => uint8,3
      image = image.convert({
        format: Format.uint8,
        numChannels: 3,
      });
    } else if (image.isHdrFormat) {
      // => uint8,[3,4]
      image = image.convert({
        format: Format.uint8,
      });
    } else if (image.hasPalette && image.numChannels === 4) {
      image = image.convert({
        numChannels: 4,
      });
    }

    let bpp = image.bitsPerChannel * image.data!.numChannels;
    if (bpp === 12) {
      bpp = 16;
    }

    const compression =
      bpp > 8 ? BmpCompressionMode.bitfields : BmpCompressionMode.none;

    const imageStride = image.rowStride;
    const fileStride = Math.trunc((image.width * bpp + 31) / 32) * 4;
    const rowPaddingSize = fileStride - imageStride;
    const rowPadding =
      rowPaddingSize > 0
        ? new Uint8Array(rowPaddingSize).fill(0xff)
        : undefined;
    const implicitPaletteSize = bpp >= 1 && bpp <= 8 ? 1 << bpp : 0;
    const imageFileSize = fileStride * image.height;
    const headerInfoSize = bpp > 8 ? 124 : 40;
    const headerSize = headerInfoSize + 14;
    const paletteSize = implicitPaletteSize * 4;
    const origImageOffset = headerSize + paletteSize;
    const imageOffset = origImageOffset;
    const gapSize = imageOffset - origImageOffset;
    const fileSize = imageFileSize + headerSize + paletteSize + gapSize;

    const sRgb = 0x73524742;

    out.writeUint16(BmpFileHeader.signature);
    out.writeUint32(fileSize);
    // reserved
    out.writeUint32(0);
    // offset to image data
    out.writeUint32(imageOffset);
    out.writeUint32(headerInfoSize);
    out.writeUint32(image.width);
    out.writeUint32(image.height);
    // planes
    out.writeUint16(1);
    // bits per pixel
    out.writeUint16(bpp);
    // compression
    out.writeUint32(compression);

    out.writeUint32(imageFileSize);
    // hr
    out.writeUint32(11811);
    // vr
    out.writeUint32(11811);
    // totalColors
    out.writeUint32(bpp === 8 ? 255 : 0);
    // importantColors
    out.writeUint32(bpp === 8 ? 255 : 0);

    if (bpp > 8) {
      const blueMask = bpp === 16 ? 0xf : 0xff;
      const greenMask = bpp === 16 ? 0xf0 : 0xff00;
      const redMask = bpp === 16 ? 0xf00 : 0xff0000;
      const alphaMask = bpp === 16 ? 0xf000 : 0xff000000;

      // redMask
      out.writeUint32(redMask);
      // greenMask
      out.writeUint32(greenMask);
      // blueMask
      out.writeUint32(blueMask);
      // alphaMask
      out.writeUint32(alphaMask);
      // CSType
      out.writeUint32(sRgb);
      // endpoints.red.x
      out.writeUint32(0);
      // endpoints.red.y
      out.writeUint32(0);
      // endpoints.red.z
      out.writeUint32(0);
      // endpoints.green.x
      out.writeUint32(0);
      // endpoints.green.y
      out.writeUint32(0);
      // endpoints.green.z
      out.writeUint32(0);
      // endpoints.blue.x
      out.writeUint32(0);
      // endpoints.blue.y
      out.writeUint32(0);
      // endpoints.blue.z
      out.writeUint32(0);
      // gammaRed
      out.writeUint32(0);
      // gammaGreen
      out.writeUint32(0);
      // gammaBlue
      out.writeUint32(0);
      // intent LCS_GM_GRAPHICS
      out.writeUint32(2);
      // profileData
      out.writeUint32(0);
      // profileSize
      out.writeUint32(0);
      // reserved
      out.writeUint32(0);
    }

    if (bpp === 1 || bpp === 2 || bpp === 4 || bpp === 8) {
      if (palette !== undefined) {
        const l =
          palette.numColors > implicitPaletteSize
            ? implicitPaletteSize
            : palette.numColors;
        let pi: number = 0;
        for (pi = 0; pi < l; ++pi) {
          out.writeByte(Math.trunc(palette.getBlue(pi)));
          out.writeByte(Math.trunc(palette.getGreen(pi)));
          out.writeByte(Math.trunc(palette.getRed(pi)));
          out.writeByte(0);
        }
        for (; pi < implicitPaletteSize; ++pi) {
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
        }
      } else {
        if (bpp === 1) {
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(255);
          out.writeByte(255);
          out.writeByte(255);
          out.writeByte(0);
        } else if (bpp === 2) {
          for (let pi = 0; pi < 4; ++pi) {
            const v = pi * 85;
            out.writeByte(v);
            out.writeByte(v);
            out.writeByte(v);
            out.writeByte(0);
          }
        } else if (bpp === 4) {
          for (let pi = 0; pi < 16; ++pi) {
            const v = pi * 17;
            out.writeByte(v);
            out.writeByte(v);
            out.writeByte(v);
            out.writeByte(0);
          }
        } else if (bpp === 8) {
          for (let pi = 0; pi < 256; ++pi) {
            out.writeByte(pi);
            out.writeByte(pi);
            out.writeByte(pi);
            out.writeByte(0);
          }
        }
      }
    }

    // image data must be aligned to a 4 byte alignment. Pad the remaining
    // bytes until the image starts.
    let gap1 = gapSize;
    while (gap1-- > 0) {
      out.writeByte(0);
    }

    // Write image data
    if (bpp === 1 || bpp === 2 || bpp === 4 || bpp === 8) {
      let offset = image.byteLength - imageStride;
      const h = image.height;
      for (let y = 0; y < h; ++y) {
        const bytes =
          image.buffer !== undefined
            ? new Uint8Array(image.buffer, offset, imageStride)
            : new Uint8Array();

        if (bpp === 1) {
          out.writeBytes(bytes);
        } else if (bpp === 2) {
          const l = bytes.length;
          for (let xi = 0; xi < l; ++xi) {
            const b = bytes[xi];
            const left = b >>> 4;
            const right = b & 0x0f;
            const rb = (right << 4) | left;
            out.writeByte(rb);
          }
        } else if (bpp === 4) {
          const l = bytes.length;
          for (let xi = 0; xi < l; ++xi) {
            const b = bytes[xi];
            const b1 = b >>> 4;
            const b2 = b & 0x0f;
            const rb = (b1 << 4) | b2;
            out.writeByte(rb);
          }
        } else {
          out.writeBytes(bytes);
        }

        if (rowPadding !== undefined) {
          out.writeBytes(rowPadding);
        }

        offset -= imageStride;
      }

      return out.getBytes();
    }

    const hasAlpha = image.numChannels === 4;
    const h = image.height;
    const w = image.width;
    if (bpp === 16) {
      let p: Pixel | undefined = undefined;
      for (let y = h - 1; y >= 0; --y) {
        p = image.getPixel(0, y, p);
        for (let x = 0; x < w; ++x) {
          out.writeByte((Math.trunc(p.g) << 4) | Math.trunc(p.b));
          out.writeByte((Math.trunc(p.a) << 4) | Math.trunc(p.r));
          p.next();
        }
        if (rowPadding !== undefined) {
          out.writeBytes(rowPadding);
        }
      }
    } else {
      let p: Pixel | undefined = undefined;
      for (let y = h - 1; y >= 0; --y) {
        p = image.getPixel(0, y, p);
        for (let x = 0; x < w; ++x) {
          out.writeByte(Math.trunc(p.b));
          out.writeByte(Math.trunc(p.g));
          out.writeByte(Math.trunc(p.r));
          if (hasAlpha) {
            out.writeByte(Math.trunc(p.a));
          }
          p.next();
        }
        if (rowPadding !== undefined) {
          out.writeBytes(rowPadding);
        }
      }
    }

    return out.getBytes();
  }
}
