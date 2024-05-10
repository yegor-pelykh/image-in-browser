/** @format */

export class FileInfo {
  public path: string;
  public name: string;
  public ext: string;

  public get nameExt(): string {
    return `${this.name}${this.ext}`;
  }

  constructor(path: string, name: string, ext: string) {
    this.path = path;
    this.name = name;
    this.ext = ext;
  }
}
