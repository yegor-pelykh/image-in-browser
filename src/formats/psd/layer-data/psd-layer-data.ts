/** @format */

export class PsdLayerData {
  private _tag: string;
  public get tag(): string {
    return this._tag;
  }

  constructor(tag: string) {
    this._tag = tag;
  }
}
