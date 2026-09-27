/** @format */

import { LibError } from '../../error/lib-error.js';
import { VP8LCostModel } from './vp8l-cost-model.js';
import { VP8LCover } from './vp8l-cover.js';
import { Lz77 } from './vp8l-lz77.js';
import { maxMatchLen, VP8LMatches } from './vp8l-matches.js';

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
 * The spec caps the distance at 1048576, and the first 120 values are taken by
 * the near-neighbour plane codes, leaving this as the real maximum.
 */
const maxDistance = 1048456;

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
        if (n > maxMatchLen) {
          n = maxMatchLen;
        }
        lengths[i] = n;
      }
    }
  }

  let i = numPixels - 1;
  while (i > 0) {
    let maxLen = numPixels - i;
    if (maxLen > maxMatchLen) {
      maxLen = maxMatchLen;
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
      while (c >= 0 && steps < maxChain) {
        steps++;
        const dist = i - c;
        if (dist > maxDistance) {
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
    while (bestDist > 0 && best < maxMatchLen) {
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
