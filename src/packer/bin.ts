/** @format */

/**
 * Reads an unsigned short (2 bytes) from a buffer at a specified position.
 * @param {Uint8Array} buff - The buffer to read from.
 * @param {number} p - The position in the buffer to start reading.
 * @returns {number} The unsigned short value read from the buffer.
 */
export function readUshort(buff: Uint8Array, p: number): number {
  return buff[p] | (buff[p + 1] << 8);
}

/**
 * Writes an unsigned short (2 bytes) to a buffer at a specified position.
 * @param {Uint8Array} buff - The buffer to write to.
 * @param {number} p - The position in the buffer to start writing.
 * @param {number} n - The unsigned short value to write.
 */
export function writeUshort(buff: Uint8Array, p: number, n: number): void {
  buff[p] = n & 255;
  buff[p + 1] = (n >> 8) & 255;
}

/**
 * Reads an unsigned integer (4 bytes) from a buffer at a specified position.
 * @param {Uint8Array} buff - The buffer to read from.
 * @param {number} p - The position in the buffer to start reading.
 * @returns {number} The unsigned integer value read from the buffer.
 */
export function readUint(buff: Uint8Array, p: number): number {
  return (
    buff[p + 3] * (256 * 256 * 256) +
    ((buff[p + 2] << 16) | (buff[p + 1] << 8) | buff[p])
  );
}

/**
 * Writes an unsigned integer (4 bytes) to a buffer at a specified position.
 * @param {Uint8Array} buff - The buffer to write to.
 * @param {number} p - The position in the buffer to start writing.
 * @param {number} n - The unsigned integer value to write.
 */
export function writeUint(buff: Uint8Array, p: number, n: number): void {
  buff[p] = n & 255;
  buff[p + 1] = (n >> 8) & 255;
  buff[p + 2] = (n >> 16) & 255;
  buff[p + 3] = (n >> 24) & 255;
}

/**
 * Reads an ASCII string from a buffer at a specified position and length.
 * @param {Uint8Array} buff - The buffer to read from.
 * @param {number} p - The position in the buffer to start reading.
 * @param {number} l - The length of the string to read.
 * @returns {string} The ASCII string read from the buffer.
 */
export function readASCII(buff: Uint8Array, p: number, l: number): string {
  let s = '';
  for (let i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
  return s;
}

/**
 * Writes an ASCII string to a buffer at a specified position.
 * @param {Uint8Array} data - The buffer to write to.
 * @param {number} p - The position in the buffer to start writing.
 * @param {string} s - The ASCII string to write.
 */
export function writeASCII(data: Uint8Array, p: number, s: string): void {
  for (let i = 0; i < s.length; i++) data[p + i] = s.charCodeAt(i);
}

/**
 * Pads a string with a leading zero if its length is less than 2.
 * @param {string} n - The string to pad.
 * @returns {string} The padded string.
 */
export function pad(n: string): string {
  return n.length < 2 ? `0${n}` : n;
}

/**
 * Reads a UTF-8 string from a buffer at a specified position and length.
 * @param {Uint8Array} buff - The buffer to read from.
 * @param {number} p - The position in the buffer to start reading.
 * @param {number} l - The length of the string to read.
 * @returns {string} The UTF-8 string read from the buffer.
 * @throws {Error} If the string cannot be decoded as UTF-8.
 */
export function readUTF8(buff: Uint8Array, p: number, l: number): string {
  let s = '';
  let ns: string | undefined = undefined;
  for (let i = 0; i < l; i++) s += `%${pad(buff[p + i].toString(16))}`;
  try {
    ns = decodeURIComponent(s);
  } catch (e) {
    return readASCII(buff, p, l);
  }
  return ns;
}

/**
 * Writes a UTF-8 string to a buffer at a specified position.
 * @param {Uint8Array} buff - The buffer to write to.
 * @param {number} p - The position in the buffer to start writing.
 * @param {string} str - The UTF-8 string to write.
 * @returns {number} The number of bytes written.
 * @throws {Error} If the string contains an invalid UTF-8 code point.
 */
export function writeUTF8(buff: Uint8Array, p: number, str: string): number {
  const strl = str.length;
  let i = 0;
  for (let ci = 0; ci < strl; ci++) {
    const code = str.charCodeAt(ci);
    if ((code & (0xffffffff - (1 << 7) + 1)) === 0) {
      buff[p + i] = code;
      i++;
    } else if ((code & (0xffffffff - (1 << 11) + 1)) === 0) {
      buff[p + i] = 192 | (code >> 6);
      buff[p + i + 1] = 128 | ((code >> 0) & 63);
      i += 2;
    } else if ((code & (0xffffffff - (1 << 16) + 1)) === 0) {
      buff[p + i] = 224 | (code >> 12);
      buff[p + i + 1] = 128 | ((code >> 6) & 63);
      buff[p + i + 2] = 128 | ((code >> 0) & 63);
      i += 3;
    } else if ((code & (0xffffffff - (1 << 21) + 1)) === 0) {
      buff[p + i] = 240 | (code >> 18);
      buff[p + i + 1] = 128 | ((code >> 12) & 63);
      buff[p + i + 2] = 128 | ((code >> 6) & 63);
      buff[p + i + 3] = 128 | ((code >> 0) & 63);
      i += 4;
    } else {
      throw new Error('Invalid UTF-8 code point');
    }
  }
  return i;
}

/**
 * Calculates the size in bytes of a UTF-8 string.
 * @param {string} str - The UTF-8 string to measure.
 * @returns {number} The size in bytes of the UTF-8 string.
 * @throws {Error} If the string contains an invalid UTF-8 character.
 */
export function sizeUTF8(str: string): number {
  const strl = str.length;
  let i = 0;
  for (let ci = 0; ci < strl; ci++) {
    const code = str.charCodeAt(ci);
    if ((code & (0xffffffff - (1 << 7) + 1)) === 0) {
      i++;
    } else if ((code & (0xffffffff - (1 << 11) + 1)) === 0) {
      i += 2;
    } else if ((code & (0xffffffff - (1 << 16) + 1)) === 0) {
      i += 3;
    } else if ((code & (0xffffffff - (1 << 21) + 1)) === 0) {
      i += 4;
    } else throw new Error('Invalid UTF-8 character');
  }
  return i;
}
