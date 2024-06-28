/** @format */

/**
 * Represents a point in 2D space.
 */
export class Point {
  /**
   * The x-coordinate of the point.
   */
  private _x: number;

  /**
   * The y-coordinate of the point.
   */
  private _y: number;
  /**
   * Gets the x-coordinate of the point.
   * @returns {number} The x-coordinate.
   */
  public get x(): number {
    return this._x;
  }

  /**
   * Gets the y-coordinate of the point.
   * @returns {number} The y-coordinate.
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Gets the truncated x-coordinate of the point.
   * @returns {number} The truncated x-coordinate.
   */
  public get xt(): number {
    return Math.trunc(this.x);
  }

  /**
   * Gets the truncated y-coordinate of the point.
   * @returns {number} The truncated y-coordinate.
   */
  public get yt(): number {
    return Math.trunc(this.y);
  }

  /**
   * Creates an instance of Point.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a new Point from an existing Point.
   * @param {Point} other - The existing Point.
   * @returns {Point} A new Point instance.
   */
  public static from(other: Point): Point {
    return new Point(other._x, other._y);
  }

  /**
   * Moves the point to a new location.
   * @param {number} x - The new x-coordinate.
   * @param {number} y - The new y-coordinate.
   * @returns {Point} A new Point instance at the new location.
   */
  public move(x: number, y: number): Point {
    return new Point(x, y);
  }

  /**
   * Offsets the point by the given delta values.
   * @param {number} dx - The delta x value.
   * @param {number} dy - The delta y value.
   * @returns {Point} A new Point instance at the offset location.
   */
  public offset(dx: number, dy: number): Point {
    return this.move(this._x + dx, this._y + dy);
  }

  /**
   * Multiplies the coordinates of the point by a given factor.
   * @param {number} n - The factor to multiply by.
   * @returns {Point} A new Point instance with multiplied coordinates.
   */
  public mul(n: number): Point {
    return this.move(this._x * n, this._y * n);
  }

  /**
   * Adds the coordinates of another point to this point.
   * @param {Point} p - The other point.
   * @returns {Point} A new Point instance with added coordinates.
   */
  public add(p: Point): Point {
    return this.move(this._x + p._x, this._y + p._y);
  }

  /**
   * Checks if this point is equal to another point.
   * @param {Point} other - The other point.
   * @returns {boolean} True if the points are equal, otherwise false.
   */
  public equals(other: Point): boolean {
    return this._x === other._x && this._y === other._y;
  }

  /**
   * Returns a string representation of the point.
   * @returns {string} A string representing the point.
   */
  public toString(): string {
    return `${this.constructor.name} (x: ${this._x}, y: ${this._y})`;
  }
}
