/** @format */

import { ColorChannel } from './color-channel';
import { Clamp } from './clamp';
import { BitOperators } from './bit-operators';
import { ImageError } from '../error/image-error';

export abstract class ColorUtils {
  /**
   * Returns a new color of [src] alpha-blended onto [dst]. The opacity of [src]
   * is additionally scaled by [fraction] / 255.
   */
  public static alphaBlendColors(
    dst: number,
    src: number,
    fraction = 0xff
  ): number {
    const srcAlpha = ColorUtils.getAlpha(src);
    if (srcAlpha === 255 && fraction === 0xff) {
      // src is fully opaque, nothing to blend
      return src;
    }
    if (srcAlpha === 0 && fraction === 0xff) {
      // src is fully transparent, nothing to blend
      return dst;
    }

    let a = srcAlpha / 255.0;
    if (fraction !== 0xff) {
      a *= fraction / 255.0;
    }

    const sr = Math.round(ColorUtils.getRed(src) * a);
    const sg = Math.round(ColorUtils.getGreen(src) * a);
    const sb = Math.round(ColorUtils.getBlue(src) * a);
    const sa = Math.round(srcAlpha * a);

    const dr = Math.round(ColorUtils.getRed(dst) * (1.0 - a));
    const dg = Math.round(ColorUtils.getGreen(dst) * (1.0 - a));
    const db = Math.round(ColorUtils.getBlue(dst) * (1.0 - a));
    const da = Math.round(ColorUtils.getAlpha(dst) * (1.0 - a));

    return ColorUtils.getColor(sr + dr, sg + dg, sb + db, sa + da);
  }

  /**
   * Get the [channel] from the [color].
   */
  public static getChannel(color: number, channel: ColorChannel): number {
    if (channel === ColorChannel.red) {
      return ColorUtils.getRed(color);
    } else if (channel === ColorChannel.green) {
      return ColorUtils.getGreen(color);
    } else if (channel === ColorChannel.blue) {
      return ColorUtils.getBlue(color);
    } else if (channel === ColorChannel.alpha) {
      return ColorUtils.getAlpha(color);
    }
    return ColorUtils.getLuminance(color);
  }

  /**
   * Get the alpha channel from the [color].
   */
  public static getAlpha(color: number): number {
    return (color >> 24) & 0xff;
  }

  /**
   * Get the blue channel from the [color].
   */
  public static getBlue(color: number): number {
    return (color >> 16) & 0xff;
  }

  /**
   * Get the color with the given [r], [g], [b], and [a] components.
   * The channel order of a uint32 encoded color is RGBA.
   */
  public static getColor(r: number, g: number, b: number, a = 255): number {
    // What we're doing here, is creating a 32 bit
    // integer by collecting the rgba in one integer.
    // we know for certain and we're also assuring that
    // all our letiables' values are 255 at maximum,
    // which means that they can never be bigger than
    // 8 bits  so we can safely slide each one by 8 bits
    // for adding the other.
    const color =
      (Clamp.clampInt255(a) << 24) |
      (Clamp.clampInt255(b) << 16) |
      (Clamp.clampInt255(g) << 8) |
      Clamp.clampInt255(r);
    return BitOperators.toUint32(color);
  }

  /**
   * Get the green channel from the [color].
   */
  public static getGreen(color: number): number {
    return (color >> 8) & 0xff;
  }

  /**
   * Returns the luminance (grayscale) value of the [color].
   */
  public static getLuminance(color: number): number {
    const r = ColorUtils.getRed(color);
    const g = ColorUtils.getGreen(color);
    const b = ColorUtils.getBlue(color);
    return ColorUtils.getLuminanceRgb(r, g, b);
  }

  /**
   * Returns the luminance (grayscale) value of the color.
   */
  public static getLuminanceRgb(r: number, g: number, b: number): number {
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  /**
   * Get the red channel from the [color].
   */
  public static getRed(color: number): number {
    return color & 0xff;
  }

  /**
   * Check if [color] is white
   */
  public static isBlack(color: number): boolean {
    return (color & 0xffffff) === 0x0;
  }

  /**
   * Check if [color] is white
   */
  public static isWhite(color: number): boolean {
    return (color & 0xffffff) === 0xffffff;
  }

  /**
   * Returns a new color where the alpha channel of [color] has been replaced by [value].
   */
  public static setAlpha(color: number, value: number): number {
    return (color & 0x00ffffff) | (Clamp.clampInt255(value) << 24);
  }

  /**
   * Returns a new color where the blue channel of [color] has been replaced by [value].
   */
  public static setBlue(color: number, value: number): number {
    return (color & 0xff00ffff) | (Clamp.clampInt255(value) << 16);
  }

  /**
   * Returns a new color, where the given [color]'s [channel] has been
   * replaced with the given [value].
   */
  public static setChannel(
    color: number,
    channel: ColorChannel,
    value: number
  ): number {
    if (channel === ColorChannel.red) {
      return ColorUtils.setRed(color, value);
    } else if (channel === ColorChannel.green) {
      return ColorUtils.setGreen(color, value);
    } else if (channel === ColorChannel.blue) {
      return ColorUtils.setBlue(color, value);
    } else if (channel === ColorChannel.alpha) {
      return ColorUtils.setAlpha(color, value);
    }
    return color;
  }

  /**
   * Returns a new color where the green channel of [color] has been replaced
   * by [value].
   */
  public static setGreen(color: number, value: number): number {
    return (color & 0xffff00ff) | (Clamp.clampInt255(value) << 8);
  }

  /**
   * Returns a new color where the red channel of [color] has been replaced
   * by [value].
   */
  public static setRed(color: number, value: number): number {
    return (color & 0xffffff00) | Clamp.clampInt255(value);
  }

  /**
   * Convert an HSL color to RGB, where h is specified in normalized degrees
   * [0, 1] (where 1 is 360-degrees); s and l are in the range [0, 1].
   * Returns a list [r, g, b] with values in the range [0, 255].
   */
  public static hslToRgb(
    hue: number,
    saturation: number,
    lightness: number
  ): number[] {
    if (saturation === 0) {
      const gray = Math.trunc(lightness * 255.0);
      return [gray, gray, gray];
    }

    const hue2rgb = (p: number, q: number, t: number) => {
      let ti = t;
      if (ti < 0.0) {
        ti += 1.0;
      }
      if (ti > 1) {
        ti -= 1.0;
      }
      if (ti < 1.0 / 6.0) {
        return p + (q - p) * 6.0 * ti;
      }
      if (ti < 1.0 / 2.0) {
        return q;
      }
      if (ti < 2.0 / 3.0) {
        return p + (q - p) * (2.0 / 3.0 - ti) * 6.0;
      }
      return p;
    };

    const q =
      lightness < 0.5
        ? lightness * (1.0 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2.0 * lightness - q;

    const r = hue2rgb(p, q, hue + 1.0 / 3.0);
    const g = hue2rgb(p, q, hue);
    const b = hue2rgb(p, q, hue - 1.0 / 3.0);

    return [
      Math.round(r * 255.0),
      Math.round(g * 255.0),
      Math.round(b * 255.0),
    ];
  }

  /**
   * Convert an HSV color to RGB, where h is specified in normalized degrees
   * [0, 1] (where 1 is 360-degrees); s and l are in the range [0, 1].
   * Returns a list [r, g, b] with values in the range [0, 255].
   */
  public static hsvToRgb(
    hue: number,
    saturation: number,
    brightness: number
  ): number[] {
    if (saturation === 0) {
      const gray = Math.round(brightness * 255.0);
      return [gray, gray, gray];
    }

    const h = (hue - Math.floor(hue)) * 6.0;
    const f = h - Math.floor(h);
    const p = brightness * (1.0 - saturation);
    const q = brightness * (1.0 - saturation * f);
    const t = brightness * (1.0 - saturation * (1.0 - f));

    switch (Math.trunc(h)) {
      case 0:
        return [
          Math.round(brightness * 255.0),
          Math.round(t * 255.0),
          Math.round(p * 255.0),
        ];
      case 1:
        return [
          Math.round(q * 255.0),
          Math.round(brightness * 255.0),
          Math.round(p * 255.0),
        ];
      case 2:
        return [
          Math.round(p * 255.0),
          Math.round(brightness * 255.0),
          Math.round(t * 255.0),
        ];
      case 3:
        return [
          Math.round(p * 255.0),
          Math.round(q * 255.0),
          Math.round(brightness * 255.0),
        ];
      case 4:
        return [
          Math.round(t * 255.0),
          Math.round(p * 255.0),
          Math.round(brightness * 255.0),
        ];
      case 5:
        return [
          Math.round(brightness * 255.0),
          Math.round(p * 255.0),
          Math.round(q * 255.0),
        ];
      default:
        throw new ImageError('Invalid hue');
    }
  }

  /**
   * Convert an RGB color to HSL, where r, g and b are in the range [0, 255].
   * Returns a list [h, s, l] with values in the range [0, 1].
   */
  public static rgbToHsl(r: number, g: number, b: number): number[] {
    const ri = r / 255.0;
    const gi = g / 255.0;
    const bi = b / 255.0;
    const mx = Math.max(ri, Math.max(gi, bi));
    const mn = Math.min(ri, Math.min(gi, bi));

    const l = (mx + mn) / 2.0;

    if (mx === mn) {
      return [0.0, 0.0, l];
    }

    const d = mx - mn;
    const s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);

    let h = 0;
    if (mx === ri) {
      h = (gi - bi) / d + (gi < bi ? 6.0 : 0.0);
    } else if (mx === gi) {
      h = (bi - ri) / d + 2.0;
    } else {
      h = (ri - gi) / d + 4.0;
    }

    h /= 6.0;

    return [h, s, l];
  }

  /**
   * Convert a CIE-L*a*b color to XYZ.
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
      Math.trunc(y * 100.0),
      Math.trunc(z * 108.883),
    ];
  }

  /**
   * Convert an XYZ color to RGB.
   */
  public static xyzToRgb(x: number, y: number, z: number): number[] {
    const xi = x / 100;
    const yi = y / 100;
    const zi = z / 100;
    let r = 3.2406 * xi + -1.5372 * yi + -0.4986 * zi;
    let g = -0.9689 * xi + 1.8758 * yi + 0.0415 * zi;
    let b = 0.0557 * xi + -0.204 * yi + 1.057 * zi;
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
      Math.trunc(Clamp.clamp(r * 255, 0, 255)),
      Math.trunc(Clamp.clamp(g * 255, 0, 255)),
      Math.trunc(Clamp.clamp(b * 255, 0, 255)),
    ];
  }

  /**
   * Convert a CMYK color to RGB, where c, m, y, k values are in the range
   * [0, 255]. Returns a list [r, g, b] with values in the range [0, 255].
   */
  public static cmykToRgb(
    c: number,
    m: number,
    y: number,
    k: number
  ): number[] {
    const ci = c / 255.0;
    const mi = m / 255.0;
    const yi = y / 255.0;
    const ki = k / 255.0;
    return [
      Math.round(255.0 * (1.0 - ci) * (1.0 - ki)),
      Math.round(255.0 * (1.0 - mi) * (1.0 - ki)),
      Math.round(255.0 * (1.0 - yi) * (1.0 - ki)),
    ];
  }

  /**
   * Convert a CIE-L*a*b color to RGB.
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

    // Xyz to rgb
    let R = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let G = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let B = x * 0.0557 + y * -0.204 + z * 1.057;

    if (R > 0.0031308) {
      R = 1.055 * Math.pow(R, 1.0 / 2.4) - 0.055;
    } else {
      R *= 12.92;
    }

    if (G > 0.0031308) {
      G = 1.055 * Math.pow(G, 1.0 / 2.4) - 0.055;
    } else {
      G *= 12.92;
    }

    if (B > 0.0031308) {
      B = 1.055 * Math.pow(B, 1.0 / 2.4) - 0.055;
    } else {
      B *= 12.92;
    }

    return [
      Math.trunc(Clamp.clamp(R * 255.0, 0, 255)),
      Math.trunc(Clamp.clamp(G * 255.0, 0, 255)),
      Math.trunc(Clamp.clamp(B * 255.0, 0, 255)),
    ];
  }

  /**
   * Convert a RGB color to XYZ.
   */
  public static rgbToXyz(r: number, g: number, b: number): number[] {
    let ri = r / 255;
    let gi = g / 255;
    let bi = b / 255;

    if (ri > 0.04045) {
      ri = Math.pow((ri + 0.055) / 1.055, 2.4);
    } else {
      ri /= 12.92;
    }
    if (gi > 0.04045) {
      gi = Math.pow((gi + 0.055) / 1.055, 2.4);
    } else {
      gi /= 12.92;
    }
    if (bi > 0.04045) {
      bi = Math.pow((bi + 0.055) / 1.055, 2.4);
    } else {
      bi /= 12.92;
    }

    ri *= 100.0;
    gi *= 100.0;
    bi *= 100.0;

    return [
      ri * 0.4124 + gi * 0.3576 + bi * 0.1805,
      ri * 0.2126 + gi * 0.7152 + bi * 0.0722,
      ri * 0.0193 + gi * 0.1192 + bi * 0.9505,
    ];
  }

  /**
   * Convert a XYZ color to CIE-L*a*b.
   */
  public static xyzToLab(x: number, y: number, z: number): number[] {
    let xi = x / 95.047;
    let yi = y / 100;
    let zi = z / 108.883;

    if (xi > 0.008856) {
      xi = Math.pow(xi, 1 / 3);
    } else {
      xi = 7.787 * xi + 16 / 116;
    }
    if (yi > 0.008856) {
      yi = Math.pow(yi, 1 / 3);
    } else {
      yi = 7.787 * yi + 16 / 116;
    }
    if (zi > 0.008856) {
      zi = Math.pow(zi, 1 / 3);
    } else {
      zi = 7.787 * zi + 16 / 116;
    }

    return [116 * yi - 16, 500 * (xi - yi), 200 * (yi - zi)];
  }

  /**
   * Convert a RGB color to CIE-L*a*b.
   */
  public static rgbToLab(r: number, g: number, b: number): number[] {
    let ri = r / 255;
    let gi = g / 255;
    let bi = b / 255;

    if (ri > 0.04045) {
      ri = Math.pow((ri + 0.055) / 1.055, 2.4);
    } else {
      ri /= 12.92;
    }
    if (gi > 0.04045) {
      gi = Math.pow((gi + 0.055) / 1.055, 2.4);
    } else {
      gi /= 12.92;
    }
    if (bi > 0.04045) {
      bi = Math.pow((bi + 0.055) / 1.055, 2.4);
    } else {
      bi /= 12.92;
    }

    ri *= 100;
    gi *= 100;
    bi *= 100;

    let x = ri * 0.4124 + gi * 0.3576 + bi * 0.1805;
    let y = ri * 0.2126 + gi * 0.7152 + bi * 0.0722;
    let z = ri * 0.0193 + gi * 0.1192 + bi * 0.9505;

    x /= 95.047;
    y /= 100.0;
    z /= 108.883;

    if (x > 0.008856) {
      x = Math.pow(x, 1 / 3.0);
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
