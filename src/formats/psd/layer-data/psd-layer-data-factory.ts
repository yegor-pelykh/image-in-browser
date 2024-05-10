/** @format */

import { InputBuffer } from '../../../common/input-buffer';
import { PsdLayerAdditionalData } from './psd-layer-additional-data';
import { PsdLayerSectionDivider } from './psd-layer-section-divider';

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
