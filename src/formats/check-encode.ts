/** @format */

import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';

/**
 * Throws a {@link LibError} if {@link image} has no pixels to encode.
 * @param {MemoryImage} image - The image to encode.
 * @throws {LibError} If the image has no pixels.
 */
export function checkEncode(image: MemoryImage): void {
  if (image.width < 1 || image.height < 1 || image.data === undefined) {
    throw new LibError('Cannot encode an empty image');
  }
}
