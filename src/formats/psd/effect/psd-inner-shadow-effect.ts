/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

export interface PsdInnerShadowEffectOptions extends PsdEffectOptions {
  blur: number;
  intensity: number;
  angle: number;
  distance: number;
  color: number[];
  blendMode: string;
  globalAngle: boolean;
  opacity: number;
  nativeColor: number[];
}

export class PsdInnerShadowEffect extends PsdEffect {
  private _blur: number;
  public get blur(): number {
    return this._blur;
  }

  private _intensity: number;
  public get intensity(): number {
    return this._intensity;
  }

  private _angle: number;
  public get angle(): number {
    return this._angle;
  }

  private _distance: number;
  public get distance(): number {
    return this._distance;
  }

  private _color: number[];
  public get color(): number[] {
    return this._color;
  }

  private _blendMode: string;
  public get blendMode(): string {
    return this._blendMode;
  }

  private _globalAngle: boolean;
  public get globalAngle(): boolean {
    return this._globalAngle;
  }

  private _opacity: number;
  public get opacity(): number {
    return this._opacity;
  }

  private _nativeColor: number[];
  public get nativeColor(): number[] {
    return this._nativeColor;
  }

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
