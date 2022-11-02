/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { InputBuffer } from '../common/input-buffer';
import { ListUtils } from '../common/list-utils';
import { MemoryImage } from '../common/memory-image';
import { OutputBuffer } from '../common/output-buffer';
import { NotImplementedError } from '../error/not-implemented-error';
import { HdrImage } from '../hdr/hdr-image';
import { BitmapFileHeader } from './bmp/bitmap-file-header';
import { Decoder } from './decoder';
import { DibDecoder } from './dib-decoder';
import { IcoBmpInfo } from './ico/ico-bmp-info';
import { IcoInfo } from './ico/ico-info';
import { PngDecoder } from './png-decoder';

export class IcoDecoder implements Decoder {
  _input?: InputBuffer;
  _icoInfo?: IcoInfo;

  get numFrames(): number {
    return this._icoInfo !== undefined ? this._icoInfo.numFrames : 0;
  }

  public isValidFile(bytes: Uint8Array): boolean {
    this._input = new InputBuffer({
      buffer: bytes,
    });
    this._icoInfo = IcoInfo.read(this._input);
    return this._icoInfo !== undefined;
  }

  public startDecode(bytes: Uint8Array): IcoInfo | undefined {
    this._input = new InputBuffer({
      buffer: bytes,
    });
    this._icoInfo = IcoInfo.read(this._input);
    return this._icoInfo;
  }

  public decodeFrame(frame: number): MemoryImage | undefined {
    if (
      this._input === undefined ||
      this._icoInfo === undefined ||
      frame >= this._icoInfo.numFrames
    ) {
      return undefined;
    }
    const imageInfo = this._icoInfo.images![frame];
    const imageBuffer = ListUtils.copyUint8(
      this._input.buffer,
      this._input.start + imageInfo.bytesOffset,
      this._input.start + imageInfo.bytesOffset + imageInfo.bytesSize
    );

    const png = new PngDecoder();
    if (png.isValidFile(imageBuffer)) {
      return png.decodeImage(imageBuffer);
    }
    // Should be bmp.
    const dummyBmpHeader = new OutputBuffer({
      size: 14,
    });
    dummyBmpHeader.writeUint16(BitmapFileHeader.BMP_HEADER_FILETYPE);
    dummyBmpHeader.writeUint32(imageInfo.bytesSize);
    dummyBmpHeader.writeUint32(0);
    dummyBmpHeader.writeUint32(0);
    const bmpInfo = new IcoBmpInfo(
      new InputBuffer({
        buffer: imageBuffer,
      }),
      new BitmapFileHeader(
        new InputBuffer({
          buffer: dummyBmpHeader.getBytes(),
        })
      )
    );
    if (bmpInfo.headerSize !== 40 && bmpInfo.planes !== 1) {
      // Invalid header.
      return undefined;
    }
    let offset = 0;
    if (bmpInfo.totalColors === 0 && bmpInfo.bpp <= 8) {
      // 14 + ...
      offset = 40 + 4 * (1 << bmpInfo.bpp);
    } else {
      // 14 + ...
      offset = 40 + 4 * bmpInfo.totalColors;
    }
    bmpInfo.fileHeader.offset = offset;
    dummyBmpHeader.length -= 4;
    dummyBmpHeader.writeUint32(offset);
    const inp = new InputBuffer({
      buffer: imageBuffer,
    });
    const bmp = new DibDecoder(inp, bmpInfo);
    const image = bmp.decodeFrame(0);
    if (image === undefined) {
      return undefined;
    }
    if (bmpInfo.bpp >= 32) {
      return image;
    }
    const padding = 32 - (bmpInfo.width % 32);
    const rowLength = Math.floor(
      (padding === 32 ? bmpInfo.width : bmpInfo.width + padding) / 8
    );
    // AND bitmask
    for (let y = 0; y < bmpInfo.height; y++) {
      const line = bmpInfo.readBottomUp ? y : image.height - 1 - y;
      const row = inp.readBytes(rowLength);
      for (let x = 0; x < bmpInfo.width; ) {
        const b = row.readByte();
        for (let j = 7; j > -1 && x < bmpInfo.width; j--) {
          if ((b & (1 << j)) !== 0) {
            // Just set the pixel to completely transparent.
            image.setPixelRgba(x, line, 0, 0, 0, 0);
          }
          x++;
        }
      }
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

  public decodeAnimation(_: Uint8Array): FrameAnimation | undefined {
    throw new NotImplementedError();
  }

  public decodeImage(bytes: Uint8Array, frame = 0): MemoryImage | undefined {
    const info = this.startDecode(bytes);
    if (info === undefined) {
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
    for (let i = 0; i < this._icoInfo!.images!.length; i++) {
      const image = this._icoInfo!.images![i];
      const size = image.width * image.height;
      if (size > largestSize) {
        largestSize = size;
        largestFrame = i;
      }
    }
    return this.decodeFrame(largestFrame);
  }
}
