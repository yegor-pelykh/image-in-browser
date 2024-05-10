/** @format */

export interface PvrColorRgbCore<T> {
  copy(): T;
  setMin(c: T): void;
  setMax(c: T): void;
}
