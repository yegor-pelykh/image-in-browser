/** @format */

import { deflate, inflate } from 'uzip';
import { ICCPCompressionMode } from './iccp-compression-mode';
import { ArrayUtils } from './array-utils';

/**
 * ICC Profile data stored with an image.
 */
export class ICCProfileData {
  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _compression: ICCPCompressionMode;
  public get compression(): ICCPCompressionMode {
    return this._compression;
  }

  private _data: Uint8Array;
  public get data(): Uint8Array {
    return this._data;
  }

  constructor(
    name: string,
    compression: ICCPCompressionMode,
    data: Uint8Array
  ) {
    this._name = name;
    this._compression = compression;
    this._data = data;
  }

  public static from(other: ICCProfileData) {
    return new ICCProfileData(
      other._name,
      other._compression,
      ArrayUtils.copyUint8(other._data)
    );
  }

  /**
   * Returns the compressed data of the ICC Profile, compressing the stored data as necessary.
   */
  public compressed(): Uint8Array {
    if (this._compression === ICCPCompressionMode.deflate) {
      return this._data;
    }
    this._data = deflate(this._data);
    this._compression = ICCPCompressionMode.deflate;
    return this._data;
  }

  /**
   * Returns the uncompressed data of the ICC Profile, decompressing the stored data as necessary.
   */
  public decompressed(): Uint8Array {
    if (this._compression === ICCPCompressionMode.deflate) {
      return this._data;
    }
    this._data = inflate(this._data);
    this._compression = ICCPCompressionMode.none;
    return this._data;
  }
}
