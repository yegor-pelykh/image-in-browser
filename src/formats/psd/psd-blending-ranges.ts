/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

/**
 * Represents the blending ranges in a PSD file.
 */
export class PsdBlendingRanges {
  /**
   * The gray black source value.
   */
  private _grayBlackSrc: number = 0;

  /**
   * Gets the gray black source value.
   * @returns {number} The gray black source value.
   */
  public get grayBlackSrc(): number {
    return this._grayBlackSrc;
  }

  /**
   * The gray white source value.
   */
  private _grayWhiteSrc: number = 0;

  /**
   * Gets the gray white source value.
   * @returns {number} The gray white source value.
   */
  public get grayWhiteSrc(): number {
    return this._grayWhiteSrc;
  }

  /**
   * The gray black destination value.
   */
  private _grayBlackDst: number = 0;

  /**
   * Gets the gray black destination value.
   * @returns {number} The gray black destination value.
   */
  public get grayBlackDst(): number {
    return this._grayBlackDst;
  }

  /**
   * The gray white destination value.
   */
  private _grayWhiteDst: number = 0;

  /**
   * Gets the gray white destination value.
   * @returns {number} The gray white destination value.
   */
  public get grayWhiteDst(): number {
    return this._grayWhiteDst;
  }

  /**
   * The black source values for each channel.
   */
  private _blackSrc: Uint16Array | undefined;

  /**
   * Gets the black source values for each channel.
   * @returns {Uint16Array | undefined} The black source values.
   */
  public get blackSrc(): Uint16Array | undefined {
    return this._blackSrc;
  }

  /**
   * The white source values for each channel.
   */
  private _whiteSrc: Uint16Array | undefined;

  /**
   * Gets the white source values for each channel.
   * @returns {Uint16Array | undefined} The white source values.
   */
  public get whiteSrc(): Uint16Array | undefined {
    return this._whiteSrc;
  }

  /**
   * The black destination values for each channel.
   */
  private _blackDst: Uint16Array | undefined;

  /**
   * Gets the black destination values for each channel.
   * @returns {Uint16Array | undefined} The black destination values.
   */
  public get blackDst(): Uint16Array | undefined {
    return this._blackDst;
  }

  /**
   * The white destination values for each channel.
   */
  private _whiteDst: Uint16Array | undefined;

  /**
   * Gets the white destination values for each channel.
   * @returns {Uint16Array | undefined} The white destination values.
   */
  public get whiteDst(): Uint16Array | undefined {
    return this._whiteDst;
  }

  /**
   * Initializes a new instance of the PsdBlendingRanges class.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read from.
   * - `readUint16`: Reads a 16-bit unsigned integer from the buffer.
   * - `length`: The length of the buffer.
   */
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
