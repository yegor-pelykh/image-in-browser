/** @format */

/**
 * Represents a line segment in a 2D space.
 */
export class Line {
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;

  /**
   * Gets the x-coordinate of the first point.
   * @returns {number} The x-coordinate of the first point.
   */
  public get x1(): number {
    return this._x1;
  }

  /**
   * Gets the y-coordinate of the first point.
   * @returns {number} The y-coordinate of the first point.
   */
  public get y1(): number {
    return this._y1;
  }

  /**
   * Gets the x-coordinate of the second point.
   * @returns {number} The x-coordinate of the second point.
   */
  public get x2(): number {
    return this._x2;
  }

  /**
   * Gets the y-coordinate of the second point.
   * @returns {number} The y-coordinate of the second point.
   */
  public get y2(): number {
    return this._y2;
  }

  /**
   * Gets the difference in x-coordinates between the two points.
   * @returns {number} The difference in x-coordinates.
   */
  public get dx(): number {
    return this._x2 - this._x1;
  }

  /**
   * Gets the difference in y-coordinates between the two points.
   * @returns {number} The difference in y-coordinates.
   */
  public get dy(): number {
    return this._y2 - this._y1;
  }

  /**
   * Creates an instance of Line.
   * @param {number} x1 - The x-coordinate of the first point.
   * @param {number} y1 - The y-coordinate of the first point.
   * @param {number} x2 - The x-coordinate of the second point.
   * @param {number} y2 - The y-coordinate of the second point.
   */
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
  }

  /**
   * Creates a new Line instance from an existing one.
   * @param {Line} other - The existing Line instance.
   * @returns {Line} A new Line instance.
   */
  public static from(other: Line): Line {
    return new Line(other.x1, other.y1, other.x2, other.y2);
  }

  /**
   * Moves the first point to a new location.
   * @param {number} x - The new x-coordinate of the first point.
   * @param {number} y - The new y-coordinate of the first point.
   */
  public movePoint1(x: number, y: number): void {
    this._x1 = x;
    this._y1 = y;
  }

  /**
   * Moves the second point to a new location.
   * @param {number} x - The new x-coordinate of the second point.
   * @param {number} y - The new y-coordinate of the second point.
   */
  public movePoint2(x: number, y: number): void {
    this._x2 = x;
    this._y2 = y;
  }

  /**
   * Swaps the x and y coordinates of the first point.
   */
  public swapXY1(): void {
    const tmp = this._x1;
    this._x1 = this._y1;
    this._y1 = tmp;
  }

  /**
   * Swaps the x and y coordinates of the second point.
   */
  public swapXY2(): void {
    const tmp = this._x2;
    this._x2 = this._y2;
    this._y2 = tmp;
  }

  /**
   * Flips the x-coordinates of the two points.
   */
  public flipX(): void {
    const tmp = this._x1;
    this._x1 = this._x2;
    this._x2 = tmp;
  }

  /**
   * Flips the y-coordinates of the two points.
   */
  public flipY(): void {
    const tmp = this._y1;
    this._y1 = this._y2;
    this._y2 = tmp;
  }

  /**
   * Creates a new Line instance that is a copy of the current instance.
   * @returns {Line} A new Line instance.
   */
  public clone(): Line {
    return new Line(this._x1, this._y1, this._x2, this._y2);
  }

  /**
   * Returns a string representation of the Line instance.
   * @returns {string} A string representation of the Line instance.
   */
  public toString(): string {
    return `${this.constructor.name} (x1: ${this._x1}, y1: ${this._y1}, x2: ${this._x2}, y2: ${this._y2})`;
  }
}
