/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { VP8L } from './vp8l.js';
import { VP8LImageTransformType } from './vp8l-image-transform-type.js';
import { VP8LInternal } from './vp8l-internal.js';
import { VP8LMultipliers } from './vp8l-multipliers.js';

/**
 * Class representing a VP8L Transform.
 */
export class VP8LTransform {
  /**
   * Type of the transform.
   */
  private _type: VP8LImageTransformType = VP8LImageTransformType.predictor;

  /**
   * Gets the type of the transform.
   */
  public get type(): VP8LImageTransformType {
    return this._type;
  }

  /**
   * Sets the type of the transform.
   */
  public set type(v: VP8LImageTransformType) {
    this._type = v;
  }

  /**
   * Width of the transform.
   */
  private _xsize: number = 0;

  /**
   * Gets the width of the transform.
   */
  public get xsize(): number {
    return this._xsize;
  }

  /**
   * Sets the width of the transform.
   */
  public set xsize(v: number) {
    this._xsize = v;
  }

  /**
   * Height of the transform.
   */
  private _ysize: number = 0;

  /**
   * Gets the height of the transform.
   */
  public get ysize(): number {
    return this._ysize;
  }

  /**
   * Sets the height of the transform.
   */
  public set ysize(v: number) {
    this._ysize = v;
  }

  /**
   * Data of the transform.
   */
  private _data?: Uint32Array;

  /**
   * Gets the data of the transform.
   */
  public get data(): Uint32Array | undefined {
    return this._data;
  }

  /**
   * Sets the data of the transform.
   */
  public set data(v: Uint32Array | undefined) {
    this._data = v;
  }

  /**
   * Bits of the transform.
   */
  private _bits: number = 0;

  /**
   * Gets the bits of the transform.
   */
  public get bits(): number {
    return this._bits;
  }

  /**
   * Sets the bits of the transform.
   */
  public set bits(v: number) {
    this._bits = v;
  }

  /**
   * Applies the inverse transform.
   * @param {number} rowStart - The starting row.
   * @param {number} rowEnd - The ending row.
   * @param {Uint32Array} inData - Input data array.
   * @param {number} rowsIn - Number of input rows.
   * @param {Uint32Array} outData - Output data array.
   * @param {number} rowsOut - Number of output rows.
   */
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

  /**
   * Applies the color index inverse transform for alpha channel.
   * @param {number} yStart - The starting row.
   * @param {number} yEnd - The ending row.
   * @param {InputBuffer<Uint8Array>} src - Source input buffer.
   * @param {InputBuffer<Uint8Array>} dst - Destination input buffer.
   */
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

  /**
   * Applies the color index inverse transform.
   * @param {number} yStart - The starting row.
   * @param {number} yEnd - The ending row.
   * @param {Uint32Array} inData - Input data array.
   * @param {number} src - Source index.
   * @param {Uint32Array} outData - Output data array.
   * @param {number} dst - Destination index.
   */
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

  /**
   * Applies the color space inverse transform.
   * @param {number} yStart - The starting row.
   * @param {number} yEnd - The ending row.
   * @param {Uint32Array} outData - Output data array.
   * @param {number} data - Data index.
   */
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
   * Applies the predictor inverse transform.
   * @param {number} yStart - The starting row.
   * @param {number} yEnd - The ending row.
   * @param {Uint32Array} outData - Output data array.
   * @param {number} data - Data index.
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
   * Adds green to blue and red channels.
   * @param {Uint32Array} pixels - The pixel data array.
   * @param {number} data - Data index.
   * @param {number} dataEnd - End index of the data.
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

  /**
   * Gets the ARGB index.
   * @param {number} idx - The index value.
   * @returns {number} The ARGB index.
   */
  private static getARGBIndex(idx: number): number {
    return (idx >>> 8) & 0xff;
  }

  /**
   * Gets the alpha index.
   * @param {number} idx - The index value.
   * @returns {number} The alpha index.
   */
  private static getAlphaIndex(idx: number): number {
    return idx;
  }

  /**
   * Gets the ARGB value.
   * @param {number} val - The value.
   * @returns {number} The ARGB value.
   */
  private static getARGBValue(val: number): number {
    return val;
  }

  /**
   * Gets the alpha value.
   * @param {number} val - The value.
   * @returns {number} The alpha value.
   */
  private static getAlphaValue(val: number): number {
    return (val >>> 8) & 0xff;
  }

  /**
   * In-place sum of each component with mod 256.
   * @param {Uint32Array} pixels - The pixel data array.
   * @param {number} a - Index a.
   * @param {number} b - Index b.
   */
  private static addPixelsEq(pixels: Uint32Array, a: number, b: number): void {
    const pa = pixels[a];
    const alphaAndGreen = (pa & 0xff00ff00) + (b & 0xff00ff00);
    const redAndBlue = (pa & 0x00ff00ff) + (b & 0x00ff00ff);
    pixels[a] = (alphaAndGreen & 0xff00ff00) | (redAndBlue & 0x00ff00ff);
  }

  /**
   * Averages two values.
   * @param {number} a0 - Value 0.
   * @param {number} a1 - Value 1.
   * @returns {number} The average value.
   */
  private static average2(a0: number, a1: number): number {
    return (((a0 ^ a1) & 0xfefefefe) >>> 1) + (a0 & a1);
  }

  /**
   * Averages three values.
   * @param {number} a0 - Value 0.
   * @param {number} a1 - Value 1.
   * @param {number} a2 - Value 2.
   * @returns {number} The average value.
   */
  private static average3(a0: number, a1: number, a2: number): number {
    return this.average2(this.average2(a0, a2), a1);
  }

  /**
   * Averages four values.
   * @param {number} a0 - Value 0.
   * @param {number} a1 - Value 1.
   * @param {number} a2 - Value 2.
   * @param {number} a3 - Value 3.
   * @returns {number} The average value.
   */
  private static average4(
    a0: number,
    a1: number,
    a2: number,
    a3: number
  ): number {
    return this.average2(this.average2(a0, a1), this.average2(a2, a3));
  }

  /**
   * Clips the value to 0 or 255.
   * @param {number} a - The value.
   * @returns {number} The clipped value.
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

  /**
   * Adds and subtracts components with full range.
   * @param {number} a - Value a.
   * @param {number} b - Value b.
   * @param {number} c - Value c.
   * @returns {number} The result.
   */
  private static addSubtractComponentFull(
    a: number,
    b: number,
    c: number
  ): number {
    return this.clip255(a + b - c);
  }

  /**
   * Clamped add and subtract with full range.
   * @param {number} c0 - Value 0.
   * @param {number} c1 - Value 1.
   * @param {number} c2 - Value 2.
   * @returns {number} The result.
   */
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

  /**
   * Adds the given number `a` to half the difference between `a` and `b`,
   * then clips the result to a maximum value of 255.
   *
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {number} The result of the operation, clipped to a maximum of 255.
   */
  private static addSubtractComponentHalf(a: number, b: number): number {
    return this.clip255(a + Math.trunc((a - b) / 2));
  }

  /**
   * Performs a clamped addition and subtraction operation on the half components of the given numbers.
   *
   * This function calculates the average of the first two input numbers, then performs an add/subtract
   * operation on each color component (alpha, red, green, blue) with the third input number.
   *
   * @param {number} c0 - The first input number.
   * @param {number} c1 - The second input number.
   * @param {number} c2 - The third input number.
   * @returns {number} The result of the clamped add/subtract operation on the half components.
   */
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

  /**
   * Subtracts the third parameter from the first two parameters,
   * calculates the absolute values of the results, and returns
   * the difference between these absolute values.
   *
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @param {number} c - The third number to be subtracted from the first two numbers.
   * @returns {number} The difference between the absolute values of (b - c) and (a - c).
   */
  private static sub3(a: number, b: number, c: number): number {
    const pb = b - c;
    const pa = a - c;
    return Math.abs(pb) - Math.abs(pa);
  }

  /**
   * Selects between two numbers based on a comparison with a third number.
   *
   * @param {number} a - The first number to compare.
   * @param {number} b - The second number to compare.
   * @param {number} c - The number to compare against.
   * @returns {number} The selected number, either `a` or `b`.
   */
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

  /**
   * A static method that predicts a value based on the given pixel data.
   *
   * @param {Uint32Array} _pixels - An array of 32-bit unsigned integers representing pixel data.
   * @param {number} _left - The left coordinate for the prediction.
   * @param {number} _top - The top coordinate for the prediction.
   * @returns {number} A constant value representing a black ARGB color.
   */
  private static predictor0(
    _pixels: Uint32Array,
    _left: number,
    _top: number
  ): number {
    return VP8L.argbBlack;
  }

  /**
   * A predictor function that returns the value of the left pixel.
   *
   * @param {Uint32Array} _pixels - The array of pixel data.
   * @param {number} left - The value of the left pixel.
   * @param {number} _top - The value of the top pixel (unused).
   * @returns {number} The value of the left pixel.
   */
  private static predictor1(
    _pixels: Uint32Array,
    left: number,
    _top: number
  ): number {
    return left;
  }

  /**
   * Predicts the value using the second predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} _left - The left pixel value (unused).
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor2(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return pixels[top];
  }

  /**
   * Predicts the value using the third predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} _left - The left pixel value (unused).
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor3(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return pixels[top + 1];
  }

  /**
   * Predicts the value using the fourth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} _left - The left pixel value (unused).
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor4(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return pixels[top - 1];
  }

  /**
   * Predicts the value using the fifth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor5(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average3(left, pixels[top], pixels[top + 1]);
  }

  /**
   * Predicts the value using the sixth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor6(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average2(left, pixels[top - 1]);
  }

  /**
   * Predicts the value using the seventh predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor7(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.average2(left, pixels[top]);
  }

  /**
   * Predicts the value using the eighth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} _left - The left pixel value (unused).
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor8(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return VP8LTransform.average2(pixels[top - 1], pixels[top]);
  }

  /**
   * Predicts the value using the ninth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} _left - The left pixel value (unused).
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor9(
    pixels: Uint32Array,
    _left: number,
    top: number
  ): number {
    return VP8LTransform.average2(pixels[top], pixels[top + 1]);
  }

  /**
   * Predicts the value using the tenth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
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

  /**
   * Predicts the value using the eleventh predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
  private static predictor11(
    pixels: Uint32Array,
    left: number,
    top: number
  ): number {
    return VP8LTransform.select(pixels[top], left, pixels[top - 1]);
  }

  /**
   * Predicts the value using the twelfth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
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

  /**
   * Predicts the value using the thirteenth predictor method.
   *
   * @param {Uint32Array} pixels - The array of pixel values.
   * @param {number} left - The left pixel value.
   * @param {number} top - The top pixel index.
   * @returns {number} The predicted pixel value.
   */
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

  /**
   * Array of predictor functions.
   * Each predictor function is referenced by its index.
   */
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
