/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

/**
 * Interface for options to configure the outer glow effect.
 */
export interface PsdOuterGlowEffectOptions extends PsdEffectOptions {
  /** The blur radius of the outer glow. */
  blur: number;
  /** The intensity of the outer glow. */
  intensity: number;
  /** The color of the outer glow as an array of RGB values. */
  color: number[];
  /** The blend mode used for the outer glow. */
  blendMode: string;
  /** The opacity of the outer glow. */
  opacity: number;
  /** The native color of the outer glow, if any. */
  nativeColor?: number[];
}

/**
 * Class representing an outer glow effect.
 */
export class PsdOuterGlowEffect extends PsdEffect {
  /** The blur radius of the outer glow. */
  private _blur: number;
  /** Gets the blur radius of the outer glow. */
  public get blur(): number {
    return this._blur;
  }

  /** The intensity of the outer glow. */
  private _intensity: number;
  /** Gets the intensity of the outer glow. */
  public get intensity(): number {
    return this._intensity;
  }

  /** The color of the outer glow as an array of RGB values. */
  private _color: number[];
  /** Gets the color of the outer glow. */
  public get color(): number[] {
    return this._color;
  }

  /** The blend mode used for the outer glow. */
  private _blendMode: string;
  /** Gets the blend mode used for the outer glow. */
  public get blendMode(): string {
    return this._blendMode;
  }

  /** The opacity of the outer glow. */
  private _opacity: number;
  /** Gets the opacity of the outer glow. */
  public get opacity(): number {
    return this._opacity;
  }

  /** The native color of the outer glow, if any. */
  private _nativeColor: number[] | undefined;
  /** Gets the native color of the outer glow, if any. */
  public get nativeColor(): number[] | undefined {
    return this._nativeColor;
  }

  /**
   * Initializes a new instance of the PsdOuterGlowEffect class.
   * @param {PsdOuterGlowEffectOptions} opt - The options to configure the outer glow effect.
   * @param {number} opt.blur - The blur radius of the outer glow.
   * @param {number} opt.intensity - The intensity of the outer glow.
   * @param {number[]} opt.color - The color of the outer glow as an array of RGB values.
   * @param {string} opt.blendMode - The blend mode used for the outer glow.
   * @param {number} opt.opacity - The opacity of the outer glow.
   * @param {string} [opt.nativeColor] - The native color of the outer glow, if any.
   */
  constructor(opt: PsdOuterGlowEffectOptions) {
    super(opt);
    this._blur = opt.blur;
    this._intensity = opt.intensity;
    this._color = opt.color;
    this._blendMode = opt.blendMode;
    this._opacity = opt.opacity;
    this._nativeColor = opt.nativeColor;
  }
}
