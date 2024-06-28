/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { HuffmanNode } from './huffman-node.js';
import { HuffmanParent } from './huffman-parent.js';
import { HuffmanValue } from './huffman-value.js';
import { JpegComponent } from './jpeg-component.js';
import { JpegData } from './jpeg-data.js';
import { JpegFrame } from './jpeg-frame.js';
import { JpegMarker } from './jpeg-marker.js';

/**
 * Type definition for the decode function.
 *
 * @param {JpegComponent} component - The JPEG component to decode.
 * @param {Int32Array} block - The block of data to decode.
 */
export type DecodeFunction = (
  component: JpegComponent,
  block: Int32Array
) => void;

/**
 * Class representing a JPEG scan.
 */
export class JpegScan {
  private _input: InputBuffer<Uint8Array>;

  /**
   * Gets the input buffer.
   * @returns {InputBuffer<Uint8Array>} The input buffer.
   */
  public get input(): InputBuffer<Uint8Array> {
    return this._input;
  }

  private _frame: JpegFrame;

  /**
   * Gets the JPEG frame.
   * @returns {JpegFrame} The JPEG frame.
   */
  public get frame(): JpegFrame {
    return this._frame;
  }

  private _precision: number;

  /**
   * Gets the precision.
   * @returns {number} The precision.
   */
  public get precision(): number {
    return this._precision;
  }

  private _samplesPerLine: number;

  /**
   * Gets the samples per line.
   * @returns {number} The samples per line.
   */
  public get samplesPerLine(): number {
    return this._samplesPerLine;
  }

  private _scanLines: number;

  /**
   * Gets the scan lines.
   * @returns {number} The scan lines.
   */
  public get scanLines(): number {
    return this._scanLines;
  }

  private _mcusPerLine: number;

  /**
   * Gets the MCUs per line.
   * @returns {number} The MCUs per line.
   */
  public get mcusPerLine(): number {
    return this._mcusPerLine;
  }

  private _progressive: boolean;

  /**
   * Gets whether the scan is progressive.
   * @returns {boolean} True if the scan is progressive, false otherwise.
   */
  public get progressive(): boolean {
    return this._progressive;
  }

  private _maxH: number;

  /**
   * Gets the maximum horizontal samples.
   * @returns {number} The maximum horizontal samples.
   */
  public get maxH(): number {
    return this._maxH;
  }

  private _maxV: number;

  /**
   * Gets the maximum vertical samples.
   * @returns {number} The maximum vertical samples.
   */
  public get maxV(): number {
    return this._maxV;
  }

  private _components: Array<JpegComponent>;

  /**
   * Gets the components.
   * @returns {Array<JpegComponent>} The components.
   */
  public get components(): Array<JpegComponent> {
    return this._components;
  }

  private _resetInterval?: number;

  /**
   * Gets the reset interval.
   * @returns {number | undefined} The reset interval.
   */
  public get resetInterval(): number | undefined {
    return this._resetInterval;
  }

  private _spectralStart: number;

  /**
   * Gets the spectral start.
   * @returns {number} The spectral start.
   */
  public get spectralStart(): number {
    return this._spectralStart;
  }

  private _spectralEnd: number;

  /**
   * Gets the spectral end.
   * @returns {number} The spectral end.
   */
  public get spectralEnd(): number {
    return this._spectralEnd;
  }

  private _successivePrev: number;

  /**
   * Gets the successive previous value.
   * @returns {number} The successive previous value.
   */
  public get successivePrev(): number {
    return this._successivePrev;
  }

  private _successive: number;

  /**
   * Gets the successive value.
   * @returns {number} The successive value.
   */
  public get successive(): number {
    return this._successive;
  }

  private _bitsData = 0;

  /**
   * Gets the bits data.
   * @returns {number} The bits data.
   */
  public get bitsData(): number {
    return this._bitsData;
  }

  private _bitsCount = 0;

  /**
   * Gets the bits count.
   * @returns {number} The bits count.
   */
  public get bitsCount(): number {
    return this._bitsCount;
  }

  private _eobrun = 0;

  /**
   * Gets the EOB run.
   * @returns {number} The EOB run.
   */
  public get eobrun(): number {
    return this._eobrun;
  }

  private _successiveACState = 0;

  /**
   * Gets the successive AC state.
   * @returns {number} The successive AC state.
   */
  public get successiveACState(): number {
    return this._successiveACState;
  }

  private _successiveACNextValue = 0;

  /**
   * Gets the successive AC next value.
   * @returns {number} The successive AC next value.
   */
  public get successiveACNextValue(): number {
    return this._successiveACNextValue;
  }

  /**
   * Initializes a new instance of the JpegScan class.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {JpegFrame} frame - The JPEG frame.
   * @param {Array<JpegComponent>} components - The components.
   * @param {number} spectralStart - The spectral start.
   * @param {number} spectralEnd - The spectral end.
   * @param {number} successivePrev - The successive previous value.
   * @param {number} successive - The successive value.
   * @param {number} [resetInterval] - The reset interval.
   */
  constructor(
    input: InputBuffer<Uint8Array>,
    frame: JpegFrame,
    components: Array<JpegComponent>,
    spectralStart: number,
    spectralEnd: number,
    successivePrev: number,
    successive: number,
    resetInterval?: number
  ) {
    this._input = input;
    this._frame = frame;
    this._precision = frame.precision;
    this._samplesPerLine = frame.samplesPerLine;
    this._scanLines = frame.scanLines;
    this._mcusPerLine = frame.mcusPerLine;
    this._progressive = frame.progressive;
    this._maxH = frame.maxHSamples;
    this._maxV = frame.maxVSamples;
    this._components = components;
    this._resetInterval = resetInterval;
    this._spectralStart = spectralStart;
    this._spectralEnd = spectralEnd;
    this._successivePrev = successivePrev;
    this._successive = successive;
  }

  /**
   * Reads a single bit from the input buffer.
   * @returns {number | undefined} The bit read or undefined if end of stream.
   */
  private readBit(): number | undefined {
    if (this.bitsCount > 0) {
      this._bitsCount--;
      return (this._bitsData >>> this._bitsCount) & 1;
    }

    if (this._input.isEOS) {
      return undefined;
    }

    this._bitsData = this._input.read();
    if (this._bitsData === 0xff) {
      const nextByte = this.input.read();
      if (nextByte !== 0) {
        return undefined;
      }
    }

    this._bitsCount = 7;
    return (this._bitsData >>> 7) & 1;
  }

  /**
   * Decodes a Huffman encoded value.
   * @param {Array<HuffmanNode | undefined>} tree - The Huffman tree.
   * @returns {number | undefined} The decoded value or undefined if end of stream.
   */
  private decodeHuffman(
    tree: Array<HuffmanNode | undefined>
  ): number | undefined {
    let node: HuffmanNode | undefined = new HuffmanParent(tree);
    let bit: number | undefined = undefined;
    while ((bit = this.readBit()) !== undefined) {
      if (node instanceof HuffmanParent) {
        node = node.children[bit];
      }
      if (node instanceof HuffmanValue) {
        return node.value;
      }
    }
    return undefined;
  }

  /**
   * Receives a specified number of bits from the input buffer.
   * @param {number} length - The number of bits to receive.
   * @returns {number | undefined} The received bits or undefined if end of stream.
   */
  private receive(length: number): number | undefined {
    let n = 0;
    let len = length;
    while (len > 0) {
      const bit = this.readBit();
      if (bit === undefined) {
        return undefined;
      }
      n = (n << 1) | bit;
      len--;
    }
    return n;
  }

  /**
   * Receives and extends a specified number of bits from the input buffer.
   * @param {number | undefined} length - The number of bits to receive and extend.
   * @returns {number} The received and extended bits.
   */
  private receiveAndExtend(length: number | undefined): number {
    if (length === undefined) {
      return 0;
    }
    if (length === 1) {
      return this.readBit() === 1 ? 1 : -1;
    }
    const n = this.receive(length);
    if (n === undefined) {
      return 0;
    }
    if (n >= 1 << ((length ?? 0) - 1)) {
      return n;
    }
    return n + (-1 << (length ?? 0)) + 1;
  }

  /**
   * Decodes a baseline JPEG component.
   * @param {JpegComponent} component - The JPEG component.
   * @param {Int32Array} zz - The block of data to decode.
   */
  private decodeBaseline(component: JpegComponent, zz: Int32Array): void {
    const t = this.decodeHuffman(component.huffmanTableDC);
    const diff = t === 0 ? 0 : this.receiveAndExtend(t);
    component.pred += diff;
    zz[0] = component.pred;

    let k = 1;
    while (k < 64) {
      const rs = this.decodeHuffman(component.huffmanTableAC);
      if (rs === undefined) {
        break;
      }
      let s = rs & 15;
      const r = rs >>> 4;
      if (s === 0) {
        if (r < 15) {
          break;
        }
        k += 16;
        continue;
      }

      k += r;

      s = this.receiveAndExtend(s);

      const z = JpegData.dctZigZag[k];
      zz[z] = s;
      k++;
    }
  }

  /**
   * Decodes the first DC coefficient of a progressive JPEG component.
   * @param {JpegComponent} component - The JPEG component.
   * @param {Int32Array} zz - The block of data to decode.
   */
  private decodeDCFirst(component: JpegComponent, zz: Int32Array): void {
    const t = this.decodeHuffman(component.huffmanTableDC);
    const diff = t === 0 ? 0 : this.receiveAndExtend(t) << this._successive;
    component.pred += diff;
    zz[0] = component.pred;
  }

  /**
   * Decodes the successive DC coefficients of a progressive JPEG component.
   * @param {JpegComponent} _ - The JPEG component (unused).
   * @param {Int32Array} zz - The block of data to decode.
   */
  private decodeDCSuccessive(_: JpegComponent, zz: Int32Array): void {
    zz[0] |= this.readBit()! << this._successive;
  }

  /**
   * Decodes the first AC coefficients of a progressive JPEG component.
   * @param {JpegComponent} component - The JPEG component.
   * @param {Int32Array} zz - The block of data to decode.
   */
  private decodeACFirst(component: JpegComponent, zz: Int32Array): void {
    if (this._eobrun > 0) {
      this._eobrun--;
      return;
    }
    let k = this._spectralStart;
    const e = this._spectralEnd;
    while (k <= e) {
      const rs = this.decodeHuffman(component.huffmanTableAC)!;
      const s = rs & 15;
      const r = rs >>> 4;
      if (s === 0) {
        if (r < 15) {
          this._eobrun = this.receive(r)! + (1 << r) - 1;
          break;
        }
        k += 16;
        continue;
      }
      k += r;
      const z = JpegData.dctZigZag[k];
      zz[z] = this.receiveAndExtend(s) * (1 << this._successive);
      k++;
    }
  }

  /**
   * Decodes the successive AC coefficients of a progressive JPEG component.
   * @param {JpegComponent} component - The JPEG component.
   * @param {Int32Array} zz - The block of data to decode.
   * @throws {LibError} If there is an invalid progressive encoding.
   */
  private decodeACSuccessive(component: JpegComponent, zz: Int32Array): void {
    let k = this._spectralStart;
    const e = this._spectralEnd;
    let s = 0;
    let r = 0;
    while (k <= e) {
      const z = JpegData.dctZigZag[k];
      switch (this._successiveACState) {
        case 0: {
          // Initial state
          const rs = this.decodeHuffman(component.huffmanTableAC);
          if (rs === undefined) {
            throw new LibError('Invalid progressive encoding');
          }
          s = rs & 15;
          r = rs >>> 4;
          if (s === 0) {
            if (r < 15) {
              this._eobrun = this.receive(r)! + (1 << r);
              this._successiveACState = 4;
            } else {
              r = 16;
              this._successiveACState = 1;
            }
          } else {
            if (s !== 1) {
              throw new LibError('invalid ACn encoding');
            }
            this._successiveACNextValue = this.receiveAndExtend(s);
            this._successiveACState = r !== 0 ? 2 : 3;
          }
          continue;
        }
        case 1:
        case 2: {
          // Skipping r zero items
          if (zz[z] !== 0) {
            zz[z] += this.readBit()! << this._successive;
          } else {
            r--;
            if (r === 0) {
              this._successiveACState = this._successiveACState === 2 ? 3 : 0;
            }
          }
          break;
        }
        case 3: {
          // Set value for a zero item
          if (zz[z] !== 0) {
            zz[z] += this.readBit()! << this._successive;
          } else {
            zz[z] = this._successiveACNextValue << this._successive;
            this._successiveACState = 0;
          }
          break;
        }
        case 4: {
          // Eob
          if (zz[z] !== 0) {
            zz[z] += this.readBit()! << this._successive;
          }
          break;
        }
      }
      k++;
    }
    if (this._successiveACState === 4) {
      this._eobrun--;
      if (this._eobrun === 0) {
        this._successiveACState = 0;
      }
    }
  }

  /**
   * Decodes a MCU (Minimum Coded Unit) of a JPEG component.
   * @param {JpegComponent} component - The JPEG component.
   * @param {DecodeFunction} decodeFn - The decode function.
   * @param {number} mcu - The MCU index.
   * @param {number} row - The row index.
   * @param {number} col - The column index.
   */
  private decodeMcu(
    component: JpegComponent,
    decodeFn: DecodeFunction,
    mcu: number,
    row: number,
    col: number
  ): void {
    const mcuRow = Math.floor(mcu / this._mcusPerLine);
    const mcuCol = mcu % this._mcusPerLine;
    const blockRow = mcuRow * component.vSamples + row;
    const blockCol = mcuCol * component.hSamples + col;
    if (blockRow >= component.blocks.length) {
      return;
    }
    const numCols = component.blocks[blockRow].length;
    if (blockCol >= numCols) {
      return;
    }
    decodeFn.call(this, component, component.blocks[blockRow][blockCol]);
  }

  /**
   * Decodes a block of a JPEG component.
   * @param {JpegComponent} component - The JPEG component.
   * @param {DecodeFunction} decodeFn - The decode function.
   * @param {number} mcu - The MCU index.
   */
  private decodeBlock(
    component: JpegComponent,
    decodeFn: DecodeFunction,
    mcu: number
  ): void {
    const blockRow = Math.floor(mcu / component.blocksPerLine);
    const blockCol = mcu % component.blocksPerLine;
    decodeFn.call(this, component, component.blocks[blockRow][blockCol]);
  }

  /**
   * Decodes the JPEG scan.
   */
  public decode(): void {
    const componentsLength = this._components.length;
    let component: JpegComponent | undefined = undefined;
    let decodeFn: DecodeFunction | undefined = undefined;
    if (this._progressive) {
      if (this._spectralStart === 0) {
        decodeFn =
          this._successivePrev === 0
            ? this.decodeDCFirst
            : this.decodeDCSuccessive;
      } else {
        decodeFn =
          this._successivePrev === 0
            ? this.decodeACFirst
            : this.decodeACSuccessive;
      }
    } else {
      decodeFn = this.decodeBaseline;
    }

    let mcu = 0;

    let mcuExpected: number | undefined = undefined;
    if (componentsLength === 1) {
      mcuExpected =
        this._components[0].blocksPerLine * this._components[0].blocksPerColumn;
    } else {
      mcuExpected = this._mcusPerLine * this._frame.mcusPerColumn;
    }

    if (this._resetInterval === undefined || this._resetInterval === 0) {
      this._resetInterval = mcuExpected;
    }

    let h: number | undefined = undefined;
    let v: number | undefined = undefined;
    while (mcu < mcuExpected) {
      // Reset interval stuff
      for (let i = 0; i < componentsLength; i++) {
        this._components[i].pred = 0;
      }
      this._eobrun = 0;

      if (componentsLength === 1) {
        component = this._components[0];
        for (let n = 0; n < this._resetInterval; n++) {
          this.decodeBlock(component, decodeFn, mcu);
          mcu++;
        }
      } else {
        for (let n = 0; n < this._resetInterval; n++) {
          for (let i = 0; i < componentsLength; i++) {
            component = this.components[i];
            h = component.hSamples;
            v = component.vSamples;
            for (let j = 0; j < v; j++) {
              for (let k = 0; k < h; k++) {
                this.decodeMcu(component, decodeFn, mcu, j, k);
              }
            }
          }
          mcu++;
        }
      }

      // Find marker
      this._bitsCount = 0;
      const m1 = this._input.get(0);
      const m2 = this._input.get(1);
      if (m1 === 0xff) {
        if (m2 >= JpegMarker.rst0 && m2 <= JpegMarker.rst7) {
          this._input.skip(2);
        } else {
          break;
        }
      }
    }
  }
}
