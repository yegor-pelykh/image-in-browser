/** @format */

import { Color } from '../color/color.js';
import { ColorRgb8 } from '../color/color-rgb8.js';
import { ColorUtils } from '../color/color-utils.js';
import { MemoryImage } from './image.js';
import { Palette } from './palette.js';
import { PaletteUint8 } from './palette-uint8.js';
import { Pixel } from './pixel.js';
import { Quantizer } from './quantizer.js';

/**
 * A class that implements the Quantizer interface to perform binary quantization.
 */
export class BinaryQuantizer implements Quantizer {
  /**
   * The palette used for quantization.
   */
  private readonly _palette: Palette;

  /**
   * Gets the palette used for quantization.
   */
  public get palette(): Palette {
    return this._palette;
  }

  /**
   * The threshold value for binary quantization.
   */
  private readonly _threshold: number;

  /**
   * Gets the threshold value for binary quantization.
   */
  public get threshold(): number {
    return this._threshold;
  }

  /**
   * Constructs a BinaryQuantizer with an optional threshold value.
   * @param {number} threshold - The threshold value for binary quantization. Default is 0.5.
   */
  constructor(threshold: number = 0.5) {
    this._palette = new PaletteUint8(2, 3);
    this._threshold = threshold;
    this._palette.setRgb(1, 255, 255, 255);
  }

  /**
   * Gets the color index based on the luminance of the color.
   * @param {Color} c - The color to be quantized.
   * @returns {number} The color index (0 or 1).
   */
  public getColorIndex(c: Color): number {
    return c.luminanceNormalized < this._threshold ? 0 : 1;
  }

  /**
   * Gets the color index based on the RGB values.
   * @param {number} r - The red component of the color.
   * @param {number} g - The green component of the color.
   * @param {number} b - The blue component of the color.
   * @returns {number} The color index (0 or 1).
   */
  public getColorIndexRgb(r: number, g: number, b: number): number {
    return ColorUtils.getLuminanceRgb(r, g, b) < this._threshold ? 0 : 1;
  }

  /**
   * Gets the quantized color based on the luminance of the input color.
   * @param {Color} c - The color to be quantized.
   * @returns {Color} The quantized color.
   */
  public getQuantizedColor(c: Color): Color {
    return c.luminanceNormalized < this._threshold
      ? new ColorRgb8(
          Math.trunc(this._palette.getRed(0)),
          Math.trunc(this._palette.getGreen(0)),
          Math.trunc(this._palette.getBlue(0))
        )
      : new ColorRgb8(
          Math.trunc(this._palette.getRed(1)),
          Math.trunc(this._palette.getGreen(1)),
          Math.trunc(this._palette.getBlue(1))
        );
  }

  /**
   * Converts the image to a palette image.
   * @param {MemoryImage} image - The image to be converted.
   * @returns {MemoryImage} The palette image.
   */
  public getIndexImage(image: MemoryImage): MemoryImage {
    const target = new MemoryImage({
      width: image.width,
      height: image.height,
      numChannels: 1,
      palette: this.palette,
    });

    target.frameIndex = image.frameIndex;
    target.frameType = image.frameType;
    target.frameDuration = image.frameDuration;

    const imageIt = image[Symbol.iterator]();
    const targetIt = target[Symbol.iterator]();
    let imageItRes: IteratorResult<Pixel> | undefined = undefined;
    let targetItRes: IteratorResult<Pixel> | undefined = undefined;
    while (
      (((imageItRes = imageIt.next()), (targetItRes = targetIt.next())),
      !imageItRes.done && !targetItRes.done)
    ) {
      const t = targetItRes.value;
      t.setChannel(0, this.getColorIndex(imageItRes.value));
    }

    return target;
  }
}
