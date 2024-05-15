/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { VP8L } from './vp8l.js';
import { VP8LImageTransformType } from './vp8l-image-transform-type.js';
import { VP8LInternal } from './vp8l-internal.js';
import { VP8LMultipliers } from './vp8l-multipliers.js';

export class VP8LTransform {
  private _type: VP8LImageTransformType = VP8LImageTransformType.predictor;
  public get type(): VP8LImageTransformType {
    return this._type;
  }
  public set type(v: VP8LImageTransformType) {
    this._type = v;
  }

  private _xsize: number = 0;
  public get xsize(): number {
    return this._xsize;
  }
  public set xsize(v: number) {
    this._xsize = v;
  }

  private _ysize: number = 0;
  public get ysize(): number {
    return this._ysize;
  }
  public set ysize(v: number) {
    this._ysize = v;
  }

  private _data?: Uint32Array;
  public get data(): Uint32Array | undefined {
    return this._data;
  }
  public set data(v: Uint32Array | undefined) {
    this._data = v;
  }

  private _bits: number = 0;
  public get bits(): number {
    return this._bits;
  }
  public set bits(v: number) {
    this._bits = v;
  }

  public inverseTransform(
    rowStart: number,
    rowEnd: number,
    inData: Uint32Array,
    rowsIn: number,
    outData: Uint32Array,
    rowsOut: number
  ): void {
    const width = this._xsize;

    switch (this._type) {
      case VP8LImageTransformType.subtractGreen:
        this.addGreenToBlueAndRed(
          outData,
          rowsOut,
          rowsOut + (rowEnd - rowStart) * width
        );
        break;
      case VP8LImageTransformType.predictor:
        this.predictorInverseTransform(rowStart, rowEnd, outData, rowsOut);
        if (rowEnd !== this._ysize) {
          // The last predicted row in this iteration will be the top-pred row
          // for the first row in next iteration.
          const start = rowsOut - width;
          const end = start + width;
          const offset = rowsOut + (rowEnd - rowStart - 1) * width;
          ArrayUtils.copyRange(inData, offset, outData, start, end - start);
        }
        break;
      case VP8LImageTransformType.crossColor:
        this.colorSpaceInverseTransform(rowStart, rowEnd, outData, rowsOut);
        break;
      case VP8LImageTransformType.colorIndexing:
        if (rowsIn === rowsOut && this._bits > 0) {
          // Move packed pixels to the end of unpacked region, so that unpacking
          // can occur seamlessly.
          // Also, note that this is the only transform that applies on
          // the effective width of VP8LSubSampleSize(xsize, bits). All other
          // transforms work on effective width of xsize.
          const outStride = (rowEnd - rowStart) * width;
          const inStride =
            (rowEnd - rowStart) *
            VP8LInternal.subSampleSize(this._xsize, this._bits);

          const src = rowsOut + outStride - inStride;
          ArrayUtils.copyRange(inData, rowsOut, outData, src, inStride);

          this.colorIndexInverseTransform(
            rowStart,
            rowEnd,
            inData,
            src,
            outData,
            rowsOut
          );
        } else {
          this.colorIndexInverseTransform(
            rowStart,
            rowEnd,
            inData,
            rowsIn,
            outData,
            rowsOut
          );
        }
        break;
    }
  }

  public colorIndexInverseTransformAlpha(
    yStart: number,
    yEnd: number,
    src: InputBuffer<Uint8Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    const bitsPerPixel = 8 >>> this._bits;
    const width = this._xsize;
    const colorMap = this._data;
    if (bitsPerPixel < 8) {
      const pixelsPerByte = 1 << this._bits;
      const countMask = pixelsPerByte - 1;
      const bitMask = (1 << bitsPerPixel) - 1;
      for (let y = yStart; y < yEnd; ++y) {
        let packedPixels = 0;
        for (let x = 0; x < width; ++x) {
          if ((x & countMask) === 0) {
            packedPixels = VP8LTransform.getAlphaIndex(src.get(0));
            src.offset++;
          }
          const p = VP8LTransform.getAlphaValue(
            colorMap![packedPixels & bitMask]
          );
          dst.set(0, p);
          dst.offset++;
          packedPixels >>>= bitsPerPixel;
        }
      }
    } else {
      for (let y = yStart; y < yEnd; ++y) {
        for (let x = 0; x < width; ++x) {
          const index = VP8LTransform.getAlphaIndex(src.get(0));
          src.offset++;
          dst.set(0, VP8LTransform.getAlphaValue(colorMap![index]));
          dst.offset++;
        }
      }
    }
  }

  public colorIndexInverseTransform(
    yStart: number,
    yEnd: number,
    inData: Uint32Array,
    src: number,
    outData: Uint32Array,
    dst: number
  ): void {
    let _src = src;
    let _dst = dst;
    const bitsPerPixel = 8 >>> this._bits;
    const width = this._xsize;
    const colorMap = this._data;
    if (bitsPerPixel < 8) {
      const pixelsPerByte = 1 << this._bits;
      const countMask = pixelsPerByte - 1;
      const bitMask = (1 << bitsPerPixel) - 1;
      for (let y = yStart; y < yEnd; ++y) {
        let packedPixels = 0;
        for (let x = 0; x < width; ++x) {
          if ((x & countMask) === 0) {
            packedPixels = VP8LTransform.getARGBIndex(inData[_src++]);
          }
          outData[_dst++] = VP8LTransform.getARGBValue(
            colorMap![packedPixels & bitMask]
          );
          packedPixels >>>= bitsPerPixel;
        }
      }
    } else {
      for (let y = yStart; y < yEnd; ++y) {
        for (let x = 0; x < width; ++x) {
          outData[_dst++] = VP8LTransform.getARGBValue(
            colorMap![VP8LTransform.getARGBIndex(inData[_src++])]
          );
        }
      }
    }
  }

  // Color space inverse transform
  public colorSpaceInverseTransform(
    yStart: number,
    yEnd: number,
    outData: Uint32Array,
    data: number
  ): void {
    let _data = data;
    const width = this._xsize;
    const mask = (1 << this._bits) - 1;
    const tilesPerRow = VP8LInternal.subSampleSize(width, this._bits);
    let y = yStart;
    let predRow = (y >>> this._bits) * tilesPerRow;

    while (y < yEnd) {
      let pred = predRow;
      const m = new VP8LMultipliers();

      for (let x = 0; x < width; ++x) {
        if ((x & mask) === 0) {
          m.colorCode = this._data![pred++];
        }

        outData[_data + x] = m.transformColor(outData[_data + x], true);
      }

      _data += width;
      ++y;

      if ((y & mask) === 0) {
        predRow += tilesPerRow;
      }
    }
  }

  /**
   * Inverse prediction
   */
  public predictorInverseTransform(
    yStart: number,
    yEnd: number,
    outData: Uint32Array,
    data: number
  ): void {
    let _data = data;
    let _yStart = yStart;
    const width = this._xsize;
    if (_yStart === 0) {
      // First Row follows the L (mode=1) mode.
      const pred0 = VP8LTransform.predictor0(outData, outData[_data - 1], 0);
      VP8LTransform.addPixelsEq(outData, _data, pred0);
      for (let x = 1; x < width; ++x) {
        const pred1 = VP8LTransform.predictor1(
          outData,
          outData[_data + x - 1],
          0
        );
        VP8LTransform.addPixelsEq(outData, _data + x, pred1);
      }
      _data += width;
      ++_yStart;
    }

    let y = _yStart;
    const mask = (1 << this._bits) - 1;
    const tilesPerRow = VP8LInternal.subSampleSize(width, this._bits);
    let predModeBase = (y >>> this._bits) * tilesPerRow;

    while (y < yEnd) {
      const pred2 = VP8LTransform.predictor2(
        outData,
        outData[_data - 1],
        _data - width
      );
      let predModeSrc = predModeBase;

      // First pixel follows the T (mode=2) mode.
      VP8LTransform.addPixelsEq(outData, _data, pred2);

      // .. the rest:
      const k = (this._data![predModeSrc++] >>> 8) & 0xf;

      let predFunc = VP8LTransform.predictors[k];
      for (let x = 1; x < width; ++x) {
        if ((x & mask) === 0) {
          // start of tile. Read predictor function.
          const k = (this._data![predModeSrc++] >>> 8) & 0xf;
          predFunc = VP8LTransform.predictors[k];
        }
        const d = outData[_data + x - 1];
        const pred = predFunc.call(this, outData, d, _data + x - width);
        VP8LTransform.addPixelsEq(outData, _data + x, pred);
      }

      _data += width;
      ++y;

      if ((y & mask) === 0) {
        // Use the same mask, since tiles are squares.
        predModeBase += tilesPerRow;
      }
    }
  }

  /**
   * Add green to blue and red channels
   */
  public addGreenToBlueAndRed(
    pixels: Uint32Array,
    data: number,
    dataEnd: number
  ): void {
    let _data = data;
    while (_data < dataEnd) {
      const argb = pixels[_data];
      const green = (argb >>> 8) & 0xff;
      let redBlue = argb & 0x00ff00ff;
      redBlue += (green << 16) | green;
      redBlue &= 0x00ff00ff;
      pixels[_data++] = (argb & 0xff00ff00) | redBlue;
    }
  }

  private static getARGBIndex(idx: number): number {
    return (idx >>> 8) & 0xff;
  }

  private static getAlphaIndex(idx: number): number {
    return idx;
  }

  private static getARGBValue(val: number): number {
    return val;
  }

  private static getAlphaValue(val: number): number {
    return (val >>> 8) & 0xff;
  }

  // In-place sum of each component with mod 256.
  private static addPixelsEq(pixels: Uint32Array, a: number, b: number): void {
    const pa = pixels[a];
    const alphaAndGreen = (pa & 0xff00ff00) + (b & 0xff00ff00);
    const redAndBlue = (pa & 0x00ff00ff) + (b & 0x00ff00ff);
    pixels[a] = (alphaAndGreen & 0xff00ff00) | (redAndBlue & 0x00ff00ff);
  }

  private static average2(a0: number, a1: number): number {
    return (((a0 ^ a1) & 0xfefefefe) >>> 1) + (a0 & a1);
  }

  private static average3(a0: number, a1: number, a2: number): number {
    return this.average2(this.average2(a0, a2), a1);
  }

  private static average4(
    a0: number,
    a1: number,
    a2: number,
    a3: number
  ): number {
    return this.average2(this.average2(a0, a1), this.average2(a2, a3));
  }

  /**
   * Return 0, when a is a negative integer.
   * Return 255, when a is positive.
   */
  private static clip255(a: number): number {
    if (a < 0) {
      return 0;
    }
    if (a > 255) {
      return 255;
    }
    return a;
  }

  private static addSubtractComponentFull(
    a: number,
    b: number,
    c: number
  ): number {
    return this.clip255(a + b - c);
  }

  private static clampedAddSubtractFull(
    c0: number,
    c1: number,
    c2: number
  ): number {
    const a = this.addSubtractComponentFull(c0 >>> 24, c1 >>> 24, c2 >>> 24);
    const r = this.addSubtractComponentFull(
      (c0 >>> 16) & 0xff,
      (c1 >>> 16) & 0xff,
      (c2 >>> 16) & 0xff
    );
    const g = this.addSubtractComponentFull(
      (c0 >>> 8) & 0xff,
      (c1 >>> 8) & 0xff,
      (c2 >>> 8) & 0xff
    );
    const b = this.addSubtractComponentFull(c0 & 0xff, c1 & 0xff, c2 & 0xff);
    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  private static addSubtractComponentHalf(a: number, b: number): number {
    return this.clip255(a + Math.trunc((a - b) / 2));
  }

  private static clampedAddSubtractHalf(
    c0: number,
    c1: number,
    c2: number
  ): number {
    const avg = this.average2(c0, c1);
    const a = this.addSubtractComponentHalf(avg >>> 24, c2 >>> 24);
    const r = this.addSubtractComponentHalf(
      (avg >>> 16) & 0xff,
      (c2 >>> 16) & 0xff
    );
    const g = this.addSubtractComponentHalf(
      (avg >>> 8) & 0xff,
      (c2 >>> 8) & 0xff
    );
    const b = this.addSubtractComponentHalf(
      (avg >>> 0) & 0xff,
      (c2 >>> 0) & 0xff
    );
    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  private static sub3(a: number, b: number, c: number): number {
    const pb = b - c;
    const pa = a - c;
    return Math.abs(pb) - Math.abs(pa);
  }

  private static select(a: number, b: number, c: number): number {
    const paMinusPb =
      this.sub3(a >>> 24, b >>> 24, c >>> 24) +
      this.sub3((a >>> 16) & 0xff, (b >>> 16) & 0xff, (c >>> 16) & 0xff) +
      this.sub3((a >>> 8) & 0xff, (b >>> 8) & 0xff, (c >>> 8) & 0xff) +
      this.sub3(a & 0xff, b & 0xff, c & 0xff);
    return paMinusPb <= 0 ? a : b;
  }

  //--------------------------------------------------------------------------
  // Predictors
  //--------------------------------------------------------------------------

  private static predictor0(
    _pixels: Uint32Array,
    _left: number,
    _top: number
  ): number {
    return VP8L.argbBlack;
  }

  private static predictor1(
    _pixels: Uint32Array,
    left: number,
    _top: number
  ): number {
    return left;
  }

  private static predictor2(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return pixels[top];
  }

  private static predictor3(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return pixels[top + 1];
  }

  private static predictor4(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return pixels[top - 1];
  }

  private static predictor5(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average3(left, pixels[top], pixels[top + 1]);
  }

  private static predictor6(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average2(left, pixels[top - 1]);
  }

  private static predictor7(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average2(left, pixels[top]);
  }

  private static predictor8(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return VP8LTransform.average2(pixels[top - 1], pixels[top]);
  }

  private static predictor9(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return VP8LTransform.average2(pixels[top], pixels[top + 1]);
  }

  private static predictor10(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average4(
      left,
      pixels[top - 1],
      pixels[top],
      pixels[top + 1]
    );
  }

  private static predictor11(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.select(pixels[top], left, pixels[top - 1]);
  }

  private static predictor12(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.clampedAddSubtractFull(
      left,
      pixels[top],
      pixels[top - 1]
    );
  }

  private static predictor13(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.clampedAddSubtractHalf(
      left,
      pixels[top],
      pixels[top - 1]
    );
  }

  private static readonly predictors = [
    this.predictor0,
    this.predictor1,
    this.predictor2,
    this.predictor3,
    this.predictor4,
    this.predictor5,
    this.predictor6,
    this.predictor7,
    this.predictor8,
    this.predictor9,
    this.predictor10,
    this.predictor11,
    this.predictor12,
    this.predictor13,
    this.predictor0,
    this.predictor0,
  ];
}
