/** @format */

/**
 * A coded lossy frame: the VP8 bitstream, and the alpha plane that VP8 itself
 * cannot carry.
 */
export class VP8Lossy {
  public readonly bitstream: Uint8Array;

  /**
   * The payload of an `ALPH` chunk, or undefined if the picture is opaque.
   */
  public readonly alpha: Uint8Array | undefined;

  constructor(bitstream: Uint8Array, alpha: Uint8Array | undefined) {
    this.bitstream = bitstream;
    this.alpha = alpha;
  }
}
