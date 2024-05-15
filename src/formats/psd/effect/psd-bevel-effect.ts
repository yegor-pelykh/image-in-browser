/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

export interface PsdBevelEffectOptions extends PsdEffectOptions {
  angle: number;
  strength: number;
  blur: number;
  highlightBlendMode: string;
  shadowBlendMode: string;
  highlightColor: number[];
  shadowColor: number[];
  bevelStyle: number;
  highlightOpacity: number;
  shadowOpacity: number;
  globalAngle: boolean;
  upOrDown: number;
  realHighlightColor?: number[];
  realShadowColor?: number[];
}

export class PsdBevelEffect extends PsdEffect {
  private _angle: number;
  public get angle(): number {
    return this._angle;
  }

  private _strength: number;
  public get strength(): number {
    return this._strength;
  }

  private _blur: number;
  public get blur(): number {
    return this._blur;
  }

  private _highlightBlendMode: string;
  public get highlightBlendMode(): string {
    return this._highlightBlendMode;
  }

  private _shadowBlendMode: string;
  public get shadowBlendMode(): string {
    return this._shadowBlendMode;
  }

  private _highlightColor: number[];
  public get highlightColor(): number[] {
    return this._highlightColor;
  }

  private _shadowColor: number[];
  public get shadowColor(): number[] {
    return this._shadowColor;
  }

  private _bevelStyle: number;
  public get bevelStyle(): number {
    return this._bevelStyle;
  }

  private _highlightOpacity: number;
  public get highlightOpacity(): number {
    return this._highlightOpacity;
  }

  private _shadowOpacity: number;
  public get shadowOpacity(): number {
    return this._shadowOpacity;
  }

  private _globalAngle: boolean;
  public get globalAngle(): boolean {
    return this._globalAngle;
  }

  private _upOrDown: number;
  public get upOrDown(): number {
    return this._upOrDown;
  }

  private _realHighlightColor: number[] | undefined;
  public get realHighlightColor(): number[] | undefined {
    return this._realHighlightColor;
  }

  private _realShadowColor: number[] | undefined;
  public get realShadowColor(): number[] | undefined {
    return this._realShadowColor;
  }

  constructor(opt: PsdBevelEffectOptions) {
    super(opt);
    this._angle = opt.angle;
    this._strength = opt.strength;
    this._blur = opt.angle;
    this._highlightBlendMode = opt.highlightBlendMode;
    this._shadowBlendMode = opt.shadowBlendMode;
    this._highlightColor = opt.highlightColor;
    this._shadowColor = opt.shadowColor;
    this._bevelStyle = opt.bevelStyle;
    this._highlightOpacity = opt.highlightOpacity;
    this._shadowOpacity = opt.shadowOpacity;
    this._globalAngle = opt.globalAngle;
    this._upOrDown = opt.upOrDown;
    this._realHighlightColor = opt.realHighlightColor;
    this._realShadowColor = opt.realShadowColor;
  }
}
