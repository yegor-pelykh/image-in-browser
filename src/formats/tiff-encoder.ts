/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { HdrImage } from '../hdr/hdr-image';
import { HdrSlice } from '../hdr/hdr-slice';
import { Encoder } from './encoder';
import { TiffEntry } from './tiff/tiff-entry';
import { TiffImage } from './tiff/tiff-image';
import { OutputBuffer } from './util/output-buffer';

/**
 * Encode a TIFF image.
 */
export class TiffEncoder implements Encoder {
  private static readonly LITTLE_ENDIAN = 0x4949;
  private static readonly SIGNATURE = 42;

  private _supportsAnimation = false;
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  private writeHeader(out: OutputBuffer): void {
    // byteOrder
    out.writeUint16(TiffEncoder.LITTLE_ENDIAN);
    // TIFF signature
    out.writeUint16(TiffEncoder.SIGNATURE);
    // Offset to the start of the IFD tags
    out.writeUint32(8);
  }

  private writeImage(out: OutputBuffer, image: MemoryImage): void {
    // number of IFD entries
    out.writeUint16(11);

    this.writeEntryUint32(out, TiffImage.TAG_IMAGE_WIDTH, image.width);
    this.writeEntryUint32(out, TiffImage.TAG_IMAGE_LENGTH, image.height);
    this.writeEntryUint16(out, TiffImage.TAG_BITS_PER_SAMPLE, 8);
    this.writeEntryUint16(
      out,
      TiffImage.TAG_COMPRESSION,
      TiffImage.COMPRESSION_NONE
    );
    this.writeEntryUint16(
      out,
      TiffImage.TAG_PHOTOMETRIC_INTERPRETATION,
      TiffImage.PHOTOMETRIC_RGB
    );
    this.writeEntryUint16(out, TiffImage.TAG_SAMPLES_PER_PIXEL, 4);
    this.writeEntryUint16(
      out,
      TiffImage.TAG_SAMPLE_FORMAT,
      TiffImage.FORMAT_UINT
    );

    this.writeEntryUint32(out, TiffImage.TAG_ROWS_PER_STRIP, image.height);
    this.writeEntryUint16(out, TiffImage.TAG_PLANAR_CONFIGURATION, 1);
    this.writeEntryUint32(
      out,
      TiffImage.TAG_STRIP_BYTE_COUNTS,
      image.width * image.height * 4
    );
    this.writeEntryUint32(out, TiffImage.TAG_STRIP_OFFSETS, out.length + 4);
    out.writeBytes(image.getBytes());
  }

  private writeHdrImage(out: OutputBuffer, image: HdrImage): void {
    // number of IFD entries
    out.writeUint16(11);

    this.writeEntryUint32(out, TiffImage.TAG_IMAGE_WIDTH, image.width);
    this.writeEntryUint32(out, TiffImage.TAG_IMAGE_LENGTH, image.height);
    this.writeEntryUint16(
      out,
      TiffImage.TAG_BITS_PER_SAMPLE,
      image.bitsPerSample
    );
    this.writeEntryUint16(
      out,
      TiffImage.TAG_COMPRESSION,
      TiffImage.COMPRESSION_NONE
    );
    this.writeEntryUint16(
      out,
      TiffImage.TAG_PHOTOMETRIC_INTERPRETATION,
      image.numberOfChannels === 1
        ? TiffImage.PHOTOMETRIC_BLACKISZERO
        : TiffImage.PHOTOMETRIC_RGB
    );
    this.writeEntryUint16(
      out,
      TiffImage.TAG_SAMPLES_PER_PIXEL,
      image.numberOfChannels
    );
    this.writeEntryUint16(
      out,
      TiffImage.TAG_SAMPLE_FORMAT,
      this.getSampleFormat(image)
    );

    const bytesPerSample = Math.trunc(image.bitsPerSample / 8);
    const imageSize =
      image.width * image.height * image.slices.size * bytesPerSample;

    this.writeEntryUint32(out, TiffImage.TAG_ROWS_PER_STRIP, image.height);
    this.writeEntryUint16(out, TiffImage.TAG_PLANAR_CONFIGURATION, 1);
    this.writeEntryUint32(out, TiffImage.TAG_STRIP_BYTE_COUNTS, imageSize);
    this.writeEntryUint32(out, TiffImage.TAG_STRIP_OFFSETS, out.length + 4);

    const channels: Uint8Array[] = [];
    if (image.blue !== undefined) {
      // ? Why does this channel order working but not RGB?
      channels.push(image.blue.getBytes());
    }
    if (image.red !== undefined) {
      channels.push(image.red.getBytes());
    }
    if (image.green !== undefined) {
      channels.push(image.green.getBytes());
    }
    if (image.alpha !== undefined) {
      channels.push(image.alpha.getBytes());
    }
    if (image.depth !== undefined) {
      channels.push(image.depth.getBytes());
    }

    for (let y = 0, pi = 0; y < image.height; ++y) {
      for (let x = 0; x < image.width; ++x, pi += bytesPerSample) {
        for (let c = 0; c < channels.length; ++c) {
          const ch = channels[c];
          for (let b = 0; b < bytesPerSample; ++b) {
            out.writeByte(ch[pi + b]);
          }
        }
      }
    }
  }

  private getSampleFormat(image: HdrImage): number {
    switch (image.sampleFormat) {
      case HdrSlice.UINT:
        return TiffImage.FORMAT_UINT;
      case HdrSlice.INT:
        return TiffImage.FORMAT_INT;
    }
    return TiffImage.FORMAT_FLOAT;
  }

  private writeEntryUint16(out: OutputBuffer, tag: number, data: number): void {
    out.writeUint16(tag);
    out.writeUint16(TiffEntry.TYPE_SHORT);
    // number of values
    out.writeUint32(1);
    out.writeUint16(data);
    // pad to 4 bytes
    out.writeUint16(0);
  }

  private writeEntryUint32(out: OutputBuffer, tag: number, data: number): void {
    out.writeUint16(tag);
    out.writeUint16(TiffEntry.TYPE_LONG);
    // number of values
    out.writeUint32(1);
    out.writeUint32(data);
  }

  public encodeImage(image: MemoryImage): Uint8Array {
    const out = new OutputBuffer();
    this.writeHeader(out);
    this.writeImage(out, image);
    // no offset to the next image
    out.writeUint32(0);
    return out.getBytes();
  }

  public encodeAnimation(_animation: FrameAnimation): Uint8Array | undefined {
    return undefined;
  }

  public encodeHdrImage(image: HdrImage): Uint8Array {
    const out = new OutputBuffer();
    this.writeHeader(out);
    this.writeHdrImage(out, image);
    // no offset to the next image
    out.writeUint32(0);
    return out.getBytes();
  }
}
