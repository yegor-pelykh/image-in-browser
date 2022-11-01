/** @format */

import { Point } from './point';

export class Rectangle {
  private _left = 0;
  private _top = 0;
  private _right = 0;
  private _bottom = 0;
  private _width = 0;
  private _height = 0;

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
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.initialize(x1, y1, x2, y2);
  }

  public static fromXYWH(x: number, y: number, width: number, height: number) {
    return new Rectangle(x, y, x + width, y + height);
  }

  public static from(other: Rectangle) {
    return new Rectangle(other.left, other.top, other.right, other.bottom);
  }

  private initialize(x1: number, y1: number, x2: number, y2: number) {
    this._left = Math.min(x1, x2);
    this._top = Math.min(y1, y2);
    this._right = Math.max(x1, x2);
    this._bottom = Math.max(y1, y2);
    this._width = this._right - this._left;
    this._height = this._bottom - this._top;
  }
}
