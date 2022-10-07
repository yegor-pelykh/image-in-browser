/** @format */

/**
 * An Error thrown when there was a problem in the image library.
 */
export class ImageError extends Error {
  toString(): string {
    return `ImageError: ${this.message}`;
  }
}
