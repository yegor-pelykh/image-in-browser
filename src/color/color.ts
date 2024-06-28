/** @format */

import { Palette } from '../image/palette.js';
import { Channel } from './channel.js';
import { Format } from './format.js';

/**
 * Options for converting a color.
 */
export interface ColorConvertOptions {
  /**
   * The desired format for the color conversion.
   */
  format?: Format;
  /**
   * The number of channels in the converted color.
   */
  numChannels?: number;
  /**
   * The alpha value to use if the converted color has an alpha channel.
   */
  alpha?: number;
}

/**
 * The abstract Color interface is the base for all specific color and Pixel classes.
 */
export interface Color {
  /**
   * The number of channels used by the color.
   */
  get length(): number;
  /**
   * The maximum value for a color channel.
   */
  get maxChannelValue(): number;
  /**
   * The maximum value for a palette index.
   */
  get maxIndexValue(): number;
  /**
   * The format of the color.
   */
  get format(): Format;
  /**
   * True if the format is low dynamic range.
   */
  get isLdrFormat(): boolean;
  /**
   * True if the format is high dynamic range.
   */
  get isHdrFormat(): boolean;
  /**
   * True if the color uses a palette.
   */
  get hasPalette(): boolean;
  /**
   * The palette used by the color, or undefined if no palette is used.
   */
  get palette(): Palette | undefined;
  /**
   * Palette index value (or red channel if there is no palette).
   */
  get index(): number;
  set index(i: number);
  /**
   * Red channel value.
   */
  get r(): number;
  set r(r: number);
  /**
   * Green channel value.
   */
  get g(): number;
  set g(g: number);
  /**
   * Blue channel value.
   */
  get b(): number;
  set b(b: number);
  /**
   * Alpha channel value.
   */
  get a(): number;
  set a(a: number);
  /**
   * Normalized [0, 1] red channel value.
   */
  get rNormalized(): number;
  set rNormalized(v: number);
  /**
   * Normalized [0, 1] green channel value.
   */
  get gNormalized(): number;
  set gNormalized(v: number);
  /**
   * Normalized [0, 1] blue channel value.
   */
  get bNormalized(): number;
  set bNormalized(v: number);
  /**
   * Normalized [0, 1] alpha channel value.
   */
  get aNormalized(): number;
  set aNormalized(v: number);
  /**
   * The luminance (grayscale) of the color.
   */
  get luminance(): number;
  /**
   * Normalized [0, 1] luminance value.
   */
  get luminanceNormalized(): number;
  /**
   * Gets a channel value from the color by its index or Channel enum.
   * If the channel isn't available, 0 will be returned.
   */
  getChannel(channel: number | Channel): number;
  /**
   * Sets a channel value in the color by its index or Channel enum.
   */
  setChannel(channel: number | Channel, value: number): void;
  /**
   * Gets the normalized [0, 1] value of a channel from the color.
   * If the channel isn't available, 0 will be returned.
   */
  getChannelNormalized(channel: number | Channel): number;
  /**
   * Sets the values of this color to the given Color.
   */
  set(color: Color): void;
  /**
   * Sets the individual **r**, **g**, **b** channels of the color.
   */
  setRgb(r: number, g: number, b: number): void;
  /**
   * Sets the individual **r**, **g**, **b**, **a** channels of the color.
   */
  setRgba(r: number, g: number, b: number, a: number): void;
  /**
   * Converts the color to an array of channel values.
   */
  toArray(): number[];
  /**
   * Returns a copy of the color.
   */
  clone(): Color;
  /**
   * Converts the **format** and/or the **numChannels** of the color.
   * If **numChannels** is 4 and the current color does not have an alpha value,
   * then **alpha** can specify what value to use for the new alpha channel.
   * If **alpha** is not given, then **maxChannelValue** will be used.
   */
  convert(opt: ColorConvertOptions): Color;
  /**
   * Tests if this color is equivalent to another **Color**.
   */
  equals(other: Color | number[]): boolean;
}
