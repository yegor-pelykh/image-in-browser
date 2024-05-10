/** @format */

import { InputBuffer } from '../../common/input-buffer';

export class PsdBlendingRanges {
  private _grayBlackSrc: number = 0;
  public get grayBlackSrc(): number {
    return this._grayBlackSrc;
  }

  private _grayWhiteSrc: number = 0;
  public get grayWhiteSrc(): number {
    return this._grayWhiteSrc;
  }

  private _grayBlackDst: number = 0;
  public get grayBlackDst(): number {
    return this._grayBlackDst;
  }

  private _grayWhiteDst: number = 0;
  public get grayWhiteDst(): number {
    return this._grayWhiteDst;
  }

  private _blackSrc: Uint16Array | undefined;
  public get blackSrc(): Uint16Array | undefined {
    return this._blackSrc;
  }

  private _whiteSrc: Uint16Array | undefined;
  public get whiteSrc(): Uint16Array | undefined {
    return this._whiteSrc;
  }

  private _blackDst: Uint16Array | undefined;
  public get blackDst(): Uint16Array | undefined {
    return this._blackDst;
  }

  private _whiteDst: Uint16Array | undefined;
  public get whiteDst(): Uint16Array | undefined {
    return this._whiteDst;
  }

  constructor(input: InputBuffer<Uint8Array>) {
    this._grayBlackSrc = input.readUint16();
    this._grayWhiteSrc = input.readUint16();

    this._grayBlackDst = input.readUint16();
    this._grayWhiteDst = input.readUint16();

    const len = input.length;
    const numChannels = Math.trunc(len / 8);

    if (numChannels > 0) {
      this._blackSrc = new Uint16Array(numChannels);
      this._whiteSrc = new Uint16Array(numChannels);
      this._blackDst = new Uint16Array(numChannels);
      this._whiteDst = new Uint16Array(numChannels);

      for (let i = 0; i < numChannels; ++i) {
        this._blackSrc[i] = input.readUint16();
        this._whiteSrc[i] = input.readUint16();
        this._blackDst[i] = input.readUint16();
        this._whiteDst[i] = input.readUint16();
      }
    }
  }
}
