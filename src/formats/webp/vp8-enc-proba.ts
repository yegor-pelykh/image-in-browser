/** @format */

import {
  kLevelCodes,
  kLevelFixedCosts,
  kEntropyCost,
} from './vp8-cost-tables.js';
import {
  numBands,
  numCtx,
  numProbas,
  numTypes,
  kBands,
  kCoeffsProba0,
  kCoeffsUpdateProba,
} from './vp8-tables.js';
import { VP8BoolEncoder } from './vp8-bool-encoder.js';

/**
 * Highest level whose cost still varies with its context; above this the
 * variable part is constant and lives in [kLevelFixedCosts].
 */
export const maxVariableLevel = 67;

const _numCoeffProbas = numTypes * numBands * numCtx * numProbas;

/**
 * One cost table per (type, band, context), holding levels 0..67.
 */
const _costTableSize = maxVariableLevel + 1;

function _flatten(table: number[][][][]): Uint8Array {
  const flat = new Uint8Array(_numCoeffProbas);
  let i = 0;
  for (const t of table) {
    for (const b of t) {
      for (const c of b) {
        for (const p of c) {
          flat[i++] = p;
        }
      }
    }
  }
  return flat;
}

const _defaultProbas = _flatten(kCoeffsProba0);
const _updateProbas = _flatten(kCoeffsUpdateProba);

/**
 * The cost of coding [bit] when zero has probability [proba] out of 256.
 */
export function bitCost(bit: number, proba: number): number {
  return bit === 0 ? kEntropyCost[proba] : kEntropyCost[255 - proba];
}

/**
 * The probability state of one frame.
 */
export class VP8EncProba {
  /**
   * Probabilities, indexed by `((type * numBands + band) * numCtx + ctx) *
   * numProbas + p`.
   */
  public readonly coeffs: Uint8Array = new Uint8Array(_numCoeffProbas);

  /**
   * How often each probability was exercised, and how often the bit was one.
   *
   * The count is in the upper sixteen bits and the number of ones in the
   * lower sixteen, so one add records both.
   */
  public readonly stats: Uint32Array = new Uint32Array(_numCoeffProbas);

  /**
   * The cost of each level, per (type, band, context).
   */
  public readonly levelCost: Uint16Array = new Uint16Array(
    numTypes * numBands * numCtx * _costTableSize
  );

  /**
   * Where in [levelCost] the table for `(type, position, ctx)` starts.
   */
  public readonly costBase: Int32Array = new Int32Array(numTypes * 16 * numCtx);

  /**
   * Probabilities of the segment tree.
   */
  public readonly segments: Uint8Array = new Uint8Array([255, 255, 255]);

  public skipProba: number = 0;

  /**
   * Whether a per-macroblock skip flag is coded at all.
   */
  public useSkipProba: boolean = false;

  /**
   * Number of macroblocks that turned out to be entirely zero.
   */
  public nbSkip: number = 0;

  /**
   * Whether [coeffs] changed since [levelCost] was last computed.
   */
  public dirty: boolean = true;

  constructor() {
    this.coeffs.set(_defaultProbas);
  }

  /**
   * The cost of one coefficient, given the base of its cost table.
   */
  public levelCostAt(base: number, level: number): number {
    return (
      kLevelFixedCosts[level] +
      this.levelCost[
        base + (level > maxVariableLevel ? maxVariableLevel : level)
      ]
    );
  }

  /**
   * Recomputes [levelCost] from [coeffs].
   */
  public calculateLevelCosts(): void {
    if (!this.dirty) {
      return;
    }
    for (let ctype = 0; ctype < numTypes; ctype++) {
      for (let band = 0; band < numBands; band++) {
        for (let ctx = 0; ctx < numCtx; ctx++) {
          const p = ((ctype * numBands + band) * numCtx + ctx) * numProbas;
          const table =
            ((ctype * numBands + band) * numCtx + ctx) * _costTableSize;
          // A non-zero context has already paid for the "not the end of the
          // block" bit; a zero context has not, so it is added here.
          const cost0 = ctx > 0 ? bitCost(1, this.coeffs[p]) : 0;
          const nonZero = bitCost(1, this.coeffs[p + 1]) + cost0;
          this.levelCost[table] = bitCost(0, this.coeffs[p + 1]) + cost0;
          for (let v = 1; v <= maxVariableLevel; v++) {
            this.levelCost[table + v] = nonZero + this._variableLevelCost(v, p);
          }
        }
      }
      for (let n = 0; n < 16; n++) {
        for (let ctx = 0; ctx < numCtx; ctx++) {
          this.costBase[(ctype * 16 + n) * numCtx + ctx] =
            ((ctype * numBands + kBands[n]) * numCtx + ctx) * _costTableSize;
        }
      }
    }
    this.dirty = false;
  }

  /**
   * The context-dependent part of the cost of coding [level].
   */
  private _variableLevelCost(level: number, p: number): number {
    let pattern = kLevelCodes[level - 1][0];
    let bits = kLevelCodes[level - 1][1];
    let cost = 0;
    for (let i = 2; pattern !== 0; i++) {
      if ((pattern & 1) !== 0) {
        cost += bitCost(bits & 1, this.coeffs[p + i]);
      }
      bits >>= 1;
      pattern >>= 1;
    }
    return cost;
  }

  /**
   * Records that [bit] was coded through the counter at [at].
   */
  public recordStats(bit: number, at: number): number {
    let p = this.stats[at];
    // Halve both counters before the total can overflow its sixteen bits.
    if (p >= 0xfffe0000) {
      p = ((p + 1) >> 1) & 0x7fff7fff;
    }
    this.stats[at] = p + 0x00010000 + bit;
    return bit;
  }

  public resetTokenStats(): void {
    this.stats.fill(0);
  }

  /**
   * Adopts the probabilities the statistics suggest, wherever they pay for
   * the eight bits it costs to signal them.
   *
   * Returns the cost of coding the updates, in 1/256ths of a bit.
   */
  public finalizeTokenProbas(): number {
    let hasChanged = false;
    let size = 0;
    for (let i = 0; i < _numCoeffProbas; i++) {
      const stat = this.stats[i];
      const nb = stat & 0xffff;
      const total = (stat >> 16) & 0xffff;
      const updateProba = _updateProbas[i];
      const oldP = _defaultProbas[i];
      const newP = _calcTokenProba(nb, total);
      const oldCost = _branchCost(nb, total, oldP) + bitCost(0, updateProba);
      const newCost =
        _branchCost(nb, total, newP) + bitCost(1, updateProba) + 8 * 256;
      const useNewP = oldCost > newCost;
      size += bitCost(useNewP ? 1 : 0, updateProba);
      if (useNewP) {
        this.coeffs[i] = newP;
        hasChanged ||= newP !== oldP;
        size += 8 * 256;
      } else {
        this.coeffs[i] = oldP;
      }
    }
    this.dirty = hasChanged;
    return size;
  }

  /**
   * Writes the probability updates into the frame header.
   */
  public write(bw: VP8BoolEncoder): void {
    for (let i = 0; i < _numCoeffProbas; i++) {
      const p0 = this.coeffs[i];
      const update = p0 !== _defaultProbas[i];
      if (bw.putBit(update ? 1 : 0, _updateProbas[i]) !== 0) {
        bw.putBits(p0, 8);
      }
    }
    if (bw.putBitUniform(this.useSkipProba ? 1 : 0) !== 0) {
      bw.putBits(this.skipProba, 8);
    }
  }
}

function _calcTokenProba(nb: number, total: number): number {
  return nb !== 0 ? 255 - Math.trunc((nb * 255) / total) : 255;
}

/**
 * The cost of coding [nb] ones and `total - nb` zeroes at [proba].
 */
function _branchCost(nb: number, total: number, proba: number): number {
  return nb * bitCost(1, proba) + (total - nb) * bitCost(0, proba);
}
