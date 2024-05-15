/** @format */

import { InputBuffer } from '../../../common/input-buffer.js';
import { PsdLayerAdditionalData } from './psd-layer-additional-data.js';
import { PsdLayerSectionDivider } from './psd-layer-section-divider.js';

export class PsdLayerDataFactory {
  public static createLayerData(tag: string, data: InputBuffer<Uint8Array>) {
    switch (tag) {
      case PsdLayerSectionDivider.tagName:
        return new PsdLayerSectionDivider(tag, data);
      default:
        return new PsdLayerAdditionalData(tag, data);
    }
  }
}
