/** @format */

import { MemoryImage } from '../image/image';

/**
 * Object interface for specifying Encoder.encode parameters.
 */
export interface EncoderEncodeOptions {
  image: MemoryImage;
  singleFrame?: boolean;
}

/**
 * Base class for image format encoders.
 */
export interface Encoder {
  /**
   * True if the encoder supports animated images; otherwise false.
   */
  get supportsAnimation(): boolean;

  /**
   * Encode an **image** to an image format.
   * If **singleFrame** is true, only the one MemoryImage will be encoded;
   * otherwise if image has animation, all frames of the **image** will be
   * encoded if the encoder supports animation.
   */
  encode(opt: EncoderEncodeOptions): Uint8Array;
}
