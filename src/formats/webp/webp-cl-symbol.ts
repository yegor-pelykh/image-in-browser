/**
 * A code-length symbol with optional extra bits.
 *
 * @format
 */

export class WebPClSymbol {
  public readonly symbol: number;
  public readonly extraBits: number;
  public readonly extraValue: number;

  constructor(symbol: number, extraBits: number, extraValue: number) {
    this.symbol = symbol;
    this.extraBits = extraBits;
    this.extraValue = extraValue;
  }
}
