/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { LibError } from '../../error/lib-error';

export class BmpFileHeader {
  // Signature: BM
  public static readonly signature = 0x4d42;

  private readonly _fileLength: number;
  public get fileLength(): number {
    return this._fileLength;
  }

  private _imageOffset: number;
  public set imageOffset(v: number) {
    this._imageOffset = v;
  }
  public get imageOffset(): number {
    return this._imageOffset;
  }

  constructor(b: InputBuffer<Uint8Array>) {
    if (!BmpFileHeader.isValidFile(b)) {
      throw new LibError('Not a bitmap file.');
    }
    b.skip(2);
    this._fileLength = b.readInt32();
    // Skip reserved space
    b.skip(4);
    this._imageOffset = b.readInt32();
  }

  public static isValidFile(b: InputBuffer<Uint8Array>): boolean {
    if (b.length < 2) {
      return false;
    }
    const type = InputBuffer.from(b).readUint16();
    return type === BmpFileHeader.signature;
  }
}
