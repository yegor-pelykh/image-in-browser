/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { OutputBuffer } from '../../common/output-buffer';
import { ExifData } from '../../exif/exif-data';
import { JpegMarker } from './jpeg-marker';

export class JpegUtils {
  // Exif\0\0
  private static readonly _exifSignature = 0x45786966;

  private readExifData(block: InputBuffer | undefined): ExifData | undefined {
    if (block === undefined) {
      return undefined;
    }

    // Exif Header
    const signature = block.readUint32();
    if (signature !== JpegUtils._exifSignature) {
      return undefined;
    }
    if (block.readUint16() !== 0) {
      return undefined;
    }

    return ExifData.fromInputBuffer(block);
  }

  private writeAPP1(out: OutputBuffer, exif: ExifData): void {
    if (exif.isEmpty) {
      return;
    }

    const exifData = new OutputBuffer();
    exif.write(exifData);
    const exifBytes = exifData.getBytes();

    out.writeUint16(exifBytes.length + 8);
    out.writeUint32(JpegUtils._exifSignature);
    out.writeUint16(0);
    out.writeBytes(exifBytes);
  }

  private readBlock(input: InputBuffer): InputBuffer | undefined {
    const length = input.readUint16();
    if (length < 2) {
      return undefined;
    }
    return input.readBytes(length - 2);
  }

  private skipBlock(input: InputBuffer, output?: OutputBuffer): boolean {
    const length = input.readUint16();
    output?.writeUint16(length);
    if (length < 2) {
      return false;
    }
    if (output !== undefined) {
      output.writeBuffer(input.readBytes(length - 2));
    } else {
      input.skip(length - 2);
    }
    return true;
  }

  private nextMarker(input: InputBuffer, output?: OutputBuffer): number {
    let c = 0;
    if (input.isEOS) {
      return c;
    }

    do {
      do {
        c = input.readByte();
        output?.writeByte(c);
      } while (c !== 0xff && !input.isEOS);

      if (input.isEOS) {
        return c;
      }

      do {
        c = input.readByte();
        output?.writeByte(c);
      } while (c === 0xff && !input.isEOS);
    } while (c === 0 && !input.isEOS);

    return c;
  }

  public decodeExif(data: Uint8Array): ExifData | undefined {
    const input = new InputBuffer({
      buffer: data,
      bigEndian: true,
    });

    // Some other formats have embedded jpeg, or jpeg-like data.
    // Only validate if the image starts with the StartOfImage tag.
    const soiCheck = input.peekBytes(2);
    if (soiCheck.getByte(0) !== 0xff || soiCheck.getByte(1) !== 0xd8) {
      return undefined;
    }

    let marker = this.nextMarker(input);
    if (marker !== JpegMarker.soi) {
      return undefined;
    }

    let exif: ExifData | undefined = undefined;
    marker = this.nextMarker(input);
    while (marker !== JpegMarker.eoi && !input.isEOS) {
      switch (marker) {
        case JpegMarker.app1:
          exif = this.readExifData(this.readBlock(input));
          if (exif !== undefined) {
            return exif;
          }
          break;
        default:
          this.skipBlock(input);
          break;
      }
      marker = this.nextMarker(input);
    }

    return undefined;
  }

  public injectExif(exif: ExifData, data: Uint8Array): Uint8Array | undefined {
    const input = new InputBuffer({
      buffer: data,
      bigEndian: true,
    });

    // Some other formats have embedded jpeg, or jpeg-like data.
    // Only validate if the image starts with the StartOfImage tag.
    const soiCheck = input.peekBytes(2);
    if (soiCheck.getByte(0) !== 0xff || soiCheck.getByte(1) !== 0xd8) {
      return undefined;
    }

    const output = new OutputBuffer({
      size: data.length,
      bigEndian: true,
    });

    let marker = this.nextMarker(input, output);
    if (marker !== JpegMarker.soi) {
      return undefined;
    }

    // Check to see if the JPEG file has an EXIF block
    let hasExifBlock = false;
    const startOffset = input.offset;
    marker = this.nextMarker(input);
    while (!hasExifBlock && marker !== JpegMarker.eoi && !input.isEOS) {
      if (marker === JpegMarker.app1) {
        const block = this.readBlock(input);
        const signature = block?.readUint32();
        if (signature === JpegUtils._exifSignature) {
          hasExifBlock = true;
          break;
        }
      } else {
        this.skipBlock(input);
      }
      marker = this.nextMarker(input);
    }

    input.offset = startOffset;

    // If the JPEG file does not have an EXIF block, add a new one.
    if (!hasExifBlock) {
      this.writeAPP1(output, exif);
      // No need to parse the remaining individual blocks, just write out
      // the remainder of the file.
      output.writeBuffer(input.readBytes(input.length));
      return output.getBytes();
    }

    marker = this.nextMarker(input, output);
    while (marker !== JpegMarker.eoi && !input.isEOS) {
      if (marker === JpegMarker.app1) {
        const saveOffset = input.offset;
        // block length
        input.skip(2);
        const signature = input.readUint32();
        input.offset = saveOffset;
        if (signature === JpegUtils._exifSignature) {
          this.skipBlock(input);
          this.writeAPP1(output, exif);
          // No need to parse the remaining individual blocks, just write out
          // the remainder of the file.
          output.writeBuffer(input.readBytes(input.length));
          return output.getBytes();
        }
      }
      this.skipBlock(input, output);
      marker = this.nextMarker(input, output);
    }

    return output.getBytes();
  }
}
