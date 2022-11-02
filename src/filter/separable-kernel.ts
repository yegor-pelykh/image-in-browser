/** @format */

import { ColorUtils } from '../common/color-utils';
import { MemoryImage } from '../common/memory-image';

/**
 * A kernel object to use with [separableConvolution] filtering.
 */
export class SeparableKernel {
  private readonly coefficients: number[];
  private readonly size: number;

  /**
   * Get the number of coefficients in the kernel.
   */
  public get length() {
    return this.coefficients.length;
  }

  /**
   * Create a separable convolution kernel for the given [radius].
   */
  constructor(size: number) {
    this.size = size;
    this.coefficients = new Array<number>(2 * size + 1).fill(0);
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

  private applyCoeffsLine(
    src: MemoryImage,
    dst: MemoryImage,
    y: number,
    width: number,
    horizontal: boolean
  ): void {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let j = -this.size, j2 = 0; j <= this.size; ++j, ++j2) {
        const coeff = this.coefficients[j2];
        const gr = this.reflect(width, x + j);

        const sc = horizontal ? src.getPixel(gr, y) : src.getPixel(y, gr);

        r += coeff * ColorUtils.getRed(sc);
        g += coeff * ColorUtils.getGreen(sc);
        b += coeff * ColorUtils.getBlue(sc);
        a += coeff * ColorUtils.getAlpha(sc);
      }

      const c = ColorUtils.getColor(
        r > 255 ? 255 : r,
        g > 255 ? 255 : g,
        b > 255 ? 255 : b,
        a > 255 ? 255 : a
      );

      if (horizontal) {
        dst.setPixel(x, y, c);
      } else {
        dst.setPixel(y, x, c);
      }
    }
  }

  /**
   * Get a coefficient from the kernel.
   */
  public getCoefficient(index: number) {
    return this.coefficients[index];
  }

  /**
   * Set a coefficient in the kernel.
   */
  public setCoefficient(index: number, c: number) {
    this.coefficients[index] = c;
  }

  /**
   * Apply the kernel to the [src] image, storing the results in [dst],
   * for a single dimension. If [horizontal is true, the filter will be
   * applied to the horizontal axis, otherwise it will be appied to the
   * vertical axis.
   */
  public apply(src: MemoryImage, dst: MemoryImage, horizontal = true): void {
    if (horizontal) {
      for (let y = 0; y < src.height; ++y) {
        this.applyCoeffsLine(src, dst, y, src.width, horizontal);
      }
    } else {
      for (let x = 0; x < src.width; ++x) {
        this.applyCoeffsLine(src, dst, x, src.height, horizontal);
      }
    }
  }

  /**
   * Scale all of the coefficients by [s].
   */
  public scaleCoefficients(s: number): void {
    for (let i = 0; i < this.coefficients.length; ++i) {
      this.coefficients[i] *= s;
    }
  }
}
