/** @format */

import { MemoryImage } from '../image/image.js';
import { DecodeInfo } from './decode-info.js';
import { ImageFormat } from './image-format.js';

/**
 * Options for decoding image data.
 */
export interface DecoderDecodeOptions {
  /**
   * The byte array containing the image data to be decoded.
   */
  bytes: Uint8Array;

  /**
   * Optional. The index of the specific frame to decode.
   */
  frameIndex?: number;
}

/**
 * Base class for image format decoders.
 *
 * Image pixels are stored as 32-bit unsigned ints, so all formats, regardless
 * of their encoded color resolutions, decode to 32-bit RGBA images. Encoders
 * can reduce the color resolution back down to their required formats.
 *
 * Some image formats support multiple frames, often for encoding animation.
 * In such cases, the **decode** method will decode all of the frames,
 * unless the frame argument is specified for a particular frame to decode.
 * **startDecode** will initiate decoding of the file, and **decodeFrame** will
 * then decode a specific frame from the file, allowing for animations to be
 * decoded one frame at a time. Some formats, such as TIFF, may store multiple
 * frames, but their use of frames is for multiple page documents and not
 * animation. The terms 'animation' and 'frames' simply refer to 'pages' in
 * this case.
 */
export interface Decoder {
  /**
   * Get the image format.
   */
  get format(): ImageFormat;

  /**
   * Get the number of frames available to be decoded. **startDecode** should have
   * been called first. Non animated image files will have a single frame.
   */
  get numFrames(): number;

  /**
   * A light-weight function to test if the given file is able to be decoded
   * by this Decoder.
   * @param {Uint8Array} bytes - The byte array of the image data to test.
   * @returns {boolean} True if the file is valid for this decoder, otherwise false.
   */
  isValidFile(bytes: Uint8Array): boolean;

  /**
   * Start decoding the data as an animation sequence, but don't actually
   * process the frames until they are requested with **decodeFrame**.
   * @param {Uint8Array} bytes - The byte array of the image data to start decoding.
   * @returns {DecodeInfo | undefined} DecodeInfo object if decoding starts successfully, otherwise undefined.
   */
  startDecode(bytes: Uint8Array): DecodeInfo | undefined;

  /**
   * Decodes the provided image file.
   * @param {DecodeImageOptions} opt - The options for decoding, including the byte array and optional frame index.
   * @param {Uint8Array} opt.bytes - The byte array of the image data to decode.
   * @returns {MemoryImage | undefined} The decoded MemoryImage, or undefined if decoding fails.
   */
  decode(opt: DecoderDecodeOptions): MemoryImage | undefined;

  /**
   * Decode a single frame from the data that was set with **startDecode**.
   * If **frameIndex** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frameIndex** 0. A MemoryImage
   * is returned, which provides the image, and top-left coordinates of the
   * image, as animated frames may only occupy a subset of the canvas.
   * @param {number} frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded MemoryImage, or undefined if decoding fails.
   */
  decodeFrame(frameIndex: number): MemoryImage | undefined;
}
