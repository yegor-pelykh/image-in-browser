/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect';

export interface PsdOuterGlowEffectOptions extends PsdEffectOptions {
  blur: number;
  intensity: number;
  color: number[];
  blendMode: string;
  opacity: number;
  nativeColor?: number[];
}

export class PsdOuterGlowEffect extends PsdEffect {
  private _blur: number;
  public get blur(): number {
    return this._blur;
  }

  private _intensity: number;
  public get intensity(): number {
    return this._intensity;
  }

  private _color: number[];
  public get color(): number[] {
    return this._color;
  }

  private _blendMode: string;
  public get blendMode(): string {
    return this._blendMode;
  }

  private _opacity: number;
  public get opacity(): number {
    return this._opacity;
  }

  private _nativeColor: number[] | undefined;
  public get nativeColor(): number[] | undefined {
    return this._nativeColor;
  }

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
