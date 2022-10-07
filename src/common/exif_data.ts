/** @format */

import { ListUtils } from './list-utils';

export type ExifDataType = string | number;

export interface ExifDataInitOptions {
  data?: Map<number, ExifDataType>;
  rawData?: Uint8Array[];
}

/**
 * Exif data stored with an image.
 */
export class ExifData {
  public static readonly ORIENTATION = 0x0112;

  private _rawData?: Uint8Array[];
  public get rawData(): Uint8Array[] | undefined {
    return this._rawData;
  }

  private _data: Map<number, ExifDataType>;
  public get data(): Map<number, ExifDataType> {
    return this._data;
  }

  public get hasRawData(): boolean {
    return this.rawData !== undefined && this.rawData.length > 0;
  }

  public get hasOrientation(): boolean {
    return this.data.has(ExifData.ORIENTATION);
  }

  public get orientation(): number | undefined {
    return this.data.get(ExifData.ORIENTATION) as number | undefined;
  }

  constructor(options?: ExifDataInitOptions) {
    this._data = options?.data ?? new Map<number, ExifDataType>();
    this._rawData = options?.rawData;
  }

  public static from(other?: ExifData) {
    let data: Map<number, ExifDataType> | undefined = undefined;
    let rawData: Uint8Array[] | undefined = undefined;
    if (other !== undefined) {
      if (other._data !== undefined) {
        data = new Map<number, ExifDataType>(other._data);
      }
      if (other._rawData !== undefined) {
        rawData = new Array(other._rawData.length);
        for (let i = 0; i < rawData.length; i++) {
          rawData[i] = ListUtils.copyUint8(other._rawData[i]);
        }
      }
    }
    return new ExifData({
      data: data,
      rawData: rawData,
    });
  }

  public addRowData(data: Uint8Array) {
    if (this._rawData === undefined) {
      this._rawData = new Array<Uint8Array>();
    }
    this._rawData.push(data);
  }
}
