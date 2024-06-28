/** @format */

import { LibError } from '../error/lib-error.js';

/**
 * Abstract class providing string utility methods.
 */
export abstract class StringUtils {
  /**
   * UTF-8 text decoder.
   */
  public static readonly utf8Decoder = new TextDecoder('utf8');

  /**
   * Latin-1 text decoder.
   */
  public static readonly latin1Decoder = new TextDecoder('latin1');

  /**
   * Converts a string to an array of code points.
   * @param {string} str - The string to convert.
   * @returns {Uint8Array} A Uint8Array containing the code points.
   * @throws {LibError} If the string contains an unknown character code point.
   */
  public static getCodePoints(str: string): Uint8Array {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const codePoint = str.codePointAt(i);
      if (codePoint !== undefined) {
        if (0 <= codePoint && codePoint < 256) {
          array[i] = codePoint;
        } else {
          throw new LibError(
            `Error encoding text "${str}": unknown character code point ${codePoint}`
          );
        }
      } else {
        throw new LibError(`Error encoding text "${str}"`);
      }
    }
    return array;
  }
}
