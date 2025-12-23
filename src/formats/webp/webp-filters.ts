/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

/**
 * Provides filter and unfilter operations for WebP images.
 */
export class WebPFilters {
  /** No filter constant. */
  public static readonly filterNone = 0;
  /** Horizontal filter constant. */
  public static readonly filterHorizontal = 1;
  /** Vertical filter constant. */
  public static readonly filterVertical = 2;
  /** Gradient filter constant. */
  public static readonly filterGradient = 3;
  /** End marker for filters. */
  public static readonly filterLast = WebPFilters.filterGradient + 1;
  /** Best filter constant. */
  public static readonly filterBest = 5;
  /** Fast filter constant. */
  public static readonly filterFast = 6;

  /** Array of filter functions. */
  public static readonly filters = [
    undefined,
    WebPFilters.horizontalFilter,
    WebPFilters.verticalFilter,
    WebPFilters.gradientFilter,
  ];

  /** Array of unfilter functions. */
  public static readonly unfilters = [
    undefined,
    WebPFilters.horizontalUnfilter,
    WebPFilters.verticalUnfilter,
    WebPFilters.gradientUnfilter,
  ];

  /**
   * Predicts a line of pixels using previous data.
   */
  private static predictLine(
    src: InputBuffer<Uint8Array>,
    pred: InputBuffer<Uint8Array>,
    dst: InputBuffer<Uint8Array>,
    length: number,
    inverse: boolean
  ): void {
    if (inverse) {
      for (let i = 0; i < length; ++i) dst.set(i, src.get(i) + pred.get(i));
    } else {
      for (let i = 0; i < length; ++i) dst.set(i, src.get(i) - pred.get(i));
    }
  }

  /**
   * Applies horizontal filter or unfilter to image data.
   */
  private static doHorizontalFilter(
    src: Uint8Array,
    width: number,
    _height: number,
    stride: number,
    row: number,
    numRows: number,
    inverse: boolean,
    _out: Uint8Array
  ): void {
    let _row = row;
    const startOffset = _row * stride;
    const lastRow = _row + numRows;
    const s = new InputBuffer<Uint8Array>({ buffer: src, offset: startOffset });
    const o = new InputBuffer<Uint8Array>({ buffer: src, offset: startOffset });
    const preds = InputBuffer.from(inverse ? o : s);
    if (_row === 0) {
      o.set(0, s.get(0));
      this.predictLine(
        InputBuffer.from(s, 1),
        preds,
        InputBuffer.from(o, 1),
        width - 1,
        inverse
      );
      _row = 1;
      preds.offset += stride;
      s.offset += stride;
      o.offset += stride;
    }
    while (_row < lastRow) {
      this.predictLine(s, InputBuffer.from(preds, -stride), o, 1, inverse);
      this.predictLine(
        InputBuffer.from(s, 1),
        preds,
        InputBuffer.from(o, 1),
        width - 1,
        inverse
      );
      ++_row;
      preds.offset += stride;
      s.offset += stride;
      o.offset += stride;
    }
  }

  /**
   * Applies vertical filter or unfilter to image data.
   */
  private static doVerticalFilter(
    src: Uint8Array,
    width: number,
    _height: number,
    stride: number,
    row: number,
    numRows: number,
    inverse: boolean,
    out: Uint8Array
  ): void {
    let _row = row;
    const startOffset = _row * stride;
    const lastRow = _row + numRows;
    const s = new InputBuffer<Uint8Array>({ buffer: src, offset: startOffset });
    const o = new InputBuffer<Uint8Array>({ buffer: out, offset: startOffset });
    const preds = InputBuffer.from(inverse ? o : s);
    if (_row === 0) {
      o.set(0, s.get(0));
      this.predictLine(
        InputBuffer.from(s, 1),
        preds,
        InputBuffer.from(o, 1),
        width - 1,
        inverse
      );
      _row = 1;
      s.offset += stride;
      o.offset += stride;
    } else {
      preds.offset -= stride;
    }
    while (_row < lastRow) {
      this.predictLine(s, preds, o, width, inverse);
      ++_row;
      preds.offset += stride;
      s.offset += stride;
      o.offset += stride;
    }
  }

  /**
   * Predicts a gradient value for filtering.
   */
  private static gradientPredictor(a: number, b: number, c: number): number {
    const g = a + b - c;
    return (g & ~0xff) === 0 ? g : g < 0 ? 0 : 255;
  }

  /**
   * Applies gradient filter or unfilter to image data.
   */
  private static doGradientFilter(
    src: Uint8Array,
    width: number,
    _height: number,
    stride: number,
    row: number,
    numRows: number,
    inverse: boolean,
    out: Uint8Array
  ): void {
    let _row = row;
    const startOffset = _row * stride;
    const lastRow = _row + numRows;
    const s = new InputBuffer<Uint8Array>({ buffer: src, offset: startOffset });
    const o = new InputBuffer<Uint8Array>({ buffer: out, offset: startOffset });
    const preds = InputBuffer.from(inverse ? o : s);
    if (_row === 0) {
      o.set(0, s.get(0));
      this.predictLine(
        InputBuffer.from(s, 1),
        preds,
        InputBuffer.from(o, 1),
        width - 1,
        inverse
      );
      _row = 1;
      preds.offset += stride;
      s.offset += stride;
      o.offset += stride;
    }
    while (_row < lastRow) {
      this.predictLine(s, InputBuffer.from(preds, -stride), o, 1, inverse);
      for (let w = 1; w < width; ++w) {
        const pred = this.gradientPredictor(
          preds.get(w - 1),
          preds.get(w - stride),
          preds.get(w - stride - 1)
        );
        o.set(w, s.get(w) + (inverse ? pred : -pred));
      }
      ++_row;
      preds.offset += stride;
      s.offset += stride;
      o.offset += stride;
    }
  }

  /**
   * Applies horizontal filter to image data.
   */
  private static horizontalFilter(
    data: Uint8Array,
    width: number,
    height: number,
    stride: number,
    filteredData: Uint8Array
  ): void {
    WebPFilters.doHorizontalFilter(
      data,
      width,
      height,
      stride,
      0,
      height,
      false,
      filteredData
    );
  }

  /**
   * Applies horizontal unfilter to image data.
   */
  private static horizontalUnfilter(
    width: number,
    height: number,
    stride: number,
    row: number,
    numRows: number,
    data: Uint8Array
  ): void {
    WebPFilters.doHorizontalFilter(
      data,
      width,
      height,
      stride,
      row,
      numRows,
      true,
      data
    );
  }

  /**
   * Applies vertical filter to image data.
   */
  private static verticalFilter(
    data: Uint8Array,
    width: number,
    height: number,
    stride: number,
    filteredData: Uint8Array
  ): void {
    WebPFilters.doVerticalFilter(
      data,
      width,
      height,
      stride,
      0,
      height,
      false,
      filteredData
    );
  }

  /**
   * Applies vertical unfilter to image data.
   */
  private static verticalUnfilter(
    width: number,
    height: number,
    stride: number,
    row: number,
    numRows: number,
    data: Uint8Array
  ): void {
    WebPFilters.doVerticalFilter(
      data,
      width,
      height,
      stride,
      row,
      numRows,
      true,
      data
    );
  }

  /**
   * Applies gradient filter to image data.
   */
  private static gradientFilter(
    data: Uint8Array,
    width: number,
    height: number,
    stride: number,
    filteredData: Uint8Array
  ): void {
    WebPFilters.doGradientFilter(
      data,
      width,
      height,
      stride,
      0,
      height,
      false,
      filteredData
    );
  }

  /**
   * Applies gradient unfilter to image data.
   */
  private static gradientUnfilter(
    width: number,
    height: number,
    stride: number,
    row: number,
    numRows: number,
    data: Uint8Array
  ): void {
    WebPFilters.doGradientFilter(
      data,
      width,
      height,
      stride,
      row,
      numRows,
      true,
      data
    );
  }
}
