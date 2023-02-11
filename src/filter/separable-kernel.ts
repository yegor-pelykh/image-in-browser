/** @format */

import { Channel } from '../color/channel';
import { ArrayUtils } from '../common/array-utils';
import { MathUtils } from '../common/math-utils';
import { MemoryImage } from '../image/image';

export interface SeparableKernelApplyOptions {
  src: MemoryImage;
  dst: MemoryImage;
  horizontal?: boolean;
  maskChannel?: Channel;
  mask?: MemoryImage;
}

/**
 * A kernel object to use with **separableConvolution** filter.
 */
export class SeparableKernel {
  private readonly _coefficients: number[];
  private readonly _size: number;

  /**
   * Get the number of coefficients in the kernel.
   */
  public get length() {
    return this._coefficients.length;
  }

  /**
   * Create a separable convolution kernel for the given **size**.
   */
  constructor(size: number) {
    this._size = size;
    this._coefficients = ArrayUtils.fill(2 * size + 1, 0);
  }

  private reflect(max: number, x: number): number {
    if (x < 0) {
      return -x;
    }
    if (x >= max) {
      return max - (x - max) - 1;
    }
    return x;
  }

  private applyCoefficientsLine(
    src: MemoryImage,
    dst: MemoryImage,
    y: number,
    width: number,
    horizontal: boolean,
    maskChannel: Channel,
    mask?: MemoryImage
  ): void {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let j = -this._size, j2 = 0; j <= this._size; ++j, ++j2) {
        const c = this._coefficients[j2];
        const gr = this.reflect(width, x + j);

        const sc = horizontal ? src.getPixel(gr, y) : src.getPixel(y, gr);

        r += c * sc.r;
        g += c * sc.g;
        b += c * sc.b;
        a += c * sc.a;
      }

      const p = horizontal ? dst.getPixel(x, y) : dst.getPixel(y, x);

      const msk = mask?.getPixel(p.x, p.y).getChannelNormalized(maskChannel);
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

  /**
   * Get a coefficient from the kernel.
   */
  public getCoefficient(index: number) {
    return this._coefficients[index];
  }

  /**
   * Set a coefficient in the kernel.
   */
  public setCoefficient(index: number, c: number) {
    this._coefficients[index] = c;
  }

  /**
   * Apply the kernel to the **src** image, storing the results in **dst**,
   * for a single dimension. If **horizontal** is true, the filter will be
   * applied to the horizontal axis, otherwise it will be applied to the
   * vertical axis.
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
   */
  public scaleCoefficients(s: number): void {
    for (let i = 0; i < this._coefficients.length; ++i) {
      this._coefficients[i] *= s;
    }
  }
}
