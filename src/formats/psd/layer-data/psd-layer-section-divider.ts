/** @format */

import { InputBuffer } from '../../../common/input-buffer';
import { LibError } from '../../../error/lib-error';
import { PsdLayerData } from './psd-layer-data';

export class PsdLayerSectionDivider extends PsdLayerData {
  public static readonly tagName = 'lsct';

  public static readonly normal = 0;
  public static readonly openFolder = 1;
  public static readonly closedFolder = 2;
  public static readonly sectionDivider = 3;

  public static readonly subTypeNormal = 0;
  public static readonly subTypeGroup = 1;

  private _type: number = 0;
  public get type(): number {
    return this._type;
  }

  private _key: string | undefined;
  public get key(): string | undefined {
    return this._key;
  }

  private _subType: number = PsdLayerSectionDivider.subTypeNormal;
  public get subType(): number {
    return this._subType;
  }

  constructor(tag: string, data: InputBuffer<Uint8Array>) {
    super(tag);

    const len = data.length;

    this._type = data.readUint32();

    if (len >= 12) {
      const sig = data.readString(4);
      if (sig !== '8BIM') {
        throw new LibError('Invalid key in layer additional data');
      }
      this._key = data.readString(4);
    }

    if (len >= 16) {
      this._subType = data.readUint32();
    }
  }
}
