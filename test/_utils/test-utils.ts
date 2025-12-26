/** @format */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join, parse, resolve } from 'path';
import { FileInfo } from './file-info';
import { TestFolder } from './test-folder';
import { TestSection } from './test-section';
import { TestOptions } from 'vitest';

/**
 * Utility class for handling test-related file operations.
 */
export abstract class TestUtils {
  /**
   * Gets the folder name based on the TestFolder enum.
   * @param {TestFolder} folder - The test folder enum value.
   * @returns {string} The corresponding folder name as a string.
   * @throws {Error} Will throw an error if the folder is unknown.
   */
  private static getTestFolder(folder: TestFolder): string {
    switch (folder) {
      case TestFolder.input:
        return '_input';
      case TestFolder.output:
        return '_output';
    }
    throw new Error('Unknown test folder specified');
  }

  /**
   * Gets the section name based on the TestSection enum.
   * @param {TestSection} section - The test section enum value.
   * @returns {string} The corresponding section name as a string.
   * @throws {Error} Will throw an error if the section is unknown.
   */
  private static getTestSection(section: TestSection): string {
    switch (section) {
      case TestSection.apng:
        return 'apng';
      case TestSection.bmp:
        return 'bmp';
      case TestSection.color:
        return 'color';
      case TestSection.draw:
        return 'draw';
      case TestSection.dump:
        return 'dump';
      case TestSection.exif:
        return 'exif';
      case TestSection.filter:
        return 'filter';
      case TestSection.gif:
        return 'gif';
      case TestSection.ico:
        return 'ico';
      case TestSection.jpeg:
        return 'jpg';
      case TestSection.png:
        return 'png';
      case TestSection.pnm:
        return 'pnm';
      case TestSection.psd:
        return 'psd';
      case TestSection.pvr:
        return 'pvr';
      case TestSection.tiff:
        return 'tiff';
      case TestSection.tga:
        return 'tga';
      case TestSection.transform:
        return 'transform';
      case TestSection.webp:
        return 'webp';
    }
    throw new Error('Unknown test section specified');
  }

  /**
   * Prepares the path for a given folder, section, and optional file name.
   * @param {TestFolder} folder - The test folder enum value.
   * @param {TestSection} section - The test section enum value.
   * @param {string} [fileName] - Optional file name.
   * @returns {string} The prepared path as a string.
   */
  public static preparePath(
    folder: TestFolder,
    section: TestSection,
    fileName?: string
  ): string {
    const dirPath = join(
      resolve('test'),
      this.getTestFolder(folder),
      this.getTestSection(section)
    );
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, {
        recursive: true,
      });
    }
    return fileName !== undefined ? join(dirPath, fileName) : dirPath;
  }

  /**
   * Lists files in a given folder and format, optionally filtering by file extension.
   * @param {TestFolder} folder - The test folder enum value.
   * @param {TestSection} format - The test section enum value.
   * @param {string} [endsWith] - Optional file extension to filter by.
   * @returns {FileInfo[]} An array of FileInfo objects.
   */
  public static listFiles(
    folder: TestFolder,
    format: TestSection,
    endsWith?: string
  ): FileInfo[] {
    const dirPath = this.preparePath(folder, format);
    return readdirSync(dirPath)
      .filter((name) => {
        if (endsWith === undefined) {
          return true;
        } else {
          return name.toLowerCase().endsWith(endsWith.toLowerCase());
        }
      })
      .map((fileName) => {
        const pp = parse(fileName);
        return new FileInfo(join(dirPath, fileName), pp.name, pp.ext);
      });
  }

  /**
   * Reads the content of a file from a given file path.
   * @param {string} filePath - The path to the file.
   * @returns {Buffer} The file content as a Buffer.
   */
  public static readFromFilePath(filePath: string): Buffer {
    return readFileSync(filePath);
  }

  /**
   * Reads the content of a file from a given folder, section, and file name.
   * @param {TestFolder} folder - The test folder enum value.
   * @param {TestSection} section - The test section enum value.
   * @param {string} fileName - The name of the file.
   * @returns {Buffer} The file content as a Buffer.
   */
  public static readFromFile(
    folder: TestFolder,
    section: TestSection,
    fileName: string
  ): Buffer {
    const path = this.preparePath(folder, section, fileName);
    return this.readFromFilePath(path);
  }

  /**
   * Writes data to a file in a given folder, section, and file name.
   * @param {TestFolder} folder - The test folder enum value.
   * @param {TestSection} section - The test section enum value.
   * @param {string} fileName - The name of the file.
   * @param {string | NodeJS.ArrayBufferView} data - The data to write, either as a string or ArrayBufferView.
   */
  public static writeToFile(
    folder: TestFolder,
    section: TestSection,
    fileName: string,
    data: string | NodeJS.ArrayBufferView
  ): void {
    const path = this.preparePath(folder, section, fileName);
    writeFileSync(path, data);
  }
}
