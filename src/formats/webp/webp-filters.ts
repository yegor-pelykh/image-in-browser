/** @format */

import { InputBuffer } from '../../common/input-buffer';

export class WebPFilters {
  private static predictLine(
    src: InputBuffer<Uint8Array>,
    pred: InputBuffer<Uint8Array>,
    dst: InputBuffer<Uint8Array>,
    length: number,
    inverse: boolean
  ): void {
    if (inverse) {
      for (let i = 0; i < length; ++i) {
        dst.set(i, src.get(i) + pred.get(i));
      }
    } else {
      for (let i = 0; i < length; ++i) {
        dst.set(i, src.get(i) - pred.get(i));
      }
    }
  }

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
    const s = new InputBuffer<Uint8Array>({
      buffer: src,
      offset: startOffset,
    });
    const o = new InputBuffer<Uint8Array>({
      buffer: src,
      offset: startOffset,
    });
    const preds = InputBuffer.from(inverse ? o : s);

    if (_row === 0) {
      // Leftmost pixel is the same as input for topmost scanline.
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

    // Filter line-by-line
    while (_row < lastRow) {
      // Leftmost pixel is predicted from above
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
    const s = new InputBuffer<Uint8Array>({
      buffer: src,
      offset: startOffset,
    });
    const o = new InputBuffer<Uint8Array>({
      buffer: out,
      offset: startOffset,
    });
    const preds = InputBuffer.from(inverse ? o : s);

    if (_row === 0) {
      // Very first top-left pixel is copied.
      o.set(0, s.get(0));
      // Rest of top scan-line is left-predicted.
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
      // We are starting from in-between. Make sure 'preds' points to prev row.
      preds.offset -= stride;
    }

    // Filter line-by-line.
    while (_row < lastRow) {
      this.predictLine(s, preds, o, width, inverse);
      ++_row;
      preds.offset += stride;
      s.offset += stride;
      o.offset += stride;
    }
  }

  private static gradientPredictor(a: number, b: number, c: number): number {
    const g = a + b - c;
    return (g & ~0xff) === 0
      ? g
      : g < 0
        ? 0
        : // clip to 8bit
          255;
  }

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
    const s = new InputBuffer<Uint8Array>({
      buffer: src,
      offset: startOffset,
    });
    const o = new InputBuffer<Uint8Array>({
      buffer: out,
      offset: startOffset,
    });
    const preds = InputBuffer.from(inverse ? o : s);

    // left prediction for top scan-line
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

    // Filter line-by-line.
    while (_row < lastRow) {
      // leftmost pixel: predict from above.
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

  // Filters
  public static readonly filterNone = 0;
  public static readonly filterHorizontal = 1;
  public static readonly filterVertical = 2;
  public static readonly fitlerGradient = 3;
  // End marker
  public static readonly fitlerLast = this.fitlerGradient + 1;
  public static readonly fitlerBest = 5;
  public static readonly filterFast = 6;

  public static readonly filters = [
    /**
     * WEBP_FILTER_NONE
     */
    undefined,
    /**
     * WEBP_FILTER_HORIZONTAL
     */
    this.horizontalFilter,
    /**
     * WEBP_FILTER_VERTICAL
     */
    this.verticalFilter,
    /**
     * WEBP_FILTER_GRADIENT
     */
    this.gradientFilter,
  ];

  public static readonly unfilters = [
    /**
     * WEBP_FILTER_NONE
     */
    undefined,
    /**
     * WEBP_FILTER_HORIZONTAL
     */
    this.horizontalUnfilter,
    /**
     * WEBP_FILTER_VERTICAL
     */
    this.verticalUnfilter,
    /**
     * WEBP_FILTER_GRADIENT
     */
    this.gradientUnfilter,
  ];
}
