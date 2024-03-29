/** @format */

import { CompressionLevel, TypedArray } from './common/typings';
import { BmpDecoder } from './formats/bmp-decoder';
import { BmpEncoder } from './formats/bmp-encoder';
import { Encoder } from './formats/encoder';
import { Decoder } from './formats/decoder';
import { GifDecoder } from './formats/gif-decoder';
import { GifEncoder } from './formats/gif-encoder';
import { IcoDecoder } from './formats/ico-decoder';
import { IcoEncoder } from './formats/ico-encoder';
import { JpegDecoder } from './formats/jpeg-decoder';
import { JpegChroma, JpegEncoder } from './formats/jpeg-encoder';
import { PngDecoder } from './formats/png-decoder';
import { PngEncoder } from './formats/png-encoder';
import { TgaDecoder } from './formats/tga-decoder';
import { TgaEncoder } from './formats/tga-encoder';
import { TiffDecoder } from './formats/tiff-decoder';
import { TiffEncoder } from './formats/tiff-encoder';
import { MemoryImage } from './image/image';
import { PngFilterType } from './formats/png/png-filter-type';
import { DitherKernel } from './filter/dither-kernel';
import { ExifData } from './exif/exif-data';
import { JpegUtils } from './formats/jpeg/jpeg-utils';
import { WebPDecoder } from './formats/webp-decoder';
import { PnmDecoder } from './formats/pnm-decoder';

// Export types from 'color' directory
export { ChannelOrder, ChannelOrderLength } from './color/channel-order';
export { Channel } from './color/channel';
export { ColorFloat16 } from './color/color-float16';
export { ColorFloat32 } from './color/color-float32';
export { ColorFloat64 } from './color/color-float64';
export { ColorInt8 } from './color/color-int8';
export { ColorInt16 } from './color/color-int16';
export { ColorInt32 } from './color/color-int32';
export { ColorRgb8 } from './color/color-rgb8';
export { ColorRgba8 } from './color/color-rgba8';
export { ColorUint1 } from './color/color-uint1';
export { ColorUint2 } from './color/color-uint2';
export { ColorUint4 } from './color/color-uint4';
export { ColorUint8 } from './color/color-uint8';
export { ColorUint16 } from './color/color-uint16';
export { ColorUint32 } from './color/color-uint32';
export { Color, ColorConvertOptions } from './color/color';
export {
  Format,
  FormatType,
  FormatMaxValue,
  FormatSize,
  FormatToFormatType,
  getRowStride,
  convertFormatValue,
} from './color/format';

// Export types from 'common' directory
export { ArrayUtils } from './common/array-utils';
export { BitUtils } from './common/bit-utils';
export { Crc32, Crc32Options } from './common/crc32';
export { Float16 } from './common/float16';
export { InputBuffer, InputBufferInitOptions } from './common/input-buffer';
export { Interpolation } from './common/interpolation';
export { Line } from './common/line';
export { MathUtils } from './common/math-utils';
export { OutputBuffer, OutputBufferInitOptions } from './common/output-buffer';
export { Point } from './common/point';
export { RandomUtils } from './common/random-utils';
export { Rational } from './common/rational';
export { Rectangle } from './common/rectangle';
export { StringUtils } from './common/string-utils';
export { BufferEncoding, CompressionLevel, TypedArray } from './common/typings';

// Export types from 'draw' directory
export { BlendMode } from './draw/blend-mode';
export { CircleQuadrant } from './draw/circle-quadrant';
export {
  Draw,
  CompositeImageOptions,
  DrawCircleOptions,
  DrawLineOptions,
  DrawPixelOptions,
  DrawPolygonOptions,
  DrawRectOptions,
  FillCircleOptions,
  FillFloodOptions,
  FillOptions,
  FillPolygonOptions,
  FillRectOptions,
  MaskFloodOptions,
} from './draw/draw';

// Export types from 'error' directory
export { LibError } from './error/lib-error';

// Export types from 'exif' directory
export { IfdAsciiValue } from './exif/ifd-value/ifd-ascii-value';
export { IfdByteValue } from './exif/ifd-value/ifd-byte-value';
export { IfdDoubleValue } from './exif/ifd-value/ifd-double-value';
export { IfdLongValue } from './exif/ifd-value/ifd-long-value';
export { IfdRationalValue } from './exif/ifd-value/ifd-rational-value';
export { IfdSByteValue } from './exif/ifd-value/ifd-sbyte-value';
export { IfdShortValue } from './exif/ifd-value/ifd-short-value';
export { IfdSingleValue } from './exif/ifd-value/ifd-single-value';
export { IfdSLongValue } from './exif/ifd-value/ifd-slong-value';
export { IfdSRationalValue } from './exif/ifd-value/ifd-srational-value';
export { IfdSShortValue } from './exif/ifd-value/ifd-sshort-value';
export { IfdUndefinedValue } from './exif/ifd-value/ifd-undefined-value';
export { IfdValue } from './exif/ifd-value/ifd-value';
export { ExifData } from './exif/exif-data';
export { ExifEntry } from './exif/exif-entry';
export {
  ExifTag,
  ExifTagInitOptions,
  ExifGpsTags,
  ExifImageTags,
  ExifInteropTags,
  ExifTagNameToID,
} from './exif/exif-tag';
export { IfdContainer } from './exif/ifd-container';
export { IfdDirectory } from './exif/ifd-directory';
export {
  IfdValueType,
  IfdValueTypeSize,
  getIfdValueTypeSize,
  getIfdValueTypeString,
} from './exif/ifd-value-type';

// Export types from 'filter' directory
export { DitherKernel, DitherKernels } from './filter/dither-kernel';
export {
  Filter,
  AdjustColorOptions,
  BillboardOptions,
  BleachBypassOptions,
  BulgeDistortionOptions,
  BumpToNormalOptions,
  ChromaticAberrationOptions,
  ColorHalftone,
  ColorOffsetOptions,
  ContrastOptions,
  ConvolutionOptions,
  CopyImageChannelsOptions,
  DitherImageOptions,
  DotScreenOptions,
  DropShadowOptions,
  EdgeGlowOptions,
  EmbossOptions,
  GammaOptions,
  GaussianBlurOptions,
  GrayscaleOptions,
  HdrToLdrOptions,
  HexagonPixelateOptions,
  InvertOptions,
  LuminanceThresholdOptions,
  MonochromeOptions,
  NoiseOptions,
  NormalizeOptions,
  PixelateOptions,
  QuantizeOptions,
  ReinhardToneMapOptions,
  RemapColorsOptions,
  ScaleRgbaOptions,
  SeparableConvolutionOptions,
  SepiaOptions,
  SketchOptions,
  SmoothOptions,
  SobelOptions,
  StretchDistortionOptions,
  VignetteOptions,
} from './filter/filter';
export { NoiseType } from './filter/noise-type';
export { PixelateMode } from './filter/pixelate-mode';
export { QuantizeMethod } from './filter/quantize-method';
export {
  SeparableKernel,
  SeparableKernelApplyOptions,
} from './filter/separable-kernel';

// Export types from 'formats' directory
export { BmpCompressionMode } from './formats/bmp/bmp-compression-mode';
export { BmpFileHeader } from './formats/bmp/bmp-file-header';
export { BmpInfo } from './formats/bmp/bmp-info';

export { GifColorMap } from './formats/gif/gif-color-map';
export { GifImageDesc } from './formats/gif/gif-image-desc';
export { GifInfo, GifInfoInitOptions } from './formats/gif/gif-info';

export { IcoBmpInfo } from './formats/ico/ico-bmp-info';
export {
  IcoInfoImage,
  IcoInfoImageInitOptions,
} from './formats/ico/ico-info-image';
export { IcoInfo } from './formats/ico/ico-info';
export { IcoType, IcoTypeLength } from './formats/ico/ico-type';

export { HuffmanNode } from './formats/jpeg/huffman-node';
export { HuffmanParent } from './formats/jpeg/huffman-parent';
export { HuffmanValue } from './formats/jpeg/huffman-value';
export { JpegAdobe } from './formats/jpeg/jpeg-adobe';
export { JpegComponentData } from './formats/jpeg/jpeg-component-data';
export { JpegComponent } from './formats/jpeg/jpeg-component';
export { JpegData } from './formats/jpeg/jpeg-data';
export { JpegFrame } from './formats/jpeg/jpeg-frame';
export { JpegHuffman } from './formats/jpeg/jpeg-huffman';
export { JpegInfo } from './formats/jpeg/jpeg-info';
export { JpegJfif } from './formats/jpeg/jpeg-jfif';
export { JpegMarker } from './formats/jpeg/jpeg-marker';
export { JpegQuantize } from './formats/jpeg/jpeg-quantize';
export { JpegScan } from './formats/jpeg/jpeg-scan';
export { JpegUtils } from './formats/jpeg/jpeg-utils';

export { PngBlendMode } from './formats/png/png-blend-mode';
export { PngColorType } from './formats/png/png-color-type';
export { PngDisposeMode } from './formats/png/png-dispose-mode';
export { PngFilterType } from './formats/png/png-filter-type';
export { PngFrame, PngFrameInitOptions } from './formats/png/png-frame';
export { PngInfo, PngInfoInitOptions } from './formats/png/png-info';

export { PnmFormat } from './formats/pnm/pnm-format';
export { PnmInfo } from './formats/pnm/pnm-info';

export { TgaImageType, TgaImageTypeLength } from './formats/tga/tga-image-type';
export { TgaInfo, TgaInfoInitOptions } from './formats/tga/tga-info';

export { TiffBitReader } from './formats/tiff/tiff-bit-reader';
export { TiffCompression } from './formats/tiff/tiff-compression';
export { TiffEntry, TiffEntryInitOptions } from './formats/tiff/tiff-entry';
export {
  TiffFaxDecoder,
  TiffFaxDecoderInitOptions,
} from './formats/tiff/tiff-fax-decoder';
export { TiffFormat } from './formats/tiff/tiff-format';
export { TiffImageType } from './formats/tiff/tiff-image-type';
export { TiffImage } from './formats/tiff/tiff-image';
export { TiffInfo, TiffInfoInitOptions } from './formats/tiff/tiff-info';
export { LzwDecoder } from './formats/tiff/tiff-lzw-decoder';
export {
  TiffPhotometricType,
  TiffPhotometricTypeLength,
} from './formats/tiff/tiff-photometric-type';

export { VP8BandProbas } from './formats/webp/vp8-band-probas';
export { VP8BitReader } from './formats/webp/vp8-bit-reader';
export { VP8FInfo } from './formats/webp/vp8-f-info';
export { VP8FilterHeader } from './formats/webp/vp8-filter-header';
export { VP8Filter } from './formats/webp/vp8-filter';
export { VP8FrameHeader } from './formats/webp/vp8-frame-header';
export { VP8MBData } from './formats/webp/vp8-mb-data';
export { VP8MB } from './formats/webp/vp8-mb';
export { VP8PictureHeader } from './formats/webp/vp8-picture-header';
export { VP8Proba } from './formats/webp/vp8-proba';
export { VP8QuantMatrix } from './formats/webp/vp8-quant-matrix';
export { VP8Random } from './formats/webp/vp8-random';
export { VP8SegmentHeader } from './formats/webp/vp8-segment-header';
export { VP8TopSamples } from './formats/webp/vp8-top-samples';
export { VP8 } from './formats/webp/vp8';
export { VP8LBitReader } from './formats/webp/vp8l-bit-reader';
export { VP8LColorCache } from './formats/webp/vp8l-color-cache';
export { VP8LImageTransformType } from './formats/webp/vp8l-image-transform-type';
export { VP8LInternal } from './formats/webp/vp8l-internal';
export { VP8LMultipliers } from './formats/webp/vp8l-multipliers';
export { VP8LTransform } from './formats/webp/vp8l-transform';
export { VP8L } from './formats/webp/vp8l';
export { WebPAlpha } from './formats/webp/webp-alpha';
export { WebPFilters } from './formats/webp/webp-filters';
export { WebPFormat } from './formats/webp/webp-format';
export { WebPFrame } from './formats/webp/webp-frame';
export { HuffmanTreeGroup } from './formats/webp/webp-huffman-tree-group';
export { HuffmanTree } from './formats/webp/webp-huffman-tree';
export { WebPInfoInternal } from './formats/webp/webp-info-internal';
export { WebPInfo } from './formats/webp/webp-info';

export { BmpDecoder } from './formats/bmp-decoder';
export { BmpEncoder } from './formats/bmp-encoder';
export { DecodeInfo } from './formats/decode-info';
export { Decoder, DecoderDecodeOptions } from './formats/decoder';
export { DibDecoder } from './formats/dib-decoder';
export { Encoder, EncoderEncodeOptions } from './formats/encoder';
export { GifDecoder } from './formats/gif-decoder';
export { GifEncoder, GifEncoderInitOptions } from './formats/gif-encoder';
export { IcoDecoder } from './formats/ico-decoder';
export { IcoEncoder } from './formats/ico-encoder';
export { JpegDecoder } from './formats/jpeg-decoder';
export {
  JpegChroma,
  JpegEncoder,
  JpegEncoderEncodeOptions,
} from './formats/jpeg-encoder';
export { PngDecoder } from './formats/png-decoder';
export { PngEncoder, PngEncoderInitOptions } from './formats/png-encoder';
export { PnmDecoder } from './formats/pnm-decoder';
export { TgaDecoder } from './formats/tga-decoder';
export { TgaEncoder } from './formats/tga-encoder';
export { TiffDecoder } from './formats/tiff-decoder';
export { TiffEncoder } from './formats/tiff-encoder';
export { WebPDecoder } from './formats/webp-decoder';
export { WinEncoder } from './formats/win-encoder';

// Export types from 'image' directory
export { FrameType } from './image/frame-type';
export { HeapNode } from './image/heap-node';
export { IccProfile } from './image/icc-profile';
export { IccProfileCompression } from './image/icc-profile-compression';
export { MemoryImageDataFloat16 } from './image/image-data-float16';
export { MemoryImageDataFloat32 } from './image/image-data-float32';
export { MemoryImageDataFloat64 } from './image/image-data-float64';
export { MemoryImageDataInt8 } from './image/image-data-int8';
export { MemoryImageDataInt16 } from './image/image-data-int16';
export { MemoryImageDataInt32 } from './image/image-data-int32';
export { MemoryImageDataUint1 } from './image/image-data-uint1';
export { MemoryImageDataUint2 } from './image/image-data-uint2';
export { MemoryImageDataUint4 } from './image/image-data-uint4';
export { MemoryImageDataUint8 } from './image/image-data-uint8';
export { MemoryImageDataUint16 } from './image/image-data-uint16';
export { MemoryImageDataUint32 } from './image/image-data-uint32';
export {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
} from './image/image-data';
export { ImageUtils } from './image/image-utils';
export {
  MemoryImage,
  MemoryImageCloneOptions,
  MemoryImageColorExtremes,
  MemoryImageConvertOptions,
  MemoryImageCreateOptions,
  MemoryImageFromBytesOptions,
} from './image/image';
export { NeuralQuantizer } from './image/neural-quantizer';
export { OctreeNode } from './image/octree-node';
export { OctreeQuantizer } from './image/octree-quantizer';
export { PaletteFloat16 } from './image/palette-float16';
export { PaletteFloat32 } from './image/palette-float32';
export { PaletteFloat64 } from './image/palette-float64';
export { PaletteInt8 } from './image/palette-int8';
export { PaletteInt16 } from './image/palette-int16';
export { PaletteInt32 } from './image/palette-int32';
export { PaletteUint8 } from './image/palette-uint8';
export { PaletteUint16 } from './image/palette-uint16';
export { PaletteUint32 } from './image/palette-uint32';
export { Palette } from './image/palette';
export { PixelFloat16 } from './image/pixel-float16';
export { PixelFloat32 } from './image/pixel-float32';
export { PixelFloat64 } from './image/pixel-float64';
export { PixelInt8 } from './image/pixel-int8';
export { PixelInt16 } from './image/pixel-int16';
export { PixelInt32 } from './image/pixel-int32';
export { PixelUint1 } from './image/pixel-uint1';
export { PixelUint2 } from './image/pixel-uint2';
export { PixelUint4 } from './image/pixel-uint4';
export { PixelUint8 } from './image/pixel-uint8';
export { PixelUint16 } from './image/pixel-uint16';
export { PixelUint32 } from './image/pixel-uint32';
export { PixelUndefined } from './image/pixel-undefined';
export { PixelRangeIterator } from './image/pixel-range-iterator';
export { Pixel, UndefinedPixel } from './image/pixel';
export { QuantizerType } from './image/quantizer-type';
export { Quantizer } from './image/quantizer';

// Export types from 'transform' directory
export { ExpandCanvasPosition } from './transform/expand-canvas-position';
export { FlipDirection } from './transform/flip-direction';
export {
  Transform,
  CopyCropCircleOptions,
  CopyCropOptions,
  CopyExpandCanvasOptions,
  CopyRectifyOptions,
  CopyResizeCropSquareOptions,
  CopyResizeOptionsUsingHeight,
  CopyResizeOptionsUsingWidth,
  CopyRotateOptions,
  FlipOptions,
  TransformOptions,
  TrimOptions,
} from './transform/transform';
export { TrimMode } from './transform/trim-mode';
export { TrimSide } from './transform/trim-side';

// In-place exports
export interface DecodeOptions {
  data: TypedArray;
}

export interface DecodeImageOptions extends DecodeOptions {
  frameIndex?: number;
  largest?: boolean;
}

export interface DecodeImageByMimeTypeOptions extends DecodeImageOptions {
  mimeType: string;
}

export interface DecodeNamedImageOptions extends DecodeImageOptions {
  name: string;
}

export interface EncodeOptions {
  image: MemoryImage;
}

export interface EncodeImageByMimeTypeOptions extends EncodeOptions {
  mimeType: string;
}

export interface EncodeNamedImageOptions extends EncodeOptions {
  name: string;
}

export interface EncodeJpgOptions extends EncodeOptions {
  quality?: number;
  chroma?: JpegChroma;
}

export interface InjectJpgExifOptions extends DecodeOptions {
  exifData: ExifData;
}

export interface EncodeAnimatedOptions extends EncodeOptions {
  singleFrame?: boolean;
}

export interface EncodePngOptions extends EncodeAnimatedOptions {
  level?: CompressionLevel;
  filter?: PngFilterType;
}

export interface EncodeGifOptions extends EncodeAnimatedOptions {
  repeat?: number;
  samplingFactor?: number;
  dither?: DitherKernel;
  ditherSerpentine?: boolean;
}

export interface EncodeIcoImagesOptions {
  images: MemoryImage[];
}

/**
 * Return the Decoder that can decode image of the given **mimeType**.
 */
export function findDecoderForMimeType(mimeType: string): Decoder | undefined {
  const type = mimeType.toLowerCase();
  switch (type) {
    case 'image/jpeg':
      return new JpegDecoder();
    case 'image/png':
      return new PngDecoder();
    case 'image/x-targa':
    case 'image/x-tga':
      return new TgaDecoder();
    case 'image/webp':
      return new WebPDecoder();
    case 'image/gif':
      return new GifDecoder();
    case 'image/tiff':
    case 'image/tiff-fx':
      return new TiffDecoder();
    case 'image/bmp':
    case 'image/x-bmp':
      return new BmpDecoder();
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return new IcoDecoder();
    case 'image/x-portable-bitmap':
    case 'image/x-portable-pixmap':
    case 'image/x-portable-anymap':
      return new PnmDecoder();
    default:
      return undefined;
  }
}

/**
 * Return the Decoder that can decode image with the given **name**,
 * by looking at the file extension.
 */
export function findDecoderForNamedImage(name: string): Decoder | undefined {
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
  if (n.endsWith('.webp')) {
    return new WebPDecoder();
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
  if (
    n.endsWith('.pnm') ||
    n.endsWith('.pbm') ||
    n.endsWith('.pgm') ||
    n.endsWith('.ppm')
  ) {
    return new PnmDecoder();
  }
  return undefined;
}

/**
 * Return the Encoder that can encode image with the given **mimeType**.
 */
export function findEncoderForMimeType(mimeType: string): Encoder | undefined {
  const type = mimeType.toLowerCase();
  switch (type) {
    case 'image/jpeg':
      return new JpegEncoder();
    case 'image/png':
      return new PngEncoder();
    case 'image/x-targa':
    case 'image/x-tga':
      return new TgaEncoder();
    case 'image/gif':
      return new GifEncoder();
    case 'image/tiff':
    case 'image/tiff-fx':
      return new TiffEncoder();
    case 'image/bmp':
    case 'image/x-bmp':
      return new BmpEncoder();
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return new IcoEncoder();
    default:
      return undefined;
  }
}

/**
 * Return the Encoder that can encode image with the given **name**,
 * by looking at the file extension.
 */
export function findEncoderForNamedImage(name: string): Encoder | undefined {
  const n = name.toLowerCase();
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) {
    return new JpegEncoder();
  }
  if (n.endsWith('.png')) {
    return new PngEncoder();
  }
  if (n.endsWith('.tga')) {
    return new TgaEncoder();
  }
  if (n.endsWith('.gif')) {
    return new GifEncoder();
  }
  if (n.endsWith('.tif') || n.endsWith('.tiff')) {
    return new TiffEncoder();
  }
  if (n.endsWith('.bmp')) {
    return new BmpEncoder();
  }
  if (n.endsWith('.ico')) {
    return new IcoEncoder();
  }
  if (n.endsWith('.cur')) {
    return new IcoEncoder();
  }
  return undefined;
}

/**
 * Find a Decoder that is able to decode the given image **data**.
 * Use this is you don't know the type of image it is.
 *
 * **WARNING:** Since this will check the image data against all known decoders,
 * it is much slower than using an explicit decoder.
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

  const webp = new WebPDecoder();
  if (webp.isValidFile(bytes)) {
    return webp;
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

  const pnm = new PnmDecoder();
  if (pnm.isValidFile(bytes)) {
    return pnm;
  }

  return undefined;
}

/**
 * Decode the given image file bytes by first identifying the format of the
 * file and using that decoder to decode the file into a single frame MemoryImage.
 *
 * **WARNING:** Since this will check the image data against all known decoders,
 * it is much slower than using an explicit decoder.
 */
export function decodeImage(opt: DecodeImageOptions): MemoryImage | undefined {
  const decoder = findDecoderForData(opt.data);
  if (decoder === undefined) {
    return undefined;
  }
  const dataUint8 = new Uint8Array(opt.data);
  if (opt.largest === true && decoder instanceof IcoDecoder) {
    return decoder.decodeImageLargest(dataUint8);
  }
  return decoder.decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Decodes the given image file bytes, using the MIME type to
 * determine the decoder.
 */
export function decodeImageByMimeType(
  opt: DecodeImageByMimeTypeOptions
): MemoryImage | undefined {
  const decoder = findDecoderForMimeType(opt.mimeType);
  if (decoder !== undefined) {
    const dataUint8 = new Uint8Array(opt.data);
    if (opt.largest === true && decoder instanceof IcoDecoder) {
      return decoder.decodeImageLargest(dataUint8);
    }
    return decoder.decode({
      bytes: dataUint8,
      frameIndex: opt.frameIndex,
    });
  }
  return decodeImage(opt);
}

/**
 * Decodes the given image file bytes, using the filename extension to
 * determine the decoder.
 */
export function decodeNamedImage(
  opt: DecodeNamedImageOptions
): MemoryImage | undefined {
  const decoder = findDecoderForNamedImage(opt.name);
  if (decoder !== undefined) {
    const dataUint8 = new Uint8Array(opt.data);
    if (opt.largest === true && decoder instanceof IcoDecoder) {
      return decoder.decodeImageLargest(dataUint8);
    }
    return decoder.decode({
      bytes: dataUint8,
      frameIndex: opt.frameIndex,
    });
  }
  return decodeImage(opt);
}

/**
 * Encode the MemoryImage to the format determined by the MIME type.
 * If a format wasn't able to be identified, undefined will be returned.
 * Otherwise the encoded format bytes of the image will be returned.
 */
export function encodeImageByMimeType(
  opt: EncodeImageByMimeTypeOptions
): Uint8Array | undefined {
  const encoder = findEncoderForMimeType(opt.mimeType);
  if (encoder === undefined) {
    return undefined;
  }
  return encoder.encode({
    image: opt.image,
  });
}

/**
 * Encode the MemoryImage to the format determined by the file extension of **name**.
 * If a format wasn't able to be identified, undefined will be returned.
 * Otherwise the encoded format bytes of the image will be returned.
 */
export function encodeNamedImage(
  opt: EncodeNamedImageOptions
): Uint8Array | undefined {
  const encoder = findEncoderForNamedImage(opt.name);
  if (encoder === undefined) {
    return undefined;
  }
  return encoder.encode({
    image: opt.image,
  });
}

/**
 * Decode a JPG formatted image.
 */
export function decodeJpg(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new JpegDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Encode an image to the JPEG format.
 */
export function encodeJpg(opt: EncodeJpgOptions): Uint8Array {
  const quality = opt.quality ?? 100;
  const chroma = opt.chroma ?? JpegChroma.yuv444;
  return new JpegEncoder(quality).encode({
    image: opt.image,
    chroma: chroma,
  });
}

/**
 * Decode only the ExifData from a JPEG file, returning undefined if it was
 * unable to.
 */
export function decodeJpgExif(opt: DecodeOptions): ExifData | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new JpegUtils().decodeExif(dataUint8);
}

/**
 * Inject ExifData into a JPEG file, replacing any existing EXIF data.
 * The new JPEG file bytes will be returned, otherwise undefined if there was an
 * issue.
 */
export function injectJpgExif(
  opt: InjectJpgExifOptions
): Uint8Array | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new JpegUtils().injectExif(opt.exifData, dataUint8);
}

/**
 * Decode a PNG formatted image.
 */
export function decodePng(opt: DecodeImageOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new PngDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the PNG format.
 */
export function encodePng(opt: EncodePngOptions): Uint8Array {
  const singleFrame = opt.singleFrame ?? false;
  const level = opt.level ?? 6;
  const filter = opt.filter ?? PngFilterType.paeth;
  return new PngEncoder({
    filter: filter,
    level: level,
  }).encode({
    image: opt.image,
    singleFrame: singleFrame,
  });
}

/**
 * Decode a PNM formatted image.
 */
export function decodePnm(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new PnmDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Decode a Targa formatted image.
 */
export function decodeTga(opt: DecodeImageOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new TgaDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the Targa format.
 */
export function encodeTga(opt: EncodeOptions): Uint8Array {
  return new TgaEncoder().encode({
    image: opt.image,
  });
}

/**
 * Decode a WebP formatted image
 */
export function decodeWebP(opt: DecodeImageOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new WebPDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Decode a GIF formatted image (first frame for animations).
 */
export function decodeGif(opt: DecodeImageOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new GifDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the GIF format.
 *
 * The **samplingFactor** specifies the sampling factor for
 * image quantization. It is responsible for reducing
 * the amount of unique colors in your images to 256.
 * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
 * a sampling factor of 10 gives you a reasonable trade-off between
 * image quality and quantization speed.
 * If you know that you have less than 256 colors in your frames
 * anyway, you should supply a very large **samplingFactor** for maximum performance.
 */
export function encodeGif(opt: EncodeGifOptions): Uint8Array {
  const singleFrame = opt.singleFrame ?? false;
  const repeat = opt.repeat ?? 0;
  const samplingFactor = opt.samplingFactor ?? 10;
  const dither = opt.dither ?? DitherKernel.floydSteinberg;
  const ditherSerpentine = opt.ditherSerpentine ?? false;
  return new GifEncoder({
    repeat: repeat,
    samplingFactor: samplingFactor,
    dither: dither,
    ditherSerpentine: ditherSerpentine,
  }).encode({
    image: opt.image,
    singleFrame: singleFrame,
  });
}

/**
 * Decode a TIFF formatted image.
 */
export function decodeTiff(opt: DecodeImageOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new TiffDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the TIFF format.
 */
export function encodeTiff(opt: EncodeAnimatedOptions): Uint8Array {
  const singleFrame = opt.singleFrame ?? false;
  return new TiffEncoder().encode({
    image: opt.image,
    singleFrame: singleFrame,
  });
}

/**
 * Decode a BMP formatted image.
 */
export function decodeBmp(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new BmpDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Encode an image to the BMP format.
 */
export function encodeBmp(opt: EncodeOptions): Uint8Array {
  return new BmpEncoder().encode({
    image: opt.image,
  });
}

/**
 * Decode an ICO image.
 */
export function decodeIco(opt: DecodeImageOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new IcoDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the ICO format.
 */
export function encodeIco(opt: EncodeAnimatedOptions): Uint8Array {
  const singleFrame = opt.singleFrame ?? false;
  return new IcoEncoder().encode({
    image: opt.image,
    singleFrame: singleFrame,
  });
}

/**
 * Encode a list of images to the ICO format.
 */
export function encodeIcoImages(opt: EncodeIcoImagesOptions): Uint8Array {
  return new IcoEncoder().encodeImages(opt.images);
}
