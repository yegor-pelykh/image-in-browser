/** @format */

import { CompressionLevel, TypedArray } from './common/typings.js';
import { BmpDecoder } from './formats/bmp-decoder.js';
import { BmpEncoder } from './formats/bmp-encoder.js';
import { Encoder } from './formats/encoder.js';
import { Decoder } from './formats/decoder.js';
import { GifDecoder } from './formats/gif-decoder.js';
import { GifEncoder } from './formats/gif-encoder.js';
import { IcoDecoder } from './formats/ico-decoder.js';
import { IcoEncoder } from './formats/ico-encoder.js';
import { JpegDecoder } from './formats/jpeg-decoder.js';
import { JpegChroma, JpegEncoder } from './formats/jpeg-encoder.js';
import { PngDecoder } from './formats/png-decoder.js';
import { PngEncoder } from './formats/png-encoder.js';
import { TgaDecoder } from './formats/tga-decoder.js';
import { TgaEncoder } from './formats/tga-encoder.js';
import { TiffDecoder } from './formats/tiff-decoder.js';
import { TiffEncoder } from './formats/tiff-encoder.js';
import { MemoryImage } from './image/image.js';
import { PngFilterType } from './formats/png/png-filter-type.js';
import { DitherKernel } from './filter/dither-kernel.js';
import { ExifData } from './exif/exif-data.js';
import { JpegUtils } from './formats/jpeg/jpeg-utils.js';
import { WebPDecoder } from './formats/webp-decoder.js';
import { PnmDecoder } from './formats/pnm-decoder.js';
import { ImageFormat } from './formats/image-format.js';
import { PsdDecoder } from './formats/psd-decoder.js';
import { PvrEncoder } from './formats/pvr-encoder.js';
import { PvrDecoder } from './formats/pvr-decoder.js';

// Export types from 'color' directory
export { ChannelOrder, ChannelOrderLength } from './color/channel-order.js';
export { Channel } from './color/channel.js';
export { ColorFloat16 } from './color/color-float16.js';
export { ColorFloat32 } from './color/color-float32.js';
export { ColorFloat64 } from './color/color-float64.js';
export { ColorInt8 } from './color/color-int8.js';
export { ColorInt16 } from './color/color-int16.js';
export { ColorInt32 } from './color/color-int32.js';
export { ColorRgb8 } from './color/color-rgb8.js';
export { ColorRgba8 } from './color/color-rgba8.js';
export { ColorUint1 } from './color/color-uint1.js';
export { ColorUint2 } from './color/color-uint2.js';
export { ColorUint4 } from './color/color-uint4.js';
export { ColorUint8 } from './color/color-uint8.js';
export { ColorUint16 } from './color/color-uint16.js';
export { ColorUint32 } from './color/color-uint32.js';
export { Color, ColorConvertOptions } from './color/color.js';
export {
  Format,
  FormatType,
  FormatMaxValue,
  FormatSize,
  FormatToFormatType,
  getRowStride,
  convertFormatValue,
} from './color/format.js';
export { ColorUtils, ConvertColorOptions } from './color/color-utils.js';

// Export types from 'common' directory
export { ArrayUtils } from './common/array-utils.js';
export { BitUtils } from './common/bit-utils.js';
export { Crc32, Crc32Options } from './common/crc32.js';
export { Float16 } from './common/float16.js';
export { InputBuffer, InputBufferInitOptions } from './common/input-buffer.js';
export { Interpolation } from './common/interpolation.js';
export { Line } from './common/line.js';
export { MathUtils } from './common/math-utils.js';
export {
  OutputBuffer,
  OutputBufferInitOptions,
} from './common/output-buffer.js';
export { Point } from './common/point.js';
export { RandomUtils } from './common/random-utils.js';
export { Rational } from './common/rational.js';
export { Rectangle } from './common/rectangle.js';
export { StringUtils } from './common/string-utils.js';
export {
  BufferEncoding,
  CompressionLevel,
  TypedArray,
} from './common/typings.js';

// Export types from 'draw' directory
export { BlendMode } from './draw/blend-mode.js';
export { CircleQuadrant } from './draw/circle-quadrant.js';
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
} from './draw/draw.js';

// Export types from 'error' directory
export { LibError } from './error/lib-error.js';

// Export types from 'exif' directory
export { IfdAsciiValue } from './exif/ifd-value/ifd-ascii-value.js';
export { IfdByteValue } from './exif/ifd-value/ifd-byte-value.js';
export { IfdDoubleValue } from './exif/ifd-value/ifd-double-value.js';
export { IfdLongValue } from './exif/ifd-value/ifd-long-value.js';
export { IfdRationalValue } from './exif/ifd-value/ifd-rational-value.js';
export { IfdSByteValue } from './exif/ifd-value/ifd-sbyte-value.js';
export { IfdShortValue } from './exif/ifd-value/ifd-short-value.js';
export { IfdSingleValue } from './exif/ifd-value/ifd-single-value.js';
export { IfdSLongValue } from './exif/ifd-value/ifd-slong-value.js';
export { IfdSRationalValue } from './exif/ifd-value/ifd-srational-value.js';
export { IfdSShortValue } from './exif/ifd-value/ifd-sshort-value.js';
export { IfdUndefinedValue } from './exif/ifd-value/ifd-undefined-value.js';
export { IfdValue } from './exif/ifd-value/ifd-value.js';
export { ExifData } from './exif/exif-data.js';
export { ExifEntry } from './exif/exif-entry.js';
export {
  ExifTag,
  ExifTagInitOptions,
  ExifGpsTags,
  ExifImageTags,
  ExifInteropTags,
  ExifTagNameToID,
} from './exif/exif-tag.js';
export { IfdContainer } from './exif/ifd-container.js';
export { IfdDirectory } from './exif/ifd-directory.js';
export {
  IfdValueType,
  IfdValueTypeSize,
  getIfdValueTypeSize,
  getIfdValueTypeString,
} from './exif/ifd-value-type.js';

// Export types from 'filter' directory
export { ContrastMode } from './filter/contrast-mode.js';
export { DitherKernel, DitherKernels } from './filter/dither-kernel.js';
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
  SolarizeOptions,
  StretchDistortionOptions,
  VignetteOptions,
} from './filter/filter.js';
export { NoiseType } from './filter/noise-type.js';
export { PixelateMode } from './filter/pixelate-mode.js';
export { QuantizeMethod } from './filter/quantize-method.js';
export {
  SeparableKernel,
  SeparableKernelApplyOptions,
} from './filter/separable-kernel.js';
export { SolarizeMode } from './filter/solarize-mode.js';

// Export types from 'formats' directory
export { BmpCompressionMode } from './formats/bmp/bmp-compression-mode.js';
export { BmpFileHeader } from './formats/bmp/bmp-file-header.js';
export { BmpInfo } from './formats/bmp/bmp-info.js';

export { GifColorMap } from './formats/gif/gif-color-map.js';
export { GifImageDesc } from './formats/gif/gif-image-desc.js';
export { GifInfo, GifInfoInitOptions } from './formats/gif/gif-info.js';

export { IcoBmpInfo } from './formats/ico/ico-bmp-info.js';
export {
  IcoInfoImage,
  IcoInfoImageInitOptions,
} from './formats/ico/ico-info-image.js';
export { IcoInfo } from './formats/ico/ico-info.js';
export { IcoType, IcoTypeLength } from './formats/ico/ico-type.js';

export { HuffmanNode } from './formats/jpeg/huffman-node.js';
export { HuffmanParent } from './formats/jpeg/huffman-parent.js';
export { HuffmanValue } from './formats/jpeg/huffman-value.js';
export { JpegAdobe } from './formats/jpeg/jpeg-adobe.js';
export { JpegComponentData } from './formats/jpeg/jpeg-component-data.js';
export { JpegComponent } from './formats/jpeg/jpeg-component.js';
export { JpegData } from './formats/jpeg/jpeg-data.js';
export { JpegFrame } from './formats/jpeg/jpeg-frame.js';
export { JpegHuffman } from './formats/jpeg/jpeg-huffman.js';
export { JpegInfo } from './formats/jpeg/jpeg-info.js';
export { JpegJfif } from './formats/jpeg/jpeg-jfif.js';
export { JpegMarker } from './formats/jpeg/jpeg-marker.js';
export { JpegQuantize } from './formats/jpeg/jpeg-quantize.js';
export { JpegScan } from './formats/jpeg/jpeg-scan.js';
export { JpegUtils } from './formats/jpeg/jpeg-utils.js';

export { PngBlendMode } from './formats/png/png-blend-mode.js';
export { PngColorType } from './formats/png/png-color-type.js';
export { PngDisposeMode } from './formats/png/png-dispose-mode.js';
export { PngFilterType } from './formats/png/png-filter-type.js';
export { PngFrame, PngFrameInitOptions } from './formats/png/png-frame.js';
export { PngInfo, PngInfoInitOptions } from './formats/png/png-info.js';
export { PngPhysicalPixelDimensions } from './formats/png/png-physical-pixel-dimensions.js';

export { PnmFormat } from './formats/pnm/pnm-format.js';
export { PnmInfo } from './formats/pnm/pnm-info.js';

export {
  PsdBevelEffect,
  PsdBevelEffectOptions,
} from './formats/psd/effect/psd-bevel-effect.js';
export {
  PsdDropShadowEffect,
  PsdDropShadowEffectOptions,
} from './formats/psd/effect/psd-drop-shadow-effect.js';
export {
  PsdEffect,
  PsdEffectOptions,
} from './formats/psd/effect/psd-effect.js';
export {
  PsdInnerGlowEffect,
  PsdInnerGlowEffectOptions,
} from './formats/psd/effect/psd-inner-glow-effect.js';
export {
  PsdInnerShadowEffect,
  PsdInnerShadowEffectOptions,
} from './formats/psd/effect/psd-inner-shadow-effect.js';
export {
  PsdOuterGlowEffect,
  PsdOuterGlowEffectOptions,
} from './formats/psd/effect/psd-outer-glow-effect.js';
export {
  PsdSolidFillEffect,
  PsdSolidFillEffectOptions,
} from './formats/psd/effect/psd-solid-fill-effect.js';
export { PsdLayerDataFactory } from './formats/psd/layer-data/psd-layer-data-factory.js';
export { PsdLayerData } from './formats/psd/layer-data/psd-layer-data.js';
export { PsdLayerAdditionalData } from './formats/psd/layer-data/psd-layer-additional-data.js';
export { PsdLayerSectionDivider } from './formats/psd/layer-data/psd-layer-section-divider.js';
export { PsdBlendMode } from './formats/psd/psd-blend-mode.js';
export { PsdBlendingRanges } from './formats/psd/psd-blending-ranges.js';
export {
  PsdChannel,
  ReadOptions,
  ReadPlaneOptions,
} from './formats/psd/psd-channel.js';
export { PsdColorMode } from './formats/psd/psd-color-mode.js';
export { PsdFlag } from './formats/psd/psd-flag.js';
export { PsdImage } from './formats/psd/psd-image.js';
export { PsdImageResource } from './formats/psd/psd-image-resource.js';
export { PsdLayer } from './formats/psd/psd-layer.js';
export { PsdMask } from './formats/psd/psd-mask.js';

export {
  PvrAppleInfo,
  PvrAppleInfoOptions,
} from './formats/pvr/pvr-apple-info.js';
export { PvrBitUtility } from './formats/pvr/pvr-bit-utility.js';
export { PvrColorBoundingBox } from './formats/pvr/pvr-color-bounding-box.js';
export { PvrColorRgb } from './formats/pvr/pvr-color-rgb.js';
export { PvrColorRgbCore } from './formats/pvr/pvr-color-rgb-core.js';
export { PvrColorRgba } from './formats/pvr/pvr-color-rgba.js';
export { PvrFormat } from './formats/pvr/pvr-format.js';
export { PvrPacket } from './formats/pvr/pvr-packet.js';
export { Pvr2Info, Pvr2InfoOptions } from './formats/pvr/pvr2-info.js';
export { Pvr3Info, Pvr3InfoOptions } from './formats/pvr/pvr3-info.js';

export {
  TgaImageType,
  TgaImageTypeLength,
} from './formats/tga/tga-image-type.js';
export { TgaInfo, TgaInfoInitOptions } from './formats/tga/tga-info.js';

export { TiffBitReader } from './formats/tiff/tiff-bit-reader.js';
export { TiffCompression } from './formats/tiff/tiff-compression.js';
export { TiffEntry, TiffEntryInitOptions } from './formats/tiff/tiff-entry.js';
export {
  TiffFaxDecoder,
  TiffFaxDecoderInitOptions,
} from './formats/tiff/tiff-fax-decoder.js';
export { TiffFormat } from './formats/tiff/tiff-format.js';
export { TiffImageType } from './formats/tiff/tiff-image-type.js';
export { TiffImage } from './formats/tiff/tiff-image.js';
export { TiffInfo, TiffInfoInitOptions } from './formats/tiff/tiff-info.js';
export { LzwDecoder } from './formats/tiff/tiff-lzw-decoder.js';
export {
  TiffPhotometricType,
  TiffPhotometricTypeLength,
} from './formats/tiff/tiff-photometric-type.js';

export { VP8BandProbas } from './formats/webp/vp8-band-probas.js';
export { VP8BitReader } from './formats/webp/vp8-bit-reader.js';
export { VP8FInfo } from './formats/webp/vp8-f-info.js';
export { VP8FilterHeader } from './formats/webp/vp8-filter-header.js';
export { VP8Filter } from './formats/webp/vp8-filter.js';
export { VP8FrameHeader } from './formats/webp/vp8-frame-header.js';
export { VP8MBData } from './formats/webp/vp8-mb-data.js';
export { VP8MB } from './formats/webp/vp8-mb.js';
export { VP8PictureHeader } from './formats/webp/vp8-picture-header.js';
export { VP8Proba } from './formats/webp/vp8-proba.js';
export { VP8QuantMatrix } from './formats/webp/vp8-quant-matrix.js';
export { VP8Random } from './formats/webp/vp8-random.js';
export { VP8SegmentHeader } from './formats/webp/vp8-segment-header.js';
export { VP8TopSamples } from './formats/webp/vp8-top-samples.js';
export { VP8 } from './formats/webp/vp8.js';
export { VP8LBitReader } from './formats/webp/vp8l-bit-reader.js';
export { VP8LColorCache } from './formats/webp/vp8l-color-cache.js';
export { VP8LImageTransformType } from './formats/webp/vp8l-image-transform-type.js';
export { VP8LInternal } from './formats/webp/vp8l-internal.js';
export { VP8LMultipliers } from './formats/webp/vp8l-multipliers.js';
export { VP8LTransform } from './formats/webp/vp8l-transform.js';
export { VP8L } from './formats/webp/vp8l.js';
export { WebPAlpha } from './formats/webp/webp-alpha.js';
export { WebPFilters } from './formats/webp/webp-filters.js';
export { WebPFormat } from './formats/webp/webp-format.js';
export { WebPFrame } from './formats/webp/webp-frame.js';
export { HuffmanTreeGroup } from './formats/webp/webp-huffman-tree-group.js';
export { HuffmanTree } from './formats/webp/webp-huffman-tree.js';
export { WebPInfoInternal } from './formats/webp/webp-info-internal.js';
export { WebPInfo } from './formats/webp/webp-info.js';

export { BmpDecoder } from './formats/bmp-decoder.js';
export { BmpEncoder } from './formats/bmp-encoder.js';
export { DecodeInfo } from './formats/decode-info.js';
export { Decoder, DecoderDecodeOptions } from './formats/decoder.js';
export { DibDecoder } from './formats/dib-decoder.js';
export { Encoder, EncoderEncodeOptions } from './formats/encoder.js';
export { GifDecoder } from './formats/gif-decoder.js';
export { GifEncoder, GifEncoderInitOptions } from './formats/gif-encoder.js';
export { IcoDecoder } from './formats/ico-decoder.js';
export { IcoEncoder } from './formats/ico-encoder.js';
export { ImageFormat } from './formats/image-format.js';
export { JpegDecoder } from './formats/jpeg-decoder.js';
export {
  JpegChroma,
  JpegEncoder,
  JpegEncoderEncodeOptions,
} from './formats/jpeg-encoder.js';
export { PngDecoder } from './formats/png-decoder.js';
export { PngEncoder, PngEncoderInitOptions } from './formats/png-encoder.js';
export { PnmDecoder } from './formats/pnm-decoder.js';
export { PsdDecoder } from './formats/psd-decoder.js';
export { PvrDecoder } from './formats/pvr-decoder.js';
export { PvrEncoder } from './formats/pvr-encoder.js';
export { TgaDecoder } from './formats/tga-decoder.js';
export { TgaEncoder } from './formats/tga-encoder.js';
export { TiffDecoder } from './formats/tiff-decoder.js';
export { TiffEncoder } from './formats/tiff-encoder.js';
export { WebPDecoder } from './formats/webp-decoder.js';
export { WinEncoder } from './formats/win-encoder.js';

// Export types from 'image' directory
export { BinaryQuantizer } from './image/binary-quantizer.js';
export { FrameType } from './image/frame-type.js';
export { HeapNode } from './image/heap-node.js';
export { IccProfile } from './image/icc-profile.js';
export { IccProfileCompression } from './image/icc-profile-compression.js';
export { MemoryImageDataFloat16 } from './image/image-data-float16.js';
export { MemoryImageDataFloat32 } from './image/image-data-float32.js';
export { MemoryImageDataFloat64 } from './image/image-data-float64.js';
export { MemoryImageDataInt8 } from './image/image-data-int8.js';
export { MemoryImageDataInt16 } from './image/image-data-int16.js';
export { MemoryImageDataInt32 } from './image/image-data-int32.js';
export { MemoryImageDataUint1 } from './image/image-data-uint1.js';
export { MemoryImageDataUint2 } from './image/image-data-uint2.js';
export { MemoryImageDataUint4 } from './image/image-data-uint4.js';
export { MemoryImageDataUint8 } from './image/image-data-uint8.js';
export { MemoryImageDataUint16 } from './image/image-data-uint16.js';
export { MemoryImageDataUint32 } from './image/image-data-uint32.js';
export {
  MemoryImageData,
  MemoryImageDataGetBytesOptions,
} from './image/image-data.js';
export { ImageUtils } from './image/image-utils.js';
export {
  MemoryImage,
  MemoryImageCloneOptions,
  MemoryImageColorExtremes,
  MemoryImageConvertOptions,
  MemoryImageCreateOptions,
  MemoryImageFromBytesOptions,
} from './image/image.js';
export { NeuralQuantizer } from './image/neural-quantizer.js';
export { OctreeNode } from './image/octree-node.js';
export { OctreeQuantizer } from './image/octree-quantizer.js';
export { PaletteFloat16 } from './image/palette-float16.js';
export { PaletteFloat32 } from './image/palette-float32.js';
export { PaletteFloat64 } from './image/palette-float64.js';
export { PaletteInt8 } from './image/palette-int8.js';
export { PaletteInt16 } from './image/palette-int16.js';
export { PaletteInt32 } from './image/palette-int32.js';
export { PaletteUint8 } from './image/palette-uint8.js';
export { PaletteUint16 } from './image/palette-uint16.js';
export { PaletteUint32 } from './image/palette-uint32.js';
export { Palette } from './image/palette.js';
export { PixelFloat16 } from './image/pixel-float16.js';
export { PixelFloat32 } from './image/pixel-float32.js';
export { PixelFloat64 } from './image/pixel-float64.js';
export { PixelInt8 } from './image/pixel-int8.js';
export { PixelInt16 } from './image/pixel-int16.js';
export { PixelInt32 } from './image/pixel-int32.js';
export { PixelUint1 } from './image/pixel-uint1.js';
export { PixelUint2 } from './image/pixel-uint2.js';
export { PixelUint4 } from './image/pixel-uint4.js';
export { PixelUint8 } from './image/pixel-uint8.js';
export { PixelUint16 } from './image/pixel-uint16.js';
export { PixelUint32 } from './image/pixel-uint32.js';
export { PixelUndefined } from './image/pixel-undefined.js';
export { PixelRangeIterator } from './image/pixel-range-iterator.js';
export { Pixel, UndefinedPixel } from './image/pixel.js';
export { QuantizerType } from './image/quantizer-type.js';
export { Quantizer } from './image/quantizer.js';

// Export types from 'transform' directory
export { ExpandCanvasPosition } from './transform/expand-canvas-position.js';
export { FlipDirection } from './transform/flip-direction.js';
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
} from './transform/transform.js';
export { TrimMode } from './transform/trim-mode.js';
export { TrimSide } from './transform/trim-side.js';

// In-place exports

/**
 * Interface representing options for decoding.
 */
export interface DecodeOptions {
  /**
   * The data to be decoded.
   */
  data: TypedArray;
}

/**
 * Interface representing options for decoding multiple frames.
 */
export interface DecodeMultiframeOptions extends DecodeOptions {
  /**
   * The index of the frame to decode.
   */
  frameIndex?: number;
}

/**
 * Interface representing options for decoding the largest image.
 */
export interface DecodeImageLargestOptions extends DecodeMultiframeOptions {
  /**
   * Whether to decode the largest image.
   */
  largest?: boolean;
}

/**
 * Interface representing options for decoding an image by MIME type.
 */
export interface DecodeImageByMimeTypeOptions
  extends DecodeImageLargestOptions {
  /**
   * The MIME type of the image to decode.
   */
  mimeType: string;
}

/**
 * Interface representing options for decoding a named image.
 */
export interface DecodeNamedImageOptions extends DecodeImageLargestOptions {
  /**
   * The name of the image to decode.
   */
  name: string;
}

/**
 * Interface representing options for encoding.
 */
export interface EncodeOptions {
  /**
   * The image to be encoded.
   */
  image: MemoryImage;

  /**
   * Determines if EXIF metadata should be skipped during encoding.
   * - true: EXIF metadata will be skipped.
   * - false or undefined: EXIF metadata will be included in the encoded image.
   */
  skipExif?: boolean;
}

/**
 * Interface representing options for encoding an image by MIME type.
 */
export interface EncodeImageByMimeTypeOptions extends EncodeOptions {
  /**
   * The MIME type of the image to encode.
   */
  mimeType: string;
}

/**
 * Interface representing options for encoding a named image.
 */
export interface EncodeNamedImageOptions extends EncodeOptions {
  /**
   * The name of the image to encode.
   */
  name: string;
}

/**
 * Interface representing options for encoding a JPG image.
 */
export interface EncodeJpgOptions extends EncodeOptions {
  /**
   * The quality of the JPG image.
   */
  quality?: number;
  /**
   * The chroma subsampling of the JPG image.
   */
  chroma?: JpegChroma;
}

/**
 * Interface representing options for injecting EXIF data into a JPG image.
 */
export interface InjectJpgExifOptions extends DecodeOptions {
  /**
   * The EXIF data to inject.
   */
  exifData: ExifData;
}

/**
 * Interface representing options for encoding an animated image.
 */
export interface EncodeAnimatedOptions extends EncodeOptions {
  /**
   * Whether to encode a single frame.
   */
  singleFrame?: boolean;
}

/**
 * Interface representing options for encoding a PNG image.
 */
export interface EncodePngOptions extends EncodeAnimatedOptions {
  /**
   * The compression level of the PNG image.
   */
  level?: CompressionLevel;
  /**
   * The filter type of the PNG image.
   */
  filter?: PngFilterType;
}

/**
 * Interface representing options for encoding a GIF image.
 */
export interface EncodeGifOptions extends EncodeAnimatedOptions {
  /**
   * The number of times the GIF should repeat.
   */
  repeat?: number;
  /**
   * The sampling factor for the GIF image.
   */
  samplingFactor?: number;
  /**
   * The dither kernel for the GIF image.
   */
  dither?: DitherKernel;
  /**
   * Whether to use serpentine dithering for the GIF image.
   */
  ditherSerpentine?: boolean;
}

/**
 * Interface representing options for encoding ICO images.
 */
export interface EncodeIcoImagesOptions {
  /**
   * The images to be encoded into the ICO file.
   */
  images: MemoryImage[];
}

/**
 * Return the Decoder that can decode image of the given **mimeType**.
 * @param {string} mimeType - The MIME type of the image.
 * @returns {Decoder | undefined} The corresponding Decoder or undefined if not found.
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
    case 'application/photoshop':
    case 'application/psd':
    case 'application/x-photoshop':
    case 'image/psd':
    case 'image/vnd.adobe.photoshop':
      return new PsdDecoder();
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
    case 'image/x-pvr':
      return new PvrDecoder();
    default:
      return undefined;
  }
}

/**
 * Return the Decoder that can decode image with the given **name**,
 * by looking at the file extension.
 * @param {string} name - The name of the image file.
 * @returns {Decoder | undefined} The corresponding Decoder or undefined if not found.
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
  if (n.endsWith('.psd')) {
    return new PsdDecoder();
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
  if (n.endsWith('.pvr')) {
    return new PvrDecoder();
  }
  return undefined;
}

/**
 * Return the Encoder that can encode image with the given **mimeType**.
 * @param {string} mimeType - The MIME type of the image.
 * @returns {Encoder | undefined} The corresponding Encoder or undefined if not found.
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
    case 'image/x-pvr':
      return new PvrEncoder();
    default:
      return undefined;
  }
}

/**
 * Return the Encoder that can encode image with the given **name**,
 * by looking at the file extension.
 * @param {string} name - The name of the image file.
 * @returns {Encoder | undefined} The corresponding Encoder or undefined if not found.
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
  if (n.endsWith('.pvr')) {
    return new PvrEncoder();
  }
  return undefined;
}

/**
 * Find the ImageFormat for the given file data.
 * @param {TypedArray} data - The image data as a TypedArray.
 * @returns {ImageFormat} The corresponding ImageFormat.
 */
export function findFormatForData(data: TypedArray): ImageFormat {
  const decoder = findDecoderForData(data);
  if (decoder === undefined) {
    return ImageFormat.invalid;
  }
  return decoder.format;
}

/**
 * Find a Decoder for the given **format** type.
 * @param {ImageFormat} format - The ImageFormat type.
 * @returns {Decoder | undefined} The corresponding Decoder or undefined if not found.
 */
export function findDecoderForFormat(format: ImageFormat): Decoder | undefined {
  switch (format) {
    case ImageFormat.bmp:
      return new BmpDecoder();
    case ImageFormat.gif:
      return new GifDecoder();
    case ImageFormat.ico:
      return new IcoDecoder();
    case ImageFormat.jpg:
      return new JpegDecoder();
    case ImageFormat.png:
      return new PngDecoder();
    case ImageFormat.pnm:
      return new PnmDecoder();
    case ImageFormat.psd:
      return new PsdDecoder();
    case ImageFormat.pvr:
      return new PvrDecoder();
    case ImageFormat.tga:
      return new TgaDecoder();
    case ImageFormat.tiff:
      return new TiffDecoder();
    case ImageFormat.webp:
      return new WebPDecoder();
    default:
      return undefined;
  }
}

/**
 * Find a Decoder that is able to decode the given image **data**.
 * Use this if you don't know the type of image it is.
 *
 * **WARNING:** Since this will check the image data against all known decoders,
 * it is much slower than using an explicit decoder.
 *
 * @param {TypedArray} data - The image data as a TypedArray.
 * @returns {Decoder | undefined} The corresponding Decoder or undefined if not found.
 */
export function findDecoderForData(data: TypedArray): Decoder | undefined {
  // The various decoders will be creating a Uint8List for their InputStream
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

  const psd = new PsdDecoder();
  if (psd.isValidFile(bytes)) {
    return psd;
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

  const pvr = new PvrDecoder();
  if (pvr.isValidFile(bytes)) {
    return pvr;
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
 *
 * @param {DecodeImageLargestOptions} opt - Options for decoding the image.
 * @param {TypedArray} opt.data - The image file bytes.
 * @param {boolean} opt.largest - Whether to decode the largest image in the file.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if no decoder is found.
 */
export function decodeImage(
  opt: DecodeImageLargestOptions
): MemoryImage | undefined {
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
 *
 * @param {DecodeImageByMimeTypeOptions} opt - Options for decoding the image.
 * @param {TypedArray} opt.data - The image file bytes.
 * @param {string} opt.mimeType - The MIME type of the image.
 * @param {boolean} opt.largest - Whether to decode the largest image in the file.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if no decoder is found.
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
 *
 * @param {DecodeNamedImageOptions} opt - Options for decoding the image.
 * @param {TypedArray} opt.data - The image file bytes.
 * @param {string} opt.name - The filename of the image.
 * @param {boolean} opt.largest - Whether to decode the largest image in the file.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if no decoder is found.
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
 *
 * @param {EncodeImageByMimeTypeOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {string} opt.mimeType - The MIME type to encode the image to.
 * @param {boolean} [opt.skipExif=false] - Whether to skip embedding EXIF metadata (default is false).
 * @returns {Uint8Array | undefined} The encoded image bytes or undefined if no encoder is found.
 */
export function encodeImageByMimeType(
  opt: EncodeImageByMimeTypeOptions
): Uint8Array | undefined {
  const skipExif = opt.skipExif ?? false;
  const encoder = findEncoderForMimeType(opt.mimeType);
  if (encoder === undefined) {
    return undefined;
  }
  return encoder.encode({
    image: opt.image,
    skipExif: skipExif,
  });
}

/**
 * Encode the MemoryImage to the format determined by the file extension of **name**.
 * If a format wasn't able to be identified, undefined will be returned.
 * Otherwise the encoded format bytes of the image will be returned.
 *
 * @param {EncodeNamedImageOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {string} opt.name - The filename extension to determine the format.
 * @param {boolean} [opt.skipExif=false] - Whether to skip embedding EXIF metadata (default is false).
 * @returns {Uint8Array | undefined} The encoded image bytes or undefined if no encoder is found.
 */
export function encodeNamedImage(
  opt: EncodeNamedImageOptions
): Uint8Array | undefined {
  const skipExif = opt.skipExif ?? false;
  const encoder = findEncoderForNamedImage(opt.name);
  if (encoder === undefined) {
    return undefined;
  }
  return encoder.encode({
    image: opt.image,
    skipExif: skipExif,
  });
}

/**
 * Decode a JPG formatted image.
 *
 * @param {DecodeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeJpg(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new JpegDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Encode an image to the JPEG format.
 *
 * @param {EncodeJpgOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {boolean} [opt.skipExif=false] - Whether to skip embedding EXIF metadata (default is false).
 * @param {number} [opt.quality] - The quality of the JPEG encoding (default is 100).
 * @param {JpegChroma} [opt.chroma] - The chroma subsampling (default is yuv444).
 * @returns {Uint8Array} The encoded image bytes.
 */
export function encodeJpg(opt: EncodeJpgOptions): Uint8Array {
  const skipExif = opt.skipExif ?? false;
  const quality = opt.quality ?? 100;
  const chroma = opt.chroma ?? JpegChroma.yuv444;
  return new JpegEncoder(quality).encode({
    image: opt.image,
    chroma: chroma,
    skipExif: skipExif,
  });
}

/**
 * Decode only the ExifData from a JPEG file, returning undefined if it was
 * unable to.
 *
 * @param {DecodeOptions} opt - Options for decoding the ExifData.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @returns {ExifData | undefined} The decoded ExifData or undefined if decoding fails.
 */
export function decodeJpgExif(opt: DecodeOptions): ExifData | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new JpegUtils().decodeExif(dataUint8);
}

/**
 * Inject ExifData into a JPEG file, replacing any existing EXIF data.
 * The new JPEG file bytes will be returned, otherwise undefined if there was an
 * issue.
 *
 * @param {InjectJpgExifOptions} opt - Options for injecting the ExifData.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {ExifData} opt.exifData - The ExifData to inject.
 * @returns {Uint8Array | undefined} The new JPEG file bytes or undefined if injection fails.
 */
export function injectJpgExif(
  opt: InjectJpgExifOptions
): Uint8Array | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new JpegUtils().injectExif(opt.exifData, dataUint8);
}

/**
 * Decode a PNG formatted image.
 *
 * @param {DecodeMultiframeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodePng(
  opt: DecodeMultiframeOptions
): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new PngDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the PNG format.
 *
 * @param {EncodePngOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {boolean} [opt.singleFrame] - Whether to encode a single frame (default is false).
 * @param {number} [opt.level] - The compression level (default is 6).
 * @param {PngFilterType} [opt.filter] - The filter type (default is paeth).
 * @returns {Uint8Array} The encoded image bytes.
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
 *
 * @param {DecodeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodePnm(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new PnmDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Decode a Targa formatted image.
 *
 * @param {DecodeMultiframeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeTga(
  opt: DecodeMultiframeOptions
): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new TgaDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the Targa format.
 *
 * @param {EncodeOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @returns {Uint8Array} The encoded image bytes.
 */
export function encodeTga(opt: EncodeOptions): Uint8Array {
  return new TgaEncoder().encode({
    image: opt.image,
  });
}

/**
 * Decode a WebP formatted image.
 *
 * @param {DecodeMultiframeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeWebP(
  opt: DecodeMultiframeOptions
): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new WebPDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Decode a GIF formatted image (first frame for animations).
 *
 * @param {DecodeMultiframeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeGif(
  opt: DecodeMultiframeOptions
): MemoryImage | undefined {
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
 *
 * @param {EncodeGifOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {boolean} [opt.singleFrame=false] - Whether to encode a single frame (default is false).
 * @param {number} [opt.repeat=0] - The number of times the animation should repeat (default is 0).
 * @param {number} [opt.samplingFactor=10] - The sampling factor for quantization (default is 10).
 * @param {DitherKernel} [opt.dither=DitherKernel.floydSteinberg] - The dither kernel to use (default is floydSteinberg).
 * @param {boolean} [opt.ditherSerpentine=false] - Whether to use serpentine dithering (default is false).
 * @returns {Uint8Array} The encoded image bytes.
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
 *
 * @param {DecodeMultiframeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeTiff(
  opt: DecodeMultiframeOptions
): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new TiffDecoder().decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the TIFF format.
 *
 * @param {EncodeAnimatedOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {boolean} [opt.singleFrame=false] - Whether to encode a single frame (default is false).
 * @param {boolean} [opt.skipExif=false] - Whether to skip embedding EXIF metadata (default is false).
 * @returns {Uint8Array} The encoded image bytes.
 */
export function encodeTiff(opt: EncodeAnimatedOptions): Uint8Array {
  const singleFrame = opt.singleFrame ?? false;
  const skipExif = opt.skipExif ?? false;
  return new TiffEncoder().encode({
    image: opt.image,
    singleFrame: singleFrame,
    skipExif: skipExif,
  });
}

/**
 * Decode a Photoshop PSD formatted image.
 *
 * @param {DecodeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodePsd(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new PsdDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Decode a BMP formatted image.
 *
 * @param {DecodeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeBmp(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new BmpDecoder().decode({
    bytes: dataUint8,
  });
}
/**
 * Encode an image to the BMP format.
 *
 * @param {EncodeOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @returns {Uint8Array} The encoded image bytes.
 */
export function encodeBmp(opt: EncodeOptions): Uint8Array {
  return new BmpEncoder().encode({
    image: opt.image,
  });
}

/**
 * Decode an ICO image.
 *
 * @param {DecodeImageLargestOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @param {boolean} opt.largest - Whether to decode the largest image in the file.
 * @param {number} opt.frameIndex - The index of the frame to decode.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodeIco(
  opt: DecodeImageLargestOptions
): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  const decoder = new IcoDecoder();
  if (opt.largest === true) {
    return decoder.decodeImageLargest(dataUint8);
  }
  return decoder.decode({
    bytes: dataUint8,
    frameIndex: opt.frameIndex,
  });
}

/**
 * Encode an image to the ICO format.
 *
 * @param {EncodeAnimatedOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @param {boolean} opt.singleFrame - Whether to encode a single frame (default is false).
 * @returns {Uint8Array} The encoded image bytes.
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
 *
 * @param {EncodeIcoImagesOptions} opt - Options for encoding the images.
 * @param {MemoryImage[]} opt.images - The list of MemoryImages to encode.
 * @returns {Uint8Array} The encoded image bytes.
 */
export function encodeIcoImages(opt: EncodeIcoImagesOptions): Uint8Array {
  return new IcoEncoder().encodeImages(opt.images);
}

/**
 * Decode an PVR image.
 *
 * @param {DecodeOptions} opt - Options for decoding the image.
 * @param {Uint8Array} opt.data - The image file bytes.
 * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
 */
export function decodePvr(opt: DecodeOptions): MemoryImage | undefined {
  const dataUint8 = new Uint8Array(opt.data);
  return new PvrDecoder().decode({
    bytes: dataUint8,
  });
}

/**
 * Encode an image to the PVR format.
 *
 * @param {EncodeOptions} opt - Options for encoding the image.
 * @param {MemoryImage} opt.image - The MemoryImage to encode.
 * @returns {Uint8Array} The encoded image bytes.
 */
export function encodePvr(opt: EncodeOptions): Uint8Array {
  return new PvrEncoder().encode({
    image: opt.image,
  });
}
