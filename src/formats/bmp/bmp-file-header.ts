/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';

/**
 * Represents the header of a BMP file.
 */
export class BmpFileHeader {
  /**
   * Signature for BMP files: 'BM'
   */
  public static readonly signature = 0x4d42;

  private readonly _fileLength: number;

  /**
   * Gets the length of the file.
   */
  public get fileLength(): number {
    return this._fileLength;
  }

  private _imageOffset: number;

  /**
   * Sets the offset of the image data in the file.
   * @param {number} v - The offset value.
   */
  public set imageOffset(v: number) {
    this._imageOffset = v;
  }

  /**
   * Gets the offset of the image data in the file.
   * @returns {number} The offset of the image data in the file.
   */
  public get imageOffset(): number {
    return this._imageOffset;
  }

  /**
   * Constructs a BmpFileHeader instance from the given input buffer.
   * @param {InputBuffer<Uint8Array>} b - The input buffer containing the BMP file data.
   * @throws {LibError} If the buffer does not represent a valid BMP file.
   */
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

  /**
   * Checks if the given input buffer represents a valid BMP file.
   * @param {InputBuffer<Uint8Array>} b - The input buffer to check.
   * @param {number} b.length - The length of the buffer.
   * @param {function(): number} b.readUint16 - Reads a 16-bit unsigned integer from the buffer.
   * @returns {boolean} True if the buffer is a valid BMP file, false otherwise.
   */
  public static isValidFile(b: InputBuffer<Uint8Array>): boolean {
    if (b.length < 2) {
      return false;
    }
    const type = InputBuffer.from(b).readUint16();
    return type === BmpFileHeader.signature;
  }
}
