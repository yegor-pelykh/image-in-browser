/** @format */

/**
 * Entropy coding for a VP8L stream: the LZ77 length and distance symbols, and
 * the canonical Huffman codes the decoder rebuilds from the stream header.
 */

import { ArrayUtils } from '../../common/array-utils.js';
import { MathUtils } from '../../common/math-utils.js';
import { VP8LBitWriter } from './vp8l-bit-writer.js';
import { WebPClSymbol } from './webp-cl-symbol.js';

// ---------------------------------------------------------------------------
// VP8L length and distance encoding helpers
// ---------------------------------------------------------------------------

/**
 * VP8L green-channel symbol for a back-reference of {@link length}.
 */
export function lengthSymbol(length: number): number {
  // Symbols 256..259.
  if (length <= 4) return 255 + length;
  const msb = log2Floor(length - 1);
  const half = ((length - 1) >> (msb - 1)) & 1;
  // Symbols 260..279.
  return 256 + 2 * msb + half;
}

/**
 * Extra bits for VP8L length prefix code for back-reference {@link length}.
 */
export function lengthExtra(length: number): {
  extraBits: number;
  extraValue: number;
} {
  if (length <= 4) return { extraBits: 0, extraValue: 0 };
  const msb = log2Floor(length - 1);
  const half = ((length - 1) >> (msb - 1)) & 1;
  const eb = msb - 1;
  const base = (2 + half) << eb;
  return { extraBits: eb, extraValue: length - 1 - base };
}

/**
 * Convert a pixel distance to the VP8L plane code (intermediate value).
 */
export function distToPlaneCode(width: number, dist: number): number {
  const yoff = Math.trunc(dist / width);
  const xoff = dist - yoff * width;
  if (xoff <= 8 && yoff < 8) {
    return planeLut[yoff * 16 + 8 - xoff] + 1;
  } else if (xoff > width - 8 && yoff < 7) {
    return planeLut[(yoff + 1) * 16 + 8 + width - xoff] + 1;
  }
  return dist + 120;
}

/**
 * VP8L prefix code (dist alphabet symbol) for a plane code {@link v}.
 */
export function prefixCode(v: number): number {
  const val = v - 1;
  if (val < 4) return val;
  const msb = log2Floor(val);
  const half = (val >> (msb - 1)) & 1;
  return 2 * msb + half;
}

/**
 * Extra bits for the VP8L distance prefix code for plane code {@link v}.
 */
export function prefixExtra(v: number): {
  extraBits: number;
  extraValue: number;
} {
  const val = v - 1;
  if (val < 4) return { extraBits: 0, extraValue: 0 };
  const msb = log2Floor(val);
  const half = (val >> (msb - 1)) & 1;
  const eb = msb - 1;
  const base = (2 + half) << eb;
  return { extraBits: eb, extraValue: val - base };
}

function log2Floor(v: number): number {
  let value = v;
  let log = 0;
  while (value > 1) {
    value >>= 1;
    log++;
  }
  return log;
}

// ---------------------------------------------------------------------------
// Huffman coding
// ---------------------------------------------------------------------------

/**
 * Build optimal Huffman code lengths for a symbol alphabet of size
 * {@link alphabetSize}, given their frequencies in {@link freq}. Returns an
 * array where entry i is the code length for symbol i (0 = unused). All
 * lengths are ≤ {@link maxBits} (15 for VP8L).
 *
 * libwebp first nudges the histogram so that the resulting lengths fall into
 * runs, which its run-length-coded length table then stores more cheaply
 * (`OptimizeHuffmanForRle`). Ported and measured at 17KB *worse* over a 587
 * image corpus: it helps the smallest images, where the table is a real share
 * of the file, and costs more than it saves everywhere else.
 */
export function buildHuffmanCodeLengths(
  freq: number[],
  alphabetSize: number,
  maxBits = 15
): number[] {
  const cl = ArrayUtils.fill(alphabetSize, 0);

  const syms: number[] = [];
  for (let k = 0; k < alphabetSize; k++) {
    if (freq[k] > 0) syms.push(k);
  }

  if (syms.length === 0) {
    cl[0] = 1;
    return cl;
  }
  if (syms.length === 1) {
    cl[syms[0]] = 1;
    return cl;
  }

  const maxNodes = 2 * syms.length;
  const nodeFreq = ArrayUtils.fill(maxNodes, 0);
  const nodeLeft = ArrayUtils.fill(maxNodes, -1);
  const nodeRight = ArrayUtils.fill(maxNodes, -1);

  for (let countMin = 1; ; countMin *= 2) {
    for (let k = 0; k < syms.length; k++) {
      nodeFreq[k] = freq[syms[k]];
      if (nodeFreq[k] < countMin) nodeFreq[k] = countMin;
    }
    let nextNode = syms.length;

    const pq = ArrayUtils.generate(syms.length, (k) => k);
    pq.sort((x, y) => nodeFreq[x] - nodeFreq[y]);

    while (pq.length > 1) {
      const x = pq.shift()!;
      const y = pq.shift()!;
      const id = nextNode++;
      nodeFreq[id] = nodeFreq[x] + nodeFreq[y];
      nodeLeft[id] = x;
      nodeRight[id] = y;
      let pos = 0;
      while (pos < pq.length && nodeFreq[pq[pos]] <= nodeFreq[id]) {
        pos++;
      }
      pq.splice(pos, 0, id);
    }

    // Assign code lengths via iterative DFS.
    const stackNodes: number[] = [pq[0]];
    const stackDepths: number[] = [0];
    let currentMaxBits = 0;

    while (stackNodes.length > 0) {
      const nodeId = stackNodes.pop()!;
      const depth = stackDepths.pop()!;
      if (nodeLeft[nodeId] === -1) {
        cl[syms[nodeId]] = depth;
        if (depth > currentMaxBits) currentMaxBits = depth;
      } else {
        stackNodes.push(nodeLeft[nodeId], nodeRight[nodeId]);
        stackDepths.push(depth + 1, depth + 1);
      }
    }

    if (currentMaxBits <= maxBits) {
      break;
    }
  }

  return cl;
}

/**
 * Write a Huffman code definition in VP8L format.
 *
 * A code with one used symbol has its length in {@link codeLengths} set to zero, in
 * either format: a decoder spends no bits on such a tree.
 */
export function writeHuffmanCode(
  bw: VP8LBitWriter,
  alphabetSize: number,
  codeLengths: number[]
): void {
  const used: number[] = [];
  for (let k = 0; k < alphabetSize; k++) {
    if (codeLengths[k] > 0) used.push(k);
  }

  if (used.length <= 2 && (used.length === 0 || used[used.length - 1] <= 255)) {
    // Simple code format, with is_simple_code = 1.
    bw.writeBits(1, 1);
    if (used.length === 0) {
      // A single symbol, coded as a one-bit zero.
      bw.writeBits(0, 1);
      bw.writeBits(0, 1);
      bw.writeBits(0, 1);
      return;
    }
    // num_symbols - 1.
    bw.writeBits(used.length - 1, 1);
    const sym0 = used[0];
    if (sym0 <= 1) {
      // first_symbol_len_code = 0, so a one-bit symbol.
      bw.writeBits(0, 1);
      // Symbol.
      bw.writeBits(sym0, 1);
    } else {
      // first_symbol_len_code = 1, so an eight-bit symbol.
      bw.writeBits(1, 1);
      bw.writeBits(sym0, 8);
    }
    if (used.length === 2) {
      bw.writeBits(used[1], 8);
    } else {
      codeLengths[sym0] = 0;
    }
    return;
  }

  // Normal code format.
  const clSymbols = buildRleSequence(codeLengths, alphabetSize);

  const clFreq = ArrayUtils.fill(19, 0);
  for (const s of clSymbols) {
    clFreq[s.symbol]++;
  }

  const clCl = buildHuffmanCodeLengths(clFreq, 19, 7);
  const clCodes = canonicalCodes(Int32Array.from(clCl), 19);

  const kCodeLengthOrder = [
    17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ];

  let numClCl = 4;
  for (let k = 18; k >= 4; k--) {
    if (clCl[kCodeLengthOrder[k]] !== 0) {
      numClCl = k + 1;
      break;
    }
  }

  // Normal code format, with is_simple_code = 0.
  bw.writeBits(0, 1);
  // num_code_lengths - 4.
  bw.writeBits(numClCl - 4, 4);

  for (let k = 0; k < numClCl; k++) {
    bw.writeBits(clCl[kCodeLengthOrder[k]], 3);
  }

  // use_length = 0.
  bw.writeBits(0, 1);

  for (const s of clSymbols) {
    bw.writeBits(clCodes[s.symbol], clCl[s.symbol]);
    if (s.extraBits > 0) {
      bw.writeBits(s.extraValue, s.extraBits);
    }
  }

  if (used.length === 1) {
    codeLengths[used[0]] = 0;
  }
}

/**
 * Build the RLE sequence for a code-lengths array using meta-symbols
 * 0-15 (literal lengths), 16 (repeat prev 3-6×),
 * 17 (repeat zero 3-10×), 18 (repeat zero 11-138×).
 */
function buildRleSequence(
  codeLengths: number[],
  alphabetSize: number
): WebPClSymbol[] {
  const result: WebPClSymbol[] = [];
  let i = 0;
  while (i < alphabetSize) {
    const cl = codeLengths[i];
    if (cl === 0) {
      let count = 0;
      while (i + count < alphabetSize && codeLengths[i + count] === 0) {
        count++;
      }
      let rem = count;
      while (rem > 0) {
        if (rem >= 11) {
          const n = MathUtils.clamp(rem, 11, 138);
          result.push(new WebPClSymbol(18, 7, n - 11));
          rem -= n;
        } else if (rem >= 3) {
          const n = MathUtils.clamp(rem, 3, 10);
          result.push(new WebPClSymbol(17, 3, n - 3));
          rem -= n;
        } else {
          result.push(new WebPClSymbol(0, 0, 0));
          rem--;
        }
      }
      i += count;
    } else {
      result.push(new WebPClSymbol(cl, 0, 0));
      i++;
      while (i < alphabetSize && codeLengths[i] === cl) {
        let count = 0;
        while (
          i + count < alphabetSize &&
          codeLengths[i + count] === cl &&
          count < 6
        ) {
          count++;
        }
        if (count >= 3) {
          result.push(new WebPClSymbol(16, 2, count - 3));
          i += count;
        } else {
          for (let k = 0; k < count; k++) {
            result.push(new WebPClSymbol(cl, 0, 0));
          }
          i += count;
        }
      }
    }
  }
  return result;
}

/**
 * Compute canonical Huffman codes from code lengths (LSB-first bit order).
 */
export function canonicalCodes(
  codeLengths: Int32Array,
  numSymbols: number
): number[] {
  const codes = ArrayUtils.fill(numSymbols, 0);
  let maxLen = 0;
  for (let k = 0; k < numSymbols; k++) {
    if (codeLengths[k] > maxLen) maxLen = codeLengths[k];
  }
  if (maxLen === 0) return codes;

  const blCount = ArrayUtils.fill(maxLen + 1, 0);
  for (let k = 0; k < numSymbols; k++) {
    if (codeLengths[k] > 0) blCount[codeLengths[k]]++;
  }
  blCount[0] = 0;

  const nextCode = ArrayUtils.fill(maxLen + 1, 0);
  let code = 0;
  for (let bits = 1; bits <= maxLen; bits++) {
    code = (code + blCount[bits - 1]) << 1;
    nextCode[bits] = code;
  }

  for (let k = 0; k < numSymbols; k++) {
    const len = codeLengths[k];
    if (len > 0) {
      codes[k] = reverseBits(nextCode[len], len);
      nextCode[len]++;
    }
  }

  return codes;
}

function reverseBits(value: number, numBits: number): number {
  let v = value;
  let result = 0;
  for (let k = 0; k < numBits; k++) {
    result = (result << 1) | (v & 1);
    v >>= 1;
  }
  return result;
}

// VP8L plane-to-code lookup table (128 entries, 8 rows × 16 cols).
// Maps 2D pixel offsets to plane codes for DistanceToPlaneCode.
const planeLut = [
  //  yoffset=0 (xoffset 8..1, then 0..-7 which are unused=255)
  96, 73, 55, 39, 23, 13, 5, 1, 255, 255, 255, 255, 255, 255, 255, 255,
  //  yoffset=1
  101, 78, 58, 42, 26, 16, 8, 2, 0, 3, 9, 17, 27, 43, 59, 79,
  //  yoffset=2
  102, 86, 62, 46, 32, 20, 10, 6, 4, 7, 11, 21, 33, 47, 63, 87,
  //  yoffset=3
  105, 90, 70, 52, 37, 28, 18, 14, 12, 15, 19, 29, 38, 53, 71, 91,
  //  yoffset=4
  110, 99, 82, 66, 48, 35, 30, 24, 22, 25, 31, 36, 49, 67, 83, 100,
  //  yoffset=5
  115, 108, 94, 76, 64, 50, 44, 40, 34, 41, 45, 51, 65, 77, 95, 109,
  //  yoffset=6
  118, 113, 103, 92, 80, 68, 60, 56, 54, 57, 61, 69, 81, 93, 104, 114,
  //  yoffset=7
  119, 116, 111, 106, 97, 88, 84, 74, 72, 75, 85, 89, 98, 107, 112, 117,
];
