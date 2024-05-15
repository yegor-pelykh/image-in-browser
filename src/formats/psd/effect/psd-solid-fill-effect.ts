/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

export interface PsdSolidFillEffectOptions extends PsdEffectOptions {
  blendMode: string;
  color: number[];
  opacity: number;
  nativeColor: number[];
}

export class PsdSolidFillEffect extends PsdEffect {
  private _blendMode: string;
  public get blendMode(): string {
    return this._blendMode;
  }

  private _color: number[];
  public get color(): number[] {
    return this._color;
  }

  private _opacity: number;
  public get opacity(): number {
    return this._opacity;
  }

  private _nativeColor: number[];
  public get nativeColor(): number[] {
    return this._nativeColor;
  }

  constructor(opt: PsdSolidFillEffectOptions) {
    super(opt);
    this._blendMode = opt.blendMode;
    this._color = opt.color;
    this._opacity = opt.opacity;
    this._nativeColor = opt.nativeColor;
  }
}
