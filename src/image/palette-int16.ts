/** @format */

import { Format } from '../color/format.js';
import { Palette } from './palette.js';

/**
 * Class representing a palette with Int16 values.
 */
export class PaletteInt16 implements Palette {
  /**
   * Internal data storage for the palette.
   */
  private readonly _data: Int16Array;

  /**
   * Gets the internal data array.
   * @returns {Int16Array} The internal data array.
   */
  public get data(): Int16Array {
    return this._data;
  }

  /**
   * Number of colors in the palette.
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
   * Gets the byte length of the internal data array.
   * @returns {number} The byte length.
   */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /**
   * Gets the buffer of the internal data array.
   * @returns {ArrayBufferLike} The buffer.
   */
  public get buffer(): ArrayBufferLike {
    return this._data.buffer;
  }

  /**
   * Gets the format of the palette.
   * @returns {Format} The format.
   */
  public get format(): Format {
    return Format.int16;
  }

  /**
   * Gets the maximum channel value.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 0x7fff;
  }

  /**
   * Creates an instance of PaletteInt16.
   * @param {number} numColors - The number of colors.
   * @param {number} numChannels - The number of channels per color.
   * @param {Int16Array} [data] - Optional initial data array.
   */
  constructor(numColors: number, numChannels: number, data?: Int16Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Int16Array(numColors * numChannels);
  }

  /**
   * Creates a new PaletteInt16 instance from another instance.
   * @param {PaletteInt16} other - The other PaletteInt16 instance.
   * @returns {PaletteInt16} A new PaletteInt16 instance.
   */
  public static from(other: PaletteInt16): PaletteInt16 {
    return new PaletteInt16(other.numColors, other.numChannels, other.data);
  }

  /**
   * Sets the RGB values at a specific index.
   * @param {number} index - The index to set.
   * @param {number} r - The red value.
   * @param {number} g - The green value.
   * @param {number} b - The blue value.
   */
  public setRgb(index: number, r: number, g: number, b: number): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Math.trunc(b);
      }
    }
  }

  /**
   * Sets the RGBA values at a specific index.
   * @param {number} index - The index to set.
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
    this._data[_index] = Math.trunc(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Math.trunc(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Math.trunc(b);
        if (this._numChannels > 3) {
          this._data[_index + 3] = Math.trunc(a);
        }
      }
    }
  }

  /**
   * Sets the value of a specific channel at a specific index.
   * @param {number} index - The index to set.
   * @param {number} channel - The channel to set.
   * @param {number} value - The value to set.
   */
  public set(index: number, channel: number, value: number): void {
    let _index = index;
    if (channel < this._numChannels) {
      _index *= this._numChannels;
      this._data[_index + channel] = Math.trunc(value);
    }
  }

  /**
   * Gets the value of a specific channel at a specific index.
   * @param {number} index - The index to get.
   * @param {number} channel - The channel to get.
   * @returns {number} The value of the channel.
   */
  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? this._data[index * this._numChannels + channel]
      : 0;
  }

  /**
   * Gets the red value at a specific index.
   * @param {number} index - The index to get.
   * @returns {number} The red value.
   */
  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return this._data[_index];
  }

  /**
   * Gets the green value at a specific index.
   * @param {number} index - The index to get.
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
   * Gets the blue value at a specific index.
   * @param {number} index - The index to get.
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
   * Gets the alpha value at a specific index.
   * @param {number} index - The index to get.
   * @returns {number} The alpha value.
   */
  public getAlpha(index: number): number {
    let _index = index;
    if (this._numChannels < 4) {
      return 0;
    }
    _index *= this._numChannels;
    return this._data[_index + 3];
  }

  /**
   * Sets the red value at a specific index.
   * @param {number} index - The index to set.
   * @param {number} value - The red value to set.
   */
  public setRed(index: number, value: number): void {
    this.set(index, 0, value);
  }

  /**
   * Sets the green value at a specific index.
   * @param {number} index - The index to set.
   * @param {number} value - The green value to set.
   */
  public setGreen(index: number, value: number): void {
    this.set(index, 1, value);
  }

  /**
   * Sets the blue value at a specific index.
   * @param {number} index - The index to set.
   * @param {number} value - The blue value to set.
   */
  public setBlue(index: number, value: number): void {
    this.set(index, 2, value);
  }

  /**
   * Sets the alpha value at a specific index.
   * @param {number} index - The index to set.
   * @param {number} value - The alpha value to set.
   */
  public setAlpha(index: number, value: number): void {
    this.set(index, 3, value);
  }

  /**
   * Creates a clone of the current PaletteInt16 instance.
   * @returns {PaletteInt16} A new PaletteInt16 instance.
   */
  public clone(): PaletteInt16 {
    return PaletteInt16.from(this);
  }

  /**
   * Converts the internal data to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
