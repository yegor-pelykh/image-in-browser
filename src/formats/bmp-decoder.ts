/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { HdrImage } from '../hdr/hdr-image';
import { BitmapFileHeader } from './bmp/bitmap-file-header';
import { BmpInfo } from './bmp/bmp-info';
import { DecodeInfo } from './decode-info';
import { Decoder } from './decoder';
import { InputBuffer } from './util/input-buffer';

export class BmpDecoder implements Decoder {
  protected input?: InputBuffer;

  protected info?: BmpInfo;

  public get numFrames(): number {
    return this.info !== undefined ? this.info.numFrames : 0;
  }

  private pixelDataOffset(): number | undefined {
    return this.info !== undefined ? this.info.fileHeader.offset : undefined;
  }

  /**
   * Is the given file a valid BMP image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return BitmapFileHeader.isValidFile(
      new InputBuffer({
        buffer: bytes,
      })
    );
  }

  public startDecode(bytes: Uint8Array): DecodeInfo | undefined {
    if (!this.isValidFile(bytes)) {
      return undefined;
    }
    this.input = new InputBuffer({
      buffer: bytes,
    });
    this.info = new BmpInfo(this.input);
    return this.info;
  }

  /**
   * Decode a single frame from the data stat was set with [startDecode].
   * If [frame] is out of the range of available frames, null is returned.
   * Non animated image files will only have [frame] 0. An [AnimationFrame]
   * is returned, which provides the image, and top-left coordinates of the
   * image, as animated frames may only occupy a subset of the canvas.
   */
  public decodeFrame(_: number): MemoryImage | undefined {
    if (this.input === undefined || this.info === undefined) {
      return undefined;
    }

    const offset = this.pixelDataOffset();
    if (offset === undefined) {
      return undefined;
    }

    this.input.offset = offset;
    let rowStride = (this.info.width * this.info.bpp) >> 3;
    if (rowStride % 4 !== 0) {
      rowStride += 4 - (rowStride % 4);
    }

    const image = new MemoryImage({
      width: this.info.width,
      height: this.info.height,
    });
    for (let y = image.height - 1; y >= 0; --y) {
      const line = this.info.readBottomUp ? y : image.height - 1 - y;
      const row = this.input.readBytes(rowStride);
      for (let x = 0; x < image.width; ) {
        this.info.decodeRgba(row, (color) => {
          return image.setPixel(x++, line, color);
        });
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

  /**
   * Decode all of the frames from an animation. If the file is not an
   * animation, a single frame animation is returned. If there was a problem
   * decoding the file, null is returned.
   */
  public decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined {
    if (!this.isValidFile(bytes)) {
      return undefined;
    }

    const image = this.decodeImage(bytes);
    if (image === undefined) {
      return undefined;
    }

    const animation = new FrameAnimation();
    animation.addFrame(image);

    return animation;
  }

  /**
   * Decode the file and extract a single image from it. If the file is
   * animated, the specified [frame] will be decoded. If there was a problem
   * decoding the file, null is returned.
   */
  public decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    if (!this.isValidFile(bytes)) {
      return undefined;
    }

    this.startDecode(bytes);
    return this.decodeFrame(frame);
  }

  public decodeHdrImage(bytes: Uint8Array, frame = 0): HdrImage | undefined {
    const img = this.decodeImage(bytes, frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }
}
