/** @format */

import { Format } from '../color/format.js';
import { Palette } from './palette.js';

/**
 * Class representing a palette of 32-bit integers.
 */
export class PaletteInt32 implements Palette {
  /**
   * The internal data storage for the palette.
   */
  private readonly _data: Int32Array;

  /**
   * Gets the internal data storage for the palette.
   * @returns {Int32Array} The internal data storage.
   */
  public get data(): Int32Array {
    return this._data;
  }

  /**
   * The number of colors in the palette.
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
   * The number of channels per color.
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
   * Gets the byte length of the internal data storage.
   * @returns {number} The byte length.
   */
  public get byteLength(): number {
    return this._data.byteLength;
  }

  /**
   * Gets the buffer of the internal data storage.
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
    return Format.int32;
  }

  /**
   * Gets the maximum value for a channel.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 0x7fffffff;
  }

  /**
   * Creates an instance of PaletteInt32.
   * @param {number} numColors - The number of colors.
   * @param {number} numChannels - The number of channels per color.
   * @param {Int32Array} [data] - Optional initial data.
   */
  constructor(numColors: number, numChannels: number, data?: Int32Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Int32Array(numColors * numChannels);
  }

  /**
   * Creates a new instance of PaletteInt32 from another instance.
   * @param {PaletteInt32} other - The other instance.
   * @returns {PaletteInt32} A new instance.
   */
  public static from(other: PaletteInt32): PaletteInt32 {
    return new PaletteInt32(other.numColors, other.numChannels, other.data);
  }

  /**
   * Sets the RGB values for a specific index.
   * @param {number} index - The index.
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
   * Sets the RGBA values for a specific index.
   * @param {number} index - The index.
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
   * Sets the value for a specific channel at a specific index.
   * @param {number} index - The index.
   * @param {number} channel - The channel.
   * @param {number} value - The value.
   */
  public set(index: number, channel: number, value: number): void {
    let _index = index;
    if (channel < this._numChannels) {
      _index *= this._numChannels;
      this._data[_index + channel] = Math.trunc(value);
    }
  }

  /**
   * Gets the value for a specific channel at a specific index.
   * @param {number} index - The index.
   * @param {number} channel - The channel.
   * @returns {number} The value.
   */
  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? this._data[index * this._numChannels + channel]
      : 0;
  }

  /**
   * Gets the red value for a specific index.
   * @param {number} index - The index.
   * @returns {number} The red value.
   */
  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return this._data[_index];
  }

  /**
   * Gets the green value for a specific index.
   * @param {number} index - The index.
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
   * Gets the blue value for a specific index.
   * @param {number} index - The index.
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
   * Gets the alpha value for a specific index.
   * @param {number} index - The index.
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
   * Sets the red value for a specific index.
   * @param {number} index - The index.
   * @param {number} value - The red value.
   */
  public setRed(index: number, value: number): void {
    this.set(index, 0, value);
  }

  /**
   * Sets the green value for a specific index.
   * @param {number} index - The index.
   * @param {number} value - The green value.
   */
  public setGreen(index: number, value: number): void {
    this.set(index, 1, value);
  }

  /**
   * Sets the blue value for a specific index.
   * @param {number} index - The index.
   * @param {number} value - The blue value.
   */
  public setBlue(index: number, value: number): void {
    this.set(index, 2, value);
  }

  /**
   * Sets the alpha value for a specific index.
   * @param {number} index - The index.
   * @param {number} value - The alpha value.
   */
  public setAlpha(index: number, value: number): void {
    this.set(index, 3, value);
  }

  /**
   * Creates a clone of the current instance.
   * @returns {PaletteInt32} A new instance that is a clone of the current instance.
   */
  public clone(): PaletteInt32 {
    return PaletteInt32.from(this);
  }

  /**
   * Converts the internal data storage to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the internal data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
