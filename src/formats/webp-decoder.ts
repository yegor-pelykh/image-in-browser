/** @format */

import { ColorRgba8 } from '../color/color-rgba8.js';
import { InputBuffer } from '../common/input-buffer.js';
import { Draw } from '../draw/draw.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { ImageFormat } from './image-format.js';
import { VP8 } from './webp/vp8.js';
import { VP8L } from './webp/vp8l.js';
import { WebPFormat } from './webp/webp-format.js';
import { WebPFrame } from './webp/webp-frame.js';
import { WebPInfo } from './webp/webp-info.js';
import { WebPInfoInternal } from './webp/webp-info-internal.js';

/**
 * Decode a WebP formatted image. This supports lossless (vp8l), lossy (vp8),
 * lossy+alpha, and animated WebP images.
 */
export class WebPDecoder implements Decoder {
  /**
   * Input buffer for the WebPDecoder.
   * @private
   */
  private _input!: InputBuffer<Uint8Array>;

  /**
   * Internal WebP information.
   * @private
   */
  private _info!: WebPInfoInternal;

  /**
   * Get the WebP information.
   * @returns {WebPInfo | undefined} The WebP information.
   */
  public get info(): WebPInfo | undefined {
    return this._info;
  }

  /**
   * Get the image format.
   * @returns {ImageFormat} The image format.
   */
  get format(): ImageFormat {
    return ImageFormat.webp;
  }

  /**
   * Get the number of frames available to decode.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  /**
   * Constructor for WebPDecoder.
   * @param {Uint8Array} [bytes] - Optional bytes to start decoding.
   */
  constructor(bytes?: Uint8Array) {
    if (bytes !== undefined) {
      this.startDecode(bytes);
    }
  }

  /**
   * Decode a frame internally.
   * @private
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number} [frameIndex=0] - The frame index.
   * @returns {MemoryImage | undefined} The decoded image.
   */
  private decodeFrameInternal(
    input: InputBuffer<Uint8Array>,
    frameIndex: number = 0
  ): MemoryImage | undefined {
    const webp = new WebPInfoInternal();
    if (!this.getInfo(input, webp)) {
      return undefined;
    }

    if (webp.format === WebPFormat.undefined) {
      return undefined;
    }

    webp.frame = frameIndex;
    webp.frameCount = this._info.numFrames;

    if (webp.hasAnimation) {
      if (frameIndex >= webp.frames.length || frameIndex < 0) {
        return undefined;
      }
      const f = webp.frames[frameIndex];
      const frameData = input.subarray(f.frameSize, f.framePosition);

      return this.decodeFrameInternal(frameData, frameIndex);
    } else {
      const data = input.subarray(webp.vp8Size, webp.vp8Position);
      if (webp.format === WebPFormat.lossless) {
        return new VP8L(data, webp).decode();
      } else if (webp.format === WebPFormat.lossy) {
        return new VP8(data, webp).decode();
      }
    }

    return undefined;
  }

  /**
   * Validate the WebP format header.
   * @private
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @returns {boolean} True if valid, false otherwise.
   */
  private getHeader(input: InputBuffer<Uint8Array>): boolean {
    // Validate the webp format header
    let tag = input.readString(4);
    if (tag !== 'RIFF') {
      return false;
    }

    // file size
    input.readUint32();

    tag = input.readString(4);
    if (tag !== 'WEBP') {
      return false;
    }

    return true;
  }

  /**
   * Get information about the WebP image.
   * @private
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {WebPInfoInternal} webp - The WebP information.
   * @returns {boolean} True if successful, false otherwise.
   */
  private getInfo(
    input: InputBuffer<Uint8Array>,
    webp: WebPInfoInternal
  ): boolean {
    while (!input.isEOS) {
      const tag = input.readString(4);
      const size = input.readUint32();
      // For odd sized chunks, there's a 1 byte padding at the end.
      const diskSize = ((size + 1) >>> 1) << 1;
      const p = input.position;

      switch (tag) {
        case 'VP8X':
          if (!this.getVp8xInfo(input, webp)) {
            return false;
          }
          break;
        case 'VP8 ':
          webp.vp8Position = input.position;
          webp.vp8Size = size;
          webp.format = WebPFormat.lossy;
          break;
        case 'VP8L':
          webp.vp8Position = input.position;
          webp.vp8Size = size;
          webp.format = WebPFormat.lossless;
          break;
        case 'ALPH':
          webp.alphaData = new InputBuffer<Uint8Array>({
            buffer: input.buffer,
            bigEndian: input.bigEndian,
          });
          webp.alphaData!.offset = input.offset;
          webp.alphaSize = size;
          input.skip(diskSize);
          break;
        case 'ANIM':
          webp.format = WebPFormat.animated;
          if (!this.getAnimInfo(input, webp)) {
            return false;
          }
          break;
        case 'ANMF':
          if (!this.getAnimFrameInfo(input, webp, size)) {
            return false;
          }
          break;
        case 'ICCP':
          webp!.iccpData = input.readRange(size).toUint8Array();
          break;
        case 'EXIF':
          webp!.exifData = input.readString(size);
          break;
        case 'XMP ':
          webp!.xmpData = input.readString(size);
          break;
        default:
          input.skip(diskSize);
          break;
      }

      const remainder = diskSize - (input.position - p);
      if (remainder > 0) {
        input.skip(remainder);
      }
    }

    /// The alpha flag might not have been set, but it does in fact have alpha
    /// if there is an ALPH chunk.
    if (!webp!.hasAlpha) {
      webp!.hasAlpha = webp!.alphaData !== undefined;
    }

    return webp!.format !== WebPFormat.undefined;
  }

  /**
   * Get VP8X information.
   * @private
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {WebPInfo} [webp] - The WebP information.
   * @returns {boolean} True if successful, false otherwise.
   */
  private getVp8xInfo(
    input: InputBuffer<Uint8Array>,
    webp?: WebPInfo
  ): boolean {
    const b = input.read();
    if ((b & 0xc0) !== 0) {
      return false;
    }
    const alpha = (b >>> 4) & 0x1;
    const anim = (b >>> 1) & 0x1;

    if ((b & 0x1) !== 0) {
      return false;
    }

    if (input.readUint24() !== 0) {
      return false;
    }
    const w = input.readUint24() + 1;
    const h = input.readUint24() + 1;

    webp!.width = w;
    webp!.height = h;
    webp!.hasAnimation = anim !== 0;
    webp!.hasAlpha = alpha !== 0;

    return true;
  }

  /**
   * Get animation information.
   * @private
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {WebPInfo} webp - The WebP information.
   * @returns {boolean} True if successful, false otherwise.
   */
  private getAnimInfo(input: InputBuffer<Uint8Array>, webp: WebPInfo): boolean {
    const c = input.readUint32();
    // Color is stored in [blue, green, red, alpha] order.
    const a = c & 0xff;
    const r = (c >>> 8) & 0xff;
    const g = (c >>> 16) & 0xff;
    const b = (c >>> 24) & 0xff;
    webp.backgroundColor = new ColorRgba8(r, g, b, a);
    webp.animLoopCount = input.readUint16();
    return true;
  }

  /**
   * Get animation frame information.
   * @private
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {WebPInfo} webp - The WebP information.
   * @param {number} size - The size of the frame.
   * @returns {boolean} True if successful, false otherwise.
   */
  private getAnimFrameInfo(
    input: InputBuffer<Uint8Array>,
    webp: WebPInfo,
    size: number
  ): boolean {
    const frame = new WebPFrame(input, size);
    if (!frame.isValid) {
      return false;
    }
    webp.frames.push(frame);
    return true;
  }

  /**
   * Is the given file a valid WebP image?
   * @param {Uint8Array} bytes - The file bytes.
   * @returns {boolean} True if valid, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    if (!this.getHeader(this._input)) {
      return false;
    }
    return true;
  }

  /**
   * Validate the file is a WebP image and get information about it.
   * If the file is not a valid WebP image, undefined is returned.
   * @param {Uint8Array} bytes - The file bytes.
   * @returns {WebPInfo | undefined} The WebP information.
   */
  public startDecode(bytes: Uint8Array): WebPInfo | undefined {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });

    if (!this.getHeader(this._input)) {
      return undefined;
    }

    this._info = new WebPInfoInternal();
    if (!this.getInfo(this._input, this._info)) {
      return undefined;
    }

    switch (this._info.format) {
      case WebPFormat.animated: {
        this._info.frameCount = this._info.frames.length;
        return this._info;
      }
      case WebPFormat.lossless: {
        this._input.offset = this._info.vp8Position;
        const vp8l = new VP8L(this._input, this._info);
        if (!vp8l.decodeHeader()) {
          return undefined;
        }
        this._info.frameCount = this._info.frames.length;
        return this._info;
      }
      case WebPFormat.lossy: {
        this._input.offset = this._info.vp8Position;
        const vp8 = new VP8(this._input, this._info);
        if (!vp8.decodeHeader()) {
          return undefined;
        }
        this._info.frameCount = this._info.frames.length;
        return this._info;
      }
      case WebPFormat.undefined:
        throw new LibError('Unknown format for WebP');
    }
    return undefined;
  }

  /**
   * Decode a WebP formatted file stored in **bytes** into an Image.
   * If it's not a valid WebP file, undefined is returned.
   * @param {DecoderDecodeOptions} opt - The decode options.
   * @param {Uint8Array} opt.bytes - The file bytes.
   * @param {number} [opt.frameIndex] - The frame index to decode.
   * @returns {MemoryImage | undefined} The decoded image.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    if (this.startDecode(opt.bytes) === undefined) {
      return undefined;
    }

    if (!this._info.hasAnimation || opt.frameIndex !== undefined) {
      return this.decodeFrame(opt.frameIndex ?? 0);
    }

    let firstImage: MemoryImage | undefined = undefined;
    let lastImage: MemoryImage | undefined = undefined;
    for (let i = 0; i < this._info.numFrames; ++i) {
      this._info.frame = i;
      const frame = this._info.frames[i];
      const image = this.decodeFrame(i);
      if (image === undefined) {
        continue;
      }

      image.frameDuration = frame.duration;

      if (firstImage === undefined || lastImage === undefined) {
        firstImage = new MemoryImage({
          width: this._info.width,
          height: this._info.height,
          numChannels: image.numChannels,
          format: image.format,
          frameDuration: image.frameDuration,
        });
        lastImage = firstImage;
      } else {
        lastImage = MemoryImage.from(lastImage);

        if (frame.clearFrame) {
          lastImage.clear();
        }
      }

      Draw.compositeImage({
        dst: lastImage,
        src: image,
        dstX: frame.x,
        dstY: frame.y,
      });

      firstImage.addFrame(lastImage);
    }

    return firstImage;
  }

  /**
   * Decode a specific frame.
   * @param {number} frameIndex - The frame index.
   * @returns {MemoryImage | undefined} The decoded image.
   */
  public decodeFrame(frameIndex: number): MemoryImage | undefined {
    if (this._input === undefined || this._info === undefined) {
      return undefined;
    }

    if (this._info.hasAnimation) {
      if (frameIndex >= this._info.frames.length || frameIndex < 0) {
        return undefined;
      }

      const f = this._info.frames[frameIndex];
      const frameData = this._input.subarray(f.frameSize, f.framePosition);

      return this.decodeFrameInternal(frameData, frameIndex);
    }

    if (this._info.format === WebPFormat.lossless) {
      const data = this._input.subarray(
        this._info.vp8Size,
        this._info.vp8Position
      );
      return new VP8L(data, this._info).decode();
    } else if (this._info.format === WebPFormat.lossy) {
      const data = this._input.subarray(
        this._info.vp8Size,
        this._info.vp8Position
      );
      return new VP8(data, this._info).decode();
    }

    return undefined;
  }
}
