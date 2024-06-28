/** @format */

/**
 * An Error thrown when there was a problem in the library.
 */
export class LibError extends Error {
  /**
   * Converts the error to a string representation.
   * @returns {string} The string representation of the error.
   */
  public toString(): string {
    return `${this.constructor.name} (${this.message})`;
  }
}
