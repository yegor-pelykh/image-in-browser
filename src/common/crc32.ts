/** @format */

export interface Crc32Options {
  buffer: Uint8Array;
  baseCrc?: number;
  position?: number;
  length?: number;
}

export abstract class Crc32 {
  private static readonly _crcTable = new Uint32Array(Crc32.makeTable());

  private static makeTable() {
    const table: number[] = [];
    let c = 0;
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  }

  public static getChecksum(opt: Crc32Options) {
    const t = Crc32._crcTable;
    const len = opt.length ?? opt.buffer.length;
    const pos = opt.position ?? 0;
    const end = pos + len;

    let result = (opt.baseCrc ?? 0) ^ -1;
    for (let i = pos; i < end; i++) {
      result = (result >>> 8) ^ t[(result ^ opt.buffer[i]) & 0xff];
    }

    return (result ^ -1) >>> 0;
  }
}
