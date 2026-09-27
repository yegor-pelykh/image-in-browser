/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { BitUtils } from '../../common/bit-utils.js';
import { MathUtils } from '../../common/math-utils.js';
import { VP8LBitWriter } from './vp8l-bit-writer.js';
import * as huffman from './vp8l-huffman-encoder.js';

/**
 * The VP8L predictor transform: the formulas, choosing one per block, and
 * writing the result out.
 *
 * The formulas mirror predictors 0..13 in VP8LTransform, on the same packed
 * ARGB word the decoder works in, so the two can be read side by side. They
 * are normative: every conformant decoder computes exactly these values, so
 * diverging here would corrupt the image for every reader, not only this
 * package's decoder. Which of them each block uses is entirely the encoder's
 * choice, and is decided further down.
 */

/**
 * Every predictor VP8L defines. The decoder implements all of them, so
 * restricting the search to a handful only costs compression.
 */
export const numPredictors = 14;

/**
 * The prediction on the top-left pixel, where no neighbour exists.
 */
export const argbBlack = 0xff000000;

/**
 * Per-byte `(a0 + a1) >> 1`, computed on all four channels at once.
 *
 * Masking off the low bit of each byte before shifting keeps a channel's
 * carry out of the one below it.
 */
function avg2(a0: number, a1: number): number {
  return (((a0 ^ a1) & 0xfefefefe) >>> 1) + (a0 & a1);
}

function avg3(a0: number, a1: number, a2: number): number {
  return avg2(avg2(a0, a2), a1);
}

function avg4(a0: number, a1: number, a2: number, a3: number): number {
  return avg2(avg2(a0, a1), avg2(a2, a3));
}

function clip255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function addSubFull(c0: number, c1: number, c2: number): number {
  const a = clip255((c0 >>> 24) + (c1 >>> 24) - (c2 >>> 24));
  const r = clip255(
    ((c0 >>> 16) & 0xff) + ((c1 >>> 16) & 0xff) - ((c2 >>> 16) & 0xff)
  );
  const g = clip255(
    ((c0 >>> 8) & 0xff) + ((c1 >>> 8) & 0xff) - ((c2 >>> 8) & 0xff)
  );
  const b = clip255((c0 & 0xff) + (c1 & 0xff) - (c2 & 0xff));
  return (a << 24) | (r << 16) | (g << 8) | b;
}

function addSubHalfComponent(a: number, b: number): number {
  return clip255(a + Math.trunc((a - b) / 2));
}

function addSubHalf(c0: number, c1: number, c2: number): number {
  const avg = avg2(c0, c1);
  const a = addSubHalfComponent(avg >>> 24, c2 >>> 24);
  const r = addSubHalfComponent((avg >>> 16) & 0xff, (c2 >>> 16) & 0xff);
  const g = addSubHalfComponent((avg >>> 8) & 0xff, (c2 >>> 8) & 0xff);
  const b = addSubHalfComponent(avg & 0xff, c2 & 0xff);
  return (a << 24) | (r << 16) | (g << 8) | b;
}

function sub3(a: number, b: number, c: number): number {
  return Math.abs(b - c) - Math.abs(a - c);
}

function select(a: number, b: number, c: number): number {
  const paMinusPb =
    sub3(a >>> 24, b >>> 24, c >>> 24) +
    sub3((a >>> 16) & 0xff, (b >>> 16) & 0xff, (c >>> 16) & 0xff) +
    sub3((a >>> 8) & 0xff, (b >>> 8) & 0xff, (c >>> 8) & 0xff) +
    sub3(a & 0xff, b & 0xff, c & 0xff);
  return paMinusPb <= 0 ? a : b;
}

/**
 * The A,R,G,B predicted by {@link mode} from the four neighbours, packed.
 *
 * This is the readable statement of the transform. {@link predictAll} computes the
 * same values in a form the mode search can afford; a test holds the two to
 * each other.
 */
export function predict(
  mode: number,
  left: number,
  top: number,
  topLeft: number,
  topRight: number
): number {
  switch (mode) {
    case 0:
      return argbBlack;
    case 1:
      return left;
    case 2:
      return top;
    case 3:
      return topRight;
    case 4:
      return topLeft;
    case 5:
      return avg3(left, top, topRight);
    case 6:
      return avg2(left, topLeft);
    case 7:
      return avg2(left, top);
    case 8:
      return avg2(topLeft, top);
    case 9:
      return avg2(top, topRight);
    case 10:
      return avg4(left, topLeft, top, topRight);
    case 11:
      return select(top, left, topLeft);
    case 12:
      return addSubFull(left, top, topLeft);
    default:
      return addSubHalf(left, top, topLeft);
  }
}

/**
 * Every predictor's output for one pixel, written into {@link out}.
 *
 * The mode search needs all fourteen at each pixel. Asking {@link predict} for them
 * one at a time re-derives the shared averages fourteen times over; here each
 * is computed once.
 */
export function predictAll(
  left: number,
  top: number,
  topLeft: number,
  topRight: number,
  out: Uint32Array
): void {
  const avgLeftTopLeft = avg2(left, topLeft);
  const avgTopTopRight = avg2(top, topRight);
  out[0] = argbBlack;
  out[1] = left;
  out[2] = top;
  out[3] = topRight;
  out[4] = topLeft;
  out[5] = avg2(avg2(left, topRight), top);
  out[6] = avgLeftTopLeft;
  out[7] = avg2(left, top);
  out[8] = avg2(topLeft, top);
  out[9] = avgTopTopRight;
  out[10] = avg2(avgLeftTopLeft, avgTopTopRight);
  out[11] = select(top, left, topLeft);
  out[12] = addSubFull(left, top, topLeft);
  out[13] = addSubHalf(left, top, topLeft);
}

/**
 * Summed signed magnitude of the residual {@link v} - {@link p}, over all four
 * channels.
 *
 * A residual wraps, so a channel differing by 200 is really off by 56 and
 * costs what 56 costs.
 */
function residualMagnitude(v: number, p: number): number {
  let d = ((v >>> 24) - (p >>> 24)) & 0xff;
  let cost = d < 128 ? d : 256 - d;
  d = ((v >>> 16) - (p >>> 16)) & 0xff;
  cost += d < 128 ? d : 256 - d;
  d = ((v >>> 8) - (p >>> 8)) & 0xff;
  cost += d < 128 ? d : 256 - d;
  d = (v - p) & 0xff;
  return cost + (d < 128 ? d : 256 - d);
}

/**
 * Picks a predictor for each block, minimising the summed magnitude of the
 * residuals it leaves behind.
 */
export function selectPredictorModes(
  argb: Uint32Array,
  width: number,
  height: number,
  blockW: number,
  blockH: number,
  blockSize: number
): number[] {
  const modes = ArrayUtils.fill(blockW * blockH, 11);
  // A block spans at most 32 pixels either way, so four channels of at most
  // 128 each keep the running cost well inside 32 bits.
  const cost = new Int32Array(numPredictors);
  const preds = new Uint32Array(numPredictors);
  for (let by = 0; by < blockH; by++) {
    for (let bx = 0; bx < blockW; bx++) {
      const x0 = bx * blockSize;
      const y0 = by * blockSize;
      const x1 = MathUtils.clamp(x0 + blockSize, 0, width);
      const y1 = MathUtils.clamp(y0 + blockSize, 0, height);
      cost.fill(0, 0, numPredictors);
      // The top row and left column are predicted the same way whatever mode
      // the block carries, so they add one constant to every candidate and
      // cannot change which comes out cheapest. Leaving them out also keeps
      // the inner loop free of a per-pixel edge test.
      const yStart = y0 === 0 ? 1 : y0;
      const xStart = x0 === 0 ? 1 : x0;
      for (let y = yStart; y < y1; y++) {
        const row = y * width;
        for (let x = xStart; x < x1; x++) {
          const i = row + x;
          const v = argb[i];
          predictAll(
            argb[i - 1],
            argb[i - width],
            argb[i - width - 1],
            argb[i - width + 1],
            preds
          );
          for (let m = 0; m < numPredictors; m++) {
            cost[m] += residualMagnitude(v, preds[m]);
          }
        }
      }
      let bestMode = 0;
      let bestCost = cost[0];
      for (let m = 1; m < numPredictors; m++) {
        if (cost[m] < bestCost) {
          bestCost = cost[m];
          bestMode = m;
        }
      }
      modes[by * blockW + bx] = bestMode;
    }
  }
  return modes;
}

/**
 * Replaces each pixel with its residual against the prediction the block's
 * mode makes, writing the result into the planes.
 *
 * {@link argb} holds the original pixels, which is what the decoder has
 * reconstructed by the time it reaches each one. Edge rules match the
 * decoder: (0,0) predicts black, the top row predicts left, the left column
 * predicts top.
 */
export function applyPredictorTransform(
  argb: Uint32Array,
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
  const shift = BitUtils.bitLength(blockSize) - 1;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    const modeRow = (y >> shift) * blockW;
    for (let x = 0; x < width; x++) {
      const i = row + x;
      let p: number = 0;
      if (y === 0) {
        p = x === 0 ? argbBlack : argb[i - 1];
      } else if (x === 0) {
        p = argb[i - width];
      } else {
        p = predict(
          modes[modeRow + (x >> shift)],
          argb[i - 1],
          argb[i - width],
          argb[i - width - 1],
          argb[i - width + 1]
        );
      }
      const v = argb[i];
      a[i] = ((v >>> 24) - (p >>> 24)) & 0xff;
      r[i] = ((v >>> 16) - (p >>> 16)) & 0xff;
      g[i] = ((v >>> 8) - (p >>> 8)) & 0xff;
      b[i] = (v - p) & 0xff;
    }
  }
}

/**
 * Write a VP8L predictor sub-image inline (no RIFF, no signature, no
 * transform loop) using per-block predictor {@link modes}.
 */
export function writePredictorSubImage(
  bw: VP8LBitWriter,
  blockW: number,
  blockH: number,
  modes: number[]
): void {
  const n = blockW * blockH;
  // Build green-channel frequency table for the sub-image pixels.
  const greenFreq = ArrayUtils.fill(280, 0);
  for (const m of modes) {
    greenFreq[m]++;
  }
  const greenCl = huffman.buildHuffmanCodeLengths(greenFreq, 280);
  const greenCodes = huffman.canonicalCodes(Int32Array.from(greenCl), 280);

  // Sub-image format (decoded with isLevel0=false, allowRecursion=false):
  // no color cache, then 5 Huffman groups, then pixel data.
  bw.writeBits(0, 1);
  // Green (280): normal Huffman for the mode values.
  huffman.writeHuffmanCode(bw, 280, greenCl);
  // Red/Blue (256): all 0 → simple, 1-bit symbol = 0.
  // Alpha (256): all 255 → simple, 8-bit symbol = 255.
  // Dist (40): unused → simple, 1-bit symbol = 0.
  // Red.
  bw.writeBits(1, 1);
  bw.writeBits(0, 1);
  bw.writeBits(0, 1);
  bw.writeBits(0, 1);
  // Blue.
  bw.writeBits(1, 1);
  bw.writeBits(0, 1);
  bw.writeBits(0, 1);
  bw.writeBits(0, 1);
  // Alpha.
  bw.writeBits(1, 1);
  bw.writeBits(0, 1);
  bw.writeBits(1, 1);
  bw.writeBits(255, 8);
  // Dist.
  bw.writeBits(1, 1);
  bw.writeBits(0, 1);
  bw.writeBits(0, 1);
  bw.writeBits(0, 1);
  // Pixel data: blockW*blockH pixels with G=modes[i], R=0, B=0, A=255.
  // Red/blue/alpha each have a 1-symbol code → 1 bit each.
  for (let i = 0; i < n; i++) {
    const m = modes[i];
    // Green carries the predictor mode.
    bw.writeBits(greenCodes[m], greenCl[m]);
  }
}
