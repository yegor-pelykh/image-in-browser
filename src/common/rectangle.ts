/** @format */

import { Point } from './point';

export class Rectangle {
  public left: number;
  public top: number;
  public right: number;
  public bottom: number;

  public get topLeft(): Point {
    return new Point(this.left, this.top);
  }

  public get topRight(): Point {
    return new Point(this.right, this.top);
  }

  public get bottomRight(): Point {
    return new Point(this.right, this.bottom);
  }

  public get bottomLeft(): Point {
    return new Point(this.left, this.bottom);
  }

  public get width(): number {
    return this.bottom - this.top;
  }

  public get height(): number {
    return this.right - this.left;
  }

  constructor(left: number, top: number, right: number, bottom: number) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  public static fromPosSize(
    left: number,
    top: number,
    width: number,
    height: number
  ) {
    return new Rectangle(left, top, left + width, top + height);
  }
}
