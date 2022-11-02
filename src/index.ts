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
import { TgaDecoder } from './formats/tga-decoder';
import { TgaEncoder } from './formats/tga-encoder';
import { TiffDecoder } from './formats/tiff-decoder';
import { TiffEncoder } from './formats/tiff-encoder';

// Export types from 'common' directory
export { BitOperators } from './common/bit-operators';
export { BlendMode } from './common/blend-mode';
export { Clamp } from './common/clamp';
export { ColorChannel } from './common/color-channel';
export { ColorModel } from './common/color-model';
export { ColorUtils } from './common/color-utils';
export { Color } from './common/color';
export { Crc32, Crc32Parameters } from './common/crc32';
export { DisposeMode } from './common/dispose-mode';
export { DitherKernel } from './common/dither-kernel';
export { DitherPixel } from './common/dither-pixel';
export {
  ExifData,
  ExifDataInitOptions,
  ExifDataType,
} from './common/exif_data';
export {
  FrameAnimation,
  FrameAnimationInitOptions,
} from './common/frame-animation';
export { FrameType } from './common/frame-type';
export { ICCProfileData } from './common/icc_profile_data';
export { ICCPCompressionMode } from './common/iccp-compression-mode';
export { InputBuffer, InputBufferInitOptions } from './common/input-buffer';
export { Interpolation } from './common/interpolation';
export { Line } from './common/line';
export { ListUtils } from './common/list-utils';
export {
  MemoryImage,
  MemoryImageInitOptions,
  MemoryImageInitOptionsColorModel,
  RgbMemoryImageInitOptions,
} from './common/memory-image';
export { NeuralQuantizer } from './common/neural-quantizer';
export { OutputBuffer, OutputBufferInitOptions } from './common/output-buffer';
export { Point } from './common/point';
export { Quantizer } from './common/quantizer';
export { Rectangle } from './common/rectangle';
export { RgbChannelSet } from './common/rgb-channel-set';
export { TextCodec } from './common/text-codec';
export { CompressionLevel, TypedArray, BufferEncoding } from './common/typings';

// Export types from 'draw' directory
export { DrawImageOptions } from './draw/draw-image-options';
export { DrawLineOptions } from './draw/draw-line-options';
export { Draw } from './draw/draw';
export { FillFloodOptions } from './draw/fill-flood-options';
export { MaskFloodOptions } from './draw/mask-flood-options';

// Export types from 'formats' directory
export { BmpDecoder } from './formats/bmp-decoder';
export { BmpEncoder } from './formats/bmp-encoder';
export { DecodeInfo } from './formats/decode-info';
export { Decoder } from './formats/decoder';
export { Encoder } from './formats/encoder';
export { GifDecoder } from './formats/gif-decoder';
export { GifEncoder, GifEncoderInitOptions } from './formats/gif-encoder';
export { IcoDecoder } from './formats/ico-decoder';
export { IcoEncoder } from './formats/ico-encoder';
export { JpegDecoder } from './formats/jpeg-decoder';
export { JpegEncoder } from './formats/jpeg-encoder';
export { PngDecoder } from './formats/png-decoder';
export { PngEncoder, PngEncoderInitOptions } from './formats/png-encoder';
export { TgaDecoder } from './formats/tga-decoder';
export { TgaEncoder } from './formats/tga-encoder';
export { TiffDecoder } from './formats/tiff-decoder';
export { TiffEncoder } from './formats/tiff-encoder';

export { BitmapCompressionMode } from './formats/bmp/bitmap-compression-mode';
export { BitmapFileHeader } from './formats/bmp/bitmap-file-header';
export { BmpInfo } from './formats/bmp/bmp-info';

export {
  GifColorMap,
  GifColorMapInitOptions,
} from './formats/gif/gif-color-map';
export { GifImageDesc } from './formats/gif/gif-image-desc';
export { GifInfo, GifInfoInitOptions } from './formats/gif/gif-info';

export { IcoBmpInfo } from './formats/ico/ico-bmp-info';
export { IcoInfoImage } from './formats/ico/ico-info-image';
export { IcoInfo } from './formats/ico/ico-info';

export { ComponentData } from './formats/jpeg/component-data';
export { JpegAdobe } from './formats/jpeg/jpeg-adobe';
export { JpegComponent } from './formats/jpeg/jpeg-component';
export { JpegData } from './formats/jpeg/jpeg-data';
export { JpegFrame } from './formats/jpeg/jpeg-frame';
export { JpegHuffman } from './formats/jpeg/jpeg-huffman';
export { JpegInfo } from './formats/jpeg/jpeg-info';
export { JpegJfif } from './formats/jpeg/jpeg-jfif';
export { JpegQuantize } from './formats/jpeg/jpeg-quantize';
export { JpegScan } from './formats/jpeg/jpeg-scan';
export { Jpeg } from './formats/jpeg/jpeg';

export { PngFrame, PngFrameInitOptions } from './formats/png/png-frame';
export { PngInfo, PngInfoInitOptions } from './formats/png/png-info';

export { TgaInfo } from './formats/tga/tga-info';

export { TiffBitReader } from './formats/tiff/tiff-bit-reader';
export { TiffEntry, TiffEntryInitOptions } from './formats/tiff/tiff-entry';
export {
  TiffFaxDecoder,
  TiffFaxDecoderInitOptions,
} from './formats/tiff/tiff-fax-decoder';
export { TiffImage } from './formats/tiff/tiff-image';
export { TiffInfo, TiffInfoInitOptions } from './formats/tiff/tiff-info';
export { LzwDecoder } from './formats/tiff/tiff-lzw-decoder';

// Export types from 'hdr' directory
export { Half } from './hdr/half';
export { HdrImage } from './hdr/hdr-image';
export { HdrSlice, HdrSliceInitOptions } from './hdr/hdr-slice';
export { HdrToImage } from './hdr/hdr-to-image';

// Export types from 'transform' directory
export { CopyIntoOptions } from './transform/copy-into-options';
export {
  CopyResizeOptionsUsingHeight,
  CopyResizeOptionsUsingWidth,
} from './transform/copy-resize-options';
export { FlipDirection } from './transform/flip-direction';
export { ImageTransform } from './transform/image-transform';
export { TrimMode } from './transform/trim-mode';
export { TrimSide } from './transform/trim-side';
export { TrimTransform } from './transform/trim';

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

  const tiff = new TiffDecoder();
  if (tiff.isValidFile(bytes)) {
    return tiff;
  }

  const bmp = new BmpDecoder();
  if (bmp.isValidFile(bytes)) {
    return bmp;
  }

  const tga = new TgaDecoder();
  if (tga.isValidFile(bytes)) {
    return tga;
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
  if (n.endsWith('.tga')) {
    return new TgaDecoder();
  }
  if (n.endsWith('.gif')) {
    return new GifDecoder();
  }
  if (n.endsWith('.tif') || n.endsWith('.tiff')) {
    return new TiffDecoder();
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
  if (n.endsWith('.tga')) {
    return encodeTga(image);
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
 * Encode an image to the JPEG format.
 */
export function encodeJpg(image: MemoryImage, quality = 100): Uint8Array {
  return new JpegEncoder(quality).encodeImage(image);
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
 * Decode a Targa formatted image.
 */
export function decodeTga(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new TgaDecoder().decodeImage(dataUint8);
}

/**
 * Encode an image to the Targa format.
 */
export function encodeTga(image: MemoryImage): Uint8Array {
  return new TgaEncoder().encodeImage(image);
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
 * Decode a TIFF formatted image.
 */
export function decodeTiff(data: TypedArray): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(data);
  return new TiffDecoder().decodeImage(dataUint8);
}

/**
 * Decode an multi-image (animated) TIFF file. If the tiff doesn't have
 * multiple images, the animation will contain a single frame with the tiff's
 * image.
 */
export function decodeTiffAnimation(
  data: TypedArray
): FrameAnimation | undefined {
  const dataUint8 = new Uint8Array(data);
  return new TiffDecoder().decodeAnimation(dataUint8);
}

/**
 * Encode an image to the TIFF format.
 */
export function encodeTiff(image: MemoryImage): Uint8Array {
  return new TiffEncoder().encodeImage(image);
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
