/** @format */

export class VP8LColorCache {
  /**
   * Color entries
   */
  private readonly _colors: Uint32Array;
  /**
   * Hash shift: 32 - hashBits
   */
  private readonly _hashShift: number;

  constructor(hashBits: number) {
    this._colors = new Uint32Array(1 << hashBits);
    this._hashShift = 32 - hashBits;
  }

  public insert(argb: number): void {
    const a = (argb * VP8LColorCache.hashMultiplier) & 0xffffffff;
    const key = a >>> this._hashShift;
    this._colors[key] = argb;
  }

  public lookup(key: number): number {
    return this._colors[key];
  }

  private static readonly hashMultiplier = 0x1e35a7bd;
}
