/** @format */

import { deflate } from 'uzip';
import { BlendMode } from '../common/blend-mode';
import { Color } from '../common/color';
import { Crc32 } from '../common/crc32';
import { DisposeMode } from '../common/dispose-mode';
import { FrameAnimation } from '../common/frame-animation';
import { ICCProfileData } from '../common/icc-profile-data';
import { MemoryImage } from '../common/memory-image';
import { OutputBuffer } from '../common/output-buffer';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { TextCodec } from '../common/text-codec';
import { CompressionLevel } from '../common/typings';
import { Encoder } from './encoder';

export interface PngEncoderInitOptions {
  filter?: number;
  level?: CompressionLevel;
}

/**
 * Encode an image to the PNG format.
 */
export class PngEncoder implements Encoder {
  private static readonly FILTER_NONE = 0;

  private static readonly FILTER_SUB = 1;

  private static readonly FILTER_UP = 2;

  private static readonly FILTER_AVERAGE = 3;

  private static readonly FILTER_PAETH = 4;

  private static readonly FILTER_AGRESSIVE = 5;

  private rgbChannelSet?: RgbChannelSet;

  private filter: number;

  private level: number;

  private repeat = 0;

  private xOffset = 0;

  private yOffset = 0;

  private delay?: number;

  private disposeMethod: DisposeMode = DisposeMode.none;

  private blendMethod: BlendMode = BlendMode.source;

  private width = 0;

  private height = 0;

  private frames = 0;

  private sequenceNumber = 0;

  private isAnimated = false;

  private output?: OutputBuffer;

  /**
   * Does this encoder support animation?
   */
  private _supportsAnimation = true;
  get supportsAnimation() {
    return this._supportsAnimation;
  }

  constructor(options?: PngEncoderInitOptions) {
    this.filter = options?.filter ?? PngEncoder.FILTER_PAETH;
    this.level = options?.level ?? 6;
  }

  /**
   * Return the CRC of the bytes
   */
  private static crc(type: string, bytes: Uint8Array): number {
    const typeCodeUnits = TextCodec.getCodePoints(type);
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
    const typeCodeUnits = TextCodec.getCodePoints(type);
    out.writeBytes(typeCodeUnits);
    out.writeBytes(chunk);
    const crc = PngEncoder.crc(type, chunk);
    out.writeUint32(crc);
  }

  private static filterSub(
    image: MemoryImage,
    oi: number,
    row: number,
    out: Uint8Array
  ): number {
    let oindex = oi;

    out[oindex++] = PngEncoder.FILTER_SUB;

    out[oindex++] = Color.getRed(image.getPixel(0, row));
    out[oindex++] = Color.getGreen(image.getPixel(0, row));
    out[oindex++] = Color.getBlue(image.getPixel(0, row));
    if (image.rgbChannelSet === RgbChannelSet.rgba) {
      out[oindex++] = Color.getAlpha(image.getPixel(0, row));
    }

    for (let x = 1; x < image.width; ++x) {
      const ar = Color.getRed(image.getPixel(x - 1, row));
      const ag = Color.getGreen(image.getPixel(x - 1, row));
      const ab = Color.getBlue(image.getPixel(x - 1, row));

      const r = Color.getRed(image.getPixel(x, row));
      const g = Color.getGreen(image.getPixel(x, row));
      const b = Color.getBlue(image.getPixel(x, row));

      out[oindex++] = (r - ar) & 0xff;
      out[oindex++] = (g - ag) & 0xff;
      out[oindex++] = (b - ab) & 0xff;
      if (image.rgbChannelSet === RgbChannelSet.rgba) {
        const aa = Color.getAlpha(image.getPixel(x - 1, row));
        const a = Color.getAlpha(image.getPixel(x, row));
        out[oindex++] = (a - aa) & 0xff;
      }
    }

    return oindex;
  }

  private static filterUp(
    image: MemoryImage,
    oi: number,
    row: number,
    out: Uint8Array
  ): number {
    let oindex = oi;

    out[oindex++] = PngEncoder.FILTER_UP;

    for (let x = 0; x < image.width; ++x) {
      const br = row === 0 ? 0 : Color.getRed(image.getPixel(x, row - 1));
      const bg = row === 0 ? 0 : Color.getGreen(image.getPixel(x, row - 1));
      const bb = row === 0 ? 0 : Color.getBlue(image.getPixel(x, row - 1));

      const xr = Color.getRed(image.getPixel(x, row));
      const xg = Color.getGreen(image.getPixel(x, row));
      const xb = Color.getBlue(image.getPixel(x, row));

      out[oindex++] = (xr - br) & 0xff;
      out[oindex++] = (xg - bg) & 0xff;
      out[oindex++] = (xb - bb) & 0xff;
      if (image.rgbChannelSet === RgbChannelSet.rgba) {
        const ba = row === 0 ? 0 : Color.getAlpha(image.getPixel(x, row - 1));
        const xa = Color.getAlpha(image.getPixel(x, row));
        out[oindex++] = (xa - ba) & 0xff;
      }
    }

    return oindex;
  }

  private static filterAverage(
    image: MemoryImage,
    oi: number,
    row: number,
    out: Uint8Array
  ): number {
    let oindex = oi;

    out[oindex++] = PngEncoder.FILTER_AVERAGE;

    for (let x = 0; x < image.width; ++x) {
      const ar = x === 0 ? 0 : Color.getRed(image.getPixel(x - 1, row));
      const ag = x === 0 ? 0 : Color.getGreen(image.getPixel(x - 1, row));
      const ab = x === 0 ? 0 : Color.getBlue(image.getPixel(x - 1, row));

      const br = row === 0 ? 0 : Color.getRed(image.getPixel(x, row - 1));
      const bg = row === 0 ? 0 : Color.getGreen(image.getPixel(x, row - 1));
      const bb = row === 0 ? 0 : Color.getBlue(image.getPixel(x, row - 1));

      const xr = Color.getRed(image.getPixel(x, row));
      const xg = Color.getGreen(image.getPixel(x, row));
      const xb = Color.getBlue(image.getPixel(x, row));

      out[oindex++] = (xr - ((ar + br) >> 1)) & 0xff;
      out[oindex++] = (xg - ((ag + bg) >> 1)) & 0xff;
      out[oindex++] = (xb - ((ab + bb) >> 1)) & 0xff;
      if (image.rgbChannelSet === RgbChannelSet.rgba) {
        const aa = x === 0 ? 0 : Color.getAlpha(image.getPixel(x - 1, row));
        const ba = row === 0 ? 0 : Color.getAlpha(image.getPixel(x, row - 1));
        const xa = Color.getAlpha(image.getPixel(x, row));
        out[oindex++] = (xa - ((aa + ba) >> 1)) & 0xff;
      }
    }

    return oindex;
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
    image: MemoryImage,
    oi: number,
    row: number,
    out: Uint8Array
  ): number {
    let oindex = oi;

    out[oindex++] = PngEncoder.FILTER_PAETH;
    for (let x = 0; x < image.width; ++x) {
      const ar = x === 0 ? 0 : Color.getRed(image.getPixel(x - 1, row));
      const ag = x === 0 ? 0 : Color.getGreen(image.getPixel(x - 1, row));
      const ab = x === 0 ? 0 : Color.getBlue(image.getPixel(x - 1, row));

      const br = row === 0 ? 0 : Color.getRed(image.getPixel(x, row - 1));
      const bg = row === 0 ? 0 : Color.getGreen(image.getPixel(x, row - 1));
      const bb = row === 0 ? 0 : Color.getBlue(image.getPixel(x, row - 1));

      const cr =
        row === 0 || x === 0 ? 0 : Color.getRed(image.getPixel(x - 1, row - 1));
      const cg =
        row === 0 || x === 0
          ? 0
          : Color.getGreen(image.getPixel(x - 1, row - 1));
      const cb =
        row === 0 || x === 0
          ? 0
          : Color.getBlue(image.getPixel(x - 1, row - 1));

      const xr = Color.getRed(image.getPixel(x, row));
      const xg = Color.getGreen(image.getPixel(x, row));
      const xb = Color.getBlue(image.getPixel(x, row));

      const pr = PngEncoder.paethPredictor(ar, br, cr);
      const pg = PngEncoder.paethPredictor(ag, bg, cg);
      const pb = PngEncoder.paethPredictor(ab, bb, cb);

      out[oindex++] = (xr - pr) & 0xff;
      out[oindex++] = (xg - pg) & 0xff;
      out[oindex++] = (xb - pb) & 0xff;
      if (image.rgbChannelSet === RgbChannelSet.rgba) {
        const aa = x === 0 ? 0 : Color.getAlpha(image.getPixel(x - 1, row));
        const ba = row === 0 ? 0 : Color.getAlpha(image.getPixel(x, row - 1));
        const ca =
          row === 0 || x === 0
            ? 0
            : Color.getAlpha(image.getPixel(x - 1, row - 1));
        const xa = Color.getAlpha(image.getPixel(x, row));
        const pa = PngEncoder.paethPredictor(aa, ba, ca);
        out[oindex++] = (xa - pa) & 0xff;
      }
    }

    return oindex;
  }

  private static filterNone(
    image: MemoryImage,
    oi: number,
    row: number,
    out: Uint8Array
  ): number {
    let oindex = oi;
    out[oindex++] = PngEncoder.FILTER_NONE;
    for (let x = 0; x < image.width; ++x) {
      const c = image.getPixel(x, row);
      out[oindex++] = Color.getRed(c);
      out[oindex++] = Color.getGreen(c);
      out[oindex++] = Color.getBlue(c);
      if (image.rgbChannelSet === RgbChannelSet.rgba) {
        out[oindex++] = Color.getAlpha(image.getPixel(x, row));
      }
    }
    return oindex;
  }

  private writeHeader(width: number, height: number): void {
    // PNG file signature
    this.output!.writeBytes(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );

    // IHDR chunk
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    chunk.writeUint32(width);
    chunk.writeUint32(height);
    chunk.writeByte(8);
    chunk.writeByte(this.rgbChannelSet === RgbChannelSet.rgb ? 2 : 6);
    // Compression method
    chunk.writeByte(0);
    // Filter method
    chunk.writeByte(0);
    // Interlace method
    chunk.writeByte(0);
    PngEncoder.writeChunk(this.output!, 'IHDR', chunk.getBytes());
  }

  private writeICCPChunk(_?: OutputBuffer, iccp?: ICCProfileData): void {
    if (iccp === undefined) {
      return;
    }

    const chunk = new OutputBuffer({
      bigEndian: true,
    });

    // Name
    const nameCodeUnits = TextCodec.getCodePoints(iccp.name);
    chunk.writeBytes(nameCodeUnits);
    chunk.writeByte(0);

    // Compression
    // 0 - deflate
    chunk.writeByte(0);

    // profile data
    chunk.writeBytes(iccp.compressed());

    PngEncoder.writeChunk(this.output!, 'iCCP', chunk.getBytes());
  }

  private writeAnimationControlChunk(): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    // Number of frames
    chunk.writeUint32(this.frames);
    // Loop count
    chunk.writeUint32(this.repeat);
    PngEncoder.writeChunk(this.output!, 'acTL', chunk.getBytes());
  }

  private applyFilter(image: MemoryImage, out: Uint8Array): void {
    let oi = 0;
    for (let y = 0; y < image.height; ++y) {
      switch (this.filter) {
        case PngEncoder.FILTER_SUB:
          oi = PngEncoder.filterSub(image, oi, y, out);
          break;
        case PngEncoder.FILTER_UP:
          oi = PngEncoder.filterUp(image, oi, y, out);
          break;
        case PngEncoder.FILTER_AVERAGE:
          oi = PngEncoder.filterAverage(image, oi, y, out);
          break;
        case PngEncoder.FILTER_PAETH:
          oi = PngEncoder.filterPaeth(image, oi, y, out);
          break;
        case PngEncoder.FILTER_AGRESSIVE:
          // TODO Apply all five filters and select the filter that produces
          // the smallest sum of absolute values per row.
          oi = PngEncoder.filterPaeth(image, oi, y, out);
          break;
        default:
          oi = PngEncoder.filterNone(image, oi, y, out);
          break;
      }
    }
  }

  private writeFrameControlChunk(): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    chunk.writeUint32(this.sequenceNumber);
    chunk.writeUint32(this.width);
    chunk.writeUint32(this.height);
    chunk.writeUint32(this.xOffset);
    chunk.writeUint32(this.yOffset);
    chunk.writeUint16(this.delay!);
    // Delay denominator
    chunk.writeUint16(1000);
    chunk.writeByte(this.disposeMethod);
    chunk.writeByte(this.blendMethod);
    PngEncoder.writeChunk(this.output!, 'fcTL', chunk.getBytes());
  }

  private writeTextChunk(keyword: string, text: string): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    const keywordBytes = TextCodec.getCodePoints(keyword);
    const textBytes = TextCodec.getCodePoints(text);
    chunk.writeBytes(keywordBytes);
    chunk.writeByte(0);
    chunk.writeBytes(textBytes);
    PngEncoder.writeChunk(this.output!, 'tEXt', chunk.getBytes());
  }

  public addFrame(image: MemoryImage): void {
    this.xOffset = image.xOffset;
    this.yOffset = image.xOffset;
    this.delay = image.duration;
    this.disposeMethod = image.disposeMethod;
    this.blendMethod = image.blendMethod;

    if (this.output === undefined) {
      this.output = new OutputBuffer({
        bigEndian: true,
      });

      this.rgbChannelSet = image.rgbChannelSet;
      this.width = image.width;
      this.height = image.height;

      this.writeHeader(this.width, this.height);

      this.writeICCPChunk(this.output, image.iccProfile);

      if (this.isAnimated) {
        this.writeAnimationControlChunk();
      }
    }

    // Include room for the filter bytes (1 byte per row).
    const filteredImage = new Uint8Array(
      image.width * image.height * image.numberOfChannels + image.height
    );

    this.applyFilter(image, filteredImage);

    const compressed = deflate(filteredImage, {
      level: this.level,
    });

    if (image.textData !== undefined) {
      for (const [key, value] of image.textData) {
        this.writeTextChunk(key, value);
      }
    }

    if (this.isAnimated) {
      this.writeFrameControlChunk();
      this.sequenceNumber++;
    }

    if (this.sequenceNumber <= 1) {
      PngEncoder.writeChunk(this.output!, 'IDAT', compressed);
    } else {
      // FdAT chunk
      const fdat = new OutputBuffer({
        bigEndian: true,
      });
      fdat.writeUint32(this.sequenceNumber);
      fdat.writeBytes(compressed);
      PngEncoder.writeChunk(this.output!, 'fdAT', fdat.getBytes());

      this.sequenceNumber++;
    }
  }

  public finish(): Uint8Array | undefined {
    let bytes: Uint8Array | undefined = undefined;
    if (this.output === undefined) {
      return bytes;
    }

    PngEncoder.writeChunk(this.output, 'IEND', new Uint8Array());

    this.sequenceNumber = 0;

    bytes = this.output.getBytes();
    this.output = undefined;
    return bytes;
  }

  /**
   * Encode a single frame image.
   */
  encodeImage(image: MemoryImage): Uint8Array {
    this.isAnimated = false;
    this.addFrame(image);
    return this.finish()!;
  }

  /**
   * Encode an animation.
   */
  public encodeAnimation(animation: FrameAnimation): Uint8Array | undefined {
    this.isAnimated = true;
    this.frames = animation.frames.length;
    this.repeat = animation.loopCount;

    for (const f of animation) {
      this.addFrame(f);
    }
    return this.finish();
  }
}
