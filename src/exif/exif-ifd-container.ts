/** @format */

import { ExifIFD } from './exif-ifd';

export class ExifIFDContainer {
  protected directories: Map<string, ExifIFD>;

  public get keys(): IterableIterator<string> {
    return this.directories.keys();
  }

  public get values(): IterableIterator<ExifIFD> {
    return this.directories.values();
  }

  public get size(): number {
    return this.directories.size;
  }

  public get isEmpty(): boolean {
    if (this.directories.size === 0) {
      return true;
    }
    for (const ifd of this.directories.values()) {
      if (!ifd.isEmpty) {
        return false;
      }
    }
    return true;
  }

  constructor(directories?: Map<string, ExifIFD>) {
    this.directories = directories ?? new Map<string, ExifIFD>();
  }

  public static from(other: ExifIFDContainer) {
    return new ExifIFDContainer(other.directories);
  }

  public has(key: string): boolean {
    return this.directories.has(key);
  }

  public get(ifdName: string): ExifIFD {
    let ifd = this.directories.get(ifdName);
    if (ifd === undefined) {
      ifd = new ExifIFD();
      this.directories.set(ifdName, ifd);
      return ifd;
    } else {
      return ifd;
    }
  }

  public set(ifdName: string, value: ExifIFD): void {
    this.directories.set(ifdName, value);
  }

  public clear(): void {
    this.directories.clear();
  }
}
