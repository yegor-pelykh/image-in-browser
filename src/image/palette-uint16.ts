/** @format */

import { Format } from '../color/format.js';
import { Palette } from './palette.js';

/**
 * Class representing a palette with 16-bit unsigned integer values.
 */
export class PaletteUint16 implements Palette {
  /**
   * Internal data storage for the palette.
   */
  private readonly _data: Uint16Array;

  /**
   * Gets the internal data array.
   * @returns {Uint16Array} The internal data array.
   */
  public get data(): Uint16Array {
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
    return Format.uint16;
  }

  /**
   * Gets the maximum value for a channel.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 0xffff;
  }

  /**
   * Creates an instance of PaletteUint16.
   * @param {number} numColors - The number of colors.
   * @param {number} numChannels - The number of channels per color.
   * @param {Uint16Array} [data] - Optional initial data.
   */
  constructor(numColors: number, numChannels: number, data?: Uint16Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Uint16Array(numColors * numChannels);
  }

  /**
   * Creates a new PaletteUint16 instance from another instance.
   * @param {PaletteUint16} other - The other PaletteUint16 instance.
   * @returns {PaletteUint16} A new PaletteUint16 instance.
   */
  public static from(other: PaletteUint16): PaletteUint16 {
    return new PaletteUint16(other.numColors, other.numChannels, other.data);
  }

  /**
   * Sets the RGB values at a specific index.
   * @param {number} index - The index to set the values at.
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
   * @param {number} index - The index to set the values at.
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
   * Sets a specific channel value at a specific index.
   * @param {number} index - The index to set the value at.
   * @param {number} channel - The channel to set the value for.
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
   * Gets a specific channel value at a specific index.
   * @param {number} index - The index to get the value from.
   * @param {number} channel - The channel to get the value for.
   * @returns {number} The value of the channel.
   */
  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? this._data[index * this._numChannels + channel]
      : 0;
  }

  /**
   * Gets the red value at a specific index.
   * @param {number} index - The index to get the red value from.
   * @returns {number} The red value.
   */
  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return this._data[_index];
  }

  /**
   * Gets the green value at a specific index.
   * @param {number} index - The index to get the green value from.
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
   * @param {number} index - The index to get the blue value from.
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
   * @param {number} index - The index to get the alpha value from.
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
   * @param {number} index - The index to set the red value at.
   * @param {number} value - The red value to set.
   */
  public setRed(index: number, value: number): void {
    this.set(index, 0, value);
  }

  /**
   * Sets the green value at a specific index.
   * @param {number} index - The index to set the green value at.
   * @param {number} value - The green value to set.
   */
  public setGreen(index: number, value: number): void {
    this.set(index, 1, value);
  }

  /**
   * Sets the blue value at a specific index.
   * @param {number} index - The index to set the blue value at.
   * @param {number} value - The blue value to set.
   */
  public setBlue(index: number, value: number): void {
    this.set(index, 2, value);
  }

  /**
   * Sets the alpha value at a specific index.
   * @param {number} index - The index to set the alpha value at.
   * @param {number} value - The alpha value to set.
   */
  public setAlpha(index: number, value: number): void {
    this.set(index, 3, value);
  }

  /**
   * Creates a clone of the current PaletteUint16 instance.
   * @returns {PaletteUint16} A new PaletteUint16 instance.
   */
  public clone(): PaletteUint16 {
    return PaletteUint16.from(this);
  }

  /**
   * Converts the internal data to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the internal data.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
