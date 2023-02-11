/** @format */

import { IfdDirectory } from './ifd-directory';

export class IfdContainer {
  protected directories: Map<string, IfdDirectory>;

  public get keys(): IterableIterator<string> {
    return this.directories.keys();
  }

  public get values(): IterableIterator<IfdDirectory> {
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

  constructor(directories?: Map<string, IfdDirectory>) {
    this.directories = directories ?? new Map<string, IfdDirectory>();
  }

  public static from(other: IfdContainer) {
    const dirs = new Map<string, IfdDirectory>(other.directories);
    return new IfdContainer(dirs);
  }

  public has(key: string): boolean {
    return this.directories.has(key);
  }

  public get(ifdName: string): IfdDirectory {
    let ifd = this.directories.get(ifdName);
    if (ifd === undefined) {
      ifd = new IfdDirectory();
      this.directories.set(ifdName, ifd);
      return ifd;
    } else {
      return ifd;
    }
  }

  public set(ifdName: string, value: IfdDirectory): void {
    this.directories.set(ifdName, value);
  }

  public clear(): void {
    this.directories.clear();
  }
}
