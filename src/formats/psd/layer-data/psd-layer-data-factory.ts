/** @format */

import { InputBuffer } from '../../../common/input-buffer.js';
import { PsdLayerAdditionalData } from './psd-layer-additional-data.js';
import { PsdLayerSectionDivider } from './psd-layer-section-divider.js';

/**
 * Factory class for creating PSD layer data objects.
 */
export class PsdLayerDataFactory {
  /**
   * Creates a PSD layer data object based on the provided tag.
   *
   * @param {string} tag - The tag identifying the type of PSD layer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the data for the PSD layer.
   * @returns {PsdLayerSectionDivider | PsdLayerAdditionalData} A new instance of a PSD layer data object.
   */
  public static createLayerData(tag: string, data: InputBuffer<Uint8Array>) {
    switch (tag) {
      case PsdLayerSectionDivider.tagName:
        return new PsdLayerSectionDivider(tag, data);
      default:
        return new PsdLayerAdditionalData(tag, data);
    }
  }
}
