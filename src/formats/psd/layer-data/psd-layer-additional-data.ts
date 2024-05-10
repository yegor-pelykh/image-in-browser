/** @format */

import { InputBuffer } from '../../../common/input-buffer';
import { PsdLayerData } from './psd-layer-data';

export class PsdLayerAdditionalData extends PsdLayerData {
  private _data: InputBuffer<Uint8Array>;
  public get data(): InputBuffer<Uint8Array> {
    return this._data;
  }

  constructor(tag: string, data: InputBuffer<Uint8Array>) {
    super(tag);
    this._data = data;
  }
}
