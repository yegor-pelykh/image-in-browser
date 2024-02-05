/** @format */

import { Format } from '../color/format';
import { InputBuffer } from '../common/input-buffer';
import { MemoryImage } from '../image/image';
import { BmpFileHeader } from './bmp/bmp-file-header';
import { BmpInfo } from './bmp/bmp-info';
import { Decoder, DecoderDecodeOptions } from './decoder';

export class BmpDecoder implements Decoder {
  protected _input?: InputBuffer<Uint8Array>;
  protected _info?: BmpInfo;
  protected _forceRgba: boolean;

  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  constructor(forceRgba = false) {
    this._forceRgba = forceRgba;
  }

  /**
   * Is the given file a valid BMP image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return BmpFileHeader.isValidFile(
      new InputBuffer<Uint8Array>({
        buffer: bytes,
      })
    );
  }

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
   * Decode a single frame.
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
   * Decode the file and extract a single image from it. If the file is
   * animated, the specified **frameIndex** will be decoded. If there was a problem
   * decoding the file, undefined is returned.
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
