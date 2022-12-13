/** @format */

import { InputBuffer } from '../common/input-buffer';
import { OutputBuffer } from '../common/output-buffer';
import { ExifEntry } from './exif-entry';
import { ExifIFD } from './exif-ifd';
import { ExifIFDContainer } from './exif-ifd-container';
import { ExifImageTags } from './exif-tag';
import { ExifValueType, ExifValueTypeSize } from './exif-value-type';
import { ExifAsciiValue } from './exif-value/exif-ascii-value';
import { ExifByteValue } from './exif-value/exif-byte-value';
import { ExifDoubleValue } from './exif-value/exif-double-value';
import { ExifLongValue } from './exif-value/exif-long-value';
import { ExifRationalValue } from './exif-value/exif-rational-value';
import { ExifSByteValue } from './exif-value/exif-sbyte-value';
import { ExifShortValue } from './exif-value/exif-short-value';
import { ExifSingleValue } from './exif-value/exif-single-value';
import { ExifSLongValue } from './exif-value/exif-slong-value';
import { ExifSRationalValue } from './exif-value/exif-srational-value';
import { ExifSShortValue } from './exif-value/exif-sshort-value';
import { ExifUndefinedValue } from './exif-value/exif-undefined-value';
import { ExifValue } from './exif-value/exif-value';

export class ExifData extends ExifIFDContainer {
  public get imageIfd(): ExifIFD {
    return this.get('ifd0');
  }

  public get thumbnailIfd(): ExifIFD {
    return this.get('ifd1');
  }

  public get exifIfd(): ExifIFD {
    return this.get('ifd0').sub.get('exif');
  }

  public get gpsIfd(): ExifIFD {
    return this.get('ifd0').sub.get('gps');
  }

  public get interopIfd(): ExifIFD {
    return this.get('ifd0').sub.get('interop');
  }

  private writeDirectory(
    out: OutputBuffer,
    ifd: ExifIFD,
    dataOffset: number
  ): number {
    let offset = dataOffset;
    out.writeUint16(ifd.size);
    for (const tag of ifd.keys) {
      const value = ifd.getValue(tag)!;

      out.writeUint16(tag);
      out.writeUint16(value.type);
      out.writeUint32(value.length);

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

  private writeDirectoryLargeValues(out: OutputBuffer, ifd: ExifIFD): void {
    for (const value of ifd.values) {
      const size = value.dataSize;
      if (size > 4) {
        value.write(out);
      }
    }
  }

  private readEntry(block: InputBuffer, blockOffset: number): ExifEntry {
    const tag = block.readUint16();
    const format = block.readUint16();
    const count = block.readUint32();

    const entry = new ExifEntry(tag, undefined);

    if (format > Object.keys(ExifValueType).length) return entry;

    const f = format as ExifValueType;
    const fsize = ExifValueTypeSize[format];
    const size = count * fsize;

    const endOffset = block.offset + 4;

    if (size > 4) {
      const fieldOffset = block.readUint32();
      block.offset = fieldOffset + blockOffset;
    }

    if (block.offset + size > block.end) {
      return entry;
    }

    const data = block.readBytes(size);

    switch (f) {
      case ExifValueType.none:
        break;
      case ExifValueType.sbyte:
        entry.value = ExifSByteValue.fromData(data, count);
        break;
      case ExifValueType.byte:
        entry.value = ExifByteValue.fromData(data, count);
        break;
      case ExifValueType.undefined:
        entry.value = ExifUndefinedValue.fromData(data, count);
        break;
      case ExifValueType.ascii:
        entry.value = ExifAsciiValue.fromData(data, count);
        break;
      case ExifValueType.short:
        entry.value = ExifShortValue.fromData(data, count);
        break;
      case ExifValueType.long:
        entry.value = ExifLongValue.fromData(data, count);
        break;
      case ExifValueType.rational:
        entry.value = ExifRationalValue.fromData(data, count);
        break;
      case ExifValueType.srational:
        entry.value = ExifSRationalValue.fromData(data, count);
        break;
      case ExifValueType.sshort:
        entry.value = ExifSShortValue.fromData(data, count);
        break;
      case ExifValueType.slong:
        entry.value = ExifSLongValue.fromData(data, count);
        break;
      case ExifValueType.single:
        entry.value = ExifSingleValue.fromData(data, count);
        break;
      case ExifValueType.double:
        entry.value = ExifDoubleValue.fromData(data, count);
        break;
    }

    block.offset = endOffset;

    return entry;
  }

  public static from(other: ExifData) {
    return new ExifData(other.directories);
  }

  public static fromInputBuffer(input: InputBuffer) {
    const data = new ExifData();
    data.read(input);
    return data;
  }

  public hasTag(tag: number): boolean {
    for (const directory of this.directories.values()) {
      if (directory.has(tag)) {
        return true;
      }
    }
    return false;
  }

  public getTag(tag: number): ExifValue | undefined {
    for (const directory of this.directories.values()) {
      if (directory.has(tag)) {
        return directory.getValue(tag);
      }
    }
    return undefined;
  }

  public getTagName(tag: number): string {
    return ExifImageTags.get(tag)?.name ?? '<unknown>';
  }

  public write(out: OutputBuffer): void {
    const saveEndian = out.bigEndian;
    out.bigEndian = true;

    // Tiff header
    // big endian
    out.writeUint16(0x4d4d);
    out.writeUint16(0x002a);
    // offset to first ifd block
    out.writeUint32(8);

    if (this.directories.get('ifd0') === undefined)
      this.directories.set('ifd0', new ExifIFD());

    // offset to first ifd block, from start of tiff header
    let dataOffset = 8;
    const offsets = new Map<string, number>();

    for (const [name, ifd] of this.directories) {
      offsets.set(name, dataOffset);

      if (ifd.sub.has('exif')) {
        ifd.setValue(0x8769, new ExifLongValue(0));
      } else {
        ifd.setValue(0x8769, undefined);
      }

      if (ifd.sub.has('interop')) {
        ifd.setValue(0xa005, new ExifLongValue(0));
      } else {
        ifd.setValue(0xa005, undefined);
      }

      if (ifd.sub.has('gps')) {
        ifd.setValue(0x8825, new ExifLongValue(0));
      } else {
        ifd.setValue(0x8825, undefined);
      }

      // ifd block size
      dataOffset += 2 + 12 * ifd.size + 4;

      // storage for large tag values
      for (const value of ifd.values) {
        const dataSize = value.dataSize;
        if (dataSize > 4) {
          dataOffset += dataSize;
        }
      }

      // storage for sub-ifd blocks
      for (const subName of ifd.sub.keys) {
        const subIfd = ifd.sub.get(subName);
        offsets.set(subName, dataOffset);
        let subSize = 2 + 12 * subIfd.size;
        for (const value of subIfd.values) {
          const dataSize = value.dataSize;
          if (dataSize > 4) {
            subSize += dataSize;
          }
        }
        dataOffset += subSize;
      }
    }

    const dirArray = Array.from(this.directories);
    for (let i = 0; i < dirArray.length; i++) {
      const [name, ifd] = dirArray[i];

      if (ifd.sub.has('exif')) {
        ifd.getValue(0x8769)!.setInt(offsets.get('exif')!);
      }

      if (ifd.sub.has('interop')) {
        ifd.getValue(0xa005)!.setInt(offsets.get('interop')!);
      }

      if (ifd.sub.has('gps')) {
        ifd.getValue(0x8825)!.setInt(offsets.get('gps')!);
      }

      const ifdOffset = offsets.get(name)!;
      const dataOffset = ifdOffset + 2 + 12 * ifd.size + 4;

      this.writeDirectory(out, ifd, dataOffset);

      if (i === dirArray.length - 1) {
        out.writeUint32(0);
      } else {
        const nextName = dirArray[i + 1][0];
        out.writeUint32(offsets.get(nextName)!);
      }

      this.writeDirectoryLargeValues(out, ifd);

      for (const subName of ifd.sub.keys) {
        const subIfd = ifd.sub.get(subName);
        const subOffset = offsets.get(subName)!;
        const dataOffset = subOffset + 2 + 12 * subIfd.size;
        this.writeDirectory(out, subIfd, dataOffset);
        this.writeDirectoryLargeValues(out, subIfd);
      }
    }

    out.bigEndian = saveEndian;
  }

  public read(block: InputBuffer): boolean {
    const saveEndian = block.bigEndian;
    block.bigEndian = true;

    const blockOffset = block.offset;

    // Tiff header
    const endian = block.readUint16();

    if (endian === 0x4949) {
      // II
      block.bigEndian = false;
      if (block.readUint16() !== 0x2a00) {
        block.bigEndian = saveEndian;
        return false;
      }
    } else if (endian === 0x4d4d) {
      // MM
      block.bigEndian = true;
      if (block.readUint16() !== 0x002a) {
        block.bigEndian = saveEndian;
        return false;
      }
    } else {
      return false;
    }

    let ifdOffset = block.readUint32();

    // IFD blocks
    let index = 0;
    while (ifdOffset > 0) {
      block.offset = blockOffset + ifdOffset;

      const directory = new ExifIFD();
      const numEntries = block.readUint16();

      const dir = new Array<ExifEntry>();
      for (let i = 0; i < numEntries; i++) {
        const entry = this.readEntry(block, blockOffset);
        dir.push(entry);
      }

      for (const entry of dir) {
        if (entry.value !== undefined) {
          directory.setValue(entry.tag, entry.value);
        }
      }
      this.directories.set(`ifd${index}`, directory);
      index++;

      ifdOffset = block.readUint32();
    }

    const subTags = new Map<number, string>([
      [0x8769, 'exif'],
      [0xa005, 'interop'],
      [0x8825, 'gps'],
    ]);

    for (const d of this.directories.values()) {
      for (const dt of subTags.keys()) {
        // ExifOffset
        if (d.has(dt)) {
          const ifdOffset = d.getValue(dt)!.toInt();
          block.offset = blockOffset + ifdOffset;
          const directory = new ExifIFD();
          const numEntries = block.readUint16();

          const dir = new Array<ExifEntry>();
          for (let i = 0; i < numEntries; i++) {
            const entry = this.readEntry(block, blockOffset);
            dir.push(entry);
          }

          for (const entry of dir) {
            if (entry.value !== undefined) {
              directory.setValue(entry.tag, entry.value!);
            }
          }
          d.sub.set(subTags.get(dt)!, directory);
        }
      }
    }

    block.bigEndian = saveEndian;
    return false;
  }

  public toString(): string {
    let s = '';
    for (const [name, directory] of this.directories) {
      s += `${name}\n`;
      for (const tag of directory.keys) {
        const value = directory.getValue(tag);
        if (value === undefined) {
          s += `\t${this.getTagName(tag)}\n`;
        } else {
          s += `\t${this.getTagName(tag)}: ${value.toString()}\n`;
        }
      }
      for (const subName of directory.sub.keys) {
        s += `${subName}\n`;
        const subDirectory = directory.sub.get(subName);
        for (const tag of subDirectory.keys) {
          const value = subDirectory.getValue(tag);
          if (value === undefined) {
            s += `\t${this.getTagName(tag)}\n`;
          } else {
            s += `\t${this.getTagName(tag)}: ${value}\n`;
          }
        }
      }
    }
    return s.toString();
  }
}
