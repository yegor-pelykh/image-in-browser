/**
 * 2-dimensional point
 *
 * @format
 */

export class Point {
  private _x: number;
  private _y: number;

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get xt() {
    return Math.trunc(this.x);
  }

  public get yt() {
    return Math.trunc(this.y);
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public static from(other: Point): Point {
    return new Point(other._x, other._y);
  }

  public move(x: number, y: number): Point {
    this._x = x;
    this._y = y;
    return this;
  }

  public offset(dx: number, dy: number): Point {
    return this.move(this._x + dx, this._y + dy);
  }

  public mul(n: number): Point {
    return this.move(this._x * n, this._y * n);
  }

  public add(p: Point): Point {
    return this.move(this._x + p.x, this._y + p.y);
  }

  public equals(other: unknown) {
    return (
      other instanceof Point && this._x === other._x && this._y === other._y
    );
  }
}
