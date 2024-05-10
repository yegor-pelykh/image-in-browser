/** @format */

import { FrameType } from '../image/frame-type';
import { MemoryImage } from '../image/image';
import { Decoder, DecoderDecodeOptions } from './decoder';
import { ImageFormat } from './image-format';
import { PsdImage } from './psd/psd-image';

/**
 * Decode a Photoshop PSD image.
 */
export class PsdDecoder implements Decoder {
  private _info: PsdImage | undefined;
  public get info(): PsdImage | undefined {
    return this._info;
  }

  public get format(): ImageFormat {
    return ImageFormat.psd;
  }

  /**
   * How many frames are available to be decoded. **startDecode** should have
   * been called first. Non animated image files will have a single frame.
   */
  public get numFrames(): number {
    return this._info?.numFrames ?? 0;
  }

  /**
   * Decode a raw PSD image without rendering it to a flat image.
   */
  public decodePsd(bytes: Uint8Array): PsdImage | undefined {
    const psd = new PsdImage(bytes);
    return psd.decode() ? psd : undefined;
  }

  /**
   * A light-weight function to test if the given file is able to be decoded
   * by this Decoder.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const image = new PsdImage(bytes);
    return image.isValid;
  }

  /**
   * Start decoding the data as an animation sequence, but don't actually
   * process the frames until they are requested with decodeFrame.
   */
  public startDecode(bytes: Uint8Array): PsdImage | undefined {
    this._info = new PsdImage(bytes);
    return this._info;
  }

  /**
   * Decode the file and extract a single image from it. If the file is
   * animated, the specified **frameIndex** will be decoded. If there was a problem
   * decoding the file, undefined is returned.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    if (this.startDecode(opt.bytes) === undefined) {
      return undefined;
    }

    const len = this.numFrames;
    if (len === 1 || opt.frameIndex !== undefined) {
      return this.decodeFrame(opt.frameIndex ?? 0);
    }

    let firstImage: MemoryImage | undefined = undefined;
    for (let i = 0; i < len; ++i) {
      const frame = this.decodeFrame(i);
      if (frame === undefined) {
        continue;
      }
      if (firstImage === undefined) {
        firstImage = frame;
        frame.frameType = FrameType.page;
      } else {
        firstImage.addFrame(frame);
      }
    }

    return firstImage;
  }

  /**
   * Decode a single frame from the data stat was set with **startDecode**.
   * If **frameIndex** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frameIndex** 0.
   */
  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    return this._info?.decodeImage();
  }
}
