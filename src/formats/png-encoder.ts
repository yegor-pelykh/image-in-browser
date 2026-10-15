/** @format */

import { deflate } from '../packer/packer.js';
import { Crc32 } from '../common/crc32.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { StringUtils } from '../common/string-utils.js';
import { CompressionLevel } from '../common/typings.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';
import { checkEncode } from './check-encode.js';
import { Quantizer } from '../image/quantizer.js';
import { PngFilterType } from './png/png-filter-type.js';
import { MemoryImage } from '../image/image.js';
import { Format } from '../color/format.js';
import { NeuralQuantizer } from '../image/neural-quantizer.js';
import { PngColorType } from './png/png-color-type.js';
import { Palette } from '../image/palette.js';
import { IccProfile } from '../image/icc-profile.js';
import { PngPhysicalPixelDimensions } from './png/png-physical-pixel-dimensions.js';
import { PngCicpData } from './png/png-cicp-data.js';

/**
 * Options for initializing the PNG encoder.
 */
export interface PngEncoderInitOptions {
  /**
   * The filter type to use.
   */
  filter?: PngFilterType;
  /**
   * The compression level to use.
   */
  level?: CompressionLevel;
  /**
   * The physical pixel dimensions of the image.
   * This provides information about the intended display size of the image in physical units.
   */
  pixelDimensions?: PngPhysicalPixelDimensions;
  /**
   * CICP (Coding-independent code points) data to be embedded in the PNG file.
   */
  cicpData?: PngCicpData;
}

/**
 * Encode an image to the PNG format.
 */
export class PngEncoder implements Encoder {
  /**
   * Global quantizer for the encoder.
   */
  private _globalQuantizer: Quantizer | undefined;

  /**
   * Filter type for the encoder.
   */
  private _filter: PngFilterType;

  /**
   * Compression level for the encoder.
   */
  private _level: number;

  /**
   * Number of times to repeat the animation.
   */
  private _repeat = 0;

  /**
   * Number of frames in the animation.
   */
  private _frames = 0;

  /**
   * Sequence number for the animation frames.
   */
  private _sequenceNumber = 0;

  /**
   * Is the image animated?
   */
  private _isAnimated = false;

  /**
   * Output buffer for the encoded PNG.
   */
  private _output: OutputBuffer | undefined;

  private _supportsAnimation = true;

  /**
   * Checks if this encoder supports animation.
   */
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  /**
   * Physical pixel dimensions of the PNG.
   */
  private _pixelDimensions: PngPhysicalPixelDimensions | undefined;

  /**
   * Gets the physical pixel dimensions of the PNG.
   */
  public get pixelDimensions(): PngPhysicalPixelDimensions | undefined {
    return this._pixelDimensions;
  }

  /**
   * CICP (Coding-independent code points) data to be embedded in the PNG file.
   */
  private _cicpData: PngCicpData | undefined;

  /**
   * Gets the CICP (Coding-independent code points) data associated with the PNG encoder.
   */
  public get cicpData(): PngCicpData | undefined {
    return this._cicpData;
  }

  /**
   * Constructor for PngEncoder.
   * @param {PngEncoderInitOptions} [opt] - Initialization options for the encoder.
   * @param {PngFilterType} [opt.filter] - The filter type to use for encoding. Defaults to PngFilterType.paeth.
   * @param {number} [opt.level] - The compression level to use for encoding. Defaults to 6.
   * @param {PngPhysicalPixelDimensions} [opt.pixelDimensions] - The physical pixel dimensions of the image.
   * @param {PngCicpData} [opt.cicpData] - CICP data to embed in the PNG file.
   */
  constructor(opt?: PngEncoderInitOptions) {
    this._filter = opt?.filter ?? PngFilterType.paeth;
    this._level = opt?.level ?? 6;
    this._pixelDimensions = opt?.pixelDimensions;
    this._cicpData = opt?.cicpData;
  }

  /**
   * The most image data stored in each IDAT or fdAT chunk.
   */
  private static readonly maxDataChunkSize = 0x10000;

  /**
   * Return the CRC of the bytes.
   * @param {string} type - The type of the chunk.
   * @param {Uint8Array} bytes - The bytes of the chunk.
   * @returns {number} The CRC checksum.
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

  /**
   * Write a chunk to the output buffer.
   * @param {OutputBuffer} out - The output buffer.
   * @param {string} type - The type of the chunk.
   * @param {Uint8Array} chunk - The bytes of the chunk.
   */
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

  /**
   * Apply the sub filter to **row**, writing it to **out** after its filter
   * type byte.
   * @param {Uint8Array} row - The row of bytes.
   * @param {number} bpp - Bytes per pixel.
   * @param {Uint8Array} out - The output buffer.
   */
  private static filterSub(
    row: Uint8Array,
    bpp: number,
    out: Uint8Array
  ): void {
    const n = row.length;
    let oi = 1;
    for (let x = 0; x < bpp && x < n; ++x) {
      out[oi++] = row[x];
    }
    for (let x = bpp; x < n; ++x) {
      out[oi++] = row[x] - row[x - bpp];
    }
  }

  /**
   * Apply the up filter to **row**, writing it to **out** after its filter
   * type byte.
   * @param {Uint8Array} row - The row of bytes.
   * @param {Uint8Array} prevRow - The previous row of bytes.
   * @param {Uint8Array} out - The output buffer.
   */
  private static filterUp(
    row: Uint8Array,
    prevRow: Uint8Array,
    out: Uint8Array
  ): void {
    const n = row.length;
    let oi = 1;
    for (let x = 0; x < n; ++x) {
      out[oi++] = row[x] - prevRow[x];
    }
  }

  /**
   * Apply the average filter to **row**, writing it to **out** after its
   * filter type byte.
   * @param {Uint8Array} row - The row of bytes.
   * @param {Uint8Array} prevRow - The previous row of bytes.
   * @param {number} bpp - Bytes per pixel.
   * @param {Uint8Array} out - The output buffer.
   */
  private static filterAverage(
    row: Uint8Array,
    prevRow: Uint8Array,
    bpp: number,
    out: Uint8Array
  ): void {
    const n = row.length;
    let oi = 1;
    for (let x = 0; x < bpp && x < n; ++x) {
      out[oi++] = row[x] - (prevRow[x] >> 1);
    }
    for (let x = bpp; x < n; ++x) {
      out[oi++] = row[x] - ((row[x - bpp] + prevRow[x]) >> 1);
    }
  }

  /**
   * Apply the Paeth filter to **row**, writing it to **out** after its filter
   * type byte.
   * @param {Uint8Array} row - The row of bytes.
   * @param {Uint8Array} prevRow - The previous row of bytes.
   * @param {number} bpp - Bytes per pixel.
   * @param {Uint8Array} out - The output buffer.
   */
  private static filterPaeth(
    row: Uint8Array,
    prevRow: Uint8Array,
    bpp: number,
    out: Uint8Array
  ): void {
    const n = row.length;
    let oi = 1;
    // With no left byte, the predictor is always the byte above.
    for (let x = 0; x < bpp && x < n; ++x) {
      out[oi++] = row[x] - prevRow[x];
    }
    for (let x = bpp; x < n; ++x) {
      const a = row[x - bpp];
      const b = prevRow[x];
      const c = prevRow[x - bpp];
      let pa = b - c;
      let pb = a - c;
      let pc = pa + pb;
      if (pa < 0) {
        pa = -pa;
      }
      if (pb < 0) {
        pb = -pb;
      }
      if (pc < 0) {
        pc = -pc;
      }
      out[oi++] = row[x] - (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
    }
  }

  /**
   * Get the number of channels in the image.
   * @param {MemoryImage} image - The image.
   * @returns {number} The number of channels.
   */
  private static numChannels(image: MemoryImage): number {
    return image.hasPalette ? 1 : image.numChannels;
  }

  /**
   * Write the PNG header.
   * @param {MemoryImage} image - The image.
   */
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

  /**
   * Writes the cICP (Coding-independent code points) chunk to the PNG output buffer.
   * @param {PngCicpData} cicp - The CICP data to write into the PNG file.
   */
  private writeCicpChunk(cicp: PngCicpData): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });
    chunk.writeByte(cicp.colorPrimaries);
    chunk.writeByte(cicp.transferCharacteristics);
    chunk.writeByte(cicp.matrixCoefficients);
    chunk.writeByte(cicp.videoFullRangeFlag);
    PngEncoder.writeChunk(this._output!, 'cICP', chunk.getBytes());
  }

  /**
   * A PNG keyword is 1 to 79 Latin-1 printable bytes with no leading,
   * trailing or doubled space; a profile named otherwise gets a default.
   * @param {string} name - The profile name.
   * @returns {string} A name a PNG keyword can hold.
   */
  private static iccpKeyword(name: string): string {
    const units: number[] = [];
    for (let i = 0; i < name.length; i++) {
      units.push(name.charCodeAt(i));
    }
    let valid =
      units.length > 0 &&
      units.length <= 79 &&
      units[0] !== 0x20 &&
      units[units.length - 1] !== 0x20;
    for (let i = 0; valid && i < units.length; i++) {
      const c = units[i];
      valid =
        ((c >= 0x20 && c <= 0x7e) || (c >= 0xa1 && c <= 0xff)) &&
        !(c === 0x20 && units[i - 1] === 0x20);
    }
    return valid ? name : 'ICC_PROFILE';
  }

  /**
   * Write the ICC profile chunk.
   * @param {IccProfile} iccp - The ICC profile.
   */
  private writeICCPChunk(iccp: IccProfile): void {
    const chunk = new OutputBuffer({
      bigEndian: true,
    });

    // name
    const nameCodeUnits = StringUtils.getCodePoints(
      PngEncoder.iccpKeyword(iccp.name)
    );
    chunk.writeBytes(nameCodeUnits);
    chunk.writeByte(0);

    // compression (0 - deflate)
    chunk.writeByte(0);

    // profile data
    chunk.writeBytes(iccp.compressed());

    PngEncoder.writeChunk(this._output!, 'iCCP', chunk.getBytes());
  }

  /**
   * Write the animation control chunk.
   */
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

  /**
   * Write the frame control chunk.
   * @param {MemoryImage} image - The image.
   */
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

  /**
   * Write the palette chunk.
   * @param {Palette} palette - The palette.
   */
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

  /**
   * Write the text chunk.
   * @param {string} keyword - The keyword.
   * @param {string} text - The text.
   */
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

  /**
   * Filters each row of **image**, writing it to **out** with its filter type
   * byte.
   * @param {MemoryImage} image - The image.
   * @param {Uint8Array} out - The filtered output buffer.
   */
  private filter(image: MemoryImage, out: Uint8Array): void {
    const filter = image.hasPalette ? PngFilterType.none : this._filter;
    const buffer = image.buffer;
    const rowStride = image.data!.rowStride;
    const nc = PngEncoder.numChannels(image);
    const bpp = (nc * image.bitsPerChannel + 7) >>> 3;
    const bpc = (image.bitsPerChannel + 7) >>> 3;

    // Each row is copied into one of two buffers, swapping multi-byte samples
    // to PNG's big-endian order. Keeping every row in the same kind of list
    // (not a view) keeps the filter loops fast.
    const rows = [new Uint8Array(rowStride), new Uint8Array(rowStride)];
    let prevRow = rows[1];
    const rowOut = new Uint8Array(rowStride + 1);

    let rowOffset = 0;
    let oi = 0;
    for (let y = 0; y < image.height; ++y, rowOffset += rowStride) {
      const src =
        buffer !== undefined
          ? new Uint8Array(buffer, rowOffset, rowStride)
          : new Uint8Array(rowStride);
      const row = rows[y & 1];
      if (bpc > 1) {
        for (let x = 0; x < rowStride; x += bpc) {
          for (let c = 0, c2 = bpc - 1; c < bpc; ++c, --c2) {
            row[x + c] = src[x + c2];
          }
        }
      } else {
        row.set(src);
      }

      rowOut[0] = filter;
      switch (filter) {
        case PngFilterType.none:
          rowOut.set(row, 1);
          break;
        case PngFilterType.sub:
          PngEncoder.filterSub(row, bpp, rowOut);
          break;
        case PngFilterType.up:
          PngEncoder.filterUp(row, prevRow, rowOut);
          break;
        case PngFilterType.average:
          PngEncoder.filterAverage(row, prevRow, bpp, rowOut);
          break;
        case PngFilterType.paeth:
          PngEncoder.filterPaeth(row, prevRow, bpp, rowOut);
          break;
      }

      out.set(rowOut, oi);
      oi += rowOut.length;
      prevRow = row;
    }
  }

  /**
   * Adds a frame to the PNG encoder.
   *
   * @param {MemoryImage} image - The image to add as a frame.
   */
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

      if (this._cicpData !== undefined) {
        this.writeCicpChunk(this._cicpData);
      }

      if (_image.hasPalette) {
        if (this._globalQuantizer !== undefined) {
          this.writePalette(this._globalQuantizer.palette);
        } else {
          this.writePalette(_image.palette!);
        }
      }

      if (this._isAnimated) {
        this.writeAnimationControlChunk();
      }
    }

    if (_image.textData !== undefined) {
      for (const [key, value] of _image.textData) {
        this.writeTextChunk(key, value);
      }
    }

    if (this._pixelDimensions !== undefined) {
      const phys = new OutputBuffer({
        bigEndian: true,
      });
      phys.writeUint32(this._pixelDimensions.xPxPerUnit);
      phys.writeUint32(this._pixelDimensions.yPxPerUnit);
      phys.writeByte(this._pixelDimensions.unitSpecifier);
      PngEncoder.writeChunk(this._output, 'pHYs', phys.getBytes());
    }

    if (this._isAnimated) {
      this.writeFrameControlChunk(_image);
      this._sequenceNumber++;
    }

    // The first frame is stored in IDAT chunks, later animation frames in fdAT
    // chunks, which start with a sequence number.
    const output = this._output;
    const isIdat = this._sequenceNumber <= 1;
    const dataStart = isIdat ? 0 : 4;
    const chunk = new Uint8Array(dataStart + PngEncoder.maxDataChunkSize);
    let chunkLength = dataStart;
    let chunksWritten = 0;

    const writeDataChunk = (): void => {
      if (isIdat) {
        PngEncoder.writeChunk(output, 'IDAT', chunk.subarray(0, chunkLength));
      } else {
        chunk[0] = (this._sequenceNumber >>> 24) & 0xff;
        chunk[1] = (this._sequenceNumber >>> 16) & 0xff;
        chunk[2] = (this._sequenceNumber >>> 8) & 0xff;
        chunk[3] = this._sequenceNumber & 0xff;
        this._sequenceNumber++;
        PngEncoder.writeChunk(output, 'fdAT', chunk.subarray(0, chunkLength));
      }
      chunkLength = dataStart;
      chunksWritten++;
    };

    const rowBytes = _image.data!.rowStride;
    const filteredImage = new Uint8Array((rowBytes + 1) * _image.height);
    this.filter(_image, filteredImage);

    const compressed = deflate(filteredImage, {
      level: this._level,
    });

    let i = 0;
    while (i < compressed.length) {
      const n = Math.min(compressed.length - i, chunk.length - chunkLength);
      chunk.set(compressed.subarray(i, i + n), chunkLength);
      chunkLength += n;
      i += n;
      if (chunkLength === chunk.length) {
        writeDataChunk();
      }
    }

    if (chunkLength > dataStart || chunksWritten === 0) {
      writeDataChunk();
    }
  }

  /**
   * Start encoding a PNG.
   *
   * Call this method once before calling **addFrame**.
   *
   * @param {number} frameCount - The number of frames to encode.
   */
  public start(frameCount: number): void {
    this._frames = frameCount;
    this._isAnimated = frameCount > 1;
  }

  /**
   * Finish encoding a PNG, and return the resulting bytes.
   *
   * Call this method to finalize the encoding, after all **addFrame** calls.
   *
   * @returns {Uint8Array | undefined} The encoded PNG bytes, or undefined if encoding was not started.
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
   * @param {EncoderEncodeOptions} opt - The encoding options.
   * @param {MemoryImage} opt.image - The image to encode.
   * @param {boolean} [opt.singleFrame] - Optional flag to encode a single frame.
   * @returns {Uint8Array} The encoded PNG bytes.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    checkEncode(opt.image);
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
