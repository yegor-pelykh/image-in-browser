/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { ImageError } from '../error/image-error';
import { Encoder } from './encoder';
import { PngEncoder } from './png-encoder';
import { OutputBuffer } from './util/output-buffer';

export abstract class WinEncoder implements Encoder {
  protected _type = 0;
  public get type(): number {
    return this._type;
  }

  private _supportsAnimation = false;
  get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  protected colorPlanesOrXHotSpot(_index: number): number {
    return 0;
  }

  protected bitsPerPixelOrYHotSpot(_index: number): number {
    return 0;
  }

  public encodeImages(images: MemoryImage[]): Uint8Array {
    const count = images.length;

    const out = new OutputBuffer();

    // Header
    // Reserved
    out.writeUint16(0);
    // Type: ICO => 1; CUR => 2
    out.writeUint16(this.type);
    out.writeUint16(count);

    // File header with image directory byte size
    let offset = 6 + count * 16;

    const imageDatas: Uint8Array[] = [];

    let i = 0;
    for (const img of images) {
      if (img.width > 256 || img.height > 256) {
        throw new ImageError('ICO and CUR support only sizes until 256');
      }

      // Image width in pixels
      out.writeByte(img.width);
      // Image height in pixels
      out.writeByte(img.height);
      // Color count, should be 0 if more than 256 colors
      out.writeByte(0);
      // Reserved
      out.writeByte(0);
      out.writeUint16(this.colorPlanesOrXHotSpot(i));
      out.writeUint16(this.bitsPerPixelOrYHotSpot(i));

      // Use png instead of bmp encoded data, it's supported since Windows Vista
      const data = new PngEncoder().encodeImage(img);

      // Size of the image's data in bytes
      out.writeUint32(data.length);

      // Offset of data from the beginning of the file
      out.writeUint32(offset);

      // add the size of bytes to get the new begin of the next image
      offset += data.length;
      i++;
      imageDatas.push(data);
    }

    for (const imageData of imageDatas) {
      out.writeBytes(imageData);
    }

    return out.getBytes();
  }

  public encodeImage(image: MemoryImage): Uint8Array {
    return this.encodeImages([image]);
  }

  public encodeAnimation(_: FrameAnimation): Uint8Array | undefined {
    return undefined;
  }
}
