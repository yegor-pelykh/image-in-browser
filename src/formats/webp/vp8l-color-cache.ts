/** @format */

/**
 * Class representing a VP8L color cache.
 */
export class VP8LColorCache {
  /**
   * Array of color entries.
   * @private
   */
  private readonly _colors: Uint32Array;

  /**
   * Hash shift value calculated as 32 - hashBits.
   * @private
   */
  private readonly _hashShift: number;

  /**
   * Create a VP8LColorCache.
   * @param {number} hashBits - Number of bits for the hash.
   */
  constructor(hashBits: number) {
    this._colors = new Uint32Array(1 << hashBits);
    this._hashShift = 32 - hashBits;
  }

  /**
   * Insert a color into the cache.
   * @param {number} argb - The color value in ARGB format.
   */
  public insert(argb: number): void {
    const a = (argb * VP8LColorCache.hashMultiplier) & 0xffffffff;
    const key = a >>> this._hashShift;
    this._colors[key] = argb;
  }

  /**
   * Lookup a color in the cache.
   * @param {number} key - The key to lookup.
   * @returns {number} - The color value in ARGB format.
   */
  public lookup(key: number): number {
    return this._colors[key];
  }

  /**
   * Multiplier used in the hash function.
   * @private
   * @static
   */
  private static readonly hashMultiplier = 0x1e35a7bd;
}
