/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { JpegComponent } from './jpeg-component.js';

/**
 * Represents a JPEG frame.
 */
export class JpegFrame {
  /**
   * Map of JPEG components.
   */
  private readonly _components: Map<number, JpegComponent>;

  /**
   * Gets the components of the JPEG frame.
   */
  public get components(): Map<number, JpegComponent> {
    return this._components;
  }

  /**
   * Order of the components.
   */
  private readonly _componentsOrder: Array<number>;

  /**
   * Gets the order of the components.
   */
  public get componentsOrder(): Array<number> {
    return this._componentsOrder;
  }

  /**
   * Indicates if the frame is extended.
   */
  private _extended: boolean;

  /**
   * Gets whether the frame is extended.
   */
  public get extended(): boolean {
    return this._extended;
  }

  /**
   * Indicates if the frame is progressive.
   */
  private _progressive: boolean;

  /**
   * Gets whether the frame is progressive.
   */
  public get progressive(): boolean {
    return this._progressive;
  }

  /**
   * Precision of the frame.
   */
  private _precision: number;

  /**
   * Gets the precision of the frame.
   */
  public get precision(): number {
    return this._precision;
  }

  /**
   * Number of scan lines in the frame.
   */
  private _scanLines: number;

  /**
   * Gets the number of scan lines in the frame.
   */
  public get scanLines(): number {
    return this._scanLines;
  }

  /**
   * Number of samples per line in the frame.
   */
  private _samplesPerLine: number;

  /**
   * Gets the number of samples per line in the frame.
   */
  public get samplesPerLine(): number {
    return this._samplesPerLine;
  }

  /**
   * Maximum horizontal samples.
   */
  private _maxHSamples = 0;

  /**
   * Gets the maximum horizontal samples.
   */
  public get maxHSamples(): number {
    return this._maxHSamples;
  }

  /**
   * Maximum vertical samples.
   */
  private _maxVSamples = 0;

  /**
   * Gets the maximum vertical samples.
   */
  public get maxVSamples(): number {
    return this._maxVSamples;
  }

  /**
   * Number of MCUs per line.
   */
  private _mcusPerLine = 0;

  /**
   * Gets the number of MCUs per line.
   */
  public get mcusPerLine(): number {
    return this._mcusPerLine;
  }

  /**
   * Number of MCUs per column.
   */
  private _mcusPerColumn = 0;

  /**
   * Gets the number of MCUs per column.
   */
  public get mcusPerColumn(): number {
    return this._mcusPerColumn;
  }

  /**
   * Constructs a new JpegFrame.
   * @param {Map<number, JpegComponent>} components - Map of JPEG components.
   * @param {Array<number>} componentsOrder - Order of the components.
   * @param {boolean} extended - Indicates if the frame is extended.
   * @param {boolean} progressive - Indicates if the frame is progressive.
   * @param {number} precision - Precision of the frame.
   * @param {number} scanLines - Number of scan lines in the frame.
   * @param {number} samplesPerLine - Number of samples per line in the frame.
   */
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

  /**
   * Prepares the JPEG frame by calculating maximum samples and MCUs.
   */
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
