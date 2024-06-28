/** @format */

/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable space-before-function-paren */

/**
 * @property {number} lit - The literal value of the node.
 * @property {number} f - The frequency of the node.
 * @property {TreeNode} [l] - The left child node.
 * @property {TreeNode} [r] - The right child node.
 * @property {number} [d] - The depth of the node.
 */
type TreeNode = {
  lit: number;
  f: number;
  l?: TreeNode;
  r?: TreeNode;
  d?: number;
};

/**
 * Compresses data using the deflate algorithm without headers.
 *
 * @param {Uint8Array} data - The input data to be compressed.
 * @param {Uint8Array} out - The output buffer to store the compressed data.
 * @param {number} opos - The starting position in the output buffer.
 * @param {number} lvl - The compression level (0-9).
 * @returns {number} - The position in the output buffer after compression.
 */
export function deflateRaw(
  data: Uint8Array,
  out: Uint8Array,
  opos: number,
  lvl: number
): number {
  const opts: number[][] = [
    [0, 0, 0, 0, 0],
    [4, 4, 8, 4, 0],
    [4, 5, 16, 8, 0],
    [4, 6, 16, 16, 0],
    [4, 10, 16, 32, 0],
    [8, 16, 32, 32, 0],
    [8, 16, 128, 128, 0],
    [8, 32, 128, 256, 0],
    [32, 128, 258, 1024, 1],
    [32, 258, 258, 4096, 1],
  ];

  const opt = opts[lvl];

  const goodIndex = _goodIndex;
  const hash = _hash;
  const putsE = _putsE;
  let i = 0;
  let pos = opos << 3;
  let cvrd = 0;
  const dlen = data.length;

  if (lvl === 0) {
    while (i < dlen) {
      const len = Math.min(0xffff, dlen - i);
      putsE(out, pos, i + len === dlen ? 1 : 0);
      pos = _copyExact(data, i, len, out, pos + 8);
      i += len;
    }
    return pos >>> 3;
  }

  const lits = U.lits;
  const strt = U.strt;
  const prev = U.prev;
  let li = 0;
  let lc = 0;
  let bs = 0;
  let ebits = 0;
  let c = 0;
  let nc = 0;
  if (dlen > 2) {
    nc = _hash(data, 0);
    strt[nc] = 0;
  }
  const nmch = 0;
  const nmci = 0;

  for (i = 0; i < dlen; i++) {
    c = nc;
    if (i + 1 < dlen - 2) {
      nc = _hash(data, i + 1);
      const ii = (i + 1) & 0x7fff;
      prev[ii] = strt[nc];
      strt[nc] = ii;
    }
    if (cvrd <= i) {
      if ((li > 14000 || lc > 26697) && dlen - i > 100) {
        if (cvrd < i) {
          lits[li] = i - cvrd;
          li += 2;
          cvrd = i;
        }
        pos = _writeBlock(
          i === dlen - 1 || cvrd === dlen ? 1 : 0,
          lits,
          li,
          ebits,
          data,
          bs,
          i - bs,
          out,
          pos
        );
        li = lc = ebits = 0;
        bs = i;
      }

      let mch = 0;
      if (i < dlen - 2)
        mch = _bestMatch(data, i, prev, c, Math.min(opt[2], dlen - i), opt[3]);
      const len = mch >>> 16;
      const dst = mch & 0xffff;
      if (mch !== 0) {
        const len = mch >>> 16;
        const dst = mch & 0xffff;
        const lgi = goodIndex(len, U.of0);
        U.lhst[257 + lgi]++;
        const dgi = goodIndex(dst, U.df0);
        U.dhst[dgi]++;
        ebits += U.exb[lgi] + U.dxb[dgi];
        lits[li] = (len << 23) | (i - cvrd);
        lits[li + 1] = (dst << 16) | (lgi << 8) | dgi;
        li += 2;
        cvrd = i + len;
      } else {
        U.lhst[data[i]]++;
      }
      lc++;
    }
  }
  if (bs !== i || data.length === 0) {
    if (cvrd < i) {
      lits[li] = i - cvrd;
      li += 2;
      cvrd = i;
    }
    pos = _writeBlock(1, lits, li, ebits, data, bs, i - bs, out, pos);
    li = 0;
    lc = 0;
    li = lc = ebits = 0;
    bs = i;
  }
  while ((pos & 7) !== 0) pos++;
  return pos >>> 3;
}

/**
 * Finds the best match for a given position in the data.
 *
 * @param {Uint8Array} data - The input data.
 * @param {number} i - The current position in the data.
 * @param {Uint16Array} prev - The previous positions of hashes.
 * @param {number} c - The current hash value.
 * @param {number} nice - The nice match length.
 * @param {number} chain - The maximum chain length.
 * @returns {number} - The best match length and distance.
 */
function _bestMatch(
  data: Uint8Array,
  i: number,
  prev: Uint16Array,
  c: number,
  nice: number,
  chain: number
): number {
  let ci = i & 0x7fff;
  let pi = prev[ci];
  let dif = (ci - pi + (1 << 15)) & 0x7fff;
  if (pi === ci || c !== _hash(data, i - dif)) return 0;
  let tl = 0;
  let td = 0;
  const dlim = Math.min(0x7fff, i);
  while (dif <= dlim && --chain !== 0 && pi !== ci) {
    if (tl === 0 || data[i + tl] === data[i + tl - dif]) {
      let cl = _howLong(data, i, dif);
      if (cl > tl) {
        tl = cl;
        td = dif;
        if (tl >= nice) break;
        if (dif + 2 < cl) cl = dif + 2;
        let maxd = 0;
        for (let j = 0; j < cl - 2; j++) {
          const ei = (i - dif + j + (1 << 15)) & 0x7fff;
          const li = prev[ei];
          const curd = (ei - li + (1 << 15)) & 0x7fff;
          if (curd > maxd) {
            maxd = curd;
            pi = ei;
          }
        }
      }
    }

    ci = pi;
    pi = prev[ci];
    dif += (ci - pi + (1 << 15)) & 0x7fff;
  }
  return (tl << 16) | td;
}

/**
 * Determines the length of the match for a given position and distance.
 *
 * @param {Uint8Array} data - The input data.
 * @param {number} i - The current position in the data.
 * @param {number} dif - The distance to the match.
 * @returns {number} - The length of the match.
 */
function _howLong(data: Uint8Array, i: number, dif: number): number {
  if (
    data[i] !== data[i - dif] ||
    data[i + 1] !== data[i + 1 - dif] ||
    data[i + 2] !== data[i + 2 - dif]
  )
    return 0;
  const oi = i;
  const l = Math.min(data.length, i + 258);
  i += 3;
  while (i < l && data[i] === data[i - dif]) i++;
  return i - oi;
}

/**
 * Computes the hash value for a given position in the data.
 *
 * @param {Uint8Array} data - The input data.
 * @param {number} i - The current position in the data.
 * @returns {number} - The hash value.
 */
function _hash(data: Uint8Array, i: number): number {
  return (((data[i] << 8) | data[i + 1]) + (data[i + 2] << 4)) & 0xffff;
}

/**
 * Writes a block of data to the output buffer.
 *
 * @param {number} BFINAL - The final block flag.
 * @param {Uint32Array} lits - The literals and lengths.
 * @param {number} li - The number of literals.
 * @param {number} ebits - The extra bits.
 * @param {Uint8Array} data - The input data.
 * @param {number} o0 - The starting position in the input data.
 * @param {number} l0 - The length of the input data.
 * @param {Uint8Array} out - The output buffer.
 * @param {number} pos - The current position in the output buffer.
 * @returns {number} - The position in the output buffer after writing the block.
 */
function _writeBlock(
  BFINAL: number,
  lits: Uint32Array,
  li: number,
  ebits: number,
  data: Uint8Array,
  o0: number,
  l0: number,
  out: Uint8Array,
  pos: number
): number {
  const putsF = _putsF;
  const putsE = _putsE;
  U.lhst[256]++;
  const T = getTrees();
  const ML = T[0] as number;
  const MD = T[1] as number;
  const MH = T[2] as number;
  const numl = T[3] as number;
  const numd = T[4] as number;
  const numh = T[5] as number;
  const lset = T[6] as number[];
  const dset = T[7] as number[];

  const cstSize =
    (((pos + 3) & 7) === 0 ? 0 : 8 - ((pos + 3) & 7)) + 32 + (l0 << 3);
  const fxdSize =
    ebits + contSize(U.fltree, U.lhst) + contSize(U.fdtree, U.dhst);
  let dynSize = ebits + contSize(U.ltree, U.lhst) + contSize(U.dtree, U.dhst);
  dynSize +=
    14 +
    3 * numh +
    contSize(U.itree, U.ihst) +
    (U.ihst[16] * 2 + U.ihst[17] * 3 + U.ihst[18] * 7);

  for (let j = 0; j < 286; j++) U.lhst[j] = 0;
  for (let j = 0; j < 30; j++) U.dhst[j] = 0;
  for (let j = 0; j < 19; j++) U.ihst[j] = 0;
  const BTYPE =
    cstSize < fxdSize && cstSize < dynSize ? 0 : fxdSize < dynSize ? 1 : 2;
  putsF(out, pos, BFINAL);
  putsF(out, pos + 1, BTYPE);
  pos += 3;

  const opos = pos;
  if (BTYPE === 0) {
    while ((pos & 7) !== 0) pos++;
    pos = _copyExact(data, o0, l0, out, pos);
  } else {
    let ltree: number[] = U.fltree;
    let dtree: number[] = U.fdtree;
    if (BTYPE === 1) {
      // do nothing
    }
    if (BTYPE === 2) {
      makeCodes(U.ltree, ML);
      revCodes(U.ltree, ML);
      makeCodes(U.dtree, MD);
      revCodes(U.dtree, MD);
      makeCodes(U.itree, MH);
      revCodes(U.itree, MH);

      ltree = U.ltree;
      dtree = U.dtree;

      putsE(out, pos, numl - 257);
      pos += 5;
      putsE(out, pos, numd - 1);
      pos += 5;
      putsE(out, pos, numh - 4);
      pos += 4;

      for (let i = 0; i < numh; i++)
        putsE(out, pos + i * 3, U.itree[(U.ordr[i] << 1) + 1]);
      pos += 3 * numh;
      pos = _codeTiny(lset, U.itree, out, pos);
      pos = _codeTiny(dset, U.itree, out, pos);
    }

    let off = o0;
    for (let si = 0; si < li; si += 2) {
      const qb = lits[si];
      const len = qb >>> 23;
      const end = off + (qb & ((1 << 23) - 1));
      while (off < end) pos = _writeLit(data[off++], ltree, out, pos);

      if (len !== 0) {
        const qc = lits[si + 1];
        const dst = qc >> 16;
        const lgi = (qc >> 8) & 255;
        const dgi = qc & 255;
        pos = _writeLit(257 + lgi, ltree, out, pos);
        putsE(out, pos, len - U.of0[lgi]);
        pos += U.exb[lgi];

        pos = _writeLit(dgi, dtree, out, pos);
        putsF(out, pos, dst - U.df0[dgi]);
        pos += U.dxb[dgi];
        off += len;
      }
    }
    pos = _writeLit(256, ltree, out, pos);
  }
  return pos;
}

/**
 * Copies exact data from the input buffer to the output buffer.
 *
 * @param {Uint8Array} data - The input data.
 * @param {number} off - The starting position in the input data.
 * @param {number} len - The length of the data to copy.
 * @param {Uint8Array} out - The output buffer.
 * @param {number} pos - The current position in the output buffer.
 * @returns {number} - The position in the output buffer after copying.
 */
function _copyExact(
  data: Uint8Array,
  off: number,
  len: number,
  out: Uint8Array,
  pos: number
): number {
  let p8 = pos >>> 3;
  out[p8] = len;
  out[p8 + 1] = len >>> 8;
  out[p8 + 2] = 255 - out[p8];
  out[p8 + 3] = 255 - out[p8 + 1];
  p8 += 4;
  out.set(new Uint8Array(data.buffer, off, len), p8);
  return pos + ((len + 4) << 3);
}

/**
 * Generates Huffman trees for the literals, distances, and code lengths.
 *
 * @returns {Array} - An array containing the generated trees and related data.
 */
export function getTrees(): (number | number[])[] {
  const ML = _hufTree(U.lhst, U.ltree, 15);
  const MD = _hufTree(U.dhst, U.dtree, 15);
  const lset: number[] = [];
  const numl = _lenCodes(U.ltree, lset);
  const dset: number[] = [];
  const numd = _lenCodes(U.dtree, dset);
  for (let i = 0; i < lset.length; i += 2) U.ihst[lset[i]]++;
  for (let i = 0; i < dset.length; i += 2) U.ihst[dset[i]]++;
  const MH = _hufTree(U.ihst, U.itree, 7);
  let numh = 19;
  while (numh > 4 && U.itree[(U.ordr[numh - 1] << 1) + 1] === 0) numh--;
  return [ML, MD, MH, numl, numd, numh, lset, dset];
}

/**
 * Computes the size of the compressed data using a given tree and histogram.
 *
 * @param {number[]} tree - The Huffman tree.
 * @param {Uint32Array} hst - The histogram.
 * @returns {number} - The size of the compressed data.
 */
function contSize(tree: number[], hst: Uint32Array): number {
  let s = 0;
  for (let i = 0; i < hst.length; i++) s += hst[i] * tree[(i << 1) + 1];
  return s;
}

/**
 * Processes a set of codes and writes them to the output.
 *
 * @param {number[]} set - The set of codes to process.
 * @param {number[]} tree - The tree structure used for processing.
 * @param {Uint8Array} out - The output buffer.
 * @param {number} pos - The current position in the output buffer.
 * @returns {number} The updated position in the output buffer.
 */
function _codeTiny(
  set: number[],
  tree: number[],
  out: Uint8Array,
  pos: number
): number {
  for (let i = 0; i < set.length; i += 2) {
    const l = set[i];
    const rst = set[i + 1];
    pos = _writeLit(l, tree, out, pos);
    const rsl = l === 16 ? 2 : l === 17 ? 3 : 7;
    if (l > 15) {
      _putsE(out, pos, rst);
      pos += rsl;
    }
  }
  return pos;
}

/**
 * Generates length codes for the given tree and set.
 *
 * @param {number[]} tree - The tree structure to process.
 * @param {number[]} set - The set to store the length codes.
 * @returns {number} The number of length codes generated.
 */
function _lenCodes(tree: number[], set: number[]): number {
  let len = tree.length;
  while (len !== 2 && tree[len - 1] === 0) len -= 2;
  for (let i = 0; i < len; i += 2) {
    const l = tree[i + 1];
    const nxt = i + 3 < len ? tree[i + 3] : -1;
    const nnxt = i + 5 < len ? tree[i + 5] : -1;
    const prv = i === 0 ? -1 : tree[i - 1];
    if (l === 0 && nxt === l && nnxt === l) {
      let lz = i + 5;
      while (lz + 2 < len && tree[lz + 2] === l) lz += 2;
      const zc = Math.min((lz + 1 - i) >>> 1, 138);
      if (zc < 11) set.push(17, zc - 3);
      else set.push(18, zc - 11);
      i += zc * 2 - 2;
    } else if (l === prv && nxt === l && nnxt === l) {
      let lz = i + 5;
      while (lz + 2 < len && tree[lz + 2] === l) lz += 2;
      const zc = Math.min((lz + 1 - i) >>> 1, 6);
      set.push(16, zc - 3);
      i += zc * 2 - 2;
    } else set.push(l, 0);
  }
  return len >>> 1;
}

/**
 * Builds a Huffman tree from the given histogram.
 *
 * @param {Uint32Array} hst - The histogram of frequencies.
 * @param {number[]} tree - The tree structure to build.
 * @param {number} MAXL - The maximum depth of the tree.
 * @returns {number} The maximum depth of the tree.
 */
function _hufTree(hst: Uint32Array, tree: number[], MAXL: number): number {
  const list: TreeNode[] = [];
  const hl = hst.length;
  const tl = tree.length;
  let i = 0;
  for (i = 0; i < tl; i += 2) {
    tree[i] = 0;
    tree[i + 1] = 0;
  }
  for (i = 0; i < hl; i++) if (hst[i] !== 0) list.push({ lit: i, f: hst[i] });
  const end = list.length;
  let l2 = list.slice(0);
  if (end === 0) return 0;
  if (end === 1) {
    const lit = list[0].lit;
    l2 = lit === 0 ? [{ lit: 1, f: 0 }] : [{ lit: 0, f: 0 }];
    tree[(lit << 1) + 1] = 1;
    tree[(l2[0].lit << 1) + 1] = 1;
    return 1;
  }
  list.sort((a, b) => a.f - b.f);
  let a = list[0];
  let b = list[1];
  let i0 = 0;
  let i1 = 1;
  let i2 = 2;
  list[0] = { lit: -1, f: a.f + b.f, l: a, r: b, d: 0 };
  while (i1 !== end - 1) {
    if (i0 !== i1 && (i2 === end || list[i0].f < list[i2].f)) {
      a = list[i0++];
    } else {
      a = list[i2++];
    }
    if (i0 !== i1 && (i2 === end || list[i0].f < list[i2].f)) {
      b = list[i0++];
    } else {
      b = list[i2++];
    }
    list[i1++] = { lit: -1, f: a.f + b.f, l: a, r: b };
  }
  let maxl = setDepth(list[i1 - 1], 0);
  if (maxl > MAXL) {
    restrictDepth(l2, MAXL, maxl);
    maxl = MAXL;
  }
  for (i = 0; i < end; i++) tree[(l2[i].lit << 1) + 1] = l2[i].d!;
  return maxl;
}

/**
 * Sets the depth of the tree nodes.
 *
 * @param {TreeNode} t - The tree node.
 * @param {number} d - The current depth.
 * @returns {number} The maximum depth of the tree.
 */
export function setDepth(t: TreeNode, d: number): number {
  if (t.lit !== -1) {
    t.d = d;
    return d;
  }
  return Math.max(setDepth(t.l!, d + 1), setDepth(t.r!, d + 1));
}

/**
 * Restricts the depth of the tree nodes.
 *
 * @param {Array<Object>} dps - The array of tree nodes.
 * @param {number} MD - The maximum depth.
 * @param {number} maxl - The current maximum depth.
 */
export function restrictDepth(
  dps: { lit: number; f: number; l?: unknown; r?: unknown; d?: number }[],
  MD: number,
  maxl: number
): void {
  let i = 0;
  const bCost = 1 << (maxl - MD);
  let dbt = 0;
  dps.sort((a, b) => (b.d! === a.d! ? a.f - b.f : b.d! - a.d!));

  for (i = 0; i < dps.length; i++)
    if (dps[i].d! > MD) {
      const od = dps[i].d!;
      dps[i].d = MD;
      dbt += bCost - (1 << (maxl - od));
    } else break;
  dbt >>>= maxl - MD;
  while (dbt > 0) {
    const od = dps[i].d!;
    if (od < MD) {
      dps[i].d!++;
      dbt -= 1 << (MD - od - 1);
    } else i++;
  }
  for (; i >= 0; i--)
    if (dps[i].d === MD && dbt < 0) {
      dps[i].d!--;
      dbt++;
    }
  if (dbt !== 0) console.log('debt left');
}

/**
 * Finds a good index in the array for the given value.
 *
 * @param {number} v - The value to find the index for.
 * @param {number[]} arr - The array to search in.
 * @returns {number} The found index.
 */
function _goodIndex(v: number, arr: number[]): number {
  let i = 0;
  if (arr[i | 16] <= v) i |= 16;
  if (arr[i | 8] <= v) i |= 8;
  if (arr[i | 4] <= v) i |= 4;
  if (arr[i | 2] <= v) i |= 2;
  if (arr[i | 1] <= v) i |= 1;
  return i;
}

/**
 * Writes a literal to the output buffer.
 *
 * @param {number} ch - The character to write.
 * @param {Array<number>} ltree - The literal tree.
 * @param {Uint8Array} out - The output buffer.
 * @param {number} pos - The current position in the output buffer.
 * @returns {number} The updated position in the output buffer.
 */
function _writeLit(
  ch: number,
  ltree: Array<number>,
  out: Uint8Array,
  pos: number
): number {
  _putsF(out, pos, ltree[ch << 1]);
  return pos + ltree[(ch << 1) + 1];
}

/**
 * Inflates the given data using the provided buffer.
 *
 * @param {Uint8Array} data - The data to inflate.
 * @param {Uint8Array} [buf] - The buffer to use for inflation.
 * @returns {Uint8Array} The inflated data.
 */
export function inflate(data: Uint8Array, buf?: Uint8Array): Uint8Array {
  const U8 = Uint8Array;
  if (data[0] === 3 && data[1] === 0) return buf ? buf : new U8(0);
  const bitsF = _bitsF;
  const bitsE = _bitsE;
  const decodeTiny = _decodeTiny;
  const get17 = _get17;

  const noBuf = buf === undefined;
  if (noBuf) buf = new U8((data.length >>> 2) << 3);

  let BFINAL = 0;
  let BTYPE = 0;
  let HLIT = 0;
  let HDIST = 0;
  let HCLEN = 0;
  let ML = 0;
  let MD = 0;
  let off = 0;
  let pos = 0;
  let lmap: Uint16Array | undefined = undefined;
  let dmap: Uint16Array | undefined = undefined;

  while (BFINAL === 0) {
    BFINAL = bitsF(data, pos, 1);
    BTYPE = bitsF(data, pos + 1, 2);
    pos += 3;
    if (BTYPE === 0) {
      if ((pos & 7) !== 0) pos += 8 - (pos & 7);
      const p8 = (pos >>> 3) + 4;
      const len = data[p8 - 4] | (data[p8 - 3] << 8);
      if (noBuf) buf = _check(buf!, off + len);
      buf!.set(new U8(data.buffer, data.byteOffset + p8, len), off);
      pos = (p8 + len) << 3;
      off += len;
      continue;
    }
    if (noBuf) buf = _check(buf!, off + (1 << 17));
    if (BTYPE === 1) {
      lmap = U.flmap;
      dmap = U.fdmap;
      ML = (1 << 9) - 1;
      MD = (1 << 5) - 1;
    }
    if (BTYPE === 2) {
      HLIT = bitsE(data, pos, 5) + 257;
      HDIST = bitsE(data, pos + 5, 5) + 1;
      HCLEN = bitsE(data, pos + 10, 4) + 4;
      pos += 14;

      const ppos = pos;
      for (let i = 0; i < 38; i += 2) {
        U.itree[i] = 0;
        U.itree[i + 1] = 0;
      }
      let tl = 1;
      for (let i = 0; i < HCLEN; i++) {
        const l = bitsE(data, pos + i * 3, 3);
        U.itree[(U.ordr[i] << 1) + 1] = l;
        if (l > tl) tl = l;
      }
      pos += 3 * HCLEN;
      makeCodes(U.itree, tl);
      codes2map(U.itree, tl, U.imap);

      lmap = U.lmap;
      dmap = U.dmap;

      pos = decodeTiny(U.imap, (1 << tl) - 1, HLIT + HDIST, data, pos, U.ttree);
      const mx0 = _copyOut(U.ttree, 0, HLIT, U.ltree);
      ML = (1 << mx0) - 1;
      const mx1 = _copyOut(U.ttree, HLIT, HDIST, U.dtree);
      MD = (1 << mx1) - 1;

      makeCodes(U.ltree, mx0);
      codes2map(U.ltree, mx0, lmap);

      makeCodes(U.dtree, mx1);
      codes2map(U.dtree, mx1, dmap);
    }
    while (true) {
      const code = lmap![get17(data, pos) & ML];
      pos += code & 15;
      const lit = code >>> 4;
      if (lit >>> 8 === 0) {
        buf![off++] = lit;
      } else if (lit === 256) {
        break;
      } else {
        let end = off + lit - 254;
        if (lit > 264) {
          const ebs = U.ldef[lit - 257];
          end = off + (ebs >>> 3) + bitsE(data, pos, ebs & 7);
          pos += ebs & 7;
        }

        const dcode = dmap![get17(data, pos) & MD];
        pos += dcode & 15;
        const dlit = dcode >>> 4;
        const dbs = U.ddef[dlit];
        const dst = (dbs >>> 4) + bitsF(data, pos, dbs & 15);
        pos += dbs & 15;

        if (noBuf) buf = _check(buf!, off + (1 << 17));
        while (off < end) {
          buf![off] = buf![off++ - dst];
          buf![off] = buf![off++ - dst];
          buf![off] = buf![off++ - dst];
          buf![off] = buf![off++ - dst];
        }
        off = end;
      }
    }
  }
  return buf!.length === off ? buf! : buf!.slice(0, off);
}

/**
 * Checks the buffer size and resizes if necessary.
 *
 * @param {Uint8Array} buf - The buffer to check.
 * @param {number} len - The required length.
 * @returns {Uint8Array} The resized buffer if necessary.
 */
function _check(buf: Uint8Array, len: number): Uint8Array {
  const bl = buf.length;
  if (len <= bl) return buf;
  const nbuf = new Uint8Array(Math.max(bl << 1, len));
  nbuf.set(buf, 0);
  return nbuf;
}

/**
 * Decodes a tiny Huffman tree.
 *
 * @param {Array<number>} lmap - The literal map.
 * @param {number} LL - The literal length.
 * @param {number} len - The length of the data.
 * @param {Uint8Array} data - The data to decode.
 * @param {number} pos - The current position in the data.
 * @param {Array<number>} tree - The tree to store the decoded values.
 * @returns {number} The updated position in the data.
 */
function _decodeTiny(
  lmap: Uint16Array,
  LL: number,
  len: number,
  data: Uint8Array,
  pos: number,
  tree: number[]
): number {
  const bitsE = _bitsE;
  const get17 = _get17;
  let i = 0;
  while (i < len) {
    const code = lmap[get17(data, pos) & LL];
    pos += code & 15;
    const lit = code >>> 4;
    if (lit <= 15) {
      tree[i] = lit;
      i++;
    } else {
      let ll = 0;
      let n = 0;
      if (lit === 16) {
        n = 3 + bitsE(data, pos, 2);
        pos += 2;
        ll = tree[i - 1];
      } else if (lit === 17) {
        n = 3 + bitsE(data, pos, 3);
        pos += 3;
      } else if (lit === 18) {
        n = 11 + bitsE(data, pos, 7);
        pos += 7;
      }
      const ni = i + n;
      while (i < ni) {
        tree[i] = ll;
        i++;
      }
    }
  }
  return pos;
}

/**
 * Copies values from the source to the tree.
 *
 * @param {Array<number>} src - The source array.
 * @param {number} off - The offset in the source array.
 * @param {number} len - The length of the data to copy.
 * @param {Array<number>} tree - The tree to copy the values to.
 * @returns {number} The maximum value in the copied data.
 */
function _copyOut(
  src: number[],
  off: number,
  len: number,
  tree: number[]
): number {
  let mx = 0;
  let i = 0;
  const tl = tree.length >>> 1;
  while (i < len) {
    const v = src[i + off];
    tree[i << 1] = 0;
    tree[(i << 1) + 1] = v;
    if (v > mx) mx = v;
    i++;
  }
  while (i < tl) {
    tree[i << 1] = 0;
    tree[(i << 1) + 1] = 0;
    i++;
  }
  return mx;
}

/**
 * Generates Huffman codes for the given tree.
 *
 * @param {Array<number>} tree - The tree structure.
 * @param {number} MAX_BITS - The maximum number of bits.
 */
export function makeCodes(tree: number[], MAX_BITS: number): void {
  const max_code = tree.length;

  const bl_count = U.bl_count;
  for (let i = 0; i <= MAX_BITS; i++) bl_count[i] = 0;
  for (let i = 1; i < max_code; i += 2) bl_count[tree[i]]++;

  const next_code = U.next_code;

  let code = 0;
  bl_count[0] = 0;
  for (let bits = 1; bits <= MAX_BITS; bits++) {
    code = (code + bl_count[bits - 1]) << 1;
    next_code[bits] = code;
  }

  for (let n = 0; n < max_code; n += 2) {
    const len = tree[n + 1];
    if (len !== 0) {
      tree[n] = next_code[len];
      next_code[len]++;
    }
  }
}

/**
 * Converts codes to a map.
 *
 * @param {Array<number>} tree - The tree array containing codes.
 * @param {number} MAX_BITS - The maximum number of bits.
 * @param {Object} map - The map to store the converted codes.
 */
export function codes2map(
  tree: number[],
  MAX_BITS: number,
  map: Record<number, number>
): void {
  const max_code = tree.length;
  const r15 = U.rev15;
  for (let i = 0; i < max_code; i += 2)
    if (tree[i + 1] !== 0) {
      const lit = i >> 1;
      const cl = tree[i + 1];
      const val = (lit << 4) | cl;
      const rest = MAX_BITS - cl;
      let i0 = tree[i] << rest;
      const i1 = i0 + (1 << rest);
      while (i0 !== i1) {
        const p0 = r15[i0] >>> (15 - MAX_BITS);
        map[p0] = val;
        i0++;
      }
    }
}

/**
 * Reverses codes in the tree.
 *
 * @param {Array<number>} tree - The tree array containing codes.
 * @param {number} MAX_BITS - The maximum number of bits.
 */
export function revCodes(tree: number[], MAX_BITS: number): void {
  const r15 = U.rev15;
  const imb = 15 - MAX_BITS;
  for (let i = 0; i < tree.length; i += 2) {
    const i0 = tree[i] << (MAX_BITS - tree[i + 1]);
    tree[i] = r15[i0] >>> imb;
  }
}

/**
 * Puts a value into the data array at the specified position.
 *
 * @param {Uint8Array} dt - The data array.
 * @param {number} pos - The position to put the value.
 * @param {number} val - The value to put.
 */
function _putsE(dt: Uint8Array, pos: number, val: number): void {
  val <<= pos & 7;
  const o = pos >>> 3;
  dt[o] |= val;
  dt[o + 1] |= val >>> 8;
}

/**
 * Puts a value into the data array at the specified position.
 *
 * @param {Uint8Array} dt - The data array.
 * @param {number} pos - The position to put the value.
 * @param {number} val - The value to put.
 */
function _putsF(dt: Uint8Array, pos: number, val: number): void {
  val <<= pos & 7;
  const o = pos >>> 3;
  dt[o] |= val;
  dt[o + 1] |= val >>> 8;
  dt[o + 2] |= val >>> 16;
}

/**
 * Gets bits from the data array at the specified position.
 *
 * @param {Uint8Array} dt - The data array.
 * @param {number} pos - The position to get the bits from.
 * @param {number} length - The length of bits to get.
 * @returns {number} The bits retrieved.
 */
function _bitsE(dt: Uint8Array, pos: number, length: number): number {
  return (
    ((dt[pos >>> 3] | (dt[(pos >>> 3) + 1] << 8)) >>> (pos & 7)) &
    ((1 << length) - 1)
  );
}

/**
 * Gets bits from the data array at the specified position.
 *
 * @param {Uint8Array} dt - The data array.
 * @param {number} pos - The position to get the bits from.
 * @param {number} length - The length of bits to get.
 * @returns {number} The bits retrieved.
 */
function _bitsF(dt: Uint8Array, pos: number, length: number): number {
  return (
    ((dt[pos >>> 3] |
      (dt[(pos >>> 3) + 1] << 8) |
      (dt[(pos >>> 3) + 2] << 16)) >>>
      (pos & 7)) &
    ((1 << length) - 1)
  );
}

/**
 * Gets 17 bits from the data array at the specified position.
 *
 * @param {Uint8Array} dt - The data array.
 * @param {number} pos - The position to get the bits from.
 * @returns {number} The bits retrieved.
 */
function _get17(dt: Uint8Array, pos: number): number {
  return (
    (dt[pos >>> 3] |
      (dt[(pos >>> 3) + 1] << 8) |
      (dt[(pos >>> 3) + 2] << 16)) >>>
    (pos & 7)
  );
}

/**
 * Gets 25 bits from the data array at the specified position.
 *
 * @param {Uint8Array} dt - The data array.
 * @param {number} pos - The position to get the bits from.
 * @returns {number} The bits retrieved.
 */
function _get25(dt: Uint8Array, pos: number): number {
  return (
    (dt[pos >>> 3] |
      (dt[(pos >>> 3) + 1] << 8) |
      (dt[(pos >>> 3) + 2] << 16) |
      (dt[(pos >>> 3) + 3] << 24)) >>>
    (pos & 7)
  );
}

export const U = (function () {
  const U16 = Uint16Array;
  const U32 = Uint32Array;
  return {
    next_code: new U16(16),
    bl_count: new U16(16),
    ordr: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    of0: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
      67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999,
    ],
    exb: [
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
      5, 5, 5, 0, 0, 0, 0,
    ],
    ldef: new U16(32),
    df0: [
      1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513,
      769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535,
      65535,
    ],
    dxb: [
      0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
      11, 11, 12, 12, 13, 13, 0, 0,
    ],
    ddef: new U32(32),
    flmap: new U16(512),
    fltree: [] as number[],
    fdmap: new U16(32),
    fdtree: [] as number[],
    lmap: new U16(32768),
    ltree: [] as number[],
    ttree: [] as number[],
    dmap: new U16(32768),
    dtree: [] as number[],
    imap: new U16(512),
    itree: [] as number[],
    rev15: new U16(1 << 15),
    lhst: new U32(286),
    dhst: new U32(30),
    ihst: new U32(19),
    lits: new U32(15000),
    strt: new U16(1 << 16),
    prev: new U16(1 << 15),
  };
})();

(function () {
  const len = 1 << 15;
  for (let i = 0; i < len; i++) {
    let x = i;
    x = ((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1);
    x = ((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2);
    x = ((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4);
    x = ((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8);
    U.rev15[i] = ((x >>> 16) | (x << 16)) >>> 17;
  }

  /**
   * Pushes a value multiple times into a target array.
   * @param {Array<number>} tgt - The target array to push values into.
   * @param {number} n - The number of times to push the value.
   * @param {number} sv - The value to be pushed.
   */
  function pushV(tgt: number[], n: number, sv: number): void {
    while (n-- !== 0) tgt.push(0, sv);
  }

  for (let i = 0; i < 32; i++) {
    U.ldef[i] = (U.of0[i] << 3) | U.exb[i];
    U.ddef[i] = (U.df0[i] << 4) | U.dxb[i];
  }

  pushV(U.fltree, 144, 8);
  pushV(U.fltree, 255 - 143, 9);
  pushV(U.fltree, 279 - 255, 7);
  pushV(U.fltree, 287 - 279, 8);
  makeCodes(U.fltree, 9);
  codes2map(U.fltree, 9, U.flmap);
  revCodes(U.fltree, 9);

  pushV(U.fdtree, 32, 5);
  makeCodes(U.fdtree, 5);
  codes2map(U.fdtree, 5, U.fdmap);
  revCodes(U.fdtree, 5);

  pushV(U.itree, 19, 0);
  pushV(U.ltree, 286, 0);
  pushV(U.dtree, 30, 0);
  pushV(U.ttree, 320, 0);
})();
