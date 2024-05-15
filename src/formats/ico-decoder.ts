/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { BmpFileHeader } from './bmp/bmp-file-header.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { DibDecoder } from './dib-decoder.js';
import { IcoBmpInfo } from './ico/ico-bmp-info.js';
import { IcoInfo } from './ico/ico-info.js';
import { PngDecoder } from './png-decoder.js';
import { MemoryImage } from '../image/image.js';
import { FrameType } from '../image/frame-type.js';
import { ImageFormat } from './image-format.js';

export class IcoDecoder implements Decoder {
  private _input?: InputBuffer<Uint8Array>;
  private _info?: IcoInfo;

  get format(): ImageFormat {
    return ImageFormat.ico;
  }

  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  public isValidFile(bytes: Uint8Array): boolean {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    this._info = IcoInfo.read(this._input);
    return this._info !== undefined;
  }

  public startDecode(bytes: Uint8Array): IcoInfo | undefined {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
    });
    this._info = IcoInfo.read(this._input);
    return this._info;
  }

  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;

    const info = this.startDecode(bytes);
    if (info === undefined) {
      return undefined;
    }

    if (info.images.length === 1 || opt.frameIndex !== undefined) {
      return this.decodeFrame(opt.frameIndex ?? 0);
    }

    let firstImage: MemoryImage | undefined = undefined;
    for (let i = 0; i < info.images.length; i++) {
      const frame = this.decodeFrame(i);
      if (frame === undefined) {
        continue;
      }
      if (firstImage === undefined) {
        frame.frameType = FrameType.sequence;
        firstImage = frame;
      } else {
        firstImage.addFrame(frame);
      }
    }

    return firstImage;
  }

  public decodeFrame(frameIndex: number): MemoryImage | undefined {
    if (
      this._input === undefined ||
      this._info === undefined ||
      frameIndex >= this._info.numFrames
    ) {
      return undefined;
    }

    const imageInfo = this._info.images[frameIndex];
    const imageBuffer = this._input.buffer.subarray(
      this._input.start + imageInfo.bytesOffset,
      this._input.start + imageInfo.bytesOffset + imageInfo.bytesSize
    ) as Uint8Array;

    const png = new PngDecoder();
    if (png.isValidFile(imageBuffer)) {
      return png.decode({
        bytes: imageBuffer,
      });
    }

    // should be bmp.
    const dummyBmpHeader = new OutputBuffer({
      size: 14,
    });
    dummyBmpHeader.writeUint16(BmpFileHeader.signature);
    dummyBmpHeader.writeUint32(imageInfo.bytesSize);
    dummyBmpHeader.writeUint32(0);
    dummyBmpHeader.writeUint32(0);

    const bmpInfo = new IcoBmpInfo(
      new InputBuffer<Uint8Array>({
        buffer: imageBuffer,
      }),
      new BmpFileHeader(
        new InputBuffer<Uint8Array>({
          buffer: dummyBmpHeader.getBytes(),
        })
      )
    );

    if (bmpInfo.headerSize !== 40 && bmpInfo.planes !== 1) {
      // invalid header.
      return undefined;
    }

    let offset = 0;
    if (bmpInfo.totalColors === 0 && bmpInfo.bitsPerPixel <= 8) {
      offset = 40 + 4 * (1 << bmpInfo.bitsPerPixel);
    } else {
      offset = 40 + 4 * bmpInfo.totalColors;
    }

    bmpInfo.header.imageOffset = offset;
    dummyBmpHeader.length -= 4;
    dummyBmpHeader.writeUint32(offset);
    const inp = new InputBuffer<Uint8Array>({
      buffer: imageBuffer,
    });
    const bmp = new DibDecoder(inp, bmpInfo, true);

    const image = bmp.decodeFrame(0);
    if (image === undefined || bmpInfo.bitsPerPixel >= 32) {
      return image;
    }

    const padding = 32 - (bmpInfo.width % 32);
    const rowLength = Math.trunc(
      (padding === 32 ? bmpInfo.width : bmpInfo.width + padding) / 8
    );

    // AND bitmask
    for (let y = 0; y < bmpInfo.height; y++) {
      const line = bmpInfo.readBottomUp ? y : image.height - 1 - y;
      const row = inp.readRange(rowLength);
      const p = image.getPixel(0, line);
      for (let x = 0; x < bmpInfo.width; ) {
        const b = row.read();
        for (let j = 7; j > -1 && x < bmpInfo.width; j--) {
          if ((b & (1 << j)) !== 0) {
            // set the pixel to completely transparent.
            p.a = 0;
          }
          p.next();
          x++;
        }
      }
    }

    return image;
  }

  /**
   * Decodes the largest frame.
   */
  public decodeImageLargest(bytes: Uint8Array): MemoryImage | undefined {
    const info = this.startDecode(bytes);
    if (info === undefined) {
      return undefined;
    }
    let largestFrame = 0;
    let largestSize = 0;
    for (let i = 0; i < info.images.length; i++) {
      const image = info.images[i];
      const size = image.width * image.height;
      if (size > largestSize) {
        largestSize = size;
        largestFrame = i;
      }
    }
    return this.decodeFrame(largestFrame);
  }
}
