/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { VP8LClustering } from './vp8l-clustering.js';

export { VP8LClustering };

/**
 * Symbol statistics for a VP8L stream, and the clustering that turns
 * per-region statistics into meta Huffman groups.
 *
 * A single set of Huffman codes has to serve the whole image, so a photo with
 * a flat sky above busy foliage pays for one compromise distribution. Meta
 * Huffman lets regions with different statistics use different codes; the work
 * here is deciding which regions should share.
 */

const logTableSize = 4096;

/**
 * Natural logs of the small integers, since every log taken here is of a
 * symbol count.
 *
 * Clustering asks for the entropy of a histogram against every open group, so
 * these are taken by the million, and almost all counts are small. Values come
 * from `Math.log` itself, so tabulating them changes no result.
 */
const logOfInt: Float64Array = (() => {
  const t = new Float64Array(logTableSize);
  for (let i = 1; i < logTableSize; i++) {
    t[i] = Math.log(i);
  }
  return t;
})();

function logInt(n: number): number {
  return n < logTableSize ? logOfInt[n] : Math.log(n);
}

/**
 * Symbol counts for one region: the five alphabets a VP8L stream codes with.
 */
export class VP8LHistogram {
  /**
   * 280 literal and length symbols, plus one per color cache entry.
   */
  public readonly greenSize: number;
  public readonly green: Uint32Array;
  public readonly red: Uint32Array;
  public readonly blue: Uint32Array;
  public readonly alpha: Uint32Array;
  public readonly dist: Uint32Array;

  private readonly _arrays: Uint32Array[];

  private readonly _sum: Float64Array = new Float64Array(5);
  private readonly _total: Int32Array = new Int32Array(5);
  private readonly _used: Int32Array = new Int32Array(5);
  private _statsValid: boolean = false;

  /**
   * Which symbols of each alphabet this histogram has counted, in the order
   * they were first reached, with how many in {@link _touchedCount}.
   *
   * The alternative is to find them by scanning, but the green alphabet alone
   * spans over a thousand symbols while a 16x16 block holds at most 256
   * tokens, and meta Huffman builds one histogram per block. Recording each
   * symbol as it arrives costs a branch and turns every later pass over this
   * histogram from the size of the alphabet into the size of what was
   * actually used.
   */
  private readonly _touchedIdx: Int32Array[] = [
    VP8LHistogram.noSymbols,
    VP8LHistogram.noSymbols,
    VP8LHistogram.noSymbols,
    VP8LHistogram.noSymbols,
    VP8LHistogram.noSymbols,
  ];
  private readonly _touchedCount: Int32Array = new Int32Array(5);

  private static readonly noSymbols = new Int32Array(0);

  constructor(greenSize: number) {
    this.greenSize = greenSize;
    this.green = new Uint32Array(greenSize);
    this.red = new Uint32Array(256);
    this.blue = new Uint32Array(256);
    this.alpha = new Uint32Array(256);
    this.dist = new Uint32Array(40);
    this._arrays = [this.green, this.red, this.blue, this.alpha, this.dist];
  }

  public addLiteral(r: number, g: number, b: number, a: number): void {
    if (this.green[g]++ === 0) this.touch(0, g);
    if (this.red[r]++ === 0) this.touch(1, r);
    if (this.blue[b]++ === 0) this.touch(2, b);
    if (this.alpha[a]++ === 0) this.touch(3, a);
  }

  public addCacheRef(key: number): void {
    if (this.green[280 + key]++ === 0) this.touch(0, 280 + key);
  }

  public addCopy(lengthSymbol: number, distSymbol: number): void {
    if (this.green[lengthSymbol]++ === 0) this.touch(0, lengthSymbol);
    if (this.dist[distSymbol]++ === 0) this.touch(4, distSymbol);
  }

  public addTo(other: VP8LHistogram): void {
    for (let k = 0; k < 5; k++) {
      const mine = this._arrays[k];
      const theirs = other._arrays[k];
      const touched = this._touchedIdx[k];
      const n = this._touchedCount[k];
      for (let j = 0; j < n; j++) {
        const i = touched[j];
        if (theirs[i] === 0) {
          other.touch(k, i);
        }
        theirs[i] += mine[i];
      }
    }
    other._statsValid = false;
  }

  public clone(): VP8LHistogram {
    const c = new VP8LHistogram(this.greenSize);
    this.addTo(c);
    return c;
  }

  /**
   * Estimated cost in bits of coding this region plus describing its codes.
   *
   * The entropy is what an ideal prefix code would spend; the per-symbol term
   * stands in for the code length table in the header, and is what stops
   * clustering from splitting into ever more groups that each code little.
   */
  public get cost(): number {
    this.ensureStats();
    let c = 0.0;
    for (let k = 0; k < 5; k++) {
      c +=
        VP8LHistogram.entropyOf(this._sum[k], this._total[k]) +
        this._used[k] * VP8LHistogram._bitsPerDescribedSymbol;
    }
    return c;
  }

  /**
   * Cost of the histogram this and {@link other} would sum to, without building it.
   *
   * The clustering asks this for every block against every open group. Both
   * terms of the entropy are kept as running sums, so only the symbols the
   * block actually touches have to be revisited, rather than the whole
   * alphabet.
   */
  public mergedCostWith(other: VP8LHistogram): number {
    this.ensureStats();
    other.ensureStats();
    let c = 0.0;
    for (let k = 0; k < 5; k++) {
      const mine = this._arrays[k];
      const theirs = other._arrays[k];
      let sum = this._sum[k];
      let used = this._used[k];
      const touched = other._touchedIdx[k];
      const n = other._touchedCount[k];
      for (let j = 0; j < n; j++) {
        const i = touched[j];
        const a = mine[i];
        const b = theirs[i];
        if (a > 0) {
          sum += a * logInt(a);
        } else {
          used++;
        }
        const merged = a + b;
        sum -= merged * logInt(merged);
      }
      c +=
        VP8LHistogram.entropyOf(sum, this._total[k] + other._total[k]) +
        used * VP8LHistogram._bitsPerDescribedSymbol;
    }
    return c;
  }

  /**
   * Entropy in bits from the running sum of -f·ln(f) and the total count.
   */
  private static entropyOf(sum: number, total: number): number {
    return total === 0 ? 0 : (sum + total * logInt(total)) / Math.LN2;
  }

  private touch(k: number, symbol: number): void {
    let list = this._touchedIdx[k];
    const n = this._touchedCount[k];
    if (n === list.length) {
      list = new Int32Array(n === 0 ? 8 : n * 2);
      ArrayUtils.copyRange(this._touchedIdx[k], 0, list, 0, n);
      this._touchedIdx[k] = list;
    }
    list[n] = symbol;
    this._touchedCount[k] = n + 1;
  }

  private ensureStats(): void {
    if (this._statsValid) {
      return;
    }
    for (let k = 0; k < 5; k++) {
      const freq = this._arrays[k];
      const touched = this._touchedIdx[k];
      const n = this._touchedCount[k];
      let sum = 0.0;
      let total = 0;
      for (let j = 0; j < n; j++) {
        const f = freq[touched[j]];
        sum -= f * logInt(f);
        total += f;
      }
      this._sum[k] = sum;
      this._total[k] = total;
      // No symbol is recorded twice and every recorded one has a nonzero
      // count, so the count of them is exactly how many the codes must
      // describe.
      this._used[k] = n;
    }
    this._statsValid = true;
  }

  /**
   * Rough cost of carrying one symbol through the code length table.
   */
  private static readonly _bitsPerDescribedSymbol = 4.0;
}

/**
 * Assigns each block a meta Huffman group, merging blocks whose statistics are
 * close enough that sharing a set of codes costs less than describing another.
 *
 * Blocks are visited in raster order and each joins the group it damages
 * least, or starts a new one while {@link maxGroups} allows. That is one pass rather
 * than the full pairwise search libwebp runs, which keeps this linear in the
 * number of blocks at a small cost in compression. A second pass then revisits
 * every block against the groups that ended up existing, since the first
 * blocks chose from almost nothing.
 *
 * {@link maxGroups} of 16 is measured: 24 buys 0.03% and costs 3% of the encode.
 *
 * Returns the group index per block, or undefined when one group for the whole
 * image is no more expensive than splitting it.
 */
export function clusterHistograms(
  blocks: VP8LHistogram[],
  maxGroups = 16
): VP8LClustering | undefined {
  if (blocks.length < 2) {
    return undefined;
  }

  const groups: VP8LHistogram[] = [];
  const assignment = new Int32Array(blocks.length);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.cost === 0) {
      // A block no token starts in can join anything; keep it with group 0.
      assignment[i] = 0;
      if (groups.length === 0) {
        groups.push(block.clone());
      }
      continue;
    }

    let bestGroup = -1;
    let bestIncrease = Infinity;
    for (let gi = 0; gi < groups.length; gi++) {
      const increase =
        groups[gi].mergedCostWith(block) - groups[gi].cost - block.cost;
      if (increase < bestIncrease) {
        bestIncrease = increase;
        bestGroup = gi;
      }
    }

    // Starting a group means describing another five code tables, so only do it
    // when merging would cost more than that.
    if (
      bestGroup < 0 ||
      (bestIncrease > newGroupCost && groups.length < maxGroups)
    ) {
      assignment[i] = groups.length;
      groups.push(block.clone());
    } else {
      assignment[i] = bestGroup;
      block.addTo(groups[bestGroup]);
    }
  }

  if (groups.length < 2) {
    return undefined;
  }

  const greenSize = blocks[0].greenSize;

  // Second pass. Each block joined the best group among those that existed
  // when it was reached, which for the first blocks is barely a choice at all.
  // Now that the whole set is known, give every block the group it actually
  // costs least to join and rebuild the groups from that, the way libwebp's
  // HistogramRemap does.
  const rebuilt = Array.from(
    { length: groups.length },
    (_) => new VP8LHistogram(greenSize)
  );
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.cost === 0) {
      // A block no token starts in codes nothing either way, so keep it with
      // its neighbor: a run of equal entries is what the entropy image
      // itself compresses best.
      assignment[i] = i > 0 ? assignment[i - 1] : 0;
    } else {
      let best = 0;
      let bestIncrease = Infinity;
      for (let gi = 0; gi < groups.length; gi++) {
        // The block's own cost is the same whichever group takes it, so only
        // what it adds to the group decides.
        const increase = groups[gi].mergedCostWith(block) - groups[gi].cost;
        if (increase < bestIncrease) {
          bestIncrease = increase;
          best = gi;
        }
      }
      assignment[i] = best;
    }
    block.addTo(rebuilt[assignment[i]]);
  }

  // A group the remap emptied would still cost five code tables to describe,
  // so renumber around it.
  const used = new Uint32Array(groups.length);
  for (const gi of assignment) {
    used[gi]++;
  }
  const renumbered = new Int32Array(groups.length);
  const kept: VP8LHistogram[] = [];
  for (let gi = 0; gi < groups.length; gi++) {
    renumbered[gi] = kept.length;
    if (used[gi] > 0) {
      kept.push(rebuilt[gi]);
    }
  }
  if (kept.length < 2) {
    return undefined;
  }
  for (let i = 0; i < assignment.length; i++) {
    assignment[i] = renumbered[assignment[i]];
  }
  groups.length = 0;
  groups.push(...kept);

  // libwebp follows its clustering with HistogramCombineGreedy, a full pairwise
  // search for groups worth merging. Tried here and measured at 196 bytes over
  // a 330 image corpus, which is nothing: the remap above already separates the
  // groups well enough that no pair is left worth collapsing. libwebp needs it
  // because it has no equivalent of that pass.

  // Compare against coding everything with one set of codes.
  const single = new VP8LHistogram(greenSize);
  for (const b of blocks) {
    b.addTo(single);
  }
  let split = 0.0;
  for (const g of groups) {
    split += g.cost;
  }

  // The entropy image has to be stored too. It is itself entropy coded, so
  // charge it the entropy of the group assignment rather than a flat rate:
  // costs from different block sizes are only comparable if this term scales
  // with the block count the way the real stream does.
  const counts = new Uint32Array(groups.length);
  for (const gi of assignment) {
    counts[gi]++;
  }
  let perBlock = 0.0;
  for (const c of counts) {
    if (c > 0) {
      perBlock -= c * (Math.log(c / blocks.length) / Math.LN2);
    }
  }
  // Plus the five code tables the entropy image needs for itself.
  split += perBlock + 5 * 32;

  return split < single.cost
    ? new VP8LClustering(assignment, groups.length, split)
    : undefined;
}

/**
 * What another meta Huffman group costs before it can pay for itself: five
 * more code tables to describe.
 */
const newGroupCost = 5 * 32.0;
