/** @format */

import { Color } from '../common/color';
import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { OutputBuffer } from '../common/output-buffer';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { Encoder } from './encoder';

/**
 * Encode a TGA image. This only supports the 24-bit uncompressed format.
 */
export class TgaEncoder implements Encoder {
  private _supportsAnimation = false;
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  public encodeImage(image: MemoryImage): Uint8Array {
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
        out.writeByte(Color.getBlue(c));
        out.writeByte(Color.getGreen(c));
        out.writeByte(Color.getRed(c));
        if (image.rgbChannelSet === RgbChannelSet.rgba) {
          out.writeByte(Color.getAlpha(c));
        }
      }
    }

    return out.getBytes();
  }

  public encodeAnimation(_animation: FrameAnimation): Uint8Array | undefined {
    return undefined;
  }
}
