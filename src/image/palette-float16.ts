/** @format */

import { Format } from '../color/format.js';
import { Float16 } from '../common/float16.js';
import { Palette } from './palette.js';

/**
 * Class representing a palette with Float16 color values.
 */
export class PaletteFloat16 implements Palette {
  /**
   * The underlying data array storing color values.
   * @private
   */
  private readonly _data: Uint16Array;

  /**
   * Gets the data array.
   * @returns {Uint16Array} The data array.
   */
  public get data(): Uint16Array {
    return this._data;
  }

  /**
   * The number of colors in the palette.
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
   * The number of channels per color.
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
   * Gets the byte length of the data array.
   * @returns {number} The byte length.
   */
  public get byteLength(): number {
    return this.data.byteLength;
  }

  /**
   * Gets the buffer of the data array.
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
    return Format.float16;
  }

  /**
   * Gets the maximum channel value.
   * @returns {number} The maximum channel value.
   */
  public get maxChannelValue(): number {
    return 1;
  }

  /**
   * Creates an instance of PaletteFloat16.
   * @param {number} numColors - The number of colors.
   * @param {number} numChannels - The number of channels per color.
   * @param {Uint16Array} [data] - Optional data array.
   */
  constructor(numColors: number, numChannels: number, data?: Uint16Array) {
    this._numColors = numColors;
    this._numChannels = numChannels;
    this._data = data ?? new Uint16Array(numColors * numChannels);
  }

  /**
   * Creates a new instance of PaletteFloat16 from another instance.
   * @param {PaletteFloat16} other - The other instance.
   * @returns {PaletteFloat16} A new instance.
   */
  public static from(other: PaletteFloat16): PaletteFloat16 {
    return new PaletteFloat16(other.numColors, other.numChannels, other.data);
  }

  /**
   * Sets the RGB values at a specific index.
   * @param {number} index - The index.
   * @param {number} r - The red value.
   * @param {number} g - The green value.
   * @param {number} b - The blue value.
   */
  public setRgb(index: number, r: number, g: number, b: number): void {
    let _index = index;
    _index *= this._numChannels;
    this._data[_index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Float16.doubleToFloat16(b);
      }
    }
  }

  /**
   * Sets the RGBA values at a specific index.
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
    this._data[_index] = Float16.doubleToFloat16(r);
    if (this._numChannels > 1) {
      this._data[_index + 1] = Float16.doubleToFloat16(g);
      if (this._numChannels > 2) {
        this._data[_index + 2] = Float16.doubleToFloat16(b);
        if (this._numChannels > 3) {
          this._data[_index + 3] = Float16.doubleToFloat16(a);
        }
      }
    }
  }

  /**
   * Sets the value of a specific channel at a specific index.
   * @param {number} index - The index.
   * @param {number} channel - The channel.
   * @param {number} value - The value.
   */
  public set(index: number, channel: number, value: number): void {
    let _index = index;
    if (channel < this._numChannels) {
      _index *= this._numChannels;
      this._data[_index + channel] = Float16.doubleToFloat16(value);
    }
  }

  /**
   * Gets the value of a specific channel at a specific index.
   * @param {number} index - The index.
   * @param {number} channel - The channel.
   * @returns {number} The value.
   */
  public get(index: number, channel: number): number {
    return channel < this._numChannels
      ? Float16.float16ToDouble(this._data[index * this._numChannels + channel])
      : 0;
  }

  /**
   * Gets the red value at a specific index.
   * @param {number} index - The index.
   * @returns {number} The red value.
   */
  public getRed(index: number): number {
    let _index = index;
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index]);
  }

  /**
   * Gets the green value at a specific index.
   * @param {number} index - The index.
   * @returns {number} The green value.
   */
  public getGreen(index: number): number {
    let _index = index;
    if (this._numChannels < 2) {
      return 0;
    }
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index + 1]);
  }

  /**
   * Gets the blue value at a specific index.
   * @param {number} index - The index.
   * @returns {number} The blue value.
   */
  public getBlue(index: number): number {
    let _index = index;
    if (this._numChannels < 3) {
      return 0;
    }
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index + 2]);
  }

  /**
   * Gets the alpha value at a specific index.
   * @param {number} index - The index.
   * @returns {number} The alpha value.
   */
  public getAlpha(index: number): number {
    let _index = index;
    if (this._numChannels < 4) {
      return 255;
    }
    _index *= this._numChannels;
    return Float16.float16ToDouble(this._data[_index + 3]);
  }

  /**
   * Sets the red value at a specific index.
   * @param {number} index - The index.
   * @param {number} value - The red value.
   */
  public setRed(index: number, value: number): void {
    this.set(index, 0, value);
  }

  /**
   * Sets the green value at a specific index.
   * @param {number} index - The index.
   * @param {number} value - The green value.
   */
  public setGreen(index: number, value: number): void {
    this.set(index, 1, value);
  }

  /**
   * Sets the blue value at a specific index.
   * @param {number} index - The index.
   * @param {number} value - The blue value.
   */
  public setBlue(index: number, value: number): void {
    this.set(index, 2, value);
  }

  /**
   * Sets the alpha value at a specific index.
   * @param {number} index - The index.
   * @param {number} value - The alpha value.
   */
  public setAlpha(index: number, value: number): void {
    this.set(index, 3, value);
  }

  /**
   * Creates a clone of the current palette.
   * @returns {PaletteFloat16} A new instance that is a clone of the current palette.
   */
  public clone(): PaletteFloat16 {
    return PaletteFloat16.from(this);
  }

  /**
   * Converts the palette to a Uint8Array.
   * @returns {Uint8Array} The Uint8Array representation of the palette.
   */
  public toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
