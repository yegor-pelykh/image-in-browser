/** @format */

import { DitherKernel } from '../common/dither-kernel';
import { DitherPixel } from '../common/dither-pixel';
import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { NeuralQuantizer } from '../common/neural-quantizer';
import { OutputBuffer } from '../common/output-buffer';
import { TextCodec } from '../common/text-codec';
import { Encoder } from './encoder';

export interface GifEncoderInitOptions {
  delay?: number;
  repeat?: number;
  samplingFactor?: number;
  dither?: DitherKernel;
  ditherSerpentine?: boolean;
}

export class GifEncoder implements Encoder {
  private static readonly gif89Id = 'GIF89a';

  private static readonly imageDescRecordType = 0x2c;

  private static readonly extensionRecordType = 0x21;

  private static readonly terminateRecordType = 0x3b;

  private static readonly applicationExt = 0xff;

  private static readonly graphicControlExt = 0xf9;

  private static readonly eof = -1;

  private static readonly bits = 12;

  // 80% occupancy
  private static readonly hsize = 5003;

  private static readonly masks = [
    0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff,
  ];

  private lastImage?: Uint8Array;

  private lastImageDuration?: number;

  private lastColorMap?: NeuralQuantizer;

  private width!: number;

  private height!: number;

  private encodedFrames: number;

  private curAccum = 0;

  private curBits = 0;

  private nBits = 0;

  private initBits = 0;

  private EOFCode = 0;

  private maxCode = 0;

  private clearCode = 0;

  private freeEnt = 0;

  private clearFlag = false;

  private block!: Uint8Array;

  private blockSize = 0;

  private outputBuffer?: OutputBuffer;

  private delay: number;

  private repeat: number;

  private samplingFactor: number;

  private dither: DitherKernel;

  private ditherSerpentine: boolean;

  /**
   * Does this encoder support animation?
   */
  private readonly _supportsAnimation = true;
  get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  constructor(options?: GifEncoderInitOptions) {
    this.delay = options?.delay ?? 80;
    this.repeat = options?.repeat ?? 0;
    this.samplingFactor = options?.samplingFactor ?? 10;
    this.dither = options?.dither ?? DitherKernel.FloydSteinberg;
    this.ditherSerpentine = options?.ditherSerpentine ?? false;
    this.encodedFrames = 0;
  }

  private addImage(
    image: Uint8Array | undefined,
    width: number,
    height: number,
    colorMap: Uint8Array,
    numColors: number
  ): void {
    // Image desc
    this.outputBuffer!.writeByte(GifEncoder.imageDescRecordType);
    // Image position x,y = 0,0
    this.outputBuffer!.writeUint16(0);
    this.outputBuffer!.writeUint16(0);
    // Image size
    this.outputBuffer!.writeUint16(width);
    this.outputBuffer!.writeUint16(height);

    // Local Color Map
    // (0x80: Use LCM, 0x07: Palette Size (7 = 8-bit))
    this.outputBuffer!.writeByte(0x87);
    this.outputBuffer!.writeBytes(colorMap);
    for (let i = numColors; i < 256; ++i) {
      this.outputBuffer!.writeByte(0);
      this.outputBuffer!.writeByte(0);
      this.outputBuffer!.writeByte(0);
    }

    this.encodeLZW(image, width, height);
  }

  private encodeLZW(
    image: Uint8Array | undefined,
    width: number,
    height: number
  ): void {
    this.curAccum = 0;
    this.curBits = 0;
    this.blockSize = 0;
    this.block = new Uint8Array(256);

    const initCodeSize = 8;
    this.outputBuffer!.writeByte(initCodeSize);

    const hTab = new Int32Array(GifEncoder.hsize);
    const codeTab = new Int32Array(GifEncoder.hsize);
    let remaining = width * height;
    let curPixel = 0;

    this.initBits = initCodeSize + 1;
    this.nBits = this.initBits;
    this.maxCode = (1 << this.nBits) - 1;
    this.clearCode = 1 << (this.initBits - 1);
    this.EOFCode = this.clearCode + 1;
    this.clearFlag = false;
    this.freeEnt = this.clearCode + 2;

    const _nextPixel = () => {
      if (remaining === 0) {
        return GifEncoder.eof;
      }
      --remaining;
      return image![curPixel++] & 0xff;
    };

    let ent = _nextPixel();

    let hshift = 0;
    for (let fcode = GifEncoder.hsize; fcode < 65536; fcode *= 2) {
      hshift++;
    }
    hshift = 8 - hshift;

    const hSizeReg = GifEncoder.hsize;
    for (let i = 0; i < hSizeReg; ++i) {
      hTab[i] = -1;
    }

    this.output(this.clearCode);

    let outerLoop = true;
    while (outerLoop) {
      outerLoop = false;

      let c = _nextPixel();
      while (c !== GifEncoder.eof) {
        const fcode = (c << GifEncoder.bits) + ent;
        // XOR hashing
        let i = (c << hshift) ^ ent;

        if (hTab[i] === fcode) {
          ent = codeTab[i];
          c = _nextPixel();
          continue;
        } else if (hTab[i] >= 0) {
          // Non-empty slot
          // Secondary hash (after G. Knott)
          let disp = hSizeReg - i;
          if (i === 0) {
            disp = 1;
          }
          do {
            if ((i -= disp) < 0) {
              i += hSizeReg;
            }

            if (hTab[i] === fcode) {
              ent = codeTab[i];
              outerLoop = true;
              break;
            }
          } while (hTab[i] >= 0);
          if (outerLoop) {
            break;
          }
        }

        this.output(ent);
        ent = c;

        if (this.freeEnt < 1 << GifEncoder.bits) {
          // Code -> hashtable
          codeTab[i] = this.freeEnt++;
          hTab[i] = fcode;
        } else {
          for (let i = 0; i < GifEncoder.hsize; ++i) {
            hTab[i] = -1;
          }
          this.freeEnt = this.clearCode + 2;
          this.clearFlag = true;
          this.output(this.clearCode);
        }

        c = _nextPixel();
      }
    }

    this.output(ent);
    this.output(this.EOFCode);

    this.outputBuffer!.writeByte(0);
  }

  private output(code: number | undefined): void {
    this.curAccum &= GifEncoder.masks[this.curBits];

    if (this.curBits > 0) {
      this.curAccum |= code! << this.curBits;
    } else {
      this.curAccum = code!;
    }

    this.curBits += this.nBits;

    while (this.curBits >= 8) {
      this.addToBlock(this.curAccum & 0xff);
      this.curAccum >>= 8;
      this.curBits -= 8;
    }

    // If the next entry is going to be too big for the code size,
    // then increase it, if possible.
    if (this.freeEnt > this.maxCode || this.clearFlag) {
      if (this.clearFlag) {
        this.nBits = this.initBits;
        this.maxCode = (1 << this.nBits) - 1;
        this.clearFlag = false;
      } else {
        ++this.nBits;
        if (this.nBits === GifEncoder.bits) {
          this.maxCode = 1 << GifEncoder.bits;
        } else {
          this.maxCode = (1 << this.nBits) - 1;
        }
      }
    }

    if (code === this.EOFCode) {
      // At EOF, write the rest of the buffer.
      while (this.curBits > 0) {
        this.addToBlock(this.curAccum & 0xff);
        this.curAccum >>= 8;
        this.curBits -= 8;
      }
      this.writeBlock();
    }
  }

  private writeBlock(): void {
    if (this.blockSize > 0) {
      this.outputBuffer!.writeByte(this.blockSize);
      this.outputBuffer!.writeBytes(this.block, this.blockSize);
      this.blockSize = 0;
    }
  }

  private addToBlock(c: number): void {
    this.block[this.blockSize++] = c;
    if (this.blockSize >= 254) {
      this.writeBlock();
    }
  }

  private writeApplicationExt(): void {
    this.outputBuffer!.writeByte(GifEncoder.extensionRecordType);
    this.outputBuffer!.writeByte(GifEncoder.applicationExt);
    // Data block size
    this.outputBuffer!.writeByte(11);
    const appCodeUnits = TextCodec.getCodePoints('NETSCAPE2.0');
    // App identifier
    this.outputBuffer!.writeBytes(appCodeUnits);
    this.outputBuffer!.writeBytes(new Uint8Array([0x03, 0x01]));
    // Loop count
    this.outputBuffer!.writeUint16(this.repeat);
    // Block terminator
    this.outputBuffer!.writeByte(0);
  }

  private writeGraphicsCtrlExt(): void {
    this.outputBuffer!.writeByte(GifEncoder.extensionRecordType);
    this.outputBuffer!.writeByte(GifEncoder.graphicControlExt);
    // Data block size
    this.outputBuffer!.writeByte(4);

    const transparency = 0;
    // Dispose = no action
    const dispose = 0;

    // packed fields
    this.outputBuffer!.writeByte(0 | dispose | 0 | transparency);

    // Delay x 1/100 sec
    this.outputBuffer!.writeUint16(this.lastImageDuration ?? this.delay);
    // Transparent color index
    this.outputBuffer!.writeByte(0);
    // Block terminator
    this.outputBuffer!.writeByte(0);
  }

  // GIF header and Logical Screen Descriptor
  private writeHeader(width: number, height: number): void {
    const idCodeUnits = TextCodec.getCodePoints(GifEncoder.gif89Id);
    this.outputBuffer!.writeBytes(idCodeUnits);
    this.outputBuffer!.writeUint16(width);
    this.outputBuffer!.writeUint16(height);
    // global color map parameters (not being used).
    this.outputBuffer!.writeByte(0);
    // Background color index.
    this.outputBuffer!.writeByte(0);
    // Aspect
    this.outputBuffer!.writeByte(0);
  }

  /**
   * Encode the images that were added with [addFrame].
   * After this has been called (returning the finishes GIF),
   * calling [addFrame] for a new animation or image is safe again.
   *
   * [addFrame] will not encode the first image passed and after that
   * always encode the previous image. Hence, the last image needs to be
   * encoded here.
   */
  private finish(): Uint8Array | undefined {
    let bytes: Uint8Array | undefined = undefined;
    if (this.outputBuffer === undefined) {
      return bytes;
    }

    if (this.encodedFrames === 0) {
      this.writeHeader(this.width, this.height);
      this.writeApplicationExt();
    } else {
      this.writeGraphicsCtrlExt();
    }

    this.addImage(
      this.lastImage,
      this.width,
      this.height,
      this.lastColorMap!.colorMap8,
      256
    );

    this.outputBuffer.writeByte(GifEncoder.terminateRecordType);

    this.lastImage = undefined;
    this.lastColorMap = undefined;
    this.encodedFrames = 0;

    bytes = this.outputBuffer.getBytes();
    this.outputBuffer = undefined;
    return bytes;
  }

  /**
   * This adds the frame passed to [image].
   * After the last frame has been added, [finish] is required to be called.
   * Optional frame [duration] is in 1/100 sec.
   * */
  public addFrame(image: MemoryImage, duration?: number): void {
    if (this.outputBuffer === undefined) {
      this.outputBuffer = new OutputBuffer();

      this.lastColorMap = new NeuralQuantizer(image, 256, this.samplingFactor);
      this.lastImage = DitherPixel.getDitherPixels(
        image,
        this.lastColorMap,
        this.dither,
        this.ditherSerpentine
      );
      this.lastImageDuration = duration;

      this.width = image.width;
      this.height = image.height;
      return;
    }

    if (this.encodedFrames === 0) {
      this.writeHeader(this.width, this.height);
      this.writeApplicationExt();
    }

    this.writeGraphicsCtrlExt();

    this.addImage(
      this.lastImage,
      this.width,
      this.height,
      this.lastColorMap!.colorMap8,
      256
    );
    this.encodedFrames++;

    this.lastColorMap = new NeuralQuantizer(image, 256, this.samplingFactor);
    this.lastImage = DitherPixel.getDitherPixels(
      image,
      this.lastColorMap,
      this.dither,
      this.ditherSerpentine
    );
    this.lastImageDuration = duration;
  }

  /**
   * Encode a single frame image.
   */
  public encodeImage(image: MemoryImage): Uint8Array {
    this.addFrame(image);
    return this.finish()!;
  }

  /**
   * Encode an animation.
   */
  public encodeAnimation(animation: FrameAnimation): Uint8Array | undefined {
    this.repeat = animation.loopCount;
    for (const f of animation) {
      this.addFrame(
        f,
        // Convert ms to 1 / 100 sec.
        Math.floor(f.duration / 10)
      );
    }
    return this.finish();
  }
}
