/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { ArrayUtils } from '../common/array-utils.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { GifColorMap } from './gif/gif-color-map.js';
import { GifImageDesc } from './gif/gif-image-desc.js';
import { GifInfo } from './gif/gif-info.js';
import { MemoryImage } from '../image/image.js';
import { ColorUint8 } from '../color/color-uint8.js';
import { ImageFormat } from './image-format.js';

/**
 * A decoder for the GIF image format. This supports both single frame and
 * animated GIF files, and transparency.
 */
export class GifDecoder implements Decoder {
  /** Size of the GIF stamp */
  private static readonly _stampSize: number = 6;
  /** GIF87a stamp */
  private static readonly _gif87Stamp: string = 'GIF87a';
  /** GIF89a stamp */
  private static readonly _gif89Stamp: string = 'GIF89a';

  /** Image descriptor record type */
  private static readonly _imageDescRecordType: number = 0x2c;
  /** Extension record type */
  private static readonly _extensionRecordType: number = 0x21;
  /** Terminate record type */
  private static readonly _terminateRecordType: number = 0x3b;

  /** Graphic control extension */
  private static readonly _graphicControlExt: number = 0xf9;
  /** Application extension */
  private static readonly _applicationExt: number = 0xff;

  /** Maximum LZ code */
  private static readonly _lzMaxCode: number = 4095;
  /** LZ bits */
  private static readonly _lzBits: number = 12;

  /** Impossible code, to signal empty. */
  private static readonly _noSuchCode: number = 4098;

  /** Code masks */
  private static readonly _codeMasks: number[] = [
    0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff,
  ];

  /** Interlaced offset */
  private static readonly _interlacedOffset: number[] = [0, 4, 2, 1];
  /** Interlaced jump */
  private static readonly _interlacedJump: number[] = [8, 8, 4, 2];

  /** Input buffer */
  private _input?: InputBuffer<Uint8Array>;

  /** GIF information */
  private _info?: GifInfo;

  /** Repeat count */
  private _repeat = 0;

  /** Buffer */
  private _buffer?: Uint8Array;

  /** Stack */
  private _stack!: Uint8Array;

  /** Suffix */
  private _suffix!: Uint8Array;

  /** Prefix */
  private _prefix?: Uint32Array;

  /** Bits per pixel */
  private _bitsPerPixel = 0;

  /** Pixel count */
  private _pixelCount?: number;

  /** Current shift DWORD */
  private _currentShiftDWord = 0;

  /** Current shift state */
  private _currentShiftState = 0;

  /** Stack pointer */
  private _stackPtr = 0;

  /** Current code */
  private _currentCode?: number;

  /** Last code */
  private _lastCode = 0;

  /** Max code + 1 */
  private _maxCode1 = 0;

  /** Running bits */
  private _runningBits = 0;

  /** Running code */
  private _runningCode = 0;

  /** EOF code */
  private _eofCode = 0;

  /** Clear code */
  private _clearCode = 0;

  /** Transparent flag */
  private _transparentFlag: number = 0;

  /** Disposal method */
  private _disposalMethod: number = 0;

  /** Transparent color index */
  private _transparent: number = 0;

  /** Frame duration */
  private _duration: number = 0;

  /**
   * Get the image format.
   */
  get format(): ImageFormat {
    return ImageFormat.gif;
  }

  /**
   * How many frames are available to decode?
   *
   * You should have prepared the decoder by either passing the file bytes
   * to the constructor, or calling getInfo.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  /**
   * Constructor for GifDecoder.
   * @param {Uint8Array} [bytes] - Optional bytes to start decoding.
   */
  constructor(bytes?: Uint8Array) {
    if (bytes !== undefined) {
      this.startDecode(bytes);
    }
  }

  /**
   * Routine to trace the Prefixes linked list until we get a prefix which is
   * not code, but a pixel value (less than ClearCode). Returns that pixel value.
   * If image is defective, we might loop here forever, so we limit the loops to
   * the maximum possible if image O.k. - lzMaxCode times.
   * @param {Uint32Array} prefix - The prefix array.
   * @param {number} code - The code to trace.
   * @param {number} clearCode - The clear code.
   * @returns {number} The prefix character.
   */
  private static getPrefixChar(
    prefix: Uint32Array,
    code: number,
    clearCode: number
  ): number {
    let c = code;
    let i = 0;
    while (c > clearCode && i++ <= GifDecoder._lzMaxCode) {
      if (c > GifDecoder._lzMaxCode) {
        return GifDecoder._noSuchCode;
      }
      c = prefix[c];
    }
    return c;
  }

  /**
   * Update the image with the given line.
   * @param {MemoryImage} image - The memory image.
   * @param {number} y - The y-coordinate.
   * @param {GifColorMap} [colorMap] - The color map.
   * @param {Uint8Array} line - The line of pixels.
   */
  private static updateImage(
    image: MemoryImage,
    y: number,
    colorMap: GifColorMap | undefined,
    line: Uint8Array
  ): void {
    if (colorMap !== undefined) {
      const width = line.length;
      for (let x = 0; x < width; ++x) {
        image.setPixelRgb(x, y, line[x], 0, 0);
      }
    }
  }

  /**
   * Get information about the GIF.
   * @returns {boolean} True if successful, false otherwise.
   */
  private getInfo(): boolean {
    if (this._input === undefined) {
      return false;
    }

    const tag = this._input.readString(GifDecoder._stampSize);
    if (tag !== GifDecoder._gif87Stamp && tag !== GifDecoder._gif89Stamp) {
      return false;
    }

    const width = this._input.readUint16();
    const height = this._input.readUint16();

    const b = this._input.read();
    const colorResolution = (((b & 0x70) + 1) >>> 4) + 1;

    const bitsPerPixel = (b & 0x07) + 1;
    const backgroundColor = new ColorUint8(
      new Uint8Array([this._input.read()])
    );

    this._input.skip(1);

    let globalColorMap: GifColorMap | undefined = undefined;
    // Is there a global color map?
    if ((b & 0x80) !== 0) {
      globalColorMap = new GifColorMap(1 << bitsPerPixel);

      // Get the global color map:
      for (let i = 0; i < globalColorMap.numColors; ++i) {
        const r = this._input.read();
        const g = this._input.read();
        const b = this._input.read();
        globalColorMap.setColor(i, r, g, b);
      }
    }

    const isGif89 = tag === GifDecoder._gif89Stamp;

    this._info = new GifInfo({
      width: width,
      height: height,
      colorResolution: colorResolution,
      backgroundColor: backgroundColor,
      globalColorMap: globalColorMap,
      isGif89: isGif89,
    });

    return true;
  }

  /**
   * Skip the current image.
   * @returns {GifImageDesc | undefined} The skipped image descriptor or undefined.
   */
  private skipImage(): GifImageDesc | undefined {
    if (this._input === undefined || this._input.isEOS) {
      return undefined;
    }
    const gifImage = new GifImageDesc(this._input);
    this._input.skip(1);
    this.skipRemainder();
    return gifImage;
  }

  /**
   * Continue to get the image code in compressed form. This routine should be
   * called until NULL block is returned.
   * The block should NOT be freed by the user (not dynamically allocated).
   * @returns {boolean} True if successful, false otherwise.
   */
  private skipRemainder(): boolean {
    if (this._input === undefined || this._input.isEOS) {
      return true;
    }
    let b = this._input.read();
    while (b !== 0 && !this._input.isEOS) {
      this._input.skip(b);
      if (this._input.isEOS) {
        return true;
      }
      b = this._input.read();
    }
    return true;
  }

  /**
   * Read the application extension.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   */
  private readApplicationExt(input: InputBuffer<Uint8Array>): void {
    const blockSize = input.read();
    const tag = input.readString(blockSize);
    if (tag === 'NETSCAPE2.0') {
      const b1 = input.read();
      const b2 = input.read();
      if (b1 === 0x03 && b2 === 0x01) {
        this._repeat = input.readUint16();
      }
    } else {
      this.skipRemainder();
    }
  }

  /**
   * Read the graphics control extension.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   */
  private readGraphicsControlExt(input: InputBuffer<Uint8Array>): void {
    /* const blockSize: number = */
    input.read();
    const b = input.read();
    this._duration = input.readUint16();
    this._transparent = input.read();
    /* const endBlock: number = */
    input.read();
    this._disposalMethod = (b >>> 2) & 0x7;
    // const userInput: number = (b >>> 1) & 0x1;
    this._transparentFlag = b & 0x1;

    const recordType = input.peek(1).get(0);
    if (recordType === GifDecoder._imageDescRecordType) {
      input.skip(1);
      const gifImage = this.skipImage();
      if (gifImage === undefined) {
        return;
      }

      gifImage.duration = this._duration;
      gifImage.disposal = this._disposalMethod;

      if (this._transparentFlag !== 0) {
        if (
          gifImage.colorMap === undefined &&
          this._info!.globalColorMap !== undefined
        ) {
          gifImage.colorMap = GifColorMap.from(this._info!.globalColorMap);
        }
        if (gifImage.colorMap !== undefined) {
          gifImage.colorMap.transparent = this._transparent;
        }
      }

      this._info!.frames.push(gifImage);
    }
  }

  /**
   * Get a line of pixels.
   * @param {Uint8Array} line - The line of pixels.
   * @returns {boolean} True if successful, false otherwise.
   */
  private getLine(line: Uint8Array): boolean {
    this._pixelCount = this._pixelCount! - line.length;

    if (!this.decompressLine(line)) {
      return false;
    }

    // Flush any remainder blocks.
    if (this._pixelCount === 0) {
      this.skipRemainder();
    }

    return true;
  }

  /**
   * The LZ decompression routine:
   * This version decompress the given gif file into Line of length LineLen.
   * This routine can be called few times (one per scan line, for example), in
   * order the complete the whole image.
   * @param {Uint8Array} line - The line of pixels.
   * @returns {boolean} True if successful, false otherwise.
   */
  private decompressLine(line: Uint8Array): boolean {
    if (this._stackPtr > GifDecoder._lzMaxCode) {
      return false;
    }

    const lineLen = line.length;
    let i = 0;

    if (this._stackPtr !== 0) {
      // Let pop the stack off before continuing to read the gif file:
      while (this._stackPtr !== 0 && i < lineLen) {
        line[i++] = this._stack[--this._stackPtr];
      }
    }

    let currentPrefix: number | undefined = undefined;

    // Decode LineLen items.
    while (i < lineLen) {
      this._currentCode = this.decompressInput();
      if (this._currentCode === undefined) {
        return false;
      }

      if (this._currentCode === this._eofCode) {
        // Note however that usually we will not be here as we will stop
        // decoding as soon as we got all the pixel, or EOF code will
        // not be read at all, and DGifGetLine/Pixel clean everything.
        return false;
      }

      if (this._currentCode === this._clearCode) {
        // We need to start over again:
        for (let j = 0; j <= GifDecoder._lzMaxCode; j++) {
          this._prefix![j] = GifDecoder._noSuchCode;
        }

        this._runningCode = this._eofCode + 1;
        this._runningBits = this._bitsPerPixel + 1;
        this._maxCode1 = 1 << this._runningBits;
        this._lastCode = GifDecoder._noSuchCode;
      } else {
        // Its regular code - if in pixel range simply add it to output
        // stream, otherwise trace to codes linked list until the prefix
        // is in pixel range:
        if (this._currentCode < this._clearCode) {
          // This is simple - its pixel scalar, so add it to output:
          line[i++] = this._currentCode;
        } else {
          // Its a code to needed to be traced: trace the linked list
          // until the prefix is a pixel, while pushing the suffix
          // pixels on our stack. If we done, pop the stack in reverse
          // (thats what stack is good for!) order to output. */
          if (this._prefix![this._currentCode] === GifDecoder._noSuchCode) {
            // Only allowed if CrntCode is exactly the running code:
            // In that case CrntCode = XXXCode, CrntCode or the
            // prefix code is last code and the suffix char is
            // exactly the prefix of last code!
            if (this._currentCode === this._runningCode - 2) {
              currentPrefix = this._lastCode;
              const prefixChar = GifDecoder.getPrefixChar(
                this._prefix!,
                this._lastCode,
                this._clearCode
              );
              this._stack[this._stackPtr++] = prefixChar;
              this._suffix[this._runningCode - 2] = prefixChar;
            } else {
              return false;
            }
          } else {
            currentPrefix = this._currentCode;
          }

          // Now (if image is O.K.) we should not get an noSuchCode
          // During the trace. As we might loop forever, in case of
          // defective image, we count the number of loops we trace
          // and stop if we got lzMaxCode. obviously we can not
          // loop more than that.
          let j = 0;
          while (
            j++ <= GifDecoder._lzMaxCode &&
            currentPrefix > this._clearCode &&
            currentPrefix <= GifDecoder._lzMaxCode
          ) {
            this._stack[this._stackPtr++] = this._suffix[currentPrefix];
            currentPrefix = this._prefix![currentPrefix];
          }

          if (
            j >= GifDecoder._lzMaxCode ||
            currentPrefix > GifDecoder._lzMaxCode
          ) {
            return false;
          }

          // Push the last character on stack:
          this._stack[this._stackPtr++] = currentPrefix;

          // Now lets pop all the stack into output:
          while (this._stackPtr !== 0 && i < lineLen) {
            line[i++] = this._stack[--this._stackPtr];
          }
        }

        if (
          this._lastCode !== GifDecoder._noSuchCode &&
          this._prefix![this._runningCode - 2] === GifDecoder._noSuchCode
        ) {
          this._prefix![this._runningCode - 2] = this._lastCode;

          if (this._currentCode === this._runningCode - 2) {
            // Only allowed if CrntCode is exactly the running code:
            // In that case CrntCode = XXXCode, CrntCode or the
            // prefix code is last code and the suffix char is
            // exactly the prefix of last code!
            this._suffix[this._runningCode - 2] = GifDecoder.getPrefixChar(
              this._prefix!,
              this._lastCode,
              this._clearCode
            );
          } else {
            this._suffix[this._runningCode - 2] = GifDecoder.getPrefixChar(
              this._prefix!,
              this._currentCode,
              this._clearCode
            );
          }
        }

        this._lastCode = this._currentCode;
      }
    }

    return true;
  }

  /**
   * The LZ decompression input routine:
   * This routine is responsible for the decompression of the bit stream from
   * 8 bits (bytes) packets, into the real codes.
   * @returns {number | undefined} The decompressed code or undefined.
   */
  private decompressInput(): number | undefined {
    // The image can't contain more than LZ_BITS per code.
    if (this._runningBits > GifDecoder._lzBits) {
      return undefined;
    }

    while (this._currentShiftState < this._runningBits) {
      // Needs to get more bytes from input stream for next code:
      const nextByte = this.bufferedInput()!;

      this._currentShiftDWord |= nextByte << this._currentShiftState;
      this._currentShiftState += 8;
    }

    const code: number =
      this._currentShiftDWord & GifDecoder._codeMasks[this._runningBits];

    this._currentShiftDWord >>>= this._runningBits;
    this._currentShiftState -= this._runningBits;

    // If code cannot fit into RunningBits bits, must raise its size. Note
    // however that codes above 4095 are used for special signaling.
    // If we're using lzBits bits already and we're at the max code, just
    // keep using the table as it is, don't increment Private->RunningCode.
    if (
      this._runningCode < GifDecoder._lzMaxCode + 2 &&
      ++this._runningCode > this._maxCode1 &&
      this._runningBits < GifDecoder._lzBits
    ) {
      this._maxCode1 <<= 1;
      this._runningBits++;
    }

    return code;
  }

  /**
   * This routines read one gif data block at a time and buffers it internally
   * so that the decompression routine could access it.
   * The routine returns the next byte from its internal buffer (or read next
   * block in if buffer empty) and returns undefined on failure.
   * @returns {number | undefined} The next byte from the internal buffer or undefined on failure.
   */
  private bufferedInput(): number | undefined {
    let nextByte = 0;
    if (this._buffer![0] === 0) {
      // Needs to read the next buffer - this one is empty:
      this._buffer![0] = this._input!.read();

      // There shouldn't be any empty data blocks here as the LZW spec
      // says the LZW termination code should come first. Therefore we
      // shouldn't be inside this routine at that point.
      if (this._buffer![0] === 0) {
        return undefined;
      }

      const from = this._input!.readRange(this._buffer![0]).toUint8Array();

      ArrayUtils.copyRange(from, 0, this._buffer!, 1, this._buffer![0]);

      nextByte = this._buffer![1];
      // We use now the second place as last char read!
      this._buffer![1] = 2;
      this._buffer![0]--;
    } else {
      nextByte = this._buffer![this._buffer![1]++];
      this._buffer![0]--;
    }

    return nextByte;
  }

  /**
   * Initializes the decoding process by setting up necessary buffers and arrays.
   */
  private initDecode(): void {
    this._buffer = new Uint8Array(256);
    this._stack = new Uint8Array(GifDecoder._lzMaxCode);
    this._suffix = new Uint8Array(GifDecoder._lzMaxCode + 1);
    this._prefix = new Uint32Array(GifDecoder._lzMaxCode + 1);
  }

  /**
   * Decodes a given Gif image description into a MemoryImage.
   * @param {GifImageDesc} gifImage - The Gif image description to decode.
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined on failure.
   */
  private decodeImage(gifImage: GifImageDesc): MemoryImage | undefined {
    if (this._input === undefined || this._info === undefined) {
      return undefined;
    }

    if (this._buffer === undefined) {
      this.initDecode();
    }

    this._bitsPerPixel = this._input.read();
    this._clearCode = 1 << this._bitsPerPixel;
    this._eofCode = this._clearCode + 1;
    this._runningCode = this._eofCode + 1;
    this._runningBits = this._bitsPerPixel + 1;
    this._maxCode1 = 1 << this._runningBits;
    this._stackPtr = 0;
    this._lastCode = GifDecoder._noSuchCode;
    this._currentShiftState = 0;
    this._currentShiftDWord = 0;
    this._buffer![0] = 0;
    this._prefix!.fill(GifDecoder._noSuchCode, 0, this._prefix!.length);

    const width = gifImage.width;
    const height = gifImage.height;

    if (
      gifImage.x + width > this._info.width ||
      gifImage.y + height > this._info.height
    ) {
      return undefined;
    }

    const colorMap =
      gifImage.colorMap !== undefined
        ? gifImage.colorMap!
        : this._info.globalColorMap!;

    this._pixelCount = width * height;

    const image = new MemoryImage({
      width: width,
      height: height,
      numChannels: 1,
      palette: colorMap.getPalette(),
    });

    const line = new Uint8Array(width);

    if (gifImage.interlaced) {
      const row = gifImage.y;
      for (let i = 0, j = 0; i < 4; ++i) {
        for (
          let y = row + GifDecoder._interlacedOffset[i];
          y < row + height;
          y += GifDecoder._interlacedJump[i], ++j
        ) {
          if (!this.getLine(line)) {
            return image;
          }
          GifDecoder.updateImage(image, y, colorMap, line);
        }
      }
    } else {
      for (let y = 0; y < height; ++y) {
        if (!this.getLine(line)) {
          return image;
        }
        GifDecoder.updateImage(image, y, colorMap, line);
      }
    }

    return image;
  }

  /**
   * Is the given file a valid Gif image?
   * @param {Uint8Array} bytes - The bytes of the file to check.
   * @returns {boolean} True if the file is a valid Gif image, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    return this.getInfo();
  }

  /**
   * Validate the file is a Gif image and get information about it.
   * If the file is not a valid Gif image, undefined is returned.
   * @param {Uint8Array} bytes - The bytes of the file to decode.
   * @returns {GifInfo | undefined} The Gif information or undefined if the file is not valid.
   */
  public startDecode(bytes: Uint8Array): GifInfo | undefined {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });

    if (!this.getInfo()) {
      return undefined;
    }

    try {
      while (!this._input.isEOS) {
        const recordType = this._input.read();
        switch (recordType) {
          case GifDecoder._imageDescRecordType: {
            const gifImage = this.skipImage();
            if (gifImage === undefined) {
              return this._info;
            }
            gifImage.duration = this._duration;
            gifImage.disposal = this._disposalMethod;
            if (this._transparentFlag !== 0) {
              if (
                gifImage.colorMap === undefined &&
                this._info!.globalColorMap !== undefined
              ) {
                gifImage.colorMap = GifColorMap.from(
                  this._info!.globalColorMap!
                );
              }
              if (gifImage.colorMap !== undefined) {
                gifImage.colorMap.transparent = this._transparent;
              }
            }
            this._info!.frames.push(gifImage);
            break;
          }
          case GifDecoder._extensionRecordType: {
            const extCode = this._input.read();
            if (extCode === GifDecoder._applicationExt) {
              this.readApplicationExt(this._input);
            } else if (extCode === GifDecoder._graphicControlExt) {
              this.readGraphicsControlExt(this._input);
            } else {
              this.skipRemainder();
            }
            break;
          }
          case GifDecoder._terminateRecordType: {
            return this._info;
          }
          default:
            break;
        }
      }
    } catch (error) {
      // ignore
    }

    return this._info;
  }

  /**
   * Decodes the Gif image based on the provided options.
   * @param {DecoderDecodeOptions} opt - The decoding options.
   * @param {Uint8Array} opt.bytes - The bytes of the Gif image.
   * @param {number} [opt.frameIndex] - The index of the frame to decode (optional).
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined on failure.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;

    if (this.startDecode(bytes) === undefined || this._info === undefined) {
      return undefined;
    }

    if (this._info.numFrames === 1 || opt.frameIndex !== undefined) {
      return this.decodeFrame(opt.frameIndex ?? 0);
    }

    let firstImage: MemoryImage | undefined = undefined;
    let lastImage: MemoryImage | undefined = undefined;
    for (let i = 0; i < this._info.numFrames; ++i) {
      const frame = this._info.frames[i];
      const image = this.decodeFrame(i);
      if (image === undefined) {
        return undefined;
      }

      // Convert to MS
      image.frameDuration = frame.duration * 10;

      if (firstImage === undefined || lastImage === undefined) {
        firstImage = image;
        lastImage = image;
        image.loopCount = this._repeat;
        continue;
      }

      if (
        image.width === lastImage.width &&
        image.height === lastImage.height &&
        frame.x === 0 &&
        frame.y === 0 &&
        frame.disposal === 2
      ) {
        lastImage = image;
        firstImage.addFrame(lastImage);
        continue;
      }

      const colorMap =
        frame.colorMap !== undefined
          ? frame.colorMap
          : this._info.globalColorMap!;

      const nextImage: MemoryImage = new MemoryImage({
        width: lastImage.width,
        height: lastImage.height,
        numChannels: 1,
        palette: colorMap.getPalette(),
      });

      if (frame.disposal === 2) {
        nextImage.clear(colorMap.getColor(this._info.backgroundColor!.r));
      } else if (frame.disposal !== 3) {
        if (frame.colorMap !== undefined) {
          const lp = lastImage.palette!;
          const remapColors = new Map<number, number>();
          for (let ci = 0; ci < colorMap.numColors; ++ci) {
            const nc = colorMap.findColor(
              lp.getRed(ci),
              lp.getGreen(ci),
              lp.getBlue(ci),
              lp.getAlpha(ci)
            );
            remapColors.set(ci, nc);
          }

          const nextBytes = nextImage.toUint8Array();
          const lastBytes = lastImage.toUint8Array();
          for (let i = 0, l = nextBytes.length; i < l; ++i) {
            const lc = lastBytes[i];
            const nc = remapColors.get(lc)!;
            if (nc !== -1) {
              nextBytes[i] = nc!;
            }
          }
        }
      }

      nextImage.frameDuration = image.frameDuration;

      for (const p of image) {
        if (p.a !== 0) {
          nextImage.setPixel(p.x + frame.x, p.y + frame.y, p);
        }
      }

      firstImage.addFrame(nextImage);
      lastImage = nextImage;
    }

    return firstImage;
  }

  /**
   * Decodes a specific frame of the Gif image.
   * @param {number} frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined on failure.
   */
  public decodeFrame(frameIndex: number): MemoryImage | undefined {
    if (this._input === undefined || this._info === undefined) {
      return undefined;
    }

    if (frameIndex >= this._info.frames.length || frameIndex < 0) {
      return undefined;
    }

    // this._frame = frame;
    const gifImage = this._info.frames[frameIndex];
    this._input.offset = gifImage.inputPosition;

    return this.decodeImage(this._info.frames[frameIndex]);
  }
}
