/** @format */

import { MathOperators } from '../common/math-operators';

export class Rational {
  private _numerator: number;
  public get numerator(): number {
    return this._numerator;
  }

  private _denominator: number;
  public get denominator(): number {
    return this._denominator;
  }

  public get asInt(): number {
    return this.denominator !== 0
      ? Math.trunc(this.numerator / this.denominator)
      : 0;
  }

  public get asDouble(): number {
    return this.denominator !== 0 ? this.numerator / this.denominator : 0;
  }

  constructor(numerator: number, denominator: number) {
    this._numerator = numerator;
    this._denominator = denominator;
  }

  public simplify(): void {
    const d = MathOperators.gcd(this.numerator, this.denominator);
    if (d !== 0) {
      this._numerator = Math.trunc(this.numerator / d);
      this._denominator = Math.trunc(this.denominator / d);
    }
  }

  public equalsTo(other: unknown) {
    return (
      other instanceof Rational &&
      this._numerator === other._numerator &&
      this._denominator === other._denominator
    );
  }

  public toString(): string {
    return `${this._numerator}/${this._denominator}`;
  }
}
