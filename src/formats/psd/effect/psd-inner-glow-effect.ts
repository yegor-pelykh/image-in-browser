/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

/**
 * Interface for options specific to the inner glow effect.
 */
export interface PsdInnerGlowEffectOptions extends PsdEffectOptions {
  /** The blur radius of the inner glow effect. */
  blur: number;
  /** The intensity of the inner glow effect. */
  intensity: number;
  /** The color of the inner glow effect as an array of numbers. */
  color: number[];
  /** The blend mode of the inner glow effect. */
  blendMode: string;
  /** The opacity of the inner glow effect. */
  opacity: number;
  /** Optional flag to invert the inner glow effect. */
  invert?: boolean;
  /** Optional native color of the inner glow effect as an array of numbers. */
  nativeColor?: number[];
}

/**
 * Class representing an inner glow effect.
 */
export class PsdInnerGlowEffect extends PsdEffect {
  /** The blur radius of the inner glow effect. */
  private _blur: number;
  /** Gets the blur radius of the inner glow effect. */
  public get blur(): number {
    return this._blur;
  }

  /** The intensity of the inner glow effect. */
  private _intensity: number;
  /** Gets the intensity of the inner glow effect. */
  public get intensity(): number {
    return this._intensity;
  }

  /** The color of the inner glow effect. */
  private _color: number[];
  /** Gets the color of the inner glow effect. */
  public get color(): number[] {
    return this._color;
  }

  /** The blend mode of the inner glow effect. */
  private _blendMode: string;
  /** Gets the blend mode of the inner glow effect. */
  public get blendMode(): string {
    return this._blendMode;
  }

  /** The opacity of the inner glow effect. */
  private _opacity: number;
  /** Gets the opacity of the inner glow effect. */
  public get opacity(): number {
    return this._opacity;
  }

  /** Optional flag to invert the inner glow effect. */
  private _invert: boolean | undefined;
  /** Gets the optional flag to invert the inner glow effect. */
  public get invert(): boolean | undefined {
    return this._invert;
  }

  /** Optional native color of the inner glow effect. */
  private _nativeColor: number[] | undefined;
  /** Gets the optional native color of the inner glow effect. */
  public get nativeColor(): number[] | undefined {
    return this._nativeColor;
  }

  /**
   * Initializes a new instance of the PsdInnerGlowEffect class.
   *
   * @param {PsdInnerGlowEffectOptions} opt - The options for the inner glow effect.
   * @param {number} opt.blur - The blur radius of the inner glow effect.
   * @param {number} opt.intensity - The intensity of the inner glow effect.
   * @param {number[]} opt.color - The color of the inner glow effect as an array of numbers.
   * @param {string} opt.blendMode - The blend mode of the inner glow effect.
   * @param {number} opt.opacity - The opacity of the inner glow effect.
   * @param {boolean} [opt.invert] - Optional flag to invert the inner glow effect.
   * @param {number[]} [opt.nativeColor] - Optional native color of the inner glow effect as an array of numbers.
   */
  constructor(opt: PsdInnerGlowEffectOptions) {
    super(opt);
    this._blur = opt.blur;
    this._intensity = opt.intensity;
    this._color = opt.color;
    this._blendMode = opt.blendMode;
    this._opacity = opt.opacity;
    this._invert = opt.invert;
    this._nativeColor = opt.nativeColor;
  }
}
