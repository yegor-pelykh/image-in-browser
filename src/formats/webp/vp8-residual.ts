/** @format */

/**
 * Coding, pricing and counting the coefficients of one 4x4 block.
 *
 * The three go together because they walk the same tree: the cost function
 * prices exactly the decisions the writer will make, or the mode search would
 * be choosing against the wrong bitstream.
 */

import { VP8BoolEncoder } from './vp8-bool-encoder.js';
import { VP8EncProba, bitCost, maxVariableLevel } from './vp8-enc-proba.js';
import { kLevelCodes } from './vp8-cost-tables.js';
import { numBands, numCtx, numProbas, kBands } from './vp8-tables.js';
import { VP8TokenBuffer } from './vp8-tokens.js';

/**
 * The four kinds of block, which each have their own probabilities.
 */
export const typeI16AC = 0;
export const typeI16DC = 1;
export const typeChroma = 2;
export const typeI4AC = 3;

/**
 * The escape codes for levels too large to code directly, from RFC 6386 13.2.
 */
const _cat3 = [173, 148, 140];
const _cat4 = [176, 155, 140, 135];
const _cat5 = [180, 157, 141, 134, 130];
const _cat6 = [254, 254, 243, 230, 196, 177, 153, 140, 133, 130, 129];

function _probaIdx(type: number, band: number, ctx: number): number {
  return ((type * numBands + band) * numCtx + ctx) * numProbas;
}

/**
 * The coefficients of one block, and where its probabilities live.
 */
export class VP8Residual {
  /**
   * The first coefficient that is coded: 1 for the AC part of an intra 16x16
   * macroblock, whose DC is carried by a separate block.
   */
  public first: number = 0;

  /**
   * Position of the last non-zero coefficient, or -1 if there is none.
   */
  public last: number = -1;

  public coeffType: number = 0;

  public coeffs!: Int16Array;
  public coeffsOff: number = 0;

  public init(first: number, coeffType: number): void {
    this.first = first;
    this.coeffType = coeffType;
  }

  /**
   * Points the residual at sixteen levels and finds the last non-zero one.
   */
  public setCoeffs(levels: Int16Array, off: number): void {
    this.coeffs = levels;
    this.coeffsOff = off;
    this.last = -1;
    for (let n = 15; n >= 0; n--) {
      if (levels[off + n] !== 0) {
        this.last = n;
        break;
      }
    }
  }
}

/**
 * What coding [res] after a block whose context was [ctx0] would cost, in
 * 1/256ths of a bit.
 */
export function getResidualCost(
  proba: VP8EncProba,
  res: VP8Residual,
  ctx0: number
): number {
  const type = res.coeffType;
  const coeffs = res.coeffs;
  const off = res.coeffsOff;
  const bands = kBands;
  let n = res.first;
  // For n of 0 or 1 the band equals n, so this is the right probability.
  const p0 = proba.coeffs[_probaIdx(type, n, ctx0)];
  if (res.last < 0) {
    return bitCost(0, p0);
  }
  // The tables already include the "block is not empty" bit for a non-zero
  // context; for a zero context the syntax puts it here instead.
  let cost = ctx0 === 0 ? bitCost(1, p0) : 0;
  let t = proba.costBase[(type * 16 + n) * numCtx + ctx0];
  const base = type * 16 * numCtx;
  for (; n < res.last; n++) {
    const c = coeffs[off + n];
    const v = c < 0 ? -c : c;
    cost += proba.levelCostAt(t, v);
    t = proba.costBase[base + (n + 1) * numCtx + (v >= 2 ? 2 : v)];
  }
  const c = coeffs[off + n];
  const v = c < 0 ? -c : c;
  cost += proba.levelCostAt(t, v);
  if (n < 15) {
    // One more bit says that the block ends here.
    const ctx = v === 1 ? 1 : 2;
    cost += bitCost(0, proba.coeffs[_probaIdx(type, bands[n + 1], ctx)]);
  }
  return cost;
}

/**
 * Writes [res] to the bitstream. Returns 1 if the block had any coefficient.
 */
export function putCoeffs(
  bw: VP8BoolEncoder,
  proba: VP8EncProba,
  res: VP8Residual,
  ctx: number
): number {
  const type = res.coeffType;
  const bands = kBands;
  const coeffs = res.coeffs;
  const off = res.coeffsOff;
  const probas = proba.coeffs;
  let n = res.first;
  let p = _probaIdx(type, n, ctx);
  if (bw.putBit(res.last >= 0 ? 1 : 0, probas[p]) === 0) {
    return 0;
  }

  while (n < 16) {
    const c = coeffs[off + n++];
    const sign = c < 0;
    let v = sign ? -c : c;
    if (bw.putBit(v !== 0 ? 1 : 0, probas[p + 1]) === 0) {
      p = _probaIdx(type, bands[n], 0);
      continue;
    }
    if (bw.putBit(v > 1 ? 1 : 0, probas[p + 2]) === 0) {
      p = _probaIdx(type, bands[n], 1);
    } else {
      if (bw.putBit(v > 4 ? 1 : 0, probas[p + 3]) === 0) {
        if (bw.putBit(v !== 2 ? 1 : 0, probas[p + 4]) !== 0) {
          bw.putBit(v === 4 ? 1 : 0, probas[p + 5]);
        }
      } else if (bw.putBit(v > 10 ? 1 : 0, probas[p + 6]) === 0) {
        if (bw.putBit(v > 6 ? 1 : 0, probas[p + 7]) === 0) {
          bw.putBit(v === 6 ? 1 : 0, 159);
        } else {
          bw.putBit(v >= 9 ? 1 : 0, 165);
          bw.putBit((v & 1) === 0 ? 1 : 0, 145);
        }
      } else {
        let mask: number;
        let tab: number[];
        if (v < 3 + (8 << 1)) {
          bw.putBit(0, probas[p + 8]);
          bw.putBit(0, probas[p + 9]);
          v -= 3 + (8 << 0);
          mask = 1 << 2;
          tab = _cat3;
        } else if (v < 3 + (8 << 2)) {
          bw.putBit(0, probas[p + 8]);
          bw.putBit(1, probas[p + 9]);
          v -= 3 + (8 << 1);
          mask = 1 << 3;
          tab = _cat4;
        } else if (v < 3 + (8 << 3)) {
          bw.putBit(1, probas[p + 8]);
          bw.putBit(0, probas[p + 10]);
          v -= 3 + (8 << 2);
          mask = 1 << 4;
          tab = _cat5;
        } else {
          bw.putBit(1, probas[p + 8]);
          bw.putBit(1, probas[p + 10]);
          v -= 3 + (8 << 3);
          mask = 1 << 10;
          tab = _cat6;
        }
        let i = 0;
        while (mask !== 0) {
          bw.putBit((v & mask) !== 0 ? 1 : 0, tab[i++]);
          mask >>= 1;
        }
      }
      p = _probaIdx(type, bands[n], 2);
    }
    bw.putBitUniform(sign ? 1 : 0);
    if (n === 16 || bw.putBit(n <= res.last ? 1 : 0, probas[p]) === 0) {
      return 1; // end of block
    }
  }
  return 1;
}

/**
 * Counts the events [res] would code, without writing anything.
 */
export function recordCoeffs(
  proba: VP8EncProba,
  res: VP8Residual,
  ctx: number
): number {
  const type = res.coeffType;
  const bands = kBands;
  const coeffs = res.coeffs;
  const off = res.coeffsOff;
  let n = res.first;
  let s = _probaIdx(type, n, ctx);
  if (res.last < 0) {
    proba.recordStats(0, s);
    return 0;
  }
  while (n <= res.last) {
    proba.recordStats(1, s);
    let v = coeffs[off + n++];
    while (v === 0) {
      proba.recordStats(0, s + 1);
      s = _probaIdx(type, bands[n], 0);
      v = coeffs[off + n++];
    }
    proba.recordStats(1, s + 1);
    if (proba.recordStats(v > 1 || v < -1 ? 1 : 0, s + 2) === 0) {
      // The level is -1 or 1, which the tree codes with no further bits.
      s = _probaIdx(type, bands[n], 1);
    } else {
      let level = v < 0 ? -v : v;
      if (level > maxVariableLevel) {
        level = maxVariableLevel;
      }
      const bits = kLevelCodes[level - 1][1];
      let pattern = kLevelCodes[level - 1][0];
      for (let i = 0; (pattern >>= 1) !== 0; i++) {
        const mask = 2 << i;
        if ((pattern & 1) !== 0) {
          proba.recordStats((bits & mask) !== 0 ? 1 : 0, s + 3 + i);
        }
      }
      s = _probaIdx(type, bands[n], 2);
    }
  }
  if (n < 16) {
    proba.recordStats(0, s);
  }
  return 1;
}

/**
 * Records [res] into [tokens], to be written once the probabilities settle.
 */
export function recordCoeffTokens(
  proba: VP8EncProba,
  res: VP8Residual,
  ctx: number,
  tokens: VP8TokenBuffer
): number {
  const type = res.coeffType;
  const bands = kBands;
  const coeffs = res.coeffs;
  const off = res.coeffsOff;
  const last = res.last;
  let n = res.first;
  let id = _probaIdx(type, n, ctx);
  if (tokens.add(proba, last >= 0 ? 1 : 0, id) === 0) {
    return 0;
  }

  while (n < 16) {
    const c = coeffs[off + n++];
    const sign = c < 0;
    const v = sign ? -c : c;
    if (tokens.add(proba, v !== 0 ? 1 : 0, id + 1) === 0) {
      id = _probaIdx(type, bands[n], 0);
      continue;
    }
    if (tokens.add(proba, v > 1 ? 1 : 0, id + 2) === 0) {
      id = _probaIdx(type, bands[n], 1);
    } else {
      if (tokens.add(proba, v > 4 ? 1 : 0, id + 3) === 0) {
        if (tokens.add(proba, v !== 2 ? 1 : 0, id + 4) !== 0) {
          tokens.add(proba, v === 4 ? 1 : 0, id + 5);
        }
      } else if (tokens.add(proba, v > 10 ? 1 : 0, id + 6) === 0) {
        if (tokens.add(proba, v > 6 ? 1 : 0, id + 7) === 0) {
          tokens.addConstant(v === 6 ? 1 : 0, 159);
        } else {
          tokens.addConstant(v >= 9 ? 1 : 0, 165);
          tokens.addConstant((v & 1) === 0 ? 1 : 0, 145);
        }
      } else {
        let mask: number;
        let tab: number[];
        let residue = v - 3;
        if (residue < 8 << 1) {
          tokens.add(proba, 0, id + 8);
          tokens.add(proba, 0, id + 9);
          residue -= 8 << 0;
          mask = 1 << 2;
          tab = _cat3;
        } else if (residue < 8 << 2) {
          tokens.add(proba, 0, id + 8);
          tokens.add(proba, 1, id + 9);
          residue -= 8 << 1;
          mask = 1 << 3;
          tab = _cat4;
        } else if (residue < 8 << 3) {
          tokens.add(proba, 1, id + 8);
          tokens.addStat(proba, 0, id + 10, id + 9);
          residue -= 8 << 2;
          mask = 1 << 4;
          tab = _cat5;
        } else {
          tokens.add(proba, 1, id + 8);
          tokens.addStat(proba, 1, id + 10, id + 9);
          residue -= 8 << 3;
          mask = 1 << 10;
          tab = _cat6;
        }
        let i = 0;
        while (mask !== 0) {
          tokens.addConstant((residue & mask) !== 0 ? 1 : 0, tab[i++]);
          mask >>= 1;
        }
      }
      id = _probaIdx(type, bands[n], 2);
    }
    tokens.addConstant(sign ? 1 : 0, 128);
    if (n === 16 || tokens.add(proba, n <= last ? 1 : 0, id) === 0) {
      return 1; // end of block
    }
  }
  return 1;
}
