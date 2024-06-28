/** @format */

import { LibError } from '../error/lib-error.js';
import { Rational } from './rational.js';
import { TypedArray } from './typings.js';

/**
 * Abstract class containing utility methods for array operations.
 */
export abstract class ArrayUtils {
  /**
   * Copies a subarray from an Int8Array.
   * @param {Int8Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Int8Array} A new Int8Array containing the copied elements.
   */
  public static copyInt8(
    from: Int8Array,
    begin?: number,
    end?: number
  ): Int8Array {
    return Int8Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from a Uint8Array.
   * @param {Uint8Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Uint8Array} A new Uint8Array containing the copied elements.
   */
  public static copyUint8(
    from: Uint8Array,
    begin?: number,
    end?: number
  ): Uint8Array {
    return Uint8Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from an Int16Array.
   * @param {Int16Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Int16Array} A new Int16Array containing the copied elements.
   */
  public static copyInt16(
    from: Int16Array,
    begin?: number,
    end?: number
  ): Int16Array {
    return Int16Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from a Uint16Array.
   * @param {Uint16Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Uint16Array} A new Uint16Array containing the copied elements.
   */
  public static copyUint16(
    from: Uint16Array,
    begin?: number,
    end?: number
  ): Uint16Array {
    return Uint16Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from an Int32Array.
   * @param {Int32Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Int32Array} A new Int32Array containing the copied elements.
   */
  public static copyInt32(
    from: Int32Array,
    begin?: number,
    end?: number
  ): Int32Array {
    return Int32Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from a Uint32Array.
   * @param {Uint32Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Uint32Array} A new Uint32Array containing the copied elements.
   */
  public static copyUint32(
    from: Uint32Array,
    begin?: number,
    end?: number
  ): Uint32Array {
    return Uint32Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from a Float32Array.
   * @param {Float32Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Float32Array} A new Float32Array containing the copied elements.
   */
  public static copyFloat32(
    from: Float32Array,
    begin?: number,
    end?: number
  ): Float32Array {
    return Float32Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from a Float64Array.
   * @param {Float64Array} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {Float64Array} A new Float64Array containing the copied elements.
   */
  public static copyFloat64(
    from: Float64Array,
    begin?: number,
    end?: number
  ): Float64Array {
    return Float64Array.from(from.subarray(begin, end));
  }

  /**
   * Copies a subarray from a TypedArray.
   * @param {TypedArray} from - The source array.
   * @param {number} [begin] - The beginning index.
   * @param {number} [end] - The ending index.
   * @returns {TypedArray} A new TypedArray containing the copied elements.
   * @throws {LibError} If the array type is unknown.
   */
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

  /**
   * Copies a range of elements from one TypedArray to another.
   * @param {TypedArray} from - The source array.
   * @param {number} fromStart - The starting index in the source array.
   * @param {TypedArray} to - The destination array.
   * @param {number} toStart - The starting index in the destination array.
   * @param {number} length - The number of elements to copy.
   */
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

  /**
   * Fills an array with a specified value.
   * @param {number} length - The length of the array.
   * @param {T} value - The value to fill the array with.
   * @returns {T[]} A new array filled with the specified value.
   */
  public static fill<T>(length: number, value: T): T[] {
    const a = new Array<T>(length);
    return a.fill(value);
  }

  /**
   * Generates an array using a provided function.
   * @param {number} length - The length of the array.
   * @param {(index: number) => T} func - The function to generate each element.
   * @returns {T[]} A new array generated by the provided function.
   */
  public static generate<T>(length: number, func: (index: number) => T): T[] {
    const a = new Array<T>(length);
    for (let i = 0; i < length; ++i) {
      a[i] = func(i);
    }
    return a;
  }

  /**
   * Compares two arrays for equality.
   * @param {TypedArray | unknown[]} a1 - The first array.
   * @param {TypedArray | unknown[]} a2 - The second array.
   * @returns {boolean} True if the arrays are equal, false otherwise.
   */
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

  /**
   * Compares two arrays of Rational objects for equality.
   * @param {Rational[]} a1 - The first array.
   * @param {Rational[]} a2 - The second array.
   * @returns {boolean} True if the arrays are equal, false otherwise.
   */
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

  /**
   * Retrieves the numeric values from an enum.
   * @param {T} t - The enum object.
   * @returns {number[]} An array of numeric values from the enum.
   */
  public static getNumEnumValues<T extends object>(t: T): number[] {
    return Object.values(t).filter((v) => typeof v === 'number');
  }

  /**
   * Checks if an object is a numeric array or a TypedArray.
   * @param {unknown} obj - The object to check.
   * @returns {boolean} True if the object is a numeric array or a TypedArray, false otherwise.
   */
  public static isNumArrayOrTypedArray(obj: unknown): boolean {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        ((Array.isArray(obj) &&
          (obj as Array<unknown>).every((v) => typeof v === 'number')) ||
          (ArrayBuffer.isView(obj) && !(obj instanceof DataView)))
    );
  }

  /**
   * Checks if an object is an array of Rational objects.
   * @param {unknown} obj - The object to check.
   * @returns {boolean} True if the object is an array of Rational objects, false otherwise.
   */
  public static isArrayOfRational(obj: unknown): boolean {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        Array.isArray(obj) &&
        (obj as Array<unknown>).every((v) => v instanceof Rational)
    );
  }
}
