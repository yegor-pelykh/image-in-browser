/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { absBranchless, nonZero, sar } from './vp8-sar.js';
import {
  kBps,
  i16DC16,
  i16TM16,
  i16VE16,
  i16HE16,
  c8DC8,
  c8TM8,
  c8VE8,
  c8HE8,
  i4DC4,
  i4TM4,
  i4VE4,
  i4HE4,
  i4RD4,
  i4VR4,
  i4LD4,
  i4VL4,
  i4HD4,
  i4HU4,
  kScan,
} from './vp8-tables.js';

/**
 * Clips a value to a byte.
 */
function clip8(v: number): number {
  return (v & ~0xff) === 0 ? v : v < 0 ? 0 : 255;
}

function avg3(a: number, b: number, c: number): number {
  return (a + 2 * b + c + 2) >> 2;
}

function avg2(a: number, b: number): number {
  return (a + b + 1) >> 1;
}

// The two multiplies of the inverse transform, as RFC 6386 14.3 spells them.
function mul1(a: number): number {
  return sar(a * 20091, 16) + a;
}

function mul2(a: number): number {
  return sar(a * 35468, 16);
}

/**
 * The forward 4x4 DCT of `src - ref`, written to {@link out} at {@link outOff}.
 */
export function fTransform(
  src: Uint8Array,
  srcOff: number,
  ref: Uint8Array,
  refOff: number,
  out: Int16Array,
  outOff: number
): void {
  let so = srcOff;
  let ro = refOff;
  // Rows.
  let d0 = src[so] - ref[ro];
  let d1 = src[so + 1] - ref[ro + 1];
  let d2 = src[so + 2] - ref[ro + 2];
  let d3 = src[so + 3] - ref[ro + 3];
  let a0 = d0 + d3;
  let a1 = d1 + d2;
  let a2 = d1 - d2;
  let a3 = d0 - d3;
  const t0 = (a0 + a1) * 8;
  const t1 = sar(a2 * 2217 + a3 * 5352 + 1812, 9);
  const t2 = (a0 - a1) * 8;
  const t3 = sar(a3 * 2217 - a2 * 5352 + 937, 9);

  so += kBps;
  ro += kBps;
  d0 = src[so] - ref[ro];
  d1 = src[so + 1] - ref[ro + 1];
  d2 = src[so + 2] - ref[ro + 2];
  d3 = src[so + 3] - ref[ro + 3];
  a0 = d0 + d3;
  a1 = d1 + d2;
  a2 = d1 - d2;
  a3 = d0 - d3;
  const t4 = (a0 + a1) * 8;
  const t5 = sar(a2 * 2217 + a3 * 5352 + 1812, 9);
  const t6 = (a0 - a1) * 8;
  const t7 = sar(a3 * 2217 - a2 * 5352 + 937, 9);

  so += kBps;
  ro += kBps;
  d0 = src[so] - ref[ro];
  d1 = src[so + 1] - ref[ro + 1];
  d2 = src[so + 2] - ref[ro + 2];
  d3 = src[so + 3] - ref[ro + 3];
  a0 = d0 + d3;
  a1 = d1 + d2;
  a2 = d1 - d2;
  a3 = d0 - d3;
  const t8 = (a0 + a1) * 8;
  const t9 = sar(a2 * 2217 + a3 * 5352 + 1812, 9);
  const t10 = (a0 - a1) * 8;
  const t11 = sar(a3 * 2217 - a2 * 5352 + 937, 9);

  so += kBps;
  ro += kBps;
  d0 = src[so] - ref[ro];
  d1 = src[so + 1] - ref[ro + 1];
  d2 = src[so + 2] - ref[ro + 2];
  d3 = src[so + 3] - ref[ro + 3];
  a0 = d0 + d3;
  a1 = d1 + d2;
  a2 = d1 - d2;
  a3 = d0 - d3;
  const t12 = (a0 + a1) * 8;
  const t13 = sar(a2 * 2217 + a3 * 5352 + 1812, 9);
  const t14 = (a0 - a1) * 8;
  const t15 = sar(a3 * 2217 - a2 * 5352 + 937, 9);

  // Columns.
  fTransformColumn(t0, t4, t8, t12, out, outOff);
  fTransformColumn(t1, t5, t9, t13, out, outOff + 1);
  fTransformColumn(t2, t6, t10, t14, out, outOff + 2);
  fTransformColumn(t3, t7, t11, t15, out, outOff + 3);
}

function fTransformColumn(
  r0: number,
  r1: number,
  r2: number,
  r3: number,
  out: Int16Array,
  outOff: number
): void {
  const a0 = r0 + r3;
  const a1 = r1 + r2;
  const a2 = r1 - r2;
  const a3 = r0 - r3;
  out[outOff] = sar(a0 + a1 + 7, 4);
  out[outOff + 4] = sar(a2 * 2217 + a3 * 5352 + 12000, 16) + (a3 !== 0 ? 1 : 0);
  out[outOff + 8] = sar(a0 - a1 + 7, 4);
  out[outOff + 12] = sar(a3 * 2217 - a2 * 5352 + 51000, 16);
}

/**
 * The forward DCT of the two 4x4 blocks starting at {@link srcOff}.
 */
export function fTransform2(
  src: Uint8Array,
  srcOff: number,
  ref: Uint8Array,
  refOff: number,
  out: Int16Array,
  outOff: number
): void {
  fTransform(src, srcOff, ref, refOff, out, outOff);
  fTransform(src, srcOff + 4, ref, refOff + 4, out, outOff + 16);
}

/**
 * The Walsh-Hadamard transform of the sixteen luma DC values.
 */
export function fTransformWHT(
  inp: Int16Array,
  inOff: number,
  out: Int16Array,
  outOff: number
): void {
  const tmp = new Int32Array(16);
  let off = inOff;
  for (let i = 0; i < 4; i++, off += 64) {
    const a0 = inp[off] + inp[off + 2 * 16];
    const a1 = inp[off + 16] + inp[off + 3 * 16];
    const a2 = inp[off + 16] - inp[off + 3 * 16];
    const a3 = inp[off] - inp[off + 2 * 16];
    tmp[0 + i * 4] = a0 + a1;
    tmp[1 + i * 4] = a3 + a2;
    tmp[2 + i * 4] = a3 - a2;
    tmp[3 + i * 4] = a0 - a1;
  }
  for (let i = 0; i < 4; i++) {
    const a0 = tmp[0 + i] + tmp[8 + i];
    const a1 = tmp[4 + i] + tmp[12 + i];
    const a2 = tmp[4 + i] - tmp[12 + i];
    const a3 = tmp[0 + i] - tmp[8 + i];
    out[outOff + i] = sar(a0 + a1, 1);
    out[outOff + 4 + i] = sar(a3 + a2, 1);
    out[outOff + 8 + i] = sar(a3 - a2, 1);
    out[outOff + 12 + i] = sar(a0 - a1, 1);
  }
}

/**
 * The inverse Walsh-Hadamard transform, scattering the sixteen luma DC
 * values back into the DC slot of each 4x4 block.
 */
export function transformWHT(
  inp: Int16Array,
  inOff: number,
  out: Int16Array,
  outOff: number
): void {
  const tmp = new Int32Array(16);
  for (let i = 0; i < 4; i++) {
    const a0 = inp[inOff + i] + inp[inOff + 12 + i];
    const a1 = inp[inOff + 4 + i] + inp[inOff + 8 + i];
    const a2 = inp[inOff + 4 + i] - inp[inOff + 8 + i];
    const a3 = inp[inOff + i] - inp[inOff + 12 + i];
    tmp[i] = a0 + a1;
    tmp[8 + i] = a0 - a1;
    tmp[4 + i] = a3 + a2;
    tmp[12 + i] = a3 - a2;
  }
  let oo = outOff;
  for (let i = 0; i < 4; i++) {
    // The added three is the rounding term.
    const dc = tmp[i * 4] + 3;
    const a0 = dc + tmp[3 + i * 4];
    const a1 = tmp[1 + i * 4] + tmp[2 + i * 4];
    const a2 = tmp[1 + i * 4] - tmp[2 + i * 4];
    const a3 = dc - tmp[3 + i * 4];
    out[oo] = sar(a0 + a1, 3);
    out[oo + 16] = sar(a3 + a2, 3);
    out[oo + 32] = sar(a0 - a1, 3);
    out[oo + 48] = sar(a3 - a2, 3);
    oo += 64;
  }
}

/**
 * Whether a macroblock's source is a single flat colour.
 */
export function isFlatSource16(src: Uint8Array, off: number): boolean {
  const v = src[off];
  let o = off;
  for (let j = 0; j < 16; j++) {
    for (let i = 0; i < 16; i++) {
      if (src[o + i] !== v) {
        return false;
      }
    }
    o += kBps;
  }
  return true;
}

/**
 * Whether {@link numBlocks} blocks of levels carry at most {@link thresh} non-zero AC
 * coefficients between them.
 */
export function isFlat(
  levels: Int16Array,
  off: number,
  numBlocks: number,
  thresh: number
): boolean {
  let score = 0;
  let o = off;
  for (let b = 0; b < numBlocks; b++) {
    for (let i = 1; i < 16; i++) {
      score += nonZero(levels[o + i]);
      if (score > thresh) {
        return false;
      }
    }
    o += 16;
  }
  return true;
}

/**
 * Reconstructs one 4x4 block: adds the inverse transform of {@link inp} to the
 * prediction at {@link refOff} and stores it at {@link dstOff}.
 */
export function iTransform(
  ref: Uint8Array,
  refOff: number,
  inp: Int16Array,
  inOff: number,
  dst: Uint8Array,
  dstOff: number
): void {
  // Vertical pass, keeping the sixteen intermediates in locals.
  let a = inp[inOff] + inp[inOff + 8];
  let b = inp[inOff] - inp[inOff + 8];
  let c = mul2(inp[inOff + 4]) - mul1(inp[inOff + 12]);
  let d = mul1(inp[inOff + 4]) + mul2(inp[inOff + 12]);
  const c0 = a + d;
  const c1 = b + c;
  const c2 = b - c;
  const c3 = a - d;

  a = inp[inOff + 1] + inp[inOff + 9];
  b = inp[inOff + 1] - inp[inOff + 9];
  c = mul2(inp[inOff + 5]) - mul1(inp[inOff + 13]);
  d = mul1(inp[inOff + 5]) + mul2(inp[inOff + 13]);
  const c4 = a + d;
  const c5 = b + c;
  const c6 = b - c;
  const c7 = a - d;

  a = inp[inOff + 2] + inp[inOff + 10];
  b = inp[inOff + 2] - inp[inOff + 10];
  c = mul2(inp[inOff + 6]) - mul1(inp[inOff + 14]);
  d = mul1(inp[inOff + 6]) + mul2(inp[inOff + 14]);
  const c8 = a + d;
  const c9 = b + c;
  const c10 = b - c;
  const c11 = a - d;

  a = inp[inOff + 3] + inp[inOff + 11];
  b = inp[inOff + 3] - inp[inOff + 11];
  c = mul2(inp[inOff + 7]) - mul1(inp[inOff + 15]);
  d = mul1(inp[inOff + 7]) + mul2(inp[inOff + 15]);
  const c12 = a + d;
  const c13 = b + c;
  const c14 = b - c;
  const c15 = a - d;

  iTransformRow(c0, c4, c8, c12, ref, refOff, dst, dstOff);
  iTransformRow(c1, c5, c9, c13, ref, refOff + kBps, dst, dstOff + kBps);
  iTransformRow(
    c2,
    c6,
    c10,
    c14,
    ref,
    refOff + 2 * kBps,
    dst,
    dstOff + 2 * kBps
  );
  iTransformRow(
    c3,
    c7,
    c11,
    c15,
    ref,
    refOff + 3 * kBps,
    dst,
    dstOff + 3 * kBps
  );
}

function iTransformRow(
  t0: number,
  t1: number,
  t2: number,
  t3: number,
  ref: Uint8Array,
  refOff: number,
  dst: Uint8Array,
  dstOff: number
): void {
  const dc = t0 + 4;
  const a = dc + t2;
  const b = dc - t2;
  const c = mul2(t1) - mul1(t3);
  const d = mul1(t1) + mul2(t3);
  dst[dstOff] = clip8(ref[refOff] + sar(a + d, 3));
  dst[dstOff + 1] = clip8(ref[refOff + 1] + sar(b + c, 3));
  dst[dstOff + 2] = clip8(ref[refOff + 2] + sar(b - c, 3));
  dst[dstOff + 3] = clip8(ref[refOff + 3] + sar(a - d, 3));
}

/**
 * Reconstructs the two 4x4 blocks starting at {@link dstOff}.
 */
export function iTransform2(
  ref: Uint8Array,
  refOff: number,
  inp: Int16Array,
  inOff: number,
  dst: Uint8Array,
  dstOff: number
): void {
  iTransform(ref, refOff, inp, inOff, dst, dstOff);
  iTransform(ref, refOff + 4, inp, inOff + 16, dst, dstOff + 4);
}

//------------------------------------------------------------------------------
// Intra predictions.

/**
 * Clips `[-255, 510]` to a byte; indexed by `value + 255`.
 */
const clipTable = ((): Uint8Array => {
  const table = new Uint8Array(255 + 510 + 1);
  for (let i = -255; i <= 255 + 255; i++) {
    table[255 + i] = clip8(i);
  }
  return table;
})();

/**
 * Whether the host stores the least significant byte of a 32-bit word first.
 */
const hostLittleEndian = ((): boolean => {
  const word = new Uint32Array([0x01020304]);
  return new Uint8Array(word.buffer)[0] === 0x04;
})();

/**
 * Fills a 4x4 block with {@link value}. The 8x8 and 16x16 fills go through
 * {@link fill32} a word at a time; this one runs ten times per block and a
 * range fill costs more in call overhead than the sixteen stores it saves.
 */
function fill4(dst: Uint8Array, dstOff: number, value: number): void {
  for (let j = 0; j < 4; j++) {
    const o = dstOff + j * kBps;
    dst[o] = value;
    dst[o + 1] = value;
    dst[o + 2] = value;
    dst[o + 3] = value;
  }
}

function fill32(
  dst: Uint32Array,
  dstOff: number,
  value: number,
  size: number
): void {
  const v = value * 0x01010101;
  let o = dstOff >> 2;
  for (let j = 0; j < size; j++) {
    dst[o] = v;
    dst[o + 1] = v;
    if (size === 16) {
      dst[o + 2] = v;
      dst[o + 3] = v;
    }
    o += kBps >> 2;
  }
}

/**
 * Four bytes of {@link b} from {@link o} as the word that, stored through a
 * host-endian `Uint32Array` view, lands them back in the same order.
 * {@link verticalPred} copies the row above through such a view, so the order
 * has to follow the host rather than assume little-endian. Multiplication
 * rather than `<<` keeps the result exact.
 */
function word(b: Uint8Array, o: number): number {
  return hostLittleEndian
    ? b[o] + b[o + 1] * 0x100 + b[o + 2] * 0x10000 + b[o + 3] * 0x1000000
    : b[o] * 0x1000000 + b[o + 1] * 0x10000 + b[o + 2] * 0x100 + b[o + 3];
}

function verticalPred(
  dst: Uint32Array,
  dstOff: number,
  top: Uint8Array | undefined,
  topOff: number,
  size: number
): void {
  if (top === undefined) {
    fill32(dst, dstOff, 127, size);
    return;
  }
  const t0 = word(top, topOff);
  const t1 = word(top, topOff + 4);
  const t2 = size === 16 ? word(top, topOff + 8) : 0;
  const t3 = size === 16 ? word(top, topOff + 12) : 0;
  let o = dstOff >> 2;
  for (let j = 0; j < size; j++) {
    dst[o] = t0;
    dst[o + 1] = t1;
    if (size === 16) {
      dst[o + 2] = t2;
      dst[o + 3] = t3;
    }
    o += kBps >> 2;
  }
}

function horizontalPred(
  dst: Uint32Array,
  dstOff: number,
  left: Uint8Array | undefined,
  leftOff: number,
  size: number
): void {
  if (left === undefined) {
    fill32(dst, dstOff, 129, size);
    return;
  }
  let o = dstOff >> 2;
  for (let j = 0; j < size; j++) {
    const v = left[leftOff + j] * 0x01010101;
    dst[o] = v;
    dst[o + 1] = v;
    if (size === 16) {
      dst[o + 2] = v;
      dst[o + 3] = v;
    }
    o += kBps >> 2;
  }
}

function trueMotion(
  dst: Uint8Array,
  dst32: Uint32Array,
  dstOff: number,
  left: Uint8Array | undefined,
  leftOff: number,
  top: Uint8Array | undefined,
  topOff: number,
  size: number
): void {
  if (left === undefined) {
    if (top !== undefined) {
      verticalPred(dst32, dstOff, top, topOff, size);
    } else {
      fill32(dst32, dstOff, 129, size);
    }
    return;
  }
  if (top === undefined) {
    horizontalPred(dst32, dstOff, left, leftOff, size);
    return;
  }
  const clip = clipTable;
  const base = 255 - left[leftOff - 1];
  let doff = dstOff;
  for (let y = 0; y < size; y++) {
    const row = base + left[leftOff + y];
    for (let x = 0; x < size; x += 4) {
      dst[doff + x] = clip[row + top[topOff + x]];
      dst[doff + x + 1] = clip[row + top[topOff + x + 1]];
      dst[doff + x + 2] = clip[row + top[topOff + x + 2]];
      dst[doff + x + 3] = clip[row + top[topOff + x + 3]];
    }
    doff += kBps;
  }
}

function dcMode(
  dst: Uint32Array,
  dstOff: number,
  left: Uint8Array | undefined,
  leftOff: number,
  top: Uint8Array | undefined,
  topOff: number,
  size: number,
  round: number,
  shift: number
): void {
  let dc = 0;
  if (top !== undefined) {
    for (let j = 0; j < size; j++) {
      dc += top[topOff + j];
    }
    if (left !== undefined) {
      for (let j = 0; j < size; j++) {
        dc += left[leftOff + j];
      }
    } else {
      dc += dc;
    }
    dc = (dc + round) >> shift;
  } else if (left !== undefined) {
    for (let j = 0; j < size; j++) {
      dc += left[leftOff + j];
    }
    dc += dc;
    dc = (dc + round) >> shift;
  } else {
    dc = 0x80;
  }
  fill32(dst, dstOff, dc, size);
}

/**
 * Builds the four 16x16 luma predictions into the prediction cache {@link dst}.
 */
export function predLuma16(
  dst: Uint8Array,
  dst32: Uint32Array,
  left: Uint8Array | undefined,
  leftOff: number,
  top: Uint8Array | undefined,
  topOff: number
): void {
  dcMode(dst32, i16DC16, left, leftOff, top, topOff, 16, 16, 5);
  verticalPred(dst32, i16VE16, top, topOff, 16);
  horizontalPred(dst32, i16HE16, left, leftOff, 16);
  trueMotion(dst, dst32, i16TM16, left, leftOff, top, topOff, 16);
}

/**
 * Builds the four 8x8 chroma predictions, U and V side by side, into {@link dst}.
 */
export function predChroma8(
  dst: Uint8Array,
  dst32: Uint32Array,
  left: Uint8Array | undefined,
  leftOff: number,
  top: Uint8Array | undefined,
  topOff: number
): void {
  dcMode(dst32, c8DC8, left, leftOff, top, topOff, 8, 8, 4);
  verticalPred(dst32, c8VE8, top, topOff, 8);
  horizontalPred(dst32, c8HE8, left, leftOff, 8);
  trueMotion(dst, dst32, c8TM8, left, leftOff, top, topOff, 8);
  // V sits eight columns to the right of U.
  dcMode(dst32, c8DC8 + 8, left, leftOff + 16, top, topOff + 8, 8, 8, 4);
  verticalPred(dst32, c8VE8 + 8, top, topOff + 8, 8);
  horizontalPred(dst32, c8HE8 + 8, left, leftOff + 16, 8);
  trueMotion(dst, dst32, c8TM8 + 8, left, leftOff + 16, top, topOff + 8, 8);
}

function set4(
  dst: Uint8Array,
  base: number,
  x: number,
  y: number,
  value: number
): void {
  dst[base + x + y * kBps] = value;
}

function row4(
  dst: Uint8Array,
  at: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number,
  rows: number
): void {
  for (let i = 0; i < rows; i++) {
    const o = at + i * kBps;
    dst[o] = v0;
    dst[o + 1] = v1;
    dst[o + 2] = v2;
    dst[o + 3] = v3;
  }
}

function fillRow4(
  dst: Uint8Array,
  at: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number
): void {
  row4(dst, at, v0, v0, v0, v0, 1);
  row4(dst, at + kBps, v1, v1, v1, v1, 1);
  row4(dst, at + 2 * kBps, v2, v2, v2, v2, 1);
  row4(dst, at + 3 * kBps, v3, v3, v3, v3, 1);
}

/**
 * Builds all ten 4x4 luma predictions into {@link dst}.
 */
export function predLuma4(
  dst: Uint8Array,
  top: Uint8Array,
  topOff: number
): void {
  const x = top[topOff - 1];
  const i = top[topOff - 2];
  const j = top[topOff - 3];
  const k = top[topOff - 4];
  const l = top[topOff - 5];
  const a = top[topOff];
  const b = top[topOff + 1];
  const c = top[topOff + 2];
  const d = top[topOff + 3];
  const e = top[topOff + 4];
  const f = top[topOff + 5];
  const g = top[topOff + 6];
  const h = top[topOff + 7];

  // DC
  fill4(dst, i4DC4, (4 + a + b + c + d + l + k + j + i) >> 3);

  // TM
  const clip = clipTable;
  const base = 255 - x;
  for (let y = 0; y < 4; y++) {
    const row = base + top[topOff - 2 - y];
    const at = i4TM4 + y * kBps;
    dst[at] = clip[row + a];
    dst[at + 1] = clip[row + b];
    dst[at + 2] = clip[row + c];
    dst[at + 3] = clip[row + d];
  }

  // VE
  row4(
    dst,
    i4VE4,
    avg3(x, a, b),
    avg3(a, b, c),
    avg3(b, c, d),
    avg3(c, d, e),
    4
  );

  // HE
  fillRow4(
    dst,
    i4HE4,
    avg3(x, i, j),
    avg3(i, j, k),
    avg3(j, k, l),
    avg3(k, l, l)
  );

  // RD
  set4(dst, i4RD4, 0, 3, avg3(j, k, l));
  set4(dst, i4RD4, 0, 2, avg3(i, j, k));
  set4(dst, i4RD4, 1, 3, avg3(i, j, k));
  const rd2 = avg3(x, i, j);
  set4(dst, i4RD4, 0, 1, rd2);
  set4(dst, i4RD4, 1, 2, rd2);
  set4(dst, i4RD4, 2, 3, rd2);
  const rd3 = avg3(a, x, i);
  set4(dst, i4RD4, 0, 0, rd3);
  set4(dst, i4RD4, 1, 1, rd3);
  set4(dst, i4RD4, 2, 2, rd3);
  set4(dst, i4RD4, 3, 3, rd3);
  const rd4 = avg3(b, a, x);
  set4(dst, i4RD4, 1, 0, rd4);
  set4(dst, i4RD4, 2, 1, rd4);
  set4(dst, i4RD4, 3, 2, rd4);
  const rd5 = avg3(c, b, a);
  set4(dst, i4RD4, 2, 0, rd5);
  set4(dst, i4RD4, 3, 1, rd5);
  set4(dst, i4RD4, 3, 0, avg3(d, c, b));

  // VR
  const vr0 = avg2(x, a);
  set4(dst, i4VR4, 0, 0, vr0);
  set4(dst, i4VR4, 1, 2, vr0);
  const vr1 = avg2(a, b);
  set4(dst, i4VR4, 1, 0, vr1);
  set4(dst, i4VR4, 2, 2, vr1);
  const vr2 = avg2(b, c);
  set4(dst, i4VR4, 2, 0, vr2);
  set4(dst, i4VR4, 3, 2, vr2);
  set4(dst, i4VR4, 3, 0, avg2(c, d));
  set4(dst, i4VR4, 0, 3, avg3(k, j, i));
  set4(dst, i4VR4, 0, 2, avg3(j, i, x));
  const vr3 = avg3(i, x, a);
  set4(dst, i4VR4, 0, 1, vr3);
  set4(dst, i4VR4, 1, 3, vr3);
  const vr4 = avg3(x, a, b);
  set4(dst, i4VR4, 1, 1, vr4);
  set4(dst, i4VR4, 2, 3, vr4);
  const vr5 = avg3(a, b, c);
  set4(dst, i4VR4, 2, 1, vr5);
  set4(dst, i4VR4, 3, 3, vr5);
  set4(dst, i4VR4, 3, 1, avg3(b, c, d));

  // LD
  set4(dst, i4LD4, 0, 0, avg3(a, b, c));
  const ld1 = avg3(b, c, d);
  set4(dst, i4LD4, 1, 0, ld1);
  set4(dst, i4LD4, 0, 1, ld1);
  const ld2 = avg3(c, d, e);
  set4(dst, i4LD4, 2, 0, ld2);
  set4(dst, i4LD4, 1, 1, ld2);
  set4(dst, i4LD4, 0, 2, ld2);
  const ld3 = avg3(d, e, f);
  set4(dst, i4LD4, 3, 0, ld3);
  set4(dst, i4LD4, 2, 1, ld3);
  set4(dst, i4LD4, 1, 2, ld3);
  set4(dst, i4LD4, 0, 3, ld3);
  const ld4 = avg3(e, f, g);
  set4(dst, i4LD4, 3, 1, ld4);
  set4(dst, i4LD4, 2, 2, ld4);
  set4(dst, i4LD4, 1, 3, ld4);
  const ld5 = avg3(f, g, h);
  set4(dst, i4LD4, 3, 2, ld5);
  set4(dst, i4LD4, 2, 3, ld5);
  set4(dst, i4LD4, 3, 3, avg3(g, h, h));

  // VL
  set4(dst, i4VL4, 0, 0, avg2(a, b));
  const vl1 = avg2(b, c);
  set4(dst, i4VL4, 1, 0, vl1);
  set4(dst, i4VL4, 0, 2, vl1);
  const vl2 = avg2(c, d);
  set4(dst, i4VL4, 2, 0, vl2);
  set4(dst, i4VL4, 1, 2, vl2);
  const vl3 = avg2(d, e);
  set4(dst, i4VL4, 3, 0, vl3);
  set4(dst, i4VL4, 2, 2, vl3);
  set4(dst, i4VL4, 0, 1, avg3(a, b, c));
  const vl4 = avg3(b, c, d);
  set4(dst, i4VL4, 1, 1, vl4);
  set4(dst, i4VL4, 0, 3, vl4);
  const vl5 = avg3(c, d, e);
  set4(dst, i4VL4, 2, 1, vl5);
  set4(dst, i4VL4, 1, 3, vl5);
  const vl6 = avg3(d, e, f);
  set4(dst, i4VL4, 3, 1, vl6);
  set4(dst, i4VL4, 2, 3, vl6);
  set4(dst, i4VL4, 3, 2, avg3(e, f, g));
  set4(dst, i4VL4, 3, 3, avg3(f, g, h));

  // HD
  const hd0 = avg2(i, x);
  set4(dst, i4HD4, 0, 0, hd0);
  set4(dst, i4HD4, 2, 1, hd0);
  const hd1 = avg2(j, i);
  set4(dst, i4HD4, 0, 1, hd1);
  set4(dst, i4HD4, 2, 2, hd1);
  const hd2 = avg2(k, j);
  set4(dst, i4HD4, 0, 2, hd2);
  set4(dst, i4HD4, 2, 3, hd2);
  set4(dst, i4HD4, 0, 3, avg2(l, k));
  set4(dst, i4HD4, 3, 0, avg3(a, b, c));
  set4(dst, i4HD4, 2, 0, avg3(x, a, b));
  const hd3 = avg3(i, x, a);
  set4(dst, i4HD4, 1, 0, hd3);
  set4(dst, i4HD4, 3, 1, hd3);
  const hd4 = avg3(j, i, x);
  set4(dst, i4HD4, 1, 1, hd4);
  set4(dst, i4HD4, 3, 2, hd4);
  const hd5 = avg3(k, j, i);
  set4(dst, i4HD4, 1, 2, hd5);
  set4(dst, i4HD4, 3, 3, hd5);
  set4(dst, i4HD4, 1, 3, avg3(l, k, j));

  // HU
  set4(dst, i4HU4, 0, 0, avg2(i, j));
  const hu1 = avg2(j, k);
  set4(dst, i4HU4, 2, 0, hu1);
  set4(dst, i4HU4, 0, 1, hu1);
  const hu2 = avg2(k, l);
  set4(dst, i4HU4, 2, 1, hu2);
  set4(dst, i4HU4, 0, 2, hu2);
  set4(dst, i4HU4, 1, 0, avg3(i, j, k));
  const hu3 = avg3(j, k, l);
  set4(dst, i4HU4, 3, 0, hu3);
  set4(dst, i4HU4, 1, 1, hu3);
  const hu4 = avg3(k, l, l);
  set4(dst, i4HU4, 3, 1, hu4);
  set4(dst, i4HU4, 1, 2, hu4);
  set4(dst, i4HU4, 3, 2, l);
  set4(dst, i4HU4, 2, 2, l);
  set4(dst, i4HU4, 0, 3, l);
  set4(dst, i4HU4, 1, 3, l);
  set4(dst, i4HU4, 2, 3, l);
  set4(dst, i4HU4, 3, 3, l);
}

//------------------------------------------------------------------------------
// Metrics.

/**
 * The sum of squared differences over a 4x4 block.
 */
export function getSSE4x4(
  a: Uint8Array,
  aOff: number,
  b: Uint8Array,
  bOff: number
): number {
  let count = 0;
  let ao = aOff;
  let bo = bOff;
  for (let y = 0; y < 4; y++) {
    const d0 = a[ao] - b[bo];
    const d1 = a[ao + 1] - b[bo + 1];
    const d2 = a[ao + 2] - b[bo + 2];
    const d3 = a[ao + 3] - b[bo + 3];
    count += d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3;
    ao += kBps;
    bo += kBps;
  }
  return count;
}

/**
 * The sum of squared differences over a {@link w} by {@link h} block.
 */
export function getSSE(
  a: Uint8Array,
  aOff: number,
  b: Uint8Array,
  bOff: number,
  w: number,
  h: number
): number {
  let count = 0;
  let ao = aOff;
  let bo = bOff;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const diff = a[ao + x] - b[bo + x];
      count += diff * diff;
    }
    ao += kBps;
    bo += kBps;
  }
  return count;
}

/**
 * A weighted sum of the absolute Hadamard coefficients of one 4x4 block.
 */
function tTransform(src: Uint8Array, off: number): number {
  let o = off;
  // Horizontal pass.
  let a0 = src[o] + src[o + 2];
  let a1 = src[o + 1] + src[o + 3];
  let a2 = src[o + 1] - src[o + 3];
  let a3 = src[o] - src[o + 2];
  const t0 = a0 + a1;
  const t1 = a3 + a2;
  const t2 = a3 - a2;
  const t3 = a0 - a1;

  o += kBps;
  a0 = src[o] + src[o + 2];
  a1 = src[o + 1] + src[o + 3];
  a2 = src[o + 1] - src[o + 3];
  a3 = src[o] - src[o + 2];
  const t4 = a0 + a1;
  const t5 = a3 + a2;
  const t6 = a3 - a2;
  const t7 = a0 - a1;

  o += kBps;
  a0 = src[o] + src[o + 2];
  a1 = src[o + 1] + src[o + 3];
  a2 = src[o + 1] - src[o + 3];
  a3 = src[o] - src[o + 2];
  const t8 = a0 + a1;
  const t9 = a3 + a2;
  const t10 = a3 - a2;
  const t11 = a0 - a1;

  o += kBps;
  a0 = src[o] + src[o + 2];
  a1 = src[o + 1] + src[o + 3];
  a2 = src[o + 1] - src[o + 3];
  a3 = src[o] - src[o + 2];
  const t12 = a0 + a1;
  const t13 = a3 + a2;
  const t14 = a3 - a2;
  const t15 = a0 - a1;

  // Vertical pass, accumulating the weighted magnitudes as it goes.
  return (
    tTransformColumn(t0, t4, t8, t12, 38, 32, 20, 9) +
    tTransformColumn(t1, t5, t9, t13, 32, 28, 17, 7) +
    tTransformColumn(t2, t6, t10, t14, 20, 17, 10, 4) +
    tTransformColumn(t3, t7, t11, t15, 9, 7, 4, 2)
  );
}

function tTransformColumn(
  r0: number,
  r1: number,
  r2: number,
  r3: number,
  w0: number,
  w1: number,
  w2: number,
  w3: number
): number {
  const a0 = r0 + r2;
  const a1 = r1 + r3;
  const a2 = r1 - r3;
  const a3 = r0 - r2;
  const b0 = a0 + a1;
  const b1 = a3 + a2;
  const b2 = a3 - a2;
  const b3 = a0 - a1;
  return (
    w0 * absBranchless(b0) +
    w1 * absBranchless(b1) +
    w2 * absBranchless(b2) +
    w3 * absBranchless(b3)
  );
}

/**
 * The weighted spectrum of one 4x4 block.
 */
export function spectrum4x4(src: Uint8Array, off: number): number {
  return tTransform(src, off);
}

/**
 * How far a block is from a spectrum already measured by {@link spectrum4x4}.
 */
export function distoFrom(
  reference: number,
  b: Uint8Array,
  bOff: number
): number {
  const d = tTransform(b, bOff) - reference;
  return absBranchless(d) >> 5;
}

/**
 * The sum of each of the four 4x4 blocks of a 16x4 strip, written to {@link dc}
 * starting at {@link dcOff}.
 */
export function mean16x4(
  ref: Uint8Array,
  off: number,
  dc: Uint32Array,
  dcOff: number
): void {
  let o = off;
  for (let k = 0; k < 4; k++) {
    let avg = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        avg += ref[o + x + y * kBps];
      }
    }
    dc[dcOff + k] = avg;
    o += 4;
  }
}

//------------------------------------------------------------------------------
// Block copies.

/**
 * Copies a 4x4 block.
 */
export function copy4x4(
  src: Uint8Array,
  srcOff: number,
  dst: Uint8Array,
  dstOff: number
): void {
  let so = srcOff;
  let doff = dstOff;
  for (let y = 0; y < 4; y++) {
    dst[doff] = src[so];
    dst[doff + 1] = src[so + 1];
    dst[doff + 2] = src[so + 2];
    dst[doff + 3] = src[so + 3];
    so += kBps;
    doff += kBps;
  }
}

/**
 * Copies a 16x8 block.
 */
export function copy16x8(
  src: Uint8Array,
  srcOff: number,
  dst: Uint8Array,
  dstOff: number
): void {
  let so = srcOff;
  let doff = dstOff;
  for (let y = 0; y < 8; y++) {
    ArrayUtils.copyRange(src, so, dst, doff, 16);
    so += kBps;
    doff += kBps;
  }
}
