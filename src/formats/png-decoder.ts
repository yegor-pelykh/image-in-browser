/** @format */

import { inflate } from '../uzip/uzip.js';
import { Crc32 } from '../common/crc32.js';
import { InputBuffer } from '../common/input-buffer.js';
import { ArrayUtils } from '../common/array-utils.js';
import { StringUtils } from '../common/string-utils.js';
import { LibError } from '../error/lib-error.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { PngFrame } from './png/png-frame.js';
import { PngInfo } from './png/png-info.js';
import { PngColorType } from './png/png-color-type.js';
import { PngDisposeMode } from './png/png-dispose-mode.js';
import { PngBlendMode } from './png/png-blend-mode.js';
import { ColorRgba8 } from '../color/color-rgba8.js';
import { ColorRgb8 } from '../color/color-rgb8.js';
import { MemoryImage, MemoryImageCreateOptions } from '../image/image.js';
import { PaletteUint8 } from '../image/palette-uint8.js';
import { Format } from '../color/format.js';
import { IccProfile } from '../image/icc-profile.js';
import { IccProfileCompression } from '../image/icc-profile-compression.js';
import { Draw } from '../draw/draw.js';
import { BlendMode } from '../draw/blend-mode.js';
import { PngFilterType } from './png/png-filter-type.js';
import { Pixel } from '../image/pixel.js';
import { ImageFormat } from './image-format.js';
import { Rectangle } from '../common/rectangle.js';

/**
 * Decode a PNG encoded image.
 */
export class PngDecoder implements Decoder {
  /**
   * The input buffer for the PNG data.
   */
  private _input?: InputBuffer<Uint8Array>;

  /**
   * Get the input buffer.
   */
  public get input(): InputBuffer<Uint8Array> | undefined {
    return this._input;
  }

  /**
   * Information about the PNG image.
   */
  private _info: PngInfo = new PngInfo();

  /**
   * Get the PNG information.
   */
  public get info(): PngInfo {
    return this._info;
  }

  /**
   * The current progress in the Y direction.
   */
  private _progressY = 0;

  /**
   * Get the current progress in the Y direction.
   */
  public get progressY(): number {
    return this._progressY;
  }

  /**
   * The bit buffer used for reading bits.
   */
  private _bitBuffer = 0;

  /**
   * Get the bit buffer.
   */
  public get bitBuffer(): number {
    return this._bitBuffer;
  }

  /**
   * The length of the bit buffer.
   */
  private _bitBufferLen = 0;

  /**
   * Get the length of the bit buffer.
   */
  public get bitBufferLen(): number {
    return this._bitBufferLen;
  }

  /**
   * Get the image format.
   */
  get format(): ImageFormat {
    return ImageFormat.png;
  }

  /**
   * The number of frames that can be decoded.
   */
  public get numFrames(): number {
    return this._info.numFrames;
  }
  /**
   * Unfilter a row of pixels.
   * @param {PngFilterType} filterType - The type of filter used.
   * @param {number} bpp - Bytes per pixel.
   * @param {Uint8Array} row - The current row of pixels.
   * @param {Uint8Array} [prevRow] - The previous row of pixels.
   * @throws {LibError} Throws an error if the filter type is invalid.
   */
  private static unfilter(
    filterType: PngFilterType,
    bpp: number,
    row: Uint8Array,
    prevRow?: Uint8Array
  ): void {
    const rowBytes = row.length;

    switch (filterType) {
      case PngFilterType.none:
        break;
      case PngFilterType.sub:
        for (let x = bpp; x < rowBytes; ++x) {
          row[x] = (row[x] + row[x - bpp]) & 0xff;
        }
        break;
      case PngFilterType.up:
        for (let x = 0; x < rowBytes; ++x) {
          const b = prevRow !== undefined ? prevRow[x] : 0;
          row[x] = (row[x] + b) & 0xff;
        }
        break;
      case PngFilterType.average:
        for (let x = 0; x < rowBytes; ++x) {
          const a = x < bpp ? 0 : row[x - bpp];
          const b = prevRow !== undefined ? prevRow[x] : 0;
          row[x] = (row[x] + ((a + b) >>> 1)) & 0xff;
        }
        break;
      case PngFilterType.paeth:
        for (let x = 0; x < rowBytes; ++x) {
          const a = x < bpp ? 0 : row[x - bpp];
          const b = prevRow !== undefined ? prevRow[x] : 0;
          const c = x < bpp || prevRow === undefined ? 0 : prevRow[x - bpp];

          const p = a + b - c;

          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);

          let paeth = 0;
          if (pa <= pb && pa <= pc) {
            paeth = a;
          } else if (pb <= pc) {
            paeth = b;
          } else {
            paeth = c;
          }

          row[x] = (row[x] + paeth) & 0xff;
        }
        break;
      default:
        throw new LibError(`Invalid filter value: ${filterType}`);
    }
  }

  /**
   * Return the CRC of the bytes.
   * @param {string} type - The type of the chunk.
   * @param {Uint8Array} bytes - The bytes of the chunk.
   * @returns {number} The CRC value.
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
   * Process a pass of an interlaced image.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {MemoryImage} image - The memory image.
   * @param {number} xOffset - The X offset.
   * @param {number} yOffset - The Y offset.
   * @param {number} xStep - The X step.
   * @param {number} yStep - The Y step.
   * @param {number} passWidth - The width of the pass.
   * @param {number} passHeight - The height of the pass.
   */
  private processPass(
    input: InputBuffer<Uint8Array>,
    image: MemoryImage,
    xOffset: number,
    yOffset: number,
    xStep: number,
    yStep: number,
    passWidth: number,
    passHeight: number
  ): void {
    let channels = 1;
    if (this._info.colorType === PngColorType.grayscaleAlpha) {
      channels = 2;
    } else if (this._info.colorType === PngColorType.rgb) {
      channels = 3;
    } else if (this._info.colorType === PngColorType.rgba) {
      channels = 4;
    }

    const pixelDepth = channels * this._info.bits;
    const bpp = (pixelDepth + 7) >>> 3;
    const rowBytes = (pixelDepth * passWidth + 7) >>> 3;

    const inData: Array<Uint8Array | undefined> = [undefined, undefined];

    const pixel = [0, 0, 0, 0];

    // Let pi: number = 0;
    for (
      let srcY = 0, dstY = yOffset, ri = 0;
      srcY < passHeight;
      ++srcY, dstY += yStep, ri = 1 - ri, this._progressY++
    ) {
      const filterType = input.read() as PngFilterType;
      inData[ri] = input.readRange(rowBytes).toUint8Array();

      const row = inData[ri]!;
      const prevRow = inData[1 - ri];

      // Before the image is compressed, it was filtered to improve compression.
      // Reverse the filter now.
      PngDecoder.unfilter(filterType, bpp, row, prevRow);

      // Scanlines are always on byte boundaries, so for bit depths < 8,
      // reset the bit stream counter.
      this.resetBits();

      const rowInput = new InputBuffer<Uint8Array>({
        buffer: row,
        bigEndian: true,
      });

      const blockHeight = xStep;
      const blockWidth = xStep - xOffset;

      // Let yMax: number = Math.min(dstY + blockHeight, _info.height);

      for (
        let srcX = 0, dstX = xOffset;
        srcX < passWidth;
        ++srcX, dstX += xStep
      ) {
        this.readPixel(rowInput, pixel);
        this.setPixel(image.getPixel(dstX, dstY), pixel);

        if (blockWidth > 1 || blockHeight > 1) {
          for (let i = 0; i < blockHeight; ++i) {
            for (let j = 0; j < blockWidth; ++j) {
              this.setPixel(image.getPixelSafe(dstX + j, dstY + i), pixel);
            }
          }
        }
      }
    }
  }

  /**
   * Process the input buffer and decode the image.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {MemoryImage} image - The memory image.
   */
  private process(input: InputBuffer<Uint8Array>, image: MemoryImage): void {
    let channels = 1;
    if (this._info.colorType === PngColorType.grayscaleAlpha) {
      channels = 2;
    } else if (this._info.colorType === PngColorType.rgb) {
      channels = 3;
    } else if (this._info.colorType === PngColorType.rgba) {
      channels = 4;
    }

    const pixelDepth = channels * this._info!.bits!;

    const w = this._info.width;
    const h = this._info.height;

    const rowBytes = (w * pixelDepth + 7) >>> 3;
    const bpp = (pixelDepth + 7) >>> 3;

    const line = new Uint8Array(rowBytes);
    const inData = [line, line];

    const pixel = [0, 0, 0, 0];

    const pIter = image[Symbol.iterator]();
    let pIterRes = pIter.next();
    for (let y = 0, ri = 0; y < h; ++y, ri = 1 - ri) {
      const filterType = input.read() as PngFilterType;
      inData[ri] = input.readRange(rowBytes).toUint8Array();

      const row = inData[ri];
      const prevRow = inData[1 - ri];

      // Before the image is compressed, it was filtered to improve compression.
      // Reverse the filter now.
      PngDecoder.unfilter(filterType, bpp, row, prevRow);

      // Scanlines are always on byte boundaries, so for bit depths < 8,
      // reset the bit stream counter.
      this.resetBits();

      const rowInput = new InputBuffer<Uint8Array>({
        buffer: inData[ri],
        bigEndian: true,
      });

      for (let x = 0; x < w; ++x) {
        this.readPixel(rowInput, pixel);
        this.setPixel(pIterRes.value, pixel);
        pIterRes = pIter.next();
      }
    }
  }

  /**
   * Reset the bit buffer.
   */
  private resetBits(): void {
    this._bitBuffer = 0;
    this._bitBufferLen = 0;
  }

  /**
   * Read a number of bits from the input stream.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number} numBits - The number of bits to read.
   * @returns {number} The read bits.
   * @throws {LibError} If there is invalid PNG data.
   */
  private readBits(input: InputBuffer<Uint8Array>, numBits: number): number {
    if (numBits === 0) {
      return 0;
    }

    if (numBits === 8) {
      return input.read();
    }

    if (numBits === 16) {
      return input.readUint16();
    }

    // Not enough buffer
    while (this._bitBufferLen < numBits) {
      if (input.isEOS) {
        throw new LibError('Invalid PNG data.');
      }

      // Input byte
      const octet = input.read();

      // Concat octet
      this._bitBuffer = octet << this._bitBufferLen;
      this._bitBufferLen += 8;
    }

    // Output byte
    let mask = 0;
    switch (numBits) {
      case 1:
        mask = 1;
        break;
      case 2:
        mask = 3;
        break;
      case 4:
        mask = 0xf;
        break;
      case 8:
        mask = 0xff;
        break;
      case 16:
        mask = 0xffff;
        break;
      default:
        mask = 0;
        break;
    }

    const octet = (this._bitBuffer >>> (this._bitBufferLen - numBits)) & mask;

    this._bitBufferLen -= numBits;

    return octet;
  }

  /**
   * Read the next pixel from the input stream.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number[]} pixel - The pixel array to store the read pixel.
   */
  private readPixel(input: InputBuffer<Uint8Array>, pixel: number[]): void {
    switch (this._info.colorType) {
      case PngColorType.grayscale:
        pixel[0] = this.readBits(input, this._info.bits!);
        return;
      case PngColorType.rgb:
        pixel[0] = this.readBits(input, this._info.bits!);
        pixel[1] = this.readBits(input, this._info.bits!);
        pixel[2] = this.readBits(input, this._info.bits!);
        return;
      case PngColorType.indexed:
        pixel[0] = this.readBits(input, this._info.bits!);
        return;
      case PngColorType.grayscaleAlpha:
        pixel[0] = this.readBits(input, this._info.bits!);
        pixel[1] = this.readBits(input, this._info.bits!);
        return;
      case PngColorType.rgba:
        pixel[0] = this.readBits(input, this._info.bits!);
        pixel[1] = this.readBits(input, this._info.bits!);
        pixel[2] = this.readBits(input, this._info.bits!);
        pixel[3] = this.readBits(input, this._info.bits!);
        return;
    }
    throw new LibError(`Invalid color type: ${this._info.colorType}.`);
  }

  /**
   * Set the pixel color.
   * @param {Pixel} p - The pixel object.
   * @param {number[]} raw - The raw pixel data.
   */
  private setPixel(p: Pixel, raw: number[]): void {
    switch (this._info.colorType) {
      case PngColorType.grayscale:
        if (this._info.transparency !== undefined && this._info.bits > 8) {
          const t = this._info.transparency!;
          const a = ((t[0] & 0xff) << 24) | (t[1] & 0xff);
          const g = raw[0];
          p.setRgba(g, g, g, g !== a ? p.maxChannelValue : 0);
          return;
        }
        p.setRgb(raw[0], 0, 0);
        return;
      case PngColorType.rgb:
        {
          const r = raw[0];
          const g = raw[1];
          const b = raw[2];

          if (this._info.transparency !== undefined) {
            const t = this._info.transparency!;
            const tr = ((t[0] & 0xff) << 8) | (t[1] & 0xff);
            const tg = ((t[2] & 0xff) << 8) | (t[3] & 0xff);
            const tb = ((t[4] & 0xff) << 8) | (t[5] & 0xff);
            if (raw[0] !== tr || raw[1] !== tg || raw[2] !== tb) {
              p.setRgba(r, g, b, p.maxChannelValue);
              return;
            }
          }

          p.setRgb(r, g, b);
        }
        return;
      case PngColorType.indexed:
        p.index = raw[0];
        return;
      case PngColorType.grayscaleAlpha:
        p.setRgb(raw[0], raw[1], 0);
        return;
      case PngColorType.rgba:
        p.setRgba(raw[0], raw[1], raw[2], raw[3]);
        return;
    }

    throw new LibError(`Invalid color type: ${this._info.colorType}.`);
  }

  /**
   * Is the given file a valid PNG image?
   * @param {Uint8Array} bytes - The bytes of the file.
   * @returns {boolean} True if the file is valid, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
      bigEndian: true,
    });
    const headerBytes = this._input.readRange(8);
    const expectedHeaderBytes = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; ++i) {
      if (headerBytes.get(i) !== expectedHeaderBytes[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Start decoding the data as an animation sequence, but don't actually
   * process the frames until they are requested with decodeFrame.
   * @param {Uint8Array} bytes - The bytes of the PNG file.
   * @returns {PngInfo | undefined} The PNG information if successful, undefined otherwise.
   * @throws {LibError} If there is an invalid checksum or invalid chunk.
   */
  public startDecode(bytes: Uint8Array): PngInfo | undefined {
    if (!this.isValidFile(bytes) || this._input === undefined) {
      return undefined;
    }

    while (true) {
      const inputPos = this._input.position;
      let chunkSize = this._input.readUint32();
      const chunkType = this._input.readString(4);
      switch (chunkType) {
        case 'tEXt':
          {
            const txtData = this._input.readRange(chunkSize).toUint8Array();
            const l = txtData.length;
            for (let i = 0; i < l; ++i) {
              if (txtData[i] === 0) {
                const key = StringUtils.latin1Decoder.decode(
                  ArrayUtils.copyUint8(txtData, 0, i)
                );
                const text = StringUtils.latin1Decoder.decode(
                  ArrayUtils.copyUint8(txtData, i + 1)
                );
                this._info.textData.set(key, text);
                break;
              }
            }
            // CRC
            this._input.skip(4);
          }
          break;
        case 'IHDR': {
          const hdr = InputBuffer.from(this._input.readRange(chunkSize));
          const hdrBytes: Uint8Array = hdr.toUint8Array();
          this._info.width = hdr.readUint32();
          this._info.height = hdr.readUint32();
          this._info.bits = hdr.read();
          this._info.colorType = hdr.read();
          this._info.compressionMethod = hdr.read();
          this._info.filterMethod = hdr.read();
          this._info.interlaceMethod = hdr.read();

          if (this._info.filterMethod !== 0) {
            return undefined;
          }

          switch (this._info.colorType) {
            case PngColorType.grayscale:
              if (![1, 2, 4, 8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngColorType.rgb:
              if (![8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngColorType.indexed:
              if (![1, 2, 4, 8].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngColorType.grayscaleAlpha:
              if (![8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngColorType.rgba:
              if (![8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            default:
              // The proposed image data is not supported.
              return undefined;
          }

          const crc = this._input.readUint32();
          const computedCrc = PngDecoder.crc(chunkType, hdrBytes);
          if (crc !== computedCrc) {
            throw new LibError(`Invalid ${chunkType} checksum`);
          }
          break;
        }
        case 'PLTE': {
          this._info.palette = this._input.readRange(chunkSize).toUint8Array();
          const crc = this._input.readUint32();
          const computedCrc = PngDecoder.crc(chunkType, this._info.palette);
          if (crc !== computedCrc) {
            throw new LibError(`Invalid ${chunkType} checksum`);
          }
          break;
        }
        case 'tRNS': {
          this._info.transparency = this._input
            .readRange(chunkSize)
            .toUint8Array();
          const crc = this._input.readUint32();
          const computedCrc = PngDecoder.crc(
            chunkType,
            this._info.transparency
          );
          if (crc !== computedCrc) {
            throw new LibError(`Invalid ${chunkType} checksum`);
          }
          break;
        }
        case 'IEND': {
          // End of the image
          // CRC
          this._input.skip(4);
          break;
        }
        case 'gAMA': {
          if (chunkSize !== 4) {
            throw new LibError('Invalid gAMA chunk');
          }
          const gammaInt = this._input.readUint32();
          // CRC
          this._input.skip(4);
          // A gamma of 1 doesn't have any affect, so pretend we didn't get
          // a gamma in that case.
          if (gammaInt !== 100000) {
            this._info.gamma = gammaInt / 100000.0;
          }
          break;
        }
        case 'IDAT': {
          this._info.idat.push(inputPos);
          this._input.skip(chunkSize);
          // CRC
          this._input.skip(4);
          break;
        }
        case 'acTL': {
          // Animation control chunk
          this._info.numFrames = this._input.readUint32();
          this._info.repeat = this._input.readUint32();
          // CRC
          this._input.skip(4);
          break;
        }
        case 'fcTL': {
          // Frame control chunk
          const sequenceNumber = this._input.readUint32();
          const width = this._input.readUint32();
          const height = this._input.readUint32();
          const xOffset = this._input.readUint32();
          const yOffset = this._input.readUint32();
          const delayNum = this._input.readUint16();
          const delayDen = this._input.readUint16();
          const dispose = this._input.read() as PngDisposeMode;
          const blend = this._input.read() as PngBlendMode;
          // CRC
          this._input.skip(4);

          const frame: PngFrame = new PngFrame({
            sequenceNumber: sequenceNumber,
            width: width,
            height: height,
            xOffset: xOffset,
            yOffset: yOffset,
            delayNum: delayNum,
            delayDen: delayDen,
            dispose: dispose,
            blend: blend,
          });
          this._info.frames.push(frame);
          break;
        }
        case 'fdAT': {
          const sequenceNumber = this._input.readUint32();
          const frame = this._info.frames[this._info.frames.length - 1];
          frame.fdat.push(inputPos);
          this._input.skip(chunkSize - 4);
          // CRC
          this._input.skip(4);
          break;
        }
        case 'bKGD': {
          if (this._info.colorType === PngColorType.indexed) {
            const paletteIndex = this._input.read();
            chunkSize--;
            const p3 = paletteIndex * 3;
            const r = this._info.palette![p3]!;
            const g = this._info.palette![p3 + 1]!;
            const b = this._info.palette![p3 + 2]!;
            if (this._info.transparency !== undefined) {
              const isTransparent =
                this._info.transparency.includes(paletteIndex);
              this._info.backgroundColor = new ColorRgba8(
                r,
                g,
                b,
                isTransparent ? 0 : 255
              );
            } else {
              this._info.backgroundColor = new ColorRgb8(r, g, b);
            }
          } else if (
            this._info.colorType === PngColorType.grayscale ||
            this._info.colorType === PngColorType.grayscaleAlpha
          ) {
            /* Const gray: number = */
            this._input.readUint16();
            chunkSize -= 2;
          } else if (
            this._info.colorType === PngColorType.rgb ||
            this._info.colorType === PngColorType.rgba
          ) {
            /* Const r: number = */
            this._input.readUint16();
            /* Const g: number = */
            this._input.readUint16();
            /* Const b: number = */
            this._input.readUint16();
            chunkSize -= 24;
          }
          if (chunkSize > 0) {
            this._input.skip(chunkSize);
          }
          // CRC
          this._input.skip(4);
          break;
        }
        case 'iCCP': {
          this._info.iccpName = this._input.readString();
          // 0: deflate
          this._info.iccpCompression = this._input.read();
          chunkSize -= this._info.iccpName.length + 2;
          const profile = this._input.readRange(chunkSize);
          this._info.iccpData = profile.toUint8Array();
          // CRC
          this._input.skip(4);
          break;
        }
        default: {
          this._input.skip(chunkSize);
          // CRC
          this._input.skip(4);
          break;
        }
      }

      if (chunkType === 'IEND') {
        break;
      }

      if (this._input.isEOS) {
        return undefined;
      }
    }

    return this._info;
  }

  /**
   * Decode the frame (assuming **startDecode** has already been called).
   * @param {number} frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if input is not defined.
   * @throws {LibError} If an invalid checksum or frame number is encountered.
   */
  public decodeFrame(frameIndex: number): MemoryImage | undefined {
    if (this._input === undefined) {
      return undefined;
    }

    let imageData: Uint8Array | undefined = undefined;
    let width: number | undefined = this._info.width;
    let height: number | undefined = this._info.height;

    if (!this._info.isAnimated || frameIndex === 0) {
      let totalSize = 0;
      const len = this._info.idat.length;
      const dataBlocks: Uint8Array[] = new Array<Uint8Array>();
      for (let i = 0; i < len; ++i) {
        this._input.offset = this._info.idat[i];
        const chunkSize = this._input.readUint32();
        const chunkType = this._input.readString(4);
        const data = this._input.readRange(chunkSize).toUint8Array();
        totalSize += data.length;
        dataBlocks.push(data);
        const crc = this._input.readUint32();
        const computedCrc = PngDecoder.crc(chunkType, data);
        if (crc !== computedCrc) {
          throw new LibError(`Invalid ${chunkType} checksum`);
        }
      }
      imageData = new Uint8Array(totalSize);
      let offset = 0;
      for (const data of dataBlocks) {
        imageData.set(data, offset);
        offset += data.length;
      }
    } else {
      if (frameIndex < 0 || frameIndex >= this._info.frames.length) {
        throw new LibError(`Invalid Frame Number: ${frameIndex}`);
      }

      const f = this._info.frames[frameIndex];
      width = f.width;
      height = f.height;
      let totalSize = 0;
      const dataBlocks: Uint8Array[] = new Array<Uint8Array>();
      for (let i = 0; i < f.fdat.length; ++i) {
        this._input.offset = f.fdat[i];
        const chunkSize = this._input.readUint32();
        // fDat chunk header
        this._input.readString(4);
        // Sequence number
        this._input.skip(4);
        const data = this._input.readRange(chunkSize - 4).toUint8Array();
        totalSize += data.length;
        dataBlocks.push(data);
      }

      imageData = new Uint8Array(totalSize);
      let offset = 0;
      for (const data of dataBlocks) {
        imageData.set(data, offset);
        offset += data.length;
      }
    }

    let numChannels =
      this._info.colorType === PngColorType.indexed
        ? 1
        : this._info.colorType === PngColorType.grayscale
          ? 1
          : this._info.colorType === PngColorType.grayscaleAlpha
            ? 2
            : this._info.colorType === PngColorType.rgba
              ? 4
              : 3;

    let uncompressed: Uint8Array | undefined = undefined;
    try {
      uncompressed = inflate(imageData) as Uint8Array;
    } catch (error) {
      console.error(error);
      return undefined;
    }

    // Input is the decompressed data.
    const input = new InputBuffer<Uint8Array>({
      buffer: uncompressed,
      bigEndian: true,
    });
    this.resetBits();

    let palette: PaletteUint8 | undefined = undefined;

    // Non-indexed PNGs may have a palette, but it only provides a suggested
    // set of colors to which an RGB color can be quantized if not displayed
    // directly. In this case, just ignore the palette.
    if (this._info.colorType === PngColorType.indexed) {
      if (this._info.palette !== undefined) {
        const p = this._info.palette!;
        const numColors = Math.trunc(p.length / 3);
        const t = this._info.transparency;
        const tl = t !== undefined ? t.length : 0;
        const nc = t !== undefined ? 4 : 3;
        palette = new PaletteUint8(numColors, nc);
        for (let i = 0, pi = 0; i < numColors; ++i, pi += 3) {
          let a = 255;
          if (nc === 4 && i < tl) {
            a = t![i];
          }
          palette.setRgba(i, p[pi]!, p[pi + 1]!, p[pi + 2]!, a);
        }
      }
    }

    // grayscale images with no palette but with transparency, get
    // converted to a indexed palette image.
    if (
      this._info.colorType === PngColorType.grayscale &&
      this._info.transparency !== undefined &&
      palette === undefined &&
      this._info.bits <= 8
    ) {
      const t = this._info.transparency!;
      const nt = t.length;
      const numColors = 1 << this._info.bits;
      palette = new PaletteUint8(numColors, 4);
      // palette color are 8-bit, so convert the grayscale bit value to the
      // 8-bit palette value.
      const to8bit =
        this._info.bits === 1
          ? 255
          : this._info.bits === 2
            ? 85
            : this._info.bits === 4
              ? 17
              : 1;
      for (let i = 0; i < numColors; ++i) {
        const g = i * to8bit;
        palette.setRgba(i, g, g, g, 255);
      }
      for (let i = 0; i < nt; i += 2) {
        const ti = ((t[i] & 0xff) << 8) | (t[i + 1] & 0xff);
        if (ti < numColors) {
          palette.set(ti, 3, 0);
        }
      }
    }

    const format =
      this._info.bits === 1
        ? Format.uint1
        : this._info.bits === 2
          ? Format.uint2
          : this._info.bits === 4
            ? Format.uint4
            : this._info.bits === 16
              ? Format.uint16
              : Format.uint8;

    if (
      this._info.colorType === PngColorType.grayscale &&
      this._info.transparency !== undefined &&
      this._info.bits > 8
    ) {
      numChannels = 4;
    }

    if (
      this._info.colorType === PngColorType.rgb &&
      this._info.transparency !== undefined
    ) {
      numChannels = 4;
    }

    const opt: MemoryImageCreateOptions = {
      width: width,
      height: height,
      numChannels: numChannels,
      palette: palette,
      format: format,
    };

    if (this._info.iccpData !== undefined) {
      opt.iccProfile = new IccProfile(
        this._info.iccpName,
        IccProfileCompression.deflate,
        this._info.iccpData
      );
    }

    if (this._info.textData.size > 0) {
      opt.textData = new Map<string, string>(this._info.textData);
    }

    const image = new MemoryImage(opt);

    const origW = this._info.width;
    const origH = this._info.height;
    this._info.width = width;
    this._info.height = height;

    const w = width;
    const h = height;
    this._progressY = 0;
    if (this._info.interlaceMethod !== 0) {
      this.processPass(input, image, 0, 0, 8, 8, (w + 7) >>> 3, (h + 7) >>> 3);
      this.processPass(input, image, 4, 0, 8, 8, (w + 3) >>> 3, (h + 7) >>> 3);
      this.processPass(input, image, 0, 4, 4, 8, (w + 3) >>> 2, (h + 3) >>> 3);
      this.processPass(input, image, 2, 0, 4, 4, (w + 1) >>> 2, (h + 3) >>> 2);
      this.processPass(input, image, 0, 2, 2, 4, (w + 1) >>> 1, (h + 1) >>> 2);
      this.processPass(input, image, 1, 0, 2, 2, w >>> 1, (h + 1) >>> 1);
      this.processPass(input, image, 0, 1, 1, 2, w, h >>> 1);
    } else {
      this.process(input, image);
    }

    this._info.width = origW;
    this._info.height = origH;

    return image;
  }

  /**
   * Decode the image based on the provided options.
   * @param {DecoderDecodeOptions} opt - The options for decoding the image.
   * @param {Uint8Array} opt.bytes - The byte array of the image to decode.
   * @param {number} [opt.frameIndex] - The index of the frame to decode (optional).
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;

    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    if (!this._info.isAnimated || opt.frameIndex !== undefined) {
      return this.decodeFrame(opt.frameIndex ?? 0);
    }

    let firstImage: MemoryImage | undefined = undefined;
    let lastImage: MemoryImage | undefined = undefined;
    for (let i = 0; i < this._info.numFrames; ++i) {
      const frame = this._info.frames[i];
      const image = this.decodeFrame(i);
      if (image === undefined) {
        continue;
      }

      if (firstImage === undefined || lastImage === undefined) {
        firstImage = image.convert({
          numChannels: image.numChannels,
        });
        lastImage = firstImage;
        // Convert to MS
        lastImage.frameDuration = Math.trunc(frame.delay * 1000);
        continue;
      }

      const prevFrame = this._info.frames[i - 1];

      if (
        image.width === lastImage.width &&
        image.height === lastImage.height &&
        frame.xOffset === 0 &&
        frame.yOffset === 0 &&
        frame.blend === PngBlendMode.source
      ) {
        lastImage = image;
        // Convert to MS
        lastImage.frameDuration = Math.trunc(frame.delay * 1000);
        firstImage.addFrame(lastImage);
        continue;
      }

      lastImage = MemoryImage.from(firstImage.getFrame(i - 1));

      const dispose = prevFrame.dispose;
      if (dispose === PngDisposeMode.background) {
        Draw.fillRect({
          image: lastImage,
          rect: new Rectangle(
            prevFrame.xOffset,
            prevFrame.yOffset,
            prevFrame.xOffset + prevFrame.width - 1,
            prevFrame.yOffset + prevFrame.height - 1
          ),
          color: this._info.backgroundColor ?? new ColorRgba8(0, 0, 0, 0),
          alphaBlend: false,
        });
      } else if (dispose === PngDisposeMode.previous && i > 1) {
        const prevImage = firstImage.getFrame(i - 2);
        lastImage = Draw.compositeImage({
          dst: lastImage,
          src: prevImage,
          dstX: prevFrame.xOffset,
          dstY: prevFrame.yOffset,
          dstW: prevFrame.width,
          dstH: prevFrame.height,
          srcX: prevFrame.xOffset,
          srcY: prevFrame.yOffset,
          srcW: prevFrame.width,
          srcH: prevFrame.height,
        });
      }

      // Convert to MS
      lastImage.frameDuration = Math.trunc(frame.delay * 1000);

      lastImage = Draw.compositeImage({
        dst: lastImage,
        src: image,
        dstX: frame.xOffset,
        dstY: frame.yOffset,
        blend:
          frame.blend === PngBlendMode.over
            ? BlendMode.alpha
            : BlendMode.direct,
      });

      firstImage.addFrame(lastImage);
    }

    return firstImage;
  }
}
