/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { JpegComponentData } from './jpeg-component-data.js';
import { JpegAdobe } from './jpeg-adobe.js';
import { JpegComponent } from './jpeg-component.js';
import { JpegFrame } from './jpeg-frame.js';
import { JpegHuffman } from './jpeg-huffman.js';
import { JpegInfo } from './jpeg-info.js';
import { JpegJfif } from './jpeg-jfif.js';
import { JpegQuantize } from './jpeg-quantize.js';
import { JpegScan } from './jpeg-scan.js';
import { JpegImageWriter } from './jpeg-image-writer.js';
import { ExifData } from '../../exif/exif-data.js';
import { ArrayUtils } from '../../common/array-utils.js';
import { JpegMarker } from './jpeg-marker.js';
import { MemoryImage } from '../../image/image.js';
import { HuffmanNode } from './huffman-node.js';
import { HuffmanValue } from './huffman-value.js';
import { HuffmanParent } from './huffman-parent.js';
import { huffmanLookup } from './huffman-lookup.js';
import { IccProfile } from '../../image/icc-profile.js';
import { IccProfileCompression } from '../../image/icc-profile-compression.js';

/**
 * Class representing JPEG data.
 */
export class JpegData {
  /**
   * Zigzag order for DCT coefficients.
   */
  public static readonly dctZigZag = [
    0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36,
    29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61,
    54, 47, 55, 62, 63,
    // extra entries for safety in decoder
    63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
  ];

  /**
   * The basic DCT block is 8x8 samples.
   */
  public static readonly dctSize = 8;
  /**
   * DCTSIZE squared; # of elements in a block.
   */
  public static readonly dctSize2 = 64;
  /**
   * Quantization tables are 0..3.
   */
  public static readonly numQuantizationTables = 4;
  /**
   * Huffman tables are numbered 0..3.
   */
  public static readonly numHuffmanTables = 4;
  /**
   * Arith-coding tables are numbered 0..15.
   */
  public static readonly numArithTables = 16;
  /**
   * JPEG limit on # of components in one scan.
   */
  public static readonly maxCompsInScan = 4;
  /**
   * JPEG limit on sampling factors.
   */
  public static readonly maxSamplingFactor = 4;

  /**
   * The maximum number of pixels (width * height) {@link read} will decode.
   * Frames declaring more throw a {@link LibError} before any pixel data is
   * allocated. A value <= 0 disables the limit.
   */
  private _maxPixels = 0;

  /**
   * Gets the maximum number of pixels (width * height) {@link read} will
   * decode.
   */
  public get maxPixels(): number {
    return this._maxPixels;
  }

  /**
   * Sets the maximum number of pixels (width * height) {@link read} will
   * decode.
   */
  public set maxPixels(v: number) {
    this._maxPixels = v;
  }

  /**
   * The factor the image is scaled down by while decoding: 1, 2, 4 or 8.
   * Scaling reduces the work and memory of the inverse DCT output and the
   * decoded image, making it a fast way to decode a thumbnail.
   */
  private _scale = 1;

  /**
   * Gets the factor the image is scaled down by while decoding.
   */
  public get scale(): number {
    return this._scale;
  }

  /**
   * Sets the factor the image is scaled down by while decoding.
   */
  public set scale(v: number) {
    this._scale = v;
  }

  private _input!: InputBuffer<Uint8Array>;
  public get input(): InputBuffer<Uint8Array> {
    return this._input;
  }

  private _jfif: JpegJfif | undefined;
  public get jfif(): JpegJfif | undefined {
    return this._jfif;
  }

  private _adobe: JpegAdobe | undefined;
  public get adobe(): JpegAdobe | undefined {
    return this._adobe;
  }

  private _frame: JpegFrame | undefined;
  public get frame(): JpegFrame | undefined {
    return this._frame;
  }

  private _resetInterval: number | undefined;
  public get resetInterval(): number | undefined {
    return this._resetInterval;
  }

  private _comment: string | undefined;
  public get comment(): string | undefined {
    return this._comment;
  }

  private _iccProfile: IccProfile | undefined;
  public get iccProfile(): IccProfile | undefined {
    return this._iccProfile;
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

  private _prepared = false;

  private _allowStreaming = false;

  private _restartNeeded = false;

  private _writer?: JpegImageWriter;

  private readonly _bandLines = new Array<Array<Uint8Array>>();

  private readonly _bandR = new Uint8Array(64);

  private readonly _bandRInt = new Int32Array(64);

  private _zeros = new Int16Array(0);

  public get width(): number {
    return this._frame!.samplesPerLine;
  }

  public get height(): number {
    return this._frame!.scanLines;
  }

  /**
   * The width of the decoded image, {@link width} divided by {@link scale}.
   */
  public get scaledWidth(): number {
    return Math.trunc((this.width + this._scale - 1) / this._scale);
  }

  /**
   * The height of the decoded image, {@link height} divided by {@link scale}.
   */
  public get scaledHeight(): number {
    return Math.trunc((this.height + this._scale - 1) / this._scale);
  }

  /**
   * Reads JPEG markers from the input buffer.
   */
  private readMarkers(): void {
    let marker = this.nextMarker();
    if (marker !== JpegMarker.soi) {
      // SOI (Start of Image)
      throw new LibError('Start Of Image marker not found.');
    }

    marker = this.nextMarker();
    while (marker !== JpegMarker.eoi && !this._input.isEOS) {
      // RSTn and TEM markers are standalone and have no length or payload.
      if (
        (marker >= JpegMarker.rst0 && marker <= JpegMarker.rst7) ||
        marker === JpegMarker.tem
      ) {
        marker = this.nextMarker();
        continue;
      }

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
        case 0xff as JpegMarker:
          if (this._input.get(0) !== 0xff) {
            this._input.skip(-1);
          }
          break;

        default:
          if (
            this._input.get(-3) === 0xff &&
            this._input.get(-2) >= 0xc0 &&
            this._input.get(-2) <= 0xfe
          ) {
            // Could be incorrect encoding -- last 0xFF byte of the previous
            // block was eaten by the encoder
            this._input.skip(-3);
            break;
          }

          {
            const markerValue: number = marker;
            if (markerValue !== 0) {
              throw new LibError(`Unknown JPEG marker ${marker.toString(16)}`);
            }
          }
          break;
      }

      marker = this.nextMarker();
    }
  }

  /**
   * Skips a block in the input buffer.
   */
  private skipBlock(): void {
    const length = this._input.readUint16();
    if (length < 2) {
      throw new LibError('Invalid Block');
    }
    this._input.skip(length - 2);
  }

  /**
   * Validates the JPEG data.
   * @param {Uint8Array} bytes - The input byte array.
   * @returns {boolean} True if the data is valid JPEG, otherwise false.
   */
  public validate(bytes: Uint8Array): boolean {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
      bigEndian: true,
    });

    // Some other formats have embedded jpeg, or jpeg-like data.
    // Only validate if the image starts with the StartOfImage tag.
    const soiCheck = this._input.peek(2);
    if (soiCheck.get(0) !== 0xff || soiCheck.get(1) !== 0xd8) {
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
          if (hasSOF) {
            return true;
          }
          hasSOS = true;
          break;
        default:
      }

      marker = this.nextMarker();
    }

    return hasSOF && hasSOS;
  }

  /**
   * Reads JPEG information from the input byte array.
   * @param {Uint8Array} bytes - The input byte array.
   * @returns {JpegInfo | undefined} The JPEG information or undefined if invalid.
   */
  public readInfo(bytes: Uint8Array): JpegInfo | undefined {
    this._input = new InputBuffer<Uint8Array>({
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
          this.readFrame(marker, this.readBlock(), false);
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
      info.numComponents = this._frame.components.size;
      this._frame = undefined;
    }

    this.frames.length = 0;

    return hasSOF && hasSOS ? info : undefined;
  }

  /**
   * Reads JPEG data from the input byte array.
   * @param {Uint8Array} bytes - The input byte array.
   * @throws {LibError} Only single frame JPEGs supported.
   */
  public read(bytes: Uint8Array): void {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
      bigEndian: true,
    });

    this.readMarkers();

    if (this._frames.length !== 1) {
      throw new LibError('Only single frame JPEGs supported');
    }

    const f = this._frame!;
    if (this._writer !== undefined) {
      // The image was decoded a band at a time.
      return;
    }
    if (!this._prepared) {
      // No scans: the coefficients are all zero.
      this._prepared = true;
      f.prepare({ dcOnly: this._scale === 8 });
    }
    for (let i = 0; i < f.componentsOrder.length; ++i) {
      const component = f.components.get(f.componentsOrder[i]);
      if (component !== undefined) {
        this.components.push(
          new JpegComponentData(
            component.hSamples,
            f.maxHSamples,
            component.vSamples,
            f.maxVSamples,
            this.buildComponentData(component)
          )
        );
      }
    }
  }

  /**
   * Gets the image from the JPEG data.
   * @returns {MemoryImage} The memory image.
   */
  getImage(): MemoryImage {
    return JpegQuantize.getImageFromJpeg(this);
  }

  /**
   * Builds a Huffman table.
   * @param {Uint8Array} codeLengths - The code lengths.
   * @param {Uint8Array} values - The values.
   * @returns {Array<HuffmanNode | undefined>} The Huffman table.
   */
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
        p.children[p.index] = new HuffmanValue(values[k]);
        while (p.index > 0) {
          p = code.pop()!;
        }
        p.incrementIndex();
        code.push(p);
        while (code.length <= i) {
          const q = new JpegHuffman();
          code.push(q);
          p.children[p.index] = new HuffmanParent(q.children);
          p = q;
        }
        k++;
      }

      if (i + 1 < length) {
        const q = new JpegHuffman();
        code.push(q);
        p.children[p.index] = new HuffmanParent(q.children);
        p = q;
      }
    }

    return code[0].children;
  }

  /**
   * Builds component data.
   * @param {JpegComponent} component - The JPEG component.
   * @returns {Array<Uint8Array | undefined>} The component data.
   */
  private buildComponentData(
    component: JpegComponent
  ): Array<Uint8Array | undefined> {
    const blocksPerLine = component.blocksPerLine;
    const blocksPerColumn = component.blocksPerColumn;
    // The size of a decoded block.
    const bs = Math.trunc(8 / this._scale);
    const samplesPerLine = blocksPerLine * bs;
    const R = new Int32Array(64);
    const r = new Uint8Array(64);
    const lines = ArrayUtils.fill<Uint8Array | undefined>(
      blocksPerColumn * bs,
      undefined
    );
    for (let blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      for (let i = 0; i < bs; i++) {
        lines[blockRow * bs + i] = new Uint8Array(samplesPerLine);
      }
      this.buildBlockRow(component, blockRow, lines, blockRow * bs, r, R);
    }

    // The coefficients are no longer needed once the lines are built.
    component.coefficients = new Int16Array(0);

    return lines;
  }

  /**
   * Decodes the blocks of row {@link coeffRow} of
   * {@link JpegComponent.coefficients} into the lines of {@link lines}
   * starting at {@link scanLine}.
   * @param {JpegComponent} component - The JPEG component.
   * @param {number} coeffRow - The row of coefficient blocks to decode.
   * @param {Array<Uint8Array | undefined>} lines - The lines to decode into.
   * @param {number} scanLine - The first line to decode into.
   * @param {Uint8Array} r - The scratch block output.
   * @param {Int32Array} R - The scratch DCT data.
   */
  private buildBlockRow(
    component: JpegComponent,
    coeffRow: number,
    lines: Array<Uint8Array | undefined>,
    scanLine: number,
    r: Uint8Array,
    R: Int32Array
  ): void {
    const bs = Math.trunc(8 / this._scale);
    const coefficients = component.coefficients;
    const blocksPerLineForMcu = component.blocksPerLineForMcu;
    const quantizationTable = component.quantizationTable!;
    for (let blockCol = 0; blockCol < component.blocksPerLine; blockCol++) {
      const block = coeffRow * blocksPerLineForMcu + blockCol;
      const offset = block << 6;
      if (bs === 1) {
        // A block scaled to one pixel is its average, given by the DC
        // coefficient alone.
        const dc = coefficients[component.dcOnly ? block : offset];
        lines[scanLine]![blockCol] = JpegData.dcValue(
          dc * quantizationTable[0]
        );
        continue;
      }

      JpegQuantize.quantizeAndInverse(
        quantizationTable,
        coefficients,
        offset,
        r,
        R
      );

      const sample = blockCol * bs;
      if (bs === 8) {
        for (let j = 0; j < 8; j++) {
          ArrayUtils.copyRange(r, j << 3, lines[scanLine + j]!, sample, 8);
        }
      } else {
        JpegData.scaleBlock(r, bs, lines, scanLine, sample);
      }
    }
  }

  /**
   * Decodes {@link bytes} to a {@link MemoryImage}. Baseline images are
   * decoded a band of rows at a time when they can be, which needs much less
   * memory than {@link read} followed by {@link getImage}, as the coefficients
   * and lines of the whole image aren't kept.
   * @param {Uint8Array} bytes - The bytes of the JPEG image.
   * @returns {MemoryImage} The decoded image.
   */
  public decodeImage(bytes: Uint8Array): MemoryImage {
    this._allowStreaming = true;
    try {
      this.read(bytes);
    } catch (e) {
      if (e instanceof RestartDecode) {
        return this.decodeFully(bytes);
      }
      throw e;
    }
    const writer = this._writer;
    if (writer === undefined) {
      return this.getImage();
    }
    if (this._restartNeeded) {
      return this.decodeFully(bytes);
    }
    writer.image.iccProfile = this.iccProfile;
    return writer.image;
  }

  /**
   * Decodes {@link bytes} with a new JpegData that doesn't decode in bands.
   * @param {Uint8Array} bytes - The bytes of the JPEG image.
   * @returns {MemoryImage} The decoded image.
   */
  private decodeFully(bytes: Uint8Array): MemoryImage {
    const jpeg = new JpegData();
    jpeg.maxPixels = this._maxPixels;
    jpeg.scale = this._scale;
    jpeg.read(bytes);
    return jpeg.getImage();
  }

  /**
   * Sets up decoding the image a band (a row of MCUs) at a time.
   * @param {JpegFrame} f - The JPEG frame.
   */
  private startBands(f: JpegFrame): void {
    const bs = Math.trunc(8 / this._scale);
    this._bandLines.length = 0;
    for (const id of f.componentsOrder) {
      const component = f.components.get(id)!;
      this.components.push(
        new JpegComponentData(
          component.hSamples,
          f.maxHSamples,
          component.vSamples,
          f.maxVSamples,
          ArrayUtils.fill<Uint8Array | undefined>(
            component.blocksPerColumn * bs,
            undefined
          )
        )
      );
      this._bandLines.push(
        ArrayUtils.generate<Uint8Array>(
          component.vSamples * bs,
          () => new Uint8Array(component.blocksPerLine * bs)
        )
      );
    }
    this._writer = new JpegImageWriter(this);
  }

  /**
   * Decodes band {@link row} of the image, and converts its rows of pixels.
   * @param {number} row - The band row.
   */
  private decodeBand(row: number): void {
    const f = this._frame!;
    const bs = Math.trunc(8 / this._scale);
    for (let ci = 0; ci < f.componentsOrder.length; ++ci) {
      const component = f.components.get(f.componentsOrder[ci])!;
      const lines = this.components[ci].lines;
      const bandLines = this._bandLines[ci];
      for (let r = 0; r < component.vSamples; ++r) {
        const blockRow = row * component.vSamples + r;
        if (blockRow >= component.blocksPerColumn) {
          break;
        }
        for (let j = 0; j < bs; ++j) {
          lines[blockRow * bs + j] = bandLines[r * bs + j];
        }
        this.buildBlockRow(
          component,
          r,
          lines,
          blockRow * bs,
          this._bandR,
          this._bandRInt
        );
      }
      // The next band starts with zero coefficients. (Copying zeros is much
      // faster than fillRange.)
      const coefficients = component.coefficients;
      if (this._zeros.length < coefficients.length) {
        this._zeros = new Int16Array(coefficients.length);
      }
      coefficients.set(this._zeros.subarray(0, coefficients.length));
    }

    const rowsPerBand = f.maxVSamples * bs;
    const y0 = row * rowsPerBand;
    const y1 = Math.min(y0 + rowsPerBand, this.scaledHeight);
    if (y0 < y1) {
      this._writer!.writeRows(y0, y1);
    }

    // The band's line buffers are reused by the next band.
    for (let ci = 0; ci < f.componentsOrder.length; ++ci) {
      const component = f.components.get(f.componentsOrder[ci])!;
      const lines = this.components[ci].lines;
      const first = row * component.vSamples * bs;
      for (
        let i = first;
        i < first + component.vSamples * bs && i < lines.length;
        ++i
      ) {
        lines[i] = undefined;
      }
    }
  }

  /**
   * The value of each pixel of a block with only the DC coefficient
   * {@link p0} (dequantized), as {@link JpegQuantize.quantizeAndInverse}
   * computes it. Floor division of doubles, which are exact here, is used
   * instead of shifts, which would overflow 32 bits on the web.
   * @param {number} p0 - The dequantized DC coefficient.
   * @returns {number} The pixel value.
   */
  private static dcValue(p0: number): number {
    const t = Math.floor((5793 * p0 + 512) / 1024);
    const t2 = Math.floor((5793 * t + 8192) / 16384);
    const v = 128 + Math.floor((t2 + 8) / 16);
    return v < 0 ? 0 : v > 255 ? 255 : v;
  }

  /**
   * Averages the 8x8 block {@link r} down to bs x bs pixels at {@link sample}
   * of {@link lines}, starting at {@link scanLine}.
   * @param {Uint8Array} r - The decoded 8x8 block.
   * @param {number} bs - The size of a decoded block.
   * @param {Array<Uint8Array | undefined>} lines - The lines to decode into.
   * @param {number} scanLine - The first line to decode into.
   * @param {number} sample - The first sample of the block in the line.
   */
  private static scaleBlock(
    r: Uint8Array,
    bs: number,
    lines: Array<Uint8Array | undefined>,
    scanLine: number,
    sample: number
  ): void {
    const n = Math.trunc(8 / bs);
    const count = n * n;
    for (let y = 0; y < bs; ++y) {
      const line = lines[scanLine + y]!;
      for (let x = 0; x < bs; ++x) {
        let sum = 0;
        for (let j = 0; j < n; ++j) {
          const row = (y * n + j) * 8 + x * n;
          for (let i = 0; i < n; ++i) {
            sum += r[row + i];
          }
        }
        line[sample + x] = Math.trunc((sum + (count >> 1)) / count);
      }
    }
  }

  /**
   * Converts a value to fixed-point representation.
   * @param {number} val - The value to convert.
   * @returns {number} The fixed-point representation.
   */
  public static toFix(val: number): number {
    const fixedPoint = 20;
    const one = 1 << fixedPoint;
    return Math.trunc(val * one) & 0xffffffff;
  }

  /**
   * Reads a block from the input buffer.
   * @returns {InputBuffer<Uint8Array>} The input buffer containing the block.
   * @throws {LibError} If the block length is invalid.
   */
  private readBlock(): InputBuffer<Uint8Array> {
    const length = this._input.readUint16();
    if (length < 2) {
      throw new LibError('Invalid Block');
    }
    return this._input.readRange(length - 2);
  }

  /**
   * Reads the next marker from the input buffer.
   * @returns {number} The next marker.
   */
  private nextMarker(): JpegMarker {
    let c = 0;
    if (this._input.isEOS) {
      return c;
    }

    do {
      do {
        c = this._input.read();
      } while (c !== 0xff && !this._input.isEOS);
      if (this._input.isEOS) {
        return c;
      }
      do {
        c = this._input.read();
      } while (c === 0xff && !this._input.isEOS);
    } while (c === 0 && !this._input.isEOS);

    return c;
  }

  /**
   * Reads the ICC profile data from the provided input buffer.
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the ICC profile data.
   */
  private readIccProfile(block: InputBuffer<Uint8Array>): void {
    // "ICC_PROFILE\0"
    const iccProfileSignature = [
      0x49, 0x43, 0x43, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x00,
    ];
    for (let i = 0; i < iccProfileSignature.length; i++) {
      const b = block.read();
      if (b !== iccProfileSignature[i]) {
        return;
      }
    }

    const data = block.toUint8Array();
    this._iccProfile = new IccProfile(
      'ICC_PROFILE',
      IccProfileCompression.none,
      data
    );
  }

  /**
   * Reads the EXIF data from the provided input buffer.
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the EXIF data.
   */
  private readExifData(block: InputBuffer<Uint8Array>): void {
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

  /**
   * Reads application-specific data from the JPEG file based on the marker provided.
   * @param {JpegMarker} marker - The marker indicating the type of application data.
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the application data.
   */
  private readAppData(
    marker: JpegMarker,
    block: InputBuffer<Uint8Array>
  ): void {
    const appData = block;

    // EXIF orientation and the Adobe color transform are used by bands that
    // have already been converted.
    if (
      this._writer !== undefined &&
      (marker === JpegMarker.app1 || marker === JpegMarker.app14)
    ) {
      this._restartNeeded = true;
    }

    if (marker === JpegMarker.app0) {
      // 'JFIF\0'
      if (
        appData.get(0) === 0x4a &&
        appData.get(1) === 0x46 &&
        appData.get(2) === 0x49 &&
        appData.get(3) === 0x46 &&
        appData.get(4) === 0
      ) {
        const majorVersion = appData.get(5);
        const minorVersion = appData.get(6);
        const densityUnits = appData.get(7);
        const xDensity = (appData.get(8) << 8) | appData.get(9);
        const yDensity = (appData.get(10) << 8) | appData.get(11);
        const thumbWidth = appData.get(12);
        const thumbHeight = appData.get(13);

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
    } else if (marker === JpegMarker.app2) {
      this.readIccProfile(appData);
    } else if (marker === JpegMarker.app14) {
      // 'Adobe\0'
      if (
        appData.get(0) === 0x41 &&
        appData.get(1) === 0x64 &&
        appData.get(2) === 0x6f &&
        appData.get(3) === 0x62 &&
        appData.get(4) === 0x65 &&
        appData.get(5) === 0
      ) {
        const version = appData.get(6);
        const flags0 = (appData.get(7) << 8) | appData.get(8);
        const flags1 = (appData.get(9) << 8) | appData.get(10);
        const transformCode = appData.get(11);
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

  /**
   * Reads the Define Quantization Table (DQT) from the provided input buffer.
   * This method processes the DQT block, extracting quantization tables and storing them.
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the DQT block data.
   * @throws {LibError} If the number of quantization tables is invalid or if the DQT block length is incorrect.
   */
  private readDQT(block: InputBuffer<Uint8Array>): void {
    while (!block.isEOS) {
      let n = block.read();
      const prec = n >>> 4;
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
          const tmp: number = prec !== 0 ? block.readUint16() : block.read();
          tableData[JpegData.dctZigZag[i]] = tmp;
        }
      }
    }

    if (!block.isEOS) {
      throw new LibError('Bad length for DQT block');
    }
  }

  /**
   * Reads a JPEG frame from the input buffer and initializes the frame data.
   * Throws an error if a duplicate frame is found.
   * @param {JpegMarker} marker - The JPEG marker indicating the type of frame.
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the frame data.
   * @param {boolean} [prepare=true] - Whether to validate the frame.
   * @throws {LibError} If duplicate JPEG frame data is found.
   */
  private readFrame(
    marker: JpegMarker,
    block: InputBuffer<Uint8Array>,
    prepare = true
  ): void {
    if (this._frame !== undefined) {
      throw new LibError('Duplicate JPG frame data found.');
    }

    const extended = marker === JpegMarker.sof1;
    const progressive = marker === JpegMarker.sof2;
    const precision = block.read();
    const scanLines = block.readUint16();
    const samplesPerLine = block.readUint16();

    const numComponents = block.read();
    const components = new Map<number, JpegComponent>();
    const componentsOrder = new Array<number>();
    for (let i = 0; i < numComponents; i++) {
      const componentId = block.read();
      const x = block.read();
      const h = (x >>> 4) & 15;
      const v = x & 15;
      const qId = block.read();
      componentsOrder.push(componentId);
      const component = new JpegComponent(h, v, this._quantizationTables, qId);
      components.set(componentId, component);
    }

    const f = new JpegFrame(
      components,
      componentsOrder,
      extended,
      progressive,
      precision,
      scanLines,
      samplesPerLine
    );

    // The coefficient blocks are allocated by the first scan, once it's known
    // whether the image can be decoded a band at a time, but the declared
    // dimensions are validated now.
    if (prepare) {
      this.validateFrame(f);
    }

    this._frame = f;

    this.frames.push(f);
  }

  /**
   * Validates a JPEG frame's dimensions, component count and sampling factors
   * before its coefficient blocks are allocated.
   * @param {JpegFrame} f - The JPEG frame to validate.
   * @throws {LibError} If the frame has invalid or oversized dimensions, an
   * unsupported number of components, or invalid sampling factors.
   */
  private validateFrame(f: JpegFrame): void {
    const width = f.samplesPerLine;
    const height = f.scanLines;
    if (width === 0 || height === 0) {
      throw new LibError(`Invalid JPEG dimensions ${width}x${height}`);
    }
    if (this._maxPixels > 0 && width * height > this._maxPixels) {
      throw new LibError(
        `JPEG dimensions ${width}x${height} exceed the maximum of ` +
          `${this._maxPixels} pixels`
      );
    }
    if (
      f.components.size === 0 ||
      f.components.size > JpegData.maxCompsInScan
    ) {
      throw new LibError(
        `Unsupported number of JPEG components: ${f.components.size}`
      );
    }
    for (const c of f.components.values()) {
      if (
        c.hSamples < 1 ||
        c.hSamples > JpegData.maxSamplingFactor ||
        c.vSamples < 1 ||
        c.vSamples > JpegData.maxSamplingFactor
      ) {
        throw new LibError('Invalid JPEG sampling factor');
      }
    }
  }

  /**
   * Reads the Define Huffman Table (DHT) segment from the input buffer.
   * This method processes the Huffman table definitions used for decoding
   * JPEG images, distinguishing between AC and DC tables.
   *
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the DHT segment data.
   */
  private readDHT(block: InputBuffer<Uint8Array>): void {
    while (!block.isEOS) {
      let index = block.read();

      const bits = new Uint8Array(16);
      let count = 0;
      for (let j = 0; j < 16; j++) {
        bits[j] = block.read();
        count += bits[j];
      }

      const huffmanValues = block.readRange(count).toUint8Array();

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

  /**
   * Reads the Define Restart Interval (DRI) marker segment from the input buffer.
   * This marker segment specifies the interval between restart markers in the compressed data stream.
   *
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the DRI marker segment.
   */
  private readDRI(block: InputBuffer<Uint8Array>): void {
    this._resetInterval = block.readUint16();
  }

  /**
   * Reads the Start of Scan (SOS) block from the input buffer and decodes the scan.
   *
   * @param {InputBuffer<Uint8Array>} block - The input buffer containing the SOS block data.
   * @throws {LibError} - Throws an error if the SOS block is invalid or if a component is invalid.
   */
  private readSOS(block: InputBuffer<Uint8Array>): void {
    const n = block.read();
    if (n < 1 || n > JpegData.maxCompsInScan) {
      throw new LibError('Invalid SOS block');
    }

    const f = this._frame!;
    const components = new Array<JpegComponent>();
    for (let i = 0; i < n; i++) {
      const id = block.read();
      const c = block.read();
      if (!f.components.has(id)) {
        throw new LibError('Invalid Component in SOS block');
      }
      const component = f.components.get(id);
      if (component !== undefined) {
        const dcTableNumber = (c >>> 4) & 15;
        const acTableNumber = c & 15;
        if (dcTableNumber < this._huffmanTablesDC.length) {
          const table = this._huffmanTablesDC[dcTableNumber]!;
          component.huffmanTableDC = table;
          component.huffmanLookupDC = huffmanLookup(table);
        }
        if (acTableNumber < this._huffmanTablesAC.length) {
          const table = this._huffmanTablesAC[acTableNumber]!;
          component.huffmanTableAC = table;
          component.huffmanLookupAC = huffmanLookup(table);
        }
        components.push(component);
      }
    }

    const spectralStart = block.read();
    const spectralEnd = block.read();
    const successiveApproximation = block.read();

    const ah = (successiveApproximation >>> 4) & 15;
    const al = successiveApproximation & 15;

    // At 1/8 scale, the AC coefficients aren't used, so progressive AC scans
    // are skipped: the scan data is passed over when looking for the next
    // marker.
    if (f.progressive && this._scale === 8 && spectralStart > 0) {
      return;
    }

    if (this._writer !== undefined) {
      // Another scan would change bands that have already been converted.
      throw new RestartDecode();
    }

    let streaming = false;
    if (!this._prepared) {
      this._prepared = true;
      // A baseline scan of all of the components holds the whole image, so it
      // can be decoded a band at a time. (A scan of one component is one
      // block per MCU, so that's only done for 1x1 sampling.)
      const first = f.components.get(f.componentsOrder[0])!;
      streaming =
        this._allowStreaming &&
        !f.progressive &&
        components.length === f.components.size &&
        (components.length > 1 ||
          (first.hSamples === 1 && first.vSamples === 1));
      f.prepare({ dcOnly: this._scale === 8, band: streaming });
      if (streaming) {
        this.startBands(f);
      }
    }

    const scan = new JpegScan(
      this._input,
      f,
      components,
      spectralStart,
      spectralEnd,
      ah,
      al,
      this._resetInterval
    );
    if (streaming) {
      scan.onRow = this.decodeBand.bind(this);
    }
    scan.decode();
  }
}

/**
 * Thrown when an image being decoded a band at a time can't be: it's then
 * decoded fully.
 */
class RestartDecode extends Error {}
