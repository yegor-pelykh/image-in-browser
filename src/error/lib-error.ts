/** @format */

/**
 * An Error thrown when there was a problem in the library.
 */
export class LibError extends Error {
  public toString(): string {
    return `${this.constructor.name} (${this.message})`;
  }
}
