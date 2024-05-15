/** @format */

import { LibError } from '../error/lib-error.js';

export abstract class StringUtils {
  public static readonly utf8Decoder = new TextDecoder('utf8');
  public static readonly latin1Decoder = new TextDecoder('latin1');

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
