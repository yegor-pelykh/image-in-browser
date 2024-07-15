/** @format */

import { MemoryImage } from '../image/image.js';

/**
 * Object interface for specifying Encoder.encode parameters.
 */
export interface EncoderEncodeOptions {
  /**
   * The image to be encoded.
   */
  image: MemoryImage;

  /**
   * If true, only a single frame of the image will be encoded.
   * If false or undefined, all frames of the image will be encoded if the encoder supports animation.
   */
  singleFrame?: boolean;

  /**
   * Determines if EXIF metadata should be skipped during encoding.
   * - true: EXIF metadata will be skipped.
   * - false or undefined: EXIF metadata will be included in the encoded image.
   */
  skipExif?: boolean;
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
   * Encode an image to an image format.
   *
   * @param {EncoderEncodeOptions} opt - The options for encoding the image.
   * @param {ImageData} opt.image - The image to be encoded.
   * @param {boolean} opt.singleFrame - If true, only a single frame of the image will be encoded. If false or undefined, all frames of the image will be encoded if the encoder supports animation.
   * @returns {Uint8Array} A Uint8Array containing the encoded image data.
   */
  encode(opt: EncoderEncodeOptions): Uint8Array;
}
