/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { FrameType } from '../common/frame-type';
import { InputBuffer } from '../common/input-buffer';
import { MemoryImage } from '../common/memory-image';
import { HdrImage } from '../hdr/hdr-image';
import { Decoder } from './decoder';
import { TiffImage } from './tiff/tiff-image';
import { TiffInfo } from './tiff/tiff-info';

export class TiffDecoder implements Decoder {
  private static readonly TIFF_SIGNATURE = 42;
  private static readonly TIFF_LITTLE_ENDIAN = 0x4949;
  private static readonly TIFF_BIG_ENDIAN = 0x4d4d;

  private input!: InputBuffer;

  private _info: TiffInfo | undefined = undefined;
  public get info(): TiffInfo | undefined {
    return this._info;
  }

  /**
   * How many frames are available to be decoded. **startDecode** should have been called first.
   * Non animated image files will have a single frame.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.images.length : 0;
  }

  /**
   * Read the TIFF header and IFD blocks.
   */
  private readHeader(p: InputBuffer): TiffInfo | undefined {
    const byteOrder = p.readUint16();
    if (
      byteOrder !== TiffDecoder.TIFF_LITTLE_ENDIAN &&
      byteOrder !== TiffDecoder.TIFF_BIG_ENDIAN
    ) {
      return undefined;
    }

    let bigEndian = false;
    if (byteOrder === TiffDecoder.TIFF_BIG_ENDIAN) {
      p.bigEndian = true;
      bigEndian = true;
    } else {
      p.bigEndian = false;
      bigEndian = false;
    }

    let signature = 0;
    signature = p.readUint16();
    if (signature !== TiffDecoder.TIFF_SIGNATURE) {
      return undefined;
    }

    let offset = p.readUint32();

    const p2 = InputBuffer.from(p);
    p2.offset = offset;

    const images: TiffImage[] = [];
    while (offset !== 0) {
      let img: TiffImage | undefined = undefined;
      try {
        img = new TiffImage(p2);
        if (!img.isValid) {
          break;
        }
      } catch (error) {
        break;
      }
      images.push(img);

      offset = p2.readUint32();
      if (offset !== 0) {
        p2.offset = offset;
      }
    }

    return images.length > 0
      ? new TiffInfo({
          bigEndian: bigEndian,
          signature: signature,
          ifdOffset: offset,
          images: images,
        })
      : undefined;
  }

  /**
   * Is the given file a valid TIFF image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const buffer = new InputBuffer({
      buffer: bytes,
    });
    return this.readHeader(buffer) !== undefined;
  }

  /**
   * Validate the file is a TIFF image and get information about it.
   * If the file is not a valid TIFF image, undefined is returned.
   */
  public startDecode(bytes: Uint8Array): TiffInfo | undefined {
    this.input = new InputBuffer({
      buffer: bytes,
    });
    this._info = this.readHeader(this.input);
    return this._info;
  }

  /**
   * Decode a single frame from the data stat was set with **startDecode**.
   * If **frame** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frame** 0. An **AnimationFrame**
   * is returned, which provides the image, and top-left coordinates of the
   * image, as animated frames may only occupy a subset of the canvas.
   */
  public decodeFrame(frame: number): MemoryImage | undefined {
    if (this._info === undefined) {
      return undefined;
    }

    return this._info.images[frame].decode(this.input);
  }

  public decodeHdrFrame(frame: number): HdrImage | undefined {
    if (this._info === undefined) {
      return undefined;
    }
    return this._info.images[frame].decodeHdr(this.input);
  }

  /**
   * Decode all of the frames from an animation. If the file is not an
   * animation, a single frame animation is returned. If there was a problem
   * decoding the file, undefined is returned.
   */
  public decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    const animation = new FrameAnimation({
      width: this._info!.width,
      height: this._info!.height,
      frameType: FrameType.page,
    });

    for (let i = 0, len = this.numFrames; i < len; ++i) {
      const image = this.decodeFrame(i);
      animation.addFrame(image!);
    }

    return animation;
  }

  /**
   * Decode the file and extract a single image from it. If the file is
   * animated, the specified **frame** will be decoded. If there was a problem
   * decoding the file, undefined is returned.
   */
  public decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    this.input = new InputBuffer({
      buffer: bytes,
    });

    this._info = this.readHeader(this.input);
    if (this._info === undefined) {
      return undefined;
    }

    return this._info.images[frame].decode(this.input);
  }

  public decodeHdrImage(bytes: Uint8Array, frame = 0): HdrImage | undefined {
    this.input = new InputBuffer({
      buffer: bytes,
    });

    this._info = this.readHeader(this.input);
    if (this._info === undefined) {
      return undefined;
    }

    return this._info.images[frame].decodeHdr(this.input);
  }
}
