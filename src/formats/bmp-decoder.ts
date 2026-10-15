/** @format */

import { Format } from '../color/format.js';
import { InputBuffer } from '../common/input-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { BmpFileHeader } from './bmp/bmp-file-header.js';
import { BmpInfo } from './bmp/bmp-info.js';
import { Decoder, DecoderDecodeOptions, defaultMaxPixels } from './decoder.js';
import { guardDecode } from './guard-decode.js';
import { ImageFormat } from './image-format.js';
import { checkPixels } from './max-pixels.js';

/**
 * Class representing a BMP decoder.
 */
export class BmpDecoder implements Decoder {
  /**
   * Input buffer for the BMP data.
   */
  protected _input?: InputBuffer<Uint8Array>;

  /**
   * Information about the BMP file.
   */
  protected _info?: BmpInfo;

  /**
   * Flag to force RGBA format.
   */
  protected _forceRgba: boolean;

  /**
   * The maximum number of pixels (width * height) of the image. Larger
   * images throw a {@link LibError}. A value <= 0 disables the limit.
   */
  protected readonly _maxPixels: number;

  /**
   * Gets the maximum number of pixels (width * height) of the image.
   */
  public get maxPixels(): number {
    return this._maxPixels;
  }

  /**
   * Get the image format.
   * @returns {ImageFormat} The image format.
   */
  get format(): ImageFormat {
    return ImageFormat.bmp;
  }

  /**
   * Get the number of frames in the BMP image.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  /**
   * Create a BMP decoder.
   * @param {boolean} [forceRgba=false] - Flag to force RGBA format.
   * @param {number} [maxPixels] - The maximum number of pixels (width * height)
   * to decode. If not given, {@link defaultMaxPixels} is used.
   */
  constructor(forceRgba = false, maxPixels?: number) {
    this._forceRgba = forceRgba;
    this._maxPixels = maxPixels ?? defaultMaxPixels;
  }

  /**
   * Check if the given file is a valid BMP image.
   * @param {Uint8Array} bytes - The file bytes.
   * @returns {boolean} True if the file is a valid BMP image, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const fileHeader = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    if (!BmpFileHeader.isValidFile(fileHeader)) {
      return false;
    }
    const dibHeaderSize = new InputBuffer<Uint8Array>({
      buffer: bytes,
      offset: 14,
    }).readUint32();
    if (dibHeaderSize < 12 || dibHeaderSize > 124) {
      return false;
    }
    return true;
  }

  /**
   * Start decoding the BMP file.
   * @param {Uint8Array} bytes - The file bytes.
   * @returns {BmpInfo | undefined} The BMP information or undefined if invalid.
   */
  public startDecode(bytes: Uint8Array): BmpInfo | undefined {
    return guardDecode(() => this._startDecode(bytes));
  }

  private _startDecode(bytes: Uint8Array): BmpInfo | undefined {
    if (!this.isValidFile(bytes)) {
      return undefined;
    }
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    this._info = new BmpInfo(this._input);
    return this._info;
  }

  /**
   * Decode a single frame from the BMP file.
   * @param {number} _frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded image or undefined if there was an error.
   */
  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    return guardDecode(() => this._decodeFrame(_frameIndex));
  }

  private _decodeFrame(_frameIndex: number): MemoryImage | undefined {
    if (this._input === undefined || this._info === undefined) {
      return undefined;
    }

    const inf = this._info;
    this._input.offset = inf.header.imageOffset;

    checkPixels(inf.width, inf.height, this._maxPixels);
    const bpp = inf.bitsPerPixel;
    const rowStride = Math.trunc((inf.width * bpp + 31) / 32) * 4;
    if (rowStride * inf.height > this._input.length) {
      throw new LibError('Truncated BMP data');
    }
    const nc = this._forceRgba
      ? 4
      : bpp === 1 || bpp === 4 || bpp === 8
        ? 1
        : bpp === 32
          ? 4
          : 3;
    const format = this._forceRgba
      ? Format.uint8
      : bpp === 1
        ? Format.uint1
        : bpp === 2
          ? Format.uint2
          : bpp === 4
            ? Format.uint4
            : bpp === 8
              ? Format.uint8
              : bpp === 16
                ? Format.uint8
                : bpp === 24
                  ? Format.uint8
                  : bpp === 32
                    ? Format.uint8
                    : Format.uint8;
    const palette = this._forceRgba ? undefined : inf.palette;

    const image = new MemoryImage({
      width: inf.width,
      height: inf.height,
      format: format,
      numChannels: nc,
      palette: palette,
    });

    for (let y = image.height - 1; y >= 0; --y) {
      const line = inf.readBottomUp ? y : image.height - 1 - y;
      const row = this._input.readRange(rowStride);
      const w = image.width;
      let x = 0;
      const p = image.getPixel(0, line);
      while (x < w) {
        inf.decodePixel(row, (r, g, b, a) => {
          if (x < w) {
            if (this._forceRgba && inf.palette !== undefined) {
              const pi = Math.trunc(r);
              const pr = inf.palette.getRed(pi);
              const pg = inf.palette.getGreen(pi);
              const pb = inf.palette.getBlue(pi);
              const pa = inf.palette.getAlpha(pi);
              p.setRgba(pr, pg, pb, pa);
            } else {
              p.setRgba(r, g, b, a);
            }
            p.next();
            x++;
          }
        });
      }
    }

    return image;
  }

  /**
   * Decode the BMP file and extract a single image from it.
   * If the file is animated, the specified frameIndex will be decoded.
   * @param {DecoderDecodeOptions} opt - The decode options.
   * @param {Uint8Array} opt.bytes - The file bytes.
   * @param {number} [opt.frameIndex=0] - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded image or undefined if there was an error.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    return guardDecode(() => this._decode(opt));
  }

  private _decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;
    const frameIndex = opt.frameIndex ?? 0;

    const info = this.startDecode(bytes);
    if (info === undefined || info.width < 1 || info.height < 1) {
      return undefined;
    }
    return this.decodeFrame(frameIndex);
  }
}
