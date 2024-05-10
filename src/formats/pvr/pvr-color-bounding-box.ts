/** @format */

import { PvrColorRgbCore } from './pvr-color-rgb-core';

export type PvrColor = PvrColorRgbCore<PvrColor>;

export class PvrColorBoundingBox {
  private _min: PvrColor;
  public get min(): PvrColor {
    return this._min;
  }

  private _max: PvrColor;
  public get max(): PvrColor {
    return this._max;
  }

  constructor(min: PvrColor, max: PvrColor) {
    this._min = min.copy();
    this._max = max.copy();
  }

  public add(c: PvrColor): void {
    this._min.setMin(c);
    this._max.setMax(c);
  }
}
