/** @format */

export abstract class BitUtils {
  private static readonly _uint8 = new Uint8Array(1);
  private static readonly _uint8ToInt8 = new Int8Array(BitUtils._uint8.buffer);

  private static readonly _int8 = new Int8Array(1);
  private static readonly _int8ToUint8 = new Uint8Array(BitUtils._int8.buffer);

  private static readonly _uint16 = new Uint16Array(1);
  private static readonly _uint16ToInt16 = new Int16Array(
    BitUtils._uint16.buffer
  );

  private static readonly _int16 = new Int16Array(1);
  private static readonly _int16ToUint16 = new Uint16Array(
    BitUtils._int16.buffer
  );

  private static readonly _uint32 = new Uint32Array(1);
  private static readonly _uint32ToInt32 = new Int32Array(
    BitUtils._uint32.buffer
  );
  private static readonly _uint32ToFloat32 = new Float32Array(
    BitUtils._uint32.buffer
  );

  private static readonly _int32 = new Int32Array(1);
  private static readonly _int32ToUint32 = new Uint32Array(
    BitUtils._int32.buffer
  );

  private static readonly _float32 = new Float32Array(1);
  private static readonly _float32ToUint32 = new Uint32Array(
    BitUtils._float32.buffer
  );

  private static readonly _uint64 = new BigUint64Array(1);
  private static readonly _uint64ToFloat64 = new Float64Array(
    BitUtils._uint64.buffer
  );

  private static readonly _reverseByteTable = [
    0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0, 0x10, 0x90, 0x50, 0xd0,
    0x30, 0xb0, 0x70, 0xf0, 0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
    0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8, 0x04, 0x84, 0x44, 0xc4,
    0x24, 0xa4, 0x64, 0xe4, 0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
    0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec, 0x1c, 0x9c, 0x5c, 0xdc,
    0x3c, 0xbc, 0x7c, 0xfc, 0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
    0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2, 0x0a, 0x8a, 0x4a, 0xca,
    0x2a, 0xaa, 0x6a, 0xea, 0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
    0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6, 0x16, 0x96, 0x56, 0xd6,
    0x36, 0xb6, 0x76, 0xf6, 0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
    0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe, 0x01, 0x81, 0x41, 0xc1,
    0x21, 0xa1, 0x61, 0xe1, 0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
    0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9, 0x19, 0x99, 0x59, 0xd9,
    0x39, 0xb9, 0x79, 0xf9, 0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
    0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5, 0x0d, 0x8d, 0x4d, 0xcd,
    0x2d, 0xad, 0x6d, 0xed, 0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
    0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3, 0x13, 0x93, 0x53, 0xd3,
    0x33, 0xb3, 0x73, 0xf3, 0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
    0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb, 0x07, 0x87, 0x47, 0xc7,
    0x27, 0xa7, 0x67, 0xe7, 0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
    0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef, 0x1f, 0x9f, 0x5f, 0xdf,
    0x3f, 0xbf, 0x7f, 0xff,
  ];

  /**
   * Count the consecutive zero bits (trailing) on the right in parallel
   * https://graphics.stanford.edu/~seander/bithacks.html#ZerosOnRightParallel
   */
  public static countTrailingZeroBits(v: number): number {
    let c = 32;
    const _v = v & -v;
    if (_v !== 0) c--;
    if ((_v & 0x0000ffff) !== 0) c -= 16;
    if ((_v & 0x00ff00ff) !== 0) c -= 8;
    if ((_v & 0x0f0f0f0f) !== 0) c -= 4;
    if ((_v & 0x33333333) !== 0) c -= 2;
    if ((_v & 0x55555555) !== 0) c -= 1;
    return c;
  }

  public static reverseByte(x: number): number {
    return this._reverseByteTable[x];
  }

  public static sshR(v: number, n: number): number {
    return v >> n;
  }

  public static ushR(v: number, n: number): number {
    return v >>> n;
  }

  public static sshL(v: number, n: number): number {
    return v << n;
  }

  public static ushL(v: number, n: number): number {
    return (v << n) >>> 0;
  }

  /**
   * Binary conversion of a uint8 to an int8. This is equivalent in C to
   * typecasting an unsigned char to a char.
   */
  public static uint8ToInt8(d: number): number {
    this._uint8[0] = d;
    return this._uint8ToInt8[0];
  }

  /**
   * Binary conversion of an int8 to a uint8.
   */
  public static int8ToUint8(d: number): number {
    this._int8[0] = d;
    return this._int8ToUint8[0];
  }

  /**
   *  Binary conversion of a uint16 to an int16. This is equivalent in C to
   * typecasting an unsigned short to a short.
   */
  public static uint16ToInt16(d: number): number {
    this._uint16[0] = d;
    return this._uint16ToInt16[0];
  }

  /**
   * Binary conversion of an int16 to a uint16. This is equivalent in C to
   *  typecasting a short to an unsigned short.
   */
  public static int16ToUint16(d: number): number {
    this._int16[0] = d;
    return this._int16ToUint16[0];
  }

  /**
   * Binary conversion of a uint32 to an int32. This is equivalent in C to
   *  typecasting an unsigned int to signed int.
   */
  public static uint32ToInt32(d: number): number {
    this._uint32[0] = d;
    return this._uint32ToInt32[0];
  }

  /**
   * Binary conversion of a uint32 to an float32. This is equivalent in C to
   * typecasting an unsigned int to float.
   */
  public static uint32ToFloat32(d: number): number {
    this._uint32[0] = d;
    return this._uint32ToFloat32[0];
  }

  /**
   * Binary conversion of a uint64 to an float64. This is equivalent in C to
   * typecasting an unsigned long long to double.
   */
  public static uint64ToFloat64(d: bigint): number {
    this._uint64[0] = d;
    return this._uint64ToFloat64[0];
  }

  /**
   * Binary conversion of an int32 to a uint32. This is equivalent in C to
   * typecasting an int to an unsigned int.
   */
  public static int32ToUint32(d: number): number {
    this._int32[0] = d;
    return this._int32ToUint32[0];
  }

  /**
   * Binary conversion of a float32 to an uint32. This is equivalent in C to
   * typecasting a float to unsigned int.
   */
  public static float32ToUint32(d: number): number {
    this._float32[0] = d;
    return this._float32ToUint32[0];
  }

  public static debugBits32(value?: number): string {
    if (value === undefined) {
      return 'undefined';
    }
    const bitCount = 32;
    let result = '';
    for (let i = bitCount; i > -1; i--) {
      result += (value & (1 << i)) === 0 ? '0' : '1';
    }
    return result;
  }
}
