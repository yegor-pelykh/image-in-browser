/** @format */

import { OutputBuffer } from '../common/output-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';
import { PngEncoder } from './png-encoder.js';

/**
 * Abstract class representing a Windows Encoder.
 */
export abstract class WinEncoder implements Encoder {
  /**
   * Type of the encoder.
   * @protected
   */
  protected _type = 0;

  /**
   * Gets the type of the encoder.
   * @returns {number} The type of the encoder.
   */
  public get type(): number {
    return this._type;
  }

  /**
   * Indicates whether the encoder supports animation.
   * @private
   */
  private _supportsAnimation = true;

  /**
   * Gets whether the encoder supports animation.
   * @returns {boolean} True if the encoder supports animation, otherwise false.
   */
  get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  /**
   * Gets the color planes or X hot spot.
   * @param {number} _index - The index.
   * @returns {number} The color planes or X hot spot.
   * @protected
   */
  protected colorPlanesOrXHotSpot(_index: number): number {
    return 0;
  }

  /**
   * Gets the bits per pixel or Y hot spot.
   * @param {number} _index - The index.
   * @returns {number} The bits per pixel or Y hot spot.
   * @protected
   */
  protected bitsPerPixelOrYHotSpot(_index: number): number {
    return 0;
  }

  /**
   * Encodes the given image into a Uint8Array.
   * @param {EncoderEncodeOptions} opt - The encoding options.
   * @param {MemoryImage} opt.image - The image to encode.
   * @param {boolean} [opt.singleFrame] - Optional flag to encode a single frame.
   * @returns {Uint8Array} The encoded data.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    const image = opt.image;
    const singleFrame = opt.singleFrame ?? false;

    if (image.hasAnimation && !singleFrame) {
      return this.encodeImages(image.frames);
    } else {
      return this.encodeImages([image]);
    }
  }

  /**
   * Encodes the given images into a Uint8Array.
   * @param {MemoryImage[]} images - The images to encode.
   * @returns {Uint8Array} The encoded data.
   */
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
