/** @format */

import { ColorUtils } from '../common/color-utils';
import { FrameAnimation } from '../common/frame-animation';
import { InputBuffer } from '../common/input-buffer';
import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { HdrImage } from '../hdr/hdr-image';
import { Decoder } from './decoder';
import { TgaInfo } from './tga/tga-info';

/**
 * Decode a TGA image. This only supports the 24-bit uncompressed format.
 */
export class TgaDecoder implements Decoder {
  private info: TgaInfo | undefined = undefined;

  private input: InputBuffer | undefined = undefined;

  public get numFrames(): number {
    return this.info !== undefined ? 1 : 0;
  }

  /**
   * Is the given file a valid TGA image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });

    const header = input.readBytes(18);
    if (header.getByte(2) !== 2) {
      return false;
    }
    if (header.getByte(16) !== 24 && header.getByte(16) !== 32) {
      return false;
    }

    return true;
  }

  public startDecode(bytes: Uint8Array): TgaInfo | undefined {
    this.input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });

    const header = this.input.readBytes(18);
    if (header.getByte(2) !== 2) {
      return undefined;
    }
    if (header.getByte(16) !== 24 && header.getByte(16) !== 32) {
      return undefined;
    }

    const width =
      (header.getByte(12) & 0xff) | ((header.getByte(13) & 0xff) << 8);
    const height =
      (header.getByte(14) & 0xff) | ((header.getByte(15) & 0xff) << 8);
    const imageOffset = this.input.offset;
    const bitsPerPixel = header.getByte(16);

    this.info = new TgaInfo({
      width: width,
      height: height,
      imageOffset: imageOffset,
      bitsPerPixel: bitsPerPixel,
    });

    return this.info;
  }

  public decodeFrame(_frame: number): MemoryImage | undefined {
    if (this.info === undefined || this.input === undefined) {
      return undefined;
    }

    this.input.offset = this.info.imageOffset!;
    const image = new MemoryImage({
      width: this.info.width,
      height: this.info.height,
      rgbChannelSet: RgbChannelSet.rgb,
    });
    for (let y = image.height - 1; y >= 0; --y) {
      for (let x = 0; x < image.width; ++x) {
        const b = this.input.readByte();
        const g = this.input.readByte();
        const r = this.input.readByte();
        const a = this.info.bitsPerPixel === 32 ? this.input.readByte() : 255;
        image.setPixel(x, y, ColorUtils.getColor(r, g, b, a));
      }
    }

    return image;
  }

  public decodeHdrFrame(frame: number): HdrImage | undefined {
    const img = this.decodeFrame(frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }

  public decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined {
    const image = this.decodeImage(bytes);
    if (image === undefined) {
      return undefined;
    }

    const animation = new FrameAnimation({
      width: image.width,
      height: image.height,
    });

    animation.addFrame(image);

    return animation;
  }

  public decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    return this.decodeFrame(frame);
  }

  public decodeHdrImage(
    bytes: Uint8Array,
    frame?: number | undefined
  ): HdrImage | undefined {
    const img = this.decodeImage(bytes, frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }
}
