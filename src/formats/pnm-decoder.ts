/** @format */

import { Format } from '../color/format.js';
import { InputBuffer } from '../common/input-buffer.js';
import { MemoryImage } from '../image/image.js';
import { DecodeInfo } from './decode-info.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { ImageFormat } from './image-format.js';
import { PnmFormat } from './pnm/pnm-format.js';
import { PnmInfo } from './pnm/pnm-info.js';

/**
 * Decode a PNM image.
 */
export class PnmDecoder implements Decoder {
  private _input?: InputBuffer<Uint8Array>;
  public get input(): InputBuffer<Uint8Array> | undefined {
    return this._input;
  }

  private _info?: PnmInfo;
  public get info(): PnmInfo | undefined {
    return this._info;
  }

  get format(): ImageFormat {
    return ImageFormat.pnm;
  }

  public get numFrames(): number {
    return this._info !== undefined ? 1 : 0;
  }

  private _tokens: string[] = [];

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

  private parseNextInt(): number {
    const tk = this.getNextToken();
    if (tk.length === 0) {
      return 0;
    }
    const res = parseInt(tk);
    return isNaN(res) ? 0 : res;
  }

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

  private readValue(format: PnmFormat, _maxValue: number): number {
    if (format === PnmFormat.pgm5 || format === PnmFormat.ppm6) {
      return this.input!.read();
    }
    return this.parseNextInt();
  }

  /**
   * Is the given file a valid PNM image?
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

  public startDecode(bytes: Uint8Array): PnmInfo | undefined {
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

    if (this._info.width === 0 || this._info.height === 0) {
      this._input = undefined;
      this._info = undefined;
      return undefined;
    }

    return this._info;
  }

  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    if (this.startDecode(opt.bytes) === undefined) {
      return undefined;
    }
    return this.decodeFrame(opt.frameIndex ?? 0);
  }

  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    if (this._info === undefined) {
      return undefined;
    }

    if (this._info.format === PnmFormat.pbm) {
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
}
