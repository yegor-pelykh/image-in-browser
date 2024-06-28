/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

/**
 * Interface for the options of the PsdInnerShadowEffect.
 */
export interface PsdInnerShadowEffectOptions extends PsdEffectOptions {
  /** The blur amount of the inner shadow. */
  blur: number;
  /** The intensity of the inner shadow. */
  intensity: number;
  /** The angle of the inner shadow. */
  angle: number;
  /** The distance of the inner shadow. */
  distance: number;
  /** The color of the inner shadow. */
  color: number[];
  /** The blend mode of the inner shadow. */
  blendMode: string;
  /** Whether the global angle is used. */
  globalAngle: boolean;
  /** The opacity of the inner shadow. */
  opacity: number;
  /** The native color of the inner shadow. */
  nativeColor: number[];
}

/**
 * Class representing an inner shadow effect in a PSD.
 */
export class PsdInnerShadowEffect extends PsdEffect {
  /** The blur amount of the inner shadow. */
  private _blur: number;
  /** Gets the blur amount of the inner shadow. */
  public get blur(): number {
    return this._blur;
  }

  /** The intensity of the inner shadow. */
  private _intensity: number;
  /** Gets the intensity of the inner shadow. */
  public get intensity(): number {
    return this._intensity;
  }

  /** The angle of the inner shadow. */
  private _angle: number;
  /** Gets the angle of the inner shadow. */
  public get angle(): number {
    return this._angle;
  }

  /** The distance of the inner shadow. */
  private _distance: number;
  /** Gets the distance of the inner shadow. */
  public get distance(): number {
    return this._distance;
  }

  /** The color of the inner shadow. */
  private _color: number[];
  /** Gets the color of the inner shadow. */
  public get color(): number[] {
    return this._color;
  }

  /** The blend mode of the inner shadow. */
  private _blendMode: string;
  /** Gets the blend mode of the inner shadow. */
  public get blendMode(): string {
    return this._blendMode;
  }

  /** Whether the global angle is used. */
  private _globalAngle: boolean;
  /** Gets whether the global angle is used. */
  public get globalAngle(): boolean {
    return this._globalAngle;
  }

  /** The opacity of the inner shadow. */
  private _opacity: number;
  /** Gets the opacity of the inner shadow. */
  public get opacity(): number {
    return this._opacity;
  }

  /** The native color of the inner shadow. */
  private _nativeColor: number[];
  /** Gets the native color of the inner shadow. */
  public get nativeColor(): number[] {
    return this._nativeColor;
  }

  /**
   * Initializes a new instance of the PsdInnerShadowEffect class.
   *
   * @param {PsdInnerShadowEffectOptions} opt - The options for the inner shadow effect.
   * @param {number} opt.blur - The blur amount of the inner shadow.
   * @param {number} opt.intensity - The intensity of the inner shadow.
   * @param {number} opt.angle - The angle of the inner shadow.
   * @param {number} opt.distance - The distance of the inner shadow.
   * @param {string} opt.color - The color of the inner shadow.
   * @param {string} opt.blendMode - The blend mode of the inner shadow.
   * @param {boolean} opt.globalAngle - Whether the global angle is used.
   * @param {number} opt.opacity - The opacity of the inner shadow.
   * @param {string} opt.nativeColor - The native color of the inner shadow.
   */
  constructor(opt: PsdInnerShadowEffectOptions) {
    super(opt);
    this._blur = opt.blur;
    this._intensity = opt.intensity;
    this._angle = opt.angle;
    this._distance = opt.distance;
    this._color = opt.color;
    this._blendMode = opt.blendMode;
    this._globalAngle = opt.globalAngle;
    this._opacity = opt.opacity;
    this._nativeColor = opt.nativeColor;
  }
}
