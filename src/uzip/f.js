/** @format */

export function deflateRaw(data, out, opos, lvl) {
  const opts = [
    /*
		 ush good_length; /* reduce lazy search above this match length 
		 ush max_lazy;    /* do not perform lazy search above this match length 
         ush nice_length; /* quit search above this match length 
	*/
    /*      good lazy nice chain */
    /* 0 */ [0, 0, 0, 0, 0] /* store only */,
    /* 1 */ [4, 4, 8, 4, 0] /* max speed, no lazy matches */,
    /* 2 */ [4, 5, 16, 8, 0],
    /* 3 */ [4, 6, 16, 16, 0],

    /* 4 */ [4, 10, 16, 32, 0] /* lazy matches */,
    /* 5 */ [8, 16, 32, 32, 0],
    /* 6 */ [8, 16, 128, 128, 0],
    /* 7 */ [8, 32, 128, 256, 0],
    /* 8 */ [32, 128, 258, 1024, 1],
    /* 9 */ [32, 258, 258, 4096, 1],
  ]; /* max compression */

  const opt = opts[lvl];

  const goodIndex = _goodIndex;
  const hash = _hash;
  const putsE = _putsE;
  let i = 0;
  let pos = opos << 3;
  let cvrd = 0;
  const dlen = data.length;

  if (lvl == 0) {
    while (i < dlen) {
      var len = Math.min(0xffff, dlen - i);
      putsE(out, pos, i + len == dlen ? 1 : 0);
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
          i == dlen - 1 || cvrd == dlen ? 1 : 0,
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
      var len = mch >>> 16;
      var dst = mch & 0xffff;
      if (mch != 0) {
        var len = mch >>> 16;
        var dst = mch & 0xffff;
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
  if (bs != i || data.length == 0) {
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
  while ((pos & 7) != 0) pos++;
  return pos >>> 3;
}
function _bestMatch(data, i, prev, c, nice, chain) {
  let ci = i & 0x7fff;
  let pi = prev[ci];
  let dif = (ci - pi + (1 << 15)) & 0x7fff;
  if (pi == ci || c != _hash(data, i - dif)) return 0;
  let tl = 0;
  let td = 0;
  const dlim = Math.min(0x7fff, i);
  while (dif <= dlim && --chain != 0 && pi != ci) {
    if (tl == 0 || data[i + tl] == data[i + tl - dif]) {
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
function _howLong(data, i, dif) {
  if (
    data[i] != data[i - dif] ||
    data[i + 1] != data[i + 1 - dif] ||
    data[i + 2] != data[i + 2 - dif]
  )
    return 0;
  const oi = i;
  const l = Math.min(data.length, i + 258);
  i += 3;
  while (i < l && data[i] == data[i - dif]) i++;
  return i - oi;
}
function _hash(data, i) {
  return (((data[i] << 8) | data[i + 1]) + (data[i + 2] << 4)) & 0xffff;
}
function _writeBlock(BFINAL, lits, li, ebits, data, o0, l0, out, pos) {
  const putsF = _putsF;
  const putsE = _putsE;
  let T;
  let ML;
  let MD;
  let MH;
  let numl;
  let numd;
  let numh;
  let lset;
  let dset;
  U.lhst[256]++;
  T = getTrees();
  ML = T[0];
  MD = T[1];
  MH = T[2];
  numl = T[3];
  numd = T[4];
  numh = T[5];
  lset = T[6];
  dset = T[7];

  const cstSize =
    (((pos + 3) & 7) == 0 ? 0 : 8 - ((pos + 3) & 7)) + 32 + (l0 << 3);
  const fxdSize =
    ebits + contSize(U.fltree, U.lhst) + contSize(U.fdtree, U.dhst);
  let dynSize = ebits + contSize(U.ltree, U.lhst) + contSize(U.dtree, U.dhst);
  dynSize +=
    14 +
    3 * numh +
    contSize(U.itree, U.ihst) +
    (U.ihst[16] * 2 + U.ihst[17] * 3 + U.ihst[18] * 7);

  for (var j = 0; j < 286; j++) U.lhst[j] = 0;
  for (var j = 0; j < 30; j++) U.dhst[j] = 0;
  for (var j = 0; j < 19; j++) U.ihst[j] = 0;
  const BTYPE =
    cstSize < fxdSize && cstSize < dynSize ? 0 : fxdSize < dynSize ? 1 : 2;
  putsF(out, pos, BFINAL);
  putsF(out, pos + 1, BTYPE);
  pos += 3;

  const opos = pos;
  if (BTYPE == 0) {
    while ((pos & 7) != 0) pos++;
    pos = _copyExact(data, o0, l0, out, pos);
  } else {
    let ltree;
    let dtree;
    if (BTYPE == 1) {
      ltree = U.fltree;
      dtree = U.fdtree;
    }
    if (BTYPE == 2) {
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

      if (len != 0) {
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
function _copyExact(data, off, len, out, pos) {
  let p8 = pos >>> 3;
  out[p8] = len;
  out[p8 + 1] = len >>> 8;
  out[p8 + 2] = 255 - out[p8];
  out[p8 + 3] = 255 - out[p8 + 1];
  p8 += 4;
  out.set(new Uint8Array(data.buffer, off, len), p8);
  return pos + ((len + 4) << 3);
}

export function getTrees() {
  const ML = _hufTree(U.lhst, U.ltree, 15);
  const MD = _hufTree(U.dhst, U.dtree, 15);
  const lset = [];
  const numl = _lenCodes(U.ltree, lset);
  const dset = [];
  const numd = _lenCodes(U.dtree, dset);
  for (var i = 0; i < lset.length; i += 2) U.ihst[lset[i]]++;
  for (var i = 0; i < dset.length; i += 2) U.ihst[dset[i]]++;
  const MH = _hufTree(U.ihst, U.itree, 7);
  let numh = 19;
  while (numh > 4 && U.itree[(U.ordr[numh - 1] << 1) + 1] == 0) numh--;
  return [ML, MD, MH, numl, numd, numh, lset, dset];
}
function getSecond(a) {
  const b = [];
  for (let i = 0; i < a.length; i += 2) b.push(a[i + 1]);
  return b;
}
function nonZero(a) {
  let b = '';
  for (let i = 0; i < a.length; i += 2) if (a[i + 1] != 0) b += `${i >> 1},`;
  return b;
}
function contSize(tree, hst) {
  let s = 0;
  for (let i = 0; i < hst.length; i++) s += hst[i] * tree[(i << 1) + 1];
  return s;
}
function _codeTiny(set, tree, out, pos) {
  for (let i = 0; i < set.length; i += 2) {
    const l = set[i];
    const rst = set[i + 1];
    pos = _writeLit(l, tree, out, pos);
    const rsl = l == 16 ? 2 : l == 17 ? 3 : 7;
    if (l > 15) {
      _putsE(out, pos, rst, rsl);
      pos += rsl;
    }
  }
  return pos;
}
function _lenCodes(tree, set) {
  let len = tree.length;
  while (len != 2 && tree[len - 1] == 0) len -= 2;
  for (let i = 0; i < len; i += 2) {
    const l = tree[i + 1];
    const nxt = i + 3 < len ? tree[i + 3] : -1;
    const nnxt = i + 5 < len ? tree[i + 5] : -1;
    const prv = i == 0 ? -1 : tree[i - 1];
    if (l == 0 && nxt == l && nnxt == l) {
      var lz = i + 5;
      while (lz + 2 < len && tree[lz + 2] == l) lz += 2;
      var zc = Math.min((lz + 1 - i) >>> 1, 138);
      if (zc < 11) set.push(17, zc - 3);
      else set.push(18, zc - 11);
      i += zc * 2 - 2;
    } else if (l == prv && nxt == l && nnxt == l) {
      var lz = i + 5;
      while (lz + 2 < len && tree[lz + 2] == l) lz += 2;
      var zc = Math.min((lz + 1 - i) >>> 1, 6);
      set.push(16, zc - 3);
      i += zc * 2 - 2;
    } else set.push(l, 0);
  }
  return len >>> 1;
}
function _hufTree(hst, tree, MAXL) {
  const list = [];
  const hl = hst.length;
  const tl = tree.length;
  let i = 0;
  for (i = 0; i < tl; i += 2) {
    tree[i] = 0;
    tree[i + 1] = 0;
  }
  for (i = 0; i < hl; i++) if (hst[i] != 0) list.push({ lit: i, f: hst[i] });
  const end = list.length;
  var l2 = list.slice(0);
  if (end == 0) return 0;
  if (end == 1) {
    const lit = list[0].lit;
    var l2 = lit == 0 ? 1 : 0;
    tree[(lit << 1) + 1] = 1;
    tree[(l2 << 1) + 1] = 1;
    return 1;
  }
  list.sort(function (a, b) {
    return a.f - b.f;
  });
  let a = list[0];
  let b = list[1];
  let i0 = 0;
  let i1 = 1;
  let i2 = 2;
  list[0] = { lit: -1, f: a.f + b.f, l: a, r: b, d: 0 };
  while (i1 != end - 1) {
    if (i0 != i1 && (i2 == end || list[i0].f < list[i2].f)) {
      a = list[i0++];
    } else {
      a = list[i2++];
    }
    if (i0 != i1 && (i2 == end || list[i0].f < list[i2].f)) {
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
  for (i = 0; i < end; i++) tree[(l2[i].lit << 1) + 1] = l2[i].d;
  return maxl;
}

export function setDepth(t, d) {
  if (t.lit != -1) {
    t.d = d;
    return d;
  }
  return Math.max(setDepth(t.l, d + 1), setDepth(t.r, d + 1));
}

export function restrictDepth(dps, MD, maxl) {
  let i = 0;
  const bCost = 1 << (maxl - MD);
  let dbt = 0;
  dps.sort(function (a, b) {
    return b.d == a.d ? a.f - b.f : b.d - a.d;
  });

  for (i = 0; i < dps.length; i++)
    if (dps[i].d > MD) {
      var od = dps[i].d;
      dps[i].d = MD;
      dbt += bCost - (1 << (maxl - od));
    } else break;
  dbt >>>= maxl - MD;
  while (dbt > 0) {
    var od = dps[i].d;
    if (od < MD) {
      dps[i].d++;
      dbt -= 1 << (MD - od - 1);
    } else i++;
  }
  for (; i >= 0; i--)
    if (dps[i].d == MD && dbt < 0) {
      dps[i].d--;
      dbt++;
    }
  if (dbt != 0) console.log('debt left');
}

function _goodIndex(v, arr) {
  let i = 0;
  if (arr[i | 16] <= v) i |= 16;
  if (arr[i | 8] <= v) i |= 8;
  if (arr[i | 4] <= v) i |= 4;
  if (arr[i | 2] <= v) i |= 2;
  if (arr[i | 1] <= v) i |= 1;
  return i;
}
function _writeLit(ch, ltree, out, pos) {
  _putsF(out, pos, ltree[ch << 1]);
  return pos + ltree[(ch << 1) + 1];
}

export function inflate(data, buf) {
  const u8 = Uint8Array;
  if (data[0] == 3 && data[1] == 0) return buf ? buf : new u8(0);
  const bitsF = _bitsF;
  const bitsE = _bitsE;
  const decodeTiny = _decodeTiny;
  const get17 = _get17;

  const noBuf = buf == null;
  if (noBuf) buf = new u8((data.length >>> 2) << 3);

  let BFINAL = 0;
  let BTYPE = 0;
  let HLIT = 0;
  let HDIST = 0;
  let HCLEN = 0;
  let ML = 0;
  let MD = 0;
  let off = 0;
  let pos = 0;
  let lmap;
  let dmap;

  while (BFINAL == 0) {
    BFINAL = bitsF(data, pos, 1);
    BTYPE = bitsF(data, pos + 1, 2);
    pos += 3;
    if (BTYPE == 0) {
      if ((pos & 7) != 0) pos += 8 - (pos & 7);
      const p8 = (pos >>> 3) + 4;
      const len = data[p8 - 4] | (data[p8 - 3] << 8);
      if (noBuf) buf = _check(buf, off + len);
      buf.set(new u8(data.buffer, data.byteOffset + p8, len), off);
      pos = (p8 + len) << 3;
      off += len;
      continue;
    }
    if (noBuf) buf = _check(buf, off + (1 << 17));
    if (BTYPE == 1) {
      lmap = U.flmap;
      dmap = U.fdmap;
      ML = (1 << 9) - 1;
      MD = (1 << 5) - 1;
    }
    if (BTYPE == 2) {
      HLIT = bitsE(data, pos, 5) + 257;
      HDIST = bitsE(data, pos + 5, 5) + 1;
      HCLEN = bitsE(data, pos + 10, 4) + 4;
      pos += 14;

      const ppos = pos;
      for (var i = 0; i < 38; i += 2) {
        U.itree[i] = 0;
        U.itree[i + 1] = 0;
      }
      let tl = 1;
      for (var i = 0; i < HCLEN; i++) {
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
      const code = lmap[get17(data, pos) & ML];
      pos += code & 15;
      const lit = code >>> 4;
      if (lit >>> 8 == 0) {
        buf[off++] = lit;
      } else if (lit == 256) {
        break;
      } else {
        let end = off + lit - 254;
        if (lit > 264) {
          const ebs = U.ldef[lit - 257];
          end = off + (ebs >>> 3) + bitsE(data, pos, ebs & 7);
          pos += ebs & 7;
        }

        const dcode = dmap[get17(data, pos) & MD];
        pos += dcode & 15;
        const dlit = dcode >>> 4;
        const dbs = U.ddef[dlit];
        const dst = (dbs >>> 4) + bitsF(data, pos, dbs & 15);
        pos += dbs & 15;

        if (noBuf) buf = _check(buf, off + (1 << 17));
        while (off < end) {
          buf[off] = buf[off++ - dst];
          buf[off] = buf[off++ - dst];
          buf[off] = buf[off++ - dst];
          buf[off] = buf[off++ - dst];
        }
        off = end;
      }
    }
  }
  return buf.length == off ? buf : buf.slice(0, off);
}
function _check(buf, len) {
  const bl = buf.length;
  if (len <= bl) return buf;
  const nbuf = new Uint8Array(Math.max(bl << 1, len));
  nbuf.set(buf, 0);
  return nbuf;
}

function _decodeTiny(lmap, LL, len, data, pos, tree) {
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
      if (lit == 16) {
        n = 3 + bitsE(data, pos, 2);
        pos += 2;
        ll = tree[i - 1];
      } else if (lit == 17) {
        n = 3 + bitsE(data, pos, 3);
        pos += 3;
      } else if (lit == 18) {
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
function _copyOut(src, off, len, tree) {
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

export function makeCodes(tree, MAX_BITS) {
  const max_code = tree.length;
  let code;
  let bits;
  let n;
  var i;
  let len;

  const bl_count = U.bl_count;
  for (var i = 0; i <= MAX_BITS; i++) bl_count[i] = 0;
  for (i = 1; i < max_code; i += 2) bl_count[tree[i]]++;

  const next_code = U.next_code;

  code = 0;
  bl_count[0] = 0;
  for (bits = 1; bits <= MAX_BITS; bits++) {
    code = (code + bl_count[bits - 1]) << 1;
    next_code[bits] = code;
  }

  for (n = 0; n < max_code; n += 2) {
    len = tree[n + 1];
    if (len != 0) {
      tree[n] = next_code[len];
      next_code[len]++;
    }
  }
}
export function codes2map(tree, MAX_BITS, map) {
  const max_code = tree.length;
  const r15 = U.rev15;
  for (let i = 0; i < max_code; i += 2)
    if (tree[i + 1] != 0) {
      const lit = i >> 1;
      const cl = tree[i + 1];
      const val = (lit << 4) | cl;
      const rest = MAX_BITS - cl;
      let i0 = tree[i] << rest;
      const i1 = i0 + (1 << rest);
      while (i0 != i1) {
        const p0 = r15[i0] >>> (15 - MAX_BITS);
        map[p0] = val;
        i0++;
      }
    }
}
export function revCodes(tree, MAX_BITS) {
  const r15 = U.rev15;
  const imb = 15 - MAX_BITS;
  for (let i = 0; i < tree.length; i += 2) {
    const i0 = tree[i] << (MAX_BITS - tree[i + 1]);
    tree[i] = r15[i0] >>> imb;
  }
}

function _putsE(dt, pos, val) {
  val <<= pos & 7;
  const o = pos >>> 3;
  dt[o] |= val;
  dt[o + 1] |= val >>> 8;
}
function _putsF(dt, pos, val) {
  val <<= pos & 7;
  const o = pos >>> 3;
  dt[o] |= val;
  dt[o + 1] |= val >>> 8;
  dt[o + 2] |= val >>> 16;
}

function _bitsE(dt, pos, length) {
  return (
    ((dt[pos >>> 3] | (dt[(pos >>> 3) + 1] << 8)) >>> (pos & 7)) &
    ((1 << length) - 1)
  );
}
function _bitsF(dt, pos, length) {
  return (
    ((dt[pos >>> 3] |
      (dt[(pos >>> 3) + 1] << 8) |
      (dt[(pos >>> 3) + 2] << 16)) >>>
      (pos & 7)) &
    ((1 << length) - 1)
  );
}

function _get17(dt, pos) {
  return (
    (dt[pos >>> 3] |
      (dt[(pos >>> 3) + 1] << 8) |
      (dt[(pos >>> 3) + 2] << 16)) >>>
    (pos & 7)
  );
}
function _get25(dt, pos) {
  return (
    (dt[pos >>> 3] |
      (dt[(pos >>> 3) + 1] << 8) |
      (dt[(pos >>> 3) + 2] << 16) |
      (dt[(pos >>> 3) + 3] << 24)) >>>
    (pos & 7)
  );
}
export const U = (function () {
  const u16 = Uint16Array;
  const u32 = Uint32Array;
  return {
    next_code: new u16(16),
    bl_count: new u16(16),
    ordr: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    of0: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
      67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999,
    ],
    exb: [
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
      5, 5, 5, 0, 0, 0, 0,
    ],
    ldef: new u16(32),
    df0: [
      1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513,
      769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535,
      65535,
    ],
    dxb: [
      0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
      11, 11, 12, 12, 13, 13, 0, 0,
    ],
    ddef: new u32(32),
    flmap: new u16(512),
    fltree: [],
    fdmap: new u16(32),
    fdtree: [],
    lmap: new u16(32768),
    ltree: [],
    ttree: [],
    dmap: new u16(32768),
    dtree: [],
    imap: new u16(512),
    itree: [],
    rev15: new u16(1 << 15),
    lhst: new u32(286),
    dhst: new u32(30),
    ihst: new u32(19),
    lits: new u32(15000),
    strt: new u16(1 << 16),
    prev: new u16(1 << 15),
  };
})();

(function () {
  const len = 1 << 15;
  for (var i = 0; i < len; i++) {
    let x = i;
    x = ((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1);
    x = ((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2);
    x = ((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4);
    x = ((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8);
    U.rev15[i] = ((x >>> 16) | (x << 16)) >>> 17;
  }

  function pushV(tgt, n, sv) {
    while (n-- != 0) tgt.push(0, sv);
  }

  for (var i = 0; i < 32; i++) {
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
