/** @format */

import { Format } from '../color/format.js';
import { InputBuffer } from '../common/input-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { Decoder, DecoderDecodeOptions, defaultMaxPixels } from './decoder.js';
import { guardDecode } from './guard-decode.js';
import { ImageFormat } from './image-format.js';
import { checkPixels } from './max-pixels.js';
import { PnmFormat } from './pnm/pnm-format.js';
import { PnmInfo } from './pnm/pnm-info.js';

/**
 * Decode a PNM image.
 */
export class PnmDecoder implements Decoder {
  /**
   * Input buffer for the PNM decoder.
   */
  private _input?: InputBuffer<Uint8Array>;

  /**
   * Gets the input buffer.
   * @returns {InputBuffer<Uint8Array> | undefined} The input buffer or undefined if not set.
   */
  public get input(): InputBuffer<Uint8Array> | undefined {
    return this._input;
  }

  /**
   * Information about the PNM image.
   */
  private _info?: PnmInfo;

  /**
   * Gets the PNM image information.
   * @returns {PnmInfo | undefined} The PNM image information or undefined if not set.
   */
  public get info(): PnmInfo | undefined {
    return this._info;
  }

  /**
   * Gets the image format.
   * @returns {ImageFormat} The image format.
   */
  get format(): ImageFormat {
    return ImageFormat.pnm;
  }

  /**
   * Gets the number of frames in the image.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._info !== undefined ? 1 : 0;
  }

  /**
   * Tokens for parsing the PNM image.
   */
  private _tokens: string[] = [];

  /**
   * The maximum number of pixels (width * height) of the image. Larger
   * images throw a {@link LibError}. A value <= 0 disables the limit.
   */
  private readonly _maxPixels: number;

  /**
   * Gets the maximum number of pixels (width * height) of the image.
   */
  public get maxPixels(): number {
    return this._maxPixels;
  }

  /**
   * Create a PNM decoder.
   * @param {number} [maxPixels] - The maximum number of pixels (width * height)
   * to decode. If not given, {@link defaultMaxPixels} is used.
   */
  constructor(maxPixels?: number) {
    this._maxPixels = maxPixels ?? defaultMaxPixels;
  }

  /**
   * Gets the next token from the input buffer.
   * @returns {string} The next token as a string.
   */
  private getNextToken(): string {
    if (this._input === undefined) {
      return '';
    }
    if (this._tokens.length > 0) {
      return this._tokens.shift() as string;
    }
    let line = this._input.readStringLine().trim();
    if (line.length === 0) {
      return '';
    }
    while (line.startsWith('#')) {
      line = this._input.readStringLine(70).trim();
    }
    const tk = line.split(' ').filter((l) => l.length > 0);
    for (let i = 0; i < tk.length; ++i) {
      if (tk[i].startsWith('#')) {
        tk.length = i;
        break;
      }
    }
    this._tokens.push(...tk);
    return this._tokens.shift() ?? '';
  }

  /**
   * Parses the next integer from the input buffer.
   * @returns {number} The next integer.
   */
  private parseNextInt(): number {
    const tk = this.getNextToken();
    if (tk.length === 0) {
      return 0;
    }
    const res = parseInt(tk);
    return isNaN(res) ? 0 : res;
  }

  /**
   * Determines the format based on the maximum value.
   * @param {number} maxValue The maximum value.
   * @returns {Format} The format.
   */
  private formatFromMaxValue(maxValue: number): Format {
    if (maxValue > 255) {
      return Format.uint16;
    }
    if (maxValue > 15) {
      return Format.uint8;
    }
    if (maxValue > 3) {
      return Format.uint4;
    }
    if (maxValue > 1) {
      return Format.uint2;
    }
    return Format.uint1;
  }

  /**
   * Reads a value from the input buffer based on the format.
   * @param {PnmFormat} format The PNM format.
   * @param {number} _maxValue The maximum value.
   * @returns {number} The read value.
   */
  private readValue(format: PnmFormat, _maxValue: number): number {
    if (format === PnmFormat.pgm5 || format === PnmFormat.ppm6) {
      return this.input!.read();
    }
    return this.parseNextInt();
  }

  /**
   * Checks if the given file is a valid PNM image.
   * @param {Uint8Array} bytes The file bytes.
   * @returns {boolean} True if the file is a valid PNM image, otherwise false.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    this._input = new InputBuffer({
      buffer: bytes,
    });
    const tk = this.getNextToken();
    return (
      tk === 'P1' || tk === 'P2' || tk === 'P5' || tk === 'P3' || tk === 'P6'
    );
  }

  /**
   * Starts decoding the PNM image.
   * @param {Uint8Array} bytes The file bytes.
   * @returns {PnmInfo | undefined} The PNM image information or undefined if decoding fails.
   */
  public startDecode(bytes: Uint8Array): PnmInfo | undefined {
    return guardDecode(() => this._startDecode(bytes));
  }

  private _startDecode(bytes: Uint8Array): PnmInfo | undefined {
    this._input = new InputBuffer({
      buffer: bytes,
    });

    const tk = this.getNextToken();
    if (tk === 'P1') {
      this._info = new PnmInfo(PnmFormat.pbm);
    } else if (tk === 'P2') {
      this._info = new PnmInfo(PnmFormat.pgm2);
    } else if (tk === 'P5') {
      this._info = new PnmInfo(PnmFormat.pgm5);
    } else if (tk === 'P3') {
      this._info = new PnmInfo(PnmFormat.ppm3);
    } else if (tk === 'P6') {
      this._info = new PnmInfo(PnmFormat.ppm6);
    } else {
      this._input = undefined;
      return undefined;
    }

    this._info.width = this.parseNextInt();
    this._info.height = this.parseNextInt();

    if (this._info.width < 1 || this._info.height < 1) {
      this._input = undefined;
      this._info = undefined;
      return undefined;
    }
    checkPixels(this._info.width, this._info.height, this._maxPixels);

    return this._info;
  }

  /**
   * Decodes the PNM image.
   * @param {DecoderDecodeOptions} opt The decode options.
   * @param {Uint8Array} opt.bytes The file bytes.
   * @param {number} [opt.frameIndex] The frame index (optional).
   * @returns {MemoryImage | undefined} The decoded image or undefined if decoding fails.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    return guardDecode(() => this._decode(opt));
  }

  private _decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    if (this.startDecode(opt.bytes) === undefined) {
      return undefined;
    }
    return this.decodeFrame(opt.frameIndex ?? 0);
  }

  /**
   * Decodes a specific frame of the PNM image.
   * @param {number} _frameIndex The frame index.
   * @returns {MemoryImage | undefined} The decoded image or undefined if decoding fails.
   */
  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    return guardDecode(() => this._decodeFrame(_frameIndex));
  }

  private _decodeFrame(_frameIndex: number): MemoryImage | undefined {
    if (this._info === undefined) {
      return undefined;
    }

    if (this._info.format === PnmFormat.pbm) {
      this.checkLength(1);
      const image = new MemoryImage({
        width: this._info.width,
        height: this._info.height,
        numChannels: 1,
        format: Format.uint1,
      });
      for (const p of image) {
        const tk = this.getNextToken();
        if (tk === '1') {
          p.setRgb(1, 1, 1);
        } else {
          p.setRgb(0, 0, 0);
        }
      }
      return image;
    } else if (
      this._info.format === PnmFormat.pgm2 ||
      this._info.format === PnmFormat.pgm5
    ) {
      const maxValue = this.parseNextInt();
      if (maxValue === 0) {
        return undefined;
      }
      this.checkLength(1);
      const image = new MemoryImage({
        width: this._info.width,
        height: this._info.height,
        numChannels: 1,
        format: this.formatFromMaxValue(maxValue),
      });
      for (const p of image) {
        const g = this.readValue(this._info.format, maxValue);
        p.setRgb(g, g, g);
      }
      return image;
    } else if (
      this._info.format === PnmFormat.ppm3 ||
      this._info.format === PnmFormat.ppm6
    ) {
      const maxValue = this.parseNextInt();
      if (maxValue === 0) {
        return undefined;
      }
      this.checkLength(3);
      const image = new MemoryImage({
        width: this._info.width,
        height: this._info.height,
        format: this.formatFromMaxValue(maxValue),
      });
      for (const p of image) {
        const r = this.readValue(this._info.format, maxValue);
        const g = this.readValue(this._info.format, maxValue);
        const b = this.readValue(this._info.format, maxValue);
        p.setRgb(r, g, b);
      }
      return image;
    }

    return undefined;
  }

  // Every value takes at least a byte, so less data than values is truncated.
  private checkLength(numChannels: number): void {
    const values = this._info!.width * this._info!.height * numChannels;
    if (this._input!.length + this._tokens.length < values) {
      throw new LibError('Truncated PNM data');
    }
  }
}
