/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { LibError } from '../../error/lib-error';
import { JpegComponentData } from './jpeg-component-data';
import { JpegAdobe } from './jpeg-adobe';
import { JpegComponent } from './jpeg-component';
import { JpegFrame } from './jpeg-frame';
import { JpegHuffman } from './jpeg-huffman';
import { JpegInfo } from './jpeg-info';
import { JpegJfif } from './jpeg-jfif';
import { JpegQuantize } from './jpeg-quantize';
import { JpegScan } from './jpeg-scan';
import { ExifData } from '../../exif/exif-data';
import { ArrayUtils } from '../../common/array-utils';
import { JpegMarker } from './jpeg-marker';
import { MemoryImage } from '../../image/image';
import { HuffmanNode } from './huffman-node';
import { HuffmanValue } from './huffman-value';
import { HuffmanParent } from './huffman-parent';

export class JpegData {
  public static readonly dctZigZag = [
    0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36,
    29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61,
    54, 47, 55, 62, 63,
    // extra entries for safety in decoder
    63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
  ];

  // The basic DCT block is 8x8 samples
  public static readonly dctSize = 8;
  // DCTSIZE squared; # of elements in a block
  public static readonly dctSize2 = 64;
  // Quantization tables are 0..3
  public static readonly numQuantizationTables = 4;
  // Huffman tables are numbered 0..3
  public static readonly numHuffmanTables = 4;
  // Arith-coding tables are numbered 0..15
  public static readonly numArithTables = 16;
  // JPEG limit on # of components in one scan
  public static readonly maxCompsInScan = 4;
  // JPEG limit on sampling factors
  public static readonly maxSamplingFactor = 4;

  private _input!: InputBuffer;
  public get input(): InputBuffer {
    return this._input;
  }

  private _jfif!: JpegJfif;
  public get jfif(): JpegJfif {
    return this._jfif;
  }

  private _adobe!: JpegAdobe;
  public get adobe(): JpegAdobe {
    return this._adobe;
  }

  private _frame?: JpegFrame;
  public get frame(): JpegFrame | undefined {
    return this._frame;
  }

  private _resetInterval!: number;
  public get resetInterval(): number {
    return this._resetInterval;
  }

  private _comment?: string;
  public get comment(): string | undefined {
    return this._comment;
  }

  private readonly _exifData: ExifData = new ExifData();
  public get exifData(): ExifData {
    return this._exifData;
  }

  private readonly _quantizationTables = ArrayUtils.fill<
    Int16Array | undefined
  >(JpegData.numQuantizationTables, undefined);
  public get quantizationTables(): Array<Int16Array | undefined> {
    return this._quantizationTables;
  }

  private readonly _frames = new Array<JpegFrame | undefined>();
  public get frames(): Array<JpegFrame | undefined> {
    return this._frames;
  }

  private readonly _huffmanTablesAC: Array<
    Array<HuffmanNode | undefined> | undefined
  > = [];
  public get huffmanTablesAC(): Array<
    Array<HuffmanNode | undefined> | undefined
  > {
    return this._huffmanTablesAC;
  }

  private readonly _huffmanTablesDC: Array<
    Array<HuffmanNode | undefined> | undefined
  > = [];
  public get huffmanTablesDC(): Array<
    Array<HuffmanNode | undefined> | undefined
  > {
    return this._huffmanTablesDC;
  }

  private readonly _components = new Array<JpegComponentData>();
  public get components(): Array<JpegComponentData> {
    return this._components;
  }

  public get width(): number {
    return this._frame!.samplesPerLine;
  }

  public get height(): number {
    return this._frame!.scanLines;
  }

  private readMarkers(): void {
    let marker = this.nextMarker();
    if (marker !== JpegMarker.soi) {
      // SOI (Start of Image)
      throw new LibError('Start Of Image marker not found.');
    }

    marker = this.nextMarker();
    while (marker !== JpegMarker.eoi && !this._input.isEOS) {
      const block = this.readBlock();
      switch (marker) {
        case JpegMarker.app0:
        case JpegMarker.app1:
        case JpegMarker.app2:
        case JpegMarker.app3:
        case JpegMarker.app4:
        case JpegMarker.app5:
        case JpegMarker.app6:
        case JpegMarker.app7:
        case JpegMarker.app8:
        case JpegMarker.app9:
        case JpegMarker.app10:
        case JpegMarker.app11:
        case JpegMarker.app12:
        case JpegMarker.app13:
        case JpegMarker.app14:
        case JpegMarker.app15:
        case JpegMarker.com:
          this.readAppData(marker, block);
          break;

        // DQT (Define Quantization Tables)
        case JpegMarker.dqt:
          this.readDQT(block);
          break;

        // SOF0 (Start of Frame, Baseline DCT)
        case JpegMarker.sof0:
        // SOF1 (Start of Frame, Extended DCT)
        // falls through
        case JpegMarker.sof1:
        // SOF2 (Start of Frame, Progressive DCT)
        // falls through
        case JpegMarker.sof2:
          this.readFrame(marker, block);
          break;

        case JpegMarker.sof3:
        case JpegMarker.sof5:
        case JpegMarker.sof6:
        case JpegMarker.sof7:
        case JpegMarker.jpg:
        case JpegMarker.sof9:
        case JpegMarker.sof10:
        case JpegMarker.sof11:
        case JpegMarker.sof13:
        case JpegMarker.sof14:
        case JpegMarker.sof15:
          throw new LibError(`Unhandled frame type ${marker.toString(16)}`);

        // DHT (Define Huffman Tables)
        case JpegMarker.dht:
          this.readDHT(block);
          break;

        // DRI (Define Restart Interval)
        case JpegMarker.dri:
          this.readDRI(block);
          break;

        // SOS (Start of Scan)
        case JpegMarker.sos:
          this.readSOS(block);
          break;

        // Fill bytes
        case 0xff:
          if (this._input.getByte(0) !== 0xff) {
            this._input.skip(-1);
          }
          break;

        default:
          if (
            this._input.getByte(-3) === 0xff &&
            this._input.getByte(-2) >= 0xc0 &&
            this._input.getByte(-2) <= 0xfe
          ) {
            // Could be incorrect encoding -- last 0xFF byte of the previous
            // block was eaten by the encoder
            this._input.skip(-3);
            break;
          }

          if (marker !== 0) {
            throw new LibError(`Unknown JPEG marker ${marker.toString(16)}`);
          }
          break;
      }

      marker = this.nextMarker();
    }
  }

  private skipBlock(): void {
    const length = this._input.readUint16();
    if (length < 2) {
      throw new LibError('Invalid Block');
    }
    this._input.skip(length - 2);
  }

  public validate(bytes: Uint8Array): boolean {
    this._input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });

    // Some other formats have embedded jpeg, or jpeg-like data.
    // Only validate if the image starts with the StartOfImage tag.
    const soiCheck = this._input.peekBytes(2);
    if (soiCheck.getByte(0) !== 0xff || soiCheck.getByte(1) !== 0xd8) {
      return false;
    }

    let marker = this.nextMarker();
    if (marker !== JpegMarker.soi) {
      return false;
    }

    let hasSOF = false;
    let hasSOS = false;

    marker = this.nextMarker();
    while (marker !== JpegMarker.eoi && !this._input.isEOS) {
      // EOI (End of image)
      const sectionByteSize = this._input.readUint16();
      if (sectionByteSize < 2) {
        // Jpeg section consists of more than 2 bytes at least
        // return success only when SOF and SOS have already found (as a jpeg without EOF)
        break;
      }

      this._input.skip(sectionByteSize - 2);

      switch (marker) {
        // SOF0 (Start of Frame, Baseline DCT)
        case JpegMarker.sof0:
        // SOF1 (Start of Frame, Extended DCT)
        // falls through
        case JpegMarker.sof1:
        // SOF2 (Start of Frame, Progressive DCT)
        // falls through
        case JpegMarker.sof2:
          hasSOF = true;
          break;
        // SOS (Start of Scan)
        case JpegMarker.sos:
          hasSOS = true;
          break;
        default:
      }

      marker = this.nextMarker();
    }

    return hasSOF && hasSOS;
  }

  public readInfo(bytes: Uint8Array): JpegInfo | undefined {
    this._input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });

    let marker = this.nextMarker();
    if (marker !== JpegMarker.soi) {
      return undefined;
    }

    const info = new JpegInfo();

    let hasSOF = false;
    let hasSOS = false;

    marker = this.nextMarker();
    while (marker !== JpegMarker.eoi && !this._input.isEOS) {
      // EOI (End of image)
      switch (marker) {
        // SOF0 (Start of Frame, Baseline DCT)
        case JpegMarker.sof0:
        // SOF1 (Start of Frame, Extended DCT)
        // falls through
        case JpegMarker.sof1:
        // SOF2 (Start of Frame, Progressive DCT)
        // falls through
        case JpegMarker.sof2:
          hasSOF = true;
          this.readFrame(marker, this.readBlock());
          break;
        // SOS (Start of Scan)
        case JpegMarker.sos:
          hasSOS = true;
          this.skipBlock();
          break;
        default:
          this.skipBlock();
          break;
      }

      marker = this.nextMarker();
    }

    if (this._frame !== undefined) {
      info.setSize(this._frame.samplesPerLine, this._frame.scanLines);
      this._frame = undefined;
    }

    this.frames.length = 0;

    return hasSOF && hasSOS ? info : undefined;
  }

  public read(bytes: Uint8Array): void {
    this._input = new InputBuffer({
      buffer: bytes,
      bigEndian: true,
    });

    this.readMarkers();

    if (this._frames.length !== 1) {
      throw new LibError('Only single frame JPEGs supported');
    }

    if (this._frame !== undefined) {
      for (let i = 0; i < this._frame.componentsOrder.length; ++i) {
        const component = this._frame.components.get(
          this._frame.componentsOrder[i]
        );
        if (component !== undefined) {
          this.components.push(
            new JpegComponentData(
              component.hSamples,
              this._frame.maxHSamples,
              component.vSamples,
              this._frame.maxVSamples,
              JpegData.buildComponentData(component)
            )
          );
        }
      }
    }
  }

  getImage(): MemoryImage {
    return JpegQuantize.getImageFromJpeg(this);
  }

  private static buildHuffmanTable(
    codeLengths: Uint8Array,
    values: Uint8Array
  ): Array<HuffmanNode | undefined> {
    let k = 0;
    const code = new Array<JpegHuffman>();
    let length = 16;

    while (length > 0 && codeLengths[length - 1] === 0) {
      length--;
    }

    code.push(new JpegHuffman());

    let p: JpegHuffman = code[0];
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < codeLengths[i]; j++) {
        p = code.pop()!;
        if (p.children.length <= p.index) {
          p.children.length = p.index + 1;
        }
        p.children[p.index] = new HuffmanValue(values[k]);
        while (p.index > 0) {
          p = code.pop()!;
        }
        p.incrementIndex();
        code.push(p);
        while (code.length <= i) {
          const q = new JpegHuffman();
          code.push(q);
          if (p.children.length <= p.index) {
            p.children.length = p.index + 1;
          }
          p.children[p.index] = new HuffmanParent(q.children);
          p = q;
        }
        k++;
      }

      if (i + 1 < length) {
        // P here points to last code
        const q = new JpegHuffman();
        code.push(q);
        if (p.children.length <= p.index) {
          p.children.length = p.index + 1;
        }
        p.children[p.index] = new HuffmanParent(q.children);
        p = q;
      }
    }

    return code[0].children;
  }

  private static buildComponentData(
    component: JpegComponent
  ): Array<Uint8Array | undefined> {
    const blocksPerLine = component.blocksPerLine;
    const blocksPerColumn = component.blocksPerColumn;
    const samplesPerLine = blocksPerLine << 3;
    const R = new Int32Array(64);
    const r = new Uint8Array(64);
    const lines = ArrayUtils.fill<Uint8Array | undefined>(
      blocksPerColumn * 8,
      undefined
    );

    let l = 0;
    for (let blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      const scanLine = blockRow << 3;
      for (let i = 0; i < 8; i++) {
        lines[l++] = new Uint8Array(samplesPerLine);
      }

      for (let blockCol = 0; blockCol < blocksPerLine; blockCol++) {
        JpegQuantize.quantizeAndInverse(
          component.quantizationTable!,
          component.blocks[blockRow][blockCol],
          r,
          R
        );

        let offset = 0;
        const sample = blockCol << 3;
        for (let j = 0; j < 8; j++) {
          const line = lines[scanLine + j];
          for (let i = 0; i < 8; i++) {
            line![sample + i] = r[offset++];
          }
        }
      }
    }

    return lines;
  }

  public static toFix(val: number): number {
    const fixedPoint = 20;
    const one = 1 << fixedPoint;
    return Math.trunc(val * one) & 0xffffffff;
  }

  private readBlock(): InputBuffer {
    const length = this._input.readUint16();
    if (length < 2) {
      throw new LibError('Invalid Block');
    }
    return this._input.readBytes(length - 2);
  }

  private nextMarker(): number {
    let c = 0;
    if (this._input.isEOS) {
      return c;
    }

    do {
      do {
        c = this._input.readByte();
      } while (c !== 0xff && !this._input.isEOS);

      if (this._input.isEOS) {
        return c;
      }

      do {
        c = this._input.readByte();
      } while (c === 0xff && !this._input.isEOS);
    } while (c === 0 && !this._input.isEOS);

    return c;
  }

  private readExifData(block: InputBuffer): void {
    // Exif Header
    // Exif\0\0
    const exifSignature = 0x45786966;
    const signature = block.readUint32();
    if (signature !== exifSignature) {
      return;
    }
    if (block.readUint16() !== 0) {
      return;
    }

    this.exifData.read(block);
  }

  private readAppData(marker: number, block: InputBuffer): void {
    const appData = block;

    if (marker === JpegMarker.app0) {
      // 'JFIF\0'
      if (
        appData.getByte(0) === 0x4a &&
        appData.getByte(1) === 0x46 &&
        appData.getByte(2) === 0x49 &&
        appData.getByte(3) === 0x46 &&
        appData.getByte(4) === 0
      ) {
        const majorVersion = appData.getByte(5);
        const minorVersion = appData.getByte(6);
        const densityUnits = appData.getByte(7);
        const xDensity = (appData.getByte(8) << 8) | appData.getByte(9);
        const yDensity = (appData.getByte(10) << 8) | appData.getByte(11);
        const thumbWidth = appData.getByte(12);
        const thumbHeight = appData.getByte(13);

        const thumbSize = 3 * thumbWidth * thumbHeight;
        const thumbData = appData.subarray(14 + thumbSize, undefined, 14);

        this._jfif = new JpegJfif(
          thumbWidth,
          thumbHeight,
          majorVersion,
          minorVersion,
          densityUnits,
          xDensity,
          yDensity,
          thumbData
        );
      }
    } else if (marker === JpegMarker.app1) {
      // 'EXIF\0'
      this.readExifData(appData);
    } else if (marker === JpegMarker.app14) {
      // 'Adobe\0'
      if (
        appData.getByte(0) === 0x41 &&
        appData.getByte(1) === 0x64 &&
        appData.getByte(2) === 0x6f &&
        appData.getByte(3) === 0x62 &&
        appData.getByte(4) === 0x65 &&
        appData.getByte(5) === 0
      ) {
        const version = appData.getByte(6);
        const flags0 = (appData.getByte(7) << 8) | appData.getByte(8);
        const flags1 = (appData.getByte(9) << 8) | appData.getByte(10);
        const transformCode = appData.getByte(11);
        this._adobe = new JpegAdobe(version, flags0, flags1, transformCode);
      }
    } else if (marker === JpegMarker.com) {
      // Comment
      try {
        this._comment = appData.readStringUtf8();
      } catch (_) {
        // ReadString without 0x00 terminator causes exception. Technically
        // bad data, but no reason to abort the rest of the image decoding.
      }
    }
  }

  private readDQT(block: InputBuffer): void {
    while (!block.isEOS) {
      let n = block.readByte();
      const prec = n >> 4;
      n &= 0x0f;

      if (n >= JpegData.numQuantizationTables) {
        throw new LibError('Invalid number of quantization tables');
      }

      if (this._quantizationTables[n] === undefined) {
        this._quantizationTables[n] = new Int16Array(64);
      }

      const tableData = this._quantizationTables[n];
      if (tableData !== undefined) {
        for (let i = 0; i < JpegData.dctSize2; i++) {
          const tmp: number =
            prec !== 0 ? block.readUint16() : block.readByte();
          tableData[JpegData.dctZigZag[i]] = tmp;
        }
      }
    }

    if (!block.isEOS) {
      throw new LibError('Bad length for DQT block');
    }
  }

  private readFrame(marker: number, block: InputBuffer): void {
    if (this._frame !== undefined) {
      throw new LibError('Duplicate JPG frame data found.');
    }

    const extended = marker === JpegMarker.sof1;
    const progressive = marker === JpegMarker.sof2;
    const precision = block.readByte();
    const scanLines = block.readUint16();
    const samplesPerLine = block.readUint16();

    const numComponents = block.readByte();
    const components = new Map<number, JpegComponent>();
    const componentsOrder = new Array<number>();
    for (let i = 0; i < numComponents; i++) {
      const componentId = block.readByte();
      const x = block.readByte();
      const h = (x >> 4) & 15;
      const v = x & 15;
      const qId = block.readByte();
      componentsOrder.push(componentId);
      const component = new JpegComponent(h, v, this._quantizationTables, qId);
      components.set(componentId, component);
    }

    this._frame = new JpegFrame(
      components,
      componentsOrder,
      extended,
      progressive,
      precision,
      scanLines,
      samplesPerLine
    );

    this._frame.prepare();

    this.frames.push(this._frame);
  }

  private readDHT(block: InputBuffer): void {
    while (!block.isEOS) {
      let index = block.readByte();

      const bits = new Uint8Array(16);
      let count = 0;
      for (let j = 0; j < 16; j++) {
        bits[j] = block.readByte();
        count += bits[j];
      }

      const huffmanValues = block.readBytes(count).toUint8Array();

      let ht: Array<Array<HuffmanNode | undefined> | undefined> = [];
      if ((index & 0x10) !== 0) {
        // AC table definition
        index -= 0x10;
        ht = this._huffmanTablesAC;
      } else {
        // DC table definition
        ht = this._huffmanTablesDC;
      }

      if (ht.length <= index) {
        ht.length = index + 1;
      }

      ht[index] = JpegData.buildHuffmanTable(bits, huffmanValues);
    }
  }

  private readDRI(block: InputBuffer): void {
    this._resetInterval = block.readUint16();
  }

  private readSOS(block: InputBuffer): void {
    const n = block.readByte();
    if (n < 1 || n > JpegData.maxCompsInScan) {
      throw new LibError('Invalid SOS block');
    }

    const components = new Array<JpegComponent>();
    for (let i = 0; i < n; i++) {
      const id = block.readByte();
      const c = block.readByte();

      if (!this._frame!.components.has(id)) {
        throw new LibError('Invalid Component in SOS block');
      }
      const component = this._frame!.components.get(id);
      if (component !== undefined) {
        const dcTableNumber = (c >> 4) & 15;
        const acTableNumber = c & 15;
        if (dcTableNumber < this._huffmanTablesDC.length) {
          component.huffmanTableDC = this._huffmanTablesDC[dcTableNumber]!;
        }
        if (acTableNumber < this._huffmanTablesAC.length) {
          component.huffmanTableAC = this._huffmanTablesAC[acTableNumber]!;
        }
        components.push(component);
      }
    }

    const spectralStart = block.readByte();
    const spectralEnd = block.readByte();
    const successiveApproximation = block.readByte();

    const ah = (successiveApproximation >> 4) & 15;
    const al = successiveApproximation & 15;

    const scan = new JpegScan(
      this._input,
      this._frame!,
      components,
      spectralStart,
      spectralEnd,
      ah,
      al,
      this._resetInterval
    );
    scan.decode();
  }
}
