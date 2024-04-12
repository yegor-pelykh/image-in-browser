/** @format */

import { InputBuffer } from '../common/input-buffer';
import { ExifData } from '../exif/exif-data';
import { FrameType } from '../image/frame-type';
import { MemoryImage } from '../image/image';
import { Decoder, DecoderDecodeOptions } from './decoder';
import { ImageFormat } from './image-format';
import { TiffImage } from './tiff/tiff-image';
import { TiffInfo } from './tiff/tiff-info';

export class TiffDecoder implements Decoder {
  private static readonly _tiffSignature = 42;
  private static readonly _tiffLittleEndian = 0x4949;
  private static readonly _tiffBigEndian = 0x4d4d;

  private _input!: InputBuffer<Uint8Array>;

  private _info: TiffInfo | undefined = undefined;
  public get info(): TiffInfo | undefined {
    return this._info;
  }

  private _exifData: ExifData | undefined = undefined;
  public get exifData(): ExifData | undefined {
    return this._exifData;
  }

  get format(): ImageFormat {
    return ImageFormat.tiff;
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
  private readHeader(p: InputBuffer<Uint8Array>): TiffInfo | undefined {
    const byteOrder = p.readUint16();
    if (
      byteOrder !== TiffDecoder._tiffLittleEndian &&
      byteOrder !== TiffDecoder._tiffBigEndian
    ) {
      return undefined;
    }

    let bigEndian = false;
    if (byteOrder === TiffDecoder._tiffBigEndian) {
      p.bigEndian = true;
      bigEndian = true;
    } else {
      p.bigEndian = false;
      bigEndian = false;
    }

    let signature = 0;
    signature = p.readUint16();
    if (signature !== TiffDecoder._tiffSignature) {
      return undefined;
    }

    let offset = p.readUint32();
    const ifdOffset = offset;

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
          ifdOffset: ifdOffset,
          images: images,
        })
      : undefined;
  }

  /**
   * Is the given file a valid TIFF image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const buffer = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    return this.readHeader(buffer) !== undefined;
  }

  /**
   * Validate the file is a TIFF image and get information about it.
   * If the file is not a valid TIFF image, undefined is returned.
   */
  public startDecode(bytes: Uint8Array): TiffInfo | undefined {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    this._info = this.readHeader(this._input);
    if (this.info !== undefined) {
      const buffer = new InputBuffer<Uint8Array>({
        buffer: bytes,
      });
      this._exifData = ExifData.fromInputBuffer(buffer);
    }
    return this._info;
  }

  /**
   * Decode a single frame from the data stat was set with **startDecode**.
   * If **frameIndex** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frameIndex** 0.
   */
  public decodeFrame(frameIndex: number): MemoryImage | undefined {
    if (this._info === undefined) {
      return undefined;
    }

    const image = this._info.images[frameIndex].decode(this._input);
    if (this._exifData !== undefined) {
      image.exifData = this._exifData;
    }
    return image;
  }

  /**
   * Decode the file and extract a single image from it. If the file is
   * animated, the specified **frameIndex** will be decoded. If there was a problem
   * decoding the file, undefined is returned.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;

    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });

    this._info = this.readHeader(this._input);
    if (this._info === undefined) {
      return undefined;
    }

    const len = this.numFrames;
    if (len === 1 || opt.frameIndex !== undefined) {
      return this.decodeFrame(opt.frameIndex ?? 0);
    }

    const image = this.decodeFrame(0);
    if (image === undefined) {
      return undefined;
    }
    image.exifData = ExifData.fromInputBuffer(
      new InputBuffer<Uint8Array>({
        buffer: bytes,
      })
    );
    image.frameType = FrameType.page;

    for (let i = 1; i < len; ++i) {
      const frame = this.decodeFrame(i);
      image.addFrame(frame);
    }

    return image;
  }
}
