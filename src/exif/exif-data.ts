/** @format */

import { ArrayUtils } from '../common/array-utils.js';
import { InputBuffer } from '../common/input-buffer.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { ExifEntry } from './exif-entry.js';
import { ExifImageTags, ExifTagNameToID } from './exif-tag.js';
import { IfdContainer } from './ifd-container.js';
import { IfdDirectory } from './ifd-directory.js';
import { IfdValueType, IfdValueTypeSize } from './ifd-value-type.js';
import { IfdAsciiValue } from './ifd-value/ifd-ascii-value.js';
import { IfdByteValue } from './ifd-value/ifd-byte-value.js';
import { IfdDoubleValue } from './ifd-value/ifd-double-value.js';
import { IfdIfdValue } from './ifd-value/ifd-ifd-value.js';
import { IfdLongValue } from './ifd-value/ifd-long-value.js';
import { IfdRationalValue } from './ifd-value/ifd-rational-value.js';
import { IfdSByteValue } from './ifd-value/ifd-sbyte-value.js';
import { IfdShortValue } from './ifd-value/ifd-short-value.js';
import { IfdSingleValue } from './ifd-value/ifd-single-value.js';
import { IfdSLongValue } from './ifd-value/ifd-slong-value.js';
import { IfdSRationalValue } from './ifd-value/ifd-srational-value.js';
import { IfdSShortValue } from './ifd-value/ifd-sshort-value.js';
import { IfdUndefinedValue } from './ifd-value/ifd-undefined-value.js';
import { IfdValue } from './ifd-value/ifd-value.js';

/**
 * Class representing ExifData and providing methods for reading, writing, and manipulating Exif metadata.
 */
export class ExifData extends IfdContainer {
  /** Returns the image IFD directory. */
  public get imageIfd(): IfdDirectory {
    return this.get('ifd0');
  }

  /** Returns the thumbnail IFD directory. */
  public get thumbnailIfd(): IfdDirectory {
    return this.get('ifd1');
  }

  /** Returns the Exif IFD directory. */
  public get exifIfd(): IfdDirectory {
    return this.get('ifd0').sub.get('exif');
  }

  /** Returns the GPS IFD directory. */
  public get gpsIfd(): IfdDirectory {
    return this.get('ifd0').sub.get('gps');
  }

  /** Returns the interoperability IFD directory. */
  public get interopIfd(): IfdDirectory {
    return this.get('ifd0').sub.get('interop');
  }

  /** Returns the total data size. */
  public get dataSize(): number {
    return 8 + (this.directories.get('ifd0')?.dataSize ?? 0);
  }

  /**
   * Checks if a tag exists in any directory.
   * @param tag Tag number to check.
   * @returns True if the tag exists, false otherwise.
   */
  public hasTag(tag: number): boolean {
    for (const directory of this.directories.values()) {
      if (directory.has(tag)) return true;
    }
    return false;
  }

  /**
   * Gets the value of a tag.
   * @param tag Tag number to get.
   * @returns Value of the tag, or undefined if not found.
   */
  public getTag(tag: number): IfdValue | undefined {
    for (const directory of this.directories.values()) {
      if (directory.has(tag)) return directory.get(tag);
    }
    return undefined;
  }

  /**
   * Gets the name of a tag.
   * @param tag Tag number.
   * @returns Name of the tag.
   */
  public getTagName(tag: number): string {
    return ExifImageTags.get(tag)?.name ?? '<unknown>';
  }

  /**
   * Writes Exif data to the output buffer.
   * @param out Output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    const saveEndian = out.bigEndian;
    out.bigEndian = true;
    out.writeUint16(0x4d4d);
    out.writeUint16(0x002a);
    out.writeUint32(8);
    if (this.directories.get('ifd0') === undefined)
      this.directories.set('ifd0', new IfdDirectory());
    const dirNames: string[] = ['ifd0'];
    dirNames.push(
      ...Array.from(this.directories.keys()).filter((k) => k !== 'ifd0')
    );
    let dataOffset = 8;
    const offsets = new Map<string, number>();
    for (const name of dirNames) {
      const ifd = this.directories.get(name)!;
      offsets.set(name, dataOffset);
      if (ifd.sub.has('exif')) ifd.set(0x8769, new IfdLongValue(0));
      else ifd.set(0x8769, undefined);
      if (ifd.sub.has('interop')) ifd.set(0xa005, new IfdLongValue(0));
      else ifd.set(0xa005, undefined);
      if (ifd.sub.has('gps')) ifd.set(0x8825, new IfdLongValue(0));
      else ifd.set(0x8825, undefined);
      dataOffset += 2 + 12 * ifd.size + 4;
      for (const value of ifd.values) {
        const dataSize = value.dataSize;
        if (dataSize > 4) dataOffset += dataSize;
      }
      for (const [subName, subDir] of ifd.sub.entries) {
        offsets.set(subName, dataOffset);
        let subSize = 2 + 12 * subDir.size;
        for (const value of subDir.values) {
          const dataSize = value.dataSize;
          if (dataSize > 4) subSize += dataSize;
        }
        dataOffset += subSize;
      }
    }
    const numIfd = dirNames.length;
    for (let i = 0; i < numIfd; ++i) {
      const name = dirNames[i];
      const ifd = this.directories.get(name)!;
      if (ifd.sub.has('exif')) ifd.get(0x8769)!.setInt(offsets.get('exif')!);
      if (ifd.sub.has('interop'))
        ifd.get(0xa005)!.setInt(offsets.get('interop')!);
      if (ifd.sub.has('gps')) ifd.get(0x8825)!.setInt(offsets.get('gps')!);
      const ifdOffset = offsets.get(name)!;
      const dataOffset = ifdOffset + 2 + 12 * ifd.size + 4;
      this.writeDirectory(out, ifd, dataOffset);
      if (i === numIfd - 1) out.writeUint32(0);
      else out.writeUint32(offsets.get(dirNames[i + 1])!);
      this.writeDirectoryLargeValues(out, ifd);
      for (const [subName, subDir] of ifd.sub.entries) {
        const subOffset = offsets.get(subName)!;
        const dataOffset = subOffset + 2 + 12 * subDir.size;
        this.writeDirectory(out, subDir, dataOffset);
        this.writeDirectoryLargeValues(out, subDir);
      }
    }
    out.bigEndian = saveEndian;
  }

  /**
   * Reads Exif data from the input buffer.
   * @param block Input buffer to read from.
   * @returns True if read was successful, false otherwise.
   */
  public read(block: InputBuffer<Uint8Array>): boolean {
    const saveEndian = block.bigEndian;
    block.bigEndian = true;
    const blockOffset = block.offset;
    const endian = block.readUint16();
    if (endian === 0x4949) {
      block.bigEndian = false;
      if (block.readUint16() !== 0x002a) {
        block.bigEndian = saveEndian;
        return false;
      }
    } else if (endian === 0x4d4d) {
      block.bigEndian = true;
      if (block.readUint16() !== 0x002a) {
        block.bigEndian = saveEndian;
        return false;
      }
    } else {
      return false;
    }
    let ifdOffset = block.readUint32();
    let index = 0;
    while (ifdOffset > 0) {
      block.offset = blockOffset + ifdOffset;
      if (block.length < 2) break;
      const directory = new IfdDirectory();
      const numEntries = block.readUint16();
      const dir = new Array<ExifEntry>();
      for (let i = 0; i < numEntries; i++) {
        const entry = this.readEntry(block, blockOffset);
        dir.push(entry);
      }
      for (const entry of dir) {
        if (entry.value !== undefined) directory.set(entry.tag, entry.value);
      }
      this.directories.set(`ifd${index}`, directory);
      index++;
      const nextIfdOffset = block.readUint32();
      if (nextIfdOffset === ifdOffset) break;
      else ifdOffset = nextIfdOffset;
    }
    const subTags = new Map<number, string>([
      [0x8769, 'exif'],
      [0xa005, 'interop'],
      [0x8825, 'gps'],
    ]);
    for (const d of this.directories.values()) {
      for (const dt of subTags.keys()) {
        try {
          const ifdOffset = d.get(dt)!.toInt();
          block.offset = blockOffset + ifdOffset;
          const directory = new IfdDirectory();
          const numEntries = block.readUint16();
          const dir = ArrayUtils.generate(numEntries, (_) =>
            this.readEntry(block, blockOffset)
          );
          for (const entry of dir) {
            if (entry.value !== undefined)
              directory.set(entry.tag, entry.value);
          }
          d.sub.set(subTags.get(dt)!, directory);
        } catch (e) {
          continue;
        }
      }
    }
    block.bigEndian = saveEndian;
    return false;
  }

  /**
   * Creates a clone of the current ExifData object.
   * @returns A new ExifData object that is a copy of the current instance.
   */
  public clone(): ExifData {
    return ExifData.from(this);
  }

  /**
   * Converts the directory structure into a string representation.
   * @returns String representation of the directory structure.
   */
  public toString(): string {
    let s = '';
    for (const [name, directory] of this.directories) {
      s += `${name}\n`;
      for (const [tag, value] of directory.entries) {
        if (value === undefined) s += `\t${this.getTagName(tag)}\n`;
        else s += `\t${this.getTagName(tag)}: ${value.toString()}\n`;
      }
      for (const [subName, subDir] of directory.sub.entries) {
        s += `${subName}\n`;
        for (const [tag, value] of subDir.entries) {
          if (value === undefined) s += `\t${this.getTagName(tag)}\n`;
          else s += `\t${this.getTagName(tag)}: ${value}\n`;
        }
      }
    }
    return `${this.constructor.name} (${s})`;
  }

  /**
   * Creates an ExifData instance from another ExifData instance.
   * @param other Source ExifData instance.
   * @returns New ExifData instance.
   */
  public static from(other: ExifData): ExifData {
    const dirs = new Map<string, IfdDirectory>(other.directories);
    return new ExifData(dirs);
  }

  /**
   * Creates an ExifData instance from an input buffer.
   * @param input Input buffer to read from.
   * @returns New ExifData instance.
   */
  public static fromInputBuffer(input: InputBuffer<Uint8Array>): ExifData {
    const data = new ExifData();
    data.read(input);
    return data;
  }

  /**
   * Writes the IFD directory to the output buffer.
   * @param out Output buffer.
   * @param ifd IFD directory to write.
   * @param dataOffset Offset for data values.
   * @returns New data offset after writing.
   */
  private writeDirectory(
    out: OutputBuffer,
    ifd: IfdDirectory,
    dataOffset: number
  ): number {
    let offset = dataOffset;
    const stripOffsetTag = ExifTagNameToID.get('StripOffsets');
    out.writeUint16(ifd.size);
    for (const [tag, value] of ifd.entries) {
      const tagType =
        tag === stripOffsetTag && value.type === IfdValueType.undefined
          ? IfdValueType.long
          : value.type;
      const tagLength =
        tag === stripOffsetTag && value.type === IfdValueType.undefined
          ? 1
          : value.length;
      out.writeUint16(tag);
      out.writeUint16(tagType);
      out.writeUint32(tagLength);
      let size = value.dataSize;
      if (size <= 4) {
        value.write(out);
        while (size < 4) {
          out.writeByte(0);
          size++;
        }
      } else {
        out.writeUint32(offset);
        offset += size;
      }
    }
    return offset;
  }

  /**
   * Writes large values of the IFD directory to the output buffer.
   * @param out Output buffer.
   * @param ifd IFD directory.
   */
  private writeDirectoryLargeValues(
    out: OutputBuffer,
    ifd: IfdDirectory
  ): void {
    for (const value of ifd.values) {
      const size = value.dataSize;
      if (size > 4) value.write(out);
    }
  }

  /**
   * Reads an Exif entry from the input buffer.
   * @param block Input buffer.
   * @param blockOffset Offset in the buffer.
   * @returns ExifEntry object.
   */
  private readEntry(
    block: InputBuffer<Uint8Array>,
    blockOffset: number
  ): ExifEntry {
    const tag = block.readUint16();
    const format = block.readUint16();
    const count = block.readUint32();
    const entry = new ExifEntry(tag, undefined);
    if (format > Object.keys(IfdValueType).length) return entry;
    const f = format as IfdValueType;
    const fsize = IfdValueTypeSize[format];
    const size = count * fsize;
    const endOffset = block.offset + 4;
    if (size > 4) {
      const fieldOffset = block.readUint32();
      block.offset = fieldOffset + blockOffset;
    }
    if (block.offset + size > block.end) return entry;
    const data = block.readRange(size);
    switch (f) {
      case IfdValueType.none:
        break;
      case IfdValueType.sByte:
        entry.value = IfdSByteValue.data(data, count);
        break;
      case IfdValueType.byte:
        entry.value = IfdByteValue.data(data, count);
        break;
      case IfdValueType.undefined:
        entry.value = IfdUndefinedValue.data(data, count);
        break;
      case IfdValueType.ascii:
        entry.value = IfdAsciiValue.data(data, count);
        break;
      case IfdValueType.short:
        entry.value = IfdShortValue.data(data, count);
        break;
      case IfdValueType.long:
        entry.value = IfdLongValue.data(data, count);
        break;
      case IfdValueType.rational:
        entry.value = IfdRationalValue.data(data, count);
        break;
      case IfdValueType.sRational:
        entry.value = IfdSRationalValue.data(data, count);
        break;
      case IfdValueType.sShort:
        entry.value = IfdSShortValue.data(data, count);
        break;
      case IfdValueType.sLong:
        entry.value = IfdSLongValue.data(data, count);
        break;
      case IfdValueType.single:
        entry.value = IfdSingleValue.data(data, count);
        break;
      case IfdValueType.double:
        entry.value = IfdDoubleValue.data(data, count);
        break;
      case IfdValueType.ifd:
        if (count === 1) entry.value = IfdIfdValue.data(data);
        break;
    }
    block.offset = endOffset;
    return entry;
  }
}
