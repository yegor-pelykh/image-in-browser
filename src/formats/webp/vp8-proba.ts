/** @format */

import { ArrayUtils } from '../../common/array-utils';
import { VP8 } from './vp8';
import { VP8BandProbas } from './vp8-band-probas';

/**
 * Struct collecting all frame-persistent probabilities
 */
export class VP8Proba {
  public segments: Uint8Array = new Uint8Array(VP8.mbFeatureTreeProbs);

  /**
   * Type: 0=Intra16-AC, 1=Intra16-DC, 2=Chroma, 3=Intra4
   */
  public bands: Array<Array<VP8BandProbas>>;

  constructor() {
    this.bands = ArrayUtils.generate<Array<VP8BandProbas>>(VP8.numTypes, () =>
      ArrayUtils.generate<VP8BandProbas>(
        VP8.numBands,
        () => new VP8BandProbas()
      )
    );
    this.segments.fill(255, 0, this.segments.length);
  }
}
