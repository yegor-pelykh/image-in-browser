/** @format */

import { Format } from '../color/format.js';
import { Palette } from './palette.js';

/**
 * Class representing a palette with 64-bit floating point color values.
 */
export class PaletteFloat64 implements Palette {
  /**
   * Internal storage for color data.
   * @private
   */
  private readonly _data: Float64Array;

  /**
   * Gets the color data.
   * @returns {Float64Array} The color data.
   */
  public get data(): Float64Array {
    return this._data;
  }

  /**
   * Number of colors in the palette.
   * @private
   */
  private readonly _numColors: number;

  /**
   * Gets the number of colors in the palette.
   * @returns {number} The number of colors.
   */
  public get numColors(): number {
    return this._numColors;
  }

  /**
   * Number of channels per color.
   * @private
   */
  private readonly _numChannels: number;

  /**
   * Gets the number of channels per color.
   * @returns {number} The number of channels.
   */
  public get numChannels(): number {
    return this._numChannels;
  }

  /**
   * Gets the byte length of the color data.
   * @returns {number} The byte length.
   */
  public get byteLength(): number {
    return this.data.byteLength;
  }

  /**
   * Gets the buffer of the color data.
   * @returns {ArrayBufferLike} The buffer.
   */
  public get buffer(): ArrayBufferLike {
    return this.data.buffer;
  }

  /**
   * Gets the format of the palette.
   * @returns {Format} The format.
   */
  public get format(): Format {
    return Format.float64;
  }

  /**
   * Gets the maximum channel value.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 1;
  }

  /**
   * Creates an instance of PaletteFloat64.
   * @param {number} numColors - The number of colors.
   * @param {number} numChannels - The number of channels per color.
   * @param {Float64Array} [data] - Optional initial color data.
   */
  constructor(numColors: number, numChannels: number, data?: Float64Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Float64Array(numColors * numChannels);
  }

  /**
   * Creates a new PaletteFloat64 from an existing one.
   * @param {PaletteFloat64} other - The existing palette.
   * @returns {PaletteFloat64} The new palette.
   */
  public static from(other: PaletteFloat64): PaletteFloat64 {
    return new PaletteFloat64(other.numColors, other.numChannels, other.data);
  }

  /**
   * Sets the RGB values for a specific color index.
   * @param {number} index - The color index.
   * @param {number} r - The red value.
   * @param {number} g - The green value.
   * @param {number} b - The blue value.
   */
  public setRgb(index: number, r: number, g: number, b: number): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = r;
    if (this._numChannels > 1) {
      this._data[_index + 1] = g;
      if (this._numChannels > 2) {
        this._data[_index + 2] = b;
      }
    }
  }

  /**
   * Sets the RGBA values for a specific color index.
   * @param {number} index - The color index.
   * @param {number} r - The red value.
   * @param {number} g - The green value.
   * @param {number} b - The blue value.
   * @param {number} a - The alpha value.
   */
  public setRgba(
    index: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = r;
    if (this._numChannels > 1) {
      this._data[_index + 1] = g;
      if (this._numChannels > 2) {
        this._data[_index + 2] = b;
        if (this._numChannels > 3) {
          this._data[_index + 3] = a;
        }
      }
    }
  }

  /**
   * Sets the value of a specific channel for a specific color index.
   * @param {number} index - The color index.
   * @param {number} channel - The channel index.
   * @param {number} value - The value to set.
   */
  public set(index: number, channel: number, value: number): void {
    let _index = index;
    if (channel < this._numChannels) {
      _index *= this._numChannels;
      this._data[_index + channel] = value;
    }
  }

  /**
   * Gets the value of a specific channel for a specific color index.
   * @param {number} index - The color index.
   * @param {number} channel - The channel index.
   * @returns {number} The value of the channel.
   */
  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? this._data[index * this._numChannels + channel]
      : 0;
  }

  /**
   * Gets the red value for a specific color index.
   * @param {number} index - The color index.
   * @returns {number} The red value.
   */
  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return this._data[_index];
  }

  /**
   * Gets the green value for a specific color index.
   * @param {number} index - The color index.
   * @returns {number} The green value.
   */
  public getGreen(index: number): number {
    let _index = index;
    if (this._numChannels < 2) {
      return 0;
    }
    _index *= this._numChannels;
    return this._data[_index + 1];
  }

  /**
   * Gets the blue value for a specific color index.
   * @param {number} index - The color index.
   * @returns {number} The blue value.
   */
  public getBlue(index: number): number {
    let _index = index;
    if (this._numChannels < 3) {
      return 0;
    }
    _index *= this._numChannels;
    return this._data[_index + 2];
  }

  /**
   * Gets the alpha value for a specific color index.
   * @param {number} index - The color index.
   * @returns {number} The alpha value.
   */
  public getAlpha(index: number): number {
    let _index = index;
    if (this._numChannels < 4) {
      return 255;
    }
    _index *= this._numChannels;
    return this._data[_index + 3];
  }

  /**
   * Sets the red value for a specific color index.
   * @param {number} index - The color index.
   * @param {number} value - The red value.
   */
  public setRed(index: number, value: number): void {
    this.set(index, 0, value);
  }

  /**
   * Sets the green value for a specific color index.
   * @param {number} index - The color index.
   * @param {number} value - The green value.
   */
  public setGreen(index: number, value: number): void {
    this.set(index, 1, value);
  }

  /**
   * Sets the blue value for a specific color index.
   * @param {number} index - The color index.
   * @param {number} value - The blue value.
   */
  public setBlue(index: number, value: number): void {
    this.set(index, 2, value);
  }

  /**
   * Sets the alpha value for a specific color index.
   * @param {number} index - The color index.
   * @param {number} value - The alpha value.
   */
  public setAlpha(index: number, value: number): void {
    this.set(index, 3, value);
  }

  /**
   * Creates a clone of the current palette.
   * @returns {PaletteFloat64} The cloned palette.
   */
  public clone(): PaletteFloat64 {
    return PaletteFloat64.from(this);
  }

  /**
   * Converts the palette to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the palette.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
