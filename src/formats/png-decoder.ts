/** @format */

import { inflate } from 'uzip';
import { Color } from '../common/color';
import { ColorUtils } from '../common/color-utils';
import { Crc32 } from '../common/crc32';
import { FrameAnimation } from '../common/frame-animation';
import { ICCPCompressionMode } from '../common/iccp-compression-mode';
import { ICCProfileData } from '../common/icc_profile_data';
import { ListUtils } from '../common/list-utils';
import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { TextCodec } from '../common/text-codec';
import { ImageError } from '../error/image-error';
import { NotImplementedError } from '../error/not-implemented-error';
import { HdrImage } from '../hdr/hdr-image';
import { CopyIntoTransform } from '../transform/copy-into';
import { DecodeInfo } from './decode-info';
import { Decoder } from './decoder';
import { PngFrame } from './png/png-frame';
import { PngInfo } from './png/png-info';
import { InputBuffer } from './util/input-buffer';

/**
 * Decode a PNG encoded image.
 */
export class PngDecoder implements Decoder {
  private static readonly GRAYSCALE = 0;

  private static readonly RGB = 2;

  private static readonly INDEXED = 3;

  private static readonly GRAYSCALE_ALPHA = 4;

  private static readonly RGBA = 6;

  private static readonly FILTER_NONE = 0;

  private static readonly FILTER_SUB = 1;

  private static readonly FILTER_UP = 2;

  private static readonly FILTER_AVERAGE = 3;

  private static readonly FILTER_PAETH = 4;

  private _info?: PngInfo;
  public get info(): PngInfo | undefined {
    return this._info;
  }

  private _input?: InputBuffer;
  public get input(): InputBuffer | undefined {
    return this._input;
  }

  private _progressY = 0;
  public get progressY(): number {
    return this._progressY;
  }

  private _bitBuffer = 0;
  public get bitBuffer(): number {
    return this._bitBuffer;
  }

  private _bitBufferLen = 0;
  public get bitBufferLen(): number {
    return this._bitBufferLen;
  }

  /**
   * The number of frames that can be decoded.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  private static unfilter(
    filterType: number,
    bpp: number,
    row: Uint8Array,
    prevRow: Uint8Array
  ): void {
    const rowBytes = row.length;

    switch (filterType) {
      case PngDecoder.FILTER_NONE:
        break;
      case PngDecoder.FILTER_SUB:
        for (let x = bpp; x < rowBytes; ++x) {
          row[x] = (row[x] + row[x - bpp]) & 0xff;
        }
        break;
      case PngDecoder.FILTER_UP:
        for (let x = 0; x < rowBytes; ++x) {
          row[x] = (row[x] + prevRow[x]) & 0xff;
        }
        break;
      case PngDecoder.FILTER_AVERAGE:
        for (let x = 0; x < rowBytes; ++x) {
          const a = x < bpp ? 0 : row[x - bpp];
          const b = prevRow[x];
          row[x] = (row[x] + ((a + b) >> 1)) & 0xff;
        }
        break;
      case PngDecoder.FILTER_PAETH:
        for (let x = 0; x < rowBytes; ++x) {
          const a = x < bpp ? 0 : row[x - bpp];
          const b = prevRow[x];
          const c = x < bpp ? 0 : prevRow[x - bpp];

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
        throw new ImageError(`Invalid filter value: ${filterType}`);
    }
  }

  private static convert16to8(c: number): number {
    return c >> 8;
  }

  private static convert1to8(c: number): number {
    return c === 0 ? 0 : 255;
  }

  private static convert2to8(c: number): number {
    return c * 85;
  }

  private static convert4to8(c: number): number {
    return c << 4;
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

  /**
   * Process a pass of an interlaced image.
   */
  private processPass(
    input: InputBuffer,
    image: MemoryImage,
    xOffset: number,
    yOffset: number,
    xStep: number,
    yStep: number,
    passWidth: number,
    passHeight: number
  ): void {
    let channels = 1;
    if (this._info!.colorType === PngDecoder.GRAYSCALE_ALPHA) {
      channels = 2;
    } else if (this._info!.colorType === PngDecoder.RGB) {
      channels = 3;
    } else if (this._info!.colorType === PngDecoder.RGBA) {
      channels = 4;
    }

    const pixelDepth = channels * this._info!.bits!;
    const bpp = (pixelDepth + 7) >> 3;
    const rowBytes = (pixelDepth * passWidth + 7) >> 3;

    const line = new Uint8Array(rowBytes);
    const inData = [line, line];

    const pixel = [0, 0, 0, 0];

    // Let pi: number = 0;
    for (
      let srcY = 0, dstY = yOffset, ri = 0;
      srcY < passHeight;
      ++srcY, dstY += yStep, ri = 1 - ri, this._progressY++
    ) {
      const filterType = input.readByte();
      inData[ri] = input.readBytes(rowBytes).toUint8Array();

      const row = inData[ri];
      const prevRow = inData[1 - ri];

      // Before the image is compressed, it was filtered to improve compression.
      // Reverse the filter now.
      PngDecoder.unfilter(filterType, bpp, row, prevRow);

      // Scanlines are always on byte boundaries, so for bit depths < 8,
      // reset the bit stream counter.
      this.resetBits();

      const rowInput = new InputBuffer({
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
        const c = this.getColor(pixel);
        image.setPixel(dstX, dstY, c);

        if (blockWidth > 1 || blockHeight > 1) {
          // Let xMax: number = Math.min(dstX + blockWidth, _info.width);
          // let xPixels: number = xMax - dstX;
          for (let i = 0; i < blockHeight; ++i) {
            for (let j = 0; j < blockWidth; ++j) {
              image.setPixelSafe(dstX + j, dstY + j, c);
            }
          }
        }
      }
    }
  }

  private process(input: InputBuffer, image: MemoryImage): void {
    let channels = 1;
    if (this._info!.colorType === PngDecoder.GRAYSCALE_ALPHA) {
      channels = 2;
    } else if (this._info!.colorType === PngDecoder.RGB) {
      channels = 3;
    } else if (this._info!.colorType === PngDecoder.RGBA) {
      channels = 4;
    }

    const pixelDepth = channels * this._info!.bits!;

    const w = this._info!.width;
    const h = this._info!.height;

    const rowBytes = (w * pixelDepth + 7) >> 3;
    const bpp = (pixelDepth + 7) >> 3;

    const line = new Uint8Array(rowBytes);
    const inData = [line, line];

    const pixel = [0, 0, 0, 0];

    for (let y = 0, pi = 0, ri = 0; y < h; ++y, ri = 1 - ri) {
      const filterType = input.readByte();
      inData[ri] = input.readBytes(rowBytes).toUint8Array();

      const row = inData[ri];
      const prevRow = inData[1 - ri];

      // Before the image is compressed, it was filtered to improve compression.
      // Reverse the filter now.
      PngDecoder.unfilter(filterType, bpp, row, prevRow);

      // Scanlines are always on byte boundaries, so for bit depths < 8,
      // reset the bit stream counter.
      this.resetBits();

      const rowInput = new InputBuffer({
        buffer: inData[ri],
        bigEndian: true,
      });

      for (let x = 0; x < w; ++x) {
        this.readPixel(rowInput, pixel);
        image.setPixelByIndex(pi++, this.getColor(pixel));
      }
    }
  }

  private resetBits(): void {
    this._bitBuffer = 0;
    this._bitBufferLen = 0;
  }

  /**
   * Read a number of bits from the input stream.
   */
  private readBits(input: InputBuffer, numBits: number): number {
    if (numBits === 0) {
      return 0;
    }

    if (numBits === 8) {
      return input.readByte();
    }

    if (numBits === 16) {
      return input.readUint16();
    }

    // Not enough buffer
    while (this._bitBufferLen < numBits) {
      if (input.isEOS) {
        throw new ImageError('Invalid PNG data.');
      }

      // Input byte
      const octet = input.readByte();

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

    const octet = (this._bitBuffer >> (this._bitBufferLen - numBits)) & mask;

    this._bitBufferLen -= numBits;

    return octet;
  }

  /**
   * Read the next pixel from the input stream.
   */
  private readPixel(input: InputBuffer, pixel: number[]): void {
    switch (this._info!.colorType) {
      case PngDecoder.GRAYSCALE:
        pixel[0] = this.readBits(input, this._info!.bits!);
        return;
      case PngDecoder.RGB:
        pixel[0] = this.readBits(input, this._info!.bits!);
        pixel[1] = this.readBits(input, this._info!.bits!);
        pixel[2] = this.readBits(input, this._info!.bits!);
        return;
      case PngDecoder.INDEXED:
        pixel[0] = this.readBits(input, this._info!.bits!);
        return;
      case PngDecoder.GRAYSCALE_ALPHA:
        pixel[0] = this.readBits(input, this._info!.bits!);
        pixel[1] = this.readBits(input, this._info!.bits!);
        return;
      case PngDecoder.RGBA:
        pixel[0] = this.readBits(input, this._info!.bits!);
        pixel[1] = this.readBits(input, this._info!.bits!);
        pixel[2] = this.readBits(input, this._info!.bits!);
        pixel[3] = this.readBits(input, this._info!.bits!);
        return;
    }
    throw new NotImplementedError(
      `Invalid color type: ${this._info!.colorType}.`
    );
  }

  /**
   * Get the color with the list of components.
   */
  private getColor(raw: number[]): number {
    switch (this._info!.colorType) {
      case PngDecoder.GRAYSCALE: {
        let g = 0;
        switch (this._info!.bits) {
          case 1:
            g = PngDecoder.convert1to8(raw[0]);
            break;
          case 2:
            g = PngDecoder.convert2to8(raw[0]);
            break;
          case 4:
            g = PngDecoder.convert4to8(raw[0]);
            break;
          case 8:
            g = raw[0];
            break;
          case 16:
            g = PngDecoder.convert16to8(raw[0]);
            break;
        }

        g = this._info!.colorLut![g];

        if (this._info!.transparency !== undefined) {
          const a =
            ((this._info!.transparency[0] & 0xff) << 24) |
            (this._info!.transparency[1] & 0xff);
          if (raw[0] === a) {
            return ColorUtils.getColor(g, g, g, 0);
          }
        }

        return ColorUtils.getColor(g, g, g);
      }
      case PngDecoder.RGB: {
        let r = 0;
        let g = 0;
        let b = 0;
        switch (this._info!.bits) {
          case 1:
            r = PngDecoder.convert1to8(raw[0]);
            g = PngDecoder.convert1to8(raw[1]);
            b = PngDecoder.convert1to8(raw[2]);
            break;
          case 2:
            r = PngDecoder.convert2to8(raw[0]);
            g = PngDecoder.convert2to8(raw[1]);
            b = PngDecoder.convert2to8(raw[2]);
            break;
          case 4:
            r = PngDecoder.convert4to8(raw[0]);
            g = PngDecoder.convert4to8(raw[1]);
            b = PngDecoder.convert4to8(raw[2]);
            break;
          case 8:
            r = raw[0];
            g = raw[1];
            b = raw[2];
            break;
          case 16:
            r = PngDecoder.convert16to8(raw[0]);
            g = PngDecoder.convert16to8(raw[1]);
            b = PngDecoder.convert16to8(raw[2]);
            break;
        }

        r = this._info!.colorLut![r]!;
        g = this._info!.colorLut![g]!;
        b = this._info!.colorLut![b]!;

        if (this._info!.transparency !== undefined) {
          const tr =
            ((this._info!.transparency[0] & 0xff) << 8) |
            (this._info!.transparency[1] & 0xff);
          const tg =
            ((this._info!.transparency[2] & 0xff) << 8) |
            (this._info!.transparency[3] & 0xff);
          const tb =
            ((this._info!.transparency[4] & 0xff) << 8) |
            (this._info!.transparency[5] & 0xff);
          if (raw[0] === tr && raw[1] === tg && raw[2] === tb) {
            return ColorUtils.getColor(r, g, b, 0);
          }
        }

        return ColorUtils.getColor(r, g, b);
      }
      case PngDecoder.INDEXED: {
        const p = raw[0] * 3;

        const a =
          this._info!.transparency !== undefined &&
          raw[0] < this._info!.transparency.length
            ? this._info!.transparency[raw[0]]
            : 255;

        if (p >= this._info!.palette!.length) {
          return ColorUtils.getColor(255, 255, 255, a);
        }

        const r = this._info!.palette![p]!;
        const g = this._info!.palette![p + 1]!;
        const b = this._info!.palette![p + 2]!;

        return ColorUtils.getColor(r, g, b, a);
      }
      case PngDecoder.GRAYSCALE_ALPHA: {
        let g = 0;
        let a = 0;
        switch (this._info!.bits) {
          case 1:
            g = PngDecoder.convert1to8(raw[0]);
            a = PngDecoder.convert1to8(raw[1]);
            break;
          case 2:
            g = PngDecoder.convert2to8(raw[0]);
            a = PngDecoder.convert2to8(raw[1]);
            break;
          case 4:
            g = PngDecoder.convert4to8(raw[0]);
            a = PngDecoder.convert4to8(raw[1]);
            break;
          case 8:
            g = raw[0];
            a = raw[1];
            break;
          case 16:
            g = PngDecoder.convert16to8(raw[0]);
            a = PngDecoder.convert16to8(raw[1]);
            break;
        }

        g = this._info!.colorLut![g]!;

        return ColorUtils.getColor(g, g, g, a);
      }
      case PngDecoder.RGBA: {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        switch (this._info!.bits) {
          case 1:
            r = PngDecoder.convert1to8(raw[0]);
            g = PngDecoder.convert1to8(raw[1]);
            b = PngDecoder.convert1to8(raw[2]);
            a = PngDecoder.convert1to8(raw[3]);
            break;
          case 2:
            r = PngDecoder.convert2to8(raw[0]);
            g = PngDecoder.convert2to8(raw[1]);
            b = PngDecoder.convert2to8(raw[2]);
            a = PngDecoder.convert2to8(raw[3]);
            break;
          case 4:
            r = PngDecoder.convert4to8(raw[0]);
            g = PngDecoder.convert4to8(raw[1]);
            b = PngDecoder.convert4to8(raw[2]);
            a = PngDecoder.convert4to8(raw[3]);
            break;
          case 8:
            r = raw[0];
            g = raw[1];
            b = raw[2];
            a = raw[3];
            break;
          case 16:
            r = PngDecoder.convert16to8(raw[0]);
            g = PngDecoder.convert16to8(raw[1]);
            b = PngDecoder.convert16to8(raw[2]);
            a = PngDecoder.convert16to8(raw[3]);
            break;
        }

        r = this._info!.colorLut![r]!;
        g = this._info!.colorLut![g]!;
        b = this._info!.colorLut![b]!;

        return ColorUtils.getColor(r, g, b, a);
      }
    }

    throw new ImageError(`Invalid color type: ${this._info!.colorType}.`);
  }

  /**
   * Is the given file a valid PNG image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });
    const pngHeader = input.readBytes(8);
    const PNG_HEADER = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; ++i) {
      if (pngHeader.getByte(i) !== PNG_HEADER[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Start decoding the data as an animation sequence, but don't actually
   * process the frames until they are requested with decodeFrame.
   */
  public startDecode(bytes: Uint8Array): DecodeInfo | undefined {
    this._input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });
    const pngHeader = this._input.readBytes(8);
    const expectedHeader = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; ++i) {
      if (pngHeader.getByte(i) !== expectedHeader[i]) {
        return undefined;
      }
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const inputPos = this._input.position;
      let chunkSize = this._input.readUint32();
      const chunkType = this._input.readString(4);
      switch (chunkType) {
        case 'tEXt': {
          if (this._info === undefined) {
            this._info = new PngInfo();
          }
          const txtData = this._input.readBytes(chunkSize).toUint8Array();
          for (let i = 0, l = txtData.length; i < l; ++i) {
            if (txtData[i] === 0) {
              const key = TextCodec.latin1Decoder.decode(
                ListUtils.copyUint8(txtData, 0, i)
              );
              const text = TextCodec.latin1Decoder.decode(
                ListUtils.copyUint8(txtData, i + 1)
              );
              this._info.textData.set(key, text);
              break;
            }
          }
          // CRC
          this._input.skip(4);
          break;
        }
        case 'IHDR': {
          const hdr = InputBuffer.from(this._input.readBytes(chunkSize));
          const hdrBytes: Uint8Array = hdr.toUint8Array();

          const width = hdr.readUint32();
          const height = hdr.readUint32();
          const bits = hdr.readByte();
          const colorType = hdr.readByte();
          const compressionMethod = hdr.readByte();
          const filterMethod = hdr.readByte();
          const interlaceMethod = hdr.readByte();

          this._info = new PngInfo({
            width: width,
            height: height,
            bits: bits,
            colorType: colorType,
            compressionMethod: compressionMethod,
            filterMethod: filterMethod,
            interlaceMethod: interlaceMethod,
          });

          // Validate some of the info in the header to make sure we support
          // the proposed image data.
          if (
            ![
              PngDecoder.GRAYSCALE,
              PngDecoder.RGB,
              PngDecoder.INDEXED,
              PngDecoder.GRAYSCALE_ALPHA,
              PngDecoder.RGBA,
            ].includes(this._info.colorType!)
          ) {
            return undefined;
          }

          if (this._info.filterMethod !== 0) {
            return undefined;
          }

          switch (this._info.colorType) {
            case PngDecoder.GRAYSCALE:
              if (![1, 2, 4, 8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngDecoder.RGB:
              if (![8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngDecoder.INDEXED:
              if (![1, 2, 4, 8].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngDecoder.GRAYSCALE_ALPHA:
              if (![8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
            case PngDecoder.RGBA:
              if (![8, 16].includes(this._info.bits!)) {
                return undefined;
              }
              break;
          }

          const crc = this._input.readUint32();
          const computedCrc = PngDecoder.crc(chunkType, hdrBytes);
          if (crc !== computedCrc) {
            throw new ImageError(`Invalid ${chunkType} checksum`);
          }
          break;
        }
        case 'PLTE': {
          this._info!.palette = this._input.readBytes(chunkSize).toUint8Array();
          const crc = this._input.readUint32();
          const computedCrc = PngDecoder.crc(chunkType, this._info!.palette);
          if (crc !== computedCrc) {
            throw new ImageError(`Invalid ${chunkType} checksum`);
          }
          break;
        }
        case 'tRNS': {
          this._info!.transparency = this._input
            .readBytes(chunkSize)
            .toUint8Array();
          const crc = this._input.readUint32();
          const computedCrc = PngDecoder.crc(
            chunkType,
            this._info!.transparency
          );
          if (crc !== computedCrc) {
            throw new ImageError(`Invalid ${chunkType} checksum`);
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
            throw new ImageError('Invalid gAMA chunk');
          }
          const gammaInt = this._input.readUint32();
          // CRC
          this._input.skip(4);
          // A gamma of 1.0 doesn't have any affect, so pretend we didn't get
          // a gamma in that case.
          if (gammaInt !== 100000) {
            this._info!.gamma = gammaInt / 100000.0;
          }
          break;
        }
        case 'IDAT': {
          this._info!.idat.push(inputPos);
          this._input.skip(chunkSize);
          // CRC
          this._input.skip(4);
          break;
        }
        case 'acTL': {
          // Animation control chunk
          this._info!.numFrames = this._input.readUint32();
          this._info!.repeat = this._input.readUint32();
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
          const dispose = this._input.readByte();
          const blend = this._input.readByte();
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
          this._info!.frames.push(frame);
          break;
        }
        case 'fdAT': {
          // @ts-ignore
          const sequenceNumber = this._input.readUint32();
          const frame = this._info!.frames[this._info!.frames.length - 1];
          frame.fdat.push(inputPos);
          this._input.skip(chunkSize - 4);
          // CRC
          this._input.skip(4);
          break;
        }
        case 'bKGD': {
          if (this._info!.colorType === 3) {
            const paletteIndex = this._input.readByte();
            chunkSize--;
            const p3 = paletteIndex * 3;
            const r = this._info!.palette![p3]!;
            const g = this._info!.palette![p3 + 1]!;
            const b = this._info!.palette![p3 + 2]!;
            this._info!.backgroundColor = Color.fromRgb(r, g, b);
          } else if (
            this._info!.colorType === 0 ||
            this._info!.colorType === 4
          ) {
            /* Const gray: number = */
            this._input.readUint16();
            chunkSize -= 2;
          } else if (
            this._info!.colorType === 2 ||
            this._info!.colorType === 6
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
          this._info!.iCCPName = this._input.readString();
          // 0: deflate
          this._info!.iCCPCompression = this._input.readByte();
          chunkSize -= this._info!.iCCPName.length + 2;
          const profile = this._input.readBytes(chunkSize);
          this._info!.iCCPData = profile.toUint8Array();
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
   * Decode the frame (assuming [startDecode] has already been called).
   */
  public decodeFrame(frame: number): MemoryImage | undefined {
    if (this._input === undefined || this._info === undefined) {
      return undefined;
    }

    let imageData: Uint8Array | undefined = undefined;
    let width: number | undefined = this._info.width;
    let height: number | undefined = this._info.height;

    if (!this._info.isAnimated || frame === 0) {
      let totalSize = 0;
      const dataBlocks: Uint8Array[] = new Array<Uint8Array>();
      for (let i = 0, len = this._info.idat.length; i < len; ++i) {
        this._input.offset = this._info.idat[i];
        const chunkSize = this._input.readUint32();
        const chunkType = this._input.readString(4);
        const data = this._input.readBytes(chunkSize).toUint8Array();
        totalSize += data.length;
        dataBlocks.push(data);
        const crc = this._input.readUint32();
        const computedCrc = PngDecoder.crc(chunkType, data);
        if (crc !== computedCrc) {
          throw new ImageError(`Invalid ${chunkType} checksum`);
        }
      }
      imageData = new Uint8Array(totalSize);
      let offset = 0;
      for (const data of dataBlocks) {
        imageData.set(data, offset);
        offset += data.length;
      }
    } else {
      if (frame < 0 || frame >= this._info.frames.length) {
        throw new ImageError(`Invalid Frame Number: ${frame}`);
      }

      const f = this._info.frames[frame];
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
        const data = this._input.readBytes(chunkSize - 4).toUint8Array();
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

    const rgbChannelSet: RgbChannelSet =
      this._info.colorType === PngDecoder.GRAYSCALE_ALPHA ||
      this._info.colorType === PngDecoder.RGBA ||
      this._info.transparency !== undefined
        ? RgbChannelSet.rgba
        : RgbChannelSet.rgb;

    const image = new MemoryImage({
      width: width!,
      height: height!,
      rgbChannelSet: rgbChannelSet,
    });

    let uncompressed: Uint8Array | undefined = undefined;
    try {
      uncompressed = inflate(imageData);
    } catch (error) {
      console.error(error);
      return undefined;
    }

    // Input is the decompressed data.
    const input = new InputBuffer({
      buffer: uncompressed,
      bigEndian: true,
    });
    this.resetBits();

    // Set up a LUT to transform colors for gamma correction.
    if (this._info.colorLut === undefined) {
      this._info.colorLut = [];
      for (let i = 0; i < 256; i++) {
        const c = i;
        // if (this._info.gamma != null) {
        //     c = Math.trunc(Math.pow((c / 255.0), this._info.gamma) * 255.0);
        // }
        this._info.colorLut.push(c);
      }

      // Apply the LUT to the palette, if necessary.
      if (this._info.palette !== undefined && this._info.gamma !== undefined) {
        for (let i = 0; i < this._info.palette.length; ++i) {
          this._info.palette[i] = this._info.colorLut[this._info.palette[i]];
        }
      }
    }

    const origW = this._info.width;
    const origH = this._info.height;
    this._info.width = width!;
    this._info.height = height!;

    const w = width!;
    const h = height!;
    this._progressY = 0;
    if (this._info.interlaceMethod !== 0) {
      this.processPass(input, image, 0, 0, 8, 8, (w + 7) >> 3, (h + 7) >> 3);
      this.processPass(input, image, 4, 0, 8, 8, (w + 3) >> 3, (h + 7) >> 3);
      this.processPass(input, image, 0, 4, 4, 8, (w + 3) >> 2, (h + 3) >> 3);
      this.processPass(input, image, 2, 0, 4, 4, (w + 1) >> 2, (h + 3) >> 2);
      this.processPass(input, image, 0, 2, 2, 4, (w + 1) >> 1, (h + 1) >> 2);
      this.processPass(input, image, 1, 0, 2, 2, w >> 1, (h + 1) >> 1);
      this.processPass(input, image, 0, 1, 1, 2, w, h >> 1);
    } else {
      this.process(input, image);
    }

    this._info.width = origW;
    this._info.height = origH;

    if (this._info.iCCPData !== undefined) {
      image.iccProfile = new ICCProfileData(
        this._info.iCCPName,
        ICCPCompressionMode.deflate,
        this._info.iCCPData
      );
    }

    if (this._info.textData.size > 0) {
      image.addTextData(this._info.textData);
    }

    return image;
  }

  public decodeHdrFrame(frame: number): HdrImage | undefined {
    const img = this.decodeFrame(frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }

  public decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    const animation = new FrameAnimation({
      width: this._info!.width,
      height: this._info!.height,
    });

    if (!this._info!.isAnimated) {
      const image = this.decodeFrame(0)!;
      animation.addFrame(image);
      return animation;
    }

    let lastImage: MemoryImage | undefined = undefined;
    for (let i = 0; i < this._info!.numFrames; ++i) {
      const frame = this._info!.frames[i];
      const image = this.decodeFrame(i);
      if (image === undefined) {
        continue;
      }

      if (lastImage === undefined) {
        lastImage = image;
        // Convert to MS
        lastImage.duration = Math.trunc(frame.delay * 1000);
        animation.addFrame(lastImage);
        continue;
      }

      if (
        image.width === lastImage.width &&
        image.height === lastImage.height &&
        frame.xOffset === 0 &&
        frame.yOffset === 0 &&
        frame.blend === PngFrame.APNG_BLEND_OP_SOURCE
      ) {
        lastImage = image;
        // Convert to MS
        lastImage.duration = Math.trunc(frame.delay * 1000);
        animation.addFrame(lastImage);
        continue;
      }

      const dispose = frame.dispose;
      if (dispose === PngFrame.APNG_DISPOSE_OP_BACKGROUND) {
        lastImage = new MemoryImage({
          width: lastImage.width,
          height: lastImage.height,
        });
        lastImage.fill(this._info!.backgroundColor);
      } else if (dispose === PngFrame.APNG_DISPOSE_OP_PREVIOUS) {
        lastImage = MemoryImage.from(lastImage);
      } else {
        lastImage = MemoryImage.from(lastImage);
      }

      // Convert to MS
      lastImage.duration = Math.trunc(frame.delay * 1000);

      CopyIntoTransform.copyInto({
        dst: lastImage,
        src: image,
        dstX: frame.xOffset,
        dstY: frame.yOffset,
        blend: frame.blend === PngFrame.APNG_BLEND_OP_OVER,
      });

      animation.addFrame(lastImage);
    }

    return animation;
  }

  public decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }
    return this.decodeFrame(frame);
  }

  public decodeHdrImage(bytes: Uint8Array, frame = 0): HdrImage | undefined {
    const img = this.decodeImage(bytes, frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }
}
