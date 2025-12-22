/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { LibError } from '../error/lib-error.js';
import { ExifData } from '../exif/exif-data.js';
import { FrameType } from '../image/frame-type.js';
import { MemoryImage } from '../image/image.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { ImageFormat } from './image-format.js';
import { TiffImage } from './tiff/tiff-image.js';
import { TiffInfo } from './tiff/tiff-info.js';

/**
 * Class representing a TIFF decoder.
 */
export class TiffDecoder implements Decoder {
  /**
   * TIFF signature constant.
   */
  private static readonly _tiffSignature = 42;

  /**
   * Little-endian byte order constant.
   */
  private static readonly _tiffLittleEndian = 0x4949;

  /**
   * Big-endian byte order constant.
   */
  private static readonly _tiffBigEndian = 0x4d4d;

  /**
   * Input buffer for the TIFF data.
   */
  private _input!: InputBuffer<Uint8Array>;

  /**
   * Information about the TIFF file.
   */
  private _info: TiffInfo | undefined = undefined;

  /**
   * Get the TIFF information.
   */
  public get info(): TiffInfo | undefined {
    return this._info;
  }

  /**
   * EXIF data extracted from the TIFF file.
   */
  private _exifData: ExifData | undefined = undefined;

  /**
   * Get the EXIF data.
   */
  public get exifData(): ExifData | undefined {
    return this._exifData;
  }

  /**
   * Get the image format.
   */
  get format(): ImageFormat {
    return ImageFormat.tiff;
  }

  /**
   * Get the number of frames available to be decoded.
   * **startDecode** should have been called first.
   * Non-animated image files will have a single frame.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.images.length : 0;
  }

  /**
   * Read the TIFF header and IFD blocks.
   * @param {InputBuffer<Uint8Array>} p - The input buffer containing the TIFF data.
   * @returns {TiffInfo | undefined} The TIFF information if valid, otherwise undefined.
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
   * Check if the given file is a valid TIFF image.
   * @param {Uint8Array} bytes - The file data as a byte array.
   * @returns {boolean} True if the file is a valid TIFF image, otherwise false.
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
   * @param {Uint8Array} bytes - The file data as a byte array.
   * @returns {TiffInfo | undefined} The TIFF information if valid, otherwise undefined.
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
   * Decode a single frame from the data that was set with **startDecode**.
   * If **frameIndex** is out of the range of available frames, undefined is returned.
   * Non-animated image files will only have **frameIndex** 0.
   * @param {number} frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded image if successful, otherwise undefined.
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
   * @param {DecoderDecodeOptions} opt - The decode options.
   * @param {Uint8Array} opt.bytes - The file data as a byte array.
   * @param {number} [opt.frameIndex] - The index of the frame to decode (optional).
   * @returns {MemoryImage | undefined} The decoded image if successful, otherwise undefined.
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

    // By default decode all frames and include the metadata in the result.
    // Most tif images have only a single image.
    const len = this.numFrames;
    if (opt.frameIndex !== undefined) {
      if (opt.frameIndex >= len) {
        throw new LibError(
          `Invalid value: frameIndex is not in range 0..${len - 1}, inclusive.`
        );
      }
      return this.decodeFrame(opt.frameIndex);
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
