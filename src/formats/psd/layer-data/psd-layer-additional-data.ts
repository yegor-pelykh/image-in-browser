/** @format */

import { InputBuffer } from '../../../common/input-buffer.js';
import { PsdLayerData } from './psd-layer-data.js';

/**
 * Represents additional data for a PSD layer.
 */
export class PsdLayerAdditionalData extends PsdLayerData {
  /**
   * The input buffer containing the additional data.
   */
  private _data: InputBuffer<Uint8Array>;

  /**
   * Gets the input buffer containing the additional data.
   * @returns {InputBuffer<Uint8Array>} The input buffer.
   */
  public get data(): InputBuffer<Uint8Array> {
    return this._data;
  }

  /**
   * Initializes a new instance of the PsdLayerAdditionalData class.
   * @param {string} tag - The tag associated with the layer data.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the additional data.
   */
  constructor(tag: string, data: InputBuffer<Uint8Array>) {
    super(tag);
    this._data = data;
  }
}
