/** @format */

import { OutputBuffer } from '../common/output-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';
import { PngEncoder } from './png-encoder.js';

export abstract class WinEncoder implements Encoder {
  protected _type = 0;
  public get type(): number {
    return this._type;
  }

  private _supportsAnimation = true;
  get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  protected colorPlanesOrXHotSpot(_index: number): number {
    return 0;
  }

  protected bitsPerPixelOrYHotSpot(_index: number): number {
    return 0;
  }

  public encode(opt: EncoderEncodeOptions): Uint8Array {
    const image = opt.image;
    const singleFrame = opt.singleFrame ?? false;

    if (image.hasAnimation && !singleFrame) {
      return this.encodeImages(image.frames);
    } else {
      return this.encodeImages([image]);
    }
  }

  public encodeImages(images: MemoryImage[]): Uint8Array {
    const count = images.length;

    const out = new OutputBuffer();

    // header
    out.writeUint16(0);
    // type: ICO => 1; CUR => 2
    out.writeUint16(this._type);
    out.writeUint16(count);

    // file header with image directory byte size
    let offset = 6 + count * 16;

    const imageDataList: Uint8Array[] = [];

    let i = 0;
    for (const img of images) {
      if (img.width > 256 || img.height > 256) {
        throw new LibError('ICO and CUR support only sizes until 256');
      }

      // image width in pixels
      out.writeByte(img.width);
      // image height in pixels
      out.writeByte(img.height);
      // Color count, should be 0 if more than 256 colors
      out.writeByte(0);
      // Reserved
      out.writeByte(0);
      out.writeUint16(this.colorPlanesOrXHotSpot(i));
      out.writeUint16(this.bitsPerPixelOrYHotSpot(i));

      // Use png instead of bmp encoded data, it's supported since Windows Vista
      const data: Uint8Array = new PngEncoder().encode({
        image: img,
      });

      // size of the image's data in bytes
      out.writeUint32(data.length);
      // offset of data from the beginning of the file
      out.writeUint32(offset);

      // add the size of bytes to get the new begin of the next image
      offset += data.length;
      i++;
      imageDataList.push(data);
    }

    for (const imageData of imageDataList) {
      out.writeBytes(imageData);
    }

    return out.getBytes();
  }
}
