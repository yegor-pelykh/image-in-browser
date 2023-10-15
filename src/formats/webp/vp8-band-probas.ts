/** @format */

import { ArrayUtils } from '../../common/array-utils';
import { VP8 } from './vp8';

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
