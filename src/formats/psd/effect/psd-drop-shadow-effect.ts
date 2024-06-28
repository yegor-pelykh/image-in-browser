/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

/**
 * Interface representing the options for a drop shadow effect.
 */
export interface PsdDropShadowEffectOptions extends PsdEffectOptions {
  /** The blur radius of the shadow. */
  blur: number;
  /** The intensity of the shadow. */
  intensity: number;
  /** The angle of the shadow. */
  angle: number;
  /** The distance of the shadow from the object. */
  distance: number;
  /** The color of the shadow as an array of numbers. */
  color: number[];
  /** The blend mode of the shadow. */
  blendMode: string;
  /** Whether the global angle is used. */
  globalAngle: boolean;
  /** The opacity of the shadow. */
  opacity: number;
  /** The native color of the shadow as an array of numbers. */
  nativeColor: number[];
}

/**
 * Class representing a drop shadow effect.
 */
export class PsdDropShadowEffect extends PsdEffect {
  /** The blur radius of the shadow. */
  private _blur: number;
  /** Gets the blur radius of the shadow. */
  public get blur(): number {
    return this._blur;
  }

  /** The intensity of the shadow. */
  private _intensity: number;
  /** Gets the intensity of the shadow. */
  public get intensity(): number {
    return this._intensity;
  }

  /** The angle of the shadow. */
  private _angle: number;
  /** Gets the angle of the shadow. */
  public get angle(): number {
    return this._angle;
  }

  /** The distance of the shadow from the object. */
  private _distance: number;
  /** Gets the distance of the shadow from the object. */
  public get distance(): number {
    return this._distance;
  }

  /** The color of the shadow as an array of numbers. */
  private _color: number[];
  /** Gets the color of the shadow as an array of numbers. */
  public get color(): number[] {
    return this._color;
  }

  /** The blend mode of the shadow. */
  private _blendMode: string;
  /** Gets the blend mode of the shadow. */
  public get blendMode(): string {
    return this._blendMode;
  }

  /** Whether the global angle is used. */
  private _globalAngle: boolean;
  /** Gets whether the global angle is used. */
  public get globalAngle(): boolean {
    return this._globalAngle;
  }

  /** The opacity of the shadow. */
  private _opacity: number;
  /** Gets the opacity of the shadow. */
  public get opacity(): number {
    return this._opacity;
  }

  /** The native color of the shadow as an array of numbers. */
  private _nativeColor: number[];
  /** Gets the native color of the shadow as an array of numbers. */
  public get nativeColor(): number[] {
    return this._nativeColor;
  }

  /**
   * Initializes a new instance of the PsdDropShadowEffect class.
   *
   * @param {PsdDropShadowEffectOptions} opt - The options for the drop shadow effect.
   * @param {number} opt.blur - The blur radius of the shadow.
   * @param {number} opt.intensity - The intensity of the shadow.
   * @param {number} opt.angle - The angle of the shadow.
   * @param {number} opt.distance - The distance of the shadow from the object.
   * @param {number[]} opt.color - The color of the shadow as an array of numbers.
   * @param {string} opt.blendMode - The blend mode of the shadow.
   * @param {boolean} opt.globalAngle - Whether the global angle is used.
   * @param {number} opt.opacity - The opacity of the shadow.
   * @param {number[]} opt.nativeColor - The native color of the shadow as an array of numbers.
   */
  constructor(opt: PsdDropShadowEffectOptions) {
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
