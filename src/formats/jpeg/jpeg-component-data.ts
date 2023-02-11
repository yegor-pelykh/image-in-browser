/** @format */

export class JpegComponentData {
  private _hSamples: number;
  public get hSamples(): number {
    return this._hSamples;
  }

  private _maxHSamples: number;
  public get maxHSamples(): number {
    return this._maxHSamples;
  }

  private _vSamples: number;
  public get vSamples(): number {
    return this._vSamples;
  }

  private _maxVSamples: number;
  public get maxVSamples(): number {
    return this._maxVSamples;
  }

  private _lines: Array<Uint8Array | undefined>;
  public get lines(): Array<Uint8Array | undefined> {
    return this._lines;
  }

  private _hScaleShift: number;
  public get hScaleShift(): number {
    return this._hScaleShift;
  }

  private _vScaleShift: number;
  public get vScaleShift(): number {
    return this._vScaleShift;
  }

  constructor(
    hSamples: number,
    maxHSamples: number,
    vSamples: number,
    maxVSamples: number,
    lines: Array<Uint8Array | undefined>
  ) {
    this._hSamples = hSamples;
    this._maxHSamples = maxHSamples;
    this._vSamples = vSamples;
    this._maxVSamples = maxVSamples;
    this._lines = lines;
    this._hScaleShift = this._hSamples === 1 && this._maxHSamples === 2 ? 1 : 0;
    this._vScaleShift = this._vSamples === 1 && this._maxVSamples === 2 ? 1 : 0;
  }
}
