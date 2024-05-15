/** @format */

import { inflate, deflate } from '../uzip/uzip';
import { ArrayUtils } from '../common/array-utils';
import { IccProfileCompression } from './icc-profile-compression';

/**
 * ICC Profile data stored with an image.
 */
export class IccProfile {
  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _compression: IccProfileCompression;
  public get compression(): IccProfileCompression {
    return this._compression;
  }

  private _data: Uint8Array;
  public get data(): Uint8Array {
    return this._data;
  }

  constructor(
    name: string,
    compression: IccProfileCompression,
    data: Uint8Array
  ) {
    this._name = name;
    this._compression = compression;
    this._data = data;
  }

  public static from(other: IccProfile) {
    return new IccProfile(
      other._name,
      other._compression,
      ArrayUtils.copyUint8(other._data)
    );
  }

  /**
   * Returns the compressed data of the ICC Profile, compressing the stored data as necessary.
   */
  public compressed(): Uint8Array {
    if (this._compression === IccProfileCompression.deflate) {
      return this._data;
    }
    this._data = deflate(this._data);
    this._compression = IccProfileCompression.deflate;
    return this._data;
  }

  /**
   * Returns the uncompressed data of the ICC Profile, decompressing the stored data as necessary.
   */
  public decompressed(): Uint8Array {
    if (this._compression === IccProfileCompression.deflate) {
      return this._data;
    }
    this._data = inflate(this._data);
    this._compression = IccProfileCompression.none;
    return this._data;
  }

  public clone(): IccProfile {
    return IccProfile.from(this);
  }
}
