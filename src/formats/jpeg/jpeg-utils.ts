/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { ExifData } from '../../exif/exif-data.js';
import { JpegMarker } from './jpeg-marker.js';

/**
 * Utility class for handling JPEG operations, including reading and writing EXIF data.
 */
export class JpegUtils {
  /**
   * EXIF signature constant.
   */
  private static readonly _exifSignature = 0x45786966;

  /**
   * Reads EXIF data from the given input buffer.
   * @param {InputBuffer<Uint8Array> | undefined} block - The input buffer containing the EXIF data.
   * @returns {ExifData | undefined} The parsed EXIF data or undefined if the data is invalid.
   */
  private readExifData(
    block: InputBuffer<Uint8Array> | undefined
  ): ExifData | undefined {
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

  /**
   * Writes the APP1 segment containing EXIF data to the output buffer.
   * @param {OutputBuffer} out - The output buffer to write to.
   * @param {ExifData} exif - The EXIF data to write.
   */
  private writeAPP1(out: OutputBuffer, exif: ExifData): void {
    if (exif.isEmpty) {
      return;
    }

    const exifData = new OutputBuffer();
    exif.write(exifData);
    const exifBytes = exifData.getBytes();

    out.writeByte(0xff);
    out.writeByte(JpegMarker.app1);
    out.writeUint16(exifBytes.length + 8);
    out.writeUint32(JpegUtils._exifSignature);
    out.writeUint16(0);
    out.writeBytes(exifBytes);
  }

  /**
   * Reads a block of data from the input buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read from.
   * @returns {InputBuffer<Uint8Array> | undefined} The read block or undefined if the block length is invalid.
   */
  private readBlock(
    input: InputBuffer<Uint8Array>
  ): InputBuffer<Uint8Array> | undefined {
    const length = input.readUint16();
    if (length < 2) {
      return undefined;
    }
    return input.readRange(length - 2);
  }

  /**
   * Skips a block of data in the input buffer and optionally writes it to the output buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read from.
   * @param {OutputBuffer} [output] - The optional output buffer to write to.
   * @returns {boolean} True if the block was successfully skipped, false otherwise.
   */
  private skipBlock(
    input: InputBuffer<Uint8Array>,
    output?: OutputBuffer
  ): boolean {
    const length = input.readUint16();
    output?.writeUint16(length);
    if (length < 2) {
      return false;
    }
    if (output !== undefined) {
      output.writeBuffer(input.readRange(length - 2));
    } else {
      input.skip(length - 2);
    }
    return true;
  }

  /**
   * Reads the next marker from the input buffer and optionally writes it to the output buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read from.
   * @param {OutputBuffer} [output] - The optional output buffer to write to.
   * @returns {number} The next marker value.
   */
  private nextMarker(
    input: InputBuffer<Uint8Array>,
    output?: OutputBuffer
  ): number {
    let c = 0;
    if (input.isEOS) {
      return c;
    }

    do {
      do {
        c = input.read();
        output?.writeByte(c);
      } while (c !== 0xff && !input.isEOS);

      if (input.isEOS) {
        return c;
      }

      do {
        c = input.read();
        output?.writeByte(c);
      } while (c === 0xff && !input.isEOS);
    } while (c === 0 && !input.isEOS);

    return c;
  }

  /**
   * Decodes EXIF data from the given JPEG data.
   * @param {Uint8Array} data - The JPEG data to decode.
   * @returns {ExifData | undefined} The parsed EXIF data or undefined if the data is invalid.
   */
  public decodeExif(data: Uint8Array): ExifData | undefined {
    const input = new InputBuffer<Uint8Array>({
      buffer: data,
      bigEndian: true,
    });

    // Some other formats have embedded jpeg, or jpeg-like data.
    // Only validate if the image starts with the StartOfImage tag.
    const soiCheck = input.peek(2);
    if (soiCheck.get(0) !== 0xff || soiCheck.get(1) !== 0xd8) {
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

  /**
   * Injects EXIF data into the given JPEG data.
   * @param {ExifData} exif - The EXIF data to inject.
   * @param {Uint8Array} data - The JPEG data to inject into.
   * @returns {Uint8Array | undefined} The modified JPEG data with the injected EXIF data or undefined if the data is invalid.
   */
  public injectExif(exif: ExifData, data: Uint8Array): Uint8Array | undefined {
    const input = new InputBuffer<Uint8Array>({
      buffer: data,
      bigEndian: true,
    });

    // Some other formats have embedded jpeg, or jpeg-like data.
    // Only validate if the image starts with the StartOfImage tag.
    const soiCheck = input.peek(2);
    if (soiCheck.get(0) !== 0xff || soiCheck.get(1) !== 0xd8) {
      return undefined;
    }

    const output = new OutputBuffer({
      size: data.length,
      bigEndian: true,
    });

    let marker = this.nextMarker(input);
    if (marker !== JpegMarker.soi) {
      return undefined;
    }

    // Check to see if the JPEG file has an EXIF block
    let hasExifBlock = false;
    let exifBlockEndOffset = 0;
    const startOffset = input.offset;
    let exifBlockStartOffset = startOffset;
    marker = this.nextMarker(input);
    while (!hasExifBlock && marker !== JpegMarker.eoi && !input.isEOS) {
      if (marker === JpegMarker.app1) {
        const block = this.readBlock(input);
        const signature = block?.readUint32();
        if (signature === JpegUtils._exifSignature) {
          exifBlockEndOffset = input.offset;
          hasExifBlock = true;
          break;
        }
      } else {
        this.skipBlock(input);
      }
      exifBlockStartOffset = startOffset;
      marker = this.nextMarker(input);
    }

    input.offset = 0;

    // If the JPEG file does not have an EXIF block, add a new one.
    if (!hasExifBlock) {
      output.writeBuffer(input.readRange(startOffset));
      this.writeAPP1(output, exif);
      // No need to parse the remaining individual blocks, just write out
      // the remainder of the file.
      output.writeBuffer(input.readRange(input.length));
      return output.getBytes();
    }

    // Write out the image file up until the exif block
    output.writeBuffer(input.readRange(exifBlockStartOffset));
    // Write the new EXIF block
    this.writeAPP1(output, exif);
    // Skip the EXIF block from the source
    input.offset = exifBlockEndOffset;
    // Write out the remainder of the image file
    output.writeBuffer(input.readRange(input.length));

    return output.getBytes();
  }
}
