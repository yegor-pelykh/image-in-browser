/** @format */

import { MathUtils } from '../common/math-utils';
import { LibError } from '../error/lib-error';
import { Color } from './color';
import { ColorFloat16 } from './color-float16';
import { ColorFloat32 } from './color-float32';
import { ColorFloat64 } from './color-float64';
import { ColorInt16 } from './color-int16';
import { ColorInt32 } from './color-int32';
import { ColorInt8 } from './color-int8';
import { ColorUint1 } from './color-uint1';
import { ColorUint16 } from './color-uint16';
import { ColorUint2 } from './color-uint2';
import { ColorUint32 } from './color-uint32';
import { ColorUint4 } from './color-uint4';
import { ColorUint8 } from './color-uint8';
import { convertFormatValue, Format } from './format';

export interface ConvertColorOptions {
  from: Color;
  to?: Color;
  format?: Format;
  numChannels?: number;
  alpha?: number;
}

export abstract class ColorUtils {
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
    return c2;
  }

  public static uint32ToRed(c: number): number {
    return c & 0xff;
  }

  public static uint32ToGreen(c: number): number {
    return (c >> 8) & 0xff;
  }

  public static uint32ToBlue(c: number): number {
    return (c >> 16) & 0xff;
  }

  public static uint32ToAlpha(c: number): number {
    return (c >> 24) & 0xff;
  }

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
   * Returns the luminance (grayscale) value of the color.
   */
  public static getLuminance(c: Color): number {
    return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  }

  /**
   * Returns the normalized [0, 1] luminance (grayscale) value of the color.
   */
  public static getLuminanceNormalized(c: Color): number {
    return (
      0.299 * c.rNormalized + 0.587 * c.gNormalized + 0.114 * c.bNormalized
    );
  }

  /**
   * Returns the luminance (grayscale) value of the color.
   */
  public static getLuminanceRgb(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  /**
   *  Convert an HSL color to RGB, where **hue** is specified in normalized degrees
   * [0, 1] (where 1 is 360-degrees); **saturation** and **lightness** are in the range [0, 1].
   * Returns a list [r, g, b] with values in the range [0, 255].
   */
  public static hslToRgb(
    hue: number,
    saturation: number,
    lightness: number
  ): number[] {
    if (saturation === 0) {
      const gray = Math.trunc(lightness * 255);
      return [gray, gray, gray];
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

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Convert an HSV color to RGB, where **hue** is specified in normalized degrees
   * [0, 1] (where 1 is 360-degrees); **saturation** and **brightness** are in the range [0, 1].
   * Returns a list [r, g, b] with values in the range [0, 255].
   */
  public static hsvToRgb(
    hue: number,
    saturation: number,
    brightness: number
  ): number[] {
    if (saturation === 0) {
      const gray = Math.round(brightness * 255);
      return [gray, gray, gray];
    }

    const h = (hue - Math.floor(hue)) * 6;
    const f = h - Math.floor(h);
    const p = brightness * (1 - saturation);
    const q = brightness * (1 - saturation * f);
    const t = brightness * (1 - saturation * (1 - f));

    switch (Math.trunc(h)) {
      case 0:
        return [
          Math.round(brightness * 255),
          Math.round(t * 255),
          Math.round(p * 255),
        ];
      case 1:
        return [
          Math.round(q * 255),
          Math.round(brightness * 255),
          Math.round(p * 255),
        ];
      case 2:
        return [
          Math.round(p * 255),
          Math.round(brightness * 255),
          Math.round(t * 255),
        ];
      case 3:
        return [
          Math.round(p * 255),
          Math.round(q * 255),
          Math.round(brightness * 255),
        ];
      case 4:
        return [
          Math.round(t * 255),
          Math.round(p * 255),
          Math.round(brightness * 255),
        ];
      case 5:
        return [
          Math.round(brightness * 255),
          Math.round(p * 255),
          Math.round(q * 255),
        ];
      default:
        throw new LibError('Invalid hue.');
    }
  }

  /**
   * Convert an RGB color to HSL, where **r**, **g** and **b** are in the range [0, 255].
   * Returns a list [h, s, l] with values in the range [0, 1].
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
   * Convert a CIE L\*a\*b color to XYZ.
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
   * Convert an XYZ color to RGB.
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
   * Convert a CMYK color to RGB, where **c**, **m**, **y**, **k** values are in the range
   * [0, 255]. Returns a list [r, g, b] with values in the range [0, 255].
   */
  public static cmykToRgb(
    c: number,
    m: number,
    y: number,
    k: number
  ): number[] {
    const _c = c / 255;
    const _m = m / 255;
    const _y = y / 255;
    const _k = k / 255;
    return [
      Math.round(255 * (1 - _c) * (1 - _k)),
      Math.round(255 * (1 - _m) * (1 - _k)),
      Math.round(255 * (1 - _y) * (1 - _k)),
    ];
  }

  /**
   * Convert a CIE L\*a\*b color to RGB.
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
   * Convert a RGB color to XYZ.
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
   * Convert a XYZ color to CIE L\*a\*b.
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
   * Convert a RGB color to CIE L\*a\*b.
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
