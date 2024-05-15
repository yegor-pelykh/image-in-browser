/** @format */

import { LibError } from '../error/lib-error.js';
import { Rational } from './rational.js';
import { TypedArray } from './typings.js';

export abstract class ArrayUtils {
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
      return ArrayUtils.copyInt8(from, begin, end);
    } else if (from instanceof Uint8Array) {
      return ArrayUtils.copyUint8(from, begin, end);
    } else if (from instanceof Int16Array) {
      return ArrayUtils.copyInt16(from, begin, end);
    } else if (from instanceof Uint16Array) {
      return ArrayUtils.copyUint16(from, begin, end);
    } else if (from instanceof Int32Array) {
      return ArrayUtils.copyInt32(from, begin, end);
    } else if (from instanceof Uint32Array) {
      return ArrayUtils.copyUint32(from, begin, end);
    } else if (from instanceof Float32Array) {
      return ArrayUtils.copyFloat32(from, begin, end);
    } else if (from instanceof Float64Array) {
      return ArrayUtils.copyFloat64(from, begin, end);
    }
    throw new LibError('Unknown array type');
  }

  public static copyRange<T extends TypedArray>(
    from: T,
    fromStart: number,
    to: T,
    toStart: number,
    length: number
  ): void {
    const viewFrom = from.subarray(fromStart, fromStart + length);
    to.set(viewFrom, toStart);
  }

  public static fill<T>(length: number, value: T): T[] {
    const a = new Array<T>(length);
    return a.fill(value);
  }

  public static generate<T>(length: number, func: (index: number) => T): T[] {
    const a = new Array<T>(length);
    for (let i = 0; i < length; ++i) {
      a[i] = func(i);
    }
    return a;
  }

  public static equals(
    a1: TypedArray | unknown[],
    a2: TypedArray | unknown[]
  ): boolean {
    if (a1 === a2) return true;
    if (a1.length !== a2.length) return false;
    for (let i = 0, l = a1.length; i < l; i++) {
      if (
        ArrayUtils.isNumArrayOrTypedArray(a1[i]) &&
        ArrayUtils.isNumArrayOrTypedArray(a2[i])
      ) {
        if (
          !ArrayUtils.equals(
            a1[i] as TypedArray | unknown[],
            a2[i] as TypedArray | unknown[]
          )
        )
          return false;
      } else if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  }

  public static equalsRationalArray(a1: Rational[], a2: Rational[]): boolean {
    if (a1 === a2) return true;
    if (a1.length !== a2.length) return false;
    for (let i = 0, l = a1.length; i < l; i++) {
      if (!a1[i].equals(a2[i])) {
        return false;
      }
    }
    return true;
  }

  public static getNumEnumValues<T extends object>(t: T): number[] {
    return Object.values(t).filter((v) => typeof v === 'number');
  }

  public static isNumArrayOrTypedArray(obj: unknown) {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        ((Array.isArray(obj) &&
          (obj as Array<unknown>).every((v) => typeof v === 'number')) ||
          (ArrayBuffer.isView(obj) && !(obj instanceof DataView)))
    );
  }

  public static isArrayOfRational(obj: unknown) {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        Array.isArray(obj) &&
        (obj as Array<unknown>).every((v) => v instanceof Rational)
    );
  }
}
