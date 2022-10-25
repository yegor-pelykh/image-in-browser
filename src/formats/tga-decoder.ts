/** @format */

import { ColorUtils } from '../common/color-utils';
import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { HdrImage } from '../hdr/hdr-image';
import { Decoder } from './decoder';
import { TgaInfo } from './tga/tga-info';
import { InputBuffer } from './util/input-buffer';

/**
 * Decode a TGA image. This only supports the 24-bit uncompressed format.
 */
export class TgaDecoder implements Decoder {
  private _info: TgaInfo | undefined = undefined;
  public get info(): TgaInfo | undefined {
    return this._info;
  }

  private _input: InputBuffer | undefined = undefined;
  public get input(): InputBuffer | undefined {
    return this._input;
  }

  public get numFrames(): number {
    return this._info !== undefined ? 1 : 0;
  }

  /**
   * Is the given file a valid TGA image?
   */
  isValidFile(bytes: Uint8Array): boolean {
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

  startDecode(bytes: Uint8Array): TgaInfo | undefined {
    this._input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });

    const header = this._input.readBytes(18);
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
    const imageOffset = this._input.offset;
    const bitsPerPixel = header.getByte(16);

    this._info = new TgaInfo({
      width: width,
      height: height,
      imageOffset: imageOffset,
      bitsPerPixel: bitsPerPixel,
    });

    return this._info;
  }

  decodeFrame(_frame: number): MemoryImage | undefined {
    if (this._info === undefined || this._input === undefined) {
      return undefined;
    }

    this._input.offset = this._info.imageOffset!;
    const image = new MemoryImage({
      width: this._info.width,
      height: this._info.height,
      rgbChannelSet: RgbChannelSet.rgb,
    });
    for (let y = image.height - 1; y >= 0; --y) {
      for (let x = 0; x < image.width; ++x) {
        const b = this._input.readByte();
        const g = this._input.readByte();
        const r = this._input.readByte();
        const a = this._info.bitsPerPixel === 32 ? this._input.readByte() : 255;
        image.setPixel(x, y, ColorUtils.getColor(r, g, b, a));
      }
    }

    return image;
  }

  decodeHdrFrame(frame: number): HdrImage | undefined {
    const img = this.decodeFrame(frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }

  decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined {
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

  decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    return this.decodeFrame(frame);
  }

  decodeHdrImage(
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
