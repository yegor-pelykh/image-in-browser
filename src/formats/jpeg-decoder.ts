/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { ImageFormat } from './image-format.js';
import { JpegData } from './jpeg/jpeg-data.js';
import { JpegInfo } from './jpeg/jpeg-info.js';

/**
 * Decode a jpeg encoded image.
 */
export class JpegDecoder implements Decoder {
  /**
   * Input buffer for the JPEG data.
   */
  private _input?: InputBuffer<Uint8Array>;

  /**
   * Information about the JPEG image.
   */
  private _info?: JpegInfo;

  /**
   * Get the image format.
   * @returns {ImageFormat} The format of the image, which is JPEG.
   */
  get format(): ImageFormat {
    return ImageFormat.jpg;
  }

  /**
   * Get the number of frames in the JPEG image.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  /**
   * Is the given file a valid JPEG image?
   * @param {Uint8Array} bytes - The bytes of the file to validate.
   * @returns {boolean} True if the file is a valid JPEG image, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return new JpegData().validate(bytes);
  }

  /**
   * Start decoding the JPEG image.
   * @param {Uint8Array} bytes - The bytes of the JPEG image.
   * @returns {JpegInfo | undefined} Information about the JPEG image, or undefined if decoding fails.
   */
  public startDecode(bytes: Uint8Array): JpegInfo | undefined {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
      bigEndian: true,
    });
    this._info = new JpegData().readInfo(bytes);
    return this._info;
  }

  /**
   * Decode a specific frame of the JPEG image.
   * @param {number} _ - The frame index (currently only single frame JPEGs are supported).
   * @returns {MemoryImage | undefined} The decoded image, or undefined if decoding fails.
   * @throws {LibError} If the JPEG contains more than one frame.
   */
  public decodeFrame(_: number): MemoryImage | undefined {
    if (this._input === undefined) {
      return undefined;
    }

    const jpeg = new JpegData();
    jpeg.read(this._input.buffer as Uint8Array);
    if (jpeg.frames.length !== 1) {
      throw new LibError('Only single frame JPEGs supported.');
    }

    return jpeg.getImage();
  }

  /**
   * Decode the JPEG image.
   * @param {DecoderDecodeOptions} opt - The options for decoding.
   * @param {Uint8Array} opt.bytes - The bytes of the JPEG image.
   * @returns {MemoryImage | undefined} The decoded image, or undefined if decoding fails.
   * @throws {LibError} If the JPEG contains more than one frame.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;

    const jpeg = new JpegData();
    jpeg.read(bytes);

    if (jpeg.frames.length !== 1) {
      throw new LibError('Only single frame JPEGs supported.');
    }

    return jpeg.getImage();
  }
}
