/** @format */

import { Point } from './point.js';

/**
 * Represents a rectangle defined by its left, top, right, and bottom edges.
 */
export class Rectangle {
  /**
   * The left edge of the rectangle.
   */
  private readonly _left: number;

  /**
   * The top edge of the rectangle.
   */
  private readonly _top: number;

  /**
   * The right edge of the rectangle.
   */
  private readonly _right: number;

  /**
   * The bottom edge of the rectangle.
   */
  private readonly _bottom: number;

  /**
   * Gets the left edge of the rectangle.
   * @returns {number} The left edge.
   */
  public get left(): number {
    return this._left;
  }

  /**
   * Gets the top edge of the rectangle.
   * @returns {number} The top edge.
   */
  public get top(): number {
    return this._top;
  }

  /**
   * Gets the right edge of the rectangle.
   * @returns {number} The right edge.
   */
  public get right(): number {
    return this._right;
  }

  /**
   * Gets the bottom edge of the rectangle.
   * @returns {number} The bottom edge.
   */
  public get bottom(): number {
    return this._bottom;
  }

  /**
   * Gets the width of the rectangle.
   * @returns {number} The width.
   */
  public get width(): number {
    return this._right - this._left;
  }

  /**
   * Gets the height of the rectangle.
   * @returns {number} The height.
   */
  public get height(): number {
    return this._bottom - this._top;
  }

  /**
   * Gets the top-left corner of the rectangle as a Point.
   * @returns {Point} The top-left corner.
   */
  public get topLeft(): Point {
    return new Point(this._left, this._top);
  }

  /**
   * Gets the top-right corner of the rectangle as a Point.
   * @returns {Point} The top-right corner.
   */
  public get topRight(): Point {
    return new Point(this._right, this._top);
  }

  /**
   * Gets the bottom-left corner of the rectangle as a Point.
   * @returns {Point} The bottom-left corner.
   */
  public get bottomLeft(): Point {
    return new Point(this._left, this._bottom);
  }

  /**
   * Gets the bottom-right corner of the rectangle as a Point.
   * @returns {Point} The bottom-right corner.
   */
  public get bottomRight(): Point {
    return new Point(this._right, this._bottom);
  }

  /**
   * Initializes a new instance of the Rectangle class.
   * @param {number} x1 - The x-coordinate of the first point.
   * @param {number} y1 - The y-coordinate of the first point.
   * @param {number} x2 - The x-coordinate of the second point.
   * @param {number} y2 - The y-coordinate of the second point.
   */
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this._left = Math.min(x1, x2);
    this._top = Math.min(y1, y2);
    this._right = Math.max(x1, x2);
    this._bottom = Math.max(y1, y2);
  }

  /**
   * Creates a new Rectangle from the specified coordinates and dimensions.
   * @param {number} x - The x-coordinate of the top-left corner.
   * @param {number} y - The y-coordinate of the top-left corner.
   * @param {number} width - The width of the rectangle.
   * @param {number} height - The height of the rectangle.
   * @returns {Rectangle} A new Rectangle instance.
   */
  public static fromXYWH(
    x: number,
    y: number,
    width: number,
    height: number
  ): Rectangle {
    return new Rectangle(x, y, x + width, y + height);
  }

  /**
   * Creates a new Rectangle from an existing Rectangle.
   * @param {Rectangle} other - The existing Rectangle.
   * @returns {Rectangle} A new Rectangle instance.
   */
  public static from(other: Rectangle): Rectangle {
    return new Rectangle(other._left, other._top, other._right, other._bottom);
  }

  /**
   * Returns a string representation of the rectangle.
   * @returns {string} A string representation.
   */
  public toString(): string {
    return `${this.constructor.name} (l: ${this._left}, t: ${this._top}, r: ${this._right}, b: ${this._bottom}, w: ${this.width}, h: ${this.height})`;
  }
}
