/** @format */

import { Point } from './point';

export class Line {
  private _startX = 0;
  private _startY = 0;
  private _endX = 0;
  private _endY = 0;
  private _dx = 0;
  private _dy = 0;

  public get startX(): number {
    return this._startX;
  }

  public get startY(): number {
    return this._startY;
  }

  public get endX(): number {
    return this._endX;
  }

  public get endY(): number {
    return this._endY;
  }

  public get dx(): number {
    return this._dx;
  }

  public get dy(): number {
    return this._dy;
  }

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.initialize(x1, y1, x2, y2);
  }

  public static from(other: Line) {
    return new Line(other.startX, other.startY, other.endX, other.endY);
  }

  private initialize(x1: number, y1: number, x2: number, y2: number) {
    this._startX = Math.min(x1, x2);
    this._startY = Math.min(y1, y2);
    this._endX = Math.max(x1, x2);
    this._endY = Math.max(y1, y2);
    this._dx = this._endX - this._startX;
    this._dy = this._endY - this._startY;
  }

  public moveStart(x: number, y: number) {
    this.initialize(x, y, this._endX, this._endY);
  }

  public moveEnd(x: number, y: number) {
    this.initialize(this._startX, this._startY, x, y);
  }
}
