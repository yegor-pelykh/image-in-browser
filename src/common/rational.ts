/** @format */

import { MathUtils } from './math-utils.js';

/**
 * Represents a rational number.
 */
export class Rational {
  /**
   * The numerator of the rational number.
   */
  private _numerator: number;

  /**
   * Gets the numerator of the rational number.
   */
  public get numerator(): number {
    return this._numerator;
  }

  /**
   * The denominator of the rational number.
   */
  private _denominator: number;

  /**
   * Gets the denominator of the rational number.
   */
  public get denominator(): number {
    return this._denominator;
  }

  /**
   * Converts the rational number to an integer.
   */
  public get toInt(): number {
    return this.denominator !== 0
      ? Math.trunc(this.numerator / this.denominator)
      : 0;
  }

  /**
   * Converts the rational number to a double.
   */
  public get toDouble(): number {
    return this.denominator !== 0 ? this.numerator / this.denominator : 0;
  }

  /**
   * Constructs a new Rational instance.
   * @param {number} numerator - The numerator of the rational number.
   * @param {number} denominator - The denominator of the rational number.
   */
  constructor(numerator: number, denominator: number) {
    this._numerator = numerator;
    this._denominator = denominator;
  }

  /**
   * Simplifies the rational number.
   */
  public simplify(): void {
    const d = MathUtils.gcd(this.numerator, this.denominator);
    if (d !== 0) {
      this._numerator = Math.trunc(this.numerator / d);
      this._denominator = Math.trunc(this.denominator / d);
    }
  }

  /**
   * Checks if this rational number is equal to another.
   * @param {Rational} other - The other rational number to compare with.
   * @returns {boolean}
   */
  public equals(other: Rational): boolean {
    return (
      this._numerator === other._numerator &&
      this._denominator === other._denominator
    );
  }

  /**
   * Converts the rational number to a string representation.
   */
  public toString(): string {
    return `${this._numerator}/${this._denominator}`;
  }
}
