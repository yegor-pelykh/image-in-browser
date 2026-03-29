/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { BitUtils } from '../common/bit-utils.js';
import { MapUtils } from '../common/map-utils.js';
import { MathUtils } from '../common/math-utils.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { MemoryImage } from '../image/image.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';
import { WebPBitWriter } from './webp/webp-bit-writer.js';
import { WebPClSymbol } from './webp/webp-cl-symbol.js';

/**
 * Encode an image to the WebP format (lossless).
 *
 * Uses the VP8L lossless bitstream format wrapped in a RIFF/WebP container.
 * Applies the subtract-green transform and LZ77 back-references.
 */
export class WebPEncoder implements Encoder {
  /**
   * Lookup table for mapping (x, y) offsets to plane codes for distance encoding.
   * Used in the LZ77 back-reference distance calculation.
   * @private
   */
  private static readonly planeLut = [
    96, 73, 55, 39, 23, 13, 5, 1, 255, 255, 255, 255, 255, 255, 255, 255, 101,
    78, 58, 42, 26, 16, 8, 2, 0, 3, 9, 17, 27, 43, 59, 79, 102, 86, 62, 46, 32,
    20, 10, 6, 4, 7, 11, 21, 33, 47, 63, 87, 105, 90, 70, 52, 37, 28, 18, 14,
    12, 15, 19, 29, 38, 53, 71, 91, 110, 99, 82, 66, 48, 35, 30, 24, 22, 25, 31,
    36, 49, 67, 83, 100, 115, 108, 94, 76, 64, 50, 44, 40, 34, 41, 45, 51, 65,
    77, 95, 109, 118, 113, 103, 92, 80, 68, 60, 56, 54, 57, 61, 69, 81, 93, 104,
    114, 119, 116, 111, 106, 97, 88, 84, 74, 72, 75, 85, 89, 98, 107, 112, 117,
  ];

  /**
   * Indicates whether the encoder supports animation.
   * @private
   */
  private _supportsAnimation = false;

  /**
   * Gets the value indicating whether the encoder supports animation.
   * @returns {boolean} True if the encoder supports animation, otherwise false.
   */
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  /**
   * Encodes the given image data into the VP8L lossless bitstream.
   * Applies transforms, predictor selection, and entropy coding.
   * @param {MemoryImage} image - The image to encode.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @returns {Uint8Array} The encoded VP8L bitstream.
   * @private
   */
  private encodeVP8L(
    image: MemoryImage,
    width: number,
    height: number
  ): Uint8Array {
    const out = new OutputBuffer();

    const hasAlpha = image.numChannels >= 4;
    const header =
      (width - 1) | ((height - 1) << 14) | ((hasAlpha ? 1 : 0) << 28);
    out.writeByte(0x2f);
    out.writeByte(header & 0xff);
    out.writeByte((header >> 8) & 0xff);
    out.writeByte((header >> 16) & 0xff);
    out.writeByte((header >> 24) & 0xff);

    const predSizeBits = 5;
    const predBlockSize = 1 << predSizeBits;
    const predBlockW = Math.trunc((width + predBlockSize - 1) / predBlockSize);
    const predBlockH = Math.trunc((height + predBlockSize - 1) / predBlockSize);
    const numPixels = width * height;
    const g = new Uint8Array(numPixels);
    const r = new Uint8Array(numPixels);
    const b = new Uint8Array(numPixels);
    const a = new Uint8Array(numPixels);

    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = image.getPixel(x, y);
        g[i] = MathUtils.clampInt255(p.g);
        r[i] = MathUtils.clampInt255(p.r);
        b[i] = MathUtils.clampInt255(p.b);
        a[i] = hasAlpha ? MathUtils.clampInt255(p.a) : 255;
        i++;
      }
    }
    this.applySubtractGreenTransform(r, g, b, numPixels);
    const predModes = this.selectPredictorModes(
      r,
      g,
      b,
      width,
      height,
      predBlockW,
      predBlockH,
      predBlockSize
    );
    this.applyPredictorTransform(
      r,
      g,
      b,
      a,
      width,
      height,
      predBlockW,
      predBlockSize,
      predModes
    );
    const bw = new WebPBitWriter();
    bw.writeBits(1, 1);
    bw.writeBits(2, 2);
    bw.writeBits(1, 1);
    bw.writeBits(0, 2);
    bw.writeBits(predSizeBits - 2, 3);
    this.writePredictorSubImage(bw, predBlockW, predBlockH, predModes);

    bw.writeBits(0, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);

    const tokenIsLit: boolean[] = [];
    const tokenLitIdx: number[] = [];
    const tokenLen: number[] = [];
    const tokenDist: number[] = [];

    const maxChain = 64;
    const maxMatchLen = 4096;
    const hashChain = new Map<number, number[]>();

    const addToHash = (pos: number) => {
      const key = (g[pos] << 24) | (r[pos] << 16) | (b[pos] << 8) | a[pos];
      const list = MapUtils.putIfAbsent(hashChain, key, () => []);
      if (list.length >= maxChain) {
        list.splice(0, 1);
      }
      list.push(pos);
    };

    let j = 0;
    while (j < numPixels) {
      const key = (g[j] << 24) | (r[j] << 16) | (b[j] << 8) | a[j];

      let bestLen = 0;
      let bestDist = 0;
      const candidates = hashChain.get(key);
      if (j > 0 && candidates !== undefined) {
        for (let ci = candidates.length - 1; ci >= 0; ci--) {
          const c = candidates[ci];
          const dist = j - c;
          if (dist > 1048456) break;
          let len = 1;
          while (
            len < maxMatchLen &&
            j + len < numPixels &&
            g[j + len] === g[c + len] &&
            r[j + len] === r[c + len] &&
            b[j + len] === b[c + len] &&
            a[j + len] === a[c + len]
          ) {
            len++;
          }
          if (len > bestLen || (len === bestLen && dist < bestDist)) {
            bestLen = len;
            bestDist = dist;
          }
        }
      }

      if (bestLen >= 3) {
        tokenIsLit.push(false);
        tokenLen.push(bestLen);
        tokenDist.push(bestDist);
        for (let k = 0; k < bestLen; k++) {
          addToHash(j + k);
        }
        j += bestLen;
      } else {
        tokenIsLit.push(true);
        tokenLitIdx.push(j);
        addToHash(j);
        j++;
      }
    }

    const greenFreq = new Array<number>(280).fill(0);
    const redFreq = new Array<number>(256).fill(0);
    const blueFreq = new Array<number>(256).fill(0);
    const alphaFreq = new Array<number>(256).fill(0);
    const distFreq = new Array<number>(40).fill(0);

    let litPtr = 0;
    let refPtr = 0;
    for (const isLit of tokenIsLit) {
      if (isLit) {
        const idx = tokenLitIdx[litPtr++];
        greenFreq[g[idx]]++;
        redFreq[r[idx]]++;
        blueFreq[b[idx]]++;
        alphaFreq[a[idx]]++;
      } else {
        const len = tokenLen[refPtr];
        const dist = tokenDist[refPtr];
        refPtr++;
        greenFreq[this.lengthSymbol(len)]++;
        const planeCode = this.distToPlaneCode(width, dist);
        distFreq[this.prefixCode(planeCode)]++;
      }
    }

    const greenCl = this.buildHuffmanCodeLengths(greenFreq, 280);
    const redCl = this.buildHuffmanCodeLengths(redFreq, 256);
    const blueCl = this.buildHuffmanCodeLengths(blueFreq, 256);
    const alphaCl = this.buildHuffmanCodeLengths(alphaFreq, 256);
    const distCl = this.buildHuffmanCodeLengths(distFreq, 40);

    this.writeHuffmanCode(bw, 280, greenCl);
    this.writeHuffmanCode(bw, 256, redCl);
    this.writeHuffmanCode(bw, 256, blueCl);
    this.writeHuffmanCode(bw, 256, alphaCl);
    this.writeHuffmanCode(bw, 40, distCl);

    const greenCodes = this.canonicalCodes(Int32Array.from(greenCl), 280);
    const redCodes = this.canonicalCodes(Int32Array.from(redCl), 256);
    const blueCodes = this.canonicalCodes(Int32Array.from(blueCl), 256);
    const alphaCodes = this.canonicalCodes(Int32Array.from(alphaCl), 256);
    const distCodes = this.canonicalCodes(Int32Array.from(distCl), 40);

    litPtr = 0;
    refPtr = 0;
    for (const isLit of tokenIsLit) {
      if (isLit) {
        const idx = tokenLitIdx[litPtr++];
        bw.writeBits(greenCodes[g[idx]], greenCl[g[idx]]);
        bw.writeBits(redCodes[r[idx]], redCl[r[idx]]);
        bw.writeBits(blueCodes[b[idx]], blueCl[b[idx]]);
        bw.writeBits(alphaCodes[a[idx]], alphaCl[a[idx]]);
      } else {
        const len = tokenLen[refPtr];
        const dist = tokenDist[refPtr];
        refPtr++;

        const lSym = this.lengthSymbol(len);
        bw.writeBits(greenCodes[lSym], greenCl[lSym]);
        let le = this.lengthExtra(len);
        if (le.extraBits > 0) {
          bw.writeBits(le.extraValue, le.extraBits);
        }

        const planeCode = this.distToPlaneCode(width, dist);
        const dSym = this.prefixCode(planeCode);
        bw.writeBits(distCodes[dSym], distCl[dSym]);
        le = this.prefixExtra(planeCode);
        if (le.extraBits > 0) {
          bw.writeBits(le.extraValue, le.extraBits);
        }
      }
    }

    bw.flush();
    out.writeBytes(bw.getBytes());
    return out.getBytes();
  }

  /**
   * Applies the subtract-green transform to the red and blue channels.
   * This decorrelates color channels for better compression.
   * @param {Uint8Array} r - Red channel data.
   * @param {Uint8Array} g - Green channel data.
   * @param {Uint8Array} b - Blue channel data.
   * @param {number} numPixels - Number of pixels in the image.
   * @private
   */
  private applySubtractGreenTransform(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    numPixels: number
  ): void {
    for (let i = 0; i < numPixels; i++) {
      r[i] = (r[i] - g[i]) & 0xff;
      b[i] = (b[i] - g[i]) & 0xff;
    }
  }

  /**
   * Selects the best predictor mode for each block in the image.
   * Evaluates candidate predictors and chooses the one with the lowest cost.
   * @param {Uint8Array} r - Red channel data.
   * @param {Uint8Array} g - Green channel data.
   * @param {Uint8Array} b - Blue channel data.
   * @param {number} width - Image width.
   * @param {number} height - Image height.
   * @param {number} blockW - Number of blocks horizontally.
   * @param {number} blockH - Number of blocks vertically.
   * @param {number} blockSize - Size of each block.
   * @returns {number[]} Array of predictor modes for each block.
   * @private
   */
  private selectPredictorModes(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    width: number,
    height: number,
    blockW: number,
    blockH: number,
    blockSize: number
  ): number[] {
    const candidates = [1, 2, 7, 11];
    const modes = new Array<number>(blockW * blockH).fill(11);
    for (let by = 0; by < blockH; by++) {
      for (let bx = 0; bx < blockW; bx++) {
        const x0 = bx * blockSize;
        const y0 = by * blockSize;
        const x1 = MathUtils.clamp(x0 + blockSize, 0, width);
        const y1 = MathUtils.clamp(y0 + blockSize, 0, height);
        let bestMode = 11;
        let bestCost = 0x7fffffff;
        for (const m of candidates) {
          let cost = 0;
          for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
              const idx = y * width + x;
              let pR = 0;
              let pG = 0;
              let pB = 0;
              if (y === 0 && x === 0) {
                pR = 0;
                pG = 0;
                pB = 0;
              } else if (y === 0) {
                const li = idx - 1;
                pR = r[li];
                pG = g[li];
                pB = b[li];
              } else if (x === 0) {
                const ti = idx - width;
                pR = r[ti];
                pG = g[ti];
                pB = b[ti];
              } else {
                const li = idx - 1;
                const ti = idx - width;
                switch (m) {
                  case 1:
                    pR = r[li];
                    pG = g[li];
                    pB = b[li];
                    break;
                  case 2:
                    pR = r[ti];
                    pG = g[ti];
                    pB = b[ti];
                    break;
                  case 7:
                    pR = (r[li] + r[ti]) >> 1;
                    pG = (g[li] + g[ti]) >> 1;
                    pB = (b[li] + b[ti]) >> 1;
                    break;
                  default: {
                    const tli = ti - 1;
                    const sl =
                      Math.abs(r[li] - r[tli]) +
                      Math.abs(g[li] - g[tli]) +
                      Math.abs(b[li] - b[tli]);
                    const st =
                      Math.abs(r[ti] - r[tli]) +
                      Math.abs(g[ti] - g[tli]) +
                      Math.abs(b[ti] - b[tli]);
                    if (sl <= st) {
                      pR = r[ti];
                      pG = g[ti];
                      pB = b[ti];
                    } else {
                      pR = r[li];
                      pG = g[li];
                      pB = b[li];
                    }
                  }
                }
              }
              const dr = (r[idx] - pR) & 0xff;
              const dg = (g[idx] - pG) & 0xff;
              const db = (b[idx] - pB) & 0xff;
              cost += dr < 128 ? dr : 256 - dr;
              cost += dg < 128 ? dg : 256 - dg;
              cost += db < 128 ? db : 256 - db;
            }
          }
          if (cost < bestCost) {
            bestCost = cost;
            bestMode = m;
          }
        }
        modes[by * blockW + bx] = bestMode;
      }
    }
    return modes;
  }

  /**
   * Applies the selected predictor transform to the image channels.
   * Modifies the channel data in-place to store residuals.
   * @param {Uint8Array} r - Red channel data.
   * @param {Uint8Array} g - Green channel data.
   * @param {Uint8Array} b - Blue channel data.
   * @param {Uint8Array} a - Alpha channel data.
   * @param {number} width - Image width.
   * @param {number} height - Image height.
   * @param {number} blockW - Number of blocks horizontally.
   * @param {number} blockSize - Size of each block.
   * @param {number[]} modes - Predictor modes for each block.
   * @private
   */
  private applyPredictorTransform(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    width: number,
    height: number,
    blockW: number,
    blockSize: number,
    modes: number[]
  ): void {
    const origR = Uint8Array.from(r);
    const origG = Uint8Array.from(g);
    const origB = Uint8Array.from(b);
    const origA = Uint8Array.from(a);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        let pR = 0;
        let pG = 0;
        let pB = 0;
        let pA = 0;
        if (y === 0 && x === 0) {
          pA = 255;
          pR = 0;
          pG = 0;
          pB = 0;
        } else if (y === 0) {
          const li = i - 1;
          pR = origR[li];
          pG = origG[li];
          pB = origB[li];
          pA = origA[li];
        } else if (x === 0) {
          const ti = i - width;
          pR = origR[ti];
          pG = origG[ti];
          pB = origB[ti];
          pA = origA[ti];
        } else {
          const li = i - 1;
          const ti = i - width;
          const shift = BitUtils.bitLength(blockSize) - 1;
          const mode = modes[(y >> shift) * blockW + (x >> shift)];
          switch (mode) {
            case 1:
              pR = origR[li];
              pG = origG[li];
              pB = origB[li];
              pA = origA[li];
              break;
            case 2:
              pR = origR[ti];
              pG = origG[ti];
              pB = origB[ti];
              pA = origA[ti];
              break;
            case 7:
              pR = (origR[li] + origR[ti]) >> 1;
              pG = (origG[li] + origG[ti]) >> 1;
              pB = (origB[li] + origB[ti]) >> 1;
              pA = (origA[li] + origA[ti]) >> 1;
              break;
            default: {
              const tli = ti - 1;
              const sl =
                Math.abs(origR[li] - origR[tli]) +
                Math.abs(origG[li] - origG[tli]) +
                Math.abs(origB[li] - origB[tli]) +
                Math.abs(origA[li] - origA[tli]);
              const st =
                Math.abs(origR[ti] - origR[tli]) +
                Math.abs(origG[ti] - origG[tli]) +
                Math.abs(origB[ti] - origB[tli]) +
                Math.abs(origA[ti] - origA[tli]);
              if (sl <= st) {
                pR = origR[ti];
                pG = origG[ti];
                pB = origB[ti];
                pA = origA[ti];
              } else {
                pR = origR[li];
                pG = origG[li];
                pB = origB[li];
                pA = origA[li];
              }
            }
          }
        }
        r[i] = (origR[i] - pR) & 0xff;
        g[i] = (origG[i] - pG) & 0xff;
        b[i] = (origB[i] - pB) & 0xff;
        a[i] = (origA[i] - pA) & 0xff;
      }
    }
  }

  /**
   * Writes the predictor mode subimage to the bitstream.
   * Encodes the predictor modes using Huffman coding.
   * @param {WebPBitWriter} bw - The bit writer.
   * @param {number} blockW - Number of blocks horizontally.
   * @param {number} blockH - Number of blocks vertically.
   * @param {number[]} modes - Predictor modes for each block.
   * @private
   */
  private writePredictorSubImage(
    bw: WebPBitWriter,
    blockW: number,
    blockH: number,
    modes: number[]
  ): void {
    const n = blockW * blockH;
    const greenFreq = new Array<number>(280).fill(0);
    for (const m of modes) {
      greenFreq[m]++;
    }
    const greenCl = this.buildHuffmanCodeLengths(greenFreq, 280);
    const greenCodes = this.canonicalCodes(Int32Array.from(greenCl), 280);

    bw.writeBits(0, 1);
    this.writeHuffmanCode(bw, 280, greenCl);

    bw.writeBits(1, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);
    bw.writeBits(1, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);
    bw.writeBits(1, 1);
    bw.writeBits(0, 1);
    bw.writeBits(1, 1);
    bw.writeBits(255, 8);
    bw.writeBits(1, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);
    bw.writeBits(0, 1);

    for (let i = 0; i < n; i++) {
      const m = modes[i];
      bw.writeBits(greenCodes[m], greenCl[m]);
    }
  }

  /**
   * Maps a match length to its corresponding symbol for entropy coding.
   * @param {number} length - The match length.
   * @returns {number} The symbol representing the length.
   * @private
   */
  private lengthSymbol(length: number): number {
    if (length <= 4) {
      return 255 + length;
    }
    const msb = this.log2Floor(length - 1);
    const half = ((length - 1) >> (msb - 1)) & 1;
    return 256 + 2 * msb + half;
  }

  /**
   * Computes the extra bits and value for a given match length symbol.
   * Used for encoding match lengths with additional precision.
   * @param {number} length - The match length.
   * @returns {{ extraBits: number, extraValue: number }} Extra bits and value.
   * @private
   */
  private lengthExtra(length: number): {
    extraBits: number;
    extraValue: number;
  } {
    if (length <= 4) {
      return { extraBits: 0, extraValue: 0 };
    }
    const msb = this.log2Floor(length - 1);
    const half = ((length - 1) >> (msb - 1)) & 1;
    const eb = msb - 1;
    const base = (2 + half) << eb;
    return {
      extraBits: eb,
      extraValue: length - 1 - base,
    };
  }

  /**
   * Converts a pixel distance to a plane code for distance entropy coding.
   * Uses a lookup table for small distances and a direct mapping for larger ones.
   * @param {number} width - Image width.
   * @param {number} dist - Pixel distance.
   * @returns {number} The plane code for the distance.
   * @private
   */
  private distToPlaneCode(width: number, dist: number): number {
    const yoff = Math.trunc(dist / width);
    const xoff = dist - yoff * width;
    if (xoff <= 8 && yoff < 8) {
      return WebPEncoder.planeLut[yoff * 16 + 8 - xoff] + 1;
    } else if (xoff > width - 8 && yoff < 7) {
      return WebPEncoder.planeLut[(yoff + 1) * 16 + 8 + width - xoff] + 1;
    }
    return dist + 120;
  }

  /**
   * Maps a value to its prefix code for distance or length coding.
   * @param {number} v - The value to encode.
   * @returns {number} The prefix code.
   * @private
   */
  private prefixCode(v: number): number {
    const val = v - 1;
    if (val < 4) {
      return val;
    }
    const msb = this.log2Floor(val);
    const half = (val >> (msb - 1)) & 1;
    return 2 * msb + half;
  }

  /**
   * Computes the extra bits and value for a given prefix code.
   * Used for encoding distances and lengths with additional precision.
   * @param {number} v - The value to encode.
   * @returns {{ extraBits: number, extraValue: number }} Extra bits and value.
   * @private
   */
  private prefixExtra(v: number): {
    extraBits: number;
    extraValue: number;
  } {
    const val = v - 1;
    if (val < 4) {
      return { extraBits: 0, extraValue: 0 };
    }
    const msb = this.log2Floor(val);
    const half = (val >> (msb - 1)) & 1;
    const eb = msb - 1;
    const base = (2 + half) << eb;
    return {
      extraBits: eb,
      extraValue: val - base,
    };
  }

  /**
   * Computes the floor of the base-2 logarithm of the given value.
   * @param {number} v - The value to compute the log2 floor for.
   * @returns {number} The floor of log2(v).
   * @private
   */
  private log2Floor(v: number): number {
    let _v = v;
    let log = 0;
    while (_v > 1) {
      _v >>= 1;
      log++;
    }
    return log;
  }

  /**
   * Builds the Huffman code lengths for the given symbol frequencies.
   * Uses a bounded-length Huffman tree construction.
   * @param {number[]} freq - Symbol frequencies.
   * @param {number} alphabetSize - Number of symbols in the alphabet.
   * @param {number} [maxBits] - Maximum allowed code length.
   * @returns {number[]} Array of code lengths for each symbol.
   * @private
   */
  private buildHuffmanCodeLengths(
    freq: number[],
    alphabetSize: number,
    maxBits: number = 15
  ): number[] {
    const cl = new Array<number>(alphabetSize).fill(0);

    const syms: number[] = [];
    for (let k = 0; k < alphabetSize; k++) {
      if (freq[k] > 0) {
        syms.push(k);
      }
    }

    if (syms.length === 0) {
      cl[0] = 1;
      return cl;
    }
    if (syms.length === 1) {
      cl[syms[0]] = 1;
      return cl;
    }

    const maxNodes = 2 * syms.length;
    const nodeFreq = new Array<number>(maxNodes).fill(0);
    const nodeLeft = new Array<number>(maxNodes).fill(-1);
    const nodeRight = new Array<number>(maxNodes).fill(-1);

    for (let countMin = 1; ; countMin *= 2) {
      for (let k = 0; k < syms.length; k++) {
        nodeFreq[k] = freq[syms[k]];
        if (nodeFreq[k] < countMin) nodeFreq[k] = countMin;
      }
      let nextNode = syms.length;

      const pq = ArrayUtils.generate<number>(syms.length, (k) => k);
      pq.sort((x, y) => MathUtils.cmp(nodeFreq[x], nodeFreq[y]));

      while (pq.length > 1) {
        const x = pq.splice(0, 1)[0];
        const y = pq.splice(0, 1)[0];
        const id = nextNode++;
        nodeFreq[id] = nodeFreq[x] + nodeFreq[y];
        nodeLeft[id] = x;
        nodeRight[id] = y;
        let pos = 0;
        while (pos < pq.length && nodeFreq[pq[pos]] <= nodeFreq[id]) {
          pos++;
        }
        pq.splice(pos, 0, id);
      }

      const stackNodes = [pq[0]];
      const stackDepths = [0];
      let currentMaxBits = 0;

      while (stackNodes.length !== 0) {
        const nodeId = stackNodes.pop()!;
        const depth = stackDepths.pop()!;
        if (nodeLeft[nodeId] === -1) {
          cl[syms[nodeId]] = depth;
          if (depth > currentMaxBits) currentMaxBits = depth;
        } else {
          stackNodes.push(nodeLeft[nodeId]);
          stackNodes.push(nodeRight[nodeId]);
          stackDepths.push(depth + 1);
          stackDepths.push(depth + 1);
        }
      }

      if (currentMaxBits <= maxBits) {
        break;
      }
    }

    return cl;
  }

  /**
   * Writes the Huffman code tree to the bitstream.
   * Handles special cases for small alphabets and uses RLE for code lengths.
   * @param {WebPBitWriter} bw - The bit writer.
   * @param {number} alphabetSize - Number of symbols in the alphabet.
   * @param {number[]} codeLengths - Huffman code lengths for each symbol.
   * @private
   */
  private writeHuffmanCode(
    bw: WebPBitWriter,
    alphabetSize: number,
    codeLengths: number[]
  ): void {
    const used: number[] = [];
    for (let k = 0; k < alphabetSize; k++) {
      if (codeLengths[k] > 0) {
        used.push(k);
      }
    }

    if (
      used.length <= 2 &&
      (used.length === 0 || used[used.length - 1] <= 255)
    ) {
      bw.writeBits(1, 1);
      if (used.length === 0) {
        bw.writeBits(0, 1);
        bw.writeBits(0, 1);
        bw.writeBits(0, 1);
        return;
      }
      bw.writeBits(used.length - 1, 1);
      const sym0 = used[0];
      if (sym0 <= 1) {
        bw.writeBits(0, 1);
        bw.writeBits(sym0, 1);
      } else {
        bw.writeBits(1, 1);
        bw.writeBits(sym0, 8);
      }
      if (used.length === 2) {
        bw.writeBits(used[1], 8);
      } else if (used.length === 1) {
        codeLengths[sym0] = 0;
      }
      return;
    }

    const clSymbols = this.buildRleSequence(codeLengths, alphabetSize);

    const clFreq = new Array<number>(19).fill(0);
    for (const s of clSymbols) {
      clFreq[s.symbol]++;
    }

    const clCl = this.buildHuffmanCodeLengths(clFreq, 19, 7);
    const clCodes = this.canonicalCodes(Int32Array.from(clCl), 19);

    const kCodeLengthOrder = [
      17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ];

    let numClCl = 4;
    for (let k = 18; k >= 4; k--) {
      if (clCl[kCodeLengthOrder[k]] !== 0) {
        numClCl = k + 1;
        break;
      }
    }

    bw.writeBits(0, 1);
    bw.writeBits(numClCl - 4, 4);

    for (let k = 0; k < numClCl; k++) {
      bw.writeBits(clCl[kCodeLengthOrder[k]], 3);
    }

    bw.writeBits(0, 1);

    for (const s of clSymbols) {
      bw.writeBits(clCodes[s.symbol], clCl[s.symbol]);
      if (s.extraBits > 0) {
        bw.writeBits(s.extraValue, s.extraBits);
      }
    }
  }

  /**
   * Builds a run-length encoded (RLE) sequence of code length symbols.
   * Used for compact representation of Huffman code trees.
   * @param {number[]} codeLengths - Huffman code lengths for each symbol.
   * @param {number} alphabetSize - Number of symbols in the alphabet.
   * @returns {WebPClSymbol[]} RLE sequence of code length symbols.
   * @private
   */
  private buildRleSequence(
    codeLengths: number[],
    alphabetSize: number
  ): WebPClSymbol[] {
    const result: WebPClSymbol[] = [];
    let i = 0;
    while (i < alphabetSize) {
      const cl = codeLengths[i];
      if (cl === 0) {
        let count = 0;
        while (i + count < alphabetSize && codeLengths[i + count] === 0) {
          count++;
        }
        let rem = count;
        while (rem > 0) {
          if (rem >= 11) {
            const n = MathUtils.clamp(rem, 11, 138);
            result.push(new WebPClSymbol(18, 7, n - 11));
            rem -= n;
          } else if (rem >= 3) {
            const n = MathUtils.clamp(rem, 3, 10);
            result.push(new WebPClSymbol(17, 3, n - 3));
            rem -= n;
          } else {
            result.push(new WebPClSymbol(0, 0, 0));
            rem--;
          }
        }
        i += count;
      } else {
        result.push(new WebPClSymbol(cl, 0, 0));
        i++;
        while (i < alphabetSize && codeLengths[i] === cl) {
          let count = 0;
          while (
            i + count < alphabetSize &&
            codeLengths[i + count] === cl &&
            count < 6
          ) {
            count++;
          }
          if (count >= 3) {
            result.push(new WebPClSymbol(16, 2, count - 3));
            i += count;
          } else {
            for (let k = 0; k < count; k++) {
              result.push(new WebPClSymbol(cl, 0, 0));
            }
            i += count;
          }
        }
      }
    }
    return result;
  }

  /**
   * Generates canonical Huffman codes from code lengths.
   * @param {Int32Array} codeLengths - Huffman code lengths for each symbol.
   * @param {number} numSymbols - Number of symbols in the alphabet.
   * @returns {number[]} Canonical Huffman codes for each symbol.
   * @private
   */
  private canonicalCodes(
    codeLengths: Int32Array,
    numSymbols: number
  ): number[] {
    const codes = new Array<number>(numSymbols).fill(0);
    let maxLen = 0;
    for (let k = 0; k < numSymbols; k++) {
      if (codeLengths[k] > maxLen) maxLen = codeLengths[k];
    }
    if (maxLen === 0) return codes;

    const blCount = new Array<number>(maxLen + 1).fill(0);
    for (let k = 0; k < numSymbols; k++) {
      if (codeLengths[k] > 0) blCount[codeLengths[k]]++;
    }
    blCount[0] = 0;

    const nextCode = new Array<number>(maxLen + 1).fill(0);
    let code = 0;
    for (let bits = 1; bits <= maxLen; bits++) {
      code = (code + blCount[bits - 1]) << 1;
      nextCode[bits] = code;
    }

    for (let k = 0; k < numSymbols; k++) {
      const len = codeLengths[k];
      if (len > 0) {
        codes[k] = this.reverseBits(nextCode[len], len);
        nextCode[len]++;
      }
    }

    return codes;
  }

  /**
   * Reverses the order of bits in the given value.
   * @param {number} value - The value whose bits to reverse.
   * @param {number} numBits - The number of bits to reverse.
   * @returns {number} The value with bits reversed.
   * @private
   */
  private reverseBits(value: number, numBits: number): number {
    let _value = value;
    let result = 0;
    for (let k = 0; k < numBits; k++) {
      result = (result << 1) | (_value & 1);
      _value >>= 1;
    }
    return result;
  }

  /**
   * Returns a Uint8Array containing the ASCII codes of the given string.
   * @param {string} s - The string to convert.
   * @returns {Uint8Array} The byte array representing the string.
   * @private
   */
  private tag(s: string): Uint8Array {
    const bytes = new Uint8Array(s.length);
    for (let k = 0; k < s.length; k++) {
      bytes[k] = s.charCodeAt(k);
    }
    return bytes;
  }

  /**
   * Encodes the given image into a WEBP format.
   * @param {EncoderEncodeOptions} opt - The options for encoding.
   * @param {MemoryImage} opt.image - The image to encode.
   * @returns {Uint8Array} The encoded image in WEBP format.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    const width = opt.image.width;
    const height = opt.image.height;

    const vp8lData = this.encodeVP8L(opt.image, width, height);

    const out = new OutputBuffer();
    const paddedLen =
      vp8lData.length + (MathUtils.isEven(vp8lData.length) ? 0 : 1);
    const fileSize = 4 + 8 + paddedLen;
    out.writeBytes(this.tag('RIFF'));
    out.writeUint32(fileSize);
    out.writeBytes(this.tag('WEBP'));
    out.writeBytes(this.tag('VP8L'));
    out.writeUint32(vp8lData.length);
    out.writeBytes(vp8lData);
    if (!MathUtils.isEven(vp8lData.length)) {
      out.writeByte(0);
    }

    return out.getBytes();
  }
}
