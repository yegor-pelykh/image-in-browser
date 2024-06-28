/** @format */

import { Format } from '../color/format.js';

/**
 * Interface representing a color palette.
 */
export interface Palette {
  /**
   * Gets the size of the palette data in bytes.
   */
  get byteLength(): number;

  /**
   * Gets the byte buffer storage of the palette data.
   */
  get buffer(): ArrayBufferLike;

  /**
   * Gets the number of colors stored in the palette.
   */
  get numColors(): number;

  /**
   * Gets the number of channels per color.
   */
  get numChannels(): number;

  /**
   * Gets the maximum value for any channel.
   */
  get maxChannelValue(): number;

  /**
   * Gets the format of the color data.
   */
  get format(): Format;

  /**
   * Sets the RGB color of a palette entry at the specified index.
   * If the palette has fewer channels than are set, the unsupported channels will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   */
  setRgb(index: number, r: number, g: number, b: number): void;

  /**
   * Sets the RGBA color of a palette entry at the specified index.
   * If the palette has fewer channels than are set, the unsupported channels will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  setRgba(index: number, r: number, g: number, b: number, a: number): void;

  /**
   * Sets a specific channel value of the palette entry at the specified index.
   * If the palette has fewer channels than the specified channel, the value will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} channel - The channel to set.
   * @param {number} value - The value to set.
   */
  set(index: number, channel: number, value: number): void;

  /**
   * Gets the value of a specific channel of the palette entry at the specified index.
   * If the palette has fewer colors than the specified index or fewer channels than the specified channel, 0 will be returned.
   * @param {number} index - The index of the palette entry.
   * @param {number} channel - The channel to get.
   * @returns {number} The value of the specified channel.
   */
  get(index: number, channel: number): number;

  /**
   * Gets the red channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, 0 will be returned.
   * @param {number} index - The index of the palette entry.
   * @returns {number} The red channel value.
   */
  getRed(index: number): number;

  /**
   * Sets the red channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, it will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} value - The red channel value to set.
   */
  setRed(index: number, value: number): void;

  /**
   * Gets the green channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, 0 will be returned.
   * @param {number} index - The index of the palette entry.
   * @returns {number} The green channel value.
   */
  getGreen(index: number): number;

  /**
   * Sets the green channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, it will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} value - The green channel value to set.
   */
  setGreen(index: number, value: number): void;

  /**
   * Gets the blue channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, 0 will be returned.
   * @param {number} index - The index of the palette entry.
   * @returns {number} The blue channel value.
   */
  getBlue(index: number): number;

  /**
   * Sets the blue channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, it will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} value - The blue channel value to set.
   */
  setBlue(index: number, value: number): void;

  /**
   * Gets the alpha channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, 0 will be returned.
   * @param {number} index - The index of the palette entry.
   * @returns {number} The alpha channel value.
   */
  getAlpha(index: number): number;

  /**
   * Sets the alpha channel of the palette entry at the specified index.
   * If the palette has fewer colors or channels, it will be ignored.
   * @param {number} index - The index of the palette entry.
   * @param {number} value - The alpha channel value to set.
   */
  setAlpha(index: number, value: number): void;

  /**
   * Creates a copy of the Palette.
   * @returns {Palette} A new Palette instance.
   */
  clone(): Palette;

  /**
   * Gets a Uint8Array view of the palette buffer storage.
   * @returns {Uint8Array} A Uint8Array representing the palette buffer.
   */
  toUint8Array(): Uint8Array;
}
