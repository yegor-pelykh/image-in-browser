/**
 * Represents information about a file.
 *
 * @format
 */

export class FileInfo {
  /** The path of the file. */
  public path: string;

  /** The name of the file without extension. */
  public name: string;

  /** The extension of the file. */
  public ext: string;

  /**
   * Gets the full name of the file including its extension.
   * @returns {string} The name of the file with its extension.
   */
  public get nameExt(): string {
    return `${this.name}${this.ext}`;
  }

  /**
   * Constructs a new instance of the FileInfo class.
   * @param {string} path - The path of the file.
   * @param {string} name - The name of the file without extension.
   * @param {string} ext - The extension of the file.
   */
  constructor(path: string, name: string, ext: string) {
    this.path = path;
    this.name = name;
    this.ext = ext;
  }
}
