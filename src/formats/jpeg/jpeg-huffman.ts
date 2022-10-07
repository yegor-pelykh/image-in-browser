/** @format */

export class JpegHuffman {
  private readonly _children: Array<unknown> = new Array<unknown>();
  public get children(): Array<unknown> {
    return this._children;
  }

  private _index = 0;
  public get index(): number {
    return this._index;
  }

  public incrementIndex() {
    this._index++;
  }
}
