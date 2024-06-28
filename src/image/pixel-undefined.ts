/** @format */

import { Channel } from '../color/channel.js';
import { Color, ColorConvertOptions } from '../color/color.js';
import { Format } from '../color/format.js';
import { MemoryImageData } from './image-data.js';
import { MemoryImageDataUint8 } from './image-data-uint8.js';
import { Palette } from './palette.js';
import { Pixel } from './pixel.js';

/**
 * Represents an invalid pixel.
 */
export class PixelUndefined implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
  /**
   * A static readonly property representing null image data.
   */
  private static readonly _nullImageData = new MemoryImageDataUint8(0, 0, 0);

  /**
   * Gets the image data.
   * @returns {MemoryImageData} The image data.
   */
  public get image(): MemoryImageData {
    return PixelUndefined._nullImageData;
  }

  /**
   * Checks if the pixel is valid.
   * @returns {boolean} Always returns false.
   */
  public get isValid(): boolean {
    return false;
  }

  /**
   * Gets the width of the pixel.
   * @returns {number} Always returns 0.
   */
  public get width(): number {
    return 0;
  }

  /**
   * Gets the height of the pixel.
   * @returns {number} Always returns 0.
   */
  public get height(): number {
    return 0;
  }

  /**
   * Gets the x-coordinate of the pixel.
   * @returns {number} Always returns 0.
   */
  public get x(): number {
    return 0;
  }

  /**
   * Gets the y-coordinate of the pixel.
   * @returns {number} Always returns 0.
   */
  public get y(): number {
    return 0;
  }

  /**
   * Gets the normalized x-coordinate of the pixel.
   * @returns {number} Always returns 0.
   */
  public get xNormalized(): number {
    return 0;
  }

  /**
   * Gets the normalized y-coordinate of the pixel.
   * @returns {number} Always returns 0.
   */
  public get yNormalized(): number {
    return 0;
  }

  /**
   * Gets the length of the pixel.
   * @returns {number} Always returns 0.
   */
  public get length(): number {
    return 0;
  }

  /**
   * Gets the maximum channel value.
   * @returns {number} Always returns 0.
   */
  public get maxChannelValue(): number {
    return 0;
  }

  /**
   * Gets the maximum index value.
   * @returns {number} Always returns 0.
   */
  public get maxIndexValue(): number {
    return 0;
  }

  /**
   * Gets the format of the pixel.
   * @returns {Format} Always returns Format.uint8.
   */
  public get format(): Format {
    return Format.uint8;
  }

  /**
   * Checks if the format is LDR.
   * @returns {boolean} Always returns false.
   */
  public get isLdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the format is HDR.
   * @returns {boolean} Always returns false.
   */
  public get isHdrFormat(): boolean {
    return false;
  }

  /**
   * Checks if the pixel has a palette.
   * @returns {boolean} Always returns false.
   */
  public get hasPalette(): boolean {
    return false;
  }

  /**
   * Gets the palette of the pixel.
   * @returns {Palette | undefined} Always returns undefined.
   */
  public get palette(): Palette | undefined {
    return undefined;
  }

  /**
   * Gets the index of the pixel.
   * @returns {number} Always returns 0.
   */
  public get index(): number {
    return 0;
  }

  /**
   * Sets the index of the pixel.
   * @param {number} _i - The index to set.
   */
  public set index(_i: number) {}

  /**
   * Gets the red channel value.
   * @returns {number} Always returns 0.
   */
  public get r(): number {
    return 0;
  }

  /**
   * Sets the red channel value.
   * @param {number} _r - The red channel value to set.
   */
  public set r(_r: number) {}

  /**
   * Gets the green channel value.
   * @returns {number} Always returns 0.
   */
  public get g(): number {
    return 0;
  }

  /**
   * Sets the green channel value.
   * @param {number} _g - The green channel value to set.
   */
  public set g(_g: number) {}

  /**
   * Gets the blue channel value.
   * @returns {number} Always returns 0.
   */
  public get b(): number {
    return 0;
  }

  /**
   * Sets the blue channel value.
   * @param {number} _b - The blue channel value to set.
   */
  public set b(_b: number) {}

  /**
   * Gets the alpha channel value.
   * @returns {number} Always returns 0.
   */
  public get a(): number {
    return 0;
  }

  /**
   * Sets the alpha channel value.
   * @param {number} _a - The alpha channel value to set.
   */
  public set a(_a: number) {}

  /**
   * Gets the normalized red channel value.
   * @returns {number} Always returns 0.
   */
  public get rNormalized(): number {
    return 0;
  }

  /**
   * Sets the normalized red channel value.
   * @param {number} _v - The normalized red channel value to set.
   */
  public set rNormalized(_v: number) {}

  /**
   * Gets the normalized green channel value.
   * @returns {number} Always returns 0.
   */
  public get gNormalized(): number {
    return 0;
  }

  /**
   * Sets the normalized green channel value.
   * @param {number} _v - The normalized green channel value to set.
   */
  public set gNormalized(_v: number) {}

  /**
   * Gets the normalized blue channel value.
   * @returns {number} Always returns 0.
   */
  public get bNormalized(): number {
    return 0;
  }

  /**
   * Sets the normalized blue channel value.
   * @param {number} _v - The normalized blue channel value to set.
   */
  public set bNormalized(_v: number) {}

  /**
   * Gets the normalized alpha channel value.
   * @returns {number} Always returns 0.
   */
  public get aNormalized(): number {
    return 0;
  }

  /**
   * Sets the normalized alpha channel value.
   * @param {number} _v - The normalized alpha channel value to set.
   */
  public set aNormalized(_v: number) {}

  /**
   * Gets the luminance value.
   * @returns {number} Always returns 0.
   */
  public get luminance(): number {
    return 0;
  }

  /**
   * Gets the normalized luminance value.
   * @returns {number} Always returns 0.
   */
  public get luminanceNormalized(): number {
    return 0;
  }

  /**
   * Gets the value of the specified channel.
   * @param {number} _channel - The channel to get the value of.
   * @returns {number} Always returns 0.
   */
  public getChannel(_channel: number): number {
    return 0;
  }

  /**
   * Gets the normalized value of the specified channel.
   * @param {Channel} _channel - The channel to get the normalized value of.
   * @returns {number} Always returns 0.
   */
  public getChannelNormalized(_channel: Channel): number {
    return 0;
  }

  /**
   * Sets the value of the specified channel.
   * @param {number} _channel - The channel to set the value of.
   * @param {number} _value - The value to set.
   */
  public setChannel(_channel: number, _value: number): void {}

  /**
   * Sets the color of the pixel.
   * @param {Color} _color - The color to set.
   */
  public set(_color: Color): void {}

  /**
   * Sets the RGB values of the pixel.
   * @param {number} _r - The red value to set.
   * @param {number} _g - The green value to set.
   * @param {number} _b - The blue value to set.
   */
  public setRgb(_r: number, _g: number, _b: number): void {}

  /**
   * Sets the RGBA values of the pixel.
   * @param {number} _r - The red value to set.
   * @param {number} _g - The green value to set.
   * @param {number} _b - The blue value to set.
   * @param {number} _a - The alpha value to set.
   */
  public setRgba(_r: number, _g: number, _b: number, _a: number): void {}

  /**
   * Clones the pixel.
   * @returns {Color} A new PixelUndefined instance.
   */
  public clone(): Color {
    return new PixelUndefined();
  }

  /**
   * Converts the pixel to another format.
   * @param {ColorConvertOptions} _options - The conversion options.
   * @returns {Color} The converted color.
   */
  public convert(_options: ColorConvertOptions): Color {
    return this;
  }

  /**
   * Sets the position of the pixel.
   * @param {number} _x - The x-coordinate to set.
   * @param {number} _y - The y-coordinate to set.
   */
  public setPosition(_x: number, _y: number): void {}

  /**
   * Sets the normalized position of the pixel.
   * @param {number} _x - The normalized x-coordinate to set.
   * @param {number} _y - The normalized y-coordinate to set.
   */
  public setPositionNormalized(_x: number, _y: number): void {}

  /**
   * Checks if the pixel is equal to another pixel.
   * @param {Pixel} other - The other pixel to compare.
   * @returns {boolean} True if the other pixel is an instance of PixelUndefined, false otherwise.
   */
  public equals(other: Pixel): boolean {
    return other instanceof PixelUndefined;
  }

  /**
   * Gets the next iterator result.
   * @returns {IteratorResult<Pixel>} The next iterator result.
   */
  public next(): IteratorResult<Pixel> {
    return {
      done: true,
      value: this,
    };
  }

  /**
   * Converts the pixel to an array.
   * @returns {number[]} An empty array.
   */
  public toArray(): number[] {
    return [];
  }

  /**
   * Converts the pixel to a string.
   * @returns {string} A string representation of the pixel.
   */
  public toString(): string {
    return `${this.constructor.name} (undefined)`;
  }

  /**
   * Gets the iterator for the pixel.
   * @returns {Iterator<Pixel>} The iterator.
   */
  public [Symbol.iterator](): Iterator<Pixel> {
    return this;
  }
}
