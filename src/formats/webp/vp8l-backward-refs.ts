/** @format */

import { LibError } from '../../error/lib-error.js';
import { VP8LCostModel } from './vp8l-cost-model.js';
import { VP8LCover } from './vp8l-cover.js';
import { Lz77 } from './vp8l-lz77.js';
import {
  maxMatchDistance,
  maxMatchLength,
  matchLengthBits,
  VP8LMatches,
} from './vp8l-matches.js';

export { VP8LCostModel };
export { VP8LCover };
export { VP8LMatches };

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
 * How far back the chain of candidate positions is followed.
 *
 * libwebp's `GetMaxItersForQuality` tops out at 86 even at quality 100, and it
 * is the value tuned over a far wider corpus than anything measured here.
 */
const maxChain = 86;

/**
 * Finds the best match at every position.
 *
 * Positions are visited from the end backwards, because a match found at one
 * position usually answers for its neighbors too: if the same distance still
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
  const match = new Uint32Array(numPixels);

  // The offsets reaching the nearest plane codes: the pixel before, the one
  // before that, and the three directly above and to either side.
  //
  // libwebp's kLZ77Box strategy tries every offset whose plane code is a near
  // neighbor, some ninety of them. Carrying the next ring out as well was
  // measured at 0.04 points of the corpus for 19% more encode time, which is
  // the wrong way round while size is inside budget and speed is not.
  const cheapDistances = Int32Array.from(
    Array.from(
      new Set(
        [1, 2, width - 1, width, width + 1].filter(
          (d) => d >= 1 && d < numPixels
        )
      )
    ).sort((x, y) => x - y)
  );
  const numCheap = cheapDistances.length;
  if (numCheap > 5) {
    throw new LibError(
      `the near-neighbor walk has five slots, not ${numCheap}`
    );
  }

  const slots = new Int32Array(5);
  slots.fill(numPixels);
  for (let c = 0; c < numCheap; c++) {
    slots[c] = cheapDistances[c];
  }
  const d0 = slots[0];
  const d1 = slots[1];
  const d2 = slots[2];
  const d3 = slots[3];
  const d4 = slots[4];
  let n0 = 0;
  let n1 = 0;
  let n2 = 0;
  let n3 = 0;
  let n4 = 0;
  let cheapAt = numPixels;

  let i = numPixels - 1;
  while (i > 0) {
    while (cheapAt > i) {
      const p = cheapAt - 1;
      const at = px[p];
      n0 =
        p >= d0 && at === px[p - d0] ? (n0 < maxMatchLength ? n0 + 1 : n0) : 0;
      n1 =
        p >= d1 && at === px[p - d1] ? (n1 < maxMatchLength ? n1 + 1 : n1) : 0;
      n2 =
        p >= d2 && at === px[p - d2] ? (n2 < maxMatchLength ? n2 + 1 : n2) : 0;
      n3 =
        p >= d3 && at === px[p - d3] ? (n3 < maxMatchLength ? n3 + 1 : n3) : 0;
      n4 =
        p >= d4 && at === px[p - d4] ? (n4 < maxMatchLength ? n4 + 1 : n4) : 0;
      cheapAt = p;
    }
    let maxLen = numPixels - i;
    if (maxLen > maxMatchLength) {
      maxLen = maxMatchLength;
    }
    let best = 0;
    let bestDist = 0;

    if (n0 > best) {
      best = n0;
      bestDist = d0;
    }
    if (n1 > best) {
      best = n1;
      bestDist = d1;
    }
    if (n2 > best) {
      best = n2;
      bestDist = d2;
    }
    if (n3 > best) {
      best = n3;
      bestDist = d3;
    }
    if (n4 > best) {
      best = n4;
      bestDist = d4;
    }

    if (best < maxLen) {
      // Past a few hundred pixels a longer match saves almost nothing, so the
      // walk gives up rather than chasing the last few.
      const enough = maxLen < 256 ? maxLen : 256;
      let c = prev[i];
      let steps = 0;
      while (c >= 0 && steps < maxChain) {
        steps++;
        const dist = i - c;
        if (dist > maxMatchDistance) {
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

    match[i] = (bestDist << matchLengthBits) | best;

    // Carry the match left for as long as it keeps matching.
    let j = i;
    while (bestDist > 0 && best < maxMatchLength) {
      const k = j - 1;
      if (k <= 0 || k < bestDist || px[k - bestDist] !== px[k]) {
        break;
      }
      best++;
      match[k] = (bestDist << matchLengthBits) | best;
      j = k;
    }
    i = j - 1;
  }
  return new VP8LMatches(match, cheapDistances);
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
