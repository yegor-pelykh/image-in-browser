/** @format */

export interface PsdEffectOptions {
  version: number;
  enabled: boolean;
}

export class PsdEffect {
  private _version: number;
  public get version(): number {
    return this._version;
  }

  private _enabled: boolean;
  public get enabled(): boolean {
    return this._enabled;
  }

  constructor(opt: PsdEffectOptions) {
    this._version = opt.version;
    this._enabled = opt.enabled;
  }
}
