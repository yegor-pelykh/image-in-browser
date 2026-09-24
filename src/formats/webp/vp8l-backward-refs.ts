/** @format */

import { LibError } from '../../error/lib-error.js';
import { mul32 } from './vp8l-color-hash.js';
import * as huffman from './vp8l-huffman-encoder.js';

/**
 * The token stream for one image: literals and back-references in the order
 * they are coded, plus where in the image each one starts.
 *
 * Typed arrays: a literal-heavy image has a token per pixel, and a growable
 * `number[]` that long costs eight bytes an element plus doubling slack.
 */
export class VP8LBackwardRefs {
  /**
   * One entry per token: nonzero if it is a literal.
   */
  public readonly isLiteral: Uint8Array;

  /**
   * Pixel index of each literal, in literal order.
   */
  public readonly literalIndex: Int32Array;

  /**
   * Match length of each back-reference, in back-reference order.
   */
  public readonly length: Int32Array;

  /**
   * Match distance of each back-reference, in back-reference order.
   */
  public readonly distance: Int32Array;

  /**
   * Pixel index each token starts at, in token order. Meta Huffman uses this
   * to decide which group of codes a token belongs to.
   */
  public readonly position: Int32Array;

  constructor(
    isLiteral: Uint8Array,
    literalIndex: Int32Array,
    length: Int32Array,
    distance: Int32Array,
    position: Int32Array
  ) {
    this.isLiteral = isLiteral;
    this.literalIndex = literalIndex;
    this.length = length;
    this.distance = distance;
    this.position = position;
  }
}

/**
 * A parse of the image: how many pixels the token starting at each position
 * covers, and at what distance. Positions inside a token are never read.
 *
 * The two arrays are sized together so a caller cannot mismatch them. The
 * code that fills them runs without bounds checks.
 */
export class VP8LCover {
  /**
   * Length of both arrays. Nothing that reads them checks bounds, so a second
   * length kept alongside corrupts memory instead of throwing.
   */
  public readonly numPixels: number;

  public readonly cover: Int32Array;
  public readonly distance: Int32Array;

  constructor(numPixels: number) {
    this.numPixels = numPixels;
    this.cover = new Int32Array(numPixels);
    this.distance = new Int32Array(numPixels);
  }
}

/**
 * How far back the chain of candidate positions is followed.
 *
 * libwebp's `GetMaxItersForQuality` tops out at 86 even at quality 100, and it
 * is the value tuned over a far wider corpus than anything measured here.
 */
const _maxChain = 86;

/**
 * Longest match the tokenizer will emit.
 */
const _maxMatchLen = 4096;

/**
 * The spec caps the distance at 1048576, and the first 120 values are taken by
 * the near-neighbour plane codes, leaving this as the real maximum.
 */
const _maxDistance = 1048456;

/**
 * The longest match reachable from each position, as parallel arrays.
 *
 * A parse that considers every way of covering the image needs the answer at
 * every pixel, so the whole table is built up front.
 */
export class VP8LMatches {
  /**
   * Match length at each pixel position, 0 where nothing matches.
   */
  public readonly length: Int32Array;

  /**
   * Match distance at each pixel position, meaningless where length is 0.
   */
  public readonly distance: Int32Array;

  /**
   * How far each of [cheapDistances] repeats from every position.
   *
   * These are the offsets that land on the near-neighbour plane codes, which
   * are the cheapest distances the format has. They are worth keeping even
   * when the chain finds something longer, since a shorter match at a
   * near-neighbour distance can still cost less. The chain on its own would
   * have to walk back a whole row of candidates to reach the one directly
   * above, which is past the search limit.
   * Lengths never exceed [_maxMatchLen], so sixteen bits are enough, and
   * there is one of these per offset per pixel.
   */
  public readonly cheapLength: Uint16Array[];

  /**
   * The distance each entry of [cheapLength] corresponds to.
   */
  public readonly cheapDistances: number[];

  constructor(
    length: Int32Array,
    distance: Int32Array,
    cheapLength: Uint16Array[],
    cheapDistances: number[]
  ) {
    this.length = length;
    this.distance = distance;
    this.cheapLength = cheapLength;
    this.cheapDistances = cheapDistances;
  }
}

/**
 * Finds the best match at every position.
 *
 * Positions are visited from the end backwards, because a match found at one
 * position usually answers for its neighbours too: if the same distance still
 * matches one pixel to the left, that pixel's best match is this one grown by
 * one, and no search is needed for it. On flat or repetitive images a single
 * search then covers a whole run, which is most of what makes such images
 * cheap to encode. libwebp does the same in `VP8LHashChainFill`.
 */
export function computeMatches(
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  a: Uint8Array,
  numPixels: number,
  width: number
): VP8LMatches {
  // Bounds checks are off here, so the lengths are the contract.
  if (
    r.length < numPixels ||
    g.length < numPixels ||
    b.length < numPixels ||
    a.length < numPixels
  ) {
    throw new LibError(`computeMatches needs ${numPixels} of every plane`);
  }
  const lz = new Lz77(r, g, b, a, numPixels);
  lz.fillChain();
  const px = lz._px;
  const prev = lz._prev;
  const length = new Int32Array(numPixels);
  const distance = new Int32Array(numPixels);

  // The offsets reaching the nearest plane codes: the pixel before, the one
  // before that, and the three directly above and to either side.
  //
  // libwebp's kLZ77Box strategy tries every offset whose plane code is a near
  // neighbour, some ninety of them. Carrying the next ring out as well was
  // measured at 0.04 points of the corpus for 19% more encode time, which is
  // the wrong way round while size is inside budget and speed is not.
  const cheapDistances = Array.from(
    new Set(
      [1, 2, width - 1, width, width + 1].filter((d) => d >= 1 && d < numPixels)
    )
  ).sort((x, y) => x - y);
  const cheapLength: Uint16Array[] = cheapDistances.map(
    () => new Uint16Array(numPixels)
  );

  // Taken from the right: if an offset repeats for n pixels starting one to
  // the right, it repeats for n + 1 here, so each is one comparison.
  for (let c = 0; c < cheapDistances.length; c++) {
    const dist = cheapDistances[c];
    const lengths = cheapLength[c];
    for (let i = numPixels - 1; i >= dist; i--) {
      if (px[i] === px[i - dist]) {
        let n = i + 1 < numPixels ? lengths[i + 1] + 1 : 1;
        const maxLen = numPixels - i;
        if (n > maxLen) {
          n = maxLen;
        }
        if (n > _maxMatchLen) {
          n = _maxMatchLen;
        }
        lengths[i] = n;
      }
    }
  }

  let i = numPixels - 1;
  while (i > 0) {
    let maxLen = numPixels - i;
    if (maxLen > _maxMatchLen) {
      maxLen = _maxMatchLen;
    }
    let best = 0;
    let bestDist = 0;

    // Two candidates cost nothing to try and are the cheapest distances the
    // format has, so they go first: either can leave the chain with nothing to
    // beat and be skipped entirely.
    for (let c = 0; c < cheapDistances.length; c++) {
      const n = cheapLength[c][i];
      if (n > best) {
        best = n;
        bestDist = cheapDistances[c];
      }
    }

    if (best < maxLen) {
      // Past a few hundred pixels a longer match saves almost nothing, so the
      // walk gives up rather than chasing the last few.
      const enough = maxLen < 256 ? maxLen : 256;
      let c = prev[i];
      let steps = 0;
      while (c >= 0 && steps < _maxChain) {
        steps++;
        const dist = i - c;
        if (dist > _maxDistance) {
          break;
        }
        // Only a longer match can win, so the pixel one past the current best
        // is a cheap rejection.
        if (px[c + best] === px[i + best]) {
          let len = 0;
          while (len < maxLen && px[i + len] === px[c + len]) {
            len++;
          }
          if (len > best) {
            best = len;
            bestDist = dist;
            if (best >= enough) {
              break;
            }
          }
        }
        c = prev[c];
      }
    }

    length[i] = best;
    distance[i] = bestDist;

    // Carry the match left for as long as it keeps matching.
    let j = i;
    while (bestDist > 0 && best < _maxMatchLen) {
      const k = j - 1;
      if (k <= 0 || k < bestDist || px[k - bestDist] !== px[k]) {
        break;
      }
      best++;
      length[k] = best;
      distance[k] = bestDist;
      j = k;
    }
    i = j - 1;
  }
  return new VP8LMatches(length, distance, cheapLength, cheapDistances);
}

/**
 * Rebuilds the token stream from a parse that says, for each position, how
 * many pixels the token starting there covers.
 *
 * A cover of 1 is a literal; anything longer is a back-reference at the
 * distance the parse chose for that position.
 */
export function refsFromCover(parse: VP8LCover): VP8LBackwardRefs {
  const numPixels = parse.numPixels;
  const cover = parse.cover;
  const coverDistance = parse.distance;

  // Counted first so every array is allocated at its final size.
  let numTokens = 0;
  let numLiterals = 0;
  for (let i = 0; i < numPixels;) {
    const n = cover[i];
    numTokens++;
    if (n <= 1) {
      numLiterals++;
      i++;
    } else {
      i += n;
    }
  }

  const isLiteral = new Uint8Array(numTokens);
  const literalIndex = new Int32Array(numLiterals);
  const length = new Int32Array(numTokens - numLiterals);
  const distance = new Int32Array(numTokens - numLiterals);
  const positions = new Int32Array(numTokens);
  let t = 0;
  let lit = 0;
  let ref = 0;
  for (let i = 0; i < numPixels;) {
    const n = cover[i];
    positions[t] = i;
    if (n <= 1) {
      isLiteral[t] = 1;
      literalIndex[lit++] = i;
      i++;
    } else {
      length[ref] = n;
      distance[ref++] = coverDistance[i];
      i += n;
    }
    t++;
  }
  return new VP8LBackwardRefs(
    isLiteral,
    literalIndex,
    length,
    distance,
    positions
  );
}

/**
 * The hash chain the match search walks.
 */
class Lz77 {
  public readonly _px: Uint32Array;

  public readonly _prev: Int32Array;

  private readonly _numPixels: number;
  private _head: Int32Array;
  private _shift: number;

  constructor(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    numPixels: number
  ) {
    this._numPixels = numPixels;
    this._px = new Uint32Array(numPixels);
    this._prev = new Int32Array(numPixels);

    let hashBits = 1;
    while (1 << hashBits < numPixels && hashBits < 18) {
      hashBits++;
    }
    this._shift = 32 - hashBits;
    this._head = new Int32Array(1 << hashBits).fill(-1);

    // Pixels packed one word each, so matching compares a single value per
    // position instead of four, which is most of what this loop does.
    const px = this._px;
    for (let i = 0; i < numPixels; i++) {
      px[i] = (g[i] << 24) | (r[i] << 16) | (b[i] << 8) | a[i];
    }
  }

  /**
   * libwebp's own pair hash, kept in 32-bit arithmetic.
   *
   * A 64-bit multiply would be the obvious way to mix two pixels, but on the
   * web an int is a double: only the low 53 bits of a product survive, and a
   * 64-bit constant is not even expressible. Two 32-bit multiplies say the
   * same thing on every platform.
   */
  private _hash(first: number, second: number): number {
    return (
      ((mul32(second, 0xc6a4a793) + mul32(first, 0x5bd1e996)) & 0xffffffff) >>>
      this._shift
    );
  }

  /**
   * Links every position to the previous one that hashes the same.
   *
   * Positions are keyed on the pair of pixels starting there: one pixel alone
   * puts far too many positions in a slot, and no match shorter than three
   * pixels is ever coded, so keying on two loses nothing.
   *
   * libwebp keys a run of identical pixels on its colour and how much of it
   * is left, to spread the run across slots. Tried here and reverted: it made
   * the PNG suite 11% larger and the encode 36% slower. With a pair key, the
   * most recent entry in a run's slot is the immediately preceding pixel, so
   * the search finds a full-length match at distance 1, the cheapest distance
   * code there is, on its first step. Spreading the run replaces that with
   * distant candidates, which libwebp can afford because it tries an RLE pass
   * as a separate strategy
   */
  public fillChain(): void {
    const n = this._numPixels;
    if (n <= 2) {
      return;
    }
    const px = this._px;
    const prev = this._prev;
    const head = this._head;
    for (let pos = 0; pos < n - 1; pos++) {
      const h = this._hash(px[pos], px[pos + 1]);
      prev[pos] = head[h];
      head[h] = pos;
    }
    // The last position starts no pair, so nothing links to it.
    prev[n - 1] = -1;
  }
}

/**
 * What each symbol costs to code, in bits, estimated from a first pass over
 * the image.
 *
 * The tokenizer has to choose between a match and a literal before any Huffman
 * code exists, so it works from the distribution a greedy pass produced. The
 * numbers are approximate, but they rank the choices far better than length
 * alone: a long match to a distant pixel can cost more than a short one near
 * by, and no length comparison sees that.
 */
export class VP8LCostModel {
  private readonly _green: Float64Array;
  private readonly _red: Float64Array;
  private readonly _blue: Float64Array;
  private readonly _alpha: Float64Array;
  private readonly _dist: Float64Array;
  private _lengthBits: Float64Array | undefined;

  private constructor(
    green: Float64Array,
    red: Float64Array,
    blue: Float64Array,
    alpha: Float64Array,
    dist: Float64Array
  ) {
    this._green = green;
    this._red = red;
    this._blue = blue;
    this._alpha = alpha;
    this._dist = dist;
  }

  /**
   * Builds the model straight from a cover of the image.
   *
   * Reading the cover rather than a built token stream keeps the first pass
   * from materialising a list per token field only to throw it away.
   */
  public static fromCover(
    parse: VP8LCover,
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    width: number
  ): VP8LCostModel {
    const green = new Float64Array(280);
    const red = new Float64Array(256);
    const blue = new Float64Array(256);
    const alpha = new Float64Array(256);
    const dist = new Float64Array(40);

    const numPixels = parse.numPixels;
    const cover = parse.cover;
    const coverDistance = parse.distance;
    let i = 0;
    while (i < numPixels) {
      const n = cover[i];
      if (n <= 1) {
        green[g[i]]++;
        red[r[i]]++;
        blue[b[i]]++;
        alpha[a[i]]++;
        i++;
      } else {
        green[huffman.lengthSymbol(n)]++;
        dist[
          huffman.prefixCode(huffman.distToPlaneCode(width, coverDistance[i]))
        ]++;
        i += n;
      }
    }

    return new VP8LCostModel(
      VP8LCostModel._toBits(green),
      VP8LCostModel._toBits(red),
      VP8LCostModel._toBits(blue),
      VP8LCostModel._toBits(alpha),
      VP8LCostModel._toBits(dist)
    );
  }

  /**
   * Bits to code a match of each length, symbol and extra bits together.
   *
   * A parse that weighs every length at every position asks for this millions
   * of times, and it depends on nothing but the length.
   */
  public get lengthBits(): Float64Array {
    if (this._lengthBits === undefined) {
      const t = new Float64Array(_maxMatchLen + 1);
      for (let len = 1; len <= _maxMatchLen; len++) {
        const extra = huffman.lengthExtra(len).extraBits;
        t[len] = this._green[huffman.lengthSymbol(len)] + extra;
      }
      this._lengthBits = t;
    }
    return this._lengthBits;
  }

  /**
   * Bits to code the distance part of a match at [distance].
   */
  public distanceBits(distance: number, width: number): number {
    const planeCode = huffman.distToPlaneCode(width, distance);
    const extra = huffman.prefixExtra(planeCode).extraBits;
    return this._dist[huffman.prefixCode(planeCode)] + extra;
  }

  /**
   * Turns counts into bit costs. A symbol the first pass never used still has
   * to be codeable, so it is charged as if it had appeared once.
   */
  private static _toBits(freq: Float64Array): Float64Array {
    let total = 0.0;
    for (const f of freq) {
      total += f;
    }
    if (total === 0) {
      return new Float64Array(freq.length).fill(8);
    }
    const bits = new Float64Array(freq.length);
    for (let i = 0; i < freq.length; i++) {
      const f = freq[i] > 0 ? freq[i] : 1.0;
      bits[i] = -(Math.log(f / (total + 1)) / Math.LN2);
    }
    return bits;
  }

  /**
   * Bits to code the pixel at [i] as a literal.
   */
  public literalCost(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    i: number
  ): number {
    return (
      this._green[g[i]] + this._red[r[i]] + this._blue[b[i]] + this._alpha[a[i]]
    );
  }
}
