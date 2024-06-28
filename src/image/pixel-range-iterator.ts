/** @format */

import { Pixel } from './pixel.js';

/**
 * Iterator class for iterating over a range of pixels.
 */
export class PixelRangeIterator implements Iterator<Pixel> {
  /**
   * The current pixel.
   */
  private _pixel: Pixel;

  /**
   * The starting x-coordinate of the range.
   */
  private _x1: number;

  /**
   * The starting y-coordinate of the range.
   */
  private _y1: number;

  /**
   * The ending x-coordinate of the range.
   */
  private _x2: number;

  /**
   * The ending y-coordinate of the range.
   */
  private _y2: number;

  /**
   * Constructs a new PixelRangeIterator.
   * @param {Pixel} pixel - The initial pixel.
   * @param {number} x - The starting x-coordinate.
   * @param {number} y - The starting y-coordinate.
   * @param {number} width - The width of the range.
   * @param {number} height - The height of the range.
   */
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

  /**
   * Returns the next pixel in the range.
   * @returns {IteratorResult<Pixel>} The next pixel in the range.
   */
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

  /**
   * Returns the iterator itself.
   * @returns {IterableIterator<Pixel>} The iterator itself.
   */
  public [Symbol.iterator](): IterableIterator<Pixel> {
    return this;
  }
}
