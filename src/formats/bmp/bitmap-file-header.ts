/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { ImageError } from '../../error/image-error';

export class BitmapFileHeader {
  // BM
  public static readonly BMP_HEADER_FILETYPE = 0x42 + (0x4d << 8);

  private readonly _fileLength: number;
  public get fileLength(): number {
    return this._fileLength;
  }

  private _offset: number;
  public set offset(v: number) {
    this._offset = v;
  }
  public get offset(): number {
    return this._offset;
  }

  constructor(b: InputBuffer) {
    if (!BitmapFileHeader.isValidFile(b)) {
      throw new ImageError('Not a bitmap file.');
    }
    b.skip(2);
    this._fileLength = b.readInt32();
    // Skip reserved space
    b.skip(4);
    this._offset = b.readInt32();
  }

  public static isValidFile(b: InputBuffer): boolean {
    if (b.length < 2) {
      return false;
    }
    const type = InputBuffer.from(b).readUint16();
    return type === BitmapFileHeader.BMP_HEADER_FILETYPE;
  }

  public toJson(): Map<string, number> {
    return new Map<string, number>([
      ['offset', this._offset],
      ['fileLength', this.fileLength],
      ['fileType', BitmapFileHeader.BMP_HEADER_FILETYPE],
    ]);
  }
}
