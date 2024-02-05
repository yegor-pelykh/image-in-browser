/** @format */

import { deflate } from 'uzip';
import { Crc32 } from '../common/crc32';
import { OutputBuffer } from '../common/output-buffer';
import { StringUtils } from '../common/string-utils';
import { CompressionLevel } from '../common/typings';
import { Encoder, EncoderEncodeOptions } from './encoder';
import { Quantizer } from '../image/quantizer';
import { PngFilterType } from './png/png-filter-type';
import { MemoryImage } from '../image/image';
import { Format } from '../color/format';
import { NeuralQuantizer } from '../image/neural-quantizer';
import { PngColorType } from './png/png-color-type';
import { Palette } from '../image/palette';
import { IccProfile } from '../image/icc-profile';

export interface PngEncoderInitOptions {
  filter?: PngFilterType;
  level?: CompressionLevel;
}

/**
 * Encode an image to the PNG format.
 */
export class PngEncoder implements Encoder {
  private _globalQuantizer: Quantizer | undefined;

  private _filter: PngFilterType;

  private _level: number;

  private _repeat = 0;

  private _frames = 0;

  private _sequenceNumber = 0;

  private _isAnimated = false;

  private _output: OutputBuffer | undefined;

  /**
   * Does this encoder support animation?
   */
  private _supportsAnimation = true;
  public get supportsAnimation() {
    return this._supportsAnimation;
  }

  constructor(opt?: PngEncoderInitOptions) {
    this._filter = opt?.filter ?? PngFilterType.paeth;
    this._level = opt?.level ?? 6;
  }

  /**
   * Return the CRC of the bytes
   */
  private static crc(type: string, bytes: Uint8Array): number {
    const typeCodeUnits = StringUtils.getCodePoints(type);
    const crc = Crc32.getChecksum({
      buffer: typeCodeUnits,
    });
    return Crc32.getChecksum({
      buffer: bytes,
      baseCrc: crc,
    });
  }

  private static writeChunk(
    out: OutputBuffer,
    type: string,
    chunk: Uint8Array
  ): void {
    out.writeUint32(chunk.length);
    const typeCodeUnits = StringUtils.getCodePoints(type);
    out.writeBytes(typeCodeUnits);
    out.writeBytes(chunk);
    const crc = PngEncoder.crc(type, chunk);
    out.writeUint32(crc);
  }

  private static write(
    bpc: number,
    row: Uint8Array,
    ri: number,
    out: Uint8Array,
    oi: number
  ): number {
    let _bpc = bpc;
    let _oi = oi;
    _bpc--;
    while (_bpc >= 0) {
      out[_oi++] = row[ri + _bpc];
      _bpc--;
    }
    return _oi;
  }

  private static filterSub(
    row: Uint8Array,
    bpc: number,
    bpp: number,
    out: Uint8Array,
    oi: number
  ): number {
    let _oi = oi;
    out[_oi++] = PngFilterType.sub;
    for (let x = 0; x < bpp; x += bpc) {
      _oi = PngEncoder.write(bpc, row, x, out, _oi);
    }
    const l = row.length;
    for (let x = bpp; x < l; x += bpc) {
      for (let c = 0, c2 = bpc - 1; c < bpc; ++c, --c2) {
        out[_oi++] = (row[x + c2] - row[x + c2 - bpp]) & 0xff;
      }
    }
    return _oi;
  }

  private static filterUp(
    row: Uint8Array,
    bpc: number,
    out: Uint8Array,
    oi: number,
    prevRow?: Uint8Array
  ): number {
    let _oi = oi;
    out[_oi++] = PngFilterType.up;
    const l = row.length;
    for (let x = 0; x < l; x += bpc) {
      for (let c = 0, c2 = bpc - 1; c < bpc; ++c, --c2) {
        const b = prevRow !== undefined ? prevRow[x + c2] : 0;
        out[_oi++] = (row[x + c2] - b) & 0xff;
      }
    }
    return _oi;
  }

  private static filterAverage(
    row: Uint8Array,
    bpc: number,
    bpp: number,
    out: Uint8Array,
    oi: number,
    prevRow?: Uint8Array
  ): number {
    let _oi = oi;
    out[_oi++] = PngFilterType.average;
    const l = row.length;
    for (let x = 0; x < l; x += bpc) {
      for (let c = 0, c2 = bpc - 1; c < bpc; ++c, --c2) {
        const x2 = x + c2;
        const p1 = x2 < bpp ? 0 : row[x2 - bpp];
        const p2 = prevRow === undefined ? 0 : prevRow[x2];
        const p3 = row[x2];
        out[_oi++] = p3 - ((p1 + p2) >>> 1);
      }
    }
    return _oi;
  }

  private static paethPredictor(a: number, b: number, c: number): number {
    const p = a + b - c;
    const pa = p > a ? p - a : a - p;
    const pb = p > b ? p - b : b - p;
    const pc = p > c ? p - c : c - p;
    if (pa <= pb && pa <= pc) {
      return a;
    } else if (pb <= pc) {
      return b;
    }
    return c;
  }

  private static filterPaeth(
    row: Uint8Array,
    bpc: number,
    bpp: number,
    out: Uint8Array,
    oi: number,
    prevRow?: Uint8Array
  ): number {
    let _oi = oi;
    out[_oi++] = PngFilterType.paeth;
    const l = row.length;
    for (let x = 0; x < l; x += bpc) {
      for (let c = 0, c2 = bpc - 1; c < bpc; ++c, --c2) {
        const x2 = x + c2;
        const p0 = x2 < bpp ? 0 : row[x2 - bpp];
        const p1 = prevRow === undefined ? 0 : prevRow[x2];
        const p2 = x2 < bpp || prevRow === undefined ? 0 : prevRow[x2 - bpp];
        const p = row[x2];
        const pi = PngEncoder.paethPredictor(p0, p1, p2);
        out[_oi++] = (p - pi) & 0xff;
      }
    }
    return _oi;
  }

  private static filterNone(
    rowBytes: Uint8Array,
    bpc: number,
    out: Uint8Array,
    oi: number
  ): number {
    let _oi = oi;
    out[_oi++] = PngFilterType.none;
    if (bpc === 1) {
      const l = rowBytes.length;
      for (let i = 0; i < l; ++i) {
        out[_oi++] = rowBytes[i];
      }
    } else {
      const l = rowBytes.length;
      for (let i = 0; i < l; i += bpc) {
        _oi = PngEncoder.write(bpc, rowBytes, i, out, _oi);
      }
    }
    return _oi;
  }

  private static numChannels(image: MemoryImage): number {
    return image.hasPalette ? 1 : image.numChannels;
  }

  private writeHeader(image: MemoryImage): void {
    // PNG file signature
    this._output!.writeBytes(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );

    // IHDR chunk
    const chunk = new OutputBuffer({
      bigEndian: true,
    });

    // width
    chunk.writeUint32(image.width);
    // height
    chunk.writeUint32(image.height);
    // bit depth
    chunk.writeByte(image.bitsPerChannel);
    chunk.writeByte(
      image.hasPalette
        ? PngColorType.indexed
        : image.numChannels === 1
          ? PngColorType.grayscale
          : image.numChannels === 2
            ? PngColorType.grayscaleAlpha
            : image.numChannels === 3
              ? PngColorType.rgb
              : PngColorType.rgba
    );
    // compression method: 0:deflate
    chunk.writeByte(0);
    // filter method: 0:adaptive
    chunk.writeByte(0);
    // interlace method: 0:no interlace
    chunk.writeByte(0);
    PngEncoder.writeChunk(this._output!, 'IHDR', chunk.getBytes());
  }

  private writeICCPChunk(iccp: IccProfile): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });

    // name
    const nameCodeUnits = StringUtils.getCodePoints(iccp.name);
    chunk.writeBytes(nameCodeUnits);
    chunk.writeByte(0);

    // compression (0 - deflate)
    chunk.writeByte(0);

    // profile data
    chunk.writeBytes(iccp.compressed());

    PngEncoder.writeChunk(this._output!, 'iCCP', chunk.getBytes());
  }

  private writeAnimationControlChunk(): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    // Number of frames
    chunk.writeUint32(this._frames);
    // Loop count
    chunk.writeUint32(this._repeat);
    PngEncoder.writeChunk(this._output!, 'acTL', chunk.getBytes());
  }

  private writeFrameControlChunk(image: MemoryImage): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });

    chunk.writeUint32(this._sequenceNumber);
    chunk.writeUint32(image.width);
    chunk.writeUint32(image.height);
    // xOffset
    chunk.writeUint32(0);
    // yOffset
    chunk.writeUint32(0);
    chunk.writeUint16(image.frameDuration);
    // delay denominator
    chunk.writeUint16(1000);
    // dispose method 0: APNG_DISPOSE_OP_NONE
    chunk.writeByte(1);
    // blend method 0: APNG_BLEND_OP_SOURCE
    chunk.writeByte(0);
    PngEncoder.writeChunk(this._output!, 'fcTL', chunk.getBytes());
  }

  private writePalette(palette: Palette): void {
    if (
      palette.format === Format.uint8 &&
      palette.numChannels === 3 &&
      palette.numColors === 256
    ) {
      PngEncoder.writeChunk(this._output!, 'PLTE', palette.toUint8Array());
    } else {
      const chunk = new OutputBuffer({
        size: palette.numColors * 3,
        bigEndian: true,
      });
      const nc = palette.numColors;
      for (let i = 0; i < nc; ++i) {
        chunk.writeByte(Math.trunc(palette.getRed(i)));
        chunk.writeByte(Math.trunc(palette.getGreen(i)));
        chunk.writeByte(Math.trunc(palette.getBlue(i)));
      }
      PngEncoder.writeChunk(this._output!, 'PLTE', chunk.getBytes());
    }

    if (palette.numChannels === 4) {
      const chunk = new OutputBuffer({
        size: palette.numColors,
        bigEndian: true,
      });
      const nc = palette.numColors;
      for (let i = 0; i < nc; ++i) {
        const a = Math.trunc(palette.getAlpha(i));
        chunk.writeByte(a);
      }
      PngEncoder.writeChunk(this._output!, 'tRNS', chunk.getBytes());
    }
  }

  private writeTextChunk(keyword: string, text: string): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    const keywordBytes = StringUtils.getCodePoints(keyword);
    const textBytes = StringUtils.getCodePoints(text);
    chunk.writeBytes(keywordBytes);
    chunk.writeByte(0);
    chunk.writeBytes(textBytes);
    PngEncoder.writeChunk(this._output!, 'tEXt', chunk.getBytes());
  }

  private filter(image: MemoryImage, out: Uint8Array): void {
    let oi = 0;
    const filter = image.hasPalette ? PngFilterType.none : this._filter;
    const buffer = image.buffer;
    const rowStride = image.data!.rowStride;
    const nc = PngEncoder.numChannels(image);
    const bpp = (nc * image.bitsPerChannel + 7) >>> 3;
    const bpc = (image.bitsPerChannel + 7) >>> 3;

    let rowOffset = 0;
    let prevRow: Uint8Array | undefined = undefined;
    for (let y = 0; y < image.height; ++y) {
      const rowBytes =
        buffer !== undefined
          ? new Uint8Array(buffer, rowOffset, rowStride)
          : new Uint8Array();
      rowOffset += rowStride;

      switch (filter) {
        case PngFilterType.sub:
          oi = PngEncoder.filterSub(rowBytes, bpc, bpp, out, oi);
          break;
        case PngFilterType.up:
          oi = PngEncoder.filterUp(rowBytes, bpc, out, oi, prevRow);
          break;
        case PngFilterType.average:
          oi = PngEncoder.filterAverage(rowBytes, bpc, bpp, out, oi, prevRow);
          break;
        case PngFilterType.paeth:
          oi = PngEncoder.filterPaeth(rowBytes, bpc, bpp, out, oi, prevRow);
          break;
        default:
          oi = PngEncoder.filterNone(rowBytes, bpc, out, oi);
          break;
      }
      prevRow = rowBytes;
    }
  }

  public addFrame(image: MemoryImage): void {
    let _image = image;
    // PNG can't encode HDR formats, and can only encode formats with fewer
    // than 8 bits if they have a palette. In the case of incompatible
    // formats, convert them to uint8.
    if (
      (_image.isHdrFormat && _image.format !== Format.uint16) ||
      (_image.bitsPerChannel < 8 &&
        !_image.hasPalette &&
        _image.numChannels > 1)
    ) {
      _image = _image.convert({
        format: Format.uint8,
      });
    }

    if (this._output === undefined) {
      this._output = new OutputBuffer({
        bigEndian: true,
      });

      this.writeHeader(_image);

      if (_image.iccProfile !== undefined) {
        this.writeICCPChunk(_image.iccProfile);
      }

      if (_image.hasPalette) {
        if (this._globalQuantizer !== undefined) {
          this.writePalette(this._globalQuantizer!.palette);
        } else {
          this.writePalette(_image.palette!);
        }
      }

      if (this._isAnimated) {
        this.writeAnimationControlChunk();
      }
    }

    const nc = PngEncoder.numChannels(_image);

    const channelBytes = _image.format === Format.uint16 ? 2 : 1;

    // Include room for the filter bytes (1 byte per row).
    const filteredImage = new Uint8Array(
      _image.width * _image.height * nc * channelBytes + image.height
    );

    this.filter(_image, filteredImage);

    const compressed = deflate(filteredImage, {
      level: this._level,
    });

    if (_image.textData !== undefined) {
      for (const [key, value] of _image.textData) {
        this.writeTextChunk(key, value);
      }
    }

    if (this._isAnimated) {
      this.writeFrameControlChunk(_image);
      this._sequenceNumber++;
    }

    if (this._sequenceNumber <= 1) {
      PngEncoder.writeChunk(this._output, 'IDAT', compressed);
    } else {
      // fdAT chunk
      const fdat = new OutputBuffer({
        bigEndian: true,
      });
      fdat.writeUint32(this._sequenceNumber);
      fdat.writeBytes(compressed);
      PngEncoder.writeChunk(this._output, 'fdAT', fdat.getBytes());

      this._sequenceNumber++;
    }
  }

  /**
   * Start encoding a PNG.
   *
   * Call this method once before calling **addFrame**.
   */
  public start(frameCount: number): void {
    this._frames = frameCount;
    this._isAnimated = frameCount > 1;
  }

  /**
   * Finish encoding a PNG, and return the resulting bytes.
   *
   * Call this method to finalize the encoding, after all **addFrame** calls.
   */
  public finish(): Uint8Array | undefined {
    let bytes: Uint8Array | undefined = undefined;
    if (this._output === undefined) {
      return bytes;
    }

    PngEncoder.writeChunk(this._output, 'IEND', new Uint8Array());

    this._sequenceNumber = 0;

    bytes = this._output.getBytes();
    this._output = undefined;
    return bytes;
  }

  /**
   * Encode **image** to the PNG format.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    const image = opt.image;
    const singleFrame = opt.singleFrame ?? false;

    if (!image.hasAnimation || singleFrame) {
      this.start(1);
      this.addFrame(image);
    } else {
      this.start(image.frames.length);
      this._repeat = image.loopCount;

      if (image.hasPalette) {
        const q = new NeuralQuantizer(image);
        this._globalQuantizer = q;
        for (const frame of image.frames) {
          if (frame !== image) {
            q.addImage(frame);
          }
        }
      }

      for (const frame of image.frames) {
        if (this._globalQuantizer !== undefined) {
          const newImage = this._globalQuantizer.getIndexImage(frame);
          this.addFrame(newImage);
        } else {
          this.addFrame(frame);
        }
      }
    }
    return this.finish()!;
  }
}
