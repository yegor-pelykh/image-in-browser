/** @format */

import { Pixel } from './pixel.js';

export class PixelRangeIterator implements Iterator<Pixel> {
  private _pixel: Pixel;
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;

  constructor(
    pixel: Pixel,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this._pixel = pixel;
    this._x1 = x;
    this._y1 = y;
    this._x2 = x + width - 1;
    this._y2 = y + height - 1;
    this._pixel.setPosition(x - 1, y);
  }

  public next(): IteratorResult<Pixel> {
    if (this._pixel.x + 1 > this._x2) {
      this._pixel.setPosition(this._x1, this._pixel.y + 1);
      return {
        done: this._pixel.y > this._y2,
        value: this._pixel,
      };
    }
    return this._pixel.next();
  }

  public [Symbol.iterator](): IterableIterator<Pixel> {
    return this;
  }
}
