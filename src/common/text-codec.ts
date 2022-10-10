/** @format */

import { ImageError } from '../error/image-error';

export abstract class TextCodec {
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
          throw new ImageError(
            `Error encoding text "${str}": unknown character code point ${codePoint}`
          );
        }
      } else {
        throw new ImageError(`Error encoding text "${str}"`);
      }
    }
    return array;
  }
}
