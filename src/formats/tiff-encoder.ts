/** @format */

import { Format, FormatType } from '../color/format';
import { OutputBuffer } from '../common/output-buffer';
import { LibError } from '../error/lib-error';
import { ExifData } from '../exif/exif-data';
import { IfdUndefinedValue } from '../exif/ifd-value/ifd-undefined-value';
import { MemoryImage } from '../image/image';
import { Encoder, EncoderEncodeOptions } from './encoder';
import { TiffCompression } from './tiff/tiff-compression';
import { TiffFormat } from './tiff/tiff-format';
import { TiffPhotometricType } from './tiff/tiff-photometric-type';

/**
 * Encode a MemoryImage to the TIFF format.
 */
export class TiffEncoder implements Encoder {
  private _supportsAnimation = false;
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  private getSampleFormat(image: MemoryImage): number {
    switch (image.formatType) {
      case FormatType.uint:
        return TiffFormat.uint;
      case FormatType.int:
        return TiffFormat.int;
      case FormatType.float:
        return TiffFormat.float;
    }
    throw new LibError('Unknown TIFF format type.');
  }

  public encode(opt: EncoderEncodeOptions): Uint8Array {
    let image = opt.image;

    const out = new OutputBuffer();

    // TIFF is really just an EXIF structure (or, really, EXIF is just a TIFF
    // structure).

    const exif = new ExifData();
    if (image.exifData.size > 0) {
      exif.imageIfd.copyFrom(image.exifData.imageIfd);
    }

    // TODO: support encoding HDR images to TIFF.
    if (image.isHdrFormat) {
      image = image.convert({
        format: Format.uint8,
      });
    }

    const type =
      image.numChannels === 1
        ? TiffPhotometricType.blackIsZero
        : image.hasPalette
        ? TiffPhotometricType.palette
        : TiffPhotometricType.rgb;

    const nc = image.numChannels;

    const ifd0 = exif.imageIfd;
    ifd0.setValue('ImageWidth', image.width);
    ifd0.setValue('ImageHeight', image.height);
    ifd0.setValue('BitsPerSample', image.bitsPerChannel);
    ifd0.setValue('SampleFormat', this.getSampleFormat(image));
    ifd0.setValue('SamplesPerPixel', image.hasPalette ? 1 : nc);
    ifd0.setValue('Compression', TiffCompression.none);
    ifd0.setValue('PhotometricInterpretation', type);
    ifd0.setValue('RowsPerStrip', image.height);
    ifd0.setValue('PlanarConfiguration', 1);
    ifd0.setValue('TileWidth', image.width);
    ifd0.setValue('TileLength', image.height);
    ifd0.setValue('StripByteCounts', image.byteLength);
    ifd0.setValue('StripOffsets', new IfdUndefinedValue(image.toUint8Array()));

    if (image.hasPalette) {
      const p = image.palette!;
      // Only support RGB palettes
      const numCh = 3;
      const numC = p.numColors;
      const colorMap = new Uint16Array(numC * numCh);
      for (let c = 0, ci = 0; c < numCh; ++c) {
        for (let i = 0; i < numC; ++i) {
          colorMap[ci++] = Math.trunc(p.get(i, c)) << 8;
        }
      }

      ifd0.setValue('ColorMap', colorMap);
    }

    exif.write(out);

    return out.getBytes();
  }
}
