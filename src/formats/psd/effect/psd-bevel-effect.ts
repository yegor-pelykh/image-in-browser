/** @format */

import { PsdEffect, PsdEffectOptions } from './psd-effect.js';

/**
 * Interface for Bevel Effect options.
 */
export interface PsdBevelEffectOptions extends PsdEffectOptions {
  /** The angle of the bevel effect. */
  angle: number;
  /** The strength of the bevel effect. */
  strength: number;
  /** The blur radius of the bevel effect. */
  blur: number;
  /** The blend mode for the highlight. */
  highlightBlendMode: string;
  /** The blend mode for the shadow. */
  shadowBlendMode: string;
  /** The color of the highlight. */
  highlightColor: number[];
  /** The color of the shadow. */
  shadowColor: number[];
  /** The style of the bevel. */
  bevelStyle: number;
  /** The opacity of the highlight. */
  highlightOpacity: number;
  /** The opacity of the shadow. */
  shadowOpacity: number;
  /** Whether to use the global angle. */
  globalAngle: boolean;
  /** Direction of the bevel effect, up or down. */
  upOrDown: number;
  /** The real color of the highlight (optional). */
  realHighlightColor?: number[];
  /** The real color of the shadow (optional). */
  realShadowColor?: number[];
}

/**
 * Class representing a Bevel Effect.
 */
export class PsdBevelEffect extends PsdEffect {
  /** The angle of the bevel effect. */
  private _angle: number;
  /** Gets the angle of the bevel effect. */
  public get angle(): number {
    return this._angle;
  }

  /** The strength of the bevel effect. */
  private _strength: number;
  /** Gets the strength of the bevel effect. */
  public get strength(): number {
    return this._strength;
  }

  /** The blur radius of the bevel effect. */
  private _blur: number;
  /** Gets the blur radius of the bevel effect. */
  public get blur(): number {
    return this._blur;
  }

  /** The blend mode for the highlight. */
  private _highlightBlendMode: string;
  /** Gets the blend mode for the highlight. */
  public get highlightBlendMode(): string {
    return this._highlightBlendMode;
  }

  /** The blend mode for the shadow. */
  private _shadowBlendMode: string;
  /** Gets the blend mode for the shadow. */
  public get shadowBlendMode(): string {
    return this._shadowBlendMode;
  }

  /** The color of the highlight. */
  private _highlightColor: number[];
  /** Gets the color of the highlight. */
  public get highlightColor(): number[] {
    return this._highlightColor;
  }

  /** The color of the shadow. */
  private _shadowColor: number[];
  /** Gets the color of the shadow. */
  public get shadowColor(): number[] {
    return this._shadowColor;
  }

  /** The style of the bevel. */
  private _bevelStyle: number;
  /** Gets the style of the bevel. */
  public get bevelStyle(): number {
    return this._bevelStyle;
  }

  /** The opacity of the highlight. */
  private _highlightOpacity: number;
  /** Gets the opacity of the highlight. */
  public get highlightOpacity(): number {
    return this._highlightOpacity;
  }

  /** The opacity of the shadow. */
  private _shadowOpacity: number;
  /** Gets the opacity of the shadow. */
  public get shadowOpacity(): number {
    return this._shadowOpacity;
  }

  /** Whether to use the global angle. */
  private _globalAngle: boolean;
  /** Gets whether to use the global angle. */
  public get globalAngle(): boolean {
    return this._globalAngle;
  }

  /** Direction of the bevel effect, up or down. */
  private _upOrDown: number;
  /** Gets the direction of the bevel effect, up or down. */
  public get upOrDown(): number {
    return this._upOrDown;
  }

  /** The real color of the highlight (optional). */
  private _realHighlightColor: number[] | undefined;
  /** Gets the real color of the highlight (optional). */
  public get realHighlightColor(): number[] | undefined {
    return this._realHighlightColor;
  }

  /** The real color of the shadow (optional). */
  private _realShadowColor: number[] | undefined;
  /** Gets the real color of the shadow (optional). */
  public get realShadowColor(): number[] | undefined {
    return this._realShadowColor;
  }

  /**
   * Initializes a new instance of the PsdBevelEffect class.
   *
   * @param {PsdBevelEffectOptions} opt - The options for the bevel effect.
   * @param {number} opt.angle - The angle of the bevel effect.
   * @param {number} opt.strength - The strength of the bevel effect.
   * @param {number} opt.blur - The blur radius of the bevel effect.
   * @param {string} opt.highlightBlendMode - The blend mode for the highlight.
   * @param {string} opt.shadowBlendMode - The blend mode for the shadow.
   * @param {string} opt.highlightColor - The color of the highlight.
   * @param {string} opt.shadowColor - The color of the shadow.
   * @param {string} opt.bevelStyle - The style of the bevel.
   * @param {number} opt.highlightOpacity - The opacity of the highlight.
   * @param {number} opt.shadowOpacity - The opacity of the shadow.
   * @param {boolean} opt.globalAngle - Whether to use the global angle.
   * @param {string} opt.upOrDown - Direction of the bevel effect, up or down.
   * @param {string} [opt.realHighlightColor] - The real color of the highlight (optional).
   * @param {string} [opt.realShadowColor] - The real color of the shadow (optional).
   */
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
