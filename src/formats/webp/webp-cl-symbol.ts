/** @format */

/**
 * Represents a code-length symbol used in WebP encoding/decoding.
 * Stores the symbol value, the number of extra bits, and the extra value.
 */
export class WebPClSymbol {
  /** The symbol value. */
  public readonly symbol: number;
  /** The number of extra bits associated with the symbol. */
  public readonly extraBits: number;
  /** The extra value associated with the symbol. */
  public readonly extraValue: number;

  /**
   * Constructs a new WebPClSymbol.
   * @param {number} symbol - The symbol value.
   * @param {number} extraBits - The number of extra bits.
   * @param {number} extraValue - The extra value.
   */
  constructor(symbol: number, extraBits: number, extraValue: number) {
    this.symbol = symbol;
    this.extraBits = extraBits;
    this.extraValue = extraValue;
  }
}
