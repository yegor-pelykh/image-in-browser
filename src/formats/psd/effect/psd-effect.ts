/** @format */

/**
 * Interface representing the options for a PSD effect.
 */
export interface PsdEffectOptions {
  /**
   * The version number of the PSD effect.
   */
  version: number;

  /**
   * Indicates whether the PSD effect is enabled.
   */
  enabled: boolean;
}

/**
 * Class representing a PSD effect.
 */
export class PsdEffect {
  /**
   * The version number of the PSD effect.
   */
  private _version: number;

  /**
   * Gets the version number of the PSD effect.
   */
  public get version(): number {
    return this._version;
  }

  /**
   * Indicates whether the PSD effect is enabled.
   */
  private _enabled: boolean;

  /**
   * Gets the enabled status of the PSD effect.
   */
  public get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Initializes a new instance of the PsdEffect class.
   * @param {PsdEffectOptions} opt - The options for the PSD effect.
   * @param {number} opt.version - The version number of the PSD effect.
   * @param {boolean} opt.enabled - Indicates whether the PSD effect is enabled.
   */
  constructor(opt: PsdEffectOptions) {
    this._version = opt.version;
    this._enabled = opt.enabled;
  }
}
