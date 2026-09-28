/** @format */

/**
 * Choosing how to cover the image with literals and matches so that the whole
 * stream costs as little as possible.
 *
 * Lazy matching decides one token at a time, looking a single position ahead.
 * That is cheap and wrong: whether a match is worth taking depends on what the
 * rest of the image does with the pixels it consumes, which a one-step
 * lookahead cannot see. Here every position is instead given the cheapest way
 * of reaching it from any earlier one, which is a shortest path, and the
 * answer falls out by walking the predecessors back. libwebp calls the same
 * idea `BackwardReferencesHashChainDistanceOnly` followed by `TraceBackwards`.
 */

import { LibError } from '../../error/lib-error.js';
import { VP8LCostModel, VP8LCover, VP8LMatches } from './vp8l-backward-refs.js';
import { maxMatchLength, matchLengthBits } from './vp8l-matches.js';

/**
 * Shortest match worth coding; below this a literal is cheaper.
 */
const minMatchLen = 3;

/**
 * How many lengths of a match are weighed individually before only its full
 * extent is considered.
 *
 * Cost grows with length in steps, not smoothly, so nearly all of the choice
 * lives among the shortest few; past this the only length that tends to win
 * is the longest available. Weighing every length instead, the way libwebp's
 * interval-based cost manager does, would make the parse cost the length of
 * the longest match at every pixel: measured at 48 it buys 0.01% over 16.
 */
const lengthsWeighed = 16;

/**
 * Writes into {@link parse} the cheapest cover of the image, as the number of pixels
 * the token starting at each position spans.
 *
 * Positions inside a token are left as they were and never read, so {@link parse}
 * may arrive holding an earlier cover.
 */
export function optimalCover(
  matches: VP8LMatches,
  costs: VP8LCostModel,
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  a: Uint8Array,
  width: number,
  parse: VP8LCover
): void {
  const numPixels = parse.numPixels;
  const cover = parse.cover;
  const coverDistance = parse.distance;

  // Bounds checks are off here, so the lengths are the contract.
  const cheapDists = matches.cheapDistances;
  const numCheap = cheapDists.length;
  let cheapInRange = numCheap <= 5;
  for (let c = 0; c < numCheap; c++) {
    const d = cheapDists[c];
    cheapInRange = cheapInRange && d >= 1 && d < numPixels;
  }
  if (
    r.length < numPixels ||
    g.length < numPixels ||
    b.length < numPixels ||
    a.length < numPixels ||
    matches.match.length !== numPixels ||
    costs.lengthBits.length <= maxMatchLength ||
    !cheapInRange
  ) {
    throw new LibError(`optimalCover needs ${numPixels} of every array`);
  }

  const cost = new Float64Array(numPixels + 1).fill(Infinity, 1, numPixels + 1);
  const from = new Uint16Array(numPixels + 1);
  const fromWhich = new Uint8Array(numPixels + 1);
  const lengthBits = costs.lengthBits;
  const match = matches.match;
  // Each near-neighbour distance costs the same wherever it is used.
  const cheapDistBits = new Float64Array(numCheap);
  for (let c = 0; c < numCheap; c++) {
    cheapDistBits[c] = costs.distanceBits(cheapDists[c], width);
  }
  const cheapEnd = new Int32Array(numCheap);
  const candidates = 1 + numCheap;

  for (let i = 0; i < numPixels; i++) {
    const here = cost[i];

    // Coding this pixel on its own is always possible, so every position is
    // reachable and the parse can never fail.
    const asLiteral = here + costs.literalCost(r, g, b, a, i);
    if (asLiteral < cost[i + 1]) {
      cost[i + 1] = asLiteral;
      from[i + 1] = 1;
    }

    // Every way of reaching further is weighed: whatever the search settled
    // on, and each near-neighbour offset. The search already tries those and
    // keeps one only when it is longest, but a shorter match at a
    // near-neighbour distance can still win here, since those are the cheapest
    // distances the format codes.
    for (let which = 0; which < candidates; which++) {
      let maxLen = 0;
      let dist = 0;
      let distBits = 0;
      // The length decides whether the candidate is usable at all, so it is
      // read before the distance is priced.
      if (which === 0) {
        const packed = match[i];
        maxLen = packed & maxMatchLength;
        if (maxLen < minMatchLen) {
          continue;
        }
        dist = packed >>> matchLengthBits;
        distBits = here + costs.distanceBits(dist, width);
      } else {
        const c = which - 1;
        const d = cheapDists[c];
        if (i < d) {
          continue;
        }
        if (cheapEnd[c] <= i) {
          if (
            g[i] !== g[i - d] ||
            r[i] !== r[i - d] ||
            b[i] !== b[i - d] ||
            a[i] !== a[i - d]
          ) {
            continue;
          }
          let e = i + 1;
          while (
            e < numPixels &&
            g[e] === g[e - d] &&
            r[e] === r[e - d] &&
            b[e] === b[e - d] &&
            a[e] === a[e - d]
          ) {
            e++;
          }
          cheapEnd[c] = e;
        }
        const run = cheapEnd[c] - i;
        maxLen = run > maxMatchLength ? maxMatchLength : run;
        if (maxLen < minMatchLen) {
          continue;
        }
        dist = d;
        distBits = here + cheapDistBits[c];
      }

      const weighed = maxLen < lengthsWeighed ? maxLen : lengthsWeighed;
      for (let len = minMatchLen; len <= weighed; len++) {
        const c = distBits + lengthBits[len];
        if (c < cost[i + len]) {
          cost[i + len] = c;
          from[i + len] = len;
          fromWhich[i + len] = which;
        }
      }
      if (maxLen > weighed) {
        const c = distBits + lengthBits[maxLen];
        if (c < cost[i + maxLen]) {
          cost[i + maxLen] = c;
          from[i + maxLen] = maxLen;
          fromWhich[i + maxLen] = which;
        }
      }
    }
  }

  // Walk the predecessors back, then turn the chain around so that each token
  // is recorded at the position it starts from.
  let at = numPixels;
  while (at > 0) {
    const len = from[at];
    const start = at - len;
    cover[start] = len;
    const w = fromWhich[at];
    coverDistance[start] =
      w === 0 ? match[start] >>> matchLengthBits : cheapDists[w - 1];
    at = start;
  }
}
