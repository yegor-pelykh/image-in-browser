/** @format */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { FileInfo } from './file-info';
import { TestFolder } from './test-folder';
import { TestSection } from './test-section';

export abstract class TestUtils {
  private static getTestFolder(folder: TestFolder) {
    switch (folder) {
      case TestFolder.input:
        return '_input';
      case TestFolder.output:
        return '_output';
    }
    throw new Error('Unknown test folder specified');
  }

  private static getTestSection(section: TestSection) {
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
      case TestSection.tiff:
        return 'tiff';
      case TestSection.tga:
        return 'tga';
      case TestSection.transform:
        return 'transform';
    }
    throw new Error('Unknown test section specified');
  }

  public static replaceFileName(
    fileName: string,
    toExtCallback?: (ext: string) => string,
    toNameCallback?: (name: string) => string
  ): string {
    const dotPos = fileName.lastIndexOf('.');
    const currentName = fileName.substring(
      0,
      dotPos < 0 ? fileName.length : dotPos
    );
    const currentExt = fileName.substring(
      dotPos < 0 ? fileName.length : dotPos + 1,
      fileName.length
    );
    return `${
      toNameCallback !== undefined ? toNameCallback(currentName) : currentName
    }.${toExtCallback !== undefined ? toExtCallback(currentExt) : currentExt}`;
  }

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
        return {
          name: fileName,
          path: join(dirPath, fileName),
        };
      });
  }

  public static readFromFilePath(filePath: string): Buffer {
    return readFileSync(filePath);
  }

  public static readFromFile(
    folder: TestFolder,
    section: TestSection,
    fileName: string
  ): Buffer {
    const path = this.preparePath(folder, section, fileName);
    return this.readFromFilePath(path);
  }

  public static writeToFile(
    folder: TestFolder,
    section: TestSection,
    fileName: string,
    data: string | NodeJS.ArrayBufferView
  ) {
    const path = this.preparePath(folder, section, fileName);
    writeFileSync(path, data);
  }
}
