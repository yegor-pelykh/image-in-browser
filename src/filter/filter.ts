/** @format */

import { Channel } from '../color/channel';
import { Color } from '../color/color';
import { ColorRgba8 } from '../color/color-rgba8';
import { Interpolation } from '../common/interpolation';
import { MathUtils } from '../common/math-utils';
import { NeuralQuantizer } from '../image/neural-quantizer';
import { OctreeQuantizer } from '../image/octree-quantizer';
import { Quantizer } from '../image/quantizer';
import { RandomUtils } from '../common/random-utils';
import { Draw } from '../draw/draw';
import { MemoryImage } from '../image/image';
import { DitherKernel, DitherKernels } from './dither-kernel';
import { NoiseType } from './noise-type';
import { PixelateMode } from './pixelate-mode';
import { QuantizeMethod } from './quantize-method';
import { SeparableKernel } from './separable-kernel';
import { ColorUtils } from '../color/color-utils';

interface ContrastCache {
  lastContrast: number;
  contrast: Uint8Array;
}

export interface AdjustColorOptions {
  image: MemoryImage;
  blacks?: Color;
  whites?: Color;
  mids?: Color;
  contrast?: number;
  saturation?: number;
  brightness?: number;
  gamma?: number;
  exposure?: number;
  hue?: number;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface BillboardOptions {
  image: MemoryImage;
  grid?: number;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface BleachBypassOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface BulgeDistortionOptions {
  image: MemoryImage;
  centerX?: number;
  centerY?: number;
  radius?: number;
  scale?: number;
  interpolation?: Interpolation;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface BumpToNormalOptions {
  image: MemoryImage;
  strength?: number;
}

export interface ChromaticAberrationOptions {
  image: MemoryImage;
  shift?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface ColorHalftone {
  image: MemoryImage;
  amount?: number;
  centerX?: number;
  centerY?: number;
  angle?: number;
  size?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface ColorOffsetOptions {
  image: MemoryImage;
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface ContrastOptions {
  image: MemoryImage;
  contrast: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface ConvolutionOptions {
  image: MemoryImage;
  filter: number[];
  div?: number;
  offset?: number;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface CopyImageChannelsOptions {
  image: MemoryImage;
  from: MemoryImage;
  scaled?: boolean;
  red?: Channel;
  green?: Channel;
  blue?: Channel;
  alpha?: Channel;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface DitherImageOptions {
  image: MemoryImage;
  quantizer?: Quantizer;
  kernel?: DitherKernel;
  serpentine?: boolean;
}

export interface DotScreenOptions {
  image: MemoryImage;
  angle?: number;
  size?: number;
  centerX?: number;
  centerY?: number;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface DropShadowOptions {
  image: MemoryImage;
  hShadow: number;
  vShadow: number;
  blur: number;
  shadowColor?: Color;
}

export interface EdgeGlowOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface EmbossOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface GammaOptions {
  image: MemoryImage;
  gamma: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface GaussianBlurOptions {
  image: MemoryImage;
  radius: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface GrayscaleOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface HdrToLdrOptions {
  image: MemoryImage;
  exposure?: number;
}

export interface HexagonPixelateOptions {
  image: MemoryImage;
  centerX?: number;
  centerY?: number;
  size?: number;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface InvertOptions {
  image: MemoryImage;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface LuminanceThresholdOptions {
  image: MemoryImage;
  threshold?: number;
  outputColor?: boolean;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface MonochromeOptions {
  image: MemoryImage;
  color?: Color;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface NoiseOptions {
  image: MemoryImage;
  sigma: number;
  type?: NoiseType;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface NormalizeOptions {
  image: MemoryImage;
  min: number;
  max: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface PixelateOptions {
  image: MemoryImage;
  size: number;
  mode?: PixelateMode;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface QuantizeOptions {
  image: MemoryImage;
  numberOfColors?: number;
  method?: QuantizeMethod;
  dither?: DitherKernel;
  ditherSerpentine?: boolean;
}

export interface ReinhardToneMapOptions {
  image: MemoryImage;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface RemapColorsOptions {
  image: MemoryImage;
  red?: Channel;
  green?: Channel;
  blue?: Channel;
  alpha?: Channel;
}

export interface ScaleRgbaOptions {
  image: MemoryImage;
  scale: Color;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface SeparableConvolutionOptions {
  image: MemoryImage;
  kernel: SeparableKernel;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface SepiaOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface SketchOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface SmoothOptions {
  image: MemoryImage;
  weight: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface SobelOptions {
  image: MemoryImage;
  amount?: number;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface StretchDistortionOptions {
  image: MemoryImage;
  centerX?: number;
  centerY?: number;
  interpolation?: Interpolation;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export interface VignetteOptions {
  image: MemoryImage;
  start?: number;
  end?: number;
  amount?: number;
  color?: Color;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

export abstract class Filter {
  private static _contrastCache?: ContrastCache;
  private static readonly _gaussianKernelCache: Map<number, SeparableKernel> =
    new Map<number, SeparableKernel>();

  /**
   * Adjust the color of the **image** using various color transformations.
   *
   * **blacks** defines the black level of the image, as a color.
   *
   * **whites** defines the white level of the image, as a color.
   *
   * **mids** defines the mid level of hte image, as a color.
   *
   * **contrast** increases (> 1) / decreases (< 1) the contrast of the image by
   * pushing colors away/toward neutral gray, where at 0 the image is entirely
   * neutral gray (0 contrast), 1, the image is not adjusted and > 1 the
   * image increases contrast.
   *
   * **saturation** increases (> 1) / decreases (< 1) the saturation of the image
   * by pushing colors away/toward their grayscale value, where 0 is grayscale
   * and 1 is the original image, and > 1 the image becomes more saturated.
   *
   * **brightness** is a constant scalar of the image colors. At 0 the image
   * is black, 1 unmodified, and > 1 the image becomes brighter.
   *
   * **gamma** is an exponential scalar of the image colors. At < 1 the image
   * becomes brighter, and > 1 the image becomes darker. A **gamma** of 1/2.2
   * will convert the image colors to linear color space.
   *
   * **exposure** is an exponential scalar of the image as rgb* pow(2, exposure).
   * At 0, the image is unmodified; as the exposure increases, the image
   * brightens.
   *
   * **hue** shifts the hue component of the image colors in degrees. A **hue** of
   * 0 will have no affect, and a **hue** of 45 will shift the hue of all colors
   * by 45 degrees.
   *
   * **amount** controls how much affect this filter has on the **image**, where
   * 0 has no effect and 1 has full effect.
   *
   */
  public static adjustColor(opt: AdjustColorOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    const contrast =
      opt.contrast !== undefined
        ? MathUtils.clamp(opt.contrast, 0, 1)
        : undefined;
    const saturation =
      opt.saturation !== undefined
        ? MathUtils.clamp(opt.saturation, 0, 1)
        : undefined;
    const brightness =
      opt.brightness !== undefined ? opt.brightness : undefined;
    const gamma =
      opt.gamma !== undefined ? MathUtils.clamp(opt.gamma, 0, 1000) : undefined;
    let exposure =
      opt.exposure !== undefined
        ? MathUtils.clamp(opt.exposure, 0, 1000)
        : undefined;
    const amount = MathUtils.clamp(opt.amount ?? 1, 0, 1000);
    let hue = opt.hue;

    if (amount === 0) {
      return opt.image;
    }

    const degToRad = 0.0174532925;
    const avgLumR = 0.5;
    const avgLumG = 0.5;
    const avgLumB = 0.5;
    const lumCoeffR = 0.2125;
    const lumCoeffG = 0.7154;
    const lumCoeffB = 0.0721;

    const useBlacksWhitesMids =
      opt.blacks !== undefined ||
      opt.whites !== undefined ||
      opt.mids !== undefined;
    let br = 0;
    let bg = 0;
    let bb = 0;
    let wr = 0;
    let wg = 0;
    let wb = 0;
    let mr = 0;
    let mg = 0;
    let mb = 0;
    if (useBlacksWhitesMids) {
      br = opt.blacks?.rNormalized ?? 0;
      bg = opt.blacks?.gNormalized ?? 0;
      bb = opt.blacks?.bNormalized ?? 0;

      wr = opt.whites?.rNormalized ?? 0;
      wg = opt.whites?.gNormalized ?? 0;
      wb = opt.whites?.bNormalized ?? 0;

      mr = opt.mids?.rNormalized ?? 0;
      mg = opt.mids?.gNormalized ?? 0;
      mb = opt.mids?.bNormalized ?? 0;

      mr = 1 / (1 + 2 * (mr - 0.5));
      mg = 1 / (1 + 2 * (mg - 0.5));
      mb = 1 / (1 + 2 * (mb - 0.5));
    }

    const invSaturation =
      saturation !== undefined ? 1 - MathUtils.clamp(saturation, 0, 1) : 0;
    const invContrast =
      contrast !== undefined ? 1 - MathUtils.clamp(contrast, 0, 1) : 0;

    if (exposure !== undefined) {
      exposure = Math.pow(2, exposure);
    }

    let hueR = 0;
    let hueG = 0;
    let hueB = 0;
    if (hue !== undefined) {
      hue *= degToRad;
      const s = Math.sin(hue);
      const c = Math.cos(hue);

      hueR = (2 * c) / 3.0;
      hueG = (-Math.sqrt(3.0) * s - c) / 3.0;
      hueB = (Math.sqrt(3.0) * s - c + 1.0) / 3.0;
    }

    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const or = p.rNormalized;
        const og = p.gNormalized;
        const ob = p.bNormalized;

        let r = or;
        let g = og;
        let b = ob;

        if (useBlacksWhitesMids) {
          r = Math.pow((r + br) * wr, mr);
          g = Math.pow((g + bg) * wg, mg);
          b = Math.pow((b + bb) * wb, mb);
        }

        if (brightness !== undefined && brightness !== 1.0) {
          const tb = MathUtils.clamp(brightness, 0, 1000);
          r *= tb;
          g *= tb;
          b *= tb;
        }

        if (saturation !== undefined) {
          const lum = r * lumCoeffR + g * lumCoeffG + b * lumCoeffB;

          r = lum * invSaturation + r * saturation;
          g = lum * invSaturation + g * saturation;
          b = lum * invSaturation + b * saturation;
        }

        if (contrast !== undefined) {
          r = avgLumR * invContrast + r * contrast;
          g = avgLumG * invContrast + g * contrast;
          b = avgLumB * invContrast + b * contrast;
        }

        if (gamma !== undefined) {
          r = Math.pow(r, gamma);
          g = Math.pow(g, gamma);
          b = Math.pow(b, gamma);
        }

        if (exposure !== undefined) {
          r *= exposure;
          g *= exposure;
          b *= exposure;
        }

        if (hue !== undefined && hue !== 0.0) {
          const hr = r * hueR + g * hueG + b * hueB;
          const hg = r * hueB + g * hueR + b * hueG;
          const hb = r * hueG + g * hueB + b * hueR;

          r = hr;
          g = hg;
          b = hb;
        }

        const msk =
          opt.mask?.getPixel(p.x, p.y).getChannelNormalized(maskChannel) ?? 1;
        const blend = msk * amount;

        r = MathUtils.mix(or, r, blend);
        g = MathUtils.mix(og, g, blend);
        b = MathUtils.mix(ob, b, blend);

        p.rNormalized = r;
        p.gNormalized = g;
        p.bNormalized = b;
      }
    }

    return opt.image;
  }

  /**
   * Apply the billboard filter to the image.
   */
  public static billboard(opt: BillboardOptions): MemoryImage {
    const grid = opt.grid ?? 10;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    // Math.pow(0.45, 2);
    const rs = 0.2025;

    for (const frame of opt.image.frames) {
      const w = frame.width;
      const h = frame.height;
      const aspect = w / h;
      const stepX = 0.0015625;
      const stepY = 0.0015625 * aspect;
      const orig = frame.clone({
        skipAnimation: true,
      });
      for (const p of frame) {
        const uvX = p.x / (w - 1);
        const uvY = p.y / (h - 1);

        const offX = Math.floor(uvX / (grid * stepX));
        const offY = Math.floor(uvY / (grid * stepY));

        const x2 = Math.floor(offX * grid * stepX * (w - 1));
        const y2 = Math.floor(offY * grid * stepY * (h - 1));

        if (x2 >= w || y2 >= h) {
          continue;
        }

        const op = orig.getPixel(x2, y2);

        const prcX = MathUtils.fract(uvX / (grid * stepX));
        const prcY = MathUtils.fract(uvY / (grid * stepY));
        const pwX = Math.pow(Math.abs(prcX - 0.5), 2);
        const pwY = Math.pow(Math.abs(prcY - 0.5), 2);

        let r = op.r / p.maxChannelValue;
        let g = op.g / p.maxChannelValue;
        let b = op.b / p.maxChannelValue;

        const gr = MathUtils.smoothStep(rs - 0.1, rs + 0.1, pwX + pwY);
        const y = (r + g + b) / 3.0;

        const ls = 0.3;
        const lb = Math.ceil(y / ls);
        const lf = ls * lb + 0.3;

        r = MathUtils.mix(lf * r, 0.1, gr);
        g = MathUtils.mix(lf * g, 0.1, gr);
        b = MathUtils.mix(lf * b, 0.1, gr);

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        p.r = MathUtils.mix(p.r, r * p.maxChannelValue, mx);
        p.g = MathUtils.mix(p.g, g * p.maxChannelValue, mx);
        p.b = MathUtils.mix(p.b, b * p.maxChannelValue, mx);
      }
    }
    return opt.image;
  }

  public static bleachBypass(opt: BleachBypassOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const luminanceR = 0.2125;
    const luminanceG = 0.7154;
    const luminanceB = 0.0721;
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const r = p.rNormalized;
        const g = p.gNormalized;
        const b = p.bNormalized;
        const lr = r * luminanceR;
        const lg = g * luminanceG;
        const lb = b * luminanceB;
        const l = lr + lg + lb;

        const mixAmount = MathUtils.clamp((l - 0.45) * 10, 0, 1);
        const branch1R = 2 * r * l;
        const branch1G = 2 * g * l;
        const branch1B = 2 * b * l;
        const branch2R = 1 - 2 * (1 - r) * (1 - l);
        const branch2G = 1 - 2 * (1 - g) * (1 - l);
        const branch2B = 1 - 2 * (1 - b) * (1 - l);

        const msk =
          opt.mask?.getPixel(p.x, p.y).getChannelNormalized(maskChannel) ?? 1;
        const mx = msk * amount;

        if (mx !== 1) {
          const nr =
            MathUtils.mix(branch1R, branch2R, mixAmount) * p.maxChannelValue;
          const ng =
            MathUtils.mix(branch1G, branch2G, mixAmount) * p.maxChannelValue;
          const nb =
            MathUtils.mix(branch1B, branch2B, mixAmount) * p.maxChannelValue;
          p.r = MathUtils.mix(p.r, nr, amount);
          p.g = MathUtils.mix(p.g, ng, amount);
          p.b = MathUtils.mix(p.b, nb, amount);
        } else {
          p.rNormalized = MathUtils.mix(branch1R, branch2R, mixAmount);
          p.gNormalized = MathUtils.mix(branch1G, branch2G, mixAmount);
          p.bNormalized = MathUtils.mix(branch1B, branch2B, mixAmount);
        }
      }
    }
    return opt.image;
  }

  public static bulgeDistortion(opt: BulgeDistortionOptions): MemoryImage {
    const scale = opt.scale ?? 0.5;
    const interpolation = opt.interpolation ?? Interpolation.nearest;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of opt.image.frames) {
      const orig = frame.clone({
        skipAnimation: true,
      });
      const w = frame.width;
      const h = frame.height;
      const cx = opt.centerX ?? Math.trunc(w / 2);
      const cy = opt.centerY ?? Math.trunc(h / 2);
      const rad = opt.radius ?? Math.trunc(Math.min(w, h) / 2);
      const radSqr = rad * rad;
      for (const p of frame) {
        let x = p.x;
        let y = p.y;
        const deltaX = cx - x;
        const deltaY = cy - y;
        const dist = deltaX * deltaX + deltaY * deltaY;
        x -= cx;
        y -= cy;
        if (dist < radSqr) {
          const percent = 1 - ((radSqr - dist) / radSqr) * scale;
          const percentSqr = percent * percent;
          x *= percentSqr;
          y *= percentSqr;
        }
        x += cx;
        y += cy;

        const p2 = orig.getPixelInterpolate(x, y, interpolation);
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);

        if (msk === undefined) {
          p.set(p2);
        } else {
          p.r = MathUtils.mix(p.r, p2.r, msk);
          p.g = MathUtils.mix(p.g, p2.g, msk);
          p.b = MathUtils.mix(p.b, p2.b, msk);
          p.a = MathUtils.mix(p.a, p2.a, msk);
        }
      }
    }
    return opt.image;
  }

  /**
   * Generate a normal map from a heightfield bump image.
   *
   * The red channel of the **image** is used as an input, 0 represents a low
   * height and 1 a high value. The optional **strength** parameter allows to set
   * the strength of the normal image.
   */
  public static bumpToNormal(opt: BumpToNormalOptions): MemoryImage {
    const strength = opt.strength ?? 2;

    const dest = MemoryImage.from(opt.image);

    const mx = opt.image.maxChannelValue;
    for (const frame of opt.image.frames) {
      for (let y = 0; y < frame.height; ++y) {
        for (let x = 0; x < frame.width; ++x) {
          const height = frame.getPixel(x, y).r / mx;
          let du =
            (height -
              frame.getPixel(x < frame.width - 1 ? x + 1 : x, y).r / mx) *
            strength;
          let dv =
            (height -
              frame.getPixel(x, y < frame.height - 1 ? y + 1 : y).r / mx) *
            strength;
          const z = Math.abs(du) + Math.abs(dv);

          if (z > 1) {
            du /= z;
            dv /= z;
          }

          const dw = Math.sqrt(1 - du * du - dv * dv);
          const nX = du * 0.5 + 0.5;
          const nY = dv * 0.5 + 0.5;
          const nZ = dw;

          dest.frames[frame.frameIndex].setPixelRgb(
            x,
            y,
            nX * mx,
            nY * mx,
            nZ * mx
          );
        }
      }
    }

    return dest;
  }

  /**
   * Apply chromatic aberration filter to the image.
   */
  public static chromaticAberration(
    opt: ChromaticAberrationOptions
  ): MemoryImage {
    const shift = opt.shift ?? 5;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of opt.image.frames) {
      const orig = frame.clone({
        skipAnimation: true,
      });
      const w = frame.width - 1;
      for (const p of frame) {
        const shiftLeft = MathUtils.clamp(p.x - shift, 0, w);
        const shiftRight = MathUtils.clamp(p.x + shift, 0, w);
        const lc = orig.getPixel(shiftLeft, p.y);
        const rc = orig.getPixel(shiftRight, p.y);

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);

        if (msk === undefined) {
          p.r = rc.r;
          p.b = lc.b;
        } else {
          p.r = MathUtils.mix(p.r, rc.r, msk);
          p.b = MathUtils.mix(p.b, lc.b, msk);
        }
      }
    }
    return opt.image;
  }

  /**
   * Apply color halftone filter to the image.
   */
  public static colorHalftone(opt: ColorHalftone): MemoryImage {
    const amount = opt.amount ?? 1;
    let angle = opt.angle ?? 1;
    const size = opt.size ?? 5;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    angle *= 0.0174533;

    const pattern = (
      x: number,
      y: number,
      cx: number,
      cy: number,
      angle: number
    ): number => {
      const scale = 3.14159 / size;
      const s = Math.sin(angle);
      const c = Math.cos(angle);
      const tx = x - cx;
      const ty = y - cy;
      const px = (c * tx - s * ty) * scale;
      const py = (s * tx + c * ty) * scale;
      return Math.sin(px) * Math.sin(py) * 4.0;
    };

    for (const frame of opt.image.frames) {
      const w = frame.width;
      const h = frame.height;
      const cx = opt.centerX ?? Math.trunc(w / 2);
      const cy = opt.centerY ?? Math.trunc(h / 2);
      for (const p of frame) {
        const x = p.x;
        const y = p.y;
        let cmyC = 1 - p.rNormalized;
        let cmyM = 1 - p.gNormalized;
        let cmyY = 1 - p.bNormalized;
        let cmyK = Math.min(cmyC, Math.min(cmyM, cmyY));
        cmyC = (cmyC - cmyK) / (1 - cmyK);
        cmyM = (cmyM - cmyK) / (1 - cmyK);
        cmyY = (cmyY - cmyK) / (1 - cmyK);
        cmyC = MathUtils.clamp(
          cmyC * 10 - 3 + pattern(x, y, cx, cy, angle + 0.26179),
          0,
          1
        );
        cmyM = MathUtils.clamp(
          cmyM * 10 - 3 + pattern(x, y, cx, cy, angle + 1.30899),
          0,
          1
        );
        cmyY = MathUtils.clamp(
          cmyY * 10 - 3 + pattern(x, y, cx, cy, angle),
          0,
          1
        );
        cmyK = MathUtils.clamp(
          cmyK * 10 - 5 + pattern(x, y, cx, cy, angle + 0.78539),
          0,
          1
        );

        const r = (1 - cmyC - cmyK) * p.maxChannelValue;
        const g = (1 - cmyM - cmyK) * p.maxChannelValue;
        const b = (1 - cmyY - cmyK) * p.maxChannelValue;

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        if (mx !== 1) {
          p.r = MathUtils.mix(p.r, r, mx);
          p.g = MathUtils.mix(p.g, g, mx);
          p.b = MathUtils.mix(p.b, b, mx);
        } else {
          p.r = r;
          p.g = g;
          p.b = b;
        }
      }
    }
    return opt.image;
  }

  /**
   * Add the **red**, **green**, **blue** and **alpha** values to the **image** image
   * colors, a per-channel brightness.
   */
  public static colorOffset(opt: ColorOffsetOptions): MemoryImage {
    const red = opt.red ?? 0;
    const green = opt.green ?? 0;
    const blue = opt.blue ?? 0;
    const alpha = opt.alpha ?? 0;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        if (msk === undefined) {
          p.r += red;
          p.g += green;
          p.b += blue;
          p.a += alpha;
        } else {
          p.r = MathUtils.mix(p.r, p.r + red, msk);
          p.g = MathUtils.mix(p.g, p.g + green, msk);
          p.b = MathUtils.mix(p.b, p.b + blue, msk);
          p.a = MathUtils.mix(p.a, p.a + alpha, msk);
        }
      }
    }
    return opt.image;
  }

  /**
   * Set the contrast level for the **image**.
   *
   * **contrast** values below 100 will decrees the contrast of the image,
   * and values above 100 will increase the contrast. A contrast of of 100
   * will have no affect.
   */
  public static contrast(opt: ContrastOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.contrast === 100) {
      return opt.image;
    }

    if (
      Filter._contrastCache === undefined ||
      opt.contrast !== Filter._contrastCache.lastContrast
    ) {
      Filter._contrastCache = {
        lastContrast: opt.contrast,
        contrast: new Uint8Array(256),
      };

      const c = (opt.contrast * opt.contrast) / 10000;
      for (let i = 0; i < 256; ++i) {
        Filter._contrastCache.contrast[i] = MathUtils.clampInt255(
          ((i / 255 - 0.5) * c + 0.5) * 255
        );
      }
    }

    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const r = Math.trunc(p.r);
        const g = Math.trunc(p.g);
        const b = Math.trunc(p.b);
        if (msk === undefined) {
          p.r = Filter._contrastCache.contrast[r];
          p.g = Filter._contrastCache.contrast[g];
          p.b = Filter._contrastCache.contrast[b];
        } else {
          p.r = MathUtils.mix(p.r, Filter._contrastCache.contrast[r], msk);
          p.g = MathUtils.mix(p.g, Filter._contrastCache.contrast[g], msk);
          p.b = MathUtils.mix(p.b, Filter._contrastCache.contrast[b], msk);
        }
      }
    }

    return opt.image;
  }

  /**
   * Apply a 3x3 convolution filter to the **image**. **filter** should be a
   * list of 9 numbers.
   *
   * The rgb channels will be divided by **div** and add **offset**, allowing
   * filters to normalize and offset the filtered pixel value.
   */
  public static convolution(opt: ConvolutionOptions): MemoryImage {
    const div = opt.div ?? 1;
    const offset = opt.offset ?? 0;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const tmp = MemoryImage.from(opt.image);
    for (const frame of opt.image.frames) {
      const tmpFrame = tmp.frames[frame.frameIndex];
      for (const c of tmpFrame) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let j = 0, fi = 0; j < 3; ++j) {
          const yv = Math.min(Math.max(c.y - 1 + j, 0), opt.image.height - 1);
          for (let i = 0; i < 3; ++i, ++fi) {
            const xv = Math.min(Math.max(c.x - 1 + i, 0), opt.image.width - 1);
            const c2 = tmpFrame.getPixel(xv, yv);
            r += c2.r * opt.filter[fi];
            g += c2.g * opt.filter[fi];
            b += c2.b * opt.filter[fi];
          }
        }

        r = MathUtils.clampInt255(r / div + offset);
        g = MathUtils.clampInt255(g / div + offset);
        b = MathUtils.clampInt255(b / div + offset);

        const p = frame.getPixel(c.x, c.y);

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        p.r = MathUtils.mix(p.r, r, mx);
        p.g = MathUtils.mix(p.g, g, mx);
        p.b = MathUtils.mix(p.b, b, mx);
      }
    }

    return opt.image;
  }

  /**
   * Copy channels from the **from** image to the **image**. If **scaled** is
   * true, then the **from** image will be scaled to the **image** resolution.
   */
  public static copyImageChannels(opt: CopyImageChannelsOptions): MemoryImage {
    const scaled = opt.scaled ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const dx = opt.from.width / opt.image.width;
    const dy = opt.from.height / opt.image.height;
    const fromPixel = opt.from.getPixel(0, 0);
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        if (scaled) {
          fromPixel.setPosition(Math.floor(p.x * dx), Math.floor(p.y * dy));
        } else {
          fromPixel.setPosition(p.x, p.y);
        }

        const r =
          opt.red !== undefined
            ? fromPixel.getChannelNormalized(opt.red)
            : p.rNormalized;
        const g =
          opt.green !== undefined
            ? fromPixel.getChannelNormalized(opt.green)
            : p.gNormalized;
        const b =
          opt.blue !== undefined
            ? fromPixel.getChannelNormalized(opt.blue)
            : p.bNormalized;
        const a =
          opt.alpha !== undefined
            ? fromPixel.getChannelNormalized(opt.alpha)
            : p.aNormalized;

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        if (msk === undefined) {
          p.rNormalized = r;
          p.gNormalized = g;
          p.bNormalized = b;
          p.aNormalized = a;
        } else {
          p.rNormalized = MathUtils.mix(p.r, r, msk);
          p.gNormalized = MathUtils.mix(p.g, g, msk);
          p.bNormalized = MathUtils.mix(p.b, b, msk);
          p.aNormalized = MathUtils.mix(p.a, a, msk);
        }
      }
    }
    return opt.image;
  }

  /**
   * Dither an image to reduce banding patterns when reducing the number of
   * colors.
   */
  public static ditherImage(opt: DitherImageOptions): MemoryImage {
    const quantizer = opt.quantizer ?? new NeuralQuantizer(opt.image);
    const kernel = opt.kernel ?? DitherKernel.floydSteinberg;
    const serpentine = opt.serpentine ?? false;

    if (kernel === DitherKernel.none) {
      return quantizer.getIndexImage(opt.image);
    }

    const ds = DitherKernels[kernel];
    const height = opt.image.height;
    const width = opt.image.width;

    let direction = serpentine ? -1 : 1;

    const palette = quantizer.palette;
    const indexedImage = new MemoryImage({
      width: width,
      height: height,
      numChannels: 1,
      palette: palette,
    });

    const pIter = opt.image[Symbol.iterator]();
    let itRes = pIter.next();

    let index = 0;
    for (let y = 0; y < height; y++) {
      if (serpentine) direction *= -1;

      const x0 = direction === 1 ? 0 : width - 1;
      const x1 = direction === 1 ? width : 0;
      for (
        let x = x0;
        x !== x1;
        x += direction, ++index, itRes = pIter.next()
      ) {
        // Get original color
        const pc = itRes.value;
        const r1 = Math.trunc(pc.getChannel(0));
        const g1 = Math.trunc(pc.getChannel(1));
        const b1 = Math.trunc(pc.getChannel(2));

        // Get converted color
        let idx = quantizer.getColorIndexRgb(r1, g1, b1);
        indexedImage.setPixelRgb(x, y, idx, 0, 0);

        const r2 = palette.get(idx, 0);
        const g2 = palette.get(idx, 1);
        const b2 = palette.get(idx, 2);

        const er = r1 - r2;
        const eg = g1 - g2;
        const eb = b1 - b2;

        if (er === 0 && eg === 0 && eb === 0) {
          continue;
        }

        const i0 = direction === 1 ? 0 : ds.length - 1;
        const i1 = direction === 1 ? ds.length : 0;
        for (let i = i0; i !== i1; i += direction) {
          const x1 = Math.trunc(ds[i][1]);
          const y1 = Math.trunc(ds[i][2]);
          if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
            const d = ds[i][0];
            idx = index + x1 + y1 * width;
            idx *= 4;
            const p2 = opt.image.getPixel(x1, y1);
            p2.r = Math.max(0, Math.min(255, Math.trunc(p2.r + er * d)));
            p2.g = Math.max(0, Math.min(255, Math.trunc(p2.g + er * d)));
            p2.b = Math.max(0, Math.min(255, Math.trunc(p2.b + er * d)));
          }
        }
      }
    }

    return indexedImage;
  }

  /**
   * Apply the dot screen filter to the image.
   */
  public static dotScreen(opt: DotScreenOptions): MemoryImage {
    let angle = opt.angle ?? 180;
    const size = opt.size ?? 5.75;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    angle *= 0.0174533;
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    for (const frame of opt.image.frames) {
      const w = frame.width - 1;
      const h = frame.height - 1;
      const cntX = (opt.centerX ?? Math.trunc(w / 2)) / w;
      const cntY = (opt.centerY ?? Math.trunc(h / 2)) / h;

      const pattern = (
        cntX: number,
        cntY: number,
        tx: number,
        ty: number
      ): number => {
        const texX = (tx - cntX) * w;
        const texY = (ty - cntY) * h;
        const pointX = (c * texX - s * texY) * size;
        const pointY = (s * texX + c * texY) * size;
        return Math.sin(pointX) * Math.sin(pointY) * 4;
      };

      for (const p of frame) {
        const average = p.luminanceNormalized;
        const pat = pattern(cntX, cntY, p.x / w, p.y / h);
        const c = (average * 10 - 5 + pat) * p.maxChannelValue;
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;
        p.r = MathUtils.mix(p.r, c, mx);
        p.g = MathUtils.mix(p.g, c, mx);
        p.b = MathUtils.mix(p.b, c, mx);
      }
    }

    return opt.image;
  }

  /**
   * Create a drop-shadow effect for the image.
   */
  public static dropShadow(opt: DropShadowOptions): MemoryImage {
    const blur = opt.blur >= 0 ? opt.blur : 0;
    const shadowColor = opt.shadowColor ?? new ColorRgba8(0, 0, 0, 128);

    const shadowWidth = opt.image.width + blur * 2;
    const shadowHeight = opt.image.height + blur * 2;
    let shadowOffsetX = -blur;
    let shadowOffsetY = -blur;

    let newImageWidth = shadowWidth;
    let newImageHeight = shadowHeight;
    let imageOffsetX = 0;
    let imageOffsetY = 0;

    if (shadowOffsetX + opt.hShadow < 0) {
      imageOffsetX = -(shadowOffsetX + opt.hShadow);
      shadowOffsetX = -shadowOffsetX;
      newImageWidth = imageOffsetX;
    }

    if (shadowOffsetY + opt.vShadow < 0) {
      imageOffsetY = -(shadowOffsetY + opt.vShadow);
      shadowOffsetY = -shadowOffsetY;
      newImageHeight += imageOffsetY;
    }

    if (shadowWidth + shadowOffsetX + opt.hShadow > newImageWidth) {
      newImageWidth = shadowWidth + shadowOffsetX + opt.hShadow;
    }

    if (shadowHeight + shadowOffsetY + opt.vShadow > newImageHeight) {
      newImageHeight = shadowHeight + shadowOffsetY + opt.vShadow;
    }

    const dst = new MemoryImage({
      width: newImageWidth,
      height: newImageHeight,
      numChannels: 4,
    });

    dst.clear(new ColorRgba8(255, 255, 255, 0));

    Draw.compositeImage({
      dst: dst,
      src: opt.image,
      dstX: shadowOffsetX,
      dstY: shadowOffsetY,
    });

    Filter.remapColors({
      image: dst,
      red: Channel.alpha,
      green: Channel.alpha,
      blue: Channel.alpha,
    });

    Filter.scaleRgba({
      image: dst,
      scale: shadowColor,
    });

    Filter.gaussianBlur({
      image: dst,
      radius: blur,
    });

    Draw.compositeImage({
      dst: dst,
      src: opt.image,
      dstX: imageOffsetX,
      dstY: imageOffsetY,
    });

    return dst;
  }

  /**
   * Apply the edge glow filter to the image.
   */
  public static edgeGlow(opt: EdgeGlowOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of opt.image.frames) {
      const orig = MemoryImage.from(frame, true);
      const width = frame.width;
      const height = frame.height;
      for (const p of frame) {
        const ny = MathUtils.clamp(p.y - 1, 0, height - 1);
        const py = MathUtils.clamp(p.y + 1, 0, height - 1);
        const nx = MathUtils.clamp(p.x - 1, 0, width - 1);
        const px = MathUtils.clamp(p.x + 1, 0, width - 1);

        const t1 = orig.getPixel(nx, ny);
        const t2 = orig.getPixel(p.x, ny);
        const t3 = orig.getPixel(px, ny);
        const t4 = orig.getPixel(nx, p.y);
        const t5 = p;
        const t6 = orig.getPixel(px, p.y);
        const t7 = orig.getPixel(nx, py);
        const t8 = orig.getPixel(p.x, py);
        const t9 = orig.getPixel(px, py);

        const xxR =
          t1.rNormalized +
          2 * t2.rNormalized +
          t3.rNormalized -
          t7.rNormalized -
          2 * t8.rNormalized -
          t9.rNormalized;
        const xxG =
          t1.gNormalized +
          2 * t2.gNormalized +
          t3.gNormalized -
          t7.gNormalized -
          2 * t8.gNormalized -
          t9.gNormalized;
        const xxB =
          t1.bNormalized +
          2 * t2.bNormalized +
          t3.bNormalized -
          t7.bNormalized -
          2 * t8.bNormalized -
          t9.bNormalized;

        const yyR =
          t1.rNormalized -
          t3.rNormalized +
          2 * t4.rNormalized -
          2 * t6.rNormalized +
          t7.rNormalized -
          t9.rNormalized;
        const yyG =
          t1.gNormalized -
          t3.gNormalized +
          2 * t4.gNormalized -
          2 * t6.gNormalized +
          t7.gNormalized -
          t9.gNormalized;
        const yyB =
          t1.bNormalized -
          t3.bNormalized +
          2 * t4.bNormalized -
          2 * t6.bNormalized +
          t7.bNormalized -
          t9.bNormalized;

        const rrR = Math.sqrt(xxR * xxR + yyR * yyR);
        const rrG = Math.sqrt(xxG * xxG + yyG * yyG);
        const rrB = Math.sqrt(xxB * xxB + yyB * yyB);

        const r = rrR * 2 * t5.rNormalized * p.maxChannelValue;
        const g = rrG * 2 * t5.gNormalized * p.maxChannelValue;
        const b = rrB * 2 * t5.bNormalized * p.maxChannelValue;

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        p.r = MathUtils.mix(p.r, r, mx);
        p.g = MathUtils.mix(p.g, g, mx);
        p.b = MathUtils.mix(p.b, b, mx);
      }
    }

    return opt.image;
  }

  /**
   * Apply an emboss convolution filter.
   */
  public static emboss(opt: EmbossOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    const filter = [1.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.5];
    return Filter.convolution({
      image: opt.image,
      filter: filter,
      div: 1,
      offset: 127,
      amount: amount,
      mask: opt.mask,
      maskChannel: maskChannel,
    });
  }

  /**
   * Apply gamma scaling
   */
  public static gamma(opt: GammaOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        if (msk === undefined) {
          p.rNormalized = Math.pow(p.rNormalized, opt.gamma);
          p.gNormalized = Math.pow(p.gNormalized, opt.gamma);
          p.bNormalized = Math.pow(p.bNormalized, opt.gamma);
        } else {
          p.rNormalized = MathUtils.mix(
            p.rNormalized,
            Math.pow(p.rNormalized, opt.gamma),
            msk
          );
          p.gNormalized = MathUtils.mix(
            p.gNormalized,
            Math.pow(p.gNormalized, opt.gamma),
            msk
          );
          p.bNormalized = MathUtils.mix(
            p.bNormalized,
            Math.pow(p.bNormalized, opt.gamma),
            msk
          );
        }
      }
    }
    return opt.image;
  }

  /**
   * Apply gaussian blur to the **image**. **radius** determines how many pixels
   * away from the current pixel should contribute to the blur, where 0 is no
   * blur and the larger the **radius**, the stronger the blur.
   */
  public static gaussianBlur(opt: GaussianBlurOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.radius <= 0) {
      return opt.image;
    }

    let kernel: SeparableKernel | undefined = undefined;

    if (Filter._gaussianKernelCache.has(opt.radius)) {
      kernel = Filter._gaussianKernelCache.get(opt.radius)!;
    } else {
      // Compute coefficients
      const sigma = (opt.radius * 2) / 3;
      const s = 2 * sigma * sigma;

      kernel = new SeparableKernel(opt.radius);

      let sum = 0;
      for (let x = -opt.radius; x <= opt.radius; ++x) {
        const c = Math.exp(-(x * x) / s);
        sum += c;
        kernel.setCoefficient(x + opt.radius, c);
      }
      // Normalize the coefficients
      kernel.scaleCoefficients(1 / sum);

      // Cache the kernel for this radius so we don't have to recompute it
      // next time.
      Filter._gaussianKernelCache.set(opt.radius, kernel);
    }

    return Filter.separableConvolution({
      image: opt.image,
      kernel: kernel,
      mask: opt.mask,
      maskChannel: maskChannel,
    });
  }

  /**
   * Convert the image to grayscale.
   */
  public static grayscale(opt: GrayscaleOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of opt.image.frames) {
      if (frame.hasPalette) {
        const p = frame.palette!;
        const numColors = p.numColors;
        for (let i = 0; i < numColors; ++i) {
          const l = ColorUtils.getLuminanceRgb(
            p.getRed(i),
            p.getGreen(i),
            p.getBlue(i)
          );
          if (amount !== 1) {
            const r = MathUtils.mix(p.getRed(i), l, amount);
            const g = MathUtils.mix(p.getGreen(i), l, amount);
            const b = MathUtils.mix(p.getBlue(i), l, amount);
            p.setRed(i, r);
            p.setGreen(i, g);
            p.setBlue(i, b);
          } else {
            p.setRed(i, l);
            p.setGreen(i, l);
            p.setBlue(i, l);
          }
        }
      } else {
        for (const p of frame) {
          const l = ColorUtils.getLuminanceRgb(p.r, p.g, p.b);
          const msk = opt.mask
            ?.getPixel(p.x, p.y)
            .getChannelNormalized(maskChannel);
          const mx = (msk ?? 1) * amount;
          if (mx !== 1) {
            p.r = MathUtils.mix(p.r, l, mx);
            p.g = MathUtils.mix(p.g, l, mx);
            p.b = MathUtils.mix(p.b, l, mx);
          } else {
            p.r = l;
            p.g = l;
            p.b = l;
          }
        }
      }
    }

    return opt.image;
  }

  /**
   * Convert a high dynamic range image to a low dynamic range image,
   * with optional exposure control.
   */
  public static hdrToLdr(opt: HdrToLdrOptions): MemoryImage {
    const knee = (x: number, f: number): number => {
      return Math.log(x * f + 1.0) / f;
    };

    const gamma = (h: number, m: number): number => {
      let x = Math.max(0, h * m);
      if (x > 1.0) {
        x = 1 + knee(x - 1, 0.184874);
      }
      return Math.pow(x, 0.4545) * 84.66;
    };

    const image = new MemoryImage({
      width: opt.image.width,
      height: opt.image.height,
      numChannels: opt.image.numChannels,
    });

    const m =
      opt.exposure !== undefined
        ? Math.pow(2, MathUtils.clamp(opt.exposure + 2.47393, -20, 20))
        : 1;

    const nc = opt.image.numChannels;

    for (let y = 0; y < opt.image.height; ++y) {
      for (let x = 0; x < opt.image.width; ++x) {
        const hp = opt.image.getPixel(x, y);

        let r = hp.rNormalized;
        let g = nc === 1 ? r : hp.gNormalized;
        let b = nc === 1 ? r : hp.bNormalized;

        if (!isFinite(r) || isNaN(r)) {
          r = 0;
        }
        if (!isFinite(g) || isNaN(g)) {
          g = 0;
        }
        if (!isFinite(b) || isNaN(b)) {
          b = 0;
        }

        let ri = 0;
        let gi = 0;
        let bi = 0;
        if (opt.exposure !== undefined) {
          ri = gamma(r, m);
          gi = gamma(g, m);
          bi = gamma(b, m);
        } else {
          ri = MathUtils.clamp(r, 0, 1) * 255;
          gi = MathUtils.clamp(g, 0, 1) * 255;
          bi = MathUtils.clamp(b, 0, 1) * 255;
        }

        // Normalize the color
        const mi = Math.max(ri, Math.max(gi, bi));
        if (mi > 255) {
          ri = 255 * (ri / mi);
          gi = 255 * (gi / mi);
          bi = 255 * (bi / mi);
        }

        if (opt.image.numChannels > 3) {
          let a = hp.a;
          if (!isFinite(a) || isNaN(a)) {
            a = 1;
          }
          image.setPixelRgba(
            x,
            y,
            MathUtils.clampInt255(ri),
            MathUtils.clampInt255(gi),
            MathUtils.clampInt255(bi),
            MathUtils.clampInt255(a * 255)
          );
        } else {
          image.setPixelRgb(
            x,
            y,
            MathUtils.clampInt255(ri),
            MathUtils.clampInt255(gi),
            MathUtils.clampInt255(bi)
          );
        }
      }
    }

    return image;
  }

  /**
   * Apply the hexagon pixelate filter to the image.
   */
  public static hexagonPixelate(opt: HexagonPixelateOptions): MemoryImage {
    const size = opt.size ?? 5;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of opt.image.frames) {
      const w = frame.width - 1;
      const h = frame.height - 1;
      const cntX = (opt.centerX ?? Math.trunc(frame.width / 2)) / w;
      const cntY = (opt.centerY ?? Math.trunc(frame.height / 2)) / h;
      const orig = frame.clone({
        skipAnimation: true,
      });

      for (const p of frame) {
        let texX = (p.x - cntX) / size;
        let texY = (p.y - cntY) / size;
        texY /= 0.866025404;
        texX -= texY * 0.5;

        let ax = 0;
        let ay = 0;
        if (texX + texY - Math.floor(texX) - Math.floor(texY) < 1) {
          ax = Math.floor(texX);
          ay = Math.floor(texY);
        } else {
          ax = Math.ceil(texX);
          ay = Math.ceil(texY);
        }

        const bx = Math.ceil(texX);
        const by = Math.floor(texY);
        const cx = Math.floor(texX);
        const cy = Math.ceil(texY);

        const tex2X = texX;
        const tex2Y = texY;
        const tex2Z = 1 - texX - texY;
        const a2x = ax;
        const a2y = ay;
        const a2z = 1 - ax - ay;
        const b2x = bx;
        const b2y = by;
        const b2z = 1 - bx - by;
        const c2x = cx;
        const c2y = cy;
        const c2z = 1 - cx - cy;

        const aLen = MathUtils.length3(tex2X - a2x, tex2Y - a2y, tex2Z - a2z);
        const bLen = MathUtils.length3(tex2X - b2x, tex2Y - b2y, tex2Z - b2z);
        const cLen = MathUtils.length3(tex2X - c2x, tex2Y - c2y, tex2Z - c2z);

        let choiceX = 0;
        let choiceY = 0;
        if (aLen < bLen) {
          if (aLen < cLen) {
            choiceX = ax;
            choiceY = ay;
          } else {
            choiceX = cx;
            choiceY = cy;
          }
        } else {
          if (bLen < cLen) {
            choiceX = bx;
            choiceY = by;
          } else {
            choiceX = cx;
            choiceY = cy;
          }
        }

        choiceX += choiceY * 0.5;
        choiceY *= 0.866025404;
        choiceX *= size / w;
        choiceY *= size / h;

        const nx = choiceX + cntX / w;
        const ny = choiceY + cntY / h;
        const x = MathUtils.clamp(nx * w, 0, w);
        const y = MathUtils.clamp(ny * h, 0, h);
        const newColor = orig.getPixel(Math.floor(x), Math.floor(y));

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        p.r = MathUtils.mix(p.r, newColor.r, mx);
        p.g = MathUtils.mix(p.g, newColor.g, mx);
        p.b = MathUtils.mix(p.b, newColor.b, mx);
      }
    }
    return opt.image;
  }

  /**
   * Invert the colors of the **image**.
   */
  public static invert(opt: InvertOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const max = opt.image.maxChannelValue;
    for (const frame of opt.image.frames) {
      if (opt.image.hasPalette) {
        const p = frame.palette!;
        const numColors = p.numColors;
        for (let i = 0; i < numColors; ++i) {
          const r = max - p.getRed(i);
          const g = max - p.getGreen(i);
          const b = max - p.getBlue(i);
          p.setRgb(i, r, g, b);
        }
      } else {
        if (max !== 0) {
          for (const p of frame) {
            const msk = opt.mask
              ?.getPixel(p.x, p.y)
              .getChannelNormalized(maskChannel);

            if (msk === undefined) {
              p.r = max - p.r;
              p.g = max - p.g;
              p.b = max - p.b;
            } else {
              p.r = MathUtils.mix(p.r, max - p.r, msk);
              p.g = MathUtils.mix(p.g, max - p.g, msk);
              p.b = MathUtils.mix(p.b, max - p.b, msk);
            }
          }
        }
      }
    }
    return opt.image;
  }

  public static luminanceThreshold(
    opt: LuminanceThresholdOptions
  ): MemoryImage {
    const threshold = opt.threshold ?? 0.5;
    const outputColor = opt.outputColor ?? false;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const y =
          0.3 * p.rNormalized + 0.59 * p.gNormalized + 0.11 * p.bNormalized;
        if (outputColor) {
          const l = Math.max(0, y - threshold);
          const sl = Math.sign(l);
          const msk = opt.mask
            ?.getPixel(p.x, p.y)
            .getChannelNormalized(maskChannel);
          const mx = (msk ?? 1) * amount;
          p.r = MathUtils.mix(p.r, p.r * sl, mx);
          p.g = MathUtils.mix(p.g, p.g * sl, mx);
          p.b *= MathUtils.mix(p.b, p.b * sl, mx);
        } else {
          const y2 = y < threshold ? 0 : p.maxChannelValue;
          const msk = opt.mask
            ?.getPixel(p.x, p.y)
            .getChannelNormalized(maskChannel);
          const mx = (msk ?? 1) * amount;
          p.r = MathUtils.mix(p.r, y2, mx);
          p.g = MathUtils.mix(p.g, y2, mx);
          p.b = MathUtils.mix(p.b, y2, mx);
        }
      }
    }
    return opt.image;
  }

  /**
   * Apply the monochrome filter to the **image**.
   *
   * **amount** controls the strength of the effect, in the range [0, 1].
   */
  public static monochrome(opt: MonochromeOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    const nr = opt.color?.rNormalized ?? 0.45;
    const ng = opt.color?.gNormalized ?? 0.6;
    const nb = opt.color?.bNormalized ?? 0.3;

    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const y = p.luminanceNormalized;

        const r = y < 0.5 ? 2 * y * nr : 1 - 2 * (1 - y) * (1 - nr);
        const g = y < 0.5 ? 2 * y * ng : 1 - 2 * (1 - y) * (1 - ng);
        const b = y < 0.5 ? 2 * y * nb : 1 - 2 * (1 - y) * (1 - nb);
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;
        p.r = MathUtils.mix(p.r, r * p.maxChannelValue, mx);
        p.g = MathUtils.mix(p.g, g * p.maxChannelValue, mx);
        p.b = MathUtils.mix(p.b, b * p.maxChannelValue, mx);
      }
    }

    return opt.image;
  }

  /**
   * Add random noise to pixel values. **sigma** determines how strong the effect
   * should be. **type** should be one of the following: _NoiseType.gaussian_,
   * _NoiseType.uniform_, _NoiseType.saltAndPepper_, _NoiseType.poisson_,
   * or _NoiseType.rice_.
   */
  public static noise(opt: NoiseOptions): MemoryImage {
    const type = opt.type ?? NoiseType.gaussian;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    let nSigma = opt.sigma;
    let min = 0;
    let max = 0;

    if (nSigma === 0 && type !== NoiseType.poisson) {
      return opt.image;
    }

    if (nSigma < 0 || type === NoiseType.saltAndPepper) {
      const extremes = opt.image.getColorExtremes();
      min = extremes.min;
      max = extremes.max;
    }

    if (nSigma < 0) {
      nSigma = (-nSigma * (max - min)) / 100.0;
    }

    for (const frame of opt.image.frames) {
      switch (type) {
        case NoiseType.gaussian:
          for (const p of frame) {
            const r = p.r + nSigma * RandomUtils.grand();
            const g = p.g + nSigma * RandomUtils.grand();
            const b = p.b + nSigma * RandomUtils.grand();
            const a = p.a;
            const msk = opt.mask
              ?.getPixel(p.x, p.y)
              .getChannelNormalized(maskChannel);
            if (msk === undefined) {
              p.setRgba(r, g, b, a);
            } else {
              p.r = MathUtils.mix(p.r, r, msk);
              p.g = MathUtils.mix(p.g, g, msk);
              p.b = MathUtils.mix(p.b, b, msk);
              p.a = MathUtils.mix(p.a, a, msk);
            }
          }
          break;
        case NoiseType.uniform:
          for (const p of frame) {
            const r = p.r + nSigma * RandomUtils.crand();
            const g = p.g + nSigma * RandomUtils.crand();
            const b = p.b + nSigma * RandomUtils.crand();
            const a = p.a;
            const msk = opt.mask
              ?.getPixel(p.x, p.y)
              .getChannelNormalized(maskChannel);
            if (msk === undefined) {
              p.setRgba(r, g, b, a);
            } else {
              p.r = MathUtils.mix(p.r, r, msk);
              p.g = MathUtils.mix(p.g, g, msk);
              p.b = MathUtils.mix(p.b, b, msk);
              p.a = MathUtils.mix(p.a, a, msk);
            }
          }
          break;
        case NoiseType.saltAndPepper:
          if (nSigma < 0) {
            nSigma = -nSigma;
          }
          if (max === min) {
            min = 0;
            max = 255;
          }
          for (const p of frame) {
            if (Math.random() * 100 < nSigma) {
              const r = Math.random() < 0.5 ? max : min;
              const g = Math.random() < 0.5 ? max : min;
              const b = Math.random() < 0.5 ? max : min;
              const a = p.a;
              const msk = opt.mask
                ?.getPixel(p.x, p.y)
                .getChannelNormalized(maskChannel);
              if (msk === undefined) {
                p.setRgba(r, g, b, a);
              } else {
                p.r = MathUtils.mix(p.r, r, msk);
                p.g = MathUtils.mix(p.g, g, msk);
                p.b = MathUtils.mix(p.b, b, msk);
                p.a = MathUtils.mix(p.a, a, msk);
              }
            }
          }
          break;
        case NoiseType.poisson:
          for (const p of frame) {
            const r = RandomUtils.prand(p.r);
            const g = RandomUtils.prand(p.g);
            const b = RandomUtils.prand(p.b);
            const a = p.a;
            const msk = opt.mask
              ?.getPixel(p.x, p.y)
              .getChannelNormalized(maskChannel);
            if (msk === undefined) {
              p.setRgba(r, g, b, a);
            } else {
              p.r = MathUtils.mix(p.r, r, msk);
              p.g = MathUtils.mix(p.g, g, msk);
              p.b = MathUtils.mix(p.b, b, msk);
              p.a = MathUtils.mix(p.a, a, msk);
            }
          }
          break;
        case NoiseType.rice: {
          const sqrt2 = Math.sqrt(2);
          for (const p of frame) {
            let val0 = p.r / sqrt2;
            let re = val0 + nSigma * RandomUtils.grand();
            let im = val0 + nSigma * RandomUtils.grand();
            let val = Math.sqrt(re * re + im * im);
            const r = Math.trunc(val);

            val0 = p.g / sqrt2;
            re = val0 + nSigma * RandomUtils.grand();
            im = val0 + nSigma * RandomUtils.grand();
            val = Math.sqrt(re * re + im * im);
            const g = Math.trunc(val);

            val0 = p.b / sqrt2;
            re = val0 + nSigma * RandomUtils.grand();
            im = val0 + nSigma * RandomUtils.grand();
            val = Math.sqrt(re * re + im * im);
            const b = Math.trunc(val);

            const a = p.a;

            const msk = opt.mask
              ?.getPixel(p.x, p.y)
              .getChannelNormalized(maskChannel);
            if (msk === undefined) {
              p.setRgba(r, g, b, a);
            } else {
              p.r = MathUtils.mix(p.r, r, msk);
              p.g = MathUtils.mix(p.g, g, msk);
              p.b = MathUtils.mix(p.b, b, msk);
              p.a = MathUtils.mix(p.a, a, msk);
            }
          }
          break;
        }
      }
    }

    return opt.image;
  }

  /**
   * Linearly normalize the colors of the image. All color values will be mapped
   * to the range **min**, **max** inclusive.
   */
  public static normalize(opt: NormalizeOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const a = opt.min < opt.max ? opt.min : opt.max;
    const b = opt.min < opt.max ? opt.max : opt.min;

    const extremes = opt.image.getColorExtremes();
    const mn = extremes.min;
    const mx = extremes.max;

    if (mn === mx) {
      return opt.image;
    }

    const fm = mn;
    const fM = mx;

    if (mn !== a || mx !== b) {
      for (const frame of opt.image.frames) {
        for (const p of frame) {
          const msk = opt.mask
            ?.getPixel(p.x, p.y)
            .getChannelNormalized(maskChannel);
          if (msk === undefined) {
            p.r = ((p.r - fm) / (fM - fm)) * (b - a) + a;
            p.g = ((p.g - fm) / (fM - fm)) * (b - a) + a;
            p.b = ((p.b - fm) / (fM - fm)) * (b - a) + a;
            p.a = ((p.a - fm) / (fM - fm)) * (b - a) + a;
          } else {
            const xr = ((p.r - fm) / (fM - fm)) * (b - a) + a;
            const xg = ((p.g - fm) / (fM - fm)) * (b - a) + a;
            const xb = ((p.b - fm) / (fM - fm)) * (b - a) + a;
            const xa = ((p.a - fm) / (fM - fm)) * (b - a) + a;
            p.r = MathUtils.mix(p.r, xr, msk);
            p.g = MathUtils.mix(p.g, xg, msk);
            p.b = MathUtils.mix(p.b, xb, msk);
            p.a = MathUtils.mix(p.a, xa, msk);
          }
        }
      }
    }

    return opt.image;
  }

  /**
   * Pixelate the **image**.
   *
   * **size** determines the size of the pixelated blocks.
   * If **mode** is **upperLeft** then the upper-left corner of the
   * block will be used for the block color. Otherwise if **mode** is
   * **average**, the average of all the pixels in the block will be
   * used for the block color.
   */
  public static pixelate(opt: PixelateOptions): MemoryImage {
    const mode = opt.mode ?? PixelateMode.upperLeft;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.size <= 1) {
      return opt.image;
    }

    for (const frame of opt.image.frames) {
      const w = frame.width;
      const h = frame.height;
      switch (mode) {
        case PixelateMode.upperLeft:
          for (const p of frame) {
            const x2 = Math.trunc(p.x / opt.size) * opt.size;
            const y2 = Math.trunc(p.y / opt.size) * opt.size;
            const p2 = frame.getPixel(x2, y2);
            const msk = opt.mask
              ?.getPixel(p.x, p.y)
              .getChannelNormalized(maskChannel);
            const mx = (msk ?? 1) * amount;
            if (mx === 1) {
              p.set(p2);
            } else {
              p.r = MathUtils.mix(p.r, p2.r, mx);
              p.g = MathUtils.mix(p.g, p2.g, mx);
              p.b = MathUtils.mix(p.b, p2.b, mx);
              p.a = MathUtils.mix(p.a, p2.a, mx);
            }
          }
          break;
        case PixelateMode.average:
          {
            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;
            let lx = -1;
            let ly = -1;
            for (const p of frame) {
              const x2 = Math.trunc(p.x / opt.size) * opt.size;
              const y2 = Math.trunc(p.y / opt.size) * opt.size;
              const msk = opt.mask
                ?.getPixel(p.x, p.y)
                .getChannelNormalized(maskChannel);
              const mx = (msk ?? 1) * amount;
              if (x2 !== lx || y2 <= ly) {
                lx = x2;
                ly = y2;
                r = 0;
                g = 0;
                b = 0;
                a = 0;
                for (
                  let by = 0, by2 = y2;
                  by < opt.size && by2 < h;
                  ++by, ++by2
                ) {
                  for (
                    let bx = 0, bx2 = x2;
                    bx < opt.size && bx2 < w;
                    ++bx, ++bx2
                  ) {
                    const p2 = frame.getPixel(bx2, by2);
                    r += p2.r;
                    g += p2.g;
                    b += p2.b;
                    a += p2.a;
                  }
                }
                const total = opt.size * opt.size;
                r /= total;
                g /= total;
                b /= total;
                a /= total;
              }

              p.r = MathUtils.mix(p.r, r, mx);
              p.g = MathUtils.mix(p.g, g, mx);
              p.b = MathUtils.mix(p.b, b, mx);
              p.a = MathUtils.mix(p.a, a, mx);
            }
          }

          break;
      }
    }
    return opt.image;
  }

  /**
   * Quantize the number of colors in image to 256.
   */
  public static quantize(opt: QuantizeOptions): MemoryImage {
    const numberOfColors = opt.numberOfColors ?? 256;
    const method = opt.method ?? QuantizeMethod.neuralNet;
    const dither = opt.dither ?? DitherKernel.none;
    const ditherSerpentine = opt.ditherSerpentine ?? false;

    let quantizer: Quantizer | undefined = undefined;
    if (method === QuantizeMethod.octree || numberOfColors < 4) {
      quantizer = new OctreeQuantizer(opt.image, numberOfColors);
    } else {
      quantizer = new NeuralQuantizer(opt.image, numberOfColors);
    }

    return Filter.ditherImage({
      image: opt.image,
      quantizer: quantizer,
      kernel: dither,
      serpentine: ditherSerpentine,
    });
  }

  /**
   * Applies Reinhard tone mapping to the hdr image, in-place.
   */
  public static reinhardToneMap(opt: ReinhardToneMapOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const yw = [0.212671, 0.71516, 0.072169];

    // Compute world adaptation luminance, _Ywa_
    let ywa = 0.0;
    for (const p of opt.image) {
      const r = p.r;
      const g = p.g;
      const b = p.b;
      const lum = yw[0] * r + yw[1] * g + yw[2] * b;
      if (lum > 1.0e-4) {
        ywa += Math.log(lum);
      }
    }

    ywa = Math.exp(ywa / (opt.image.width * opt.image.height));

    const invY2 = 1 / (ywa * ywa);

    for (const p of opt.image) {
      const r = p.r;
      const g = p.g;
      const b = p.b;

      const lum = yw[0] * r + yw[1] * g + yw[2] * b;

      const s = (1 + lum * invY2) / (1 + lum);

      const msk = opt.mask
        ?.getPixel(p.x, p.y)
        .getChannelNormalized(maskChannel);
      if (msk === undefined) {
        p.r = r * s;
        p.g = g * s;
        p.b = b * s;
      } else {
        p.r = MathUtils.mix(p.r, r * s, msk);
        p.g = MathUtils.mix(p.g, g * s, msk);
        p.b = MathUtils.mix(p.b, b * s, msk);
      }
    }

    return opt.image;
  }

  /**
   * Remap the color channels of the image.
   * **red**, **green**, **blue** and **alpha** should be set to one of the following:
   * _Channel.red_, _Channel.green_, _Channel.blue_, _Channel.alpha_, or
   * _Channel.luminance_.
   */
  public static remapColors(opt: RemapColorsOptions): MemoryImage {
    const red = opt.red ?? Channel.red;
    const green = opt.green ?? Channel.green;
    const blue = opt.blue ?? Channel.blue;
    const alpha = opt.alpha ?? Channel.alpha;

    const l: number[] = [0, 0, 0, 0, 0];
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        l[0] = p.r;
        l[1] = p.g;
        l[2] = p.b;
        l[3] = p.a;
        if (
          red === Channel.luminance ||
          green === Channel.luminance ||
          blue === Channel.luminance ||
          alpha === Channel.luminance
        ) {
          l[4] = ColorUtils.getLuminanceRgb(l[0], l[1], l[2]);
        }
        p.r = l[red];
        p.g = l[green];
        p.b = l[blue];
        p.a = l[alpha];
      }
    }
    return opt.image;
  }

  public static scaleRgba(opt: ScaleRgbaOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const dr = opt.scale.rNormalized;
    const dg = opt.scale.gNormalized;
    const db = opt.scale.bNormalized;
    const da = opt.scale.aNormalized;
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        if (msk === undefined) {
          p.setRgba(p.r * dr, p.g * dg, p.b * db, p.a * da);
        } else {
          p.r = MathUtils.mix(p.r, p.r * dr, msk);
          p.g = MathUtils.mix(p.g, p.g * dg, msk);
          p.b = MathUtils.mix(p.b, p.b * db, msk);
          p.a = MathUtils.mix(p.a, p.a * da, msk);
        }
      }
    }

    return opt.image;
  }

  /**
   * Apply a generic separable convolution filter to the **image**, using the
   * given **kernel**.
   *
   * **gaussianBlur** is an example of such a filter.
   */
  public static separableConvolution(
    opt: SeparableConvolutionOptions
  ): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const tmp = MemoryImage.from(opt.image);

    // Apply the filter horizontally
    opt.kernel.apply({
      src: opt.image,
      dst: tmp,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    // Apply the filter vertically, applying back to the original image.
    opt.kernel.apply({
      src: tmp,
      dst: opt.image,
      horizontal: false,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    return opt.image;
  }

  /**
   * Apply sepia tone to the **image**.
   *
   * **amount** controls the strength of the effect, in the range [0, 1].
   */
  public static sepia(opt: SepiaOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const r = p.rNormalized;
        const g = p.gNormalized;
        const b = p.bNormalized;
        const y = ColorUtils.getLuminanceRgb(r, g, b);
        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;
        p.rNormalized = mx * (y + 0.15) + (1 - mx) * r;
        p.gNormalized = mx * (y + 0.07) + (1 - mx) * g;
        p.bNormalized = mx * (y - 0.12) + (1 - mx) * b;
      }
    }

    return opt.image;
  }

  /**
   * Apply sketch filter to the **image**.
   *
   * **amount** controls the strength of the effect, in the range [0, 1].
   */
  public static sketch(opt: SketchOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of opt.image.frames) {
      const width = frame.width;
      const height = frame.height;
      const orig = MemoryImage.from(frame, true);
      for (const p of frame) {
        const ny = MathUtils.clamp(p.y - 1, 0, height - 1);
        const py = MathUtils.clamp(p.y + 1, 0, height - 1);
        const nx = MathUtils.clamp(p.x - 1, 0, width - 1);
        const px = MathUtils.clamp(p.x + 1, 0, width - 1);

        const bottomLeft = orig.getPixel(nx, py).luminanceNormalized;
        const topLeft = orig.getPixel(nx, ny).luminanceNormalized;
        const bottomRight = orig.getPixel(px, py).luminanceNormalized;
        const topRight = orig.getPixel(px, ny).luminanceNormalized;
        const left = orig.getPixel(nx, p.y).luminanceNormalized;
        const right = orig.getPixel(px, p.y).luminanceNormalized;
        const bottom = orig.getPixel(p.x, py).luminanceNormalized;
        const top = orig.getPixel(p.x, ny).luminanceNormalized;

        const h =
          -topLeft - 2 * top - topRight + bottomLeft + 2 * bottom + bottomRight;

        const v =
          -bottomLeft - 2 * left - topLeft + bottomRight + 2 * right + topRight;

        const mag = 1 - Math.sqrt(h * h + v * v);

        const r = MathUtils.clamp(mag * p.r, 0, p.maxChannelValue);
        const g = MathUtils.clamp(mag * p.g, 0, p.maxChannelValue);
        const b = MathUtils.clamp(mag * p.b, 0, p.maxChannelValue);

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        p.r = MathUtils.mix(p.r, r, mx);
        p.g = MathUtils.mix(p.g, g, mx);
        p.b = MathUtils.mix(p.b, b, mx);
      }
    }

    return opt.image;
  }

  /**
   * Apply a smoothing convolution filter to the **image**.
   *
   * **weight** is the weight of the current pixel being filtered. If it's greater
   * than 1, it will make the image sharper.
   */
  public static smooth(opt: SmoothOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const filter = [1, 1, 1, 1, opt.weight, 1, 1, 1, 1];
    return Filter.convolution({
      image: opt.image,
      filter: filter,
      div: opt.weight + 8,
      offset: 0,
      mask: opt.mask,
      maskChannel: maskChannel,
    });
  }

  /**
   * Apply Sobel edge detection filtering to the **image**.
   */
  public static sobel(opt: SobelOptions): MemoryImage {
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of opt.image.frames) {
      const orig = MemoryImage.from(frame, true);
      const width = frame.width;
      const height = frame.height;
      for (const p of frame) {
        const ny = MathUtils.clamp(p.y - 1, 0, height - 1);
        const py = MathUtils.clamp(p.y + 1, 0, height - 1);
        const nx = MathUtils.clamp(p.x - 1, 0, width - 1);
        const px = MathUtils.clamp(p.x + 1, 0, width - 1);

        const bottomLeft = orig.getPixel(nx, py).luminanceNormalized;
        const topLeft = orig.getPixel(nx, ny).luminanceNormalized;
        const bottomRight = orig.getPixel(px, py).luminanceNormalized;
        const topRight = orig.getPixel(px, ny).luminanceNormalized;
        const left = orig.getPixel(nx, p.y).luminanceNormalized;
        const right = orig.getPixel(px, p.y).luminanceNormalized;
        const bottom = orig.getPixel(p.x, py).luminanceNormalized;
        const top = orig.getPixel(p.x, ny).luminanceNormalized;

        const h =
          -topLeft - 2 * top - topRight + bottomLeft + 2 * bottom + bottomRight;

        const v =
          -bottomLeft - 2 * left - topLeft + bottomRight + 2 * right + topRight;

        const mag = Math.sqrt(h * h + v * v) * p.maxChannelValue;

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;
        const invMx = 1 - mx;

        p.r = mag * mx + p.r * invMx;
        p.g = mag * mx + p.g * invMx;
        p.b = mag * mx + p.b * invMx;
      }
    }

    return opt.image;
  }

  public static stretchDistortion(opt: StretchDistortionOptions): MemoryImage {
    const interpolation = opt.interpolation ?? Interpolation.nearest;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of opt.image.frames) {
      const orig = frame.clone({
        skipAnimation: true,
      });
      const w = frame.width - 1;
      const h = frame.height - 1;
      const cx = opt.centerX ?? Math.trunc(frame.width / 2);
      const cy = opt.centerY ?? Math.trunc(frame.height / 2);
      const nCntX = 2 * (cx / w) - 1;
      const nCntY = 2 * (cy / h) - 1;
      for (const p of frame) {
        let ncX = (p.x / w) * 2 - 1;
        let ncY = (p.y / h) * 2 - 1;
        ncX -= nCntX;
        ncY -= nCntY;
        const sX = Math.sign(ncX);
        const sY = Math.sign(ncY);
        ncX = Math.abs(ncX);
        ncY = Math.abs(ncY);
        ncX =
          (0.5 * ncX + 0.5 * MathUtils.smoothStep(0.25, 0.5, ncX) * ncX) * sX;
        ncY =
          (0.5 * ncY + 0.5 * MathUtils.smoothStep(0.25, 0.5, ncY) * ncY) * sY;
        ncX += nCntX;
        ncY += nCntY;

        const x = MathUtils.clamp((ncX / 2 + 0.5) * w, 0, w - 1);
        const y = MathUtils.clamp((ncY / 2 + 0.5) * h, 0, h - 1);

        const p2 = orig.getPixelInterpolate(x, y, interpolation);

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);

        if (msk === undefined) {
          p.r = p2.r;
          p.g = p2.g;
          p.b = p2.b;
        } else {
          p.r = MathUtils.mix(p.r, p2.r, msk);
          p.g = MathUtils.mix(p.g, p2.g, msk);
          p.b = MathUtils.mix(p.b, p2.b, msk);
        }
      }
    }

    return opt.image;
  }

  /**
   * Apply a vignette filter to the **image**.
   *
   * **start** is the inner radius from the center of the image, where the fade to
   * **color** starts to be applied; **end** is the outer radius of the
   * vignette effect where the **color** is fully applied. The radius values are in
   * normalized percentage of the image size [0, 1].
   * **amount** controls the blend of the effect with the original image.
   */
  public static vignette(opt: VignetteOptions): MemoryImage {
    const start = opt.start ?? 0.3;
    const end = opt.end ?? 0.85;
    const amount = opt.amount ?? 0.9;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const h = opt.image.height - 1;
    const w = opt.image.width - 1;
    const cr = opt.color?.rNormalized ?? 0;
    const cg = opt.color?.gNormalized ?? 0;
    const cb = opt.color?.bNormalized ?? 0;
    const ca = opt.color?.aNormalized ?? 1;
    const aspect = w / h;
    for (const frame of opt.image.frames) {
      for (const p of frame) {
        const dx = (0.5 - p.x / w) * aspect;
        const dy = 0.5 - p.y / h;

        let d = Math.sqrt(dx * dx + dy * dy);
        d = 1 - MathUtils.smoothStep(end, start, d);

        const r = MathUtils.mix(p.rNormalized, cr, d) * p.maxChannelValue;
        const g = MathUtils.mix(p.gNormalized, cg, d) * p.maxChannelValue;
        const b = MathUtils.mix(p.bNormalized, cb, d) * p.maxChannelValue;
        const a = MathUtils.mix(p.aNormalized, ca, d) * p.maxChannelValue;

        const msk = opt.mask
          ?.getPixel(p.x, p.y)
          .getChannelNormalized(maskChannel);
        const mx = (msk ?? 1) * amount;

        p.r = MathUtils.mix(p.r, r, mx);
        p.g = MathUtils.mix(p.g, g, mx);
        p.b = MathUtils.mix(p.b, b, mx);
        p.a = MathUtils.mix(p.a, a, mx);
      }
    }

    return opt.image;
  }
}
