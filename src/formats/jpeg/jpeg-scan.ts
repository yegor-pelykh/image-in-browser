/**
 * /* eslint-disable @typescript-eslint/no-non-null-assertion
 *
 * @format
 */

/** @format */

import { ImageError } from '../../error/image-error';
import { InputBuffer } from '../util/input-buffer';
import { Jpeg } from './jpeg';
import { JpegComponent } from './jpeg-component';
import { JpegFrame } from './jpeg-frame';

type DecodeFunction = (component: JpegComponent, block: Int32Array) => void;

export class JpegScan {
  private _input: InputBuffer;
  public get input(): InputBuffer {
    return this._input;
  }

  private _frame: JpegFrame;
  public get frame(): JpegFrame {
    return this._frame;
  }

  private _precision: number;
  public get precision(): number {
    return this._precision;
  }

  private _samplesPerLine: number;
  public get samplesPerLine(): number {
    return this._samplesPerLine;
  }

  private _scanLines: number;
  public get scanLines(): number {
    return this._scanLines;
  }

  private _mcusPerLine: number;
  public get mcusPerLine(): number {
    return this._mcusPerLine;
  }

  private _progressive: boolean;
  public get progressive(): boolean {
    return this._progressive;
  }

  private _maxH: number;
  public get maxH(): number {
    return this._maxH;
  }

  private _maxV: number;
  public get maxV(): number {
    return this._maxV;
  }

  private _components: Array<JpegComponent>;
  public get components(): Array<JpegComponent> {
    return this._components;
  }

  private _resetInterval?: number;
  public get resetInterval(): number | undefined {
    return this._resetInterval;
  }

  private _spectralStart: number;
  public get spectralStart(): number {
    return this._spectralStart;
  }

  private _spectralEnd: number;
  public get spectralEnd(): number {
    return this._spectralEnd;
  }

  private _successivePrev: number;
  public get successivePrev(): number {
    return this._successivePrev;
  }

  private _successive: number;
  public get successive(): number {
    return this._successive;
  }

  private _bitsData = 0;
  public get bitsData(): number {
    return this._bitsData;
  }

  private _bitsCount = 0;
  public get bitsCount(): number {
    return this._bitsCount;
  }

  private _eobrun = 0;
  public get eobrun(): number {
    return this._eobrun;
  }

  private _successiveACState = 0;
  public get successiveACState(): number {
    return this._successiveACState;
  }

  private _successiveACNextValue = 0;
  public get successiveACNextValue(): number {
    return this._successiveACNextValue;
  }

  constructor(
    input: InputBuffer,
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

  private readBit(): number | undefined {
    if (this.bitsCount > 0) {
      this._bitsCount--;
      return (this._bitsData >> this._bitsCount) & 1;
    }

    if (this._input.isEOS) {
      return undefined;
    }

    this._bitsData = this._input.readByte();
    if (this._bitsData === 0xff) {
      const nextByte = this.input.readByte();
      if (nextByte !== 0) {
        throw new ImageError(
          `unexpected marker: ${((this._bitsData << 8) | nextByte).toString(
            16
          )}`
        );
      }
    }

    this._bitsCount = 7;
    return (this._bitsData >> 7) & 1;
  }

  private decodeHuffman(tree: []): number | undefined {
    let node = tree;
    let bit: number | undefined = undefined;
    while ((bit = this.readBit()) !== undefined) {
      node = node[bit];
      if (typeof node === 'number') {
        return Math.trunc(node);
      }
    }
    return undefined;
  }

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

  private receiveAndExtend(length: number | undefined): number {
    if (length === 1) {
      return this.readBit() === 1 ? 1 : -1;
    }
    const n = this.receive(length!)!;
    if (n >= 1 << ((length ?? 0) - 1)) {
      return n;
    }
    return n + (-1 << (length ?? 0)) + 1;
  }

  private decodeBaseline(component: JpegComponent, zz: Int32Array): void {
    const t = this.decodeHuffman(component.huffmanTableDC);
    const diff = t === 0 ? 0 : this.receiveAndExtend(t);
    component.pred += diff;
    zz[0] = component.pred;

    let k = 1;
    while (k < 64) {
      const rs = this.decodeHuffman(component.huffmanTableAC)!;
      let s = rs & 15;
      const r = rs >> 4;
      if (s === 0) {
        if (r < 15) {
          break;
        }
        k += 16;
        continue;
      }

      k += r;

      s = this.receiveAndExtend(s);

      const z = Jpeg.dctZigZag[k];
      zz[z] = s;
      k++;
    }
  }

  private decodeDCFirst(component: JpegComponent, zz: Int32Array): void {
    const t = this.decodeHuffman(component.huffmanTableDC);
    const diff = t === 0 ? 0 : this.receiveAndExtend(t) << this._successive;
    component.pred += diff;
    zz[0] = component.pred;
  }

  private decodeDCSuccessive(_: JpegComponent, zz: Int32Array): void {
    zz[0] |= this.readBit()! << this._successive;
  }

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
      const r = rs >> 4;
      if (s === 0) {
        if (r < 15) {
          this._eobrun = this.receive(r)! + (1 << r) - 1;
          break;
        }
        k += 16;
        continue;
      }
      k += r;
      const z = Jpeg.dctZigZag[k];
      zz[z] = this.receiveAndExtend(s) * (1 << this._successive);
      k++;
    }
  }

  private decodeACSuccessive(component: JpegComponent, zz: Int32Array): void {
    let k = this._spectralStart;
    const e = this._spectralEnd;
    let s = 0;
    let r = 0;
    while (k <= e) {
      const z = Jpeg.dctZigZag[k];
      switch (this._successiveACState) {
        case 0: {
          // Initial state
          const rs = this.decodeHuffman(component.huffmanTableAC);
          if (rs === undefined) {
            throw new ImageError('Invalid progressive encoding');
          }
          s = rs & 15;
          r = rs >> 4;
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
              throw new ImageError('invalid ACn encoding');
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

  private decodeBlock(
    component: JpegComponent,
    decodeFn: DecodeFunction,
    mcu: number
  ): void {
    const blockRow = Math.floor(mcu / component.blocksPerLine);
    const blockCol = mcu % component.blocksPerLine;
    decodeFn.call(this, component, component.blocks[blockRow][blockCol]);
  }

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
      const m1 = this._input.getByte(0);
      const m2 = this._input.getByte(1);
      if (m1 === 0xff) {
        if (m2 >= Jpeg.M_RST0 && m2 <= Jpeg.M_RST7) {
          this._input.skip(2);
        } else {
          break;
        }
      }
    }
  }
}
