/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

/**
 * Interface for solid fill effect options.
 */
export interface PsdSolidFillEffectOptions extends PsdEffectOptions {
  /** Blend mode for the effect. */
  blendMode: string;
  /** Color array for the effect. */
  color: number[];
  /** Opacity value for the effect. */
  opacity: number;
  /** Native color array for the effect. */
  nativeColor: number[];
}

/**
 * Class representing a solid fill effect.
 */
export class PsdSolidFillEffect extends PsdEffect {
  /** @private Blend mode for the effect. */
  private _blendMode: string;

  /**
   * Gets the blend mode.
   * @returns {string} The blend mode.
   */
  public get blendMode(): string {
    return this._blendMode;
  }

  /** @private Color array for the effect. */
  private _color: number[];

  /**
   * Gets the color array.
   * @returns {number[]} The color array.
   */
  public get color(): number[] {
    return this._color;
  }

  /** @private Opacity value for the effect. */
  private _opacity: number;

  /**
   * Gets the opacity value.
   * @returns {number} The opacity value.
   */
  public get opacity(): number {
    return this._opacity;
  }

  /** @private Native color array for the effect. */
  private _nativeColor: number[];

  /**
   * Gets the native color array.
   * @returns {number[]} The native color array.
   */
  public get nativeColor(): number[] {
    return this._nativeColor;
  }

  /**
   * Initializes a new instance of the PsdSolidFillEffect class.
   * @param {PsdSolidFillEffectOptions} opt - Options for the solid fill effect.
   * @param {string} opt.blendMode - Blend mode for the effect.
   * @param {number[]} opt.color - Color array for the effect.
   * @param {number} opt.opacity - Opacity value for the effect.
   * @param {number[]} opt.nativeColor - Native color array for the effect.
   */
  constructor(opt: PsdSolidFillEffectOptions) {
    super(opt);
    this._blendMode = opt.blendMode;
    this._color = opt.color;
    this._opacity = opt.opacity;
    this._nativeColor = opt.nativeColor;
  }
}
