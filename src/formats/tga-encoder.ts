/** @format */

import { ColorUtils } from '../common/color-utils';
import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { Encoder } from './encoder';
import { OutputBuffer } from './util/output-buffer';

/**
 * Encode a TGA image. This only supports the 24-bit uncompressed format.
 */
export class TgaEncoder implements Encoder {
  private _supportsAnimation = false;
  get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  encodeImage(image: MemoryImage): Uint8Array {
    const out = new OutputBuffer({
      bigEndian: true,
    });

    const header = new Uint8Array(18);
    header.fill(0);

    header[2] = 2;
    header[12] = image.width & 0xff;
    header[13] = (image.width >> 8) & 0xff;
    header[14] = image.height & 0xff;
    header[15] = (image.height >> 8) & 0xff;
    header[16] = image.rgbChannelSet === RgbChannelSet.rgb ? 24 : 32;

    out.writeBytes(header);

    for (let y = image.height - 1; y >= 0; --y) {
      for (let x = 0; x < image.width; ++x) {
        const c = image.getPixel(x, y);
        out.writeByte(ColorUtils.getBlue(c));
        out.writeByte(ColorUtils.getGreen(c));
        out.writeByte(ColorUtils.getRed(c));
        if (image.rgbChannelSet === RgbChannelSet.rgba) {
          out.writeByte(ColorUtils.getAlpha(c));
        }
      }
    }

    return out.getBytes();
  }

  encodeAnimation(_animation: FrameAnimation): Uint8Array | undefined {
    return undefined;
  }
}
