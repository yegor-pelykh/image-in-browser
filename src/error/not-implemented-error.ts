/** @format */

/**
 * An error thrown when some functionality has not yet been implemented.
 */
export class NotImplementedError extends Error {
  toString(): string {
    return this.message.length > 0
      ? `NotImplementedError: ${this.message}`
      : 'NotImplementedError';
  }
}
