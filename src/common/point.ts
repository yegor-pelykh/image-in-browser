/**
 * 2-dimensional point
 *
 * @format
 */

export class Point {
  public x: number;
  public y: number;

  public get xt() {
    return Math.trunc(this.x);
  }

  public get yt() {
    return Math.trunc(this.y);
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static from(other: Point) {
    return new Point(other.x, other.y);
  }

  public mul(s: number) {
    return new Point(this.x * s, this.y * s);
  }

  public add(rhs: Point) {
    return new Point(this.x + rhs.x, this.y + rhs.y);
  }

  public equals(other: unknown) {
    return other instanceof Point && this.x === other.x && this.y === other.y;
  }
}
