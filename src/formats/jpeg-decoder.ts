/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { InputBuffer } from '../common/input-buffer';
import { MemoryImage } from '../common/memory-image';
import { ImageError } from '../error/image-error';
import { HdrImage } from '../hdr/hdr-image';
import { Decoder } from './decoder';
import { JpegData } from './jpeg/jpeg-data';
import { JpegInfo } from './jpeg/jpeg-info';

/**
 * Decode a jpeg encoded image.
 */
export class JpegDecoder implements Decoder {
  private info?: JpegInfo;

  private input?: InputBuffer;

  public get numFrames(): number {
    return this.info !== undefined ? this.info.numFrames : 0;
  }

  /**
   * Is the given file a valid JPEG image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return new JpegData().validate(bytes);
  }

  public startDecode(bytes: Uint8Array): JpegInfo | undefined {
    this.input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });
    this.info = new JpegData().readInfo(bytes);
    return this.info;
  }

  public decodeFrame(_: number): MemoryImage | undefined {
    if (this.input === undefined) {
      return undefined;
    }
    const jpeg = new JpegData();
    jpeg.read(this.input.buffer);
    if (jpeg.frames.length !== 1) {
      throw new ImageError('only single frame JPEGs supported');
    }

    return jpeg.getImage();
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

  public decodeImage(bytes: Uint8Array, _?: number): MemoryImage | undefined {
    const jpeg = new JpegData();
    jpeg.read(bytes);

    if (jpeg.frames.length !== 1) {
      throw new ImageError('only single frame JPEGs supported');
    }

    return jpeg.getImage();
  }

  public decodeHdrImage(bytes: Uint8Array, frame = 0): HdrImage | undefined {
    const img = this.decodeImage(bytes, frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }
}
