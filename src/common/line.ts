/** @format */

import { Point } from './point';

export class Line {
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;

  public get x1(): number {
    return this._x1;
  }

  public get y1(): number {
    return this._y1;
  }

  public get x2(): number {
    return this._x2;
  }

  public get y2(): number {
    return this._y2;
  }

  public get dx(): number {
    return this._x2 - this._x1;
  }

  public get dy(): number {
    return this._y2 - this._y1;
  }

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
  }

  public static from(other: Line) {
    return new Line(other.x1, other.y1, other.x2, other.y2);
  }

  public movePoint1(x: number, y: number) {
    this._x1 = x;
    this._y1 = y;
  }

  public movePoint2(x: number, y: number) {
    this._x2 = x;
    this._y2 = y;
  }

  public swapXY1() {
    const tmp = this._x1;
    this._x1 = this._y1;
    this._y1 = tmp;
  }

  public swapXY2() {
    const tmp = this._x2;
    this._x2 = this._y2;
    this._y2 = tmp;
  }

  public flipX() {
    const tmp = this._x1;
    this._x1 = this._x2;
    this._x2 = tmp;
  }

  public flipY() {
    const tmp = this._y1;
    this._y1 = this._y2;
    this._y2 = tmp;
  }

  public clone(): Line {
    return new Line(this._x1, this._y1, this._x2, this._y2);
  }

  public toString(): string {
    return `${this.constructor.name} (x1: ${this._x1}, y1: ${this._y1}, x2: ${this._x2}, y2: ${this._y2})`;
  }
}
