/** @format */

/** Type representing various typed arrays */
export type TypedArray =
  /** 8-bit signed integer array */
  | Int8Array
  /** 16-bit signed integer array */
  | Int16Array
  /** 32-bit signed integer array */
  | Int32Array
  /** 8-bit unsigned integer array */
  | Uint8Array
  /** 16-bit unsigned integer array */
  | Uint16Array
  /** 32-bit unsigned integer array */
  | Uint32Array
  /** 32-bit floating point array */
  | Float32Array
  /** 64-bit floating point array */
  | Float64Array;

/** Type representing various buffer encodings */
export type BufferEncoding =
  /** ASCII encoding */
  | 'ascii'
  /** UTF-8 encoding */
  | 'utf8'
  /** UTF-8 encoding (alternative) */
  | 'utf-8'
  /** UTF-16 little-endian encoding */
  | 'utf16le'
  /** UCS-2 encoding */
  | 'ucs2'
  /** UCS-2 encoding (alternative) */
  | 'ucs-2'
  /** Base64 encoding */
  | 'base64'
  /** Latin-1 encoding */
  | 'latin1'
  /** Binary encoding */
  | 'binary'
  /** Hexadecimal encoding */
  | 'hex';

/** Type representing various compression levels */
export type CompressionLevel =
  | -1
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | undefined;
