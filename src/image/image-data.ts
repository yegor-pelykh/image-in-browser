/** @format */

import { ChannelOrder } from '../color/channel-order.js';
import { Color } from '../color/color.js';
import { Format, FormatType } from '../color/format.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Options for getting bytes from MemoryImageData.
 */
export interface MemoryImageDataGetBytesOptions {
  /** The order of the channels. */
  order?: ChannelOrder;
  /** Whether to modify the data in place. */
  inPlace?: boolean;
}

/**
 * Interface representing memory image data.
 */
export interface MemoryImageData extends Iterable<Pixel> {
  /** The width of the image. */
  width: number;

  /** The height of the image. */
  height: number;

  /** The number of channels in the image. */
  get numChannels(): number;

  /** The channel format of the image. */
  get format(): Format;

  /** Whether the image has uint, int, or float data. */
  get formatType(): FormatType;

  /** True if the image format is high dynamic range. */
  get isHdrFormat(): boolean;

  /** True if the image format is low dynamic range. */
  get isLdrFormat(): boolean;

  /** The number of bits per color channel. */
  get bitsPerChannel(): number;

  /** The maximum value of a pixel channel. */
  get maxChannelValue(): number;

  /** The maximum value of a palette index. */
  get maxIndexValue(): number;

  /** True if the image has a palette. */
  get hasPalette(): boolean;

  /** The palette of the image, or undefined if the image does not have one. */
  get palette(): Palette | undefined;
  set palette(p: Palette | undefined);

  /** The size of the image data in bytes. */
  get byteLength(): number;

  /** The size of the image data in bytes. */
  get length(): number;

  /** The ArrayBufferLike storage of the image. */
  get buffer(): ArrayBufferLike;

  /** The size, in bytes, of a row of pixels in the data. */
  get rowStride(): number;

  /**
   * Returns a pixel iterator for iterating over a rectangular range of pixels in the image.
   * @param {number} x - The x-coordinate of the top-left corner of the range.
   * @param {number} y - The y-coordinate of the top-left corner of the range.
   * @param {number} width - The width of the range.
   * @param {number} height - The height of the range.
   * @returns {Iterator<Pixel>} An iterator for the specified range of pixels.
   */
  getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel>;

  /**
   * Create a Color object with the format and number of channels of the image.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} [a] - The alpha channel value (optional).
   * @returns {Color} A Color object.
   */
  getColor(r: number, g: number, b: number, a?: number): Color;

  /**
   * Return the Pixel at the given coordinates.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional Pixel object to update and return.
   * @returns {Pixel} The Pixel at the specified coordinates.
   */
  getPixel(x: number, y: number, pixel?: Pixel): Pixel;

  /**
   * Set the color of the pixel at the given coordinates to the color of the given Color.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color} c - The Color to set.
   */
  setPixel(x: number, y: number, c: Color): void;

  /**
   * Set the red channel of the pixel, or the index value for palette images.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   */
  setPixelR(x: number, y: number, r: number): void;

  /**
   * Set the color of the Pixel at the given coordinates to the given color values r, g, b.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   */
  setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;

  /**
   * Set the color of the Pixel at the given coordinates to the given color values r, g, b, and a.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void;

  /**
   * Calls setPixelRgb, but ensures x and y are within the extents of the image, otherwise it returns without setting the pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   */
  setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;

  /**
   * Calls setPixelRgba, but ensures x and y are within the extents of the image, otherwise it returns without setting the pixel.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  setPixelRgbaSafe(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void;

  /**
   * Set all of the pixels to the Color c, or all values to 0 if c is not given.
   * @param {Color} [c] - The Color to set (optional).
   */
  clear(c?: Color): void;

  /**
   * Get the copy of this image data.
   * @param {boolean} [noPixels] - Whether to exclude pixel data in the copy (optional).
   * @returns {MemoryImageData} A copy of the MemoryImageData.
   */
  clone(noPixels?: boolean): MemoryImageData;

  /** The storage data of the image. */
  toUint8Array(): Uint8Array;

  /**
   * Similar to toUint8Array, but will convert the channels of the image pixels to the given order.
   *
   * @param {MemoryImageDataGetBytesOptions} [opt] - Options for getting bytes (optional).
   * @param {string} [opt.order] - The order in which to arrange the channels of the image pixels.
   * @param {boolean} [opt.alpha] - A boolean indicating whether to include the alpha channel.
   * @param {boolean} [opt.premultiplied] - A boolean indicating whether the color values are premultiplied by the alpha channel.
   * @returns {Uint8Array} A Uint8Array of the image data.
   */
  getBytes(opt?: MemoryImageDataGetBytesOptions): Uint8Array;
}

/**
 * Get the bytes of the image data.
 *
 * @param {MemoryImageData} data - The MemoryImageData object.
 * @param {MemoryImageDataGetBytesOptions} [opt] - Options for getting bytes (optional).
 * @param {ChannelOrder} [opt.order] - The desired channel order.
 * @param {boolean} [opt.inPlace] - Whether to modify the image data in place.
 * @returns {Uint8Array} A Uint8Array of the image data.
 */
export function getImageDataBytes(
  data: MemoryImageData,
  opt?: MemoryImageDataGetBytesOptions
): Uint8Array {
  const order = opt?.order;
  const inPlace = opt?.inPlace ?? false;

  if (order === undefined) {
    return data.toUint8Array();
  }

  if (data.numChannels === 4) {
    if (
      order === ChannelOrder.abgr ||
      order === ChannelOrder.argb ||
      order === ChannelOrder.bgra
    ) {
      const tempImage = inPlace ? data : data.clone();
      if (order === ChannelOrder.abgr) {
        for (const p of tempImage) {
          const r = p.r;
          const g = p.g;
          const b = p.b;
          const a = p.a;
          p.r = a;
          p.g = b;
          p.b = g;
          p.a = r;
        }
      } else if (order === ChannelOrder.argb) {
        for (const p of tempImage) {
          const r = p.r;
          const g = p.g;
          const b = p.b;
          const a = p.a;
          p.r = a;
          p.g = r;
          p.b = g;
          p.a = b;
        }
      } else if (order === ChannelOrder.bgra) {
        for (const p of tempImage) {
          const r = p.r;
          const g = p.g;
          const b = p.b;
          const a = p.a;
          p.r = b;
          p.g = g;
          p.b = r;
          p.a = a;
        }
      }
      return tempImage.toUint8Array();
    }
  } else if (data.numChannels === 3) {
    if (order === ChannelOrder.bgr) {
      const tempImage = inPlace ? data : data.clone();
      for (const p of tempImage) {
        const r = p.r;
        p.r = p.b;
        p.b = r;
      }
      return tempImage.toUint8Array();
    }
  }

  return data.toUint8Array();
}
