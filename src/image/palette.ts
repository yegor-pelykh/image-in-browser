/** @format */

import { Format } from '../color/format';

export interface Palette {
  /**
   * The size of the palette data in bytes.
   */
  get byteLength(): number;
  /**
   * The byte buffer storage of the palette data.
   */
  get buffer(): ArrayBufferLike;
  /**
   * The number of colors stored in the palette.
   */
  get numColors(): number;
  /**
   * The number of channels per color.
   */
  get numChannels(): number;
  get maxChannelValue(): number;
  /**
   * The format of the color data.
   */
  get format(): Format;
  /**
   * Set the RGB color of a palette entry at **index**. If the palette has fewer
   * channels than are set, the unsupported channels will be ignored.
   */
  setRgb(index: number, r: number, g: number, b: number): void;
  /**
   * Set the RGBA color of a palette entry at **index**. If the palette has fewer
   * channels than are set, the unsupported channels will be ignored.
   */
  setRgba(index: number, r: number, g: number, b: number, a: number): void;
  /**
   * Set a specific **channel** **value** of the palette entry at **index**. If the
   * palette has fewer channels than **channel**, the value will be ignored.
   */
  set(index: number, channel: number, value: number): void;
  /**
   * Get the the value of a specific **channel** of the palette entry at **index**.
   * If the palette has fewer colors than **index** or fewer channels than
   * **channel**, 0 will be returned.
   */
  get(index: number, channel: number): number;
  /**
   * Get the red channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, 0 will be returned.
   */
  getRed(index: number): number;
  /**
   * Set the red channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, it will be ignored.
   */
  setRed(index: number, value: number): void;
  /**
   * Get the green channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, 0 will be returned.
   */
  getGreen(index: number): number;
  /**
   * Set the green channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, it will be ignored.
   */
  setGreen(index: number, value: number): void;
  /**
   * Get the blue channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, 0 will be returned.
   */
  getBlue(index: number): number;
  /**
   * Set the blue channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, it will be ignored.
   */
  setBlue(index: number, value: number): void;
  /**
   * Get the alpha channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, 0 will be returned.
   */
  getAlpha(index: number): number;
  /**
   * Set the alpha channel of the palette entry at **index**. If the palette has
   * fewer colors or channels, it will be ignored.
   */
  setAlpha(index: number, value: number): void;
  /**
   * Create a copy of the Palette.
   */
  clone(): Palette;
  /**
   * A Uint8Array view of the palette buffer storage.
   */
  toUint8Array(): Uint8Array;
}
