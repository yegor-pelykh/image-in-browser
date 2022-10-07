/** @format */

import { ColorUtils } from './color-utils';

/**
 * Image pixel colors are instantiated as an int object rather than an instance
 * of the Color class in order to reduce object allocations.
 */
export abstract class Color {
  /**
   * Create a color value from RGB values in the range [0, 255].
   *
   * The channel order of a uint32 encoded color is BGRA.
   */
  public static fromRgb(red: number, green: number, blue: number): number {
    return ColorUtils.getColor(red, green, blue);
  }

  /**
   * Create a color value from RGBA values in the range [0, 255].
   *
   * The channel order of a uint32 encoded color is BGRA.
   */
  public static fromRgba(
    red: number,
    green: number,
    blue: number,
    alpha: number
  ): number {
    return ColorUtils.getColor(red, green, blue, alpha);
  }

  /**
   * Create a color value from HSL values in the range [0, 1].
   */
  public static fromHsl(
    hue: number,
    saturation: number,
    lightness: number
  ): number {
    const rgb = ColorUtils.hslToRgb(hue, saturation, lightness);
    return ColorUtils.getColor(rgb[0], rgb[1], rgb[2]);
  }

  /**
   * Create a color value from HSV values in the range [0, 1].
   */
  public static fromHsv(
    hue: number,
    saturation: number,
    value: number
  ): number {
    const rgb = ColorUtils.hsvToRgb(hue, saturation, value);
    return ColorUtils.getColor(rgb[0], rgb[1], rgb[2]);
  }

  /**
   * Create a color value from XYZ values.
   */
  public static fromXyz(x: number, y: number, z: number): number {
    const rgb = ColorUtils.xyzToRgb(x, y, z);
    return ColorUtils.getColor(rgb[0], rgb[1], rgb[2]);
  }

  /**
   * Create a color value from CIE-L*ab values.
   */
  public static fromLab(L: number, a: number, b: number): number {
    const rgb = ColorUtils.labToRgb(L, a, b);
    return ColorUtils.getColor(rgb[0], rgb[1], rgb[2]);
  }

  /**
   * Compare colors from a 3 or 4 dimensional color space
   */
  public static distance(
    c1: number[],
    c2: number[],
    compareAlpha: boolean
  ): number {
    const d1 = c1[0] - c2[0];
    const d2 = c1[1] - c2[1];
    const d3 = c1[2] - c2[2];
    if (compareAlpha) {
      const dA = c1[3] - c2[3];
      return Math.sqrt(
        Math.max(d1 * d1, (d1 - dA) * (d1 - dA)) +
          Math.max(d2 * d2, (d2 - dA) * (d2 - dA)) +
          Math.max(d3 * d3, (d3 - dA) * (d3 - dA))
      );
    } else {
      return Math.sqrt(d1 * d1 + d2 * d2 + d3 * d3);
    }
  }
}
