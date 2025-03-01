/** @format */

import { Channel } from '../color/channel.js';
import { Color } from '../color/color.js';
import { ColorRgba8 } from '../color/color-rgba8.js';
import { Interpolation } from '../common/interpolation.js';
import { MathUtils } from '../common/math-utils.js';
import { NeuralQuantizer } from '../image/neural-quantizer.js';
import { OctreeQuantizer } from '../image/octree-quantizer.js';
import { Quantizer } from '../image/quantizer.js';
import { RandomUtils } from '../common/random-utils.js';
import { Draw } from '../draw/draw.js';
import { MemoryImage } from '../image/image.js';
import { DitherKernel, DitherKernels } from './dither-kernel.js';
import { NoiseType } from './noise-type.js';
import { PixelateMode } from './pixelate-mode.js';
import { QuantizeMethod } from './quantize-method.js';
import { SeparableKernel } from './separable-kernel.js';
import { ColorUtils } from '../color/color-utils.js';
import { SolarizeMode } from './solarize-mode.js';
import { BinaryQuantizer } from '../image/binary-quantizer.js';
import { ContrastMode } from './contrast-mode.js';

/**
 * Interface representing a cache for contrast adjustments.
 */
interface ContrastCache {
  /** The last contrast value used. */
  lastContrast: number;
  /** The contrast data as a Uint8Array. */
  contrast: Uint8Array;
}

/**
 * Options for adjusting the color of an image.
 */
export interface AdjustColorOptions {
  /** The image to adjust. */
  image: MemoryImage;
  /** The black color adjustment. */
  blacks?: Color;
  /** The white color adjustment. */
  whites?: Color;
  /** The midtone color adjustment. */
  mids?: Color;
  /** The contrast adjustment value. */
  contrast?: number;
  /** The saturation adjustment value. */
  saturation?: number;
  /** The brightness adjustment value. */
  brightness?: number;
  /** The gamma adjustment value. */
  gamma?: number;
  /** The exposure adjustment value. */
  exposure?: number;
  /** The hue adjustment value. */
  hue?: number;
  /** The amount of adjustment to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for creating a billboard effect on an image.
 */
export interface BillboardOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The grid size for the effect. */
  grid?: number;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a bleach bypass effect to an image.
 */
export interface BleachBypassOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a bulge distortion effect to an image.
 */
export interface BulgeDistortionOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The X coordinate of the center of the bulge. */
  centerX?: number;
  /** The Y coordinate of the center of the bulge. */
  centerY?: number;
  /** The radius of the bulge. */
  radius?: number;
  /** The scale of the bulge. */
  scale?: number;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for converting a bump map to a normal map.
 */
export interface BumpToNormalOptions {
  /** The image to convert. */
  image: MemoryImage;
  /** The strength of the conversion. */
  strength?: number;
}

/**
 * Options for applying a chromatic aberration effect to an image.
 */
export interface ChromaticAberrationOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of shift for the chromatic aberration. */
  shift?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a color halftone effect to an image.
 */
export interface ColorHalftone {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The X coordinate of the center of the effect. */
  centerX?: number;
  /** The Y coordinate of the center of the effect. */
  centerY?: number;
  /** The angle of the halftone pattern. */
  angle?: number;
  /** The size of the halftone dots. */
  size?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a color offset effect to an image.
 */
export interface ColorOffsetOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The red channel offset. */
  red?: number;
  /** The green channel offset. */
  green?: number;
  /** The blue channel offset. */
  blue?: number;
  /** The alpha channel offset. */
  alpha?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for adjusting the contrast of an image.
 */
export interface ContrastOptions {
  /** The image to adjust. */
  image: MemoryImage;
  /** The contrast adjustment value. */
  contrast: number;
  /** The mode of contrast adjustment. */
  mode?: ContrastMode;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a convolution filter to an image.
 */
export interface ConvolutionOptions {
  /** The image to apply the filter to. */
  image: MemoryImage;
  /** The convolution filter to apply. */
  filter: number[];
  /** The divisor for the filter. */
  div?: number;
  /** The offset for the filter. */
  offset?: number;
  /** The amount of the filter to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for copying image channels.
 */
export interface CopyImageChannelsOptions {
  /** The image to copy channels from. */
  image: MemoryImage;
  /** The image to copy channels to. */
  from: MemoryImage;
  /** Whether to scale the copied channels. */
  scaled?: boolean;
  /** The red channel to copy. */
  red?: Channel;
  /** The green channel to copy. */
  green?: Channel;
  /** The blue channel to copy. */
  blue?: Channel;
  /** The alpha channel to copy. */
  alpha?: Channel;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for dithering an image.
 */
export interface DitherImageOptions {
  /** The image to dither. */
  image: MemoryImage;
  /** The quantizer to use for dithering. */
  quantizer?: Quantizer;
  /** The dithering kernel to use. */
  kernel?: DitherKernel;
  /** Whether to use serpentine dithering. */
  serpentine?: boolean;
}

/**
 * Options for applying a dot screen effect to an image.
 */
export interface DotScreenOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The angle of the dot screen pattern. */
  angle?: number;
  /** The size of the dots. */
  size?: number;
  /** The X coordinate of the center of the effect. */
  centerX?: number;
  /** The Y coordinate of the center of the effect. */
  centerY?: number;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a drop shadow to an image.
 */
export interface DropShadowOptions {
  /** The image to apply the shadow to. */
  image: MemoryImage;
  /** The horizontal shadow offset. */
  hShadow: number;
  /** The vertical shadow offset. */
  vShadow: number;
  /** The blur radius of the shadow. */
  blur: number;
  /** The color of the shadow. */
  shadowColor?: Color;
}

/**
 * Options for applying an edge glow effect to an image.
 */
export interface EdgeGlowOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying an emboss effect to an image.
 */
export interface EmbossOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for adjusting the gamma of an image.
 */
export interface GammaOptions {
  /** The image to adjust. */
  image: MemoryImage;
  /** The gamma adjustment value. */
  gamma: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a Gaussian blur to an image.
 */
export interface GaussianBlurOptions {
  /** The image to blur. */
  image: MemoryImage;
  /** The radius of the blur. */
  radius: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for converting an image to grayscale.
 */
export interface GrayscaleOptions {
  /** The image to convert. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for converting an HDR image to LDR.
 */
export interface HdrToLdrOptions {
  /** The image to convert. */
  image: MemoryImage;
  /** The exposure adjustment value. */
  exposure?: number;
}

/**
 * Options for applying a hexagon pixelate effect to an image.
 */
export interface HexagonPixelateOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The X coordinate of the center of the effect. */
  centerX?: number;
  /** The Y coordinate of the center of the effect. */
  centerY?: number;
  /** The size of the hexagons. */
  size?: number;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for inverting the colors of an image.
 */
export interface InvertOptions {
  /** The image to invert. */
  image: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a luminance threshold effect to an image.
 */
export interface LuminanceThresholdOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The luminance threshold value. */
  threshold?: number;
  /** Whether to output the result as a color image. */
  outputColor?: boolean;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for converting an image to monochrome.
 */
export interface MonochromeOptions {
  /** The image to convert. */
  image: MemoryImage;
  /** The color to use for the monochrome conversion. */
  color?: Color;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for adding noise to an image.
 */
export interface NoiseOptions {
  /** The image to add noise to. */
  image: MemoryImage;
  /** The sigma value for the noise. */
  sigma: number;
  /** The type of noise to add. */
  type?: NoiseType;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for normalizing the colors of an image.
 */
export interface NormalizeOptions {
  /** The image to normalize. */
  image: MemoryImage;
  /** The minimum value for normalization. */
  min: number;
  /** The maximum value for normalization. */
  max: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a pixelate effect to an image.
 */
export interface PixelateOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The size of the pixels. */
  size: number;
  /** The mode of pixelation. */
  mode?: PixelateMode;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for quantizing the colors of an image.
 */
export interface QuantizeOptions {
  /** The image to quantize. */
  image: MemoryImage;
  /** The number of colors to quantize to. */
  numberOfColors?: number;
  /** The method of quantization. */
  method?: QuantizeMethod;
  /** The dithering kernel to use. */
  dither?: DitherKernel;
  /** Whether to use serpentine dithering. */
  ditherSerpentine?: boolean;
}

/**
 * Options for applying a Reinhard tone mapping to an image.
 */
export interface ReinhardToneMapOptions {
  /** The image to apply the tone mapping to. */
  image: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for remapping the colors of an image.
 */
export interface RemapColorsOptions {
  /** The image to remap the colors of. */
  image: MemoryImage;
  /** The red channel to remap. */
  red?: Channel;
  /** The green channel to remap. */
  green?: Channel;
  /** The blue channel to remap. */
  blue?: Channel;
  /** The alpha channel to remap. */
  alpha?: Channel;
}

/**
 * Options for scaling the RGBA values of an image.
 */
export interface ScaleRgbaOptions {
  /** The image to scale. */
  image: MemoryImage;
  /** The scale factor for the colors. */
  scale: Color;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a separable convolution filter to an image.
 */
export interface SeparableConvolutionOptions {
  /** The image to apply the filter to. */
  image: MemoryImage;
  /** The separable kernel to use for the filter. */
  kernel: SeparableKernel;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a sepia effect to an image.
 */
export interface SepiaOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a sketch effect to an image.
 */
export interface SketchOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for smoothing an image.
 */
export interface SmoothOptions {
  /** The image to smooth. */
  image: MemoryImage;
  /** The weight of the smoothing effect. */
  weight: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a Sobel filter to an image.
 */
export interface SobelOptions {
  /** The image to apply the filter to. */
  image: MemoryImage;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a solarize effect to an image.
 */
export interface SolarizeOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The threshold for the solarize effect. */
  threshold: number;
  /** The mode of the solarize effect. */
  mode?: SolarizeMode;
}

/**
 * Options for applying a stretch distortion effect to an image.
 */
export interface StretchDistortionOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The X coordinate of the center of the effect. */
  centerX?: number;
  /** The Y coordinate of the center of the effect. */
  centerY?: number;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for applying a vignette effect to an image.
 */
export interface VignetteOptions {
  /** The image to apply the effect to. */
  image: MemoryImage;
  /** The start radius of the vignette. */
  start?: number;
  /** The end radius of the vignette. */
  end?: number;
  /** The amount of the effect to apply. */
  amount?: number;
  /** The color of the vignette. */
  color?: Color;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

export abstract class Filter {
  /**
   * Cache for contrast values.
   * @private
   */
  private static _contrastCache?: ContrastCache;

  /**
   * Cache for Gaussian kernels, mapped by a number.
   * @private
   */
  private static readonly _gaussianKernelCache: Map<number, SeparableKernel> =
    new Map<number, SeparableKernel>();

  /**
   * Adjust the color of the image using various color transformations.
   *
   * @param {AdjustColorOptions} opt - The options for adjusting the color of the image.
   * @param {MemoryImage} opt.image - The image to be adjusted.
   * @param {MemoryImage} [opt.mask] - The mask to be applied to the image.
   * @param {Channel} [opt.maskChannel] - The channel of the mask to be used.
   * @param {Color} [opt.blacks] - The black level of the image, as a color.
   * @param {Color} [opt.whites] - The white level of the image, as a color.
   * @param {Color} [opt.mids] - The mid level of the image, as a color.
   * @param {number} [opt.contrast] - The contrast adjustment factor.
   * @param {number} [opt.saturation] - The saturation adjustment factor.
   * @param {number} [opt.brightness] - The brightness adjustment factor.
   * @param {number} [opt.gamma] - The gamma adjustment factor.
   * @param {number} [opt.exposure] - The exposure adjustment factor.
   * @param {number} [opt.hue] - The hue adjustment factor.
   * @param {number} [opt.amount] - The amount of effect to apply.
   * @returns {MemoryImage} The adjusted image.
   */
  public static adjustColor(opt: AdjustColorOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    const contrast =
      opt.contrast !== undefined
        ? MathUtils.clamp(opt.contrast, 0, 2)
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

    if (amount === 0) {
      return opt.image;
    }

    const avgLumR = 0.5;
    const avgLumG = 0.5;
    const avgLumB = 0.5;

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

    const invContrast = contrast !== undefined ? 1 - contrast : 0;

    if (exposure !== undefined) {
      exposure = Math.pow(2, exposure);
    }

    const hsv: number[] = [0, 0, 0];

    for (const frame of image.frames) {
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

        if (opt.saturation !== undefined || opt.hue !== undefined) {
          ColorUtils.rgbToHsv(r, g, b, hsv);
          hsv[0] += opt.hue ?? 0;
          hsv[1] *= opt.saturation ?? 1;
          ColorUtils.hsvToRgb(hsv[0], hsv[1], hsv[2], hsv);
          r = hsv[0];
          g = hsv[1];
          b = hsv[2];
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

        const msk =
          opt.mask?.getPixel(p.x, p.y).getChannelNormalized(maskChannel) ?? 1;
        const blend = msk * amount;

        r = MathUtils.mix(or, r, blend);
        g = MathUtils.mix(og, g, blend);
        b = MathUtils.mix(ob, b, blend);

        p.rNormalized = MathUtils.clamp(r, 0, 1);
        p.gNormalized = MathUtils.clamp(g, 0, 1);
        p.bNormalized = MathUtils.clamp(b, 0, 1);
      }
    }

    return image;
  }

  /**
   * Apply the billboard filter to the image.
   *
   * @param {BillboardOptions} opt - Options for the billboard filter.
   * @param {MemoryImage} opt.image - The image to apply the filter to.
   * @param {number} [opt.grid=10] - The size of the grid for the billboard effect.
   * @param {number} [opt.amount=1] - The amount of the billboard effect.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect.
   * @returns {MemoryImage} The image with the billboard filter applied.
   */
  public static billboard(opt: BillboardOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const grid = opt.grid ?? 10;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    // Math.pow(0.45, 2);
    const rs = 0.2025;

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Applies a bleach bypass effect to the given image.
   *
   * @param {BleachBypassOptions} opt - The options for the bleach bypass effect.
   * @param {MemoryImage} opt.image - The image to apply the effect to.
   * @param {number} [opt.amount=1] - The amount of the effect to apply.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel of the mask to use.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect.
   * @returns {MemoryImage} The image with the bleach bypass effect applied.
   */
  public static bleachBypass(opt: BleachBypassOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const luminanceR = 0.2125;
    const luminanceG = 0.7154;
    const luminanceB = 0.0721;
    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Applies a bulge distortion effect to the given image.
   *
   * @param {BulgeDistortionOptions} opt - The options for the bulge distortion effect.
   * @param {MemoryImage} opt.image - The image to apply the effect to.
   * @param {number} [opt.scale=0.5] - The scale of the bulge effect.
   * @param {Interpolation} [opt.interpolation=Interpolation.nearest] - The interpolation method to use.
   * @param {number} [opt.centerX] - The x-coordinate of the center of the bulge.
   * @param {number} [opt.centerY] - The y-coordinate of the center of the bulge.
   * @param {number} [opt.radius] - The radius of the bulge effect.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel of the mask to use.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect.
   * @returns {MemoryImage} The image with the bulge distortion effect applied.
   */
  public static bulgeDistortion(opt: BulgeDistortionOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const scale = opt.scale ?? 0.5;
    const interpolation = opt.interpolation ?? Interpolation.nearest;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Generate a normal map from a heightfield bump image.
   *
   * The red channel of the **image** is used as an input, 0 represents a low
   * height and 1 a high value. The optional **strength** parameter allows to set
   * the strength of the normal image.
   *
   * @param {BumpToNormalOptions} opt - The options for generating the normal map.
   * @param {MemoryImage} opt.image - The image from which to generate the normal map.
   * @param {number} [opt.strength=2] - The strength of the normal image.
   * @returns {MemoryImage} The generated normal map as a MemoryImage.
   */
  public static bumpToNormal(opt: BumpToNormalOptions): MemoryImage {
    const strength = opt.strength ?? 2;

    const dest = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : MemoryImage.from(opt.image);

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
   *
   * @param {ChromaticAberrationOptions} opt - Options for the chromatic aberration filter.
   * @param {MemoryImage} opt.image - The image to apply the filter to.
   * @param {number} [opt.shift=5] - The amount of shift for the chromatic aberration effect. Default is 5.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask. Default is Channel.luminance.
   * @param {MemoryImage} [opt.mask] - The mask image to control the effect.
   * @returns {MemoryImage} The image with the chromatic aberration filter applied.
   */
  public static chromaticAberration(
    opt: ChromaticAberrationOptions
  ): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const shift = opt.shift ?? 5;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Apply color halftone filter to the image.
   *
   * @param {ColorHalftone} opt - The options for the color halftone filter.
   * @param {MemoryImage} opt.image - The image to apply the filter to.
   * @param {number} [opt.amount=1] - The amount of the effect to apply, default is 1.
   * @param {number} [opt.angle=1] - The angle of the halftone pattern, default is 1.
   * @param {number} [opt.size=5] - The size of the halftone dots, default is 5.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask, default is luminance.
   * @param {number} [opt.centerX] - The x-coordinate of the center of the halftone pattern, default is the image center.
   * @param {number} [opt.centerY] - The y-coordinate of the center of the halftone pattern, default is the image center.
   * @param {Mask} [opt.mask] - Optional mask to apply the effect selectively.
   * @returns {MemoryImage} The image with the color halftone filter applied.
   */
  public static colorHalftone(opt: ColorHalftone): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
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

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Add the red, green, blue, and alpha values to the image colors,
   * applying a per-channel brightness adjustment.
   *
   * @param {ColorOffsetOptions} opt - Options for color offset.
   * @param {MemoryImage} opt.image - The image to be processed.
   * @param {number} [opt.red] - The red channel offset value.
   * @param {number} [opt.green] - The green channel offset value.
   * @param {number} [opt.blue] - The blue channel offset value.
   * @param {number} [opt.alpha] - The alpha channel offset value.
   * @param {MemoryImage} [opt.mask] - The mask image to be used for selective offset.
   * @param {Channel} [opt.maskChannel] - The channel of the mask image to be used.
   * @returns {MemoryImage} The processed image with color offsets applied.
   */
  public static colorOffset(opt: ColorOffsetOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const red = opt.red ?? 0;
    const green = opt.green ?? 0;
    const blue = opt.blue ?? 0;
    const alpha = opt.alpha ?? 0;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Set the contrast level for the image.
   *
   * @param {ContrastOptions} opt - The options for contrast adjustment.
   * @param {MemoryImage} opt.image - The image to be processed.
   * @param {number} opt.contrast - The contrast level to be applied.
   * @param {MemoryImage} [opt.mask] - Optional mask image.
   * @param {Channel} [opt.maskChannel] - Optional mask channel.
   * @param {ContrastMode} [opt.mode] - Optional contrast mode.
   * @returns {MemoryImage} The processed image with adjusted contrast.
   */
  public static contrast(opt: ContrastOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    const mode = opt.mode ?? ContrastMode.proportional;

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

      if (mode === ContrastMode.proportional) {
        const c = (opt.contrast * opt.contrast) / 10000;
        for (let i = 0; i < 256; ++i) {
          Filter._contrastCache.contrast[i] = MathUtils.clampInt255(
            ((i / 255 - 0.5) * c + 0.5) * 255
          );
        }
      } else {
        /// 0.12 is an arbitrary adjustment to use 100 as mid point
        const c = opt.contrast / 100 - 0.12;
        for (let i = 0; i < 256; ++i) {
          Filter._contrastCache.contrast[i] = MathUtils.clampInt255(
            ((Math.tan((i / 128 - 1) * c) + 1) / 2) * 255
          );
        }
      }
    }

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Apply a 3x3 convolution filter to the image. The filter should be a
   * list of 9 numbers.
   *
   * The rgb channels will be divided by div and add offset, allowing
   * filters to normalize and offset the filtered pixel value.
   *
   * @param {ConvolutionOptions} opt - The options for the convolution filter.
   * @param {MemoryImage} opt.image - The image to which the convolution filter will be applied.
   * @param {number[]} opt.filter - A list of 9 numbers representing the 3x3 convolution filter.
   * @param {number} [opt.div=1] - The divisor for the rgb channels. Default is 1.
   * @param {number} [opt.offset=0] - The offset to add to the rgb channels. Default is 0.
   * @param {number} [opt.amount=1] - The amount to apply the filter. Default is 1.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The mask channel to use. Default is Channel.luminance.
   * @param {MemoryImage} [opt.mask] - Optional mask image.
   * @returns {MemoryImage} The image after applying the convolution filter.
   */
  public static convolution(opt: ConvolutionOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const div = opt.div ?? 1;
    const offset = opt.offset ?? 0;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const tmp = MemoryImage.from(image);
    for (const frame of image.frames) {
      const tmpFrame = tmp.frames[frame.frameIndex];
      for (const c of tmpFrame) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let j = 0, fi = 0; j < 3; ++j) {
          const yv = Math.min(Math.max(c.y - 1 + j, 0), image.height - 1);
          for (let i = 0; i < 3; ++i, ++fi) {
            const xv = Math.min(Math.max(c.x - 1 + i, 0), image.width - 1);
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

    return image;
  }

  /**
   * Copy channels from the **from** image to the **image**. If **scaled** is
   * true, then the **from** image will be scaled to the **image** resolution.
   *
   * @param {CopyImageChannelsOptions} opt - The options for copying image channels.
   * @param {MemoryImage} opt.image - The target image to copy channels to.
   * @param {MemoryImage} opt.from - The source image to copy channels from.
   * @param {boolean} [opt.scaled] - Whether the source image should be scaled to the target image resolution.
   * @param {Channel} [opt.maskChannel] - The channel to use for masking.
   * @param {number} [opt.red] - The red channel index to copy from the source image.
   * @param {number} [opt.green] - The green channel index to copy from the source image.
   * @param {number} [opt.blue] - The blue channel index to copy from the source image.
   * @param {number} [opt.alpha] - The alpha channel index to copy from the source image.
   * @param {MemoryImage} [opt.mask] - An optional mask image.
   *
   * @returns {MemoryImage} The modified target image with copied channels.
   */
  public static copyImageChannels(opt: CopyImageChannelsOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const scaled = opt.scaled ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const dx = opt.from.width / image.width;
    const dy = opt.from.height / image.height;
    const fromPixel = opt.from.getPixel(0, 0);
    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Dither an image to reduce banding patterns when reducing the number of
   * colors.
   * Derived from http://jsbin.com/iXofIji/2/edit
   *
   * @param {DitherImageOptions} opt - Options for dithering the image
   * @param {MemoryImage} opt.image - The image to be dithered
   * @param {Quantizer} [opt.quantizer] - Optional quantizer to use
   * @param {DitherKernel} [opt.kernel] - Optional dithering kernel to use
   * @param {boolean} [opt.serpentine] - Optional flag to use serpentine scanning
   * @returns {MemoryImage} The dithered image
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

    const imageCopy = opt.image.clone();
    for (let y = 0; y < height; y++) {
      if (serpentine) {
        direction *= -1;
      }

      const x0 = direction === 1 ? 0 : width - 1;
      const x1 = direction === 1 ? width : 0;
      for (let x = x0; x !== x1; x += direction) {
        // Get original color
        const pc = imageCopy.getPixel(x, y);
        const r1 = Math.trunc(pc.getChannel(0));
        const g1 = Math.trunc(pc.getChannel(1));
        const b1 = Math.trunc(pc.getChannel(2));

        // Get converted color
        const idx = quantizer.getColorIndexRgb(r1, g1, b1);
        indexedImage.setPixelIndex(x, y, idx);

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
            const nx = x + x1;
            const ny = y + y1;
            const p2 = imageCopy.getPixel(nx, ny);
            p2.r += er * d;
            p2.g += eg * d;
            p2.b += eb * d;
          }
        }
      }
    }

    return indexedImage;
  }

  /**
   * Apply the dot screen filter to the image.
   *
   * @param {DotScreenOptions} opt - The options for the dot screen filter.
   * @param {MemoryImage} opt.image - The image to apply the filter to.
   * @param {number} [opt.size=5.75] - The size of the dot pattern. Default is 5.75.
   * @param {number} [opt.amount=1] - The amount of the effect to apply. Default is 1.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use as a mask. Default is Channel.luminance.
   * @param {number} [opt.angle=180] - The angle of the dot pattern in degrees. Default is 180.
   * @param {number} [opt.centerX] - The X coordinate of the center of the dot pattern. Default is the center of the image.
   * @param {number} [opt.centerY] - The Y coordinate of the center of the dot pattern. Default is the center of the image.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect.
   * @returns {MemoryImage} The image with the dot screen filter applied.
   */
  public static dotScreen(opt: DotScreenOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const size = opt.size ?? 5.75;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    let angle = opt.angle ?? 180;
    angle *= 0.0174533;
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Create a drop-shadow effect for the image.
   *
   * @param {DropShadowOptions} opt - Options for the drop shadow effect.
   * @param {MemoryImage} opt.image - The image to which the drop shadow will be applied.
   * @param {number} opt.hShadow - The horizontal shadow offset.
   * @param {number} opt.vShadow - The vertical shadow offset.
   * @param {number} opt.blur - The blur radius for the shadow.
   * @param {ColorRgba8} opt.shadowColor - The color of the shadow.
   * @returns {MemoryImage} A new image with the drop shadow effect applied.
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
   *
   * @param {EdgeGlowOptions} opt - Options for the edge glow filter.
   * @param {MemoryImage} opt.image - The image to which the filter will be applied.
   * @param {number} [opt.amount=1] - The amount of edge glow to apply. Default is 1.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask. Default is luminance.
   * @param {MemoryImage} [opt.mask] - Optional mask image to control the effect.
   * @returns {MemoryImage} The image with the edge glow filter applied.
   */
  public static edgeGlow(opt: EdgeGlowOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Apply an emboss convolution filter.
   *
   * @param {EmbossOptions} opt - Options for the emboss filter.
   * @param {MemoryImage} opt.image - The image to apply the emboss filter to.
   * @param {number} [opt.amount=1] - The amount of embossing to apply.
   * @param {MemoryImage} [opt.mask] - The mask to apply to the image.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask.
   * @returns {MemoryImage} - The image with the emboss filter applied.
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
   * Apply gamma scaling to an image.
   *
   * @param {GammaOptions} opt - The options for the gamma function.
   * @param {MemoryImage} opt.image - The image to apply gamma scaling to.
   * @param {number} opt.gamma - The gamma value to use for scaling.
   * @param {MemoryImage} [opt.mask] - Optional mask image to apply selective gamma scaling.
   * @param {Channel} [opt.maskChannel] - Optional channel to use from the mask image. Defaults to luminance.
   * @returns {MemoryImage} The image with gamma scaling applied.
   */
  public static gamma(opt: GammaOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Apply gaussian blur to the image. The radius determines how many pixels
   * away from the current pixel should contribute to the blur, where 0 is no
   * blur and the larger the radius, the stronger the blur.
   *
   * @param {GaussianBlurOptions} opt - Options for the Gaussian blur operation.
   * @param {MemoryImage} opt.image - The image to which the blur will be applied.
   * @param {number} opt.radius - The radius of the blur effect.
   * @param {MemoryImage} [opt.mask] - Optional mask to apply the blur selectively.
   * @param {Channel} [opt.maskChannel] - Optional channel to use for the mask.
   * @returns {MemoryImage} The blurred image.
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
   *
   * @param {GrayscaleOptions} opt - Options for the grayscale conversion.
   * @param {MemoryImage} opt.image - The image to be converted.
   * @param {number} [opt.amount=1] - The amount of grayscale effect to apply, where 1 is full grayscale.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for masking.
   * @param {Mask} [opt.mask] - An optional mask to apply the grayscale effect selectively.
   * @returns {MemoryImage} The grayscale image.
   */
  public static grayscale(opt: GrayscaleOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Convert a high dynamic range image to a low dynamic range image,
   * with optional exposure control.
   *
   * @param {HdrToLdrOptions} opt The options for the conversion.
   * @param {MemoryImage} opt.image The image to be converted.
   * @param {number} [opt.exposure] The exposure level for the conversion.
   * @returns {MemoryImage} The converted low dynamic range image.
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
   * @param {HexagonPixelateOptions} opt - Options for the hexagon pixelate filter.
   * @param {MemoryImage} opt.image - The image to apply the filter to.
   * @param {number} [opt.size=5] - The size of the hexagons. Default is 5.
   * @param {number} [opt.amount=1] - The amount of the effect. Default is 1.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for masking. Default is luminance.
   * @param {MemoryImage} [opt.mask] - The mask image.
   * @param {number} [opt.centerX] - The X coordinate of the center. Default is the center of the image.
   * @param {number} [opt.centerY] - The Y coordinate of the center. Default is the center of the image.
   * @returns {MemoryImage} The image with the hexagon pixelate filter applied.
   */
  public static hexagonPixelate(opt: HexagonPixelateOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const size = opt.size ?? 5;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Invert the colors of the **image**.
   *
   * @param {InvertOptions} opt - Options for the invert operation.
   * @param {MemoryImage} opt.image - The image to be processed.
   * @param {MemoryImage} [opt.mask] - Optional mask image to apply selective inversion.
   * @param {Channel} [opt.maskChannel] - Optional channel to use for masking. Defaults to luminance.
   * @returns {MemoryImage} The image with inverted colors.
   */
  public static invert(opt: InvertOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const max = image.maxChannelValue;
    for (const frame of image.frames) {
      if (image.hasPalette) {
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
    return image;
  }

  /**
   * Applies a luminance threshold to an image.
   *
   * @param {LuminanceThresholdOptions} opt - Options for the luminance threshold operation.
   * @param {MemoryImage} opt.image - The image to be processed.
   * @param {number} [opt.threshold=0.5] - The luminance threshold value (default is 0.5).
   * @param {boolean} [opt.outputColor=false] - Whether to output in color (default is false).
   * @param {number} [opt.amount=1] - The amount of the effect to apply (default is 1).
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel of the mask to use (default is Channel.luminance).
   *
   * @returns {MemoryImage} The processed image.
   */
  public static luminanceThreshold(
    opt: LuminanceThresholdOptions
  ): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const threshold = opt.threshold ?? 0.5;
    const outputColor = opt.outputColor ?? false;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Apply the monochrome filter to the **image**.
   *
   * @param {MonochromeOptions} opt - Options for the monochrome filter.
   * @param {MemoryImage} opt.image - The image to which the filter will be applied.
   * @param {number} [opt.amount] - Controls the strength of the effect, in the range [0, 1]. Defaults to 1.
   * @param {Channel} [opt.maskChannel] - The channel to use for the mask. Defaults to Channel.luminance.
   * @param {Object} [opt.color] - The color to use for the monochrome effect.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect's application.
   * @returns {MemoryImage} The image with the monochrome filter applied.
   */
  public static monochrome(opt: MonochromeOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    const nr = opt.color?.rNormalized ?? 0.45;
    const ng = opt.color?.gNormalized ?? 0.6;
    const nb = opt.color?.bNormalized ?? 0.3;

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Add random noise to pixel values.
   * @param {NoiseOptions} opt - The options for adding noise.
   * @param {MemoryImage} opt.image - The image to which noise will be added.
   * @param {NoiseType} [opt.type] - The type of noise to add.
   * @param {number} [opt.sigma] - The standard deviation of the noise.
   * @param {MemoryImage} [opt.mask] - The mask image to control where noise is applied.
   * @param {Channel} [opt.maskChannel] - The channel of the mask image to use.
   * @returns {MemoryImage} The image with added noise.
   */
  public static noise(opt: NoiseOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const type = opt.type ?? NoiseType.gaussian;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    let nSigma = opt.sigma;
    let min = 0;
    let max = 0;

    if (nSigma === 0 && type !== NoiseType.poisson) {
      return opt.image;
    }

    if (nSigma < 0 || type === NoiseType.saltAndPepper) {
      const extremes = image.getColorExtremes();
      min = extremes.min;
      max = extremes.max;
    }

    if (nSigma < 0) {
      nSigma = (-nSigma * (max - min)) / 100.0;
    }

    for (const frame of image.frames) {
      switch (type) {
        case NoiseType.gaussian:
          for (const p of frame) {
            const r = MathUtils.clamp(
              p.r + nSigma * RandomUtils.grand(),
              0,
              p.maxChannelValue
            );
            const g = MathUtils.clamp(
              p.g + nSigma * RandomUtils.grand(),
              0,
              p.maxChannelValue
            );
            const b = MathUtils.clamp(
              p.b + nSigma * RandomUtils.grand(),
              0,
              p.maxChannelValue
            );
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
            const r = MathUtils.clamp(
              p.r + nSigma * RandomUtils.crand(),
              0,
              p.maxChannelValue
            );
            const g = MathUtils.clamp(
              p.g + nSigma * RandomUtils.crand(),
              0,
              p.maxChannelValue
            );
            const b = MathUtils.clamp(
              p.b + nSigma * RandomUtils.crand(),
              0,
              p.maxChannelValue
            );
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
              const r = MathUtils.clamp(
                Math.random() < 0.5 ? max : min,
                0,
                p.maxChannelValue
              );
              const g = MathUtils.clamp(
                Math.random() < 0.5 ? max : min,
                0,
                p.maxChannelValue
              );
              const b = MathUtils.clamp(
                Math.random() < 0.5 ? max : min,
                0,
                p.maxChannelValue
              );
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
            const r = MathUtils.clamp(
              RandomUtils.prand(p.r),
              0,
              p.maxChannelValue
            );
            const g = MathUtils.clamp(
              RandomUtils.prand(p.g),
              0,
              p.maxChannelValue
            );
            const b = MathUtils.clamp(
              RandomUtils.prand(p.b),
              0,
              p.maxChannelValue
            );
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
            const r = MathUtils.clamp(Math.trunc(val), 0, p.maxChannelValue);

            val0 = p.g / sqrt2;
            re = val0 + nSigma * RandomUtils.grand();
            im = val0 + nSigma * RandomUtils.grand();
            val = Math.sqrt(re * re + im * im);
            const g = MathUtils.clamp(Math.trunc(val), 0, p.maxChannelValue);

            val0 = p.b / sqrt2;
            re = val0 + nSigma * RandomUtils.grand();
            im = val0 + nSigma * RandomUtils.grand();
            val = Math.sqrt(re * re + im * im);
            const b = MathUtils.clamp(Math.trunc(val), 0, p.maxChannelValue);

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

    return image;
  }

  /**
   * Linearly normalize the colors of the image. All color values will be mapped
   * to the range **min**, **max** inclusive.
   *
   * @param {NormalizeOptions} opt - The options for normalization.
   * @param {MemoryImage} opt.image - The image to be normalized.
   * @param {number} opt.min - The minimum value for normalization.
   * @param {number} opt.max - The maximum value for normalization.
   * @param {MemoryImage} [opt.mask] - Optional mask image.
   * @param {Channel} [opt.maskChannel] - Optional mask channel.
   * @returns {MemoryImage} The normalized image.
   */
  public static normalize(opt: NormalizeOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const a = opt.min < opt.max ? opt.min : opt.max;
    const b = opt.min < opt.max ? opt.max : opt.min;

    const extremes = image.getColorExtremes();
    const mn = extremes.min;
    const mx = extremes.max;

    if (mn === mx) {
      return opt.image;
    }

    const fm = mn;
    const fM = mx;

    if (mn !== a || mx !== b) {
      for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Pixelate the image.
   *
   * @param {PixelateOptions} opt - The options for pixelation.
   * @param {MemoryImage} opt.image - The image to be pixelated.
   * @param {number} opt.size - The size of the pixelated blocks.
   * @param {PixelateMode} opt.mode - The mode of pixelation, either 'upperLeft' or 'average'.
   * @param {number} opt.amount - The amount of pixelation to apply.
   * @param {Channel} opt.maskChannel - The mask channel to use for pixelation.
   * @param {MemoryImage} [opt.mask] - An optional mask image.
   * @returns {MemoryImage} The pixelated image.
   */
  public static pixelate(opt: PixelateOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const mode = opt.mode ?? PixelateMode.upperLeft;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.size <= 1) {
      return opt.image;
    }

    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Quantize the number of colors in image to 256.
   * @param {QuantizeOptions} opt - Options for quantization.
   * @param {MemoryImage} opt.image - The image to be quantized.
   * @param {number} [opt.numberOfColors=256] - The number of colors to reduce the image to. Default is 256.
   * @param {QuantizeMethod} [opt.method=QuantizeMethod.neuralNet] - The method to use for quantization. Default is QuantizeMethod.neuralNet.
   * @param {DitherKernel} [opt.dither=DitherKernel.none] - The dithering kernel to use. Default is DitherKernel.none.
   * @param {boolean} [opt.ditherSerpentine=false] - Whether to use serpentine dithering. Default is false.
   * @returns {MemoryImage} The quantized image.
   */
  public static quantize(opt: QuantizeOptions): MemoryImage {
    const numberOfColors = opt.numberOfColors ?? 256;
    const method = opt.method ?? QuantizeMethod.neuralNet;
    const dither = opt.dither ?? DitherKernel.none;
    const ditherSerpentine = opt.ditherSerpentine ?? false;

    let quantizer: Quantizer | undefined = undefined;
    if (method === QuantizeMethod.octree || numberOfColors < 4) {
      quantizer = new OctreeQuantizer(opt.image, numberOfColors);
    } else if (method === QuantizeMethod.neuralNet) {
      quantizer = new NeuralQuantizer(opt.image, numberOfColors);
    } else {
      quantizer = new BinaryQuantizer();
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
   *
   * @param {ReinhardToneMapOptions} opt - Options for Reinhard tone mapping.
   * @param {MemoryImage} opt.image - The HDR image to be tone mapped.
   * @param {MemoryImage} [opt.mask] - Optional mask image for selective tone mapping.
   * @param {Channel} [opt.maskChannel] - Optional channel to use from the mask image.
   * @returns {MemoryImage} The tone-mapped image.
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
   *
   * **red**, **green**, **blue** and **alpha** should be set to one of the following:
   * _Channel.red_, _Channel.green_, _Channel.blue_, _Channel.alpha_, or
   * _Channel.luminance_.
   *
   * @param {RemapColorsOptions} opt - The options for remapping colors.
   * @param {MemoryImage} opt.image - The image to be processed.
   * @param {Channel} opt.red - The channel to map to red.
   * @param {Channel} opt.green - The channel to map to green.
   * @param {Channel} opt.blue - The channel to map to blue.
   * @param {Channel} opt.alpha - The channel to map to alpha.
   * @returns {MemoryImage} The image with remapped color channels.
   */
  public static remapColors(opt: RemapColorsOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const red = opt.red ?? Channel.red;
    const green = opt.green ?? Channel.green;
    const blue = opt.blue ?? Channel.blue;
    const alpha = opt.alpha ?? Channel.alpha;

    const l: number[] = [0, 0, 0, 0, 0];
    for (const frame of image.frames) {
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
    return image;
  }

  /**
   * Scales the RGBA values of an image.
   *
   * @param {ScaleRgbaOptions} opt - The options for scaling RGBA values.
   * @param {MemoryImage} opt.image - The image to be scaled.
   * @param {Channel} [opt.maskChannel] - The channel to be used as a mask. Defaults to luminance.
   * @param {Scale} opt.scale - The scale factors for each channel.
   * @param {Mask} [opt.mask] - An optional mask image.
   *
   * @returns {MemoryImage} The scaled image.
   */
  public static scaleRgba(opt: ScaleRgbaOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const dr = opt.scale.rNormalized;
    const dg = opt.scale.gNormalized;
    const db = opt.scale.bNormalized;
    const da = opt.scale.aNormalized;
    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Apply a generic separable convolution filter to the **image**, using the
   * given **kernel**.
   *
   * **gaussianBlur** is an example of such a filter.
   *
   * @param {SeparableConvolutionOptions} opt - Options for the separable convolution operation.
   * @param {MemoryImage} opt.image - The image to which the convolution filter will be applied.
   * @param {Kernel} opt.kernel - The kernel to be used for the convolution filter.
   * @param {Channel} [opt.maskChannel] - The channel to be used as a mask. Defaults to luminance if not provided.
   * @param {MemoryImage} [opt.mask] - An optional mask to be applied during the convolution.
   * @returns {MemoryImage} The image after applying the separable convolution filter.
   */
  public static separableConvolution(
    opt: SeparableConvolutionOptions
  ): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const tmp = MemoryImage.from(image);

    // Apply the filter horizontally
    opt.kernel.apply({
      src: image,
      dst: tmp,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    // Apply the filter vertically, applying back to the original image.
    opt.kernel.apply({
      src: tmp,
      dst: image,
      horizontal: false,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    return image;
  }

  /**
   * Apply sepia tone to the **image**.
   *
   * @param {SepiaOptions} opt - Options for the sepia effect.
   * @param {MemoryImage} opt.image - The image to which the sepia effect will be applied.
   * @param {number} opt.amount - The strength of the sepia effect, in the range [0, 1].
   * @param {MemoryImage} [opt.mask] - The mask image used to control the application of the sepia effect.
   * @param {Channel} [opt.maskChannel] - The channel of the mask image to use.
   * @returns {MemoryImage} The image with the sepia effect applied.
   */
  public static sepia(opt: SepiaOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Apply sketch filter to the image.
   *
   * @param {SketchOptions} opt - The options for the sketch filter.
   * @param {MemoryImage} opt.image - The image to which the sketch filter will be applied.
   * @param {number} opt.amount - The strength of the effect, in the range [0, 1].
   * @param {MemoryImage} [opt.mask] - The mask image to control the effect application.
   * @param {Channel} [opt.maskChannel] - The channel to be used from the mask image.
   * @returns {MemoryImage} The image with the sketch filter applied.
   */
  public static sketch(opt: SketchOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Apply a smoothing convolution filter to the image.
   *
   * @param {SmoothOptions} opt - The options for the smoothing operation.
   * @param {MemoryImage} opt.image - The image to be processed.
   * @param {number} opt.weight - The weight of the current pixel being filtered. If it's greater than 1, it will make the image sharper.
   * @param {MemoryImage} [opt.mask] - Optional mask to apply during the filtering process.
   * @param {Channel} [opt.maskChannel] - Optional channel to use for the mask. Defaults to luminance if not provided.
   * @returns {MemoryImage} The processed image with the smoothing filter applied.
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
   *
   * @param {SobelOptions} opt - Options for the Sobel filter.
   * @param {MemoryImage} opt.image - The image to apply the Sobel filter to.
   * @param {number} [opt.amount=1] - The amount of the Sobel effect to apply. Default is 1.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for masking. Default is Channel.luminance.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the effect.
   * @returns {MemoryImage} The image with the Sobel filter applied.
   */
  public static sobel(opt: SobelOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const amount = opt.amount ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (amount === 0) {
      return opt.image;
    }

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Solarize the colors of the image.
   *
   * @param {SolarizeOptions} opt - Options for solarization.
   * @param {MemoryImage} opt.image - The image to be solarized.
   * @param {number} opt.threshold - The threshold value for solarization (1 to 254).
   * @param {SolarizeMode} opt.mode - The mode of solarization (highlights or shadows).
   * @returns {MemoryImage} The solarized image.
   */
  public static solarize(opt: SolarizeOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const mode = opt.mode ?? SolarizeMode.highlights;

    const max = image.maxChannelValue;
    const thresholdRange = Math.trunc(max * (opt.threshold / 255));
    for (const frame of image.frames) {
      if (image.hasPalette) {
        const p = frame.palette!;
        const numColors = p.numColors;
        for (let i = 0; i < numColors; ++i) {
          if (mode === SolarizeMode.highlights) {
            if (p.getGreen(i) > thresholdRange) {
              const r = max - p.getRed(i);
              const g = max - p.getGreen(i);
              const b = max - p.getBlue(i);
              p.setRgb(i, r, g, b);
            } else {
              const r = p.getRed(i);
              const g = p.getGreen(i);
              const b = p.getBlue(i);
              p.setRgb(i, r, g, b);
            }
          } else {
            if (p.getGreen(i) < thresholdRange) {
              const r = max - p.getRed(i);
              const g = max - p.getGreen(i);
              const b = max - p.getBlue(i);
              p.setRgb(i, r, g, b);
            } else {
              const r = p.getRed(i);
              const g = p.getGreen(i);
              const b = p.getBlue(i);
              p.setRgb(i, r, g, b);
            }
          }
        }
      } else {
        if (max !== 0) {
          for (const p of frame) {
            if (mode === SolarizeMode.highlights) {
              if (p.g > thresholdRange) {
                p.r = max - p.r;
                p.g = max - p.g;
                p.b = max - p.b;
              } else {
                // eslint-disable-next-line no-self-assign
                p.r = p.r;
                // eslint-disable-next-line no-self-assign
                p.g = p.g;
                // eslint-disable-next-line no-self-assign
                p.b = p.b;
              }
            } else {
              if (p.g < thresholdRange) {
                p.r = max - p.r;
                p.g = max - p.g;
                p.b = max - p.b;
              } else {
                // eslint-disable-next-line no-self-assign
                p.r = p.r;
                // eslint-disable-next-line no-self-assign
                p.g = p.g;
                // eslint-disable-next-line no-self-assign
                p.b = p.b;
              }
            }
          }
        }
      }
    }

    // max value and zero are used to improve contrast
    const a: number = 0;
    const b: number = max;

    const ext = image.getColorExtremes();

    if (ext.min === ext.max) {
      return image;
    }

    if (ext.min !== a || ext.max !== b) {
      for (const frame of image.frames) {
        for (const p of frame) {
          p.r = ((p.r - ext.min) / (ext.max - ext.min)) * (b - a) + a;
          p.g = ((p.g - ext.min) / (ext.max - ext.min)) * (b - a) + a;
          p.b = ((p.b - ext.min) / (ext.max - ext.min)) * (b - a) + a;
          p.a = ((p.a - ext.min) / (ext.max - ext.min)) * (b - a) + a;
        }
      }
    }

    return image;
  }

  /**
   * Applies a stretch distortion effect to the given image.
   *
   * @param {StretchDistortionOptions} opt - Options for the stretch distortion.
   * @param {MemoryImage} opt.image - The image to be distorted.
   * @param {Interpolation} [opt.interpolation] - The interpolation method to use. Defaults to nearest.
   * @param {Channel} [opt.maskChannel] - The channel of the mask to use. Defaults to luminance.
   * @param {number} [opt.centerX] - The X coordinate of the distortion center. Defaults to the center of the image.
   * @param {number} [opt.centerY] - The Y coordinate of the distortion center. Defaults to the center of the image.
   * @param {MemoryImage} [opt.mask] - An optional mask image to control the distortion effect.
   * @returns {MemoryImage} - The distorted image.
   */
  public static stretchDistortion(opt: StretchDistortionOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const interpolation = opt.interpolation ?? Interpolation.nearest;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    for (const frame of image.frames) {
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

    return image;
  }

  /**
   * Apply a vignette filter to the image.
   *
   * @param {VignetteOptions} opt - The options for the vignette filter.
   * @param {MemoryImage} opt.image - The image to which the vignette filter will be applied.
   * @param {number} [opt.start] - The inner radius from the center of the image where the fade to color starts to be applied.
   * @param {number} [opt.end] - The outer radius of the vignette effect where the color is fully applied.
   * @param {number} [opt.amount] - Controls the blend of the effect with the original image.
   * @param {Color} [opt.color] - The color to be used for the vignette effect.
   * @param {MemoryImage} [opt.mask] - The mask to be used for the vignette effect.
   * @param {Channel} [opt.maskChannel] - The channel of the mask to be used.
   * @returns {MemoryImage} The image with the vignette filter applied.
   */
  public static vignette(opt: VignetteOptions): MemoryImage {
    const image = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;
    const start = opt.start ?? 0.3;
    const end = opt.end ?? 0.85;
    const amount = opt.amount ?? 0.9;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const h = image.height - 1;
    const w = image.width - 1;
    const cr = opt.color?.rNormalized ?? 0;
    const cg = opt.color?.gNormalized ?? 0;
    const cb = opt.color?.bNormalized ?? 0;
    const ca = opt.color?.aNormalized ?? 1;
    const aspect = w / h;
    for (const frame of image.frames) {
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

    return image;
  }
}
