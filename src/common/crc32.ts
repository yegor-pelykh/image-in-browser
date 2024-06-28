/** @format */

/**
 * Interface representing options for CRC32 calculation.
 */
export interface Crc32Options {
  /** The buffer containing the data to calculate the CRC32 checksum for. */
  buffer: Uint8Array;
  /** The base CRC value to start with (optional). */
  baseCrc?: number;
  /** The position in the buffer to start calculating from (optional). */
  position?: number;
  /** The length of the data to calculate the checksum for (optional). */
  length?: number;
}

/**
 * Abstract class providing CRC32 checksum calculation methods.
 */
export abstract class Crc32 {
  /**
   * The CRC32 lookup table.
   * @private
   */
  private static readonly _crcTable = new Uint32Array(Crc32.makeTable());

  /**
   * Creates the CRC32 lookup table.
   * @returns {number[]} The CRC32 lookup table.
   * @private
   */
  private static makeTable(): number[] {
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

  /**
   * Calculates the CRC32 checksum for the given options.
   * @param {Crc32Options} opt - The options for CRC32 calculation.
   * @param {Uint8Array} opt.buffer - The buffer containing the data to calculate the CRC32 checksum for.
   * @param {number} [opt.baseCrc] - The base CRC value to start with (optional).
   * @param {number} [opt.position] - The position in the buffer to start calculating from (optional).
   * @param {number} [opt.length] - The length of the data to calculate the checksum for (optional).
   * @returns {number} The calculated CRC32 checksum.
   */
  public static getChecksum(opt: Crc32Options): number {
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
