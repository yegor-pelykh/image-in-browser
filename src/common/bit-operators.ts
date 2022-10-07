/** @format */

export abstract class BitOperators {
  private static readonly uint8arr: Uint8Array = new Uint8Array(1);
  private static readonly uint8ToInt8arr: Int8Array = new Int8Array(
    BitOperators.uint8arr.buffer
  );
  private static readonly uint16arr: Uint16Array = new Uint16Array(1);
  private static readonly uint16ToInt16arr: Int16Array = new Int16Array(
    BitOperators.uint16arr.buffer
  );
  private static readonly uint32arr: Uint32Array = new Uint32Array(1);
  private static readonly uint32ToInt32arr: Int32Array = new Int32Array(
    BitOperators.uint32arr.buffer
  );
  private static readonly uint32ToFloat32arr: Float32Array = new Float32Array(
    BitOperators.uint32arr.buffer
  );
  private static readonly int32arr: Int32Array = new Int32Array(1);
  private static readonly int32ToUint32arr: Uint32Array = new Uint32Array(
    BitOperators.int32arr.buffer
  );
  private static readonly uint64arr: BigUint64Array = new BigUint64Array(1);
  private static readonly uint64ToFloat64arr: Float64Array = new Float64Array(
    BitOperators.uint64arr.buffer
  );

  public static signed(bits: number, value: number) {
    return value & (1 << (bits - 1)) ? value - (1 << bits) : value;
  }

  public static shiftR(v: number, n: number): number {
    return BitOperators.signed(32, v >> n);
  }

  public static shiftL(v: number, n: number): number {
    return BitOperators.signed(32, v << n);
  }

  /**
   * Binary conversion to an int8. This is equivalent in C to
   * typecasting to a char.
   */
  public static toInt8(d: number): number {
    BitOperators.uint8arr[0] = d;
    return BitOperators.uint8ToInt8arr[0];
  }

  /**
   * Binary conversion to an int16. This is equivalent in C to
   * typecasting to a short.
   */
  public static toInt16(d: number): number {
    BitOperators.uint16arr[0] = d;
    return BitOperators.uint16ToInt16arr[0];
  }

  /**
   * Binary conversion to an int32. This is equivalent in C to
   * typecasting to signed int.
   */
  public static toInt32(d: number): number {
    BitOperators.uint32arr[0] = d;
    return BitOperators.uint32ToInt32arr[0];
  }

  /**
   * Binary conversion to a float32. This is equivalent in C to
   * typecasting to float.
   */
  public static toFloat32(d: number): number {
    BitOperators.uint32arr[0] = d;
    return BitOperators.uint32ToFloat32arr[0];
  }

  /**
   * Binary conversion to a float64. This is equivalent in C to
   * typecasting to double.
   */
  public static toFloat64(d: bigint): number {
    BitOperators.uint64arr[0] = d;
    return BitOperators.uint64ToFloat64arr[0];
  }

  /**
   * Binary conversion of an int32 to a uint32. This is equivalent in C to
   * typecasting to unsigned int.
   */
  public static toUint32(d: number): number {
    BitOperators.int32arr[0] = d;
    return BitOperators.int32ToUint32arr[0];
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
