/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { VP8 } from './vp8.js';

/**
 * All the probas associated to one band
 */
export class VP8BandProbas {
  public probas: Uint8Array[];

  constructor() {
    this.probas = ArrayUtils.generate(
      VP8.numCtx,
      () => new Uint8Array(VP8.numProbas)
    );
  }
}
