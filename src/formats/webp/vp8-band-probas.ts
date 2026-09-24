/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { numCtx, numProbas } from './vp8-tables.js';

/**
 * Represents all the probabilities associated with one band.
 */
export class VP8BandProbas {
  /**
   * An array of Uint8Array representing the probabilities.
   */
  public probas: Uint8Array[];

  /**
   * Constructs a new instance of VP8BandProbas.
   */
  constructor() {
    this.probas = ArrayUtils.generate(numCtx, () => new Uint8Array(numProbas));
  }
}
