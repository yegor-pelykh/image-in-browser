/** @format */

import {
  readUshort,
  readUint,
  readUTF8,
  writeUint,
  writeUshort,
  writeUTF8,
  sizeUTF8,
} from './bin.js';
import { inflate as f_inflate, deflateRaw as f_deflateRaw } from './f.js';

const crc = {
  table: (function () {
    const tab = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c >>>= 1;
      }
      tab[n] = c;
    }
    return tab;
  })(),
  update: function (c, buf, off, len) {
    for (let i = 0; i < len; i++)
      c = crc.table[(c ^ buf[off + i]) & 0xff] ^ (c >>> 8);
    return c;
  },
  crc: function (b, o, l) {
    return crc.update(0xffffffff, b, o, l) ^ 0xffffffff;
  },
};
function _readLocal(data, o, out, csize, usize, onlyNames) {
  const rUs = readUshort;
  const rUi = readUint;
  const sign = rUi(data, o);
  o += 4;
  const ver = rUs(data, o);
  o += 2;
  const gpflg = rUs(data, o);
  o += 2;
  const cmpr = rUs(data, o);
  o += 2;
  const time = rUi(data, o);
  o += 4;
  const crc32 = rUi(data, o);
  o += 4;
  o += 8;

  const nlen = rUs(data, o);
  o += 2;
  const elen = rUs(data, o);
  o += 2;

  const name = readUTF8(data, o, nlen);
  o += nlen;
  o += elen;
  if (onlyNames) {
    out[name] = { size: usize, csize: csize };
    return;
  }
  const file = new Uint8Array(data.buffer, o);
  if (cmpr == 0) out[name] = new Uint8Array(file.buffer.slice(o, o + csize));
  else if (cmpr == 8) {
    const buf = new Uint8Array(usize);
    inflateRaw(file, buf);
    out[name] = buf;
  } else throw `unknown compression method: ${cmpr}`;
}
function _noNeed(fn) {
  const ext = fn.split('.').pop().toLowerCase();
  return 'png,jpg,jpeg,zip'.indexOf(ext) != -1;
}
function _writeHeader(data, o, p, obj, t, roff) {
  const wUi = writeUint;
  const wUs = writeUshort;
  const file = obj.file;

  wUi(data, o, t == 0 ? 0x04034b50 : 0x02014b50);
  o += 4;
  if (t == 1) o += 2;
  wUs(data, o, 20);
  o += 2;
  wUs(data, o, 0);
  o += 2;
  wUs(data, o, obj.cpr ? 8 : 0);
  o += 2;

  wUi(data, o, 0);
  o += 4;
  wUi(data, o, obj.crc);
  o += 4;
  wUi(data, o, file.length);
  o += 4;
  wUi(data, o, obj.usize);
  o += 4;

  wUs(data, o, sizeUTF8(p));
  o += 2;
  wUs(data, o, 0);
  o += 2;

  if (t == 1) {
    o += 2;
    o += 2;
    o += 6;
    wUi(data, o, roff);
    o += 4;
  }
  const nlen = writeUTF8(data, o, p);
  o += nlen;
  if (t == 0) {
    data.set(file, o);
    o += file.length;
  }
  return o;
}
function _adler(data, o, len) {
  let a = 1;
  let b = 0;
  let off = o;
  const end = o + len;
  while (off < end) {
    const eend = Math.min(off + 5552, end);
    while (off < eend) {
      a += data[off++];
      b += a;
    }
    a %= 65521;
    b %= 65521;
  }
  return (b << 16) | a;
}

export function parse(buf, onlyNames) {
  const rUs = readUshort;
  const rUi = readUint;
  var o = 0;
  const out = {};
  const data = new Uint8Array(buf);
  let eocd = data.length - 4;

  while (rUi(data, eocd) != 0x06054b50) eocd--;

  var o = eocd;
  o += 4;
  o += 4;
  const cnu = rUs(data, o);
  o += 2;
  const cnt = rUs(data, o);
  o += 2;

  var csize = rUi(data, o);
  o += 4;
  const coffs = rUi(data, o);
  o += 4;

  o = coffs;
  for (let i = 0; i < cnu; i++) {
    const sign = rUi(data, o);
    o += 4;
    o += 4;
    o += 4;
    o += 4;

    const crc32 = rUi(data, o);
    o += 4;
    var csize = rUi(data, o);
    o += 4;
    const usize = rUi(data, o);
    o += 4;

    const nl = rUs(data, o);
    const el = rUs(data, o + 2);
    const cl = rUs(data, o + 4);
    o += 6;
    o += 8;

    const roff = rUi(data, o);
    o += 4;
    o += nl + el + cl;

    _readLocal(data, roff, out, csize, usize, onlyNames);
  }
  return out;
}
export function encode(obj, noCmpr) {
  if (noCmpr == null) noCmpr = false;
  let tot = 0;
  const wUi = writeUint;
  const wUs = writeUshort;
  const zpd = {};
  for (var p in obj) {
    const cpr = !_noNeed(p) && !noCmpr;
    const buf = obj[p];
    const _crc = crc.crc(buf, 0, buf.length);
    zpd[p] = {
      cpr: cpr,
      usize: buf.length,
      crc: _crc,
      file: cpr ? deflateRaw(buf) : buf,
    };
  }

  for (var p in zpd) tot += zpd[p].file.length + 30 + 46 + 2 * sizeUTF8(p);
  tot += 22;

  const data = new Uint8Array(tot);
  let o = 0;
  const fof = [];

  for (var p in zpd) {
    var file = zpd[p];
    fof.push(o);
    o = _writeHeader(data, o, p, file, 0);
  }
  let i = 0;
  const ioff = o;
  for (var p in zpd) {
    var file = zpd[p];
    fof.push(o);
    o = _writeHeader(data, o, p, file, 1, fof[i++]);
  }
  const csize = o - ioff;

  wUi(data, o, 0x06054b50);
  o += 4;
  o += 4;
  wUs(data, o, i);
  o += 2;
  wUs(data, o, i);
  o += 2;
  wUi(data, o, csize);
  o += 4;
  wUi(data, o, ioff);
  o += 4;
  o += 2;
  return data.buffer;
}
export function deflateRaw(data, opts) {
  if (opts == null) opts = { level: 6 };
  const buf = new Uint8Array(50 + Math.floor(data.length * 1.1));
  var off = f_deflateRaw(data, buf, off, opts.level);
  return new Uint8Array(buf.buffer, 0, off);
}
export function deflate(data, opts /*, buf, off*/) {
  if (opts == null) opts = { level: 6 };
  let off = 0;
  const buf = new Uint8Array(50 + Math.floor(data.length * 1.1));
  buf[off] = 120;
  buf[off + 1] = 156;
  off += 2;
  off = f_deflateRaw(data, buf, off, opts.level);
  const crc = _adler(data, 0, data.length);
  buf[off + 0] = (crc >>> 24) & 255;
  buf[off + 1] = (crc >>> 16) & 255;
  buf[off + 2] = (crc >>> 8) & 255;
  buf[off + 3] = (crc >>> 0) & 255;
  return new Uint8Array(buf.buffer, 0, off + 4);
}
export function inflate(file, buf) {
  const CMF = file[0];
  const FLG = file[1];
  const CM = CMF & 15;
  const CINFO = CMF >>> 4;
  return inflateRaw(
    new Uint8Array(file.buffer, file.byteOffset + 2, file.length - 6),
    buf
  );
}
export function inflateRaw(file, buf) {
  return f_inflate(file, buf);
}
