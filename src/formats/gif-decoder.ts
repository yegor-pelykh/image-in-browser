/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { InputBuffer } from '../common/input-buffer';
import { ListUtils } from '../common/list-utils';
import { MemoryImage } from '../common/memory-image';
import { ImageError } from '../error/image-error';
import { HdrImage } from '../hdr/hdr-image';
import { ImageTransform } from '../transform/image-transform';
import { Decoder } from './decoder';
import { GifColorMap } from './gif/gif-color-map';
import { GifImageDesc } from './gif/gif-image-desc';
import { GifInfo } from './gif/gif-info';

/**
 * A decoder for the GIF image format. This supports both single frame and
 * animated GIF files, and transparency.
 */
export class GifDecoder implements Decoder {
  private static readonly STAMP_SIZE: number = 6;

  private static readonly GIF87_STAMP: string = 'GIF87a';

  private static readonly GIF89_STAMP: string = 'GIF89a';

  private static readonly IMAGE_DESC_RECORD_TYPE: number = 0x2c;

  private static readonly EXTENSION_RECORD_TYPE: number = 0x21;

  private static readonly TERMINATE_RECORD_TYPE: number = 0x3b;

  private static readonly GRAPHIC_CONTROL_EXT: number = 0xf9;

  private static readonly APPLICATION_EXT: number = 0xff;

  private static readonly LZ_MAX_CODE: number = 4095;

  private static readonly LZ_BITS: number = 12;

  // Impossible code, to signal empty.
  private static readonly NO_SUCH_CODE: number = 4098;

  private static readonly CODE_MASKS: number[] = [
    0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff,
  ];

  private static readonly INTERLACED_OFFSET: number[] = [0, 4, 2, 1];

  private static readonly INTERLACED_JUMP: number[] = [8, 8, 4, 2];

  private info?: GifInfo;

  private input?: InputBuffer;

  private repeat = 0;

  private buffer?: Uint8Array;

  private stack!: Uint8Array;

  private suffix!: Uint8Array;

  private prefix?: Uint32Array;

  private bitsPerPixel = 0;

  private pixelCount?: number;

  private currentShiftDWord = 0;

  private currentShiftState = 0;

  private stackPtr = 0;

  private currentCode?: number;

  private lastCode = 0;

  private maxCode1 = 0;

  private runningBits = 0;

  private runningCode = 0;

  private eofCode = 0;

  private clearCode = 0;

  /**
   * How many frames are available to decode?
   *
   * You should have prepared the decoder by either passing the file bytes
   * to the constructor, or calling getInfo.
   */
  public get numFrames(): number {
    return this.info !== undefined ? this.info.numFrames : 0;
  }

  constructor(bytes?: Uint8Array) {
    if (bytes !== undefined) {
      this.startDecode(bytes);
    }
  }

  /**
   * Routine to trace the Prefixes linked list until we get a prefix which is
   * not code, but a pixel value (less than ClearCode). Returns that pixel value.
   * If image is defective, we might loop here forever, so we limit the loops to
   * the maximum possible if image O.k. - LZ_MAX_CODE times.
   */
  private static getPrefixChar(
    prefix: Uint32Array,
    code: number,
    clearCode: number
  ): number {
    let c = code;
    let i = 0;
    while (c > clearCode && i++ <= GifDecoder.LZ_MAX_CODE) {
      if (c > GifDecoder.LZ_MAX_CODE) {
        return GifDecoder.NO_SUCH_CODE;
      }
      c = prefix[code];
    }
    return c;
  }

  private static updateImage(
    image: MemoryImage,
    y: number,
    colorMap: GifColorMap | undefined,
    line: Uint8Array
  ): void {
    if (colorMap !== undefined) {
      for (let x = 0, width = line.length; x < width; ++x) {
        image.setPixel(x, y, colorMap.getColor(line[x]));
      }
    }
  }

  private getInfo(): boolean {
    if (this.input === undefined) {
      return false;
    }

    const tag = this.input.readString(GifDecoder.STAMP_SIZE);
    if (tag !== GifDecoder.GIF87_STAMP && tag !== GifDecoder.GIF89_STAMP) {
      return false;
    }

    const width = this.input.readUint16();
    const height = this.input.readUint16();

    const b = this.input.readByte();
    const colorResolution = (((b & 0x70) + 1) >> 4) + 1;

    const bitsPerPixel = (b & 0x07) + 1;
    const backgroundColor = this.input.readByte();

    this.input.skip(1);

    let globalColorMap: GifColorMap | undefined = undefined;
    // Is there a global color map?
    if ((b & 0x80) !== 0) {
      globalColorMap = new GifColorMap({
        numColors: 1 << bitsPerPixel,
      });

      // Get the global color map:
      for (let i = 0; i < globalColorMap.numColors; ++i) {
        const r = this.input.readByte();
        const g = this.input.readByte();
        const b = this.input.readByte();
        globalColorMap.setColor(i, r, g, b);
      }
    }

    const isGif89 = tag === GifDecoder.GIF89_STAMP;

    this.info = new GifInfo({
      width: width,
      height: height,
      colorResolution: colorResolution,
      backgroundColor: backgroundColor,
      globalColorMap: globalColorMap,
      isGif89: isGif89,
    });

    return true;
  }

  private skipImage(): GifImageDesc | undefined {
    if (this.input === undefined || this.input.isEOS) {
      return undefined;
    }
    const gifImage = new GifImageDesc(this.input);
    this.input.skip(1);
    this.skipRemainder();
    return gifImage;
  }

  /**
   * Continue to get the image code in compressed form. This routine should be
   * called until NULL block is returned.
   * The block should NOT be freed by the user (not dynamically allocated).
   */
  private skipRemainder(): boolean {
    if (this.input === undefined || this.input.isEOS) {
      return true;
    }
    let b = this.input.readByte();
    while (b !== 0 && !this.input.isEOS) {
      this.input.skip(b);
      if (this.input.isEOS) {
        return true;
      }
      b = this.input.readByte();
    }
    return true;
  }

  private readApplicationExt(input: InputBuffer): void {
    const blockSize = input.readByte();
    const tag = input.readString(blockSize);
    if (tag === 'NETSCAPE2.0') {
      const b1 = input.readByte();
      const b2 = input.readByte();
      if (b1 === 0x03 && b2 === 0x01) {
        this.repeat = input.readUint16();
      }
    } else {
      this.skipRemainder();
    }
  }

  private readGraphicsControlExt(input: InputBuffer): void {
    /* const blockSize: number = */
    input.readByte();
    const b = input.readByte();
    const duration = input.readUint16();
    const transparent = input.readByte();
    /* const endBlock: number = */
    input.readByte();
    const disposalMethod = (b >> 2) & 0x7;
    // const userInput: number = (b >> 1) & 0x1;
    const transparentFlag = b & 0x1;

    const recordType = input.peekBytes(1).getByte(0);
    if (recordType === GifDecoder.IMAGE_DESC_RECORD_TYPE) {
      input.skip(1);
      const gifImage = this.skipImage();
      if (gifImage === undefined) {
        return;
      }

      gifImage.duration = duration;
      gifImage.clearFrame = disposalMethod === 2;

      if (transparentFlag !== 0) {
        if (
          gifImage.colorMap === undefined &&
          this.info!.globalColorMap !== undefined
        ) {
          gifImage.colorMap = GifColorMap.from(this.info!.globalColorMap);
        }
        if (gifImage.colorMap !== undefined) {
          gifImage.colorMap.transparent = transparent;
        }
      }

      this.info!.frames.push(gifImage);
    }
  }

  private decodeFrameImage(gifImage: GifImageDesc): MemoryImage | undefined {
    if (this.buffer === undefined) {
      this.initDecode();
    }

    this.bitsPerPixel = this.input!.readByte();
    this.clearCode = 1 << this.bitsPerPixel;
    this.eofCode = this.clearCode + 1;
    this.runningCode = this.eofCode + 1;
    this.runningBits = this.bitsPerPixel + 1;
    this.maxCode1 = 1 << this.runningBits;
    this.stackPtr = 0;
    this.lastCode = GifDecoder.NO_SUCH_CODE;
    this.currentShiftState = 0;
    this.currentShiftDWord = 0;
    this.buffer![0] = 0;
    this.prefix!.fill(GifDecoder.NO_SUCH_CODE, 0, this.prefix!.length);

    const width = gifImage.width;
    const height = gifImage.height;

    if (
      gifImage.x + width > this.info!.width ||
      gifImage.y + height > this.info!.height
    ) {
      return undefined;
    }

    const colorMap =
      gifImage.colorMap !== undefined
        ? gifImage.colorMap
        : this.info!.globalColorMap;

    this.pixelCount = width * height;

    const image = new MemoryImage({
      width: width,
      height: height,
    });
    const line = new Uint8Array(width);

    if (gifImage.interlaced) {
      const row = gifImage.y;
      for (let i = 0, j = 0; i < 4; ++i) {
        for (
          let y = row + GifDecoder.INTERLACED_OFFSET[i];
          y < row + height;
          y += GifDecoder.INTERLACED_JUMP[i], ++j
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

  private getLine(line: Uint8Array): boolean {
    this.pixelCount = this.pixelCount! - line.length;

    if (!this.decompressLine(line)) {
      return false;
    }

    // Flush any remainder blocks.
    if (this.pixelCount === 0) {
      this.skipRemainder();
    }

    return true;
  }

  /**
   * The LZ decompression routine:
   * This version decompress the given gif file into Line of length LineLen.
   * This routine can be called few times (one per scan line, for example), in
   * order the complete the whole image.
   */
  private decompressLine(line: Uint8Array): boolean {
    if (this.stackPtr > GifDecoder.LZ_MAX_CODE) {
      return false;
    }

    const lineLen = line.length;
    let i = 0;

    if (this.stackPtr !== 0) {
      // Let pop the stack off before continuing to read the gif file:
      while (this.stackPtr !== 0 && i < lineLen) {
        line[i++] = this.stack[--this.stackPtr];
      }
    }

    let currentPrefix: number | undefined = undefined;

    // Decode LineLen items.
    while (i < lineLen) {
      this.currentCode = this.decompressInput();
      if (this.currentCode === undefined) {
        return false;
      }

      if (this.currentCode === this.eofCode) {
        // Note however that usually we will not be here as we will stop
        // decoding as soon as we got all the pixel, or EOF code will
        // not be read at all, and DGifGetLine/Pixel clean everything.
        return false;
      }

      if (this.currentCode === this.clearCode) {
        // We need to start over again:
        for (let j = 0; j <= GifDecoder.LZ_MAX_CODE; j++) {
          this.prefix![j] = GifDecoder.NO_SUCH_CODE;
        }

        this.runningCode = this.eofCode + 1;
        this.runningBits = this.bitsPerPixel + 1;
        this.maxCode1 = 1 << this.runningBits;
        this.lastCode = GifDecoder.NO_SUCH_CODE;
      } else {
        // Its regular code - if in pixel range simply add it to output
        // stream, otherwise trace to codes linked list until the prefix
        // is in pixel range:
        if (this.currentCode < this.clearCode) {
          // This is simple - its pixel scalar, so add it to output:
          line[i++] = this.currentCode;
        } else {
          // Its a code to needed to be traced: trace the linked list
          // until the prefix is a pixel, while pushing the suffix
          // pixels on our stack. If we done, pop the stack in reverse
          // (thats what stack is good for!) order to output. */
          if (this.prefix![this.currentCode] === GifDecoder.NO_SUCH_CODE) {
            // Only allowed if CrntCode is exactly the running code:
            // In that case CrntCode = XXXCode, CrntCode or the
            // prefix code is last code and the suffix char is
            // exactly the prefix of last code!
            if (this.currentCode === this.runningCode - 2) {
              currentPrefix = this.lastCode;
              const prefixChar = GifDecoder.getPrefixChar(
                this.prefix!,
                this.lastCode,
                this.clearCode
              );
              this.stack[this.stackPtr++] = prefixChar;
              this.suffix[this.runningCode - 2] = prefixChar;
            } else {
              return false;
            }
          } else {
            currentPrefix = this.currentCode;
          }

          // Now (if image is O.K.) we should not get an NO_SUCH_CODE
          // During the trace. As we might loop forever, in case of
          // defective image, we count the number of loops we trace
          // and stop if we got LZ_MAX_CODE. obviously we can not
          // loop more than that.
          let j = 0;
          while (
            j++ <= GifDecoder.LZ_MAX_CODE &&
            currentPrefix > this.clearCode &&
            currentPrefix <= GifDecoder.LZ_MAX_CODE
          ) {
            this.stack[this.stackPtr++] = this.suffix[currentPrefix];
            currentPrefix = this.prefix![currentPrefix];
          }

          if (
            j >= GifDecoder.LZ_MAX_CODE ||
            currentPrefix > GifDecoder.LZ_MAX_CODE
          ) {
            return false;
          }

          // Push the last character on stack:
          this.stack[this.stackPtr++] = currentPrefix;

          // Now lets pop all the stack into output:
          while (this.stackPtr !== 0 && i < lineLen) {
            line[i++] = this.stack[--this.stackPtr];
          }
        }

        if (
          this.lastCode !== GifDecoder.NO_SUCH_CODE &&
          this.prefix![this.runningCode - 2] === GifDecoder.NO_SUCH_CODE
        ) {
          this.prefix![this.runningCode - 2] = this.lastCode;

          if (this.currentCode === this.runningCode - 2) {
            // Only allowed if CrntCode is exactly the running code:
            // In that case CrntCode = XXXCode, CrntCode or the
            // prefix code is last code and the suffix char is
            // exactly the prefix of last code!
            this.suffix[this.runningCode - 2] = GifDecoder.getPrefixChar(
              this.prefix!,
              this.lastCode,
              this.clearCode
            );
          } else {
            this.suffix[this.runningCode - 2] = GifDecoder.getPrefixChar(
              this.prefix!,
              this.currentCode,
              this.clearCode
            );
          }
        }

        this.lastCode = this.currentCode;
      }
    }

    return true;
  }

  /**
   * The LZ decompression input routine:
   * This routine is responsible for the decompression of the bit stream from
   * 8 bits (bytes) packets, into the real codes.
   */
  private decompressInput(): number | undefined {
    // The image can't contain more than LZ_BITS per code.
    if (this.runningBits > GifDecoder.LZ_BITS) {
      return undefined;
    }

    while (this.currentShiftState < this.runningBits) {
      // Needs to get more bytes from input stream for next code:
      const nextByte = this.bufferedInput()!;

      this.currentShiftDWord |= nextByte << this.currentShiftState;
      this.currentShiftState += 8;
    }

    const code: number =
      this.currentShiftDWord & GifDecoder.CODE_MASKS[this.runningBits];

    this.currentShiftDWord >>= this.runningBits;
    this.currentShiftState -= this.runningBits;

    // If code cannot fit into RunningBits bits, must raise its size. Note
    // however that codes above 4095 are used for special signaling.
    // If we're using LZ_BITS bits already and we're at the max code, just
    // keep using the table as it is, don't increment Private->RunningCode.
    if (
      this.runningCode < GifDecoder.LZ_MAX_CODE + 2 &&
      ++this.runningCode > this.maxCode1 &&
      this.runningBits < GifDecoder.LZ_BITS
    ) {
      this.maxCode1 <<= 1;
      this.runningBits++;
    }

    return code;
  }

  /**
   * This routines read one gif data block at a time and buffers it internally
   * so that the decompression routine could access it.
   * The routine returns the next byte from its internal buffer (or read next
   * block in if buffer empty) and returns undefined on failure.
   */
  private bufferedInput(): number | undefined {
    let nextByte = 0;
    if (this.buffer![0] === 0) {
      // Needs to read the next buffer - this one is empty:
      this.buffer![0] = this.input!.readByte();

      // There shouldn't be any empty data blocks here as the LZW spec
      // says the LZW termination code should come first. Therefore we
      // shouldn't be inside this routine at that point.
      if (this.buffer![0] === 0) {
        return undefined;
      }

      const from = this.input!.readBytes(this.buffer![0]).toUint8Array();
      ListUtils.setRange(this.buffer!, 1, 1 + this.buffer![0], from);

      nextByte = this.buffer![1];
      // We use now the second place as last char read!
      this.buffer![1] = 2;
      this.buffer![0]--;
    } else {
      nextByte = this.buffer![this.buffer![1]++];
      this.buffer![0]--;
    }

    return nextByte;
  }

  private initDecode(): void {
    this.buffer = new Uint8Array(256);
    this.stack = new Uint8Array(GifDecoder.LZ_MAX_CODE);
    this.suffix = new Uint8Array(GifDecoder.LZ_MAX_CODE + 1);
    this.prefix = new Uint32Array(GifDecoder.LZ_MAX_CODE + 1);
  }

  /**
   * Is the given file a valid Gif image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    this.input = new InputBuffer({
      buffer: bytes,
    });
    return this.getInfo();
  }

  /**
   * Validate the file is a Gif image and get information about it.
   * If the file is not a valid Gif image, undefined is returned.
   */
  public startDecode(bytes: Uint8Array): GifInfo | undefined {
    this.input = new InputBuffer({
      buffer: bytes,
    });

    if (!this.getInfo()) {
      return undefined;
    }

    try {
      while (!this.input.isEOS) {
        const recordType = this.input.readByte();
        switch (recordType) {
          case GifDecoder.IMAGE_DESC_RECORD_TYPE: {
            const gifImage = this.skipImage();
            if (gifImage === undefined) {
              return this.info;
            }
            this.info!.frames.push(gifImage);
            break;
          }
          case GifDecoder.EXTENSION_RECORD_TYPE: {
            const extCode = this.input.readByte();
            if (extCode === GifDecoder.APPLICATION_EXT) {
              this.readApplicationExt(this.input);
            } else if (extCode === GifDecoder.GRAPHIC_CONTROL_EXT) {
              this.readGraphicsControlExt(this.input);
            } else {
              this.skipRemainder();
            }
            break;
          }
          case GifDecoder.TERMINATE_RECORD_TYPE: {
            // this._numFrames = info.numFrames;
            return this.info;
          }
          default:
            break;
        }
      }
    } catch (error) {
      const strError = JSON.stringify(error);
      throw new ImageError(strError);
    }

    // this._numFrames = info.numFrames;
    return this.info;
  }

  public decodeFrame(frame: number): MemoryImage | undefined {
    if (this.input === undefined || this.info === undefined) {
      return undefined;
    }

    if (frame >= this.info.frames.length || frame < 0) {
      return undefined;
    }

    // this._frame = frame;
    const gifImage = this.info.frames[frame];
    this.input.offset = gifImage.inputPosition;

    return this.decodeFrameImage(this.info.frames[frame]);
  }

  public decodeHdrFrame(frame: number): HdrImage | undefined {
    const img = this.decodeFrame(frame);
    if (img === undefined) {
      return undefined;
    }
    return HdrImage.fromImage(img);
  }

  /**
   * Decode all of the frames of an animated gif. For single image gifs,
   * this will return an animation with a single frame.
   */
  public decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    if (this.input === undefined || this.info === undefined) {
      return undefined;
    }

    const animation = new FrameAnimation({
      width: this.info.width,
      height: this.info.height,
      loopCount: this.repeat,
    });

    let lastImage: MemoryImage | undefined = undefined;

    for (let i = 0; i < this.info.numFrames; ++i) {
      const frame = this.info.frames[i];
      const image = this.decodeFrame(i);
      if (image === undefined) {
        return undefined;
      }

      if (lastImage === undefined) {
        lastImage = image;
        // Convert to MS
        lastImage.duration = frame.duration * 10;
        animation.addFrame(lastImage);
        continue;
      }

      if (
        image.width === lastImage.width &&
        image.height === lastImage.height &&
        frame.x === 0 &&
        frame.y === 0 &&
        frame.clearFrame
      ) {
        lastImage = image;
        // Convert to MS
        lastImage.duration = frame.duration * 10;
        animation.addFrame(lastImage);
        continue;
      }

      if (frame.clearFrame) {
        lastImage = new MemoryImage({
          width: lastImage.width,
          height: lastImage.height,
        });
        const colorMap =
          frame.colorMap !== undefined
            ? frame.colorMap
            : this.info!.globalColorMap;
        lastImage.fill(colorMap!.getColor(this.info!.backgroundColor));
      } else {
        lastImage = MemoryImage.from(lastImage);
      }

      ImageTransform.copyInto({
        dst: lastImage,
        src: image,
        dstX: frame.x,
        dstY: frame.y,
      });

      // Convert 1/100 sec to ms.
      lastImage.duration = frame.duration * 10;

      animation.addFrame(lastImage);
    }

    return animation;
  }

  public decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }
    // this._frame = 0;
    // this._numFrames = 1;
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
