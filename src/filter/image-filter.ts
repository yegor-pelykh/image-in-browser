/** @format */

import { Color } from '../common/color';
import { ColorChannel } from '../common/color-channel';
import { MathOperators } from '../common/math-operators';
import { MemoryImage } from '../common/memory-image';
import { NeuralQuantizer } from '../common/neural-quantizer';
import { OctreeQuantizer } from '../common/octree-quantizer';
import { RandomUtils } from '../common/random-utils';
import { Rectangle } from '../common/rectangle';
import { Draw } from '../draw/draw';
import { AdjustColorOptions } from './adjust-color-options';
import { ColorOffsetOptions } from './color-offset-options';
import { ConvolutionOptions } from './convolution-options';
import { NoiseType } from './noise-type';
import { PixelateMode } from './pixelate-mode';
import { QuantizeMethod } from './quantize-method';
import { QuantizeOptions } from './quantize-options';
import { RemapColorsOptions } from './remap-colors-options';
import { SeparableKernel } from './separable-kernel';
import { VignetteOptions } from './vignette-options';

export abstract class ImageFilter {
  private static readonly gaussianKernelCache: Map<number, SeparableKernel> =
    new Map<number, SeparableKernel>();

  private static smoothVignetteStep(
    edge0: number,
    edge1: number,
    x: number
  ): number {
    let _x = x;
    _x = (_x - edge0) / (edge1 - edge0);
    if (_x < 0.0) {
      _x = 0.0;
    }
    if (_x > 1.0) {
      _x = 1.0;
    }
    return _x * _x * (3.0 - 2.0 * _x);
  }

  /**
   * Adjust the color of the **src** image using various color transformations.
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
   * **amount** controls how much affect this filter has on the **src** image, where
   * 0 has no effect and 1 has full effect.
   */
  public static adjustColor(options: AdjustColorOptions): MemoryImage {
    if (options.amount === 0) {
      return options.src;
    }

    const contrast =
      options.contrast !== undefined
        ? MathOperators.clamp(options.contrast, 0, 1)
        : undefined;
    const saturation =
      options.saturation !== undefined
        ? MathOperators.clamp(options.saturation, 0, 1)
        : undefined;
    const brightness =
      options.brightness !== undefined
        ? MathOperators.clamp(options.brightness, 0, 1)
        : undefined;
    const gamma =
      options.gamma !== undefined
        ? MathOperators.clamp(options.gamma, 0, 1000)
        : undefined;
    let exposure =
      options.exposure !== undefined
        ? MathOperators.clamp(options.exposure, 0, 1000)
        : undefined;
    const amount =
      options.amount !== undefined
        ? MathOperators.clamp(options.amount, 0, 1000)
        : undefined;

    const DEG_TO_RAD = 0.0174532925;
    const avgLumR = 0.5;
    const avgLumG = 0.5;
    const avgLumB = 0.5;
    const lumCoeffR = 0.2125;
    const lumCoeffG = 0.7154;
    const lumCoeffB = 0.0721;

    const useBlacksWhitesMids =
      options.blacks !== undefined ||
      options.whites !== undefined ||
      options.mids !== undefined;
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
      br =
        options.blacks !== undefined ? Color.getRed(options.blacks) / 255 : 0;
      bg =
        options.blacks !== undefined ? Color.getGreen(options.blacks) / 255 : 0;
      bb =
        options.blacks !== undefined ? Color.getBlue(options.blacks) / 255 : 0;

      wr =
        options.whites !== undefined ? Color.getRed(options.whites) / 255 : 1;
      wg =
        options.whites !== undefined ? Color.getGreen(options.whites) / 255 : 1;
      wb =
        options.whites !== undefined ? Color.getBlue(options.whites) / 255 : 1;

      mr = options.mids !== undefined ? Color.getRed(options.mids) / 255 : 0.5;
      mg =
        options.mids !== undefined ? Color.getGreen(options.mids) / 255 : 0.5;
      mb = options.mids !== undefined ? Color.getBlue(options.mids) / 255 : 0.5;

      mr = 1 / (1 + 2 * (mr - 0.5));
      mg = 1 / (1 + 2 * (mg - 0.5));
      mb = 1 / (1 + 2 * (mb - 0.5));
    }

    const invSaturation =
      saturation !== undefined ? 1 - MathOperators.clamp(saturation, 0, 1) : 0;
    const invContrast =
      contrast !== undefined ? 1 - MathOperators.clamp(contrast, 0, 1) : 0;

    if (exposure !== undefined) {
      exposure = Math.pow(2, exposure);
    }

    let hueR = 0;
    let hueG = 0;
    let hueB = 0;
    if (options.hue !== undefined) {
      options.hue *= DEG_TO_RAD;
      const s = Math.sin(options.hue);
      const c = Math.cos(options.hue);

      hueR = (2 * c) / 3;
      hueG = (-Math.sqrt(3) * s - c) / 3;
      hueB = (Math.sqrt(3) * s - c + 1) / 3;
    }

    const invAmount =
      amount !== undefined ? 1 - MathOperators.clamp(amount, 0, 1) : 0;

    const pixels = options.src.getBytes();
    for (let i = 0, len = pixels.length; i < len; i += 4) {
      const or = pixels[i] / 255;
      const og = pixels[i + 1] / 255;
      const ob = pixels[i + 2] / 255;

      let r = or;
      let g = og;
      let b = ob;

      if (useBlacksWhitesMids) {
        r = Math.pow((r + br) * wr, mr);
        g = Math.pow((g + bg) * wg, mg);
        b = Math.pow((b + bb) * wb, mb);
      }

      if (brightness !== undefined && brightness !== 1) {
        const br = MathOperators.clamp(brightness, 0, 1000);
        r *= br;
        g *= br;
        b *= br;
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

      if (options.hue !== undefined && options.hue !== 0) {
        const hr = r * hueR + g * hueG + b * hueB;
        const hg = r * hueB + g * hueR + b * hueG;
        const hb = r * hueG + g * hueB + b * hueR;
        r = hr;
        g = hg;
        b = hb;
      }

      if (amount !== undefined) {
        r = r * amount + or * invAmount;
        g = g * amount + og * invAmount;
        b = b * amount + ob * invAmount;
      }

      pixels[i] = MathOperators.clampInt255(r * 255);
      pixels[i + 1] = MathOperators.clampInt255(g * 255);
      pixels[i + 2] = MathOperators.clampInt255(b * 255);
    }

    return options.src;
  }

  /**
   * Set the **brightness** level for the image **src**.
   * **brightness** is an offset that is added to the red, green, and blue channels
   * of every pixel.
   */
  public static brightness(src: MemoryImage, brightness: number): MemoryImage {
    if (brightness === 0) {
      return src;
    }

    const pixels = src.getBytes();
    for (let i = 0, len = pixels.length; i < len; i += 4) {
      pixels[i] = MathOperators.clampInt255(pixels[i] + brightness);
      pixels[i + 1] = MathOperators.clampInt255(pixels[i + 1] + brightness);
      pixels[i + 2] = MathOperators.clampInt255(pixels[i + 2] + brightness);
    }

    return src;
  }

  /**
   * Generate a normal map from a height-field bump image.
   *
   * The red channel of the **src** image is used as an input, 0 represents a low
   * height and 1 a high value. The optional **strength** parameter allows to set
   * the strength of the normal image.
   */
  public static bumpToNormal(src: MemoryImage, strength = 2): MemoryImage {
    const dest = MemoryImage.from(src);

    for (let y = 0; y < src.height; ++y) {
      for (let x = 0; x < src.width; ++x) {
        const height = Color.getRed(src.getPixel(x, y)) / 255;
        let du =
          (height -
            Color.getRed(src.getPixel(x < src.width - 1 ? x + 1 : x, y)) /
              255) *
          strength;
        let dv =
          (height -
            Color.getRed(src.getPixel(x, y < src.height - 1 ? y + 1 : y)) /
              255) *
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

        dest.setPixelRgba(
          x,
          y,
          Math.floor(255 * nX),
          Math.floor(255 * nY),
          Math.floor(255 * nZ)
        );
      }
    }

    return dest;
  }

  /**
   * Add the **red**, **green**, **blue** and **alpha** values to the **src** image
   * colors, a per-channel brightness.
   */
  public static colorOffset(options: ColorOffsetOptions): MemoryImage {
    const pixels = options.src.getBytes();
    for (let i = 0, len = pixels.length; i < len; i += 4) {
      pixels[i] = MathOperators.clampInt255(pixels[i] + (options.red ?? 0));
      pixels[i + 1] = MathOperators.clampInt255(
        pixels[i + 1] + (options.green ?? 0)
      );
      pixels[i + 2] = MathOperators.clampInt255(
        pixels[i + 2] + (options.blue ?? 0)
      );
      pixels[i + 3] = MathOperators.clampInt255(
        pixels[i + 3] + (options.alpha ?? 0)
      );
    }

    return options.src;
  }

  /**
   * Set the **contrast** level for the image **src**.
   *
   * **contrast** values below 100 will decrees the contrast of the image,
   * and values above 100 will increase the contrast. A contrast of 100
   * will have no affect.
   */
  public static contrast(src: MemoryImage, contrast: number): MemoryImage {
    if (contrast === 100) {
      return src;
    }

    let c = contrast / 100;
    c *= c;
    const clevels = new Uint8Array(256);
    for (let i = 0; i < 256; ++i) {
      clevels[i] = MathOperators.clampInt255(
        ((i / 255.0 - 0.5) * c + 0.5) * 255.0
      );
    }

    const p = src.getBytes();
    for (let i = 0, len = p.length; i < len; i += 4) {
      p[i] = clevels[p[i]];
      p[i + 1] = clevels[p[i + 1]];
      p[i + 2] = clevels[p[i + 2]];
    }

    return src;
  }

  /**
   * Apply a 3x3 convolution filter to the **src** image. **filter** should be a
   * list of 9 numbers.
   *
   * The rgb channels will divided by **div** and add **offset**, allowing
   * filters to normalize and offset the filtered pixel value.
   */
  public static convolution(options: ConvolutionOptions): MemoryImage {
    const tmp = MemoryImage.from(options.src);

    for (let y = 0; y < options.src.height; ++y) {
      for (let x = 0; x < options.src.width; ++x) {
        const c = tmp.getPixel(x, y);
        let r = 0;
        let g = 0;
        let b = 0;
        const a = Color.getAlpha(c);
        for (let j = 0, fi = 0; j < 3; ++j) {
          const yv = Math.min(Math.max(y - 1 + j, 0), options.src.height - 1);
          for (let i = 0; i < 3; ++i, ++fi) {
            const xv = Math.min(Math.max(x - 1 + i, 0), options.src.width - 1);
            const c2 = tmp.getPixel(xv, yv);
            r += Color.getRed(c2) * options.filter[fi];
            g += Color.getGreen(c2) * options.filter[fi];
            b += Color.getBlue(c2) * options.filter[fi];
          }
        }

        const div = options.div ?? 1;
        const offset = options.offset ?? 0;

        r = r / div + offset;
        g = g / div + offset;
        b = b / div + offset;

        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;

        options.src.setPixel(x, y, Color.getColor(r, g, b, a));
      }
    }

    return options.src;
  }

  /**
   * Apply an emboss convolution filter.
   */
  public static emboss(src: MemoryImage): MemoryImage {
    const filter = [1.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.5];

    return ImageFilter.convolution({
      src: src,
      filter: filter,
      div: 1,
      offset: 127,
    });
  }

  /**
   * Apply gaussian blur to the **src** image. **radius** determines how many pixels
   * away from the current pixel should contribute to the blur, where 0 is no
   * blur and the larger the radius, the stronger the blur.
   */
  public static gaussianBlur(src: MemoryImage, radius: number): MemoryImage {
    if (radius <= 0) {
      return src;
    }

    let kernel: SeparableKernel | undefined = undefined;

    if (ImageFilter.gaussianKernelCache.has(radius)) {
      kernel = ImageFilter.gaussianKernelCache.get(radius)!;
    } else {
      // Compute coefficients
      const sigma = (radius * 2) / 3;
      const s = 2 * sigma * sigma;

      kernel = new SeparableKernel(radius);

      let sum = 0;
      for (let x = -radius; x <= radius; ++x) {
        const c = Math.exp(-(x * x) / s);
        sum += c;
        kernel.setCoefficient(x + radius, c);
      }
      // Normalize the coefficients
      kernel.scaleCoefficients(1 / sum);

      // Cache the kernel for this radius so we don't have to recompute it
      // next time.
      ImageFilter.gaussianKernelCache.set(radius, kernel);
    }

    return ImageFilter.separableConvolution(src, kernel);
  }

  /**
   * Convert the image to grayscale.
   */
  public static grayscale(src: MemoryImage): MemoryImage {
    const p = src.getBytes();
    for (let i = 0, len = p.length; i < len; i += 4) {
      const l = Color.getLuminanceRgb(p[i], p[i + 1], p[i + 2]);
      p[i] = l;
      p[i + 1] = l;
      p[i + 2] = l;
    }
    return src;
  }

  /**
   * Invert the colors of the **src** image.
   */
  public static invert(src: MemoryImage): MemoryImage {
    const p = src.getBytes();
    for (let i = 0, len = p.length; i < len; i += 4) {
      p[i] = 255 - p[i];
      p[i + 1] = 255 - p[i + 1];
      p[i + 2] = 255 - p[i + 2];
    }
    return src;
  }

  /**
   * Add random noise to pixel values. **sigma** determines how strong the effect
   * should be. **type** should be one of the following: **NoiseType.gaussian**,
   * **NoiseType.uniform**, **NoiseType.saltPepper**, **NoiseType.poisson**,
   * or **NoiseType.rice**.
   */
  public static noise(
    image: MemoryImage,
    sigma: number,
    type: NoiseType = NoiseType.gaussian
  ): MemoryImage {
    let nsigma = sigma;
    let min = 0;
    let max = 0;

    if (nsigma === 0 && type !== NoiseType.poisson) {
      return image;
    }

    if (nsigma < 0 || type === NoiseType.saltPepper) {
      const extremes = image.getColorExtremes();
      min = extremes.min;
      max = extremes.max;
    }

    if (nsigma < 0) {
      nsigma = (-nsigma * (max - min)) / 100.0;
    }

    const len = image.length;
    switch (type) {
      case NoiseType.gaussian:
        for (let i = 0; i < len; ++i) {
          const c = image.getPixelByIndex(i);
          const r = Math.trunc(Color.getRed(c) + nsigma * RandomUtils.grand());
          const g = Math.trunc(
            Color.getGreen(c) + nsigma * RandomUtils.grand()
          );
          const b = Math.trunc(Color.getBlue(c) + nsigma * RandomUtils.grand());
          const a = Color.getAlpha(c);
          image.setPixelByIndex(i, Color.getColor(r, g, b, a));
        }
        break;
      case NoiseType.uniform:
        for (let i = 0; i < len; ++i) {
          const c = image.getPixelByIndex(i);
          const r = Math.trunc(Color.getRed(c) + nsigma * RandomUtils.crand());
          const g = Math.trunc(
            Color.getGreen(c) + nsigma * RandomUtils.crand()
          );
          const b = Math.trunc(Color.getBlue(c) + nsigma * RandomUtils.crand());
          const a = Color.getAlpha(c);
          image.setPixelByIndex(i, Color.getColor(r, g, b, a));
        }
        break;
      case NoiseType.saltPepper:
        if (nsigma < 0) {
          nsigma = -nsigma;
        }
        if (max === min) {
          min = 0;
          max = 255;
        }
        for (let i = 0; i < len; ++i) {
          const c = image.getPixelByIndex(i);
          if (Math.random() * 100 < nsigma) {
            const r = Math.random() < 0.5 ? max : min;
            const g = Math.random() < 0.5 ? max : min;
            const b = Math.random() < 0.5 ? max : min;
            const a = Color.getAlpha(c);
            image.setPixelByIndex(i, Color.getColor(r, g, b, a));
          }
        }
        break;
      case NoiseType.poisson:
        for (let i = 0; i < len; ++i) {
          const c = image.getPixelByIndex(i);
          const r = RandomUtils.prand(Color.getRed(c));
          const g = RandomUtils.prand(Color.getGreen(c));
          const b = RandomUtils.prand(Color.getBlue(c));
          const a = Color.getAlpha(c);
          image.setPixelByIndex(i, Color.getColor(r, g, b, a));
        }
        break;
      case NoiseType.rice: {
        const sqrt2 = Math.sqrt(2);
        for (let i = 0; i < len; ++i) {
          const c = image.getPixelByIndex(i);

          let val0 = Color.getRed(c) / sqrt2;
          let re = val0 + nsigma * RandomUtils.grand();
          let im = val0 + nsigma * RandomUtils.grand();
          let val = Math.sqrt(re * re + im * im);
          const r = Math.trunc(val);

          val0 = Color.getGreen(c) / sqrt2;
          re = val0 + nsigma * RandomUtils.grand();
          im = val0 + nsigma * RandomUtils.grand();
          val = Math.sqrt(re * re + im * im);
          const g = Math.trunc(val);

          val0 = Color.getBlue(c) / sqrt2;
          re = val0 + nsigma * RandomUtils.grand();
          im = val0 + nsigma * RandomUtils.grand();
          val = Math.sqrt(re * re + im * im);
          const b = Math.trunc(val);

          const a = Color.getAlpha(c);
          image.setPixelByIndex(i, Color.getColor(r, g, b, a));
        }
        break;
      }
    }

    return image;
  }

  /**
   * Linearly normalize the colors of the image. All color values will be mapped
   * to the range **minValue**, **maxValue** inclusive.
   */
  public static normalize(
    src: MemoryImage,
    minValue: number,
    maxValue: number
  ): MemoryImage {
    const A = minValue < maxValue ? minValue : maxValue;
    const B = minValue < maxValue ? maxValue : minValue;

    const extremes = src.getColorExtremes();
    const min = extremes.min;
    const max = extremes.max;

    if (min === max) {
      return src.fill(minValue);
    }

    if (min !== A || max !== B) {
      const p = src.getBytes();
      for (let i = 0, len = p.length; i < len; i += 4) {
        p[i] = Math.trunc(((p[i] - min) / (max - min)) * (B - A) + A);
        p[i + 1] = Math.trunc(((p[i + 1] - min) / (max - min)) * (B - A) + A);
        p[i + 2] = Math.trunc(((p[i + 2] - min) / (max - min)) * (B - A) + A);
        p[i + 3] = Math.trunc(((p[i + 3] - min) / (max - min)) * (B - A) + A);
      }
    }

    return src;
  }

  /**
   * Pixelate the **src** image.
   *
   * **blockSize** determines the size of the pixelated blocks.
   * If **mode** is **PixelateMode.upperLeft** then the upper-left corner of the block
   * will be used for the block color. Otherwise if **mode** is **PixelateMode.average**,
   * the average of all the pixels in the block will be used for the block color.
   */
  public static pixelate(
    src: MemoryImage,
    blockSize: number,
    mode: PixelateMode = PixelateMode.upperLeft
  ): MemoryImage {
    if (blockSize <= 1) {
      return src;
    }

    const bs = blockSize - 1;

    switch (mode) {
      case PixelateMode.upperLeft:
        for (let y = 0; y < src.height; y += blockSize) {
          for (let x = 0; x < src.width; x += blockSize) {
            if (src.boundsSafe(x, y)) {
              const c = src.getPixel(x, y);
              const rect = new Rectangle(x, y, x + bs, y + bs);
              Draw.fillRect(src, rect, c);
            }
          }
        }
        break;
      case PixelateMode.average:
        for (let y = 0; y < src.height; y += blockSize) {
          for (let x = 0; x < src.width; x += blockSize) {
            let a = 0;
            let r = 0;
            let g = 0;
            let b = 0;
            let total = 0;

            for (let cy = 0; cy < blockSize; ++cy) {
              for (let cx = 0; cx < blockSize; ++cx) {
                if (!src.boundsSafe(x + cx, y + cy)) {
                  continue;
                }
                const c = src.getPixel(x + cx, y + cy);
                a += Color.getAlpha(c);
                r += Color.getRed(c);
                g += Color.getGreen(c);
                b += Color.getBlue(c);
                total++;
              }
            }

            if (total > 0) {
              const c = Color.getColor(
                Math.trunc(r / total),
                Math.trunc(g / total),
                Math.trunc(b / total),
                Math.trunc(a / total)
              );
              const rect = new Rectangle(x, y, x + bs, y + bs);
              Draw.fillRect(src, rect, c);
            }
          }
        }
        break;
    }

    return src;
  }

  /**
   * Quantize the number of colors in image to 256.
   */
  public static quantize(options: QuantizeOptions): MemoryImage {
    const numberOfColors = options.numberOfColors ?? 256;
    const method = options.method ?? QuantizeMethod.neuralNet;

    if (method === QuantizeMethod.octree || numberOfColors < 4) {
      const oct = new OctreeQuantizer(options.src, numberOfColors);
      for (let i = 0, len = options.src.length; i < len; ++i) {
        options.src.setPixelByIndex(
          i,
          oct.getQuantizedColor(options.src.getPixelByIndex(i))
        );
      }
      return options.src;
    }

    const quant = new NeuralQuantizer(options.src, numberOfColors);
    for (let i = 0, len = options.src.length; i < len; ++i) {
      options.src.setPixelByIndex(
        i,
        quant.getQuantizedColor(options.src.getPixelByIndex(i))
      );
    }
    return options.src;
  }

  /**
   * Remap the color channels of the image.
   * **red**, **green**, **blue** and **alpha** should be set to one of the following:
   * **ColorChannel.red**, **ColorChannel.green**, **ColorChannel.blue**, **ColorChannel.alpha**, or
   * **ColorChannel.luminance**. For example,
   * **_remapColors({ src: src, red: ColorChannel.green, green: ColorChannel.red })_**
   * will swap the red and green channels of the image.
   * **_remapColors({ src: src, alpha: ColorChannel.luminance })_**
   * will set the alpha channel to the luminance (grayscale) of the image.
   */
  public static remapColors(options: RemapColorsOptions): MemoryImage {
    const red = options.red ?? ColorChannel.red;
    const green = options.red ?? ColorChannel.red;
    const blue = options.red ?? ColorChannel.red;
    const alpha = options.red ?? ColorChannel.red;

    const l = [0, 0, 0, 0, 0];
    const p = options.src.getBytes();
    for (let i = 0, len = p.length; i < len; i += 4) {
      l[0] = p[i];
      l[1] = p[i + 1];
      l[2] = p[i + 2];
      l[3] = p[i + 3];
      if (
        red === ColorChannel.luminance ||
        green === ColorChannel.luminance ||
        blue === ColorChannel.luminance ||
        alpha === ColorChannel.luminance
      ) {
        l[4] = Color.getLuminanceRgb(l[0], l[1], l[2]);
      }
      p[i] = l[red];
      p[i + 1] = l[green];
      p[i + 2] = l[blue];
      p[i + 3] = l[alpha];
    }

    return options.src;
  }

  public static scaleRgba(
    src: MemoryImage,
    r: number,
    g: number,
    b: number,
    a: number
  ): MemoryImage {
    const dr = r / 255;
    const dg = g / 255;
    const db = b / 255;
    const da = a / 255;
    const bytes = src.getBytes();
    for (let i = 0, len = bytes.length; i < len; i += 4) {
      bytes[i] = Math.floor(bytes[i] * dr);
      bytes[i + 1] = Math.floor(bytes[i + 1] * dg);
      bytes[i + 2] = Math.floor(bytes[i + 2] * db);
      bytes[i + 3] = Math.floor(bytes[i + 3] * da);
    }
    return src;
  }

  /**
   * Apply a generic separable convolution filter the **src** image, using the
   * given **kernel**.
   *
   * **gaussianBlur** is an example of such a filter.
   */
  public static separableConvolution(
    src: MemoryImage,
    kernel: SeparableKernel
  ): MemoryImage {
    // Apply the filter horizontally
    const tmp = MemoryImage.from(src);
    kernel.apply(src, tmp);
    // Apply the filter vertically, applying back to the original image.
    kernel.apply(tmp, src, false);
    return src;
  }

  /**
   * Apply sepia tone to the image.
   *
   * **amount** controls the strength of the effect, in the range **0**-**1**.
   */
  public static sepia(src: MemoryImage, amount = 1): MemoryImage {
    if (amount === 0) {
      return src;
    }

    const p = src.getBytes();
    for (let i = 0, len = p.length; i < len; i += 4) {
      const r = p[i];
      const g = p[i + 1];
      const b = p[i + 2];
      const y = Color.getLuminanceRgb(r, g, b);
      p[i] = MathOperators.clampInt255(amount * (y + 38) + (1.0 - amount) * r);
      p[i + 1] = MathOperators.clampInt255(
        amount * (y + 18) + (1.0 - amount) * g
      );
      p[i + 2] = MathOperators.clampInt255(
        amount * (y - 31) + (1.0 - amount) * b
      );
    }

    return src;
  }

  /**
   * Apply a smoothing convolution filter to the **src** image.
   *
   * **w** is the weight of the current pixel being filtered. If it's greater than
   * 1, it will make the image sharper.
   */
  public static smooth(src: MemoryImage, w: number): MemoryImage {
    const filter = [1, 1, 1, 1, w, 1, 1, 1, 1];
    return ImageFilter.convolution({
      src: src,
      filter: filter,
      div: w + 8,
      offset: 0,
    });
  }

  /**
   * Apply Sobel edge detection filtering to the **src** Image.
   */
  public static sobel(src: MemoryImage, amount = 1): MemoryImage {
    const invAmount = 1 - amount;
    const orig = ImageFilter.grayscale(MemoryImage.from(src));
    const origRGBA = orig.getBytes();
    const rowSize = src.width * 4;
    const rgba = src.getBytes();
    const rgbaLen = rgba.length;
    for (let y = 0, pi = 0; y < src.height; ++y) {
      for (let x = 0; x < src.width; ++x, pi += 4) {
        const bl = pi + rowSize - 4;
        const b = pi + rowSize;
        const br = pi + rowSize + 4;
        const l = pi - 4;
        const r = pi + 4;
        const tl = pi - rowSize - 4;
        const t = pi - rowSize;
        const tr = pi - rowSize + 4;

        const tlInt = tl < 0 ? 0 : origRGBA[tl] / 255;
        const tInt = t < 0 ? 0 : origRGBA[t] / 255;
        const trInt = tr < 0 ? 0 : origRGBA[tr] / 255;
        const lInt = l < 0 ? 0 : origRGBA[l] / 255;
        const rInt = r < rgbaLen ? origRGBA[r] / 255 : 0;
        const blInt = bl < rgbaLen ? origRGBA[bl] / 255 : 0;
        const bInt = b < rgbaLen ? origRGBA[b] / 255 : 0;
        const brInt = br < rgbaLen ? origRGBA[br] / 255 : 0;

        const h = -tlInt - 2 * tInt - trInt + blInt + 2 * bInt + brInt;
        const v = -blInt - 2 * lInt - tlInt + brInt + 2 * rInt + trInt;

        const mag = MathOperators.clampInt255(Math.sqrt(h * h + v * v) * 255);

        rgba[pi] = MathOperators.clampInt255(
          mag * amount + rgba[pi] * invAmount
        );
        rgba[pi + 1] = MathOperators.clampInt255(
          mag * amount + rgba[pi + 1] * invAmount
        );
        rgba[pi + 2] = MathOperators.clampInt255(
          mag * amount + rgba[pi + 2] * invAmount
        );
      }
    }

    return src;
  }

  public static vignette(options: VignetteOptions): MemoryImage {
    const start = options.start ?? 0.3;
    const end = options.end ?? 0.75;
    const amount = options.amount ?? 0.8;

    const h = options.src.height - 1;
    const w = options.src.width - 1;
    const invAmt = 1 - amount;
    const p = options.src.getBytes();
    for (let y = 0, i = 0; y <= h; ++y) {
      const dy = 0.5 - y / h;
      for (let x = 0; x <= w; ++x, i += 4) {
        const dx = 0.5 - x / w;

        let d = Math.sqrt(dx * dx + dy * dy);
        d = ImageFilter.smoothVignetteStep(end, start, d);

        p[i] = MathOperators.clampInt255(amount * p[i] * d + invAmt * p[i]);
        p[i + 1] = MathOperators.clampInt255(
          amount * p[i + 1] * d + invAmt * p[i + 1]
        );
        p[i + 2] = MathOperators.clampInt255(
          amount * p[i + 2] * d + invAmt * p[i + 2]
        );
      }
    }

    return options.src;
  }
}
