/** @format */

import { ChannelOrder } from '../color/channel-order';
import { Color } from '../color/color';
import { Format, FormatType } from '../color/format';
import { Palette } from './palette';
import { Pixel } from './pixel';

export interface MemoryImageData extends Iterable<Pixel> {
  get width(): number;

  get height(): number;

  get numChannels(): number;

  /**
   * The channel **Format** of the image.
   */
  get format(): Format;

  /**
   * Whether the image has uint, int, or float data.
   */
  get formatType(): FormatType;

  /**
   * True if the image format is "high dynamic range." HDR formats include:
   * float16, float32, float64, int8, int16, and int32.
   */
  get isHdrFormat(): boolean;

  /**
   * True if the image format is "low dynamic range." LDR formats include:
   * uint1, uint2, uint4, and uint8.
   */
  get isLdrFormat(): boolean;

  /**
   * The number of bits per color channel. Can be 1, 2, 4, 8, 16, 32, or 64.
   */
  get bitsPerChannel(): number;

  /**
   * The maximum value of a pixel channel, based on the **format** of the image.
   * If the image has a **palette**, this will be the maximum value of a palette
   * color channel. Float format images will have a **maxChannelValue** of 1,
   * though they can have values above that.
   */
  get maxChannelValue(): number;

  /**
   * The maximum value of a palette index, based on the **format** of the image.
   * This differs from **maxChannelValue** in that it will not be affected by
   * the format of the **palette**.
   */
  get maxIndexValue(): number;

  /**
   * True if the image has a palette. If the image has a palette, then the
   * image data has 1 channel for the palette index of the pixel.
   */
  get hasPalette(): boolean;

  /**
   * The **Palette** of the image, or undefined if the image does not have one.
   */
  get palette(): Palette | undefined;
  set palette(p: Palette | undefined);

  /**
   * The size of the image data in bytes.
   */
  get byteLength(): number;

  /**
   * The size of the image data in bytes.
   */
  get length(): number;

  /**
   * The **ArrayBufferLike** storage of the image.
   */
  get buffer(): ArrayBufferLike;

  /**
   * The size, in bytes, of a row if pixels in the data.
   */
  get rowStride(): number;

  /**
   * Returns a pixel iterator for iterating over a rectangular range of pixels
   * in the image.
   */
  getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel>;

  /**
   * Create a **Color** object with the format and number of channels of the
   * image.
   */
  getColor(r: number, g: number, b: number, a?: number): Color;

  /**
   * Return the **Pixel** at the given coordinates. If **pixel** is provided,
   * it will be updated and returned rather than allocating a new **Pixel**.
   */
  getPixel(x: number, y: number, pixel?: Pixel): Pixel;

  /**
   * Set the color of the pixel at the given coordinates to the color of the
   * given Color **c**.
   */
  setPixel(x: number, y: number, c: Color): void;

  /**
   * Set the red channel of the pixel, or the index value for palette images.
   */
  setPixelR(x: number, y: number, r: number): void;

  /**
   * Set the color of the **Pixel** at the given coordinates to the given
   * color values **r**, **g**, **b**.
   */
  setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;

  /**
   * Set the color of the **Pixel** at the given coordinates to the given
   * color values **r**, **g**, **b**, and **a**.
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
   * Calls **setPixelRgb**, but ensures **x** and **y** are within the extents
   * of the image, otherwise it returns without setting the pixel.
   */
  setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;

  /**
   * Calls **setPixelRgba**, but ensures **x** and **y** are within the extents
   * of the image, otherwise it returns without setting the pixel.
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
   * Set all of the pixels to the Color **c**, or all values to 0 if **c** is not
   * given.
   */
  clear(c?: Color): void;

  /**
   * Get the copy of this image data.
   */
  clone(noPixels?: boolean): MemoryImageData;

  /**
   * The storage data of the image.
   */
  toUint8Array(): Uint8Array;

  /**
   * Similar to toUint8Array, but will convert the channels of the image pixels
   * to the given **order**. If that happens, the returned bytes will be a copy
   * and not a direct view of the image data.
   */
  getBytes(order?: ChannelOrder): Uint8Array;
}
