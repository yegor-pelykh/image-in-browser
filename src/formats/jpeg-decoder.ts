/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import {
  Decoder,
  DecoderDecodeOptions,
  defaultMaxPixels,
  setDefaultMaxPixels,
} from './decoder.js';
import { ImageFormat } from './image-format.js';
import { guardDecode } from './guard-decode.js';
import { JpegData } from './jpeg/jpeg-data.js';
import { JpegInfo } from './jpeg/jpeg-info.js';

/**
 * Decode a jpeg encoded image.
 */
export class JpegDecoder implements Decoder {
  /**
   * The {@link maxPixels} used by decoders created without one, including the
   * decoders used by decodeImage and decodeJpg. The default of 2^28
   * (16384 x 16384) allows very large photos while preventing a small,
   * malicious file from declaring dimensions that would exhaust memory.
   * A value <= 0 disables the limit.
   * @deprecated Use {@link defaultMaxPixels} instead.
   */
  public static get defaultMaxPixels(): number {
    return defaultMaxPixels;
  }

  /**
   * Sets the shared default maxPixels.
   * @deprecated Use {@link setDefaultMaxPixels} instead.
   */
  public static set defaultMaxPixels(value: number) {
    setDefaultMaxPixels(value);
  }

  /**
   * The maximum number of pixels (width * height) this decoder will decode.
   * Images declaring more throw a {@link LibError} before any pixel data is
   * allocated. A value <= 0 disables the limit.
   */
  private readonly _maxPixels: number;

  /**
   * Gets the maximum number of pixels (width * height) this decoder will
   * decode.
   */
  public get maxPixels(): number {
    return this._maxPixels;
  }

  /**
   * The factor the image is scaled down by while decoding: 1, 2, 4 or 8.
   * Decoding at a reduced scale is much faster and uses less memory, so it's
   * a good way to decode a thumbnail. The decoded image is the size of the
   * JPEG divided by {@link scale}, rounded up.
   */
  private readonly _scale: number;

  /**
   * Gets the factor the image is scaled down by while decoding.
   */
  public get scale(): number {
    return this._scale;
  }

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
   * Create a JPEG decoder.
   * @param {number} [maxPixels] - The maximum number of pixels (width * height)
   * to decode. If not given, {@link defaultMaxPixels} is used.
   * @param {number} [scale=1] - The factor to scale the image down by while
   * decoding: 1, 2, 4 or 8. Decoding at a reduced scale is much faster and
   * uses less memory, so it's a good way to decode a thumbnail. The decoded
   * image is the size of the JPEG divided by {@link scale}, rounded up.
   * @throws {LibError} If {@link scale} is not 1, 2, 4 or 8.
   */
  constructor(maxPixels?: number, scale = 1) {
    this._maxPixels = maxPixels ?? defaultMaxPixels;
    if (scale !== 1 && scale !== 2 && scale !== 4 && scale !== 8) {
      throw new LibError('scale must be 1, 2, 4 or 8');
    }
    this._scale = scale;
  }

  /**
   * Is the given file a valid JPEG image?
   * @param {Uint8Array} bytes - The bytes of the file to validate.
   * @returns {boolean} True if the file is a valid JPEG image, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      return false;
    }
    try {
      return new JpegData().validate(bytes);
    } catch (_) {
      return false;
    }
  }

  /**
   * Start decoding the JPEG image.
   * @param {Uint8Array} bytes - The bytes of the JPEG image.
   * @returns {JpegInfo | undefined} Information about the JPEG image, or undefined if decoding fails.
   */
  public startDecode(bytes: Uint8Array): JpegInfo | undefined {
    return guardDecode(() => this._startDecode(bytes));
  }

  private _startDecode(bytes: Uint8Array): JpegInfo | undefined {
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
    return guardDecode(() => this._decodeFrame(_));
  }

  private _decodeFrame(_: number): MemoryImage | undefined {
    if (this._input === undefined) {
      return undefined;
    }

    const jpeg = new JpegData();
    jpeg.maxPixels = this._maxPixels;
    jpeg.scale = this._scale;
    return jpeg.decodeImage(this._input.buffer);
  }

  /**
   * Decode the JPEG image.
   * @param {DecoderDecodeOptions} opt - The options for decoding.
   * @param {Uint8Array} opt.bytes - The bytes of the JPEG image.
   * @returns {MemoryImage | undefined} The decoded image, or undefined if decoding fails.
   * @throws {LibError} If the JPEG contains more than one frame.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    return guardDecode(() => this._decode(opt));
  }

  private _decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const jpeg = new JpegData();
    jpeg.maxPixels = this._maxPixels;
    jpeg.scale = this._scale;
    return jpeg.decodeImage(opt.bytes);
  }
}
