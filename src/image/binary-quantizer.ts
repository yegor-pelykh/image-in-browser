/** @format */

import { Color } from '../color/color.js';
import { ColorRgb8 } from '../color/color-rgb8.js';
import { ColorUtils } from '../color/color-utils.js';
import { MemoryImage } from './image.js';
import { Palette } from './palette.js';
import { PaletteUint8 } from './palette-uint8.js';
import { Pixel } from './pixel.js';
import { Quantizer } from './quantizer.js';

export class BinaryQuantizer implements Quantizer {
  private readonly _palette: Palette;
  public get palette(): Palette {
    return this._palette;
  }

  private readonly _threshold: number;
  public get threshold(): number {
    return this._threshold;
  }

  constructor(threshold: number = 0.5) {
    this._palette = new PaletteUint8(2, 3);
    this._threshold = threshold;
    this._palette.setRgb(1, 255, 255, 255);
  }

  public getColorIndex(c: Color): number {
    return c.luminanceNormalized < this._threshold ? 0 : 1;
  }

  public getColorIndexRgb(r: number, g: number, b: number): number {
    return ColorUtils.getLuminanceRgb(r, g, b) < this._threshold ? 0 : 1;
  }

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
   * Convert the **image** to a palette image.
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
