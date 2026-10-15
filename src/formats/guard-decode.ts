/** @format */

import { LibError } from '../error/lib-error.js';

/**
 * Runs {@link decode}, converting any error other than a {@link LibError} into
 * one, so malformed data only ever throws a {@link LibError}.
 * @param {Function} decode - The function to run.
 * @returns {T} The result of {@link decode}.
 * @throws {LibError} If {@link decode} throws anything other than a LibError.
 */
export function guardDecode<T>(decode: () => T): T {
  try {
    return decode();
  } catch (e) {
    if (e instanceof LibError) {
      throw e;
    }
    throw new LibError(`Invalid image data: ${String(e)}`);
  }
}
