/** @format */

import { inflate, deflate } from '../packer/packer.js';
import { ArrayUtils } from '../common/array-utils.js';
import { IccProfileCompression } from './icc-profile-compression.js';

/**
 * ICC Profile data stored with an image.
 */
export class IccProfile {
  /**
   * The name of the ICC Profile.
   */
  private _name: string;

  /**
   * Gets the name of the ICC Profile.
   * @returns {string} The name of the ICC Profile.
   */
  public get name(): string {
    return this._name;
  }

  /**
   * The compression type of the ICC Profile data.
   */
  private _compression: IccProfileCompression;

  /**
   * Gets the compression type of the ICC Profile data.
   * @returns {IccProfileCompression} The compression type.
   */
  public get compression(): IccProfileCompression {
    return this._compression;
  }

  /**
   * The raw data of the ICC Profile.
   */
  private _data: Uint8Array;

  /**
   * Gets the raw data of the ICC Profile.
   * @returns {Uint8Array} The raw data.
   */
  public get data(): Uint8Array {
    return this._data;
  }

  /**
   * Constructs a new IccProfile instance.
   * @param {string} name - The name of the ICC Profile.
   * @param {IccProfileCompression} compression - The compression type of the ICC Profile data.
   * @param {Uint8Array} data - The raw data of the ICC Profile.
   */
  constructor(
    name: string,
    compression: IccProfileCompression,
    data: Uint8Array
  ) {
    this._name = name;
    this._compression = compression;
    this._data = data;
  }

  /**
   * Creates a new IccProfile instance from an existing one.
   * @param {IccProfile} other - The existing IccProfile instance.
   * @returns {IccProfile} A new IccProfile instance.
   */
  public static from(other: IccProfile): IccProfile {
    return new IccProfile(
      other._name,
      other._compression,
      ArrayUtils.copyUint8(other._data)
    );
  }

  /**
   * Returns the compressed data of the ICC Profile, compressing the stored data as necessary.
   * @returns {Uint8Array} The compressed data.
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
   * @returns {Uint8Array} The uncompressed data.
   */
  public decompressed(): Uint8Array {
    if (this._compression === IccProfileCompression.none) {
      return this._data;
    }
    this._data = inflate(this._data);
    this._compression = IccProfileCompression.none;
    return this._data;
  }

  /**
   * Creates a deep copy of the current IccProfile instance.
   * @returns {IccProfile} A new IccProfile instance that is a copy of the current instance.
   */
  public clone(): IccProfile {
    return IccProfile.from(this);
  }
}
