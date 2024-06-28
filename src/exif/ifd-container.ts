/** @format */

import { IfdDirectory } from './ifd-directory.js';

/**
 * Represents a container for IFD directories.
 */
export class IfdContainer {
  /**
   * A map of directory names to IfdDirectory objects.
   */
  protected directories: Map<string, IfdDirectory>;

  /**
   * Gets an iterator for the keys in the directories map.
   */
  public get keys(): IterableIterator<string> {
    return this.directories.keys();
  }

  /**
   * Gets an iterator for the values in the directories map.
   */
  public get values(): IterableIterator<IfdDirectory> {
    return this.directories.values();
  }

  /**
   * Gets an iterator for the entries in the directories map.
   */
  public get entries(): IterableIterator<[string, IfdDirectory]> {
    return this.directories.entries();
  }

  /**
   * Gets the number of entries in the directories map.
   */
  public get size(): number {
    return this.directories.size;
  }

  /**
   * Checks if the directories map is empty.
   */
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

  /**
   * Constructs an IfdContainer.
   * @param {Map<string, IfdDirectory>} [directories] - An optional map of directory names to IfdDirectory objects.
   */
  constructor(directories?: Map<string, IfdDirectory>) {
    this.directories = directories ?? new Map<string, IfdDirectory>();
  }

  /**
   * Creates a new IfdContainer from an existing one.
   * @param {IfdContainer} other - The existing IfdContainer to copy.
   * @returns {IfdContainer} A new IfdContainer instance.
   */
  public static from(other: IfdContainer): IfdContainer {
    const dirs = new Map<string, IfdDirectory>(other.directories);
    return new IfdContainer(dirs);
  }

  /**
   * Checks if a directory with the given key exists.
   * @param {string} key - The key to check for.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  public has(key: string): boolean {
    return this.directories.has(key);
  }

  /**
   * Gets the IfdDirectory for the given name, creating it if it doesn't exist.
   * @param {string} ifdName - The name of the directory to get.
   * @returns {IfdDirectory} The IfdDirectory for the given name.
   */
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

  /**
   * Sets the IfdDirectory for the given name.
   * @param {string} ifdName - The name of the directory to set.
   * @param {IfdDirectory} value - The IfdDirectory to set.
   */
  public set(ifdName: string, value: IfdDirectory): void {
    this.directories.set(ifdName, value);
  }

  /**
   * Clears all entries in the directories map.
   */
  public clear(): void {
    this.directories.clear();
  }
}
