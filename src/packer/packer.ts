/** @format */

/* eslint-disable no-param-reassign */
/* eslint-disable space-before-function-paren */

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

/**
 * Represents metadata for a file.
 *
 * @property {boolean} cpr - Indicates if the file is compressed.
 * @property {number} usize - The uncompressed size of the file.
 * @property {number} crc - The cyclic redundancy check value for the file.
 * @property {Uint8Array} file - The file data as a byte array.
 */
interface FileMetadata {
  cpr: boolean;
  usize: number;
  crc: number;
  file: Uint8Array;
}

/**
 * Options for the deflate compression algorithm.
 * @property {number} level - Compression level.
 */
interface DeflateOptions {
  /**
   * Compression level.
   * A higher level means more compression but slower performance.
   */
  level: number;
}

const crc = {
  /**
   * Generates a CRC table.
   * @returns {Uint32Array} The generated CRC table.
   */
  table: (function (): Uint32Array {
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
  /**
   * Updates the CRC value.
   * @param {number} c - The initial CRC value.
   * @param {Uint8Array} buf - The buffer to read from.
   * @param {number} off - The offset to start reading from.
   * @param {number} len - The length of data to read.
   * @returns {number} The updated CRC value.
   */
  update: function (
    c: number,
    buf: Uint8Array,
    off: number,
    len: number
  ): number {
    for (let i = 0; i < len; i++)
      c = crc.table[(c ^ buf[off + i]) & 0xff] ^ (c >>> 8);
    return c;
  },
  /**
   * Calculates the CRC value for a given buffer.
   * @param {Uint8Array} b - The buffer to read from.
   * @param {number} o - The offset to start reading from.
   * @param {number} l - The length of data to read.
   * @returns {number} The calculated CRC value.
   */
  crc: function (b: Uint8Array, o: number, l: number): number {
    return crc.update(0xffffffff, b, o, l) ^ 0xffffffff;
  },
};

/**
 * Reads local file header and extracts file information.
 * @param {Uint8Array} data - The data buffer.
 * @param {number} o - The offset to start reading from.
 * @param {Record<string, unknown>} out - The output object to store file information.
 * @param {number} csize - The compressed size of the file.
 * @param {number} usize - The uncompressed size of the file.
 * @param {boolean} onlyNames - Whether to only extract file names.
 * @throws {Error} If an unknown compression method is encountered.
 */
function _readLocal(
  data: Uint8Array,
  o: number,
  out: Record<string, unknown>,
  csize: number,
  usize: number,
  onlyNames: boolean
): void {
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
  if (cmpr === 0) out[name] = new Uint8Array(file.buffer.slice(o, o + csize));
  else if (cmpr === 8) {
    const buf = new Uint8Array(usize);
    inflateRaw(file, buf);
    out[name] = buf;
  } else throw new Error(`unknown compression method: ${cmpr}`);
}

/**
 * Determines if a file does not need compression.
 * @param {string} fn - The file name.
 * @returns {boolean} True if the file does not need compression, false otherwise.
 */
function _noNeed(fn: string): boolean {
  const ext = fn.split('.').pop()?.toLowerCase();
  return 'png,jpg,jpeg,zip'.indexOf(ext ?? '') !== -1;
}

/**
 * Writes the ZIP file header.
 * @param {Uint8Array} data - The data buffer.
 * @param {number} o - The offset to start writing from.
 * @param {string} p - The file path.
 * @param {FileMetadata} obj - The file information object.
 * @param {number} t - The type of header (0 for local, 1 for central directory).
 * @param {number} [roff] - The relative offset of the local header (only for central directory).
 * @returns {number} The new offset after writing the header.
 */
function _writeHeader(
  data: Uint8Array,
  o: number,
  p: string,
  obj: FileMetadata,
  t: number,
  roff?: number
): number {
  const wUi = writeUint;
  const wUs = writeUshort;
  const file = obj.file;

  wUi(data, o, t === 0 ? 0x04034b50 : 0x02014b50);
  o += 4;
  if (t === 1) o += 2;
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

  if (t === 1) {
    o += 2;
    o += 2;
    o += 6;
    wUi(data, o, roff!);
    o += 4;
  }
  const nlen = writeUTF8(data, o, p);
  o += nlen;
  if (t === 0) {
    data.set(file, o);
    o += file.length;
  }
  return o;
}

/**
 * Calculates the Adler-32 checksum for a given buffer.
 * @param {Uint8Array} data - The data buffer.
 * @param {number} o - The offset to start reading from.
 * @param {number} len - The length of data to read.
 * @returns {number} The calculated Adler-32 checksum.
 */
function _adler(data: Uint8Array, o: number, len: number): number {
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

/**
 * Parses a ZIP file buffer.
 * @param {ArrayBuffer} buf - The ZIP file buffer.
 * @param {boolean} onlyNames - Whether to only extract file names.
 * @returns {Record<string, FileMetadata>} The parsed file information.
 */
export function parse(
  buf: ArrayBuffer,
  onlyNames: boolean
): Record<string, FileMetadata> {
  const rUs = readUshort;
  const rUi = readUint;
  let o = 0;
  const out: Record<string, FileMetadata> = {};
  const data = new Uint8Array(buf);
  let eocd = data.length - 4;

  while (rUi(data, eocd) !== 0x06054b50) eocd--;

  o = eocd;
  o += 4;
  o += 4;
  const cnu = rUs(data, o);
  o += 2;
  const cnt = rUs(data, o);
  o += 2;

  const csize = rUi(data, o);
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
    const csize = rUi(data, o);
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

/**
 * Encodes a set of files into a ZIP file buffer.
 * @param {Record<string, Uint8Array>} obj - The files to encode.
 * @param {boolean} [noCmpr] - Whether to disable compression.
 * @returns {ArrayBuffer} The encoded ZIP file buffer.
 */
export function encode(
  obj: Record<string, Uint8Array>,
  noCmpr?: boolean
): ArrayBuffer {
  if (noCmpr === undefined) noCmpr = false;
  let tot = 0;
  const wUi = writeUint;
  const wUs = writeUshort;
  const zpd: Record<string, FileMetadata> = {};
  for (const p in obj) {
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

  for (const p in zpd) tot += zpd[p].file.length + 30 + 46 + 2 * sizeUTF8(p);
  tot += 22;

  const data = new Uint8Array(tot);
  let o = 0;
  const fof: number[] = [];

  for (const p in zpd) {
    const file = zpd[p];
    fof.push(o);
    o = _writeHeader(data, o, p, file, 0);
  }
  let i = 0;
  const ioff = o;
  for (const p in zpd) {
    const file = zpd[p];
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

/**
 * Compresses data using the deflate algorithm without headers.
 * @param {Uint8Array} data - The data to compress.
 * @param {DeflateOptions} [opts] - The options object.
 * @param {number} [opts.level=6] - The compression level.
 * @returns {Uint8Array} The compressed data.
 */
export function deflateRaw(
  data: Uint8Array,
  opts?: DeflateOptions
): Uint8Array {
  if (opts === undefined) opts = { level: 6 };
  const buf = new Uint8Array(50 + Math.floor(data.length * 1.1));
  const off = f_deflateRaw(data, buf, 0, opts.level);
  return new Uint8Array(buf.buffer, 0, off);
}

/**
 * Compresses data using the deflate algorithm with headers.
 * @param {Uint8Array} data - The data to compress.
 * @param {DeflateOptions} [opts] - The options object.
 * @param {number} [opts.level=6] - The compression level.
 * @returns {Uint8Array} The compressed data.
 */
export function deflate(data: Uint8Array, opts?: DeflateOptions): Uint8Array {
  if (opts === undefined) opts = { level: 6 };
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

/**
 * Decompresses data using the inflate algorithm.
 * @param {Uint8Array} file - The compressed data.
 * @param {Uint8Array} buf - The buffer to store decompressed data.
 * @returns {Uint8Array} The decompressed data.
 */
export function inflate(file: Uint8Array, buf?: Uint8Array): Uint8Array {
  const CMF = file[0];
  const FLG = file[1];
  const CM = CMF & 15;
  const CINFO = CMF >>> 4;
  return inflateRaw(
    new Uint8Array(file.buffer, file.byteOffset + 2, file.length - 6),
    buf
  );
}

/**
 * Decompresses data using the raw inflate algorithm.
 * @param {Uint8Array} file - The compressed data.
 * @param {Uint8Array} buf - The buffer to store decompressed data.
 * @returns {Uint8Array} The decompressed data.
 */
export function inflateRaw(file: Uint8Array, buf?: Uint8Array): Uint8Array {
  return f_inflate(file, buf);
}
