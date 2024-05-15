/** @format */

import { MathUtils } from './math-utils.js';
import { StringUtils } from './string-utils.js';

export class Rational {
  private _numerator: number;
  public get numerator(): number {
    return this._numerator;
  }

  private _denominator: number;
  public get denominator(): number {
    return this._denominator;
  }

  public get toInt(): number {
    return this.denominator !== 0
      ? Math.trunc(this.numerator / this.denominator)
      : 0;
  }

  public get toDouble(): number {
    return this.denominator !== 0 ? this.numerator / this.denominator : 0;
  }

  constructor(numerator: number, denominator: number) {
    this._numerator = numerator;
    this._denominator = denominator;
  }

  public simplify(): void {
    const d = MathUtils.gcd(this.numerator, this.denominator);
    if (d !== 0) {
      this._numerator = Math.trunc(this.numerator / d);
      this._denominator = Math.trunc(this.denominator / d);
    }
  }

  public equals(other: Rational) {
    return (
      this._numerator === other._numerator &&
      this._denominator === other._denominator
    );
  }

  public toString(): string {
    return `${this.constructor.name} (${this._numerator}/${this._denominator})`;
  }
}
