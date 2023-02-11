/** @format */

import { ArrayUtils } from '../../common/array-utils';
import { JpegComponent } from './jpeg-component';

export class JpegFrame {
  private readonly _components: Map<number, JpegComponent>;
  public get components(): Map<number, JpegComponent> {
    return this._components;
  }

  private readonly _componentsOrder: Array<number>;
  public get componentsOrder(): Array<number> {
    return this._componentsOrder;
  }

  private _extended: boolean;
  public get extended(): boolean {
    return this._extended;
  }

  private _progressive: boolean;
  public get progressive(): boolean {
    return this._progressive;
  }

  private _precision: number;
  public get precision(): number {
    return this._precision;
  }

  private _scanLines: number;
  public get scanLines(): number {
    return this._scanLines;
  }

  private _samplesPerLine: number;
  public get samplesPerLine(): number {
    return this._samplesPerLine;
  }

  private _maxHSamples = 0;
  public get maxHSamples(): number {
    return this._maxHSamples;
  }

  private _maxVSamples = 0;
  public get maxVSamples(): number {
    return this._maxVSamples;
  }

  private _mcusPerLine = 0;
  public get mcusPerLine(): number {
    return this._mcusPerLine;
  }

  private _mcusPerColumn = 0;
  public get mcusPerColumn(): number {
    return this._mcusPerColumn;
  }

  constructor(
    components: Map<number, JpegComponent>,
    componentsOrder: Array<number>,
    extended: boolean,
    progressive: boolean,
    precision: number,
    scanLines: number,
    samplesPerLine: number
  ) {
    this._components = components;
    this._componentsOrder = componentsOrder;
    this._extended = extended;
    this._progressive = progressive;
    this._precision = precision;
    this._scanLines = scanLines;
    this._samplesPerLine = samplesPerLine;
  }

  public prepare(): void {
    for (const [_, component] of this._components) {
      this._maxHSamples = Math.max(this._maxHSamples, component.hSamples);
      this._maxVSamples = Math.max(this._maxVSamples, component.vSamples);
    }

    this._mcusPerLine = Math.ceil(this._samplesPerLine / 8 / this._maxHSamples);
    this._mcusPerColumn = Math.ceil(this._scanLines / 8 / this._maxVSamples);

    for (const [_, component] of this._components) {
      const blocksPerLine = Math.ceil(
        (Math.ceil(this._samplesPerLine / 8) * component.hSamples) /
          this._maxHSamples
      );
      const blocksPerColumn = Math.ceil(
        (Math.ceil(this._scanLines / 8) * component.vSamples) / this.maxVSamples
      );
      const blocksPerLineForMcu = this._mcusPerLine * component.hSamples;
      const blocksPerColumnForMcu = this._mcusPerColumn * component.vSamples;

      const blocks = ArrayUtils.generate<Int32Array[]>(
        blocksPerColumnForMcu,
        (_) =>
          ArrayUtils.generate<Int32Array>(
            blocksPerLineForMcu,
            (_) => new Int32Array(64)
          )
      );

      component.setBlocks(blocks, blocksPerLine, blocksPerColumn);
    }
  }
}
