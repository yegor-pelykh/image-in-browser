/** @format */

import { MathUtils } from '../common/math-utils.js';
import { LibError } from '../error/lib-error.js';
import { Color } from './color.js';
import { ColorFloat16 } from './color-float16.js';
import { ColorFloat32 } from './color-float32.js';
import { ColorFloat64 } from './color-float64.js';
import { ColorInt16 } from './color-int16.js';
import { ColorInt32 } from './color-int32.js';
import { ColorInt8 } from './color-int8.js';
import { ColorUint1 } from './color-uint1.js';
import { ColorUint16 } from './color-uint16.js';
import { ColorUint2 } from './color-uint2.js';
import { ColorUint32 } from './color-uint32.js';
import { ColorUint4 } from './color-uint4.js';
import { ColorUint8 } from './color-uint8.js';
import { convertFormatValue, Format } from './format.js';

/**
 * Options for converting colors.
 */
export interface ConvertColorOptions {
  /**
   * The source color to convert from.
   */
  from: Color;

  /**
   * The target color to convert to. Optional.
   */
  to?: Color;

  /**
   * The format to convert the color to. Optional.
   */
  format?: Format;

  /**
   * The number of color channels. Optional.
   */
  numChannels?: number;

  /**
   * The alpha value for the color. Optional.
   */
  alpha?: number;
}

export abstract class ColorUtils {
  /**
   * Converts the color channels of the source color `c` to match the format and number of channels of the target color `c2`.
   *
   * @param {Color} c - The source color to be converted.
   * @param {Color} c2 - The target color object where the converted channels will be set.
   * @param {number} a - The alpha value to be used if the target color has an alpha channel.
   * @returns {Color} The target color `c2` with its channels set to the converted values from the source color `c`.
   */
  private static convertColorInternal(c: Color, c2: Color, a: number): Color {
    const numChannels = c2.length;
    const format = c2.format;
    const fromFormat = c.palette?.format ?? c.format;
    const cl = c.length;
    if (numChannels === 1) {
      const g = Math.trunc(c.length > 2 ? c.luminance : c.getChannel(0));
      c2.setChannel(0, convertFormatValue(g, fromFormat, format));
    } else if (numChannels <= cl) {
      for (let ci = 0; ci < numChannels; ++ci) {
        c2.setChannel(
          ci,
          convertFormatValue(c.getChannel(ci), fromFormat, format)
        );
      }
    } else {
      if (cl === 2) {
        const l = convertFormatValue(c.getChannel(0), fromFormat, format);
        if (numChannels === 3) {
          c2.setChannel(0, l);
          c2.setChannel(1, l);
          c2.setChannel(2, l);
        } else {
          const a = convertFormatValue(c.getChannel(1), fromFormat, format);
          c2.setChannel(0, l);
          c2.setChannel(1, l);
          c2.setChannel(2, l);
          c2.setChannel(3, a);
        }
      } else {
        for (let ci = 0; ci < cl; ++ci) {
          c2.setChannel(
            ci,
            convertFormatValue(c.getChannel(ci), fromFormat, format)
          );
        }
        const v = cl === 1 ? c2.getChannel(0) : 0;
        for (let ci = cl; ci < numChannels; ++ci) {
          c2.setChannel(ci, ci === 3 ? a : v);
        }
      }
    }
    return c2;
  }

  /**
   * Extracts the red component from a 32-bit integer color value.
   *
   * @param {number} c - The 32-bit integer color value.
   * @returns {number} The red component of the color.
   */
  public static uint32ToRed(c: number): number {
    return c & 0xff;
  }

  /**
   * Extracts the green component from a 32-bit unsigned integer color value.
   *
   * @param {number} c - The 32-bit unsigned integer representing the color.
   * @returns {number} The green component of the color, as an 8-bit unsigned integer.
   */
  public static uint32ToGreen(c: number): number {
    return (c >>> 8) & 0xff;
  }

  /**
   * Extracts the blue component from a 32-bit unsigned integer.
   * @param {number} c - The 32-bit unsigned integer.
   * @returns {number} The blue component (0-255).
   */
  public static uint32ToBlue(c: number): number {
    return (c >>> 16) & 0xff;
  }

  /**
   * Extracts the alpha component from a 32-bit unsigned integer.
   * @param {number} c - The 32-bit unsigned integer.
   * @returns {number} The alpha component (0-255).
   */
  public static uint32ToAlpha(c: number): number {
    return (c >>> 24) & 0xff;
  }

  /**
   * Converts RGBA color values to a single 32-bit unsigned integer.
   *
   * @param {number} r - The red component of the color (0-255).
   * @param {number} g - The green component of the color (0-255).
   * @param {number} b - The blue component of the color (0-255).
   * @param {number} a - The alpha component of the color (0-255).
   * @returns {number} A 32-bit unsigned integer representing the RGBA color.
   */
  public static rgbaToUint32(
    r: number,
    g: number,
    b: number,
    a: number
  ): number {
    return (
      MathUtils.clampInt255(r) |
      (MathUtils.clampInt255(g) << 8) |
      (MathUtils.clampInt255(b) << 16) |
      (MathUtils.clampInt255(a) << 24)
    );
  }

  /**
   * Converts a color from one format to another.
   *
   * @param {ConvertColorOptions} opt - The options for the color conversion, including the source color, target format, and other parameters.
   * @returns {Color} The converted color.
   * @throws {LibError} if the target format is unknown.
   */
  public static convertColor(opt: ConvertColorOptions): Color {
    const fromFormat = opt.from.palette?.format ?? opt.from.format;
    const format = opt.to?.format ?? opt.format ?? opt.from.format;
    const numChannels = opt.to?.length ?? opt.numChannels ?? opt.from.length;
    const alpha = opt.alpha ?? 0;

    if (format === fromFormat && numChannels === opt.from.length) {
      if (opt.to === undefined) {
        return opt.from.clone();
      }
      opt.to.set(opt.from);
      return opt.to;
    }

    switch (format) {
      case Format.uint8: {
        const c2 = opt.to ?? new ColorUint8(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.uint1: {
        const c2 = opt.to ?? new ColorUint1(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.uint2: {
        const c2 = opt.to ?? new ColorUint2(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.uint4: {
        const c2 = opt.to ?? new ColorUint4(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.uint16: {
        const c2 = opt.to ?? new ColorUint16(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.uint32: {
        const c2 = opt.to ?? new ColorUint32(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.int8: {
        const c2 = opt.to ?? new ColorInt8(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.int16: {
        const c2 = opt.to ?? new ColorInt16(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.int32: {
        const c2 = opt.to ?? new ColorInt32(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.float16: {
        const c2 = opt.to ?? new ColorFloat16(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.float32: {
        const c2 = opt.to ?? new ColorFloat32(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
      case Format.float64: {
        const c2 = opt.to ?? new ColorFloat64(numChannels);
        return this.convertColorInternal(opt.from, c2, alpha);
      }
    }
    throw new LibError('Unknown format.');
  }

  /**
   * Calculates the luminance of a given color.
   *
   * @param {Color} c - The color for which to calculate the luminance.
   * @returns {number} The luminance value of the color.
   */
  public static getLuminance(c: Color): number {
    return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  }

  /**
   * Calculates the normalized luminance of a given color.
   *
   * @param {Color} c - The Color object containing normalized RGB values.
   * @returns {number} The normalized luminance as a number.
   */
  public static getLuminanceNormalized(c: Color): number {
    return (
      0.299 * c.rNormalized + 0.587 * c.gNormalized + 0.114 * c.bNormalized
    );
  }

  /**
   * Calculates the luminance of an RGB color.
   *
   * @param {number} r - The red component of the color (0-255).
   * @param {number} g - The green component of the color (0-255).
   * @param {number} b - The blue component of the color (0-255).
   * @returns {number} The luminance of the color.
   */
  public static getLuminanceRgb(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  /**
   * Converts HSL (Hue, Saturation, Lightness) color values to RGB (Red, Green, Blue).
   *
   * @param {number} hue - The hue of the color, a number between 0 and 1.
   * @param {number} saturation - The saturation of the color, a number between 0 and 1.
   * @param {number} lightness - The lightness of the color, a number between 0 and 1.
   * @param {number[]} rgb - Array to return RGB values [red, green, blue], each ranging from 0 to 255.
   */
  public static hslToRgb(
    hue: number,
    saturation: number,
    lightness: number,
    rgb: number[]
  ): void {
    if (saturation === 0) {
      const gray = Math.trunc(lightness * 255);
      rgb[0] = gray;
      rgb[1] = gray;
      rgb[2] = gray;
      return;
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
      let _t = t;
      if (_t < 0) {
        _t += 1;
      }
      if (_t > 1) {
        _t -= 1;
      }
      if (_t < 1 / 6) {
        return p + (q - p) * 6 * _t;
      }
      if (_t < 1 / 2) {
        return q;
      }
      if (_t < 2 / 3) {
        return p + (q - p) * (2 / 3 - _t) * 6;
      }
      return p;
    };

    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    const r = hue2rgb(p, q, hue + 1 / 3);
    const g = hue2rgb(p, q, hue);
    const b = hue2rgb(p, q, hue - 1 / 3);

    rgb[0] = Math.round(r * 255);
    rgb[1] = Math.round(g * 255);
    rgb[2] = Math.round(b * 255);
  }

  /**
   * Converts RGB (Red, Green, Blue) color values to HSV (Hue, Saturation, Value).
   *
   * @param {number} r - The red color value, a number between 0 and 255.
   * @param {number} g - The green color value, a number between 0 and 255.
   * @param {number} b - The blue color value, a number between 0 and 255.
   * @param {number[]} hsv - Array to return HSV values [hue, saturation, value], where hue is in degrees (0 to 360), and saturation and value are between 0 and 1.
   */
  public static rgbToHsv(r: number, g: number, b: number, hsv: number[]): void {
    const minCh = Math.min(r, Math.min(g, b));
    const maxCh = Math.max(r, Math.max(g, b));
    const delta = maxCh - minCh;

    if (maxCh === 0 || delta === 0) {
      hsv[0] = 0;
      hsv[1] = 0;
      hsv[2] = 0;
      return;
    }

    let h: number = 0;
    let s: number = 0;
    let v: number = 0;

    v = maxCh;
    s = delta / maxCh;

    if (r === maxCh) {
      // between yellow & magenta
      h = (g - b) / delta;
    } else if (g === maxCh) {
      // between cyan & yellow
      h = 2 + (b - r) / delta;
    } else {
      // between magenta & cyan
      h = 4 + (r - g) / delta;
    }
    // degrees
    h *= 60;
    if (h < 0) {
      h += 360;
    }
    hsv[0] = h;
    hsv[1] = s;
    hsv[2] = v;
  }

  /**
   * Converts HSV (Hue, Saturation, Value) color values to RGB (Red, Green, Blue).
   *
   * @param {number} h - The hue of the color, in degrees (0 to 360).
   * @param {number} s - The saturation of the color, a number between 0 and 1.
   * @param {number} v - The value of the color, a number between 0 and 1.
   * @param {number[]} rgb - Array to return RGB values [red, green, blue], each ranging from 0 to 255.
   */
  public static hsvToRgb(h: number, s: number, v: number, rgb: number[]): void {
    let _h = h;

    if (s === 0) {
      const g = MathUtils.clamp(v, 0, 1);
      rgb[0] = g;
      rgb[1] = g;
      rgb[2] = g;
      return;
    }

    while (h < 0) {
      _h += 360;
    }
    while (h > 360) {
      _h -= 360;
    }

    _h /= 60;
    const i = Math.floor(_h);
    const f = _h - i;
    const p = MathUtils.clamp(v * (1 - s), 0, 1);
    const q = MathUtils.clamp(v * (1 - s * f), 0, 1);
    const t = MathUtils.clamp(v * (1 - s * (1 - f)), 0, 1);

    switch (i) {
      case 0:
        rgb[0] = v;
        rgb[1] = t;
        rgb[2] = p;
        return;
      case 1:
        rgb[0] = q;
        rgb[1] = v;
        rgb[2] = p;
        return;
      case 2:
        rgb[0] = p;
        rgb[1] = v;
        rgb[2] = t;
        return;
      case 3:
        rgb[0] = p;
        rgb[1] = q;
        rgb[2] = v;
        return;
      case 4:
        rgb[0] = t;
        rgb[1] = p;
        rgb[2] = v;
        return;
      default:
        // case 5
        rgb[0] = v;
        rgb[1] = p;
        rgb[2] = q;
        return;
    }
  }

  /**
   * Converts an RGB color value to HSL.
   *
   * @param {number} r - The red color value (0-255).
   * @param {number} g - The green color value (0-255).
   * @param {number} b - The blue color value (0-255).
   * @returns {number[]} An array containing the HSL representation [hue, saturation, lightness].
   */
  public static rgbToHsl(r: number, g: number, b: number): number[] {
    const _r = r / 255;
    const _g = g / 255;
    const _b = b / 255;
    const mx = Math.max(_r, Math.max(_g, _b));
    const mn = Math.min(_r, Math.min(_g, _b));
    const l = (mx + mn) / 2;

    if (mx === mn) {
      return [0, 0, l];
    }

    const d = mx - mn;

    const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);

    let h = 0;
    if (mx === _r) {
      h = (_g - _b) / d + (_g < _b ? 6 : 0);
    } else if (mx === _g) {
      h = (_b - _r) / d + 2;
    } else {
      h = (_r - _g) / d + 4;
    }

    h /= 6;

    return [h, s, l];
  }

  /**
   * Converts CIELAB (CIE L\*a\*b\*) color space values to XYZ color space values.
   *
   * @param {number} l - The lightness value (L*) in CIELAB.
   * @param {number} a - The a* chromaticity coordinate in CIELAB.
   * @param {number} b - The b* chromaticity coordinate in CIELAB.
   * @returns {number[]} The corresponding XYZ color space values.
   */
  public static labToXyz(l: number, a: number, b: number): number[] {
    let y = (l + 16) / 116;
    let x = y + a / 500;
    let z = y - b / 200;
    if (Math.pow(x, 3) > 0.008856) {
      x = Math.pow(x, 3);
    } else {
      x = (x - 16 / 116) / 7.787;
    }
    if (Math.pow(y, 3) > 0.008856) {
      y = Math.pow(y, 3);
    } else {
      y = (y - 16 / 116) / 7.787;
    }
    if (Math.pow(z, 3) > 0.008856) {
      z = Math.pow(z, 3);
    } else {
      z = (z - 16 / 116) / 7.787;
    }

    return [
      Math.trunc(x * 95.047),
      Math.trunc(y * 100),
      Math.trunc(z * 108.883),
    ];
  }

  /**
   * Converts XYZ color space values to RGB color space values.
   *
   * @param {number} x - The X value in the XYZ color space (0 to 100).
   * @param {number} y - The Y value in the XYZ color space (0 to 100).
   * @param {number} z - The Z value in the XYZ color space (0 to 100).
   * @returns {number[]} An array containing the RGB values, each ranging from 0 to 255.
   */
  public static xyzToRgb(x: number, y: number, z: number): number[] {
    const _x = x / 100;
    const _y = y / 100;
    const _z = z / 100;
    let r = 3.2406 * _x + -1.5372 * _y + -0.4986 * _z;
    let g = -0.9689 * _x + 1.8758 * _y + 0.0415 * _z;
    let b = 0.0557 * _x + -0.204 * _y + 1.057 * _z;
    if (r > 0.0031308) {
      r = 1.055 * Math.pow(r, 0.4166666667) - 0.055;
    } else {
      r *= 12.92;
    }
    if (g > 0.0031308) {
      g = 1.055 * Math.pow(g, 0.4166666667) - 0.055;
    } else {
      g *= 12.92;
    }
    if (b > 0.0031308) {
      b = 1.055 * Math.pow(b, 0.4166666667) - 0.055;
    } else {
      b *= 12.92;
    }

    return [
      MathUtils.clampInt255(r * 255),
      MathUtils.clampInt255(g * 255),
      MathUtils.clampInt255(b * 255),
    ];
  }

  /**
   * Converts CMYK color values to RGB color values.
   *
   * @param {number} c - The cyan component (0-255).
   * @param {number} m - The magenta component (0-255).
   * @param {number} y - The yellow component (0-255).
   * @param {number} k - The black component (0-255).
   * @param {number[]} rgb - Array to return RGB values [red, green, blue], each ranging from 0 to 255.
   */
  public static cmykToRgb(
    c: number,
    m: number,
    y: number,
    k: number,
    rgb: number[]
  ): void {
    const _c = c / 255;
    const _m = m / 255;
    const _y = y / 255;
    const _k = k / 255;
    rgb[0] = Math.round(255 * (1 - _c) * (1 - _k));
    rgb[1] = Math.round(255 * (1 - _m) * (1 - _k));
    rgb[2] = Math.round(255 * (1 - _y) * (1 - _k));
  }

  /**
   * Converts LAB color values to RGB color values.
   *
   * @param {number} l - The lightness value (0 to 100).
   * @param {number} a - The green-red color component.
   * @param {number} b - The blue-yellow color component.
   * @returns {number[]} An array containing the RGB values [R, G, B] where each value is in the range 0 to 255.
   */
  public static labToRgb(l: number, a: number, b: number): number[] {
    const refX = 95.047;
    const refY = 100.0;
    const refZ = 108.883;

    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    const y3 = Math.pow(y, 3);
    if (y3 > 0.008856) {
      y = y3;
    } else {
      y = (y - 16 / 116) / 7.787;
    }

    const x3 = Math.pow(x, 3);
    if (x3 > 0.008856) {
      x = x3;
    } else {
      x = (x - 16 / 116) / 7.787;
    }

    const z3 = Math.pow(z, 3);
    if (z3 > 0.008856) {
      z = z3;
    } else {
      z = (z - 16 / 116) / 7.787;
    }

    x *= refX;
    y *= refY;
    z *= refZ;

    x /= 100;
    y /= 100;
    z /= 100;

    // xyz to rgb
    let R = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let G = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let B = x * 0.0557 + y * -0.204 + z * 1.057;

    if (R > 0.0031308) {
      R = 1.055 * Math.pow(R, 1 / 2.4) - 0.055;
    } else {
      R *= 12.92;
    }

    if (G > 0.0031308) {
      G = 1.055 * Math.pow(G, 1 / 2.4) - 0.055;
    } else {
      G *= 12.92;
    }

    if (B > 0.0031308) {
      B = 1.055 * Math.pow(B, 1 / 2.4) - 0.055;
    } else {
      B *= 12.92;
    }

    return [
      MathUtils.clampInt255(R * 255),
      MathUtils.clampInt255(G * 255),
      MathUtils.clampInt255(B * 255),
    ];
  }

  /**
   * Converts an RGB color value to XYZ color space.
   *
   * The RGB values should be in the range [0, 255]. The returned XYZ values
   * will be in the range [0, 100].
   *
   * @param {number} r - The red color value, in the range [0, 255].
   * @param {number} g - The green color value, in the range [0, 255].
   * @param {number} b - The blue color value, in the range [0, 255].
   * @returns {number[]} The XYZ representation of the color, as an array of three numbers.
   */
  public static rgbToXyz(r: number, g: number, b: number): number[] {
    let _r = r / 255;
    let _g = g / 255;
    let _b = b / 255;

    if (_r > 0.04045) {
      _r = Math.pow((_r + 0.055) / 1.055, 2.4);
    } else {
      _r /= 12.92;
    }
    if (_g > 0.04045) {
      _g = Math.pow((_g + 0.055) / 1.055, 2.4);
    } else {
      _g /= 12.92;
    }
    if (_b > 0.04045) {
      _b = Math.pow((_b + 0.055) / 1.055, 2.4);
    } else {
      _b /= 12.92;
    }

    _r *= 100;
    _g *= 100;
    _b *= 100;

    return [
      _r * 0.4124 + _g * 0.3576 + _b * 0.1805,
      _r * 0.2126 + _g * 0.7152 + _b * 0.0722,
      _r * 0.0193 + _g * 0.1192 + _b * 0.9505,
    ];
  }

  /**
   * Converts XYZ color space values to CIELAB (CIE L\*a\*b\*) color space values.
   *
   * @param {number} x - The X value in the XYZ color space.
   * @param {number} y - The Y value in the XYZ color space.
   * @param {number} z - The Z value in the XYZ color space.
   * @returns {number[]} An array containing the L*, a*, and b* values in the CIELAB color space.
   */
  public static xyzToLab(x: number, y: number, z: number): number[] {
    let _x = x / 95.047;
    let _y = y / 100;
    let _z = z / 108.883;

    if (_x > 0.008856) {
      _x = Math.pow(_x, 1 / 3);
    } else {
      _x = 7.787 * _x + 16 / 116;
    }
    if (_y > 0.008856) {
      _y = Math.pow(_y, 1 / 3);
    } else {
      _y = 7.787 * _y + 16 / 116;
    }
    if (_z > 0.008856) {
      _z = Math.pow(_z, 1 / 3);
    } else {
      _z = 7.787 * _z + 16 / 116;
    }

    return [116 * _y - 16, 500 * (_x - _y), 200 * (_y - _z)];
  }

  /**
   * Convert an RGB color to CIELAB (CIE L\*a\*b\*) color space.
   *
   * @param {number} r - Red component (0-255).
   * @param {number} g - Green component (0-255).
   * @param {number} b - Blue component (0-255).
   * @returns {number[]} An array containing the CIELAB values.
   */
  public static rgbToLab(r: number, g: number, b: number): number[] {
    let _r = r / 255;
    let _g = g / 255;
    let _b = b / 255;

    if (_r > 0.04045) {
      _r = Math.pow((_r + 0.055) / 1.055, 2.4);
    } else {
      _r /= 12.92;
    }
    if (_g > 0.04045) {
      _g = Math.pow((_g + 0.055) / 1.055, 2.4);
    } else {
      _g /= 12.92;
    }
    if (_b > 0.04045) {
      _b = Math.pow((_b + 0.055) / 1.055, 2.4);
    } else {
      _b /= 12.92;
    }

    _r *= 100;
    _g *= 100;
    _b *= 100;

    let x = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
    let y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
    let z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    if (x > 0.008856) {
      x = Math.pow(x, 1 / 3);
    } else {
      x = 7.787 * x + 16 / 116;
    }
    if (y > 0.008856) {
      y = Math.pow(y, 1 / 3);
    } else {
      y = 7.787 * y + 16 / 116;
    }
    if (z > 0.008856) {
      z = Math.pow(z, 1 / 3);
    } else {
      z = 7.787 * z + 16 / 116;
    }

    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }
}
