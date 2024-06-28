/** @format */

/**
 * Represents JPEG component data.
 */
export class JpegComponentData {
  /**
   * Number of horizontal samples.
   */
  private _hSamples: number;

  /**
   * Gets the number of horizontal samples.
   */
  public get hSamples(): number {
    return this._hSamples;
  }

  /**
   * Maximum number of horizontal samples.
   */
  private _maxHSamples: number;

  /**
   * Gets the maximum number of horizontal samples.
   */
  public get maxHSamples(): number {
    return this._maxHSamples;
  }

  /**
   * Number of vertical samples.
   */
  private _vSamples: number;

  /**
   * Gets the number of vertical samples.
   */
  public get vSamples(): number {
    return this._vSamples;
  }

  /**
   * Maximum number of vertical samples.
   */
  private _maxVSamples: number;

  /**
   * Gets the maximum number of vertical samples.
   */
  public get maxVSamples(): number {
    return this._maxVSamples;
  }

  /**
   * Array of lines, each line is an optional Uint8Array.
   */
  private _lines: Array<Uint8Array | undefined>;

  /**
   * Gets the array of lines.
   */
  public get lines(): Array<Uint8Array | undefined> {
    return this._lines;
  }

  /**
   * Horizontal scale shift.
   */
  private _hScaleShift: number;

  /**
   * Gets the horizontal scale shift.
   */
  public get hScaleShift(): number {
    return this._hScaleShift;
  }

  /**
   * Vertical scale shift.
   */
  private _vScaleShift: number;

  /**
   * Gets the vertical scale shift.
   */
  public get vScaleShift(): number {
    return this._vScaleShift;
  }

  /**
   * Initializes a new instance of the JpegComponentData class.
   *
   * @param {number} hSamples - Number of horizontal samples.
   * @param {number} maxHSamples - Maximum number of horizontal samples.
   * @param {number} vSamples - Number of vertical samples.
   * @param {number} maxVSamples - Maximum number of vertical samples.
   * @param {Array<Uint8Array | undefined>} lines - Array of lines, each line is an optional Uint8Array.
   */
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
