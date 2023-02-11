/** @format */

import { Point } from './point';

export class Rectangle {
  private readonly _left;
  private readonly _top;
  private readonly _right;
  private readonly _bottom;

  public get left(): number {
    return this._left;
  }

  public get top(): number {
    return this._top;
  }

  public get right(): number {
    return this._right;
  }

  public get bottom(): number {
    return this._bottom;
  }

  public get width(): number {
    return this._right - this._left;
  }

  public get height(): number {
    return this._bottom - this._top;
  }

  public get topLeft(): Point {
    return new Point(this._left, this._top);
  }

  public get topRight(): Point {
    return new Point(this._right, this._top);
  }

  public get bottomLeft(): Point {
    return new Point(this._left, this._bottom);
  }

  public get bottomRight(): Point {
    return new Point(this._right, this._bottom);
  }

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this._left = Math.min(x1, x2);
    this._top = Math.min(y1, y2);
    this._right = Math.max(x1, x2);
    this._bottom = Math.max(y1, y2);
  }

  public static fromXYWH(x: number, y: number, width: number, height: number) {
    return new Rectangle(x, y, x + width, y + height);
  }

  public static from(other: Rectangle) {
    return new Rectangle(other._left, other._top, other._right, other._bottom);
  }

  public toString(): string {
    return `${this.constructor.name} (l: ${this._left}, t: ${this._top}, r: ${this._right}, b: ${this._bottom}, w: ${this.width}, h: ${this.height})`;
  }
}
