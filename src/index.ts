/** @format */

import { FrameAnimation } from './common/frame-animation';
import { MemoryImage } from './common/memory-image';
import { CompressionLevel, TypedArray } from './common/typings';
import { BmpDecoder } from './formats/bmp-decoder';
import { BmpEncoder } from './formats/bmp-encoder';
import { Decoder } from './formats/decoder';
import { GifDecoder } from './formats/gif-decoder';
import { GifEncoder } from './formats/gif-encoder';
import { IcoDecoder } from './formats/ico-decoder';
import { IcoEncoder } from './formats/ico-encoder';
import { JpegDecoder } from './formats/jpeg-decoder';
import { JpegEncoder } from './formats/jpeg-encoder';
import { PngDecoder } from './formats/png-decoder';
import { PngEncoder } from './formats/png-encoder';

/**
 * Find a [Decoder] that is able to decode the given image [data].
 * Use this is you don't know the type of image it is. Since this will
 * validate the image against all known decoders, it is potentially very slow.
 */
export function findDecoderForData(data: TypedArray): Decoder | undefined {
  // The letious decoders will be creating a Uint8List for their InputStream
  // if the data isn't already that type, so do it once here to avoid having to
  // do it multiple times.
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  const jpg = new JpegDecoder();
  if (jpg.isValidFile(bytes)) {
    return jpg;
  }

  const png = new PngDecoder();
  if (png.isValidFile(bytes)) {
    return png;
  }

  const gif = new GifDecoder();
  if (gif.isValidFile(bytes)) {
    return gif;
  }

  const bmp = new BmpDecoder();
  if (bmp.isValidFile(bytes)) {
    return bmp;
  }

  const ico = new IcoDecoder();
  if (ico.isValidFile(bytes)) {
    return ico;
  }

  return undefined;
}

/**
 * Decode the given image file bytes by first identifying the format of the
 * file and using that decoder to decode the file into a single frame [Image].
 */
export function decodeImage(data: TypedArray): MemoryImage | undefined {
  const decoder = findDecoderForData(data);
  if (decoder === undefined) {
    return undefined;
  }
  const dataUint8 = new Uint8Array(data);
  return decoder.decodeImage(dataUint8);
}

/**
 * Decode the given image file bytes by first identifying the format of the
 * file and using that decoder to decode the file into an [Animation]
 * containing one or more [Image] frames.
 */
export function decodeAnimation(data: TypedArray): FrameAnimation | undefined {
  const decoder = findDecoderForData(data);
  if (decoder === undefined) {
    return undefined;
  }
  const dataUint8 = new Uint8Array(data);
  return decoder.decodeAnimation(dataUint8);
}

/**
 * Return the [Decoder] that can decode image with the given [name],
 * by looking at the file extension. See also [findDecoderForData] to
 * determine the decoder to use given the bytes of the file.
 */
export function getDecoderForNamedImage(name: string): Decoder | undefined {
  const n = name.toLowerCase();
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) {
    return new JpegDecoder();
  }
  if (n.endsWith('.png')) {
    return new PngDecoder();
  }
  if (n.endsWith('.gif')) {
    return new GifDecoder();
  }
  if (n.endsWith('.bmp')) {
    return new BmpDecoder();
  }
  if (n.endsWith('.ico')) {
    return new IcoDecoder();
  }
  return undefined;
}

/**
 * Identify the format of the image using the file extension of the given
 * [name], and decode the given file [bytes] to an [FrameAnimation] with one or more
 * [MemoryImage] frames. See also [decodeAnimation].
 */
export function decodeNamedAnimation(
  data: TypedArray,
  name: string
): FrameAnimation | undefined {
  const decoder = getDecoderForNamedImage(name);
  if (decoder === undefined) {
    return undefined;
  }
  const dataUint8 = new Uint8Array(data);
  return decoder.decodeAnimation(dataUint8);
}

/**
 * Identify the format of the image using the file extension of the given
 * [name], and decode the given file [bytes] to a single frame [Image]. See
 * also [decodeImage].
 */
export function decodeNamedImage(
  data: TypedArray,
  name: string
): MemoryImage | undefined {
  const decoder = getDecoderForNamedImage(name);
  if (decoder === undefined) {
    return undefined;
  }
  const dataUint8 = new Uint8Array(data);
  return decoder.decodeImage(dataUint8);
}

/**
 * Identify the format of the image and encode it with the appropriate
 * [Encoder].
 */
export function encodeNamedImage(
  image: MemoryImage,
  name: string
): Uint8Array | undefined {
  const n = name.toLowerCase();
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) {
    return encodeJpg(image);
  }
  if (n.endsWith('.png')) {
    return encodePng(image);
  }
  if (n.endsWith('.gif')) {
    return encodeGif(image);
  }
  if (n.endsWith('.ico')) {
    return encodeIco(image);
  }
  if (n.endsWith('.bmp')) {
    return encodeBmp(image);
  }
  return undefined;
}

/**
 * Decode a JPG formatted image.
 */
export function decodeJpg(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new JpegDecoder().decodeImage(dataUint8);
}

/**
 * Renamed to [decodeJpg], left for backward compatibility.
 */
export function readJpg(data: TypedArray): MemoryImage | undefined {
  return decodeJpg(data);
}

/**
 * Encode an image to the JPEG format.
 */
export function encodeJpg(image: MemoryImage, quality = 100): Uint8Array {
  return new JpegEncoder(quality).encodeImage(image);
}

/**
 * Renamed to [encodeJpg], left for backward compatibility.
 */
export function writeJpg(image: MemoryImage, quality = 100): Uint8Array {
  return encodeJpg(image, quality);
}

/**
 * Decode a PNG formatted image.
 */
export function decodePng(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new PngDecoder().decodeImage(dataUint8);
}

/**
 * Decode a PNG formatted animation.
 */
export function decodePngAnimation(
  data: TypedArray
): FrameAnimation | undefined {
  const dataUint8 = new Uint8Array(data);
  return new PngDecoder().decodeAnimation(dataUint8);
}

/**
 * Renamed to [decodePng], left for backward compatibility.
 */
export function readPng(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return decodePng(dataUint8);
}

/**
 * Encode an image to the PNG format.
 */
export function encodePng(
  image: MemoryImage,
  level: CompressionLevel = 6
): Uint8Array {
  return new PngEncoder({
    level: level,
  }).encodeImage(image);
}

/**
 * Encode an animation to the PNG format.
 */
export function encodePngAnimation(
  animation: FrameAnimation,
  level: CompressionLevel = 6
): Uint8Array | undefined {
  return new PngEncoder({
    level: level,
  }).encodeAnimation(animation);
}

/**
 * Renamed to [encodePng], left for backward compatibility.
 */
export function writePng(
  image: MemoryImage,
  level: CompressionLevel = 6
): Uint8Array {
  return encodePng(image, level);
}

/**
 * Decode a GIF formatted image (first frame for animations).
 */
export function decodeGif(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new GifDecoder().decodeImage(dataUint8);
}

/**
 * Decode an animated GIF file. If the GIF isn't animated, the animation
 * will contain a single frame with the GIF's image.
 */
export function decodeGifAnimation(
  data: TypedArray
): FrameAnimation | undefined {
  const dataUint8 = new Uint8Array(data);
  return new GifDecoder().decodeAnimation(dataUint8);
}

/**
 * Encode an image to the GIF format.
 *
 * The [samplingFactor] specifies the sampling factor for
 * NeuQuant image quantization. It is responsible for reducing
 * the amount of unique colors in your images to 256.
 * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
 * a sampling factor of 10 gives you a reasonable trade-off between
 * image quality and quantization speed.
 * If you know that you have less than 256 colors in your frames
 * anyway, you should supply a very large [samplingFactor] for maximum performance.
 */
export function encodeGif(image: MemoryImage, samplingFactor = 10): Uint8Array {
  return new GifEncoder({
    samplingFactor: samplingFactor,
  }).encodeImage(image);
}

/**
 * Encode an animation to the GIF format.
 *
 * The [samplingFactor] specifies the sampling factor for
 * NeuQuant image quantization. It is responsible for reducing
 * the amount of unique colors in your images to 256.
 * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
 * a sampling factor of 10 gives you a reasonable trade-off between
 * image quality and quantization speed.
 * If you know that you have less than 256 colors in your frames
 * anyway, you should supply a very large [samplingFactor] for maximum performance.
 *
 * Here, `30` is used a default value for the [samplingFactor] as
 * encoding animations is usually a process that takes longer than
 * encoding a single image (see [encodeGif]).
 */
export function encodeGifAnimation(
  animation: FrameAnimation,
  samplingFactor = 30
): Uint8Array | undefined {
  return new GifEncoder({
    samplingFactor: samplingFactor,
  }).encodeAnimation(animation);
}

/**
 * Decode a BMP formatted image.
 */
export function decodeBmp(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new BmpDecoder().decodeImage(dataUint8);
}

/**
 * Encode an image to the BMP format.
 */
export function encodeBmp(image: MemoryImage): Uint8Array {
  return new BmpEncoder().encodeImage(image);
}

/**
 * Encode an image to the ICO format.
 */
export function encodeIco(image: MemoryImage): Uint8Array {
  return new IcoEncoder().encodeImage(image);
}

/**
 * Encode a list of images to the ICO format.
 */
export function encodeIcoImages(images: MemoryImage[]): Uint8Array {
  return new IcoEncoder().encodeImages(images);
}

/**
 * Decode an ICO image.
 */
export function decodeIco(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new IcoDecoder().decodeImage(dataUint8);
}
