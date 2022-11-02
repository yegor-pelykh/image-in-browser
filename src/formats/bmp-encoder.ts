/** @format */

import { ColorUtils } from '../common/color-utils';
import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { OutputBuffer } from '../common/output-buffer';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { BitmapFileHeader } from './bmp/bitmap-file-header';
import { Encoder } from './encoder';

/**
 * Encode a BMP image.
 */
export class BmpEncoder implements Encoder {
  private _supportsAnimation = false;
  get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  public encodeImage(image: MemoryImage): Uint8Array {
    const bytesPerPixel = image.rgbChannelSet === RgbChannelSet.rgb ? 3 : 4;
    const bpp = bytesPerPixel * 8;
    const rgbSize = image.width * image.height * bytesPerPixel;
    const headerSize = 54;
    const headerInfoSize = 40;
    const fileSize = rgbSize + headerSize;

    const out = new OutputBuffer();

    out.writeUint16(BitmapFileHeader.BMP_HEADER_FILETYPE);
    out.writeUint32(fileSize);
    // Reserved
    out.writeUint32(0);

    out.writeUint32(headerSize);
    out.writeUint32(headerInfoSize);
    out.writeUint32(image.width);
    out.writeUint32(-image.height);
    // Planes
    out.writeUint16(1);
    out.writeUint16(bpp);
    // Compress
    out.writeUint32(0);
    out.writeUint32(rgbSize);
    // Hr
    out.writeUint32(0);
    // Vr
    out.writeUint32(0);
    // Colors
    out.writeUint32(0);
    // ImportantColors
    out.writeUint32(0);

    for (let y = 0, pi = 0; y < image.height; ++y) {
      for (let x = 0; x < image.width; ++x, ++pi) {
        const rgba = image.getPixelByIndex(pi);
        out.writeByte(ColorUtils.getBlue(rgba));
        out.writeByte(ColorUtils.getGreen(rgba));
        out.writeByte(ColorUtils.getRed(rgba));
        if (bytesPerPixel === 4) {
          out.writeByte(ColorUtils.getAlpha(rgba));
        }
      }

      // Line padding
      if (bytesPerPixel !== 4) {
        const padding = 4 - ((image.width * bytesPerPixel) % 4);
        if (padding !== 4) {
          const bytes = new Uint8Array(padding - 1).fill(0x00);
          out.writeBytes(bytes);
          out.writeByte(0xff);
        }
      }
    }

    return out.getBytes();
  }

  public encodeAnimation(_: FrameAnimation): Uint8Array | undefined {
    return undefined;
  }
}
