/** @format */

import { Channel } from '../color/channel.js';
import { ArrayUtils } from '../common/array-utils.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from '../image/image.js';

/**
 * Options for applying a separable kernel.
 */
export interface SeparableKernelApplyOptions {
  /** Source image. */
  src: MemoryImage;
  /** Destination image. */
  dst: MemoryImage;
  /** Apply horizontally if true, otherwise vertically. */
  horizontal?: boolean;
  /** Channel to use for masking. */
  maskChannel?: Channel;
  /** Optional mask image. */
  mask?: MemoryImage;
}

/**
 * A kernel object to use with **separableConvolution** filter.
 */
export class SeparableKernel {
  /** Coefficients of the kernel. */
  private readonly _coefficients: number[];
  /** Size of the kernel. */
  private readonly _size: number;

  /**
   * Get the number of coefficients in the kernel.
   *
   * @returns {number} The number of coefficients.
   */
  public get length(): number {
    return this._coefficients.length;
  }

  /**
   * Create a separable convolution kernel for the given **size**.
   * @param {number} size - The size of the kernel.
   */
  constructor(size: number) {
    this._size = size;
    this._coefficients = ArrayUtils.fill(2 * size + 1, 0);
  }

  /**
   * Reflect the index within the bounds of the image.
   * @param {number} max - The maximum index.
   * @param {number} x - The current index.
   * @returns {number} The reflected index.
   */
  private reflect(max: number, x: number): number {
    if (x < 0) {
      return -x;
    }
    if (x >= max) {
      return max - (x - max) - 1;
    }
    return x;
  }

  /**
   * Apply the kernel coefficients to a line of pixels.
   * @param {MemoryImage} src - Source image.
   * @param {MemoryImage} dst - Destination image.
   * @param {number} y - The y-coordinate of the line.
   * @param {number} width - The width of the line.
   * @param {boolean} horizontal - Apply horizontally if true, otherwise vertically.
   * @param {Channel} maskChannel - Channel to use for masking.
   * @param {MemoryImage} [mask] - Optional mask image.
   */
  private applyCoefficientsLine(
    src: MemoryImage,
    dst: MemoryImage,
    y: number,
    width: number,
    horizontal: boolean,
    maskChannel: Channel,
    mask?: MemoryImage
  ): void {
    const srcPixel = src.getPixelSafe(0, 0);
    const dstPixel = dst.getPixelSafe(0, 0);
    if (!srcPixel.isValid || !dstPixel.isValid) {
      return;
    }

    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let j = -this._size, j2 = 0; j <= this._size; ++j, ++j2) {
        const c = this._coefficients[j2];
        const gr = this.reflect(width, x + j);

        if (horizontal) {
          srcPixel.setPosition(gr, y);
        } else {
          srcPixel.setPosition(y, gr);
        }

        r += c * srcPixel.r;
        g += c * srcPixel.g;
        b += c * srcPixel.b;
        a += c * srcPixel.a;
      }

      if (horizontal) {
        dstPixel.setPosition(x, y);
      } else {
        dstPixel.setPosition(y, x);
      }

      const msk = mask
        ?.getPixel(dstPixel.x, dstPixel.y)
        .getChannelNormalized(maskChannel);
      if (msk === undefined) {
        dstPixel.setRgba(r, g, b, a);
      } else {
        dstPixel.r = MathUtils.mix(dstPixel.r, r, msk);
        dstPixel.g = MathUtils.mix(dstPixel.g, g, msk);
        dstPixel.b = MathUtils.mix(dstPixel.b, b, msk);
        dstPixel.a = MathUtils.mix(dstPixel.a, a, msk);
      }
    }
  }

  /**
   * Get a coefficient from the kernel.
   * @param {number} index - The index of the coefficient.
   * @returns {number} The coefficient value.
   */
  public getCoefficient(index: number): number {
    return this._coefficients[index];
  }

  /**
   * Set a coefficient in the kernel.
   * @param {number} index - The index of the coefficient.
   * @param {number} c - The coefficient value.
   */
  public setCoefficient(index: number, c: number): void {
    this._coefficients[index] = c;
  }

  /**
   * Apply the kernel to the **src** image, storing the results in **dst**,
   * for a single dimension. If **horizontal** is true, the filter will be
   * applied to the horizontal axis, otherwise it will be applied to the
   * vertical axis.
   * @param {SeparableKernelApplyOptions} opt - Options for applying the kernel.
   * @param {MemoryImage} opt.src - The source image to which the kernel is applied.
   * @param {MemoryImage} opt.dst - The destination image where the results are stored.
   * @param {boolean} [opt.horizontal=true] - A boolean indicating whether to apply the filter horizontally. Defaults to true.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask. Defaults to Channel.luminance.
   * @param {MemoryImage} [opt.mask] - An optional mask to apply during the filtering process.
   */
  public apply(opt: SeparableKernelApplyOptions): void {
    const horizontal = opt.horizontal ?? true;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (horizontal) {
      for (let y = 0; y < opt.src.height; ++y) {
        this.applyCoefficientsLine(
          opt.src,
          opt.dst,
          y,
          opt.src.width,
          horizontal,
          maskChannel,
          opt.mask
        );
      }
    } else {
      for (let x = 0; x < opt.src.width; ++x) {
        this.applyCoefficientsLine(
          opt.src,
          opt.dst,
          x,
          opt.src.height,
          horizontal,
          maskChannel,
          opt.mask
        );
      }
    }
  }

  /**
   * Scale all of the coefficients by **s**.
   * @param {number} s - The scale factor.
   */
  public scaleCoefficients(s: number): void {
    for (let i = 0; i < this._coefficients.length; ++i) {
      this._coefficients[i] *= s;
    }
  }
}
