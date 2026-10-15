/** @format */

import { FrameType } from '../image/frame-type.js';
import { MemoryImage } from '../image/image.js';
import { Decoder, DecoderDecodeOptions, defaultMaxPixels } from './decoder.js';
import { guardDecode } from './guard-decode.js';
import { ImageFormat } from './image-format.js';
import { PsdImage } from './psd/psd-image.js';

/**
 * Decode a Photoshop PSD image.
 */
export class PsdDecoder implements Decoder {
  /**
   * Information about the PSD image.
   */
  private _info: PsdImage | undefined;

  /**
   * The maximum number of pixels (width * height) of the image, and of all
   * of its layers. Larger images throw a {@link LibError}. A value <= 0
   * disables the limit.
   */
  private readonly _maxPixels: number;

  /**
   * Gets the maximum number of pixels (width * height) of the image.
   */
  public get maxPixels(): number {
    return this._maxPixels;
  }

  /**
   * Create a PSD decoder.
   * @param {number} [maxPixels] - The maximum number of pixels (width * height)
   * to decode. If not given, {@link defaultMaxPixels} is used.
   */
  constructor(maxPixels?: number) {
    this._maxPixels = maxPixels ?? defaultMaxPixels;
  }

  /**
   * Get the PSD image information.
   * @returns {PsdImage | undefined} The PSD image information.
   */
  public get info(): PsdImage | undefined {
    return this._info;
  }

  /**
   * Get the image format.
   * @returns {ImageFormat} The image format.
   */
  public get format(): ImageFormat {
    return ImageFormat.psd;
  }

  /**
   * Get the number of frames available to be decoded.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._info?.numFrames ?? 0;
  }

  /**
   * Decode a raw PSD image without rendering it to a flat image.
   * @param {Uint8Array} bytes - The raw PSD image data.
   * @returns {PsdImage | undefined} The decoded PSD image.
   */
  public decodePsd(bytes: Uint8Array): PsdImage | undefined {
    return guardDecode(() => this._decodePsd(bytes));
  }

  private _decodePsd(bytes: Uint8Array): PsdImage | undefined {
    const psd = new PsdImage(bytes, this._maxPixels);
    return psd.decode() ? psd : undefined;
  }

  /**
   * Test if the given file is able to be decoded by this Decoder.
   * @param {Uint8Array} bytes - The raw file data.
   * @returns {boolean} True if the file is valid, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    try {
      const image = new PsdImage(bytes);
      return image.isValid;
    } catch (_) {
      return false;
    }
  }

  /**
   * Start decoding the data as an animation sequence.
   * @param {Uint8Array} bytes - The raw file data.
   * @returns {PsdImage | undefined} The PSD image information.
   */
  public startDecode(bytes: Uint8Array): PsdImage | undefined {
    return guardDecode(() => this._startDecode(bytes));
  }

  private _startDecode(bytes: Uint8Array): PsdImage | undefined {
    this._info = new PsdImage(bytes, this._maxPixels);
    return this._info;
  }

  /**
   * Decode the file and extract a single image from it.
   * @param {DecoderDecodeOptions} opt - The decode options.
   * @param {Uint8Array} opt.bytes - The raw file data.
   * @param {number} [opt.frameIndex] - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded image.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    return guardDecode(() => this._decode(opt));
  }

  private _decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
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
   * Decode a single frame from the data set with startDecode.
   * @param {number} _frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded frame.
   */
  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    return guardDecode(() => this._decodeFrame(_frameIndex));
  }

  private _decodeFrame(_frameIndex: number): MemoryImage | undefined {
    return this._info?.decodeImage();
  }
}
