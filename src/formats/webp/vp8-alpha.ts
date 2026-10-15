/** @format */

/**
 * Coding the alpha channel of a lossy WebP.
 *
 * VP8 itself has no alpha, so transparency travels in its own chunk: the
 * plane is optionally predicted from its neighbors and then compressed with
 * the lossless coder, which handles a single 8-bit plane well because it is
 * usually mostly flat.
 */

import { ArrayUtils } from '../../common/array-utils.js';
import { absBranchless } from './vp8-sar.js';
import { WebPFilters } from './webp-filters.js';
import { VP8LEncoder } from './vp8l-encoder.js';

/**
 * Compression methods of the alpha chunk.
 */
const alphaNoCompression = 0;
const alphaLosslessCompression = 1;

/**
 * How hard to look for a predictive filter.
 */
export const alphaFilterNone = 0;
export const alphaFilterFast = 1;
export const alphaFilterBest = 2;

/**
 * The value the ALPH header's preprocessing field takes when the plane was
 * reduced to fewer levels.
 */
const alphaPreprocessedLevels = 1;

/**
 * Below this many distinct values, filtering only gets in the way.
 */
const minColorsForFilterNone = 16;

/**
 * Encodes the alpha plane as the payload of an `ALPH` chunk.
 *
 * {@link filtering} is {@link alphaFilterNone}, {@link alphaFilterFast} or {@link alphaFilterBest};
 * the last tries every filter and keeps the smallest result.
 *
 * {@link quality} below 100 reduces the plane to fewer distinct levels first, which
 * costs fidelity in the transparency but compresses much better. At 100 the
 * plane is coded exactly.
 */
export function encodeAlphaChunk(
  alpha: Uint8Array,
  width: number,
  height: number,
  filtering = alphaFilterFast,
  compress = true,
  quality = 100
): Uint8Array {
  let reducedLevels = false;
  let plane = alpha;
  if (quality < 100) {
    // libwebp's mapping: sixteen levels already give a low error against the
    // original, so that is where the moderate quality 70 lands.
    const levels =
      quality <= 70 ? 2 + Math.trunc(quality / 5) : 16 + (quality - 70) * 8;
    plane = quantizeLevels(alpha, levels);
    reducedLevels = true;
  }
  const candidates = filtersToTry(plane, width, height, filtering);
  const scratch =
    candidates.length === 1 && candidates[0] === 0
      ? undefined
      : new Uint8Array(width * height);

  let best: Uint8Array | undefined = undefined;
  for (const filter of candidates) {
    const source = applyFilter(plane, width, height, filter, scratch);
    const chunk = encodeOne(
      source,
      width,
      height,
      filter,
      compress,
      reducedLevels
    );
    if (best === undefined || chunk.length < best.length) {
      best = chunk;
    }
  }
  return best!;
}

/**
 * Reduces {@link data} to at most {@link levels} distinct values, by Lloyd's algorithm on
 * its histogram.
 *
 * The smallest and largest values are pinned, so a plane that runs from fully
 * transparent to fully opaque still does. Returns {@link data} itself when it
 * already has few enough values, and a new list otherwise, so the caller's
 * plane is never modified.
 */
export function quantizeLevels(data: Uint8Array, levels: number): Uint8Array {
  if (levels < 2 || levels > 256 || data.length === 0) {
    return data;
  }
  const freq = new Int32Array(256);
  let minS = 255;
  let maxS = 0;
  let distinct = 0;
  for (const v of data) {
    if (freq[v] === 0) {
      distinct++;
    }
    freq[v]++;
    if (v < minS) {
      minS = v;
    }
    if (v > maxS) {
      maxS = v;
    }
  }
  if (distinct <= levels) {
    return data;
  }

  // Centroids start spread evenly over the range in use.
  const centroid = new Float64Array(256);
  for (let i = 0; i < levels; i++) {
    centroid[i] = minS + ((maxS - minS) * i) / (levels - 1);
  }
  const slotOf = new Int32Array(256);

  const errThreshold = 1e-4 * data.length;
  let lastErr = 1e38;
  for (let iter = 0; iter < maxQuantIters; iter++) {
    const sum = new Float64Array(256);
    const count = new Float64Array(256);
    let slot = 0;
    // The values are walked in order, so the nearest centroid only ever moves
    // forwards and the assignment is one pass rather than a search per value.
    for (let s = minS; s <= maxS; s++) {
      while (slot < levels - 1 && 2 * s > centroid[slot] + centroid[slot + 1]) {
        slot++;
      }
      if (freq[s] > 0) {
        sum[slot] += s * freq[s];
        count[slot] += freq[s];
      }
      slotOf[s] = slot;
    }
    // The end points stay put; only the interior centroids move to the mean of
    // what they were given.
    if (levels > 2) {
      for (let i = 1; i < levels - 1; i++) {
        if (count[i] > 0) {
          centroid[i] = sum[i] / count[i];
        }
      }
    }
    let err = 0.0;
    for (let s = minS; s <= maxS; s++) {
      const d = s - centroid[slotOf[s]];
      err += freq[s] * d * d;
    }
    // Stop as soon as another pass would not be worth it.
    if (lastErr - err < errThreshold) {
      break;
    }
    lastErr = err;
  }

  // Collapse the two indirections into one byte-to-byte map before remapping.
  const map = new Uint8Array(256);
  for (let s = minS; s <= maxS; s++) {
    map[s] = Math.trunc(centroid[slotOf[s]] + 0.5);
  }
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = map[data[i]];
  }
  return out;
}

/**
 * How many refinement passes the level quantizer may take.
 */
const maxQuantIters = 6;

function filtersToTry(
  alpha: Uint8Array,
  width: number,
  height: number,
  filtering: number
): number[] {
  if (filtering === alphaFilterNone) {
    return [WebPFilters.filterNone];
  }
  if (filtering === alphaFilterBest) {
    return [
      WebPFilters.filterNone,
      WebPFilters.filterHorizontal,
      WebPFilters.filterVertical,
      WebPFilters.filterGradient,
    ];
  }
  const numColors = countColors(alpha);
  const estimated =
    numColors <= minColorsForFilterNone
      ? WebPFilters.filterNone
      : estimateBestFilter(alpha, width, height);
  if (estimated === WebPFilters.filterNone) {
    return [WebPFilters.filterNone];
  }
  // The estimate reads gradients and misses planes that code better unfiltered,
  // so no filtering is weighed whatever it said.
  return [WebPFilters.filterNone, estimated];
}

function applyFilter(
  alpha: Uint8Array,
  width: number,
  height: number,
  filter: number,
  scratch: Uint8Array | undefined
): Uint8Array {
  const f = WebPFilters.filters[filter];
  if (f === undefined) {
    return alpha;
  }
  f(alpha, width, height, width, scratch!);
  return scratch as Uint8Array;
}

/**
 * Builds one candidate chunk: the header byte and the coded plane.
 */
function encodeOne(
  source: Uint8Array,
  width: number,
  height: number,
  filter: number,
  compress: boolean,
  reducedLevels: boolean
): Uint8Array {
  let method = compress ? alphaLosslessCompression : alphaNoCompression;
  let data: Uint8Array = source;
  if (compress) {
    const zero = new Uint8Array(width * height);
    // The plane travels in the green channel, which is the one the lossless
    // coder predicts the other two against, so it pays nothing for them.
    // `exact` has to be on: every pixel here has an alpha of zero, and
    // flattening what sits underneath would erase the plane itself.
    data = new VP8LEncoder({ exact: true }).encodeStream(
      zero,
      source,
      zero,
      zero,
      width,
      height,
      true
    );
    if (data.length > source.length) {
      // Compression made it bigger, which happens on noisy planes.
      method = alphaNoCompression;
      data = source;
    }
  }

  const out = new Uint8Array(1 + data.length);
  out[0] =
    method | (filter << 2) | (reducedLevels ? alphaPreprocessedLevels << 4 : 0);
  out.set(data, 1);
  return out;
}

function countColors(alpha: Uint8Array): number {
  const seen = new Uint8Array(256);
  for (let i = 0; i < alpha.length; i++) {
    seen[alpha[i]] = 1;
  }
  let colors = 0;
  for (let i = 0; i < 256; i++) {
    colors += seen[i];
  }
  return colors;
}

/**
 * Guesses which filter will code smallest, without trying any of them.
 *
 * For each filter it records which of sixteen buckets of prediction error
 * occur at all, and scores a filter by the sum of the buckets it touches: a
 * filter whose errors stay in the low buckets scores low. Only every other
 * pixel is sampled, which is enough to tell the filters apart.
 */
function estimateBestFilter(
  data: Uint8Array,
  width: number,
  height: number
): number {
  const smax = 16;
  const bins = ArrayUtils.generate(4, () => new Uint8Array(smax));

  for (let j = 2; j < height - 1; j += 2) {
    const p = j * width;
    let mean = data[p];
    for (let i = 2; i < width - 1; i += 2) {
      const v = data[p + i];
      const gradient = clip8(
        data[p + i - 1] + data[p + i - width] - data[p + i - width - 1]
      );
      bins[WebPFilters.filterNone][absBranchless(v - mean) >> 4] = 1;
      bins[WebPFilters.filterHorizontal][
        absBranchless(v - data[p + i - 1]) >> 4
      ] = 1;
      bins[WebPFilters.filterVertical][
        absBranchless(v - data[p + i - width]) >> 4
      ] = 1;
      bins[WebPFilters.filterGradient][absBranchless(v - gradient) >> 4] = 1;
      mean = (3 * mean + v + 2) >> 2;
    }
  }

  let bestFilter = WebPFilters.filterNone;
  let bestScore = 0x7fffffff;
  for (let filter = 0; filter < 4; filter++) {
    let score = 0;
    for (let i = 0; i < smax; i++) {
      if (bins[filter][i] > 0) {
        score += i;
      }
    }
    if (score < bestScore) {
      bestScore = score;
      bestFilter = filter;
    }
  }
  return bestFilter;
}

function clip8(v: number): number {
  return (v & ~0xff) === 0 ? v : v < 0 ? 0 : 255;
}
