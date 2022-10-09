/** @format */

import { ImageError } from '../error/image-error';
import { TypedArray } from './typings';

export abstract class ListUtils {
  public static copyInt8(
    from: Int8Array,
    begin?: number,
    end?: number
  ): Int8Array {
    return Int8Array.from(from.subarray(begin, end));
  }

  public static copyUint8(
    from: Uint8Array,
    begin?: number,
    end?: number
  ): Uint8Array {
    return Uint8Array.from(from.subarray(begin, end));
  }

  public static copyInt16(
    from: Int16Array,
    begin?: number,
    end?: number
  ): Int16Array {
    return Int16Array.from(from.subarray(begin, end));
  }

  public static copyUint16(
    from: Uint16Array,
    begin?: number,
    end?: number
  ): Uint16Array {
    return Uint16Array.from(from.subarray(begin, end));
  }

  public static copyInt32(
    from: Int32Array,
    begin?: number,
    end?: number
  ): Int32Array {
    return Int32Array.from(from.subarray(begin, end));
  }

  public static copyUint32(
    from: Uint32Array,
    begin?: number,
    end?: number
  ): Uint32Array {
    return Uint32Array.from(from.subarray(begin, end));
  }

  public static copyFloat32(
    from: Float32Array,
    begin?: number,
    end?: number
  ): Float32Array {
    return Float32Array.from(from.subarray(begin, end));
  }

  public static copyFloat64(
    from: Float64Array,
    begin?: number,
    end?: number
  ): Float64Array {
    return Float64Array.from(from.subarray(begin, end));
  }

  public static copy(
    from: TypedArray,
    begin?: number,
    end?: number
  ): TypedArray {
    if (from instanceof Int8Array) {
      return ListUtils.copyInt8(from, begin, end);
    } else if (from instanceof Uint8Array) {
      return ListUtils.copyUint8(from, begin, end);
    } else if (from instanceof Int16Array) {
      return ListUtils.copyInt16(from, begin, end);
    } else if (from instanceof Uint16Array) {
      return ListUtils.copyUint16(from, begin, end);
    } else if (from instanceof Int32Array) {
      return ListUtils.copyInt32(from, begin, end);
    } else if (from instanceof Uint32Array) {
      return ListUtils.copyUint32(from, begin, end);
    } else if (from instanceof Float32Array) {
      return ListUtils.copyFloat32(from, begin, end);
    } else if (from instanceof Float64Array) {
      return ListUtils.copyFloat64(from, begin, end);
    }
    throw new ImageError('Unknown array type');
  }

  public static setRange<T extends TypedArray>(
    to: T,
    start: number,
    end: number,
    from: T,
    skipCount = 0
  ): void {
    const viewFrom = from.subarray(skipCount, end - start);
    to.set(viewFrom, start);
  }
}
