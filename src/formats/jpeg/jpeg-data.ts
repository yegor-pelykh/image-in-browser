/** @format */

import { ExifData } from '../../common/exif_data';
import { InputBuffer } from '../../common/input-buffer';
import { ListUtils } from '../../common/list-utils';
import { MemoryImage } from '../../common/memory-image';
import { ImageError } from '../../error/image-error';
import { ComponentData } from './component-data';
import { Jpeg } from './jpeg';
import { JpegAdobe } from './jpeg-adobe';
import { JpegComponent } from './jpeg-component';
import { JpegFrame } from './jpeg-frame';
import { JpegHuffman } from './jpeg-huffman';
import { JpegInfo } from './jpeg-info';
import { JpegJfif } from './jpeg-jfif';
import { JpegQuantize } from './jpeg-quantize';
import { JpegScan } from './jpeg-scan';

export class JpegData {
  static readonly CRR = [
    -179, -178, -177, -175, -174, -172, -171, -170, -168, -167, -165, -164,
    -163, -161, -160, -158, -157, -156, -154, -153, -151, -150, -149, -147,
    -146, -144, -143, -142, -140, -139, -137, -136, -135, -133, -132, -130,
    -129, -128, -126, -125, -123, -122, -121, -119, -118, -116, -115, -114,
    -112, -111, -109, -108, -107, -105, -104, -102, -101, -100, -98, -97, -95,
    -94, -93, -91, -90, -88, -87, -86, -84, -83, -81, -80, -79, -77, -76, -74,
    -73, -72, -70, -69, -67, -66, -64, -63, -62, -60, -59, -57, -56, -55, -53,
    -52, -50, -49, -48, -46, -45, -43, -42, -41, -39, -38, -36, -35, -34, -32,
    -31, -29, -28, -27, -25, -24, -22, -21, -20, -18, -17, -15, -14, -13, -11,
    -10, -8, -7, -6, -4, -3, -1, 0, 1, 3, 4, 6, 7, 8, 10, 11, 13, 14, 15, 17,
    18, 20, 21, 22, 24, 25, 27, 28, 29, 31, 32, 34, 35, 36, 38, 39, 41, 42, 43,
    45, 46, 48, 49, 50, 52, 53, 55, 56, 57, 59, 60, 62, 63, 64, 66, 67, 69, 70,
    72, 73, 74, 76, 77, 79, 80, 81, 83, 84, 86, 87, 88, 90, 91, 93, 94, 95, 97,
    98, 100, 101, 102, 104, 105, 107, 108, 109, 111, 112, 114, 115, 116, 118,
    119, 121, 122, 123, 125, 126, 128, 129, 130, 132, 133, 135, 136, 137, 139,
    140, 142, 143, 144, 146, 147, 149, 150, 151, 153, 154, 156, 157, 158, 160,
    161, 163, 164, 165, 167, 168, 170, 171, 172, 174, 175, 177, 178,
  ];

  static readonly CRG = [
    5990656, 5943854, 5897052, 5850250, 5803448, 5756646, 5709844, 5663042,
    5616240, 5569438, 5522636, 5475834, 5429032, 5382230, 5335428, 5288626,
    5241824, 5195022, 5148220, 5101418, 5054616, 5007814, 4961012, 4914210,
    4867408, 4820606, 4773804, 4727002, 4680200, 4633398, 4586596, 4539794,
    4492992, 4446190, 4399388, 4352586, 4305784, 4258982, 4212180, 4165378,
    4118576, 4071774, 4024972, 3978170, 3931368, 3884566, 3837764, 3790962,
    3744160, 3697358, 3650556, 3603754, 3556952, 3510150, 3463348, 3416546,
    3369744, 3322942, 3276140, 3229338, 3182536, 3135734, 3088932, 3042130,
    2995328, 2948526, 2901724, 2854922, 2808120, 2761318, 2714516, 2667714,
    2620912, 2574110, 2527308, 2480506, 2433704, 2386902, 2340100, 2293298,
    2246496, 2199694, 2152892, 2106090, 2059288, 2012486, 1965684, 1918882,
    1872080, 1825278, 1778476, 1731674, 1684872, 1638070, 1591268, 1544466,
    1497664, 1450862, 1404060, 1357258, 1310456, 1263654, 1216852, 1170050,
    1123248, 1076446, 1029644, 982842, 936040, 889238, 842436, 795634, 748832,
    702030, 655228, 608426, 561624, 514822, 468020, 421218, 374416, 327614,
    280812, 234010, 187208, 140406, 93604, 46802, 0, -46802, -93604, -140406,
    -187208, -234010, -280812, -327614, -374416, -421218, -468020, -514822,
    -561624, -608426, -655228, -702030, -748832, -795634, -842436, -889238,
    -936040, -982842, -1029644, -1076446, -1123248, -1170050, -1216852,
    -1263654, -1310456, -1357258, -1404060, -1450862, -1497664, -1544466,
    -1591268, -1638070, -1684872, -1731674, -1778476, -1825278, -1872080,
    -1918882, -1965684, -2012486, -2059288, -2106090, -2152892, -2199694,
    -2246496, -2293298, -2340100, -2386902, -2433704, -2480506, -2527308,
    -2574110, -2620912, -2667714, -2714516, -2761318, -2808120, -2854922,
    -2901724, -2948526, -2995328, -3042130, -3088932, -3135734, -3182536,
    -3229338, -3276140, -3322942, -3369744, -3416546, -3463348, -3510150,
    -3556952, -3603754, -3650556, -3697358, -3744160, -3790962, -3837764,
    -3884566, -3931368, -3978170, -4024972, -4071774, -4118576, -4165378,
    -4212180, -4258982, -4305784, -4352586, -4399388, -4446190, -4492992,
    -4539794, -4586596, -4633398, -4680200, -4727002, -4773804, -4820606,
    -4867408, -4914210, -4961012, -5007814, -5054616, -5101418, -5148220,
    -5195022, -5241824, -5288626, -5335428, -5382230, -5429032, -5475834,
    -5522636, -5569438, -5616240, -5663042, -5709844, -5756646, -5803448,
    -5850250, -5897052, -5943854,
  ];

  static readonly CBG = [
    2919680, 2897126, 2874572, 2852018, 2829464, 2806910, 2784356, 2761802,
    2739248, 2716694, 2694140, 2671586, 2649032, 2626478, 2603924, 2581370,
    2558816, 2536262, 2513708, 2491154, 2468600, 2446046, 2423492, 2400938,
    2378384, 2355830, 2333276, 2310722, 2288168, 2265614, 2243060, 2220506,
    2197952, 2175398, 2152844, 2130290, 2107736, 2085182, 2062628, 2040074,
    2017520, 1994966, 1972412, 1949858, 1927304, 1904750, 1882196, 1859642,
    1837088, 1814534, 1791980, 1769426, 1746872, 1724318, 1701764, 1679210,
    1656656, 1634102, 1611548, 1588994, 1566440, 1543886, 1521332, 1498778,
    1476224, 1453670, 1431116, 1408562, 1386008, 1363454, 1340900, 1318346,
    1295792, 1273238, 1250684, 1228130, 1205576, 1183022, 1160468, 1137914,
    1115360, 1092806, 1070252, 1047698, 1025144, 1002590, 980036, 957482,
    934928, 912374, 889820, 867266, 844712, 822158, 799604, 777050, 754496,
    731942, 709388, 686834, 664280, 641726, 619172, 596618, 574064, 551510,
    528956, 506402, 483848, 461294, 438740, 416186, 393632, 371078, 348524,
    325970, 303416, 280862, 258308, 235754, 213200, 190646, 168092, 145538,
    122984, 100430, 77876, 55322, 32768, 10214, -12340, -34894, -57448, -80002,
    -102556, -125110, -147664, -170218, -192772, -215326, -237880, -260434,
    -282988, -305542, -328096, -350650, -373204, -395758, -418312, -440866,
    -463420, -485974, -508528, -531082, -553636, -576190, -598744, -621298,
    -643852, -666406, -688960, -711514, -734068, -756622, -779176, -801730,
    -824284, -846838, -869392, -891946, -914500, -937054, -959608, -982162,
    -1004716, -1027270, -1049824, -1072378, -1094932, -1117486, -1140040,
    -1162594, -1185148, -1207702, -1230256, -1252810, -1275364, -1297918,
    -1320472, -1343026, -1365580, -1388134, -1410688, -1433242, -1455796,
    -1478350, -1500904, -1523458, -1546012, -1568566, -1591120, -1613674,
    -1636228, -1658782, -1681336, -1703890, -1726444, -1748998, -1771552,
    -1794106, -1816660, -1839214, -1861768, -1884322, -1906876, -1929430,
    -1951984, -1974538, -1997092, -2019646, -2042200, -2064754, -2087308,
    -2109862, -2132416, -2154970, -2177524, -2200078, -2222632, -2245186,
    -2267740, -2290294, -2312848, -2335402, -2357956, -2380510, -2403064,
    -2425618, -2448172, -2470726, -2493280, -2515834, -2538388, -2560942,
    -2583496, -2606050, -2628604, -2651158, -2673712, -2696266, -2718820,
    -2741374, -2763928, -2786482, -2809036, -2831590,
  ];

  static readonly CBB = [
    -227, -225, -223, -222, -220, -218, -216, -214, -213, -211, -209, -207,
    -206, -204, -202, -200, -198, -197, -195, -193, -191, -190, -188, -186,
    -184, -183, -181, -179, -177, -175, -174, -172, -170, -168, -167, -165,
    -163, -161, -159, -158, -156, -154, -152, -151, -149, -147, -145, -144,
    -142, -140, -138, -136, -135, -133, -131, -129, -128, -126, -124, -122,
    -120, -119, -117, -115, -113, -112, -110, -108, -106, -105, -103, -101, -99,
    -97, -96, -94, -92, -90, -89, -87, -85, -83, -82, -80, -78, -76, -74, -73,
    -71, -69, -67, -66, -64, -62, -60, -58, -57, -55, -53, -51, -50, -48, -46,
    -44, -43, -41, -39, -37, -35, -34, -32, -30, -28, -27, -25, -23, -21, -19,
    -18, -16, -14, -12, -11, -9, -7, -5, -4, -2, 0, 2, 4, 5, 7, 9, 11, 12, 14,
    16, 18, 19, 21, 23, 25, 27, 28, 30, 32, 34, 35, 37, 39, 41, 43, 44, 46, 48,
    50, 51, 53, 55, 57, 58, 60, 62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 80, 82,
    83, 85, 87, 89, 90, 92, 94, 96, 97, 99, 101, 103, 105, 106, 108, 110, 112,
    113, 115, 117, 119, 120, 122, 124, 126, 128, 129, 131, 133, 135, 136, 138,
    140, 142, 144, 145, 147, 149, 151, 152, 154, 156, 158, 159, 161, 163, 165,
    167, 168, 170, 172, 174, 175, 177, 179, 181, 183, 184, 186, 188, 190, 191,
    193, 195, 197, 198, 200, 202, 204, 206, 207, 209, 211, 213, 214, 216, 218,
    220, 222, 223, 225,
  ];

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

  private readonly _quantizationTables = new Array<Int16Array | undefined>(
    Jpeg.NUM_QUANT_TBLS
  );
  public get quantizationTables(): Array<Int16Array | undefined> {
    return this._quantizationTables;
  }

  private readonly _frames = new Array<JpegFrame | undefined>();
  public get frames(): Array<JpegFrame | undefined> {
    return this._frames;
  }

  private readonly _huffmanTablesAC = new Array<[] | undefined>();
  public get huffmanTablesAC(): Array<[] | undefined> {
    return this._huffmanTablesAC;
  }

  private readonly _huffmanTablesDC = new Array<[] | undefined>();
  public get huffmanTablesDC(): Array<[] | undefined> {
    return this._huffmanTablesDC;
  }

  private readonly _components = new Array<ComponentData>();
  public get components(): Array<ComponentData> {
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
    if (marker !== Jpeg.M_SOI) {
      // SOI (Start of Image)
      throw new ImageError('Start Of Image marker not found.');
    }

    marker = this.nextMarker();
    while (marker !== Jpeg.M_EOI && !this._input.isEOS) {
      const block = this.readBlock();
      switch (marker) {
        case Jpeg.M_APP0:
        case Jpeg.M_APP1:
        case Jpeg.M_APP2:
        case Jpeg.M_APP3:
        case Jpeg.M_APP4:
        case Jpeg.M_APP5:
        case Jpeg.M_APP6:
        case Jpeg.M_APP7:
        case Jpeg.M_APP8:
        case Jpeg.M_APP9:
        case Jpeg.M_APP10:
        case Jpeg.M_APP11:
        case Jpeg.M_APP12:
        case Jpeg.M_APP13:
        case Jpeg.M_APP14:
        case Jpeg.M_APP15:
        case Jpeg.M_COM:
          this.readAppData(marker, block);
          break;

        // DQT (Define Quantization Tables)
        case Jpeg.M_DQT:
          this.readDQT(block);
          break;

        // SOF0 (Start of Frame, Baseline DCT)
        case Jpeg.M_SOF0:
        // SOF1 (Start of Frame, Extended DCT)
        // falls through
        case Jpeg.M_SOF1:
        // SOF2 (Start of Frame, Progressive DCT)
        // falls through
        case Jpeg.M_SOF2:
          this.readFrame(marker, block);
          break;

        case Jpeg.M_SOF3:
        case Jpeg.M_SOF5:
        case Jpeg.M_SOF6:
        case Jpeg.M_SOF7:
        case Jpeg.M_JPG:
        case Jpeg.M_SOF9:
        case Jpeg.M_SOF10:
        case Jpeg.M_SOF11:
        case Jpeg.M_SOF13:
        case Jpeg.M_SOF14:
        case Jpeg.M_SOF15:
          throw new ImageError(`Unhandled frame type ${marker.toString(16)}`);

        // DHT (Define Huffman Tables)
        case Jpeg.M_DHT:
          this.readDHT(block);
          break;

        // DRI (Define Restart Interval)
        case Jpeg.M_DRI:
          this.readDRI(block);
          break;

        // SOS (Start of Scan)
        case Jpeg.M_SOS:
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
            throw new ImageError(`Unknown JPEG marker ${marker.toString(16)}`);
          }
          break;
      }

      marker = this.nextMarker();
    }
  }

  private skipBlock(): void {
    const length = this._input.readUint16();
    if (length < 2) {
      throw new ImageError('Invalid Block');
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
    if (marker !== Jpeg.M_SOI) {
      return false;
    }

    let hasSOF = false;
    let hasSOS = false;

    marker = this.nextMarker();
    while (marker !== Jpeg.M_EOI && !this._input.isEOS) {
      // EOI (End of image)
      const sectionByteSize = this._input.readUint16();
      if (sectionByteSize < 2) {
        // Jpeg section consists of more than 2 bytes at least
        // return success only when SOF and SOS have already found (as a jpeg without EOF.)
        break;
      }

      this._input.skip(sectionByteSize - 2);

      switch (marker) {
        // SOF0 (Start of Frame, Baseline DCT)
        case Jpeg.M_SOF0:
        // SOF1 (Start of Frame, Extended DCT)
        // falls through
        case Jpeg.M_SOF1:
        // SOF2 (Start of Frame, Progressive DCT)
        // falls through
        case Jpeg.M_SOF2:
          hasSOF = true;
          break;
        // SOS (Start of Scan)
        case Jpeg.M_SOS:
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
    if (marker !== Jpeg.M_SOI) {
      return undefined;
    }

    const info = new JpegInfo();

    let hasSOF = false;
    let hasSOS = false;

    marker = this.nextMarker();
    while (marker !== Jpeg.M_EOI && !this._input.isEOS) {
      // EOI (End of image)
      switch (marker) {
        // SOF0 (Start of Frame, Baseline DCT)
        case Jpeg.M_SOF0:
        // SOF1 (Start of Frame, Extended DCT)
        // falls through
        case Jpeg.M_SOF1:
        // SOF2 (Start of Frame, Progressive DCT)
        // falls through
        case Jpeg.M_SOF2:
          hasSOF = true;
          this.readFrame(marker, this.readBlock());
          break;
        // SOS (Start of Scan)
        case Jpeg.M_SOS:
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
      throw new ImageError('Only single frame JPEGs supported');
    }

    if (this._frame !== undefined) {
      for (let i = 0; i < this._frame.componentsOrder.length; ++i) {
        const component = this._frame.components.get(
          this._frame.componentsOrder[i]
        );
        if (component !== undefined) {
          this.components.push(
            new ComponentData(
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

  private static readExifValue(
    block: InputBuffer,
    format: number,
    offset: number
  ): string | number {
    const FMT_BYTE = 1;
    const FMT_ASCII = 2;
    const FMT_USHORT = 3;
    const FMT_ULONG = 4;
    const FMT_URATIONAL = 5;
    const FMT_SBYTE = 6;
    const FMT_UNDEFINED = 7;
    const FMT_SSHORT = 8;
    const FMT_SLONG = 9;
    const FMT_SRATIONAL = 10;
    const FMT_SINGLE = 11;
    const FMT_DOUBLE = 12;

    const initialBlockLength = block.length;
    try {
      switch (format) {
        case FMT_SBYTE:
          return block.readInt8();
        case FMT_BYTE:
        case FMT_UNDEFINED:
          return block.readByte();
        case FMT_ASCII:
          return block.readString(1);
        case FMT_USHORT:
          return block.readUint16();
        case FMT_ULONG:
          return block.readUint32();
        case FMT_URATIONAL:
        case FMT_SRATIONAL: {
          const buffer = block.peekBytes(8, offset);
          const num = buffer.readInt32();
          const den = buffer.readInt32();
          if (den === 0) {
            return 0.0;
          }
          return num / den;
        }
        case FMT_SSHORT:
          return block.readInt16();
        case FMT_SLONG:
          return block.readInt32();
        // Not sure if this is correct (never seen float used in Exif format)
        case FMT_SINGLE:
          return block.readFloat32();
        case FMT_DOUBLE:
          return block.peekBytes(8, offset).readFloat64();
        default:
          return 0;
      }
    } finally {
      const bytesRead = initialBlockLength - block.length;
      if (bytesRead < 4) {
        block.skip(4 - bytesRead);
      }
    }
  }

  private static buildHuffmanTable(
    codeLengths: Uint8Array,
    values: Uint8Array
  ): Array<unknown> {
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
        p.children[p.index] = values[k];
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
          p.children[p.index] = q.children;
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
        p.children[p.index] = q.children;
        p = q;
      }
    }

    return code[0].children;
  }

  private static buildComponentData(
    component: JpegComponent
  ): Array<Uint8Array> {
    const blocksPerLine = component.blocksPerLine;
    const blocksPerColumn = component.blocksPerColumn;
    const samplesPerLine = blocksPerLine << 3;
    const R = new Int32Array(64);
    const r = new Uint8Array(64);
    const lines = new Array<Uint8Array>(blocksPerColumn * 8);

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
            line[sample + i] = r[offset++];
          }
        }
      }
    }

    return lines;
  }

  public static toFix(val: number): number {
    const FIXED_POINT = 20;
    const ONE = 1 << FIXED_POINT;
    return Math.trunc(val * ONE) & 0xffffffff;
  }

  private readBlock(): InputBuffer {
    const length = this._input.readUint16();
    if (length < 2) {
      throw new ImageError('Invalid Block');
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

  private readExifDir(block: InputBuffer, nesting = 0): void {
    if (nesting > 4) {
      // Maximum Exif directory nesting exceeded (corrupt Exif header)
      return;
    }

    const numDirEntries = block.readUint16();

    // const TAG_ORIENTATION = 0x0112;
    // const TAG_INTEROP_OFFSET = 0xA005;
    // const TAG_EXIF_OFFSET = 0x8769;
    const maxFormats = 12;
    const bytesPerFormat = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];

    for (let di = 0; di < numDirEntries; ++di) {
      const tag = block.readUint16();
      const format = block.readUint16();
      const components = block.readUint32();

      if (format - 1 >= maxFormats) {
        continue;
      }

      // Too many components
      if (components > 0x10000) {
        continue;
      }

      const byteCount = bytesPerFormat[format];

      let offset = 0;

      // If its bigger than 4 bytes, the dir entry contains an offset.
      if (byteCount > 4) {
        offset = block.readUint32();
        if (offset + byteCount > block.length) {
          // Bogus pointer offset and / or bytecount value
          continue;
        }
      }

      this._exifData.data.set(
        tag,
        JpegData.readExifValue(block, format, offset)
      );
    }
  }

  private readExifData(block: InputBuffer): void {
    const rawData = ListUtils.copyUint8(block.toUint8Array());
    this._exifData.addRowData(rawData);

    const EXIF_TAG = 0x45786966;
    if (block.readUint32() !== EXIF_TAG) {
      return;
    }
    if (block.readUint16() !== 0) {
      return;
    }

    const saveEndian = block.bigEndian;

    // Exif Directory
    const alignment = block.readString(2);
    if (alignment === 'II') {
      // Exif is in Intel order
      block.bigEndian = false;
    } else if (alignment === 'MM') {
      // Exif section in Motorola order
      block.bigEndian = true;
    } else {
      return;
    }

    block.skip(2);

    const offset = block.readUint32();
    if (offset < 8 || offset > 16) {
      if (offset > block.length - 16) {
        // Invalid offset for first Exif IFD value ;
        block.bigEndian = saveEndian;
        return;
      }
    }

    if (offset > 8) {
      block.skip(offset - 8);
    }

    this.readExifDir(block);

    block.bigEndian = saveEndian;
  }

  private readAppData(marker: number, block: InputBuffer): void {
    const appData = block;

    if (marker === Jpeg.M_APP0) {
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
    } else if (marker === Jpeg.M_APP1) {
      // 'EXIF\0'
      this.readExifData(appData);
    } else if (marker === Jpeg.M_APP14) {
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
    } else if (marker === Jpeg.M_COM) {
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

      if (n >= Jpeg.NUM_QUANT_TBLS) {
        throw new ImageError('Invalid number of quantization tables');
      }

      if (this._quantizationTables[n] === undefined) {
        this._quantizationTables[n] = new Int16Array(64);
      }

      const tableData = this._quantizationTables[n];
      if (tableData !== undefined) {
        for (let i = 0; i < Jpeg.DCTSIZE2; i++) {
          const tmp: number =
            prec !== 0 ? block.readUint16() : block.readByte();
          tableData[Jpeg.dctZigZag[i]] = tmp;
        }
      }
    }

    if (!block.isEOS) {
      throw new ImageError('Bad length for DQT block');
    }
  }

  private readFrame(marker: number, block: InputBuffer): void {
    if (this._frame !== undefined) {
      throw new ImageError('Duplicate JPG frame data found.');
    }

    const extended = marker === Jpeg.M_SOF1;
    const progressive = marker === Jpeg.M_SOF2;
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

      const huffmanValues = new Uint8Array(count);
      for (let j = 0; j < count; j++) {
        huffmanValues[j] = block.readByte();
      }

      let ht: Array<unknown> = [];
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
    if (n < 1 || n > Jpeg.MAX_COMPS_IN_SCAN) {
      throw new ImageError('Invalid SOS block');
    }

    const components = new Array<JpegComponent>();
    for (let i = 0; i < n; i++) {
      const id = block.readByte();
      const c = block.readByte();

      if (!this._frame!.components.has(id)) {
        throw new ImageError('Invalid Component in SOS block');
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

    const Ah = (successiveApproximation >> 4) & 15;
    const Al = successiveApproximation & 15;

    const scan = new JpegScan(
      this._input,
      this._frame!,
      components,
      spectralStart,
      spectralEnd,
      Ah,
      Al,
      this._resetInterval
    );
    scan.decode();
  }
}
