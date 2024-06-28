/** @format */

import { Format } from '../color/format.js';
import { InputBuffer } from '../common/input-buffer.js';
import { MemoryImage } from '../image/image.js';
import { BmpFileHeader } from './bmp/bmp-file-header.js';
import { BmpInfo } from './bmp/bmp-info.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { ImageFormat } from './image-format.js';

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
   */
  constructor(forceRgba = false) {
    this._forceRgba = forceRgba;
  }

  /**
   * Check if the given file is a valid BMP image.
   * @param {Uint8Array} bytes - The file bytes.
   * @returns {boolean} True if the file is a valid BMP image, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return BmpFileHeader.isValidFile(
      new InputBuffer<Uint8Array>({
        buffer: bytes,
      })
    );
  }

  /**
   * Start decoding the BMP file.
   * @param {Uint8Array} bytes - The file bytes.
   * @returns {BmpInfo | undefined} The BMP information or undefined if invalid.
   */
  public startDecode(bytes: Uint8Array): BmpInfo | undefined {
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
    if (this._input === undefined || this._info === undefined) {
      return undefined;
    }

    const inf = this._info;
    this._input.offset = inf.header.imageOffset;

    const bpp = inf.bitsPerPixel;
    const rowStride = Math.trunc((inf.width * bpp + 31) / 32) * 4;
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
              const pr = inf.palette!.getRed(pi);
              const pg = inf.palette!.getGreen(pi);
              const pb = inf.palette!.getBlue(pi);
              const pa = inf.palette!.getAlpha(pi);
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
    const bytes = opt.bytes;
    const frameIndex = opt.frameIndex ?? 0;

    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }
    return this.decodeFrame(frameIndex);
  }
}
