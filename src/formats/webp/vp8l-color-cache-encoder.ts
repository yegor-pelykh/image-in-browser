/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { colorCacheKey } from './vp8l-color-hash.js';
import * as huffman from './vp8l-huffman-encoder.js';

/**
 * Choosing a VP8L color cache size, and working out which literals it turns
 * into cache references.
 */

/**
 * Cache sizes considered by [selectColorCacheBits]. A small image cannot
 * pay back the cost of describing a large alphabet, so a mid size is offered
 * as well. libwebp never emits more than 10 bits, so neither does this.
 */
const _colorCacheCandidates = [0, 8, 10];

/**
 * Picks the color cache size that codes the token stream most compactly and
 * fills [outKeys] with the cache key of every literal that becomes a cache
 * reference, or -1 for literals that stay full pixels. Returns the chosen
 * number of cache bits, or 0 when no cache pays for itself.
 */
export function selectColorCacheBits(
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  a: Uint8Array,
  tokenIsLit: Uint8Array,
  tokenLitIdx: Int32Array,
  tokenLen: Int32Array,
  tokenDist: Int32Array,
  width: number,
  outKeys: Int32Array
): number {
  let bestBits = 0;
  let bestCost = Infinity;
  let bestKeys: Int32Array | undefined = undefined;

  for (const bits of _colorCacheCandidates) {
    const keys = new Int32Array(outKeys.length);
    if (bits > 0) {
      _walkColorCache(
        r,
        g,
        b,
        a,
        tokenIsLit,
        tokenLitIdx,
        tokenLen,
        bits,
        keys
      );
    } else {
      keys.fill(-1, 0, keys.length);
    }

    const cost = _estimateCost(
      r,
      g,
      b,
      a,
      tokenIsLit,
      tokenLitIdx,
      tokenLen,
      tokenDist,
      width,
      bits,
      keys
    );
    if (cost < bestCost) {
      bestCost = cost;
      bestBits = bits;
      bestKeys = keys;
    }
  }

  outKeys.set(bestKeys!, 0);
  return bestBits;
}

/**
 * Replays the token stream while maintaining the decoder's color cache, and
 * records for each literal the key that would reproduce it, or -1.
 */
function _walkColorCache(
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  a: Uint8Array,
  tokenIsLit: Uint8Array,
  tokenLitIdx: Int32Array,
  tokenLen: Int32Array,
  cacheBits: number,
  outKeys: Int32Array
): void {
  const cache = new Uint32Array(1 << cacheBits);
  // Color 0 is a legitimate value, so slot occupancy is tracked separately
  // rather than inferred from the stored color.
  const filled = new Uint8Array(1 << cacheBits);
  const shift = 32 - cacheBits;
  let litPtr = 0;
  let refPtr = 0;
  let pos = 0;

  const argbOf = (idx: number): number =>
    ((a[idx] << 24) | (r[idx] << 16) | (g[idx] << 8) | b[idx]) >>> 0;
  const keyOf = (argb: number): number => colorCacheKey(argb, shift);

  for (const isLit of tokenIsLit) {
    if (isLit !== 0) {
      const argb = argbOf(tokenLitIdx[litPtr]);
      const key = keyOf(argb);
      // A pixel is only inserted once it has been coded, so the lookup sees
      // exactly the pixels before it, which is what the decoder does too.
      outKeys[litPtr] = filled[key] !== 0 && cache[key] === argb ? key : -1;
      cache[key] = argb;
      filled[key] = 1;
      litPtr++;
      pos++;
    } else {
      const len = tokenLen[refPtr++];
      for (let k = 0; k < len; k++) {
        const argb = argbOf(pos + k);
        const key = keyOf(argb);
        cache[key] = argb;
        filled[key] = 1;
      }
      pos += len;
    }
  }
}

/**
 * Approximate coded size of the token stream in bits for one cache
 * configuration. Extra bits for lengths and distances are the same for every
 * configuration and are left out.
 */
function _estimateCost(
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  a: Uint8Array,
  tokenIsLit: Uint8Array,
  tokenLitIdx: Int32Array,
  tokenLen: Int32Array,
  tokenDist: Int32Array,
  width: number,
  cacheBits: number,
  keys: Int32Array
): number {
  const cacheSize = cacheBits > 0 ? 1 << cacheBits : 0;
  const greenFreq = ArrayUtils.fill(280 + cacheSize, 0);
  const redFreq = ArrayUtils.fill(256, 0);
  const blueFreq = ArrayUtils.fill(256, 0);
  const alphaFreq = ArrayUtils.fill(256, 0);
  const distFreq = ArrayUtils.fill(40, 0);

  let litPtr = 0;
  let refPtr = 0;
  for (const isLit of tokenIsLit) {
    if (isLit !== 0) {
      const key = keys[litPtr];
      const idx = tokenLitIdx[litPtr++];
      if (key >= 0) {
        greenFreq[280 + key]++;
      } else {
        greenFreq[g[idx]]++;
        redFreq[r[idx]]++;
        blueFreq[b[idx]]++;
        alphaFreq[a[idx]]++;
      }
    } else {
      greenFreq[huffman.lengthSymbol(tokenLen[refPtr])]++;
      distFreq[
        huffman.prefixCode(huffman.distToPlaneCode(width, tokenDist[refPtr]))
      ]++;
      refPtr++;
    }
  }

  let bits =
    _entropy(greenFreq) +
    _entropy(redFreq) +
    _entropy(blueFreq) +
    _entropy(alphaFreq) +
    _entropy(distFreq);

  // Every symbol a tree actually uses has to be described in the header,
  // which is what stops an oversized cache from looking free.
  for (const freq of [greenFreq, redFreq, blueFreq, alphaFreq, distFreq]) {
    for (const f of freq) {
      if (f > 0) {
        bits += 4;
      }
    }
  }

  return bits;
}

/**
 * Shannon entropy of [freq] in bits: what an ideal prefix code would cost.
 */
function _entropy(freq: number[]): number {
  let total = 0;
  for (const f of freq) {
    total += f;
  }
  if (total === 0) {
    return 0;
  }
  let bits = 0.0;
  for (const f of freq) {
    if (f > 0) {
      bits -= f * (Math.log(f / total) / Math.LN2);
    }
  }
  return bits;
}
