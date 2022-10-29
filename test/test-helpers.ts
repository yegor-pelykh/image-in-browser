/** @format */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

export interface FileInfo {
  name: string;
  path: string;
}

export enum TestFormat {
  bmp,
  gif,
  ico,
  jpeg,
  png,
  tga,
}

export enum TestFolder {
  res,
  out,
}

export abstract class TestHelpers {
  private static getTestFolder(folder: TestFolder) {
    switch (folder) {
      case TestFolder.res:
        return 'res';
      case TestFolder.out:
        return 'out';
    }
    throw new Error('Unknown test folder specified');
  }

  private static getTestFormat(format: TestFormat) {
    switch (format) {
      case TestFormat.bmp:
        return 'bmp';
      case TestFormat.gif:
        return 'gif';
      case TestFormat.ico:
        return 'ico';
      case TestFormat.jpeg:
        return 'jpg';
      case TestFormat.png:
        return 'png';
      case TestFormat.tga:
        return 'tga';
    }
    throw new Error('Unknown test format specified');
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
    format: TestFormat,
    fileName?: string
  ): string {
    const dirPath = join(
      __dirname,
      this.getTestFolder(folder),
      this.getTestFormat(format)
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
    format: TestFormat,
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
    format: TestFormat,
    fileName: string
  ): Buffer {
    const path = this.preparePath(folder, format, fileName);
    return this.readFromFilePath(path);
  }

  public static writeToFile(
    folder: TestFolder,
    format: TestFormat,
    fileName: string,
    data: string | NodeJS.ArrayBufferView
  ) {
    const path = this.preparePath(folder, format, fileName);
    writeFileSync(path, data);
  }
}
