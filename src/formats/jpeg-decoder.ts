/** @format */

import { InputBuffer } from '../common/input-buffer';
import { LibError } from '../error/lib-error';
import { MemoryImage } from '../image/image';
import { Decoder } from './decoder';
import { JpegData } from './jpeg/jpeg-data';
import { JpegInfo } from './jpeg/jpeg-info';

/**
 * Decode a jpeg encoded image.
 */
export class JpegDecoder implements Decoder {
  private _input?: InputBuffer;
  private _info?: JpegInfo;

  public get numFrames(): number {
    return this._info !== undefined ? this._info.numFrames : 0;
  }

  /**
   * Is the given file a valid JPEG image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return new JpegData().validate(bytes);
  }

  public startDecode(bytes: Uint8Array): JpegInfo | undefined {
    this._input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });
    this._info = new JpegData().readInfo(bytes);
    return this._info;
  }

  public decodeFrame(_: number): MemoryImage | undefined {
    if (this._input === undefined) {
      return undefined;
    }

    const jpeg = new JpegData();
    jpeg.read(this._input.buffer);
    if (jpeg.frames.length !== 1) {
      throw new LibError('Only single frame JPEGs supported.');
    }

    return jpeg.getImage();
  }

  public decode(bytes: Uint8Array, _frame?: number): MemoryImage | undefined {
    const jpeg = new JpegData();
    jpeg.read(bytes);

    if (jpeg.frames.length !== 1) {
      throw new LibError('Only single frame JPEGs supported.');
    }

    return jpeg.getImage();
  }
}
