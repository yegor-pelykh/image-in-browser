/// <reference types="node" />
declare module "common/typings" {
    /** @format */
    export type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array;
    export type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';
    export type CompressionLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined;
}
declare module "common/math-utils" {
    /** @format */
    export abstract class MathUtils {
        static fract(x: number): number;
        static smoothStep(edge0: number, edge1: number, x: number): number;
        static mix(x: number, y: number, a: number): number;
        static sign(x: number): number;
        static step(edge: number, x: number): number;
        static length3(x: number, y: number, z: number): number;
        /**
         * Returns the greatest common divisor of **x** and **y**.
         */
        static gcd(x: number, y: number): number;
        /**
         * Clamp **num** to [**low**, **high**]
         */
        static clamp(num: number, low: number, high: number): number;
        /**
         * Clamp **num** to [**low**, **high**] and truncate
         */
        static clampInt(num: number, low: number, high: number): number;
        /**
         * Clamp **num** to [0, 255] and truncate
         */
        static clampInt255(num: number): number;
    }
}
declare module "error/lib-error" {
    /** @format */
    /**
     * An Error thrown when there was a problem in the library.
     */
    export class LibError extends Error {
        toString(): string;
    }
}
declare module "color/format" {
    /**
     * The format of a color or image.
     */
    export enum Format {
        uint1 = 0,
        uint2 = 1,
        uint4 = 2,
        uint8 = 3,
        uint16 = 4,
        uint32 = 5,
        int8 = 6,
        int16 = 7,
        int32 = 8,
        float16 = 9,
        float32 = 10,
        float64 = 11
    }
    /**
     * The format type of a color or image.
     */
    export enum FormatType {
        uint = 0,
        int = 1,
        float = 2
    }
    export const FormatToFormatType: Map<Format, FormatType>;
    export const FormatSize: Map<Format, number>;
    export const FormatMaxValue: Map<Format, number>;
    /**
     * Convert a value from the **from** format to the **to** format.
     */
    export function convertFormatValue(value: number, from: Format, to: Format): number;
}
declare module "common/bit-utils" {
    /** @format */
    export abstract class BitUtils {
        private static readonly _uint8;
        private static readonly _uint8ToInt8;
        private static readonly _int8;
        private static readonly _int8ToUint8;
        private static readonly _uint16;
        private static readonly _uint16ToInt16;
        private static readonly _int16;
        private static readonly _int16ToUint16;
        private static readonly _uint32;
        private static readonly _uint32ToInt32;
        private static readonly _uint32ToFloat32;
        private static readonly _int32;
        private static readonly _int32ToUint32;
        private static readonly _float32;
        private static readonly _float32ToUint32;
        private static readonly _uint64;
        private static readonly _uint64ToFloat64;
        private static readonly _reverseByteTable;
        /**
         * Count the consecutive zero bits (trailing) on the right in parallel
         * https://graphics.stanford.edu/~seander/bithacks.html#ZerosOnRightParallel
         */
        static countTrailingZeroBits(v: number): number;
        static reverseByte(x: number): number;
        static signed(bits: number, value: number): number;
        static shiftR(v: number, n: number): number;
        static shiftL(v: number, n: number): number;
        /**
         * Binary conversion of a uint8 to an int8. This is equivalent in C to
         * typecasting an unsigned char to a char.
         */
        static uint8ToInt8(d: number): number;
        /**
         * Binary conversion of an int8 to a uint8.
         */
        static int8ToUint8(d: number): number;
        /**
         *  Binary conversion of a uint16 to an int16. This is equivalent in C to
         * typecasting an unsigned short to a short.
         */
        static uint16ToInt16(d: number): number;
        /**
         * Binary conversion of an int16 to a uint16. This is equivalent in C to
         *  typecasting a short to an unsigned short.
         */
        static int16ToUint16(d: number): number;
        /**
         * Binary conversion of a uint32 to an int32. This is equivalent in C to
         *  typecasting an unsigned int to signed int.
         */
        static uint32ToInt32(d: number): number;
        /**
         * Binary conversion of a uint32 to an float32. This is equivalent in C to
         * typecasting an unsigned int to float.
         */
        static uint32ToFloat32(d: number): number;
        /**
         * Binary conversion of a uint64 to an float64. This is equivalent in C to
         * typecasting an unsigned long long to double.
         */
        static uint64ToFloat64(d: bigint): number;
        /**
         * Binary conversion of an int32 to a uint32. This is equivalent in C to
         * typecasting an int to an unsigned int.
         */
        static int32ToUint32(d: number): number;
        /**
         * Binary conversion of a float32 to an uint32. This is equivalent in C to
         * typecasting a float to unsigned int.
         */
        static float32ToUint32(d: number): number;
        static debugBits32(value?: number): string;
    }
}
declare module "common/string-utils" {
    export abstract class StringUtils {
        static readonly utf8Decoder: import("util").TextDecoder;
        static readonly latin1Decoder: import("util").TextDecoder;
        static getCodePoints(str: string): Uint8Array;
    }
}
declare module "common/input-buffer" {
    export interface InputBufferInitOptions {
        buffer: Uint8Array;
        offset?: number;
        length?: number;
        bigEndian?: boolean;
    }
    /**
     * A buffer that can be read as a stream of bytes.
     */
    export class InputBuffer {
        private readonly _buffer;
        get buffer(): Uint8Array;
        private _bigEndian;
        set bigEndian(v: boolean);
        get bigEndian(): boolean;
        private _offset;
        set offset(v: number);
        get offset(): number;
        private _start;
        get start(): number;
        private _end;
        get end(): number;
        /**
         *  The current read position relative to the start of the buffer.
         */
        get position(): number;
        /**
         * How many bytes are left in the stream.
         */
        get length(): number;
        /**
         * Is the current position at the end of the stream?
         */
        get isEOS(): boolean;
        /**
         * Create a InputStream for reading from an Array<int>
         */
        constructor(opt: InputBufferInitOptions);
        /**
         * Create a copy of **other**.
         */
        static from(other: InputBuffer, offset?: number, length?: number): InputBuffer;
        /**
         * Reset to the beginning of the stream.
         */
        rewind(): void;
        /**
         * Access the buffer relative from the current position.
         */
        getByte(index: number): number;
        /**
         * Set a buffer element relative to the current position.
         */
        setByte(index: number, value: number): number;
        /**
         * Set a range of bytes in this buffer to **value**, at **start** offset from the
         * current read position, and **length** number of bytes.
         */
        memset(start: number, length: number, value: number): void;
        /**
         * Return an InputBuffer to read a subset of this stream. It does not
         * move the read position of this stream. **position** is specified relative
         * to the start of the buffer. If **position** is not specified, the current
         * read position is used. If **length** is not specified, the remainder of this
         * stream is used.
         */
        subarray(count: number, position?: number, offset?: number): InputBuffer;
        /**
         * Returns the position of the given **value** within the buffer, starting
         * from the current read position with the given **offset**. The position
         * returned is relative to the start of the buffer, or -1 if the **value**
         * was not found.
         */
        indexOf(value: number, offset?: number): number;
        /**
         * Read **count** bytes from an **offset** of the current read position, without
         * moving the read position.
         */
        peekBytes(count: number, offset?: number): InputBuffer;
        /**
         * Move the read position by **count** bytes.
         */
        skip(count: number): void;
        /**
         * Read a single byte.
         */
        readByte(): number;
        readInt8(): number;
        /**
         * Read **count** bytes from the stream.
         */
        readBytes(count: number): InputBuffer;
        /**
         * Read a null-terminated string, or if **length** is provided, that number of
         * bytes returned as a string.
         */
        readString(length?: number): string;
        /**
         * Read a null-terminated UTF-8 string.
         */
        readStringUtf8(): string;
        /**
         * Read a 16-bit word from the stream.
         */
        readUint16(): number;
        /**
         * Read a 16-bit word from the stream.
         */
        readInt16(): number;
        /**
         * Read a 24-bit word from the stream.
         */
        readUint24(): number;
        /**
         * Read a 32-bit word from the stream.
         */
        readUint32(): number;
        /**
         * Read a signed 32-bit integer from the stream.
         */
        readInt32(): number;
        /**
         * Read a 32-bit float.
         */
        readFloat32(): number;
        /**
         * Read a 64-bit float.
         */
        readFloat64(): number;
        /**
         * Read a 64-bit word form the stream.
         */
        readUint64(): bigint;
        toUint8Array(offset?: number, length?: number): Uint8Array;
        toUint32Array(offset?: number): Uint32Array;
    }
}
declare module "color/channel-order" {
    /** @format */
    export enum ChannelOrder {
        rgba = 0,
        bgra = 1,
        abgr = 2,
        argb = 3,
        rgb = 4,
        bgr = 5,
        grayAlpha = 6,
        red = 7
    }
    /**
     * The number of channels for each ChannelOrder.
     */
    export const ChannelOrderLength: Map<ChannelOrder, number>;
}
declare module "image/palette" {
    /** @format */
    import { Format } from "color/format";
    export interface Palette {
        /**
         * The size of the palette data in bytes.
         */
        get byteLength(): number;
        /**
         * The byte buffer storage of the palette data.
         */
        get buffer(): ArrayBufferLike;
        /**
         * The number of colors stored in the palette.
         */
        get numColors(): number;
        /**
         * The number of channels per color.
         */
        get numChannels(): number;
        get maxChannelValue(): number;
        /**
         * The format of the color data.
         */
        get format(): Format;
        /**
         * Set the RGB color of a palette entry at **index**. If the palette has fewer
         * channels than are set, the unsupported channels will be ignored.
         */
        setRgb(index: number, r: number, g: number, b: number): void;
        /**
         * Set the RGBA color of a palette entry at **index**. If the palette has fewer
         * channels than are set, the unsupported channels will be ignored.
         */
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        /**
         * Set a specific **channel** **value** of the palette entry at **index**. If the
         * palette has fewer channels than **channel**, the value will be ignored.
         */
        set(index: number, channel: number, value: number): void;
        /**
         * Get the the value of a specific **channel** of the palette entry at **index**.
         * If the palette has fewer colors than **index** or fewer channels than
         * **channel**, 0 will be returned.
         */
        get(index: number, channel: number): number;
        /**
         * Get the red channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, 0 will be returned.
         */
        getRed(index: number): number;
        /**
         * Set the red channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, it will be ignored.
         */
        setRed(index: number, value: number): void;
        /**
         * Get the green channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, 0 will be returned.
         */
        getGreen(index: number): number;
        /**
         * Set the green channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, it will be ignored.
         */
        setGreen(index: number, value: number): void;
        /**
         * Get the blue channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, 0 will be returned.
         */
        getBlue(index: number): number;
        /**
         * Set the blue channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, it will be ignored.
         */
        setBlue(index: number, value: number): void;
        /**
         * Get the alpha channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, 0 will be returned.
         */
        getAlpha(index: number): number;
        /**
         * Set the alpha channel of the palette entry at **index**. If the palette has
         * fewer colors or channels, it will be ignored.
         */
        setAlpha(index: number, value: number): void;
        /**
         * Create a copy of the Palette.
         */
        clone(): Palette;
        /**
         * A Uint8Array view of the palette buffer storage.
         */
        toUint8Array(): Uint8Array;
    }
}
declare module "color/channel" {
    /** @format */
    /**
     * A channel of a color
     */
    export enum Channel {
        /**
         * Red channel
         */
        red = 0,
        /**
         * Green channel
         */
        green = 1,
        /**
         * Blue channel
         */
        blue = 2,
        /**
         * Alpha channel
         */
        alpha = 3,
        /**
         * Luminance is not an actual channel, it is the brightness value of the color.
         */
        luminance = 4
    }
}
declare module "color/color" {
    /** @format */
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Format } from "color/format";
    export interface ColorConvertOptions {
        format?: Format;
        numChannels?: number;
        alpha?: number;
    }
    /**
     * The abstract Color class is the base class for all specific color classes
     * and Pixel classes.
     */
    export interface Color {
        /**
         * The number of channels used by the color.
         */
        get length(): number;
        /**
         * The maximum value for a color channel.
         */
        get maxChannelValue(): number;
        /**
         * The maximum value for a palette index.
         */
        get maxIndexValue(): number;
        /**
         * The Format of the color.
         */
        get format(): Format;
        /**
         *  True if the format is low dynamic range.
         */
        get isLdrFormat(): boolean;
        /**
         * True if the format is high dynamic range.
         */
        get isHdrFormat(): boolean;
        /**
         * True if the color uses a palette.
         */
        get hasPalette(): boolean;
        /**
         * The palette used by the color, or undefined.
         */
        get palette(): Palette | undefined;
        /**
         * Palette index value (or red channel if there is no palette).
         */
        get index(): number;
        set index(i: number);
        /**
         * Red channel.
         */
        get r(): number;
        set r(r: number);
        /**
         * Green channel.
         */
        get g(): number;
        set g(g: number);
        /**
         * Blue channel.
         */
        get b(): number;
        set b(b: number);
        /**
         * Alpha channel.
         */
        get a(): number;
        set a(a: number);
        /**
         * Normalized [0, 1] red.
         */
        get rNormalized(): number;
        set rNormalized(v: number);
        /**
         * Normalized [0, 1] green.
         */
        get gNormalized(): number;
        set gNormalized(v: number);
        /**
         * Normalized [0, 1] blue.
         */
        get bNormalized(): number;
        set bNormalized(v: number);
        /**
         * Normalized [0, 1] alpha.
         */
        get aNormalized(): number;
        set aNormalized(v: number);
        /**
         * The luminance (grayscale) of the color.
         */
        get luminance(): number;
        get luminanceNormalized(): number;
        /**
         * Gets a channel from the color by its index or Channel enum.
         * If the channel isn't available, 0 will be returned.
         */
        getChannel(channel: number | Channel): number;
        /**
         * Sets a channel to the color by its index.
         */
        setChannel(channel: number | Channel, value: number): void;
        /**
         * Get the normalized [0, 1] value of A channel from the color. If the
         * channel isn't available, 0 will be returned.
         */
        getChannelNormalized(channel: number | Channel): number;
        /**
         * The the values of this color to the given Color.
         */
        set(color: Color): void;
        /**
         * Set the individual **r**, **g**, **b** channels of the color.
         */
        setRgb(r: number, g: number, b: number): void;
        /**
         * Set the individual **r**, **g**, **b**, **a** channels of the color.
         */
        setRgba(r: number, g: number, b: number, a: number): void;
        /**
         * Converts the color to an array of channels.
         */
        toArray(): number[];
        /**
         * Returns a copy of the color.
         */
        clone(): Color;
        /**
         * Convert the **format** and/or the **numChannels** of the color. If
         * **numChannels** is 4 and the current color does not have an alpha value,
         * then **alpha** can specify what value to use for the new alpha channel.
         * If **alpha** is not given, then **maxChannelValue** will be used.
         */
        convert(opt: ColorConvertOptions): Color;
        /**
         * Tests if this color is equivalent to another **Color**.
         */
        equals(other: Color | number[]): boolean;
    }
}
declare module "common/rational" {
    export class Rational {
        private _numerator;
        get numerator(): number;
        private _denominator;
        get denominator(): number;
        get toInt(): number;
        get toDouble(): number;
        constructor(numerator: number, denominator: number);
        simplify(): void;
        equals(other: Rational): boolean;
        toString(): string;
    }
}
declare module "common/array-utils" {
    import { Rational } from "common/rational";
    import { TypedArray } from "common/typings";
    export abstract class ArrayUtils {
        static copyInt8(from: Int8Array, begin?: number, end?: number): Int8Array;
        static copyUint8(from: Uint8Array, begin?: number, end?: number): Uint8Array;
        static copyInt16(from: Int16Array, begin?: number, end?: number): Int16Array;
        static copyUint16(from: Uint16Array, begin?: number, end?: number): Uint16Array;
        static copyInt32(from: Int32Array, begin?: number, end?: number): Int32Array;
        static copyUint32(from: Uint32Array, begin?: number, end?: number): Uint32Array;
        static copyFloat32(from: Float32Array, begin?: number, end?: number): Float32Array;
        static copyFloat64(from: Float64Array, begin?: number, end?: number): Float64Array;
        static copy(from: TypedArray, begin?: number, end?: number): TypedArray;
        static copyRange<T extends TypedArray>(from: T, fromStart: number, fromEnd: number, to: T, toStart: number): void;
        static fill<T>(length: number, value: T): T[];
        static generate<T>(length: number, func: (index: number) => T): T[];
        static equals(a1: TypedArray | unknown[], a2: TypedArray | unknown[]): boolean;
        static equalsRationalArray(a1: Rational[], a2: Rational[]): boolean;
        static getNumEnumValues<T extends object>(t: T): number[];
        static isNumArrayOrTypedArray(obj: unknown): boolean;
        static isArrayOfRational(obj: unknown): boolean;
    }
}
declare module "common/float16" {
    /**
     * A 16-bit floating-point number, used by high-dynamic-range image formats
     * as a more efficient storage for floating-point values that don't require
     * full 32-bit precision. A list of Half floats can be stored in a
     * Uint16Array, and converted to a double using the **float16ToDouble** static
     * method.
     *
     * This class is derived from the OpenEXR library.
     */
    export class Float16 {
        private static _toFloatFloat32Data?;
        private static _eLut;
        private static get _toFloatFloat32();
        bits: number;
        constructor(f?: number);
        private static convert;
        private static initialize;
        private static halfToFloat;
        static from(other: Float16): Float16;
        static fromBits(bits: number): Float16;
        static float16ToDouble(bits: number): number;
        static doubleToFloat16(n: number): number;
        /**
         * Returns +Infinity.
         */
        static posInf(): Float16;
        /**
         * Returns -Infinity.
         */
        static negInf(): Float16;
        /**
         * Returns a NaN with the bit pattern 0111111111111111.
         */
        static qNan(): Float16;
        /**
         * Returns a NaN with the bit pattern 0111110111111111.
         */
        static sNan(): Float16;
        toDouble(): number;
        /**
         * Unary minus
         */
        minus(): Float16;
        /**
         * Addition operator for Half or num left operands.
         */
        add(f: Float16 | number): Float16;
        /**
         * Subtraction operator for Half or num left operands.
         */
        sub(f: Float16 | number): Float16;
        /**
         * Multiplication operator for Half or num left operands.
         */
        mul(f: Float16 | number): Float16;
        /**
         * Division operator for Half or num left operands.
         */
        div(f: Float16 | number): Float16;
        /**
         * Round to n-bit precision (n should be between 0 and 10).
         * After rounding, the significand's 10-n least significant
         * bits will be zero.
         */
        round(n: number): Float16;
        /**
         * Returns true if h is a normalized number, a denormalized number or zero.
         */
        isFinite(): boolean;
        /**
         * Returns true if h is a normalized number.
         */
        isNormalized(): boolean;
        /**
         * Returns true if h is a denormalized number.
         */
        isDenormalized(): boolean;
        /**
         * Returns true if h is zero.
         */
        isZero(): boolean;
        /**
         * Returns true if h is a NaN.
         */
        isNaN(): boolean;
        /**
         * Returns true if h is a positive or a negative infinity.
         */
        isInfinity(): boolean;
        /**
         * Returns true if the sign bit of h is set (negative).
         */
        isNegative(): boolean;
    }
}
declare module "color/color-float16" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 16-bit floating point color.
     */
    export class ColorFloat16 implements Color {
        protected data: Uint16Array;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Uint16Array | number);
        static from(other: ColorFloat16): ColorFloat16;
        static fromArray(color: Uint16Array): ColorFloat16;
        static rgb(r: number, g: number, b: number): ColorFloat16;
        static rgba(r: number, g: number, b: number, a: number): ColorFloat16;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorFloat16;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-float32" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 32-bit floating point color.
     */
    export class ColorFloat32 implements Color {
        protected data: Float32Array;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Float32Array | number);
        static from(other: ColorFloat32): ColorFloat32;
        static fromArray(color: Float32Array): ColorFloat32;
        static rgb(r: number, g: number, b: number): ColorFloat32;
        static rgba(r: number, g: number, b: number, a: number): ColorFloat32;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorFloat32;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-float64" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 64-bit floating point color.
     */
    export class ColorFloat64 implements Color {
        protected data: Float64Array;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Float64Array | number);
        static from(other: ColorFloat64): ColorFloat64;
        static fromArray(color: Float64Array): ColorFloat64;
        static rgb(r: number, g: number, b: number): ColorFloat64;
        static rgba(r: number, g: number, b: number, a: number): ColorFloat64;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorFloat64;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-int16" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 16-bit integer color.
     */
    export class ColorInt16 implements Color {
        private _data;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Int16Array | number);
        static from(other: ColorInt16): ColorInt16;
        static fromArray(color: number[]): ColorInt16;
        static rgb(r: number, g: number, b: number): ColorInt16;
        static rgba(r: number, g: number, b: number, a: number): ColorInt16;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorInt16;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-int32" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 32-bit integer color.
     */
    export class ColorInt32 implements Color {
        private _data;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Int32Array | number);
        static from(other: ColorInt32): ColorInt32;
        static fromArray(color: number[]): ColorInt32;
        static rgb(r: number, g: number, b: number): ColorInt32;
        static rgba(r: number, g: number, b: number, a: number): ColorInt32;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorInt32;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-int8" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 8-bit integer color.
     */
    export class ColorInt8 implements Color {
        private _data;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Int8Array | number);
        static from(other: ColorInt8): ColorInt8;
        static fromArray(color: number[]): ColorInt8;
        static rgb(r: number, g: number, b: number): ColorInt8;
        static rgba(r: number, g: number, b: number, a: number): ColorInt8;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorInt8;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-uint1" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 1-bit unsigned int color with channel values in the range [0, 1].
     */
    export class ColorUint1 implements Color {
        private _data;
        get format(): Format;
        private readonly _length;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: number[] | number);
        static from(other: ColorUint1): ColorUint1;
        static fromArray(color: number[]): ColorUint1;
        static rgb(r: number, g: number, b: number): ColorUint1;
        static rgba(r: number, g: number, b: number, a: number): ColorUint1;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorUint1;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-uint16" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 16-bit unsigned int color with channel values in the range [0, 65535].
     */
    export class ColorUint16 implements Color {
        protected data: Uint16Array;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Uint16Array | number);
        static from(other: ColorUint16): ColorUint16;
        static fromArray(color: Uint16Array): ColorUint16;
        static rgb(r: number, g: number, b: number): ColorUint16;
        static rgba(r: number, g: number, b: number, a: number): ColorUint16;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorUint16;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-uint2" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 2-bit unsigned int color with channel values in the range [0, 3].
     */
    export class ColorUint2 implements Color {
        private _data;
        get format(): Format;
        private readonly _length;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: number[] | number);
        static from(other: ColorUint2): ColorUint2;
        static fromArray(color: number[]): ColorUint2;
        static rgb(r: number, g: number, b: number): ColorUint2;
        static rgba(r: number, g: number, b: number, a: number): ColorUint2;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorUint2;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-uint32" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 32-bit unsigned int color.
     */
    export class ColorUint32 implements Color {
        protected data: Uint32Array;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Uint32Array | number);
        static from(other: ColorUint32): ColorUint32;
        static fromArray(color: Uint32Array): ColorUint32;
        static rgb(r: number, g: number, b: number): ColorUint32;
        static rgba(r: number, g: number, b: number, a: number): ColorUint32;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorUint32;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-uint4" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * A 4-bit unsigned int color with channel values in the range [0, 15].
     */
    export class ColorUint4 implements Color {
        private _data;
        get format(): Format;
        private readonly _length;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Uint8Array | number);
        static from(other: ColorUint4): ColorUint4;
        static fromArray(color: Uint8Array): ColorUint4;
        static rgb(r: number, g: number, b: number): ColorUint4;
        static rgba(r: number, g: number, b: number, a: number): ColorUint4;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorUint4;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "color/color-utils" {
    import { Color } from "color/color";
    import { Format } from "color/format";
    export interface ConvertColorOptions {
        from: Color;
        to?: Color;
        format?: Format;
        numChannels?: number;
        alpha?: number;
    }
    export abstract class ColorUtils {
        private static convertColorInternal;
        static uint32ToRed(c: number): number;
        static uint32ToGreen(c: number): number;
        static uint32ToBlue(c: number): number;
        static uint32ToAlpha(c: number): number;
        static rgbaToUint32(r: number, g: number, b: number, a: number): number;
        static convertColor(opt: ConvertColorOptions): Color;
        /**
         * Returns the luminance (grayscale) value of the color.
         */
        static getLuminance(c: Color): number;
        /**
         * Returns the normalized [0, 1] luminance (grayscale) value of the color.
         */
        static getLuminanceNormalized(c: Color): number;
        /**
         * Returns the luminance (grayscale) value of the color.
         */
        static getLuminanceRgb(r: number, g: number, b: number): number;
        /**
         *  Convert an HSL color to RGB, where **hue** is specified in normalized degrees
         * [0, 1] (where 1 is 360-degrees); **saturation** and **lightness** are in the range [0, 1].
         * Returns a list [r, g, b] with values in the range [0, 255].
         */
        static hslToRgb(hue: number, saturation: number, lightness: number): number[];
        /**
         * Convert an HSV color to RGB, where **hue** is specified in normalized degrees
         * [0, 1] (where 1 is 360-degrees); **saturation** and **brightness** are in the range [0, 1].
         * Returns a list [r, g, b] with values in the range [0, 255].
         */
        static hsvToRgb(hue: number, saturation: number, brightness: number): number[];
        /**
         * Convert an RGB color to HSL, where **r**, **g** and **b** are in the range [0, 255].
         * Returns a list [h, s, l] with values in the range [0, 1].
         */
        static rgbToHsl(r: number, g: number, b: number): number[];
        /**
         * Convert a CIE L\*a\*b color to XYZ.
         */
        static labToXyz(l: number, a: number, b: number): number[];
        /**
         * Convert an XYZ color to RGB.
         */
        static xyzToRgb(x: number, y: number, z: number): number[];
        /**
         * Convert a CMYK color to RGB, where **c**, **m**, **y**, **k** values are in the range
         * [0, 255]. Returns a list [r, g, b] with values in the range [0, 255].
         */
        static cmykToRgb(c: number, m: number, y: number, k: number): number[];
        /**
         * Convert a CIE L\*a\*b color to RGB.
         */
        static labToRgb(l: number, a: number, b: number): number[];
        /**
         * Convert a RGB color to XYZ.
         */
        static rgbToXyz(r: number, g: number, b: number): number[];
        /**
         * Convert a XYZ color to CIE L\*a\*b.
         */
        static xyzToLab(x: number, y: number, z: number): number[];
        /**
         * Convert a RGB color to CIE L\*a\*b.
         */
        static rgbToLab(r: number, g: number, b: number): number[];
    }
}
declare module "color/color-uint8" {
    import { Palette } from "image/palette";
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    /**
     * An 8-bit unsigned int color with channel values in the range [0, 255].
     */
    export class ColorUint8 implements Color {
        protected data: Uint8Array;
        get format(): Format;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(i: number);
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(data: Uint8Array | number);
        static from(other: ColorUint8): ColorUint8;
        static fromArray(color: Uint8Array): ColorUint8;
        static rgb(r: number, g: number, b: number): ColorUint8;
        static rgba(r: number, g: number, b: number, a: number): ColorUint8;
        getChannel(channel: number | Channel, defValue?: number): number;
        getChannelNormalized(channel: number | Channel): number;
        setChannel(index: number | Channel, value: number): void;
        set(c: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        clone(): ColorUint8;
        equals(other: Color): boolean;
        convert(opt?: ColorConvertOptions): Color;
    }
}
declare module "common/interpolation" {
    /** @format */
    /**
     * Interpolation method to use when resizing images.
     */
    export enum Interpolation {
        /**
         * Select the closest pixel.Fastest, lowest quality.
         */
        nearest = 0,
        /**
         * Linearly blend between the neighboring pixels.
         */
        linear = 1,
        /**
         * Cubic blend between the neighboring pixels. Slowest, highest Quality.
         */
        cubic = 2,
        /**
         * Average the colors of the neighboring pixels.
         */
        average = 3
    }
}
declare module "common/output-buffer" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export interface OutputBufferInitOptions {
        bigEndian?: boolean;
        size?: number;
    }
    export class OutputBuffer {
        private static readonly _blockSize;
        private _buffer;
        get buffer(): Uint8Array;
        private _bigEndian;
        get bigEndian(): boolean;
        set bigEndian(v: boolean);
        private _length;
        get length(): number;
        set length(v: number);
        /**
         * Create a byte buffer for writing.
         */
        constructor(opt?: OutputBufferInitOptions);
        /**
         * Grow the buffer to accommodate additional data.
         */
        private expandBuffer;
        rewind(): void;
        /**
         * Clear the buffer.
         */
        clear(): void;
        /**
         * Get the resulting bytes from the buffer.
         */
        getBytes(): Uint8Array;
        /**
         * Write a byte to the end of the buffer.
         */
        writeByte(value: number): void;
        /**
         * Write a set of bytes to the end of the buffer.
         */
        writeBytes(bytes: Uint8Array, length?: number): void;
        writeBuffer(bytes: InputBuffer): void;
        /**
         * Write a 16-bit word to the end of the buffer.
         */
        writeUint16(value: number): void;
        /**
         * Write a 32-bit word to the end of the buffer.
         */
        writeUint32(value: number): void;
        /**
         * Write a 32-bit float value to the end of the buffer.
         */
        writeFloat32(value: number): void;
        /**
         * Write a 64-bit float value to the end of the buffer.
         */
        writeFloat64(value: number): void;
        /**
         * Return the subarray of the buffer in the range [**start**,**end**].
         * If **start** or **end** are < 0 then it is relative to the end of the buffer.
         * If **end** is not specified (or undefined), then it is the end of the buffer.
         * This is equivalent to the python list range operator.
         */
        subarray(start: number, end?: number): Uint8Array;
    }
}
declare module "exif/ifd-value-type" {
    /** @format */
    export enum IfdValueType {
        none = 0,
        byte = 1,
        ascii = 2,
        short = 3,
        long = 4,
        rational = 5,
        sByte = 6,
        undefined = 7,
        sShort = 8,
        sLong = 9,
        sRational = 10,
        single = 11,
        double = 12
    }
    export const IfdValueTypeSize: number[];
    export function getIfdValueTypeString(type: IfdValueType): string;
    export function getIfdValueTypeSize(type: IfdValueType, length?: number): number;
}
declare module "exif/ifd-value/ifd-value" {
    /** @format */
    import { OutputBuffer } from "common/output-buffer";
    import { Rational } from "common/rational";
    import { IfdValueType } from "exif/ifd-value-type";
    export abstract class IfdValue {
        get type(): IfdValueType;
        get length(): number;
        get dataSize(): number;
        get typeString(): string;
        toBool(_index?: number): boolean;
        toInt(_index?: number): number;
        toDouble(_index?: number): number;
        toData(): Uint8Array;
        toRational(_index?: number): Rational;
        write(_out: OutputBuffer): void;
        setBool(_v: boolean, _index?: number): void;
        setInt(_v: number, _index?: number): void;
        setDouble(_v: number, _index?: number): void;
        setRational(_numerator: number, _denomitator: number, _index?: number): void;
        setString(_v: string): void;
        equals(_other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/exif-entry" {
    /** @format */
    import { IfdValue } from "exif/ifd-value/ifd-value";
    export class ExifEntry {
        private readonly _tag;
        get tag(): number;
        private _value;
        get value(): IfdValue | undefined;
        set value(v: IfdValue | undefined);
        constructor(tag: number, value?: IfdValue);
    }
}
declare module "exif/exif-tag" {
    /** @format */
    import { IfdValueType } from "exif/ifd-value-type";
    export interface ExifTagInitOptions {
        name: string;
        type?: IfdValueType;
        count?: number;
    }
    export class ExifTag {
        private readonly _name;
        get name(): string;
        private readonly _type;
        get type(): IfdValueType;
        private _count?;
        get count(): number | undefined;
        constructor(opt: ExifTagInitOptions);
    }
    export const ExifTagNameToID: Map<string, number>;
    export const ExifImageTags: Map<number, ExifTag>;
    export const ExifInteropTags: Map<number, ExifTag>;
    export const ExifGpsTags: Map<number, ExifTag>;
}
declare module "exif/ifd-value/ifd-ascii-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdAsciiValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: number[] | string);
        static data(data: InputBuffer, length: number): IfdAsciiValue;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setString(v: string): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-short-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdShortValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Uint16Array | number);
        static data(data: InputBuffer, length: number): IfdShortValue;
        toInt(index?: number): number;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-rational-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    import { Rational } from "common/rational";
    export class IfdRationalValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Rational[] | Rational);
        static data(data: InputBuffer, length: number): IfdRationalValue;
        static from(other: Rational): IfdRationalValue;
        toInt(index?: number): number;
        toDouble(index?: number): number;
        toRational(index?: number): Rational;
        write(out: OutputBuffer): void;
        setRational(numerator: number, denomitator: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-byte-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdByteValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Uint8Array | number);
        static data(data: InputBuffer, offset?: number, length?: number): IfdByteValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-long-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdLongValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Uint32Array | number);
        static data(data: InputBuffer, length: number): IfdLongValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-sbyte-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdSByteValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Int8Array | number);
        static data(data: InputBuffer, offset?: number, length?: number): IfdSByteValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-undefined-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdUndefinedValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Uint8Array | number);
        static data(data: InputBuffer, offset?: number, length?: number): IfdUndefinedValue;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-sshort-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdSShortValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Int16Array | number);
        static data(data: InputBuffer, length: number): IfdSShortValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-slong-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdSLongValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Int32Array | number);
        static data(data: InputBuffer, length: number): IfdSLongValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-srational-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    import { Rational } from "common/rational";
    export class IfdSRationalValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Rational[] | Rational);
        static data(data: InputBuffer, length: number): IfdSRationalValue;
        static from(other: Rational): IfdSRationalValue;
        toInt(index?: number): number;
        toDouble(index?: number): number;
        toRational(index?: number): Rational;
        write(out: OutputBuffer): void;
        setRational(numerator: number, denomitator: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-single-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdSingleValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Float32Array | number);
        static data(data: InputBuffer, length: number): IfdSingleValue;
        toDouble(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setDouble(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-value/ifd-double-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { IfdValueType } from "exif/ifd-value-type";
    export class IfdDoubleValue extends IfdValue {
        private _value;
        get type(): IfdValueType;
        get length(): number;
        constructor(value: Float64Array | number);
        static data(data: InputBuffer, length: number): IfdDoubleValue;
        toDouble(index?: number): number;
        toData(): Uint8Array;
        write(out: OutputBuffer): void;
        setDouble(v: number, index?: number): void;
        equals(other: IfdValue): boolean;
        clone(): IfdValue;
        toString(): string;
    }
}
declare module "exif/ifd-directory" {
    /** @format */
    import { Rational } from "common/rational";
    import { IfdContainer } from "exif/ifd-container";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    import { TypedArray } from "common/typings";
    export class IfdDirectory {
        private readonly _data;
        private readonly _sub;
        get sub(): IfdContainer;
        get keys(): IterableIterator<number>;
        get values(): IterableIterator<IfdValue>;
        get entries(): IterableIterator<[number, IfdValue]>;
        get size(): number;
        get isEmpty(): boolean;
        get hasUserComment(): boolean;
        get userComment(): string | undefined;
        set userComment(v: string | undefined);
        get hasImageDescription(): boolean;
        get imageDescription(): string | undefined;
        set imageDescription(v: string | undefined);
        get hasMake(): boolean;
        get make(): string | undefined;
        set make(v: string | undefined);
        get hasModel(): boolean;
        get model(): string | undefined;
        set model(v: string | undefined);
        get hasOrientation(): boolean;
        get orientation(): number | undefined;
        set orientation(v: number | undefined);
        get hasResolutionX(): boolean;
        get resolutionX(): Rational | undefined;
        set resolutionX(v: Rational | undefined);
        get hasResolutionY(): boolean;
        get resolutionY(): Rational | undefined;
        set resolutionY(v: Rational | undefined);
        get hasResolutionUnit(): boolean;
        get resolutionUnit(): number | undefined;
        set resolutionUnit(v: number | undefined);
        get hasImageWidth(): boolean;
        get imageWidth(): number | undefined;
        set imageWidth(v: number | undefined);
        get hasImageHeight(): boolean;
        get imageHeight(): number | undefined;
        set imageHeight(v: number | undefined);
        get hasSoftware(): boolean;
        get software(): string | undefined;
        set software(v: string | undefined);
        get hasCopyright(): boolean;
        get copyright(): string | undefined;
        set copyright(v: string | undefined);
        /**
         * The size in bytes of the data written by this directory. Can be used to
         * calculate end-of-block offsets.
         */
        get dataSize(): number;
        constructor(data?: Map<number, IfdValue>);
        private setRational;
        static from(other: IfdDirectory): IfdDirectory;
        static isArrayOfRationalNumbers(value: unknown): boolean;
        has(tag: number): boolean;
        getValue(tag: number | string): IfdValue | undefined;
        setValue(tag: number | string, value: Rational[] | number[] | TypedArray | Rational | IfdValue | number | undefined): void;
        copyFrom(other: IfdDirectory): void;
        clone(): IfdDirectory;
    }
}
declare module "exif/ifd-container" {
    /** @format */
    import { IfdDirectory } from "exif/ifd-directory";
    export class IfdContainer {
        protected directories: Map<string, IfdDirectory>;
        get keys(): IterableIterator<string>;
        get values(): IterableIterator<IfdDirectory>;
        get entries(): IterableIterator<[string, IfdDirectory]>;
        get size(): number;
        get isEmpty(): boolean;
        constructor(directories?: Map<string, IfdDirectory>);
        static from(other: IfdContainer): IfdContainer;
        has(key: string): boolean;
        get(ifdName: string): IfdDirectory;
        set(ifdName: string, value: IfdDirectory): void;
        clear(): void;
    }
}
declare module "exif/exif-data" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { IfdContainer } from "exif/ifd-container";
    import { IfdDirectory } from "exif/ifd-directory";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    export class ExifData extends IfdContainer {
        get imageIfd(): IfdDirectory;
        get thumbnailIfd(): IfdDirectory;
        get exifIfd(): IfdDirectory;
        get gpsIfd(): IfdDirectory;
        get interopIfd(): IfdDirectory;
        get dataSize(): number;
        private writeDirectory;
        private writeDirectoryLargeValues;
        private readEntry;
        static from(other: ExifData): ExifData;
        static fromInputBuffer(input: InputBuffer): ExifData;
        hasTag(tag: number): boolean;
        getTag(tag: number): IfdValue | undefined;
        getTagName(tag: number): string;
        write(out: OutputBuffer): void;
        read(block: InputBuffer): boolean;
        clone(): ExifData;
        toString(): string;
    }
}
declare module "image/frame-type" {
    /** @format */
    /**
     * The type of image this frame represents. Multi-page formats, such as
     * TIFF, can represent the frames of an animation as pages in a document.
     */
    export enum FrameType {
        /**
         * The frames of this document are to be interpreted as animation.
         */
        animation = 0,
        /**
         * The frames of this document are to be interpreted as pages of a document.
         */
        page = 1,
        /**
         * The frames of this document are to be interpreted as a sequence of images.
         */
        sequence = 2
    }
}
declare module "image/icc-profile-compression" {
    /** @format */
    export enum IccProfileCompression {
        none = 0,
        deflate = 1
    }
}
declare module "image/icc-profile" {
    import { IccProfileCompression } from "image/icc-profile-compression";
    /**
     * ICC Profile data stored with an image.
     */
    export class IccProfile {
        private _name;
        get name(): string;
        private _compression;
        get compression(): IccProfileCompression;
        private _data;
        get data(): Uint8Array;
        constructor(name: string, compression: IccProfileCompression, data: Uint8Array);
        static from(other: IccProfile): IccProfile;
        /**
         * Returns the compressed data of the ICC Profile, compressing the stored data as necessary.
         */
        compressed(): Uint8Array;
        /**
         * Returns the uncompressed data of the ICC Profile, decompressing the stored data as necessary.
         */
        decompressed(): Uint8Array;
        clone(): IccProfile;
    }
}
declare module "image/pixel-uint8" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataUint8 } from "image/image-data-uint8";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelUint8 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataUint8;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint8Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataUint8);
        static imageData(image: MemoryImageDataUint8): PixelUint8;
        static image(image: MemoryImage): PixelUint8;
        static from(other: PixelUint8): PixelUint8;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        equals(other: Pixel | number[]): boolean;
        toArray(): number[];
        clone(): PixelUint8;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/pixel-range-iterator" {
    /** @format */
    import { Pixel } from "image/pixel";
    export class PixelRangeIterator implements Iterator<Pixel> {
        private _pixel;
        private _x1;
        private _y1;
        private _x2;
        private _y2;
        constructor(pixel: Pixel, x: number, y: number, width: number, height: number);
        next(): IteratorResult<Pixel>;
        [Symbol.iterator](): IterableIterator<Pixel>;
    }
}
declare module "color/color-rgb8" {
    /** @format */
    import { ColorUint8 } from "color/color-uint8";
    export class ColorRgb8 extends ColorUint8 {
        constructor(r: number, g: number, b: number);
        static from(other: ColorUint8): ColorUint8;
    }
}
declare module "color/color-rgba8" {
    /** @format */
    import { ColorUint8 } from "color/color-uint8";
    export class ColorRgba8 extends ColorUint8 {
        constructor(r: number, g: number, b: number, a: number);
        static from(other: ColorUint8): ColorUint8;
    }
}
declare module "image/image-data-uint8" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelUint8 } from "image/pixel-uint8";
    export class MemoryImageDataUint8 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint8Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelUint8;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        private _palette?;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint8Array);
        static palette(width: number, height: number, palette?: Palette): MemoryImageDataUint8;
        static from(other: MemoryImageDataUint8, skipPixels?: boolean): MemoryImageDataUint8;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataUint8;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-undefined" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    /**
     * Represents an invalid pixel.
     */
    export class PixelUndefined implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private static readonly _nullImageData;
        get image(): MemoryImageData;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get x(): number;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get index(): number;
        set index(_i: number);
        get r(): number;
        set r(_r: number);
        get g(): number;
        set g(_g: number);
        get b(): number;
        set b(_b: number);
        get a(): number;
        set a(_a: number);
        get rNormalized(): number;
        set rNormalized(_v: number);
        get gNormalized(): number;
        set gNormalized(_v: number);
        get bNormalized(): number;
        set bNormalized(_v: number);
        get aNormalized(): number;
        set aNormalized(_v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        getChannel(_channel: number): number;
        getChannelNormalized(_channel: Channel): number;
        setChannel(_channel: number, _value: number): void;
        set(_color: Color): void;
        setRgb(_r: number, _g: number, _b: number): void;
        setRgba(_r: number, _g: number, _b: number, _a: number): void;
        clone(): Color;
        convert(_options: ColorConvertOptions): Color;
        setPosition(_x: number, _y: number): void;
        setPositionNormalized(_x: number, _y: number): void;
        equals(other: Pixel): boolean;
        next(): IteratorResult<Pixel>;
        toArray(): number[];
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/pixel" {
    /** @format */
    import { Color } from "color/color";
    import { MemoryImageData } from "image/image-data";
    import { PixelUndefined } from "image/pixel-undefined";
    export interface Pixel extends Color, Iterator<Pixel> {
        /**
         * The [MemoryImageData] this pixel refers to.
         */
        get image(): MemoryImageData;
        /**
         * True if this points to a valid pixel, otherwise false.
         */
        get isValid(): boolean;
        /**
         * The width in pixels of the image data this pixel refers to.
         */
        get width(): number;
        /**
         * The height in pixels of the image data this pixel refers to.
         */
        get height(): number;
        /**
         * The x coordinate of the pixel.
         */
        get x(): number;
        /**
         * The y coordinate of the pixel.
         */
        get y(): number;
        /**
         * The normalized x coordinate of the pixel, in the range [0, 1].
         */
        get xNormalized(): number;
        /**
         * The normalized y coordinate of the pixel, in the range [0, 1].
         */
        get yNormalized(): number;
        /**
         * Set the coordinates of the pixel.
         */
        setPosition(x: number, y: number): void;
        /**
         * Set the normalized coordinates of the pixel, in the range [0, 1].
         */
        setPositionNormalized(x: number, y: number): void;
        /**
         * Tests if this pixel has the same values as the given pixel or color.
         */
        equals(other: Pixel | number[]): boolean;
    }
    /**
     * UndefinedPixel is used to represent an invalid pixel.
     */
    export const UndefinedPixel: PixelUndefined;
}
declare module "image/image-data" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export interface MemoryImageData extends Iterable<Pixel> {
        get width(): number;
        get height(): number;
        get numChannels(): number;
        /**
         * The channel **Format** of the image.
         */
        get format(): Format;
        /**
         * Whether the image has uint, int, or float data.
         */
        get formatType(): FormatType;
        /**
         * True if the image format is "high dynamic range." HDR formats include:
         * float16, float32, float64, int8, int16, and int32.
         */
        get isHdrFormat(): boolean;
        /**
         * True if the image format is "low dynamic range." LDR formats include:
         * uint1, uint2, uint4, and uint8.
         */
        get isLdrFormat(): boolean;
        /**
         * The number of bits per color channel. Can be 1, 2, 4, 8, 16, 32, or 64.
         */
        get bitsPerChannel(): number;
        /**
         * The maximum value of a pixel channel, based on the **format** of the image.
         * If the image has a **palette**, this will be the maximum value of a palette
         * color channel. Float format images will have a **maxChannelValue** of 1,
         * though they can have values above that.
         */
        get maxChannelValue(): number;
        /**
         * The maximum value of a palette index, based on the **format** of the image.
         * This differs from **maxChannelValue** in that it will not be affected by
         * the format of the **palette**.
         */
        get maxIndexValue(): number;
        /**
         * True if the image has a palette. If the image has a palette, then the
         * image data has 1 channel for the palette index of the pixel.
         */
        get hasPalette(): boolean;
        /**
         * The **Palette** of the image, or undefined if the image does not have one.
         */
        get palette(): Palette | undefined;
        /**
         * The size of the image data in bytes.
         */
        get byteLength(): number;
        /**
         * The size of the image data in bytes.
         */
        get length(): number;
        /**
         * The **ArrayBufferLike** storage of the image.
         */
        get buffer(): ArrayBufferLike;
        /**
         * The size, in bytes, of a row if pixels in the data.
         */
        get rowStride(): number;
        /**
         * Returns a pixel iterator for iterating over a rectangular range of pixels
         * in the image.
         */
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        /**
         * Create a **Color** object with the format and number of channels of the
         * image.
         */
        getColor(r: number, g: number, b: number, a?: number): Color;
        /**
         * Return the **Pixel** at the given coordinates. If **pixel** is provided,
         * it will be updated and returned rather than allocating a new **Pixel**.
         */
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        /**
         * Set the color of the pixel at the given coordinates to the color of the
         * given Color **c**.
         */
        setPixel(x: number, y: number, c: Color): void;
        /**
         * Set the red channel of the pixel, or the index value for palette images.
         */
        setPixelR(x: number, y: number, r: number): void;
        /**
         * Set the color of the **Pixel** at the given coordinates to the given
         * color values **r**, **g**, **b**.
         */
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        /**
         * Set the color of the **Pixel** at the given coordinates to the given
         * color values **r**, **g**, **b**, and **a**.
         */
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        /**
         * Calls **setPixelRgb**, but ensures **x** and **y** are within the extents
         * of the image, otherwise it returns without setting the pixel.
         */
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        /**
         * Calls **setPixelRgba**, but ensures **x** and **y** are within the extents
         * of the image, otherwise it returns without setting the pixel.
         */
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        /**
         * Set all of the pixels to the Color **c**, or all values to 0 if **c** is not
         * given.
         */
        clear(c?: Color): void;
        /**
         * Get the copy of this image data.
         */
        clone(noPixels?: boolean): MemoryImageData;
        /**
         * The storage data of the image.
         */
        toUint8Array(): Uint8Array;
        /**
         * Similar to toUint8Array, but will convert the channels of the image pixels
         * to the given **order**. If that happens, the returned bytes will be a copy
         * and not a direct view of the image data.
         */
        getBytes(order?: ChannelOrder): Uint8Array;
    }
}
declare module "image/pixel-float16" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataFloat16 } from "image/image-data-float16";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelFloat16 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataFloat16;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint16Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataFloat16);
        static imageData(image: MemoryImageDataFloat16): PixelFloat16;
        static image(image: MemoryImage): PixelFloat16;
        static from(other: PixelFloat16): PixelFloat16;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelFloat16;
        convert(opt: ColorConvertOptions): Color;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-float16" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelFloat16 } from "image/pixel-float16";
    export class MemoryImageDataFloat16 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint16Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelFloat16;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint16Array);
        static from(other: MemoryImageDataFloat16, skipPixels?: boolean): MemoryImageDataFloat16;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataFloat16;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-float32" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataFloat32 } from "image/image-data-float32";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelFloat32 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataFloat32;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Float32Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataFloat32);
        static imageData(image: MemoryImageDataFloat32): PixelFloat32;
        static image(image: MemoryImage): PixelFloat32;
        static from(other: PixelFloat32): PixelFloat32;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelFloat32;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-float32" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelFloat32 } from "image/pixel-float32";
    export class MemoryImageDataFloat32 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Float32Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelFloat32;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Float32Array);
        static from(other: MemoryImageDataFloat32, skipPixels?: boolean): MemoryImageDataFloat32;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataFloat32;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-float64" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataFloat64 } from "image/image-data-float64";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelFloat64 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataFloat64;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Float64Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataFloat64);
        static imageData(image: MemoryImageDataFloat64): PixelFloat64;
        static image(image: MemoryImage): PixelFloat64;
        static from(other: PixelFloat64): PixelFloat64;
        [Symbol.iterator](): Iterator<Pixel>;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelFloat64;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
    }
}
declare module "image/image-data-float64" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelFloat64 } from "image/pixel-float64";
    export class MemoryImageDataFloat64 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Float64Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelFloat64;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Float64Array);
        static from(other: MemoryImageDataFloat64, skipPixels?: boolean): MemoryImageDataFloat64;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataFloat64;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-int16" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataInt16 } from "image/image-data-int16";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelInt16 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataInt16;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Int16Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataInt16);
        static imageData(image: MemoryImageDataInt16): PixelInt16;
        static image(image: MemoryImage): PixelInt16;
        static from(other: PixelInt16): PixelInt16;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelInt16;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-int16" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelInt16 } from "image/pixel-int16";
    export class MemoryImageDataInt16 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Int16Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelInt16;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Int16Array);
        static from(other: MemoryImageDataInt16, skipPixels?: boolean): MemoryImageDataInt16;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataInt16;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-int32" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataInt32 } from "image/image-data-int32";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelInt32 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataInt32;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Int32Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataInt32);
        static imageData(image: MemoryImageDataInt32): PixelInt32;
        static image(image: MemoryImage): PixelInt32;
        static from(other: PixelInt32): PixelInt32;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelInt32;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-int32" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelInt32 } from "image/pixel-int32";
    export class MemoryImageDataInt32 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Int32Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelInt32;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Int32Array);
        static from(other: MemoryImageDataInt32, skipPixels?: boolean): MemoryImageDataInt32;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataInt32;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-int8" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataInt8 } from "image/image-data-int8";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelInt8 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataInt8;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Int8Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataInt8);
        static imageData(image: MemoryImageDataInt8): PixelInt8;
        static image(image: MemoryImage): PixelInt8;
        static from(other: PixelInt8): PixelInt8;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelInt8;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-int8" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelInt8 } from "image/pixel-int8";
    export class MemoryImageDataInt8 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Int8Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelInt8;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Int8Array);
        static from(other: MemoryImageDataInt8, skipPixels?: boolean): MemoryImageDataInt8;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataInt8;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-uint1" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataUint1 } from "image/image-data-uint1";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelUint1 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private _bitIndex;
        private _rowOffset;
        private readonly _image;
        get image(): MemoryImageDataUint1;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint8Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        get imageLength(): number;
        constructor(x: number, y: number, index: number, bitIndex: number, rowOffset: number, image: MemoryImageDataUint1);
        static imageData(image: MemoryImageDataUint1): PixelUint1;
        static image(image: MemoryImage): PixelUint1;
        static from(other: PixelUint1): PixelUint1;
        private getChannelInternal;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        toArray(): number[];
        equals(other: Pixel | number[]): boolean;
        clone(): PixelUint1;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-uint1" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelUint1 } from "image/pixel-uint1";
    export class MemoryImageDataUint1 implements MemoryImageData, Iterable<Pixel> {
        private pixel?;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint8Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        private _rowStride;
        get rowStride(): number;
        get iterator(): PixelUint1;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        private _palette?;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint8Array);
        static palette(width: number, height: number, palette?: Palette): MemoryImageDataUint1;
        static from(other: MemoryImageDataUint1, skipPixels?: boolean): MemoryImageDataUint1;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataUint1;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-uint16" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataUint16 } from "image/image-data-uint16";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelUint16 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataUint16;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint16Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataUint16);
        static imageData(image: MemoryImageDataUint16): PixelUint16;
        static image(image: MemoryImage): PixelUint16;
        static from(other: PixelUint16): PixelUint16;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        equals(other: Pixel | number[]): boolean;
        toArray(): number[];
        clone(): PixelUint16;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-uint16" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelUint16 } from "image/pixel-uint16";
    export class MemoryImageDataUint16 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint16Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelUint16;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint16Array);
        static from(other: MemoryImageDataUint16, skipPixels?: boolean): MemoryImageDataUint16;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataUint16;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-uint2" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataUint2 } from "image/image-data-uint2";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelUint2 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private _bitIndex;
        private _rowOffset;
        private readonly _image;
        get image(): MemoryImageDataUint2;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint8Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        get bitsPerPixel(): number;
        constructor(x: number, y: number, index: number, bitIndex: number, rowOffset: number, image: MemoryImageDataUint2);
        static imageData(image: MemoryImageDataUint2): PixelUint2;
        static image(image: MemoryImage): PixelUint2;
        static from(other: PixelUint2): PixelUint2;
        private getChannelInternal;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        equals(other: Pixel | number[]): boolean;
        toArray(): number[];
        clone(): PixelUint2;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-uint2" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelUint2 } from "image/pixel-uint2";
    export class MemoryImageDataUint2 implements MemoryImageData, Iterable<Pixel> {
        private _pixel?;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint8Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        private _rowStride;
        get rowStride(): number;
        get iterator(): PixelUint2;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        private _palette?;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint8Array);
        static palette(width: number, height: number, palette?: Palette): MemoryImageDataUint2;
        static from(other: MemoryImageDataUint2, skipPixels?: boolean): MemoryImageDataUint2;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataUint2;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-uint32" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataUint32 } from "image/image-data-uint32";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelUint32 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private readonly _image;
        get image(): MemoryImageDataUint32;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint32Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, image: MemoryImageDataUint32);
        static imageData(image: MemoryImageDataUint32): PixelUint32;
        static image(image: MemoryImage): PixelUint32;
        static from(other: PixelUint32): PixelUint32;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        equals(other: Pixel | number[]): boolean;
        toArray(): number[];
        clone(): PixelUint32;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-uint32" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelUint32 } from "image/pixel-uint32";
    export class MemoryImageDataUint32 implements MemoryImageData, Iterable<Pixel> {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint32Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        get rowStride(): number;
        get iterator(): PixelUint32;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint32Array);
        static from(other: MemoryImageDataUint32, skipPixels?: boolean): MemoryImageDataUint32;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataUint32;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/pixel-uint4" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color, ColorConvertOptions } from "color/color";
    import { Format } from "color/format";
    import { MemoryImage } from "image/image";
    import { MemoryImageDataUint4 } from "image/image-data-uint4";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    export class PixelUint4 implements Pixel, Iterable<Pixel>, Iterator<Pixel> {
        private _index;
        private _bitIndex;
        private readonly _image;
        get image(): MemoryImageDataUint4;
        private _x;
        get x(): number;
        private _y;
        get y(): number;
        get xNormalized(): number;
        get yNormalized(): number;
        get index(): number;
        set index(i: number);
        get data(): Uint8Array;
        get isValid(): boolean;
        get width(): number;
        get height(): number;
        get length(): number;
        get numChannels(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get format(): Format;
        get isLdrFormat(): boolean;
        get isHdrFormat(): boolean;
        get hasPalette(): boolean;
        get palette(): Palette | undefined;
        get r(): number;
        set r(r: number);
        get g(): number;
        set g(g: number);
        get b(): number;
        set b(b: number);
        get a(): number;
        set a(a: number);
        get rNormalized(): number;
        set rNormalized(v: number);
        get gNormalized(): number;
        set gNormalized(v: number);
        get bNormalized(): number;
        set bNormalized(v: number);
        get aNormalized(): number;
        set aNormalized(v: number);
        get luminance(): number;
        get luminanceNormalized(): number;
        constructor(x: number, y: number, index: number, bitIndex: number, image: MemoryImageDataUint4);
        static imageData(image: MemoryImageDataUint4): PixelUint4;
        static image(image: MemoryImage): PixelUint4;
        static from(other: PixelUint4): PixelUint4;
        private getChannelInternal;
        next(): IteratorResult<Pixel>;
        setPosition(x: number, y: number): void;
        setPositionNormalized(x: number, y: number): void;
        getChannel(channel: number | Channel): number;
        getChannelNormalized(channel: Channel): number;
        setChannel(channel: number, value: number): void;
        set(color: Color): void;
        setRgb(r: number, g: number, b: number): void;
        setRgba(r: number, g: number, b: number, a: number): void;
        equals(other: Pixel | number[]): boolean;
        toArray(): number[];
        clone(): PixelUint4;
        convert(opt: ColorConvertOptions): Color;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "image/image-data-uint4" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    import { PixelUint4 } from "image/pixel-uint4";
    export class MemoryImageDataUint4 implements MemoryImageData, Iterable<Pixel> {
        private _pixel?;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _data;
        get data(): Uint8Array;
        private readonly _numChannels;
        get numChannels(): number;
        get format(): Format;
        get formatType(): FormatType;
        get buffer(): ArrayBufferLike;
        private _rowStride;
        get rowStride(): number;
        get iterator(): PixelUint4;
        get byteLength(): number;
        get length(): number;
        get maxChannelValue(): number;
        get maxIndexValue(): number;
        get hasPalette(): boolean;
        private _palette?;
        get palette(): Palette | undefined;
        get isHdrFormat(): boolean;
        get isLdrFormat(): boolean;
        get bitsPerChannel(): number;
        constructor(width: number, height: number, numChannels: number, data?: Uint8Array);
        static palette(width: number, height: number, palette?: Palette): MemoryImageDataUint4;
        static from(other: MemoryImageDataUint4, skipPixels?: boolean): MemoryImageDataUint4;
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        getColor(r: number, g: number, b: number, a?: number): Color;
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        setPixel(x: number, y: number, p: Color): void;
        setPixelR(x: number, y: number, r: number): void;
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        setPixelRgbSafe(x: number, y: number, r: number, g: number, b: number): void;
        setPixelRgbaSafe(x: number, y: number, r: number, g: number, b: number, a: number): void;
        clear(_c?: Color): void;
        clone(skipPixels?: boolean): MemoryImageDataUint4;
        toUint8Array(): Uint8Array;
        getBytes(order?: ChannelOrder | undefined): Uint8Array;
        toString(): string;
        [Symbol.iterator](): Iterator<Pixel, Pixel, undefined>;
    }
}
declare module "image/palette-float16" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteFloat16 implements Palette {
        private readonly _data;
        get data(): Uint16Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Uint16Array);
        static from(other: PaletteFloat16): PaletteFloat16;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteFloat16;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-float32" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteFloat32 implements Palette {
        private readonly _data;
        get data(): Float32Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Float32Array);
        static from(other: PaletteFloat32): PaletteFloat32;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteFloat32;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-float64" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteFloat64 implements Palette {
        private readonly _data;
        get data(): Float64Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Float64Array);
        static from(other: PaletteFloat64): PaletteFloat64;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteFloat64;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-int16" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteInt16 implements Palette {
        private readonly _data;
        get data(): Int16Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Int16Array);
        static from(other: PaletteInt16): PaletteInt16;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteInt16;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-int32" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteInt32 implements Palette {
        private readonly _data;
        get data(): Int32Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Int32Array);
        static from(other: PaletteInt32): PaletteInt32;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteInt32;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-int8" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteInt8 implements Palette {
        private readonly _data;
        get data(): Int8Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Int8Array);
        static from(other: PaletteInt8): PaletteInt8;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteInt8;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-uint16" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteUint16 implements Palette {
        private readonly _data;
        get data(): Uint16Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Uint16Array);
        static from(other: PaletteUint16): PaletteUint16;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteUint16;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-uint32" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteUint32 implements Palette {
        private readonly _data;
        get data(): Uint32Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Uint32Array);
        static from(other: PaletteUint32): PaletteUint32;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteUint32;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/palette-uint8" {
    /** @format */
    import { Format } from "color/format";
    import { Palette } from "image/palette";
    export class PaletteUint8 implements Palette {
        private readonly _data;
        get data(): Uint8Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _numChannels;
        get numChannels(): number;
        get byteLength(): number;
        get buffer(): ArrayBufferLike;
        get format(): Format;
        get maxChannelValue(): number;
        constructor(numColors: number, numChannels: number, data?: Uint8Array);
        static from(other: PaletteUint8): PaletteUint8;
        setRgb(index: number, r: number, g: number, b: number): void;
        setRgba(index: number, r: number, g: number, b: number, a: number): void;
        set(index: number, channel: number, value: number): void;
        get(index: number, channel: number): number;
        getRed(index: number): number;
        getGreen(index: number): number;
        getBlue(index: number): number;
        getAlpha(index: number): number;
        setRed(index: number, value: number): void;
        setGreen(index: number, value: number): void;
        setBlue(index: number, value: number): void;
        setAlpha(index: number, value: number): void;
        clone(): PaletteUint8;
        toUint8Array(): Uint8Array;
    }
}
declare module "image/image" {
    /** @format */
    import { ChannelOrder } from "color/channel-order";
    import { Color } from "color/color";
    import { Format, FormatType } from "color/format";
    import { Interpolation } from "common/interpolation";
    import { ExifData } from "exif/exif-data";
    import { FrameType } from "image/frame-type";
    import { IccProfile } from "image/icc-profile";
    import { MemoryImageData } from "image/image-data";
    import { Palette } from "image/palette";
    import { Pixel } from "image/pixel";
    interface MemoryImageInitializeOptions {
        width: number;
        height: number;
        format?: Format;
        numChannels?: number;
        withPalette?: boolean;
        paletteFormat?: Format;
        palette?: Palette;
        exifData?: ExifData;
        iccProfile?: IccProfile;
    }
    export interface MemoryImageCreateOptions extends MemoryImageInitializeOptions {
        loopCount?: number;
        frameType?: FrameType;
        frameDuration?: number;
        frameIndex?: number;
        backgroundColor?: Color;
        textData?: Map<string, string>;
    }
    export interface MemoryImageFromBytesOptions extends MemoryImageCreateOptions {
        bytes: ArrayBufferLike;
        rowStride?: number;
        channelOrder?: ChannelOrder;
    }
    export interface MemoryImageCloneOptions {
        skipAnimation?: boolean;
        skipPixels?: boolean;
    }
    export interface MemoryImageConvertOptions {
        format?: Format;
        numChannels?: number;
        alpha?: number;
        withPalette?: boolean;
        skipAnimation?: boolean;
    }
    export interface MemoryImageColorExtremes {
        min: number;
        max: number;
    }
    /**
     * A MemoryImage is a container for MemoryImageData and other various metadata
     * representing an image in memory.
     */
    export class MemoryImage implements Iterable<Pixel> {
        private _data?;
        get data(): MemoryImageData | undefined;
        private get numPixelColors();
        /**
         * The format of the image pixels.
         */
        get format(): Format;
        /**
         * Indicates whether this image has a palette.
         */
        get hasPalette(): boolean;
        /**
         * The palette if the image has one, undefined otherwise.
         */
        get palette(): Palette | undefined;
        /**
         * The number of color channels for the image.
         */
        get numChannels(): number;
        /**
         * Indicates whether this image is animated.
         * An image is considered animated if it has more than one frame, as the
         * first image in the frames list is the image itself.
         */
        get hasAnimation(): boolean;
        /**
         * The number of frames in this MemoryImage. A MemoryImage will have at least one
         * frame, itself, so it's considered animated if it has more than one
         * frame.
         */
        get numFrames(): number;
        private _exifData?;
        /**
         * The EXIF metadata for the image. If an ExifData hasn't been created
         * for the image yet, one will be added.
         */
        get exifData(): ExifData;
        set exifData(exif: ExifData);
        /**
         * The maximum value of a pixel channel, based on the format of the image.
         * If the image has a **palette**, this will be the maximum value of a palette
         * color channel. Float format images will have a **maxChannelValue** of 1,
         * though they can have values above that.
         */
        get maxChannelValue(): number;
        /**
         * The maximum value of a palette index, based on the format of the image.
         * This differs from **maxChannelValue** in that it will not be affected by
         * the format of the **palette**.
         */
        get maxIndexValue(): number;
        /**
         * Indicates whether this image supports using a palette.
         */
        get supportsPalette(): boolean;
        /**
         * The width of the image in pixels.
         */
        get width(): number;
        /**
         * The height of the image in pixels.
         */
        get height(): number;
        /**
         * The general type of the format, whether it's uint data, int data, or
         * float data (regardless of precision).
         */
        get formatType(): FormatType;
        /**
         * Indicates whether this image is valid and has data.
         */
        get isValid(): boolean;
        /**
         * The ArrayBufferLike of the image storage data or undefined if not initialized.
         */
        get buffer(): ArrayBufferLike | undefined;
        /**
         * The length in bytes of the image data buffer.
         */
        get byteLength(): number;
        /**
         * The length in bytes of a row of pixels in the image buffer.
         */
        get rowStride(): number;
        /**
         * Indicates whether this image is a Low Dynamic Range (regular) image.
         */
        get isLdrFormat(): boolean;
        /**
         * Indicates whether this image is a High Dynamic Range image.
         */
        get isHdrFormat(): boolean;
        /**
         * The number of bits per color channel.
         */
        get bitsPerChannel(): number;
        /**
         * Indicates whether this MemoryImage has an alpha channel.
         */
        get hasAlpha(): boolean;
        /**
         * Named non-color channels used by this image.
         */
        private _extraChannels?;
        private _iccProfile;
        get iccProfile(): IccProfile | undefined;
        set iccProfile(v: IccProfile | undefined);
        private _textData;
        get textData(): Map<string, string> | undefined;
        private _backgroundColor?;
        /**
         * The suggested background color to clear the canvas with.
         */
        get backgroundColor(): Color | undefined;
        set backgroundColor(v: Color | undefined);
        private _loopCount;
        /**
         * How many times should the animation loop (0 means forever)
         */
        get loopCount(): number;
        set loopCount(v: number);
        private _frameType;
        /**
         * Gets or sets how should the frames be interpreted.
         * If the **frameType** is _FrameType.animation_, the frames are part
         * of an animated sequence. If the **frameType** is _FrameType.page_,
         * the frames are the pages of a document.
         */
        get frameType(): FrameType;
        set frameType(v: FrameType);
        /**
         * The list of sub-frames for the image, if it's an animation. An image
         * is considered animated if it has more than one frame, as the first
         * frame will be the image itself.
         */
        private _frames;
        get frames(): MemoryImage[];
        private _frameDuration;
        /**
         * How long this frame should be displayed, in milliseconds.
         * A duration of 0 indicates no delay and the next frame will be drawn
         * as quickly as it can.
         */
        get frameDuration(): number;
        set frameDuration(v: number);
        /**
         * Index of this image in the parent animations frame list.
         */
        private _frameIndex;
        get frameIndex(): number;
        constructor(opt?: MemoryImageCreateOptions);
        static fromResized(other: MemoryImage, width: number, height: number, skipAnimation?: boolean): MemoryImage;
        /**
         * Creates a copy of the given **other** MemoryImage.
         */
        static from(other: MemoryImage, skipAnimation?: boolean, skipPixels?: boolean): MemoryImage;
        /**
         * Create an image from raw data in **bytes**.
         *
         * **format** defines the order of color channels in **bytes**.
         * An HTML canvas element stores colors in _Format.rgba_ format;
         * a MemoryImage object stores colors in _Format.rgba_ format.
         *
         * **rowStride** is the row stride, in bytes, of the source data **bytes**.
         * This may be different than the rowStride of the MemoryImage, as some data
         * sources align rows to different byte alignments and include padding.
         *
         * **order** can be used if the source **bytes** has a different channel order
         * than RGBA. _ChannelOrder.bgra_ will rearrange the color channels from
         * BGRA to what MemoryImage wants, RGBA.
         *
         * If **numChannels** and **order** are not provided, a default of 3 for
         * **numChannels** and _ChannelOrder.rgba_ for **order** will be assumed.
         */
        static fromBytes(opt: MemoryImageFromBytesOptions): MemoryImage;
        private initialize;
        private createImageData;
        private createPalette;
        /**
         * Add a frame to the animation of this MemoryImage.
         */
        addFrame(image?: MemoryImage): MemoryImage;
        /**
         * Get a frame from this image. If the MemoryImage is not animated, this
         * MemoryImage will be returned; otherwise the particular frame MemoryImage will
         * be returned.
         */
        getFrame(index: number): MemoryImage;
        /**
         * Create a copy of this image.
         */
        clone(opt?: MemoryImageCloneOptions): MemoryImage;
        hasExtraChannel(name: string): boolean;
        getExtraChannel(name: string): MemoryImageData | undefined;
        setExtraChannel(name: string, data?: MemoryImageData): void;
        /**
         * Returns a pixel iterator for iterating over a rectangular range of pixels
         * in the image.
         */
        getRange(x: number, y: number, width: number, height: number): Iterator<Pixel>;
        /**
         * Get a Uint8Array view of the image storage data.
         */
        toUint8Array(): Uint8Array;
        /**
         * Similar to **toUint8Array**, but will convert the channels of the image pixels
         * to the given **order**. If that happens, the returned bytes will be a copy
         * and not a direct view of the image data.
         */
        getBytes(order?: ChannelOrder): Uint8Array;
        /**
         * Remap the color channels to the given **order**. Normally MemoryImage color
         * channels are stored in rgba order for 4 channel images, and
         * rgb order for 3 channel images. This method lets you re-arrange the
         * color channels in-place without needing to clone the image for preparing
         * image data for external usage that requires alternative channel ordering.
         */
        remapChannels(order: ChannelOrder): void;
        /**
         * Returns true if the given pixel coordinates is within the dimensions
         * of the image.
         */
        isBoundsSafe(x: number, y: number): boolean;
        /**
         * Create a Color object with the format and number of channels of the
         * image.
         */
        getColor(r: number, g: number, b: number, a?: number): Color;
        /**
         * Return the Pixel at the given coordinates **x**,**y**. If **pixel** is provided,
         * it will be updated and returned rather than allocating a new Pixel.
         */
        getPixel(x: number, y: number, pixel?: Pixel): Pixel;
        /**
         * Get the pixel from the given **x**, **y** coordinate. If the pixel coordinates
         * are out of bounds, PixelUndefined is returned.
         */
        getPixelSafe(x: number, y: number, pixel?: Pixel): Pixel;
        /**
         * Get the pixel from the given **x**, **y** coordinate. If the pixel coordinates
         * are out of range of the image, they will be clamped to the resolution.
         */
        getPixelClamped(x: number, y: number, pixel?: Pixel): Pixel;
        /**
         * Get the pixel using the given **interpolation** type for non-integer pixel
         * coordinates.
         */
        getPixelInterpolate(fx: number, fy: number, interpolation?: Interpolation): Color;
        /**
         * Get the pixel using linear interpolation for non-integer pixel
         * coordinates.
         */
        getPixelLinear(fx: number, fy: number): Color;
        /**
         * Get the pixel using cubic interpolation for non-integer pixel
         * coordinates.
         */
        getPixelCubic(fx: number, fy: number): Color;
        /**
         * Set the color of the pixel at the given coordinates to the color of the
         * given Color **c**.
         */
        setPixel(x: number, y: number, c: Color | Pixel): void;
        /**
         * Set the index value for palette images, or the red channel otherwise.
         */
        setPixelIndex(x: number, y: number, i: number): void;
        /**
         * Set the red (or index) color channel of a pixel.
         */
        setPixelR(x: number, y: number, i: number): void;
        /**
         * Set the color of the Pixel at the given coordinates to the given
         * color values **r**, **g**, **b**.
         */
        setPixelRgb(x: number, y: number, r: number, g: number, b: number): void;
        /**
         * Set the color of the Pixel at the given coordinates to the given
         * color values **r**, **g**, **b**, and **a**.
         */
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a: number): void;
        /**
         * Set all pixels in the image to the given **color**. If no color is provided
         * the image will be initialized to 0.
         */
        clear(color?: Color): void;
        /**
         * Convert this image to a new **format** or number of channels, **numChannels**.
         * If the new number of channels is 4 and the current image does
         * not have an alpha channel, then the given **alpha** value will be used
         * to set the new alpha channel. If **alpha** is not provided, then the
         * **maxChannelValue** will be used to set the alpha. If **withPalette** is
         * true, and to target format and **numChannels** has fewer than 256 colors,
         * then the new image will be converted to use a palette.
         */
        convert(opt: MemoryImageConvertOptions): MemoryImage;
        /**
         * Add text metadata to the image.
         */
        addTextData(data: Map<string, string>): void;
        getColorExtremes(): MemoryImageColorExtremes;
        toString(): string;
        /**
         * Returns a pixel iterator for iterating over all of the pixels in the
         * image.
         */
        [Symbol.iterator](): Iterator<Pixel>;
    }
}
declare module "formats/bmp/bmp-file-header" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class BmpFileHeader {
        static readonly signature = 19778;
        private readonly _fileLength;
        get fileLength(): number;
        private _imageOffset;
        set imageOffset(v: number);
        get imageOffset(): number;
        constructor(b: InputBuffer);
        static isValidFile(b: InputBuffer): boolean;
    }
}
declare module "formats/decode-info" {
    /** @format */
    import { Color } from "color/color";
    /**
     * Provides information about the image being decoded.
     */
    export interface DecodeInfo {
        /**
         * The width of the image canvas.
         */
        get width(): number;
        /**
         * The height of the image canvas.
         */
        get height(): number;
        /**
         * The suggested background color of the canvas.
         */
        get backgroundColor(): Color | undefined;
        /**
         * The number of frames that can be decoded.
         */
        get numFrames(): number;
    }
}
declare module "formats/bmp/bmp-compression-mode" {
    /** @format */
    export enum BmpCompressionMode {
        none = 0,
        rle8 = 1,
        rle4 = 2,
        bitfields = 3,
        jpeg = 4,
        png = 5,
        alphaBitfields = 6,
        reserved7 = 7,
        reserved8 = 8,
        reserved9 = 9,
        reserved10 = 10,
        cmyk = 11,
        cmykRle8 = 12,
        cmykRle4 = 13
    }
}
declare module "formats/bmp/bmp-info" {
    /** @format */
    import { Color } from "color/color";
    import { InputBuffer } from "common/input-buffer";
    import { PaletteUint8 } from "image/palette-uint8";
    import { DecodeInfo } from "formats/decode-info";
    import { BmpCompressionMode } from "formats/bmp/bmp-compression-mode";
    import { BmpFileHeader } from "formats/bmp/bmp-file-header";
    export class BmpInfo implements DecodeInfo {
        private readonly _startPos;
        private _redShift;
        private _redScale;
        private _greenShift;
        private _greenScale;
        private _blueShift;
        private _blueScale;
        private _alphaShift;
        private _alphaScale;
        private readonly _width;
        get width(): number;
        protected readonly _height: number;
        get height(): number;
        private readonly _backgroundColor;
        get backgroundColor(): Color | undefined;
        private readonly _numFrames;
        get numFrames(): number;
        private readonly _header;
        get header(): BmpFileHeader;
        private readonly _headerSize;
        get headerSize(): number;
        private readonly _planes;
        get planes(): number;
        private readonly _bitsPerPixel;
        get bitsPerPixel(): number;
        private readonly _compression;
        get compression(): BmpCompressionMode;
        private readonly _imageSize;
        get imageSize(): number;
        private readonly _xppm;
        get xppm(): number;
        private readonly _yppm;
        get yppm(): number;
        private readonly _totalColors;
        get totalColors(): number;
        private readonly _importantColors;
        get importantColors(): number;
        private _redMask;
        get redMask(): number;
        private _greenMask;
        get greenMask(): number;
        private _blueMask;
        get blueMask(): number;
        private _alphaMask;
        get alphaMask(): number;
        private _palette;
        get palette(): PaletteUint8 | undefined;
        get readBottomUp(): boolean;
        get ignoreAlphaChannel(): boolean;
        constructor(p: InputBuffer, header?: BmpFileHeader);
        private readPalette;
        decodePixel(input: InputBuffer, pixel: (r: number, g: number, b: number, a: number) => void): void;
    }
}
declare module "formats/decoder" {
    /** @format */
    import { MemoryImage } from "image/image";
    import { DecodeInfo } from "formats/decode-info";
    /**
     * Base class for image format decoders.
     *
     * Image pixels are stored as 32-bit unsigned ints, so all formats, regardless
     * of their encoded color resolutions, decode to 32-bit RGBA images. Encoders
     * can reduce the color resolution back down to their required formats.
     *
     * Some image formats support multiple frames, often for encoding animation.
     * In such cases, the **decode** method will decode all of the frames,
     * unless the frame argument is specified for a particular frame to decode.
     * **startDecode** will initiate decoding of the file, and **decodeFrame** will
     * then decode a specific frame from the file, allowing for animations to be
     * decoded one frame at a time. Some formats, such as TIFF, may store multiple
     * frames, but their use of frames is for multiple page documents and not
     * animation. The terms 'animation' and 'frames' simply refer to 'pages' in
     * this case.
     */
    export interface Decoder {
        /**
         * How many frames are available to be decoded. **startDecode** should have
         * been called first. Non animated image files will have a single frame.
         */
        get numFrames(): number;
        /**
         * A light-weight function to test if the given file is able to be decoded
         * by this Decoder.
         */
        isValidFile(bytes: Uint8Array): boolean;
        /**
         * Start decoding the data as an animation sequence, but don't actually
         * process the frames until they are requested with **decodeFrame**.
         */
        startDecode(bytes: Uint8Array): DecodeInfo | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, and **frame** is specified, that particular frame will be decoded.
         * Otherwise if the image is animated and **frame** is undefined, the returned
         * MemoryImage will include all frames. If there was a problem decoding the
         * MemoryImage, undefined will be returned.
         */
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        /**
         * Decode a single frame from the data that was set with **startDecode**.
         * If **frame** is out of the range of available frames, undefined is returned.
         * Non animated image files will only have **frame** 0. A MemoryImage
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(frame: number): MemoryImage | undefined;
    }
}
declare module "formats/bmp-decoder" {
    import { InputBuffer } from "common/input-buffer";
    import { MemoryImage } from "image/image";
    import { BmpInfo } from "formats/bmp/bmp-info";
    import { Decoder } from "formats/decoder";
    export class BmpDecoder implements Decoder {
        protected _input?: InputBuffer;
        protected _info?: BmpInfo;
        protected _forceRgba: boolean;
        get numFrames(): number;
        constructor(forceRgba?: boolean);
        /**
         * Is the given file a valid BMP image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): BmpInfo | undefined;
        /**
         * Decode a single frame from the data stat was set with **startDecode**.
         * If **frame** is out of the range of available frames, undefined is returned.
         * Non animated image files will only have **frame** 0. An animation frame
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(_frame: number): MemoryImage | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified **frame** will be decoded. If there was a problem
         * decoding the file, undefined is returned.
         */
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
    }
}
declare module "formats/encoder" {
    /** @format */
    import { MemoryImage } from "image/image";
    /**
     * Base class for image format encoders.
     */
    export interface Encoder {
        /**
         * True if the encoder supports animated images; otherwise false.
         */
        get supportsAnimation(): boolean;
        /**
         * Encode an **image** to an image format.
         * If **singleFrame** is true, only the one MemoryImage will be encoded;
         * otherwise if image has animation, all frames of the **image** will be
         * encoded if the encoder supports animation.
         */
        encode(image: MemoryImage, singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/bmp-encoder" {
    import { MemoryImage } from "image/image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode a BMP image.
     */
    export class BmpEncoder implements Encoder {
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        encode(image: MemoryImage, _singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/gif/gif-color-map" {
    /** @format */
    import { ColorUint8 } from "color/color-uint8";
    import { PaletteUint8 } from "image/palette-uint8";
    export class GifColorMap {
        private readonly _numColors;
        get numColors(): number;
        private readonly _palette;
        get palette(): PaletteUint8;
        private _bitsPerPixel;
        get bitsPerPixel(): number;
        private _transparent?;
        set transparent(v: number | undefined);
        get transparent(): number | undefined;
        constructor(numColors: number, palette?: PaletteUint8);
        private static bitSize;
        static from(other: GifColorMap): GifColorMap;
        getColor(index: number): ColorUint8;
        setColor(index: number, r: number, g: number, b: number): void;
        getRed(color: number): number;
        getGreen(color: number): number;
        getBlue(color: number): number;
        getAlpha(color: number): number;
        getPalette(): PaletteUint8;
    }
}
declare module "formats/gif/gif-image-desc" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { GifColorMap } from "formats/gif/gif-color-map";
    export class GifImageDesc {
        private readonly _x;
        get x(): number;
        private readonly _y;
        get y(): number;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _interlaced;
        get interlaced(): boolean;
        private _colorMap?;
        get colorMap(): GifColorMap | undefined;
        set colorMap(v: GifColorMap | undefined);
        private _duration;
        set duration(v: number);
        get duration(): number;
        private _clearFrame;
        set clearFrame(v: boolean);
        get clearFrame(): boolean;
        /**
         * The position in the file after the ImageDesc for this frame.
         */
        protected _inputPosition: number;
        get inputPosition(): number;
        constructor(input: InputBuffer);
    }
}
declare module "formats/gif/gif-info" {
    /** @format */
    import { Color } from "color/color";
    import { DecodeInfo } from "formats/decode-info";
    import { GifColorMap } from "formats/gif/gif-color-map";
    import { GifImageDesc } from "formats/gif/gif-image-desc";
    export interface GifInfoInitOptions {
        width?: number;
        height?: number;
        backgroundColor?: Color;
        frames?: Array<GifImageDesc>;
        colorResolution?: number;
        globalColorMap?: GifColorMap;
        isGif89?: boolean;
    }
    export class GifInfo implements DecodeInfo {
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _backgroundColor;
        get backgroundColor(): Color | undefined;
        private _frames;
        get frames(): Array<GifImageDesc>;
        private _colorResolution;
        get colorResolution(): number;
        private _globalColorMap?;
        get globalColorMap(): GifColorMap | undefined;
        private _isGif89;
        get isGif89(): boolean;
        get numFrames(): number;
        constructor(opt?: GifInfoInitOptions);
    }
}
declare module "formats/gif-decoder" {
    import { Decoder } from "formats/decoder";
    import { GifInfo } from "formats/gif/gif-info";
    import { MemoryImage } from "image/image";
    /**
     * A decoder for the GIF image format. This supports both single frame and
     * animated GIF files, and transparency.
     */
    export class GifDecoder implements Decoder {
        private static readonly _stampSize;
        private static readonly _gif87Stamp;
        private static readonly _gif89Stamp;
        private static readonly _imageDescRecordType;
        private static readonly _extensionRecordType;
        private static readonly _terminateRecordType;
        private static readonly _graphicControlExt;
        private static readonly _applicationExt;
        private static readonly _lzMaxCode;
        private static readonly _lzBits;
        private static readonly _noSuchCode;
        private static readonly _codeMasks;
        private static readonly _interlacedOffset;
        private static readonly _interlacedJump;
        private _input?;
        private _info?;
        private _repeat;
        private _buffer?;
        private _stack;
        private _suffix;
        private _prefix?;
        private _bitsPerPixel;
        private _pixelCount?;
        private _currentShiftDWord;
        private _currentShiftState;
        private _stackPtr;
        private _currentCode?;
        private _lastCode;
        private _maxCode1;
        private _runningBits;
        private _runningCode;
        private _eofCode;
        private _clearCode;
        /**
         * How many frames are available to decode?
         *
         * You should have prepared the decoder by either passing the file bytes
         * to the constructor, or calling getInfo.
         */
        get numFrames(): number;
        constructor(bytes?: Uint8Array);
        /**
         * Routine to trace the Prefixes linked list until we get a prefix which is
         * not code, but a pixel value (less than ClearCode). Returns that pixel value.
         * If image is defective, we might loop here forever, so we limit the loops to
         * the maximum possible if image O.k. - lzMaxCode times.
         */
        private static getPrefixChar;
        private static updateImage;
        private getInfo;
        private skipImage;
        /**
         * Continue to get the image code in compressed form. This routine should be
         * called until NULL block is returned.
         * The block should NOT be freed by the user (not dynamically allocated).
         */
        private skipRemainder;
        private readApplicationExt;
        private readGraphicsControlExt;
        private getLine;
        /**
         * The LZ decompression routine:
         * This version decompress the given gif file into Line of length LineLen.
         * This routine can be called few times (one per scan line, for example), in
         * order the complete the whole image.
         */
        private decompressLine;
        /**
         * The LZ decompression input routine:
         * This routine is responsible for the decompression of the bit stream from
         * 8 bits (bytes) packets, into the real codes.
         */
        private decompressInput;
        /**
         * This routines read one gif data block at a time and buffers it internally
         * so that the decompression routine could access it.
         * The routine returns the next byte from its internal buffer (or read next
         * block in if buffer empty) and returns undefined on failure.
         */
        private bufferedInput;
        private initDecode;
        private decodeImage;
        /**
         * Is the given file a valid Gif image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        /**
         * Validate the file is a Gif image and get information about it.
         * If the file is not a valid Gif image, undefined is returned.
         */
        startDecode(bytes: Uint8Array): GifInfo | undefined;
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeFrame(frame: number): MemoryImage | undefined;
    }
}
declare module "image/quantizer" {
    /** @format */
    import { Color } from "color/color";
    import { MemoryImage } from "image/image";
    import { Palette } from "image/palette";
    /**
     * Interface for color quantizers, which reduce the total number of colors
     * used by an image to a given maximum, used to convert images to palette
     * images.
     */
    export interface Quantizer {
        get palette(): Palette;
        getColorIndex(c: Color): number;
        getColorIndexRgb(r: number, g: number, b: number): number;
        /**
         * Find the index of the closest color to **c** in the **palette**.
         */
        getQuantizedColor(c: Color): Color;
        /**
         * Convert the **image** to a palette image.
         */
        getIndexImage(image: MemoryImage): MemoryImage;
    }
}
declare module "image/neural-quantizer" {
    /** @format */
    import { Color } from "color/color";
    import { MemoryImage } from "image/image";
    import { PaletteUint8 } from "image/palette-uint8";
    import { Quantizer } from "image/quantizer";
    /**
     * Compute a color map with a given number of colors that best represents
     * the given image.
     */
    export class NeuralQuantizer implements Quantizer {
        private static readonly _numCycles;
        private static readonly _alphaBiasShift;
        private static readonly _initAlpha;
        private static readonly _radiusBiasShift;
        private static readonly _radiusBias;
        private static readonly _alphaRadiusBiasShift;
        private static readonly alphaRadiusBias;
        private static readonly _radiusDec;
        private static readonly _gamma;
        private static readonly _beta;
        private static readonly _betaGamma;
        private static readonly _prime1;
        private static readonly _prime2;
        private static readonly _prime3;
        private static readonly _prime4;
        private static readonly _smallImageBytes;
        private readonly _netIndex;
        private _samplingFactor;
        private _netSize;
        private _specials;
        private _bgColor;
        private _cutNetSize;
        private _maxNetPos;
        private _initRadius;
        private _initBiasRadius;
        private _radiusPower;
        /**
         * The network itself
         */
        private _network;
        private _paletteInternal;
        private _palette;
        get palette(): PaletteUint8;
        /**
         * Bias array for learning
         */
        private _bias;
        private _freq;
        /**
         * How many colors are in the **palette**?
         */
        get numColors(): number;
        /**
         * 10 is a reasonable **samplingFactor** according to
         * https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/.
         */
        constructor(image: MemoryImage, numberOfColors?: number, samplingFactor?: number);
        private initialize;
        private updateRadiusPower;
        private specialFind;
        /**
         * Search for biased BGR values
         */
        private contest;
        private alterSingle;
        private alterNeighbors;
        private learn;
        private fix;
        /**
         * Insertion sort of network and building of netindex[0..255]
         */
        private inxBuild;
        private copyPalette;
        /**
         * Search for BGR values 0..255 and return color index
         */
        private inxSearch;
        /**
         * Find the index of the closest color to **c** in the **palette**.
         */
        getColorIndex(c: Color): number;
        /**
         * Find the index of the closest color to **r**,**g**,**b** in the **palette**.
         */
        getColorIndexRgb(r: number, g: number, b: number): number;
        /**
         * Find the color closest to **c** in the **palette**.
         */
        getQuantizedColor(c: Color): Color;
        /**
         * Convert the **image** to a palette image.
         */
        getIndexImage(image: MemoryImage): MemoryImage;
        /**
         * Add an image to the quantized color table.
         */
        addImage(image: MemoryImage): void;
    }
}
declare module "image/quantizer-type" {
    /** @format */
    export enum QuantizerType {
        octree = 0,
        neural = 1
    }
}
declare module "image/octree-node" {
    export class OctreeNode {
        private _r;
        get r(): number;
        set r(v: number);
        private _g;
        get g(): number;
        set g(v: number);
        private _b;
        get b(): number;
        set b(v: number);
        private _count;
        get count(): number;
        set count(v: number);
        private _heapIndex;
        get heapIndex(): number;
        set heapIndex(v: number);
        private _paletteIndex;
        get paletteIndex(): number;
        set paletteIndex(v: number);
        private _parent;
        get parent(): OctreeNode | undefined;
        private _children;
        get children(): Array<OctreeNode | undefined>;
        private _childCount;
        get childCount(): number;
        set childCount(v: number);
        private _childIndex;
        get childIndex(): number;
        private _flags;
        get flags(): number;
        set flags(v: number);
        private _depth;
        get depth(): number;
        constructor(childIndex: number, depth: number, parent?: OctreeNode);
    }
}
declare module "image/heap-node" {
    /** @format */
    import { OctreeNode } from "image/octree-node";
    export class HeapNode {
        private _buf;
        get buf(): Array<OctreeNode | undefined>;
        get n(): number;
    }
}
declare module "image/octree-quantizer" {
    /** @format */
    import { Color } from "color/color";
    import { MemoryImage } from "image/image";
    import { PaletteUint8 } from "image/palette-uint8";
    import { Quantizer } from "image/quantizer";
    /**
     * Color quantization using octree,
     * from https://rosettacode.org/wiki/Color_quantization/C
     */
    export class OctreeQuantizer implements Quantizer {
        private static readonly _inHeap;
        private readonly _root;
        private _palette;
        get palette(): PaletteUint8;
        constructor(image: MemoryImage, numberOfColors?: number);
        private nodeInsert;
        private popHeap;
        private heapAdd;
        private downHeap;
        private upHeap;
        private nodeFold;
        private compareNode;
        private getNodes;
        getColorIndex(c: Color): number;
        getColorIndexRgb(r: number, g: number, b: number): number;
        /**
         * Find the index of the closest color to **c** in the **palette**.
         */
        getQuantizedColor(c: Color): Color;
        /**
         * Convert the **image** to a palette image.
         */
        getIndexImage(image: MemoryImage): MemoryImage;
    }
}
declare module "common/random-utils" {
    /** @format */
    export abstract class RandomUtils {
        /**
         * Return a random number between [-1, 1].
         */
        static crand(): number;
        /**
         * Return a random number following a gaussian distribution and a standard
         * deviation of 1.
         */
        static grand(): number;
        /**
         * Return a random variable following a Poisson distribution of parameter **z**.
         */
        static prand(z: number): number;
        /**
         * Generates a non-negative random integer in the range from 0, inclusive, to **max**, exclusive.
         */
        static intrand(max: number): number;
    }
}
declare module "common/point" {
    /**
     * 2-dimensional point
     *
     * @format
     */
    export class Point {
        private _x;
        private _y;
        get x(): number;
        get y(): number;
        get xt(): number;
        get yt(): number;
        constructor(x: number, y: number);
        static from(other: Point): Point;
        move(x: number, y: number): Point;
        offset(dx: number, dy: number): Point;
        mul(n: number): Point;
        add(p: Point): Point;
        equals(other: Point): boolean;
        toString(): string;
    }
}
declare module "common/line" {
    export class Line {
        private _x1;
        private _y1;
        private _x2;
        private _y2;
        get x1(): number;
        get y1(): number;
        get x2(): number;
        get y2(): number;
        get dx(): number;
        get dy(): number;
        constructor(x1: number, y1: number, x2: number, y2: number);
        static from(other: Line): Line;
        movePoint1(x: number, y: number): void;
        movePoint2(x: number, y: number): void;
        swapXY1(): void;
        swapXY2(): void;
        flipX(): void;
        flipY(): void;
        clone(): Line;
        toString(): string;
    }
}
declare module "common/rectangle" {
    /** @format */
    import { Point } from "common/point";
    export class Rectangle {
        private readonly _left;
        private readonly _top;
        private readonly _right;
        private readonly _bottom;
        get left(): number;
        get top(): number;
        get right(): number;
        get bottom(): number;
        get width(): number;
        get height(): number;
        get topLeft(): Point;
        get topRight(): Point;
        get bottomLeft(): Point;
        get bottomRight(): Point;
        constructor(x1: number, y1: number, x2: number, y2: number);
        static fromXYWH(x: number, y: number, width: number, height: number): Rectangle;
        static from(other: Rectangle): Rectangle;
        toString(): string;
    }
}
declare module "image/image-utils" {
    /** @format */
    import { Line } from "common/line";
    import { Point } from "common/point";
    import { Rectangle } from "common/rectangle";
    import { Pixel } from "image/pixel";
    export abstract class ImageUtils {
        /**
         * Test if the pixel **p** is within the circle centered at **center** with a
         * squared radius of **rad2**. This will test the corners, edges, and center
         * of the pixel and return the ratio of samples within the circle.
         */
        static circleTest(p: Pixel, center: Point, rad2: number, antialias?: boolean): number;
        /**
         * Clip a line to a rectangle using the Cohen–Sutherland clipping algorithm.
         * **line** is a Line object.
         * **rect** is a Rectangle object.
         * Results are stored in **line**.
         * If **line** falls completely outside of **rect**, false is returned, otherwise
         * true is returned.
         */
        static clipLine(rect: Rectangle, line: Line): boolean;
    }
}
declare module "draw/blend-mode" {
    /** @format */
    export enum BlendMode {
        direct = 0,
        alpha = 1,
        lighten = 2,
        screen = 3,
        dodge = 4,
        addition = 5,
        darken = 6,
        multiply = 7,
        burn = 8,
        overlay = 9,
        softLight = 10,
        hardLight = 11,
        difference = 12,
        subtract = 13,
        divide = 14
    }
}
declare module "draw/circle-quadrant" {
    /** @format */
    export enum CircleQuadrant {
        topLeft = 1,
        topRight = 2,
        bottomLeft = 4,
        bottomRight = 8,
        all = 15
    }
}
declare module "draw/draw" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color } from "color/color";
    import { Line } from "common/line";
    import { Point } from "common/point";
    import { Rectangle } from "common/rectangle";
    import { MemoryImage } from "image/image";
    import { BlendMode } from "draw/blend-mode";
    interface DrawLineWuOptions {
        image: MemoryImage;
        line: Line;
        color: Color;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface DrawLineOptions extends DrawLineWuOptions {
        antialias?: boolean;
        thickness?: number;
    }
    export interface DrawCircleOptions {
        image: MemoryImage;
        center: Point;
        radius: number;
        color: Color;
        antialias?: boolean;
        mask?: MemoryImage;
        maskChannel?: Channel;
    }
    export interface DrawPixelOptions {
        image: MemoryImage;
        pos: Point;
        color: Color;
        filter?: Color;
        alpha?: number;
        blend?: BlendMode;
        linearBlend?: boolean;
        mask?: MemoryImage;
        maskChannel?: Channel;
    }
    export interface DrawPolygonOptions {
        image: MemoryImage;
        vertices: Point[];
        color: Color;
        antialias?: boolean;
        thickness?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface DrawRectOptions {
        image: MemoryImage;
        rect: Rectangle;
        color: Color;
        thickness?: number;
        radius?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface FillCircleOptions {
        image: MemoryImage;
        center: Point;
        radius: number;
        color: Color;
        antialias?: boolean;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface FillFloodOptions {
        image: MemoryImage;
        start: Point;
        color: Color;
        threshold?: number;
        compareAlpha?: boolean;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface MaskFloodOptions {
        image: MemoryImage;
        start: Point;
        threshold?: number;
        compareAlpha?: boolean;
        fillValue?: number;
    }
    export interface FillPolygonOptions {
        image: MemoryImage;
        vertices: Point[];
        color: Color;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface FillRectOptions {
        image: MemoryImage;
        rect: Rectangle;
        color: Color;
        radius?: number;
        mask?: MemoryImage;
        maskChannel?: Channel;
    }
    export interface FillOptions {
        image: MemoryImage;
        color: Color;
        maskChannel?: Channel.luminance;
        mask?: MemoryImage;
    }
    export interface CompositeImageOptions {
        dst: MemoryImage;
        src: MemoryImage;
        dstX?: number;
        dstY?: number;
        dstW?: number;
        dstH?: number;
        srcX?: number;
        srcY?: number;
        srcW?: number;
        srcH?: number;
        blend?: BlendMode;
        linearBlend?: boolean;
        center?: boolean;
        mask?: MemoryImage;
        maskChannel?: Channel;
    }
    export abstract class Draw {
        /**
         * Calculate the pixels that make up the circumference of a circle on the
         * given **image**, centered at **center** and the given **radius**.
         *
         * The returned array of points is sorted, first by the **center.x** coordinate, and
         * second by the **center.y** coordinate.
         */
        private static calculateCircumference;
        private static drawAntialiasCircle;
        private static drawLineWu;
        private static setAlpha;
        /**
         * Compare colors from a 3 or 4 dimensional color space
         */
        private static colorDistance;
        private static testPixelLabColorDistance;
        private static fill4Core;
        private static fill4;
        private static imgDirectComposite;
        private static imgComposite;
        /**
         * Draw a circle into the **image** with a center of **center** and
         * the given **radius** and **color**.
         */
        static drawCircle(opt: DrawCircleOptions): MemoryImage;
        /**
         * Draw and fill a circle into the **image** with a **center**
         * and the given **radius** and **color**.
         */
        static fillCircle(opt: FillCircleOptions): MemoryImage;
        /**
         * Draw a line into **image**.
         *
         * If **antialias** is true then the line is drawn with smooth edges.
         * **thickness** determines how thick the line should be drawn, in pixels.
         */
        static drawLine(opt: DrawLineOptions): MemoryImage;
        /**
         * Draw a single pixel into the image, applying alpha and opacity blending.
         * If **filter** is provided, the color c will be scaled by the **filter**
         * color. If **alpha** is provided, it will be used in place of the
         * color alpha, as a normalized color value [0, 1].
         */
        static drawPixel(opt: DrawPixelOptions): MemoryImage;
        /**
         * Fill a polygon defined by the given **vertices**.
         */
        static drawPolygon(opt: DrawPolygonOptions): MemoryImage;
        /**
         * Draw a rectangle in the **image** with the **color**.
         */
        static drawRect(opt: DrawRectOptions): MemoryImage;
        /**
         * Fill the 4-connected shape containing **start** in the **image** with the
         * given **color**.
         */
        static fillFlood(opt: FillFloodOptions): MemoryImage;
        /**
         * Fill a polygon defined by the given **vertices**.
         */
        static fillPolygon(opt: FillPolygonOptions): MemoryImage;
        /**
         * Fill a rectangle **rect** in the **image** with the given **color**.
         */
        static fillRect(opt: FillRectOptions): MemoryImage;
        /**
         * Set all of the pixels of an **image** to the given **color**.
         */
        static fill(opt: FillOptions): MemoryImage;
        /**
         * Create a mask describing the 4-connected shape containing **start** in the
         * **image**.
         */
        static maskFlood(opt: MaskFloodOptions): Uint8Array;
        /**
         * Composite the image **src** onto the image **dst**.
         *
         * In other words, compositeImage will take an rectangular area from src of
         * width **srcW** and height **srcH** at position (**srcX**,**srcY**) and place it
         * in a rectangular area of **dst** of width **dstW** and height **dstH** at
         * position (**dstX**,**dstY**).
         *
         * If the source and destination coordinates and width and heights differ,
         * appropriate stretching or shrinking of the image fragment will be performed.
         * The coordinates refer to the upper left corner. This function can be used to
         * copy regions within the same image (if **dst** is the same as **src**)
         * but if the regions overlap the results will be unpredictable.
         *
         * if **center** is true, the **src** will be centered in **dst**.
         */
        static compositeImage(opt: CompositeImageOptions): MemoryImage;
    }
}
declare module "filter/dither-kernel" {
    /** @format */
    /**
     * The pattern to use for dithering
     */
    export enum DitherKernel {
        none = 0,
        falseFloydSteinberg = 1,
        floydSteinberg = 2,
        stucki = 3,
        atkinson = 4
    }
    export const DitherKernels: number[][][];
}
declare module "filter/noise-type" {
    /** @format */
    export enum NoiseType {
        gaussian = 0,
        uniform = 1,
        saltAndPepper = 2,
        poisson = 3,
        rice = 4
    }
}
declare module "filter/pixelate-mode" {
    /** @format */
    export enum PixelateMode {
        /**
         * Use the top-left pixel of a block for the block color.
         */
        upperLeft = 0,
        /**
         * Use the average of the pixels within a block for the block color.
         */
        average = 1
    }
}
declare module "filter/quantize-method" {
    /** @format */
    export enum QuantizeMethod {
        neuralNet = 0,
        octree = 1
    }
}
declare module "filter/separable-kernel" {
    /** @format */
    import { Channel } from "color/channel";
    import { MemoryImage } from "image/image";
    export interface SeparableKernelApplyOptions {
        src: MemoryImage;
        dst: MemoryImage;
        horizontal?: boolean;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    /**
     * A kernel object to use with **separableConvolution** filter.
     */
    export class SeparableKernel {
        private readonly _coefficients;
        private readonly _size;
        /**
         * Get the number of coefficients in the kernel.
         */
        get length(): number;
        /**
         * Create a separable convolution kernel for the given **size**.
         */
        constructor(size: number);
        private reflect;
        private applyCoefficientsLine;
        /**
         * Get a coefficient from the kernel.
         */
        getCoefficient(index: number): number;
        /**
         * Set a coefficient in the kernel.
         */
        setCoefficient(index: number, c: number): void;
        /**
         * Apply the kernel to the **src** image, storing the results in **dst**,
         * for a single dimension. If **horizontal** is true, the filter will be
         * applied to the horizontal axis, otherwise it will be applied to the
         * vertical axis.
         */
        apply(opt: SeparableKernelApplyOptions): void;
        /**
         * Scale all of the coefficients by **s**.
         */
        scaleCoefficients(s: number): void;
    }
}
declare module "filter/filter" {
    /** @format */
    import { Channel } from "color/channel";
    import { Color } from "color/color";
    import { Interpolation } from "common/interpolation";
    import { Quantizer } from "image/quantizer";
    import { MemoryImage } from "image/image";
    import { DitherKernel } from "filter/dither-kernel";
    import { NoiseType } from "filter/noise-type";
    import { PixelateMode } from "filter/pixelate-mode";
    import { QuantizeMethod } from "filter/quantize-method";
    import { SeparableKernel } from "filter/separable-kernel";
    export interface AdjustColorOptions {
        image: MemoryImage;
        blacks?: Color;
        whites?: Color;
        mids?: Color;
        contrast?: number;
        saturation?: number;
        brightness?: number;
        gamma?: number;
        exposure?: number;
        hue?: number;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface BillboardOptions {
        image: MemoryImage;
        grid?: number;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface BleachBypassOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface BulgeDistortionOptions {
        image: MemoryImage;
        centerX?: number;
        centerY?: number;
        radius?: number;
        scale?: number;
        interpolation?: Interpolation;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface BumpToNormalOptions {
        image: MemoryImage;
        strength?: number;
    }
    export interface ChromaticAberrationOptions {
        image: MemoryImage;
        shift?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface ColorHalftone {
        image: MemoryImage;
        amount?: number;
        centerX?: number;
        centerY?: number;
        angle?: number;
        size?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface ColorOffsetOptions {
        image: MemoryImage;
        red?: number;
        green?: number;
        blue?: number;
        alpha?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface ContrastOptions {
        image: MemoryImage;
        contrast: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface ConvolutionOptions {
        image: MemoryImage;
        filter: number[];
        div?: number;
        offset?: number;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface CopyImageChannelsOptions {
        image: MemoryImage;
        from: MemoryImage;
        scaled?: boolean;
        red?: Channel;
        green?: Channel;
        blue?: Channel;
        alpha?: Channel;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface DitherImageOptions {
        image: MemoryImage;
        quantizer?: Quantizer;
        kernel?: DitherKernel;
        serpentine?: boolean;
    }
    export interface DotScreenOptions {
        image: MemoryImage;
        angle?: number;
        size?: number;
        centerX?: number;
        centerY?: number;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface DropShadowOptions {
        image: MemoryImage;
        hShadow: number;
        vShadow: number;
        blur: number;
        shadowColor?: Color;
    }
    export interface EdgeGlowOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface EmbossOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface GammaOptions {
        image: MemoryImage;
        gamma: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface GaussianBlurOptions {
        image: MemoryImage;
        radius: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface GrayscaleOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface HdrToLdrOptions {
        image: MemoryImage;
        exposure?: number;
    }
    export interface HexagonPixelateOptions {
        image: MemoryImage;
        centerX?: number;
        centerY?: number;
        size?: number;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface InvertOptions {
        image: MemoryImage;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface LuminanceThresholdOptions {
        image: MemoryImage;
        threshold?: number;
        outputColor?: boolean;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface MonochromeOptions {
        image: MemoryImage;
        color?: Color;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface NoiseOptions {
        image: MemoryImage;
        sigma: number;
        type?: NoiseType;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface NormalizeOptions {
        image: MemoryImage;
        min: number;
        max: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface PixelateOptions {
        image: MemoryImage;
        size: number;
        mode?: PixelateMode;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface QuantizeOptions {
        image: MemoryImage;
        numberOfColors?: number;
        method?: QuantizeMethod;
        dither?: DitherKernel;
        ditherSerpentine?: boolean;
    }
    export interface ReinhardToneMapOptions {
        image: MemoryImage;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface RemapColorsOptions {
        image: MemoryImage;
        red?: Channel;
        green?: Channel;
        blue?: Channel;
        alpha?: Channel;
    }
    export interface ScaleRgbaOptions {
        image: MemoryImage;
        scale: Color;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface SeparableConvolutionOptions {
        image: MemoryImage;
        kernel: SeparableKernel;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface SepiaOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface SketchOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface SmoothOptions {
        image: MemoryImage;
        weight: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface SobelOptions {
        image: MemoryImage;
        amount?: number;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface StretchDistortionOptions {
        image: MemoryImage;
        centerX?: number;
        centerY?: number;
        interpolation?: Interpolation;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export interface VignetteOptions {
        image: MemoryImage;
        start?: number;
        end?: number;
        amount?: number;
        color?: Color;
        maskChannel?: Channel;
        mask?: MemoryImage;
    }
    export abstract class Filter {
        private static _contrastCache?;
        private static readonly _gaussianKernelCache;
        /**
         * Adjust the color of the **image** using various color transformations.
         *
         * **blacks** defines the black level of the image, as a color.
         *
         * **whites** defines the white level of the image, as a color.
         *
         * **mids** defines the mid level of hte image, as a color.
         *
         * **contrast** increases (> 1) / decreases (< 1) the contrast of the image by
         * pushing colors away/toward neutral gray, where at 0 the image is entirely
         * neutral gray (0 contrast), 1, the image is not adjusted and > 1 the
         * image increases contrast.
         *
         * **saturation** increases (> 1) / decreases (< 1) the saturation of the image
         * by pushing colors away/toward their grayscale value, where 0 is grayscale
         * and 1 is the original image, and > 1 the image becomes more saturated.
         *
         * **brightness** is a constant scalar of the image colors. At 0 the image
         * is black, 1 unmodified, and > 1 the image becomes brighter.
         *
         * **gamma** is an exponential scalar of the image colors. At < 1 the image
         * becomes brighter, and > 1 the image becomes darker. A **gamma** of 1/2.2
         * will convert the image colors to linear color space.
         *
         * **exposure** is an exponential scalar of the image as rgb* pow(2, exposure).
         * At 0, the image is unmodified; as the exposure increases, the image
         * brightens.
         *
         * **hue** shifts the hue component of the image colors in degrees. A **hue** of
         * 0 will have no affect, and a **hue** of 45 will shift the hue of all colors
         * by 45 degrees.
         *
         * **amount** controls how much affect this filter has on the **image**, where
         * 0 has no effect and 1 has full effect.
         *
         */
        static adjustColor(opt: AdjustColorOptions): MemoryImage;
        /**
         * Apply the billboard filter to the image.
         */
        static billboard(opt: BillboardOptions): MemoryImage;
        static bleachBypass(opt: BleachBypassOptions): MemoryImage;
        static bulgeDistortion(opt: BulgeDistortionOptions): MemoryImage;
        /**
         * Generate a normal map from a heightfield bump image.
         *
         * The red channel of the **image** is used as an input, 0 represents a low
         * height and 1 a high value. The optional **strength** parameter allows to set
         * the strength of the normal image.
         */
        static bumpToNormal(opt: BumpToNormalOptions): MemoryImage;
        /**
         * Apply chromatic aberration filter to the image.
         */
        static chromaticAberration(opt: ChromaticAberrationOptions): MemoryImage;
        /**
         * Apply color halftone filter to the image.
         */
        static colorHalftone(opt: ColorHalftone): MemoryImage;
        /**
         * Add the **red**, **green**, **blue** and **alpha** values to the **image** image
         * colors, a per-channel brightness.
         */
        static colorOffset(opt: ColorOffsetOptions): MemoryImage;
        /**
         * Set the contrast level for the **image**.
         *
         * **contrast** values below 100 will decrees the contrast of the image,
         * and values above 100 will increase the contrast. A contrast of of 100
         * will have no affect.
         */
        static contrast(opt: ContrastOptions): MemoryImage;
        /**
         * Apply a 3x3 convolution filter to the **image**. **filter** should be a
         * list of 9 numbers.
         *
         * The rgb channels will be divided by **div** and add **offset**, allowing
         * filters to normalize and offset the filtered pixel value.
         */
        static convolution(opt: ConvolutionOptions): MemoryImage;
        /**
         * Copy channels from the **from** image to the **image**. If **scaled** is
         * true, then the **from** image will be scaled to the **image** resolution.
         */
        static copyImageChannels(opt: CopyImageChannelsOptions): MemoryImage;
        /**
         * Dither an image to reduce banding patterns when reducing the number of
         * colors.
         */
        static ditherImage(opt: DitherImageOptions): MemoryImage;
        /**
         * Apply the dot screen filter to the image.
         */
        static dotScreen(opt: DotScreenOptions): MemoryImage;
        /**
         * Create a drop-shadow effect for the image.
         */
        static dropShadow(opt: DropShadowOptions): MemoryImage;
        /**
         * Apply the edge glow filter to the image.
         */
        static edgeGlow(opt: EdgeGlowOptions): MemoryImage;
        /**
         * Apply an emboss convolution filter.
         */
        static emboss(opt: EmbossOptions): MemoryImage;
        /**
         * Apply gamma scaling
         */
        static gamma(opt: GammaOptions): MemoryImage;
        /**
         * Apply gaussian blur to the **image**. **radius** determines how many pixels
         * away from the current pixel should contribute to the blur, where 0 is no
         * blur and the larger the **radius**, the stronger the blur.
         */
        static gaussianBlur(opt: GaussianBlurOptions): MemoryImage;
        /**
         * Convert the image to grayscale.
         */
        static grayscale(opt: GrayscaleOptions): MemoryImage;
        /**
         * Convert a high dynamic range image to a low dynamic range image,
         * with optional exposure control.
         */
        static hdrToLdr(opt: HdrToLdrOptions): MemoryImage;
        /**
         * Apply the hexagon pixelate filter to the image.
         */
        static hexagonPixelate(opt: HexagonPixelateOptions): MemoryImage;
        /**
         * Invert the colors of the **image**.
         */
        static invert(opt: InvertOptions): MemoryImage;
        static luminanceThreshold(opt: LuminanceThresholdOptions): MemoryImage;
        /**
         * Apply the monochrome filter to the **image**.
         *
         * **amount** controls the strength of the effect, in the range [0, 1].
         */
        static monochrome(opt: MonochromeOptions): MemoryImage;
        /**
         * Add random noise to pixel values. **sigma** determines how strong the effect
         * should be. **type** should be one of the following: _NoiseType.gaussian_,
         * _NoiseType.uniform_, _NoiseType.saltAndPepper_, _NoiseType.poisson_,
         * or _NoiseType.rice_.
         */
        static noise(opt: NoiseOptions): MemoryImage;
        /**
         * Linearly normalize the colors of the image. All color values will be mapped
         * to the range **min**, **max** inclusive.
         */
        static normalize(opt: NormalizeOptions): MemoryImage;
        /**
         * Pixelate the **image**.
         *
         * **size** determines the size of the pixelated blocks.
         * If **mode** is **upperLeft** then the upper-left corner of the
         * block will be used for the block color. Otherwise if **mode** is
         * **average**, the average of all the pixels in the block will be
         * used for the block color.
         */
        static pixelate(opt: PixelateOptions): MemoryImage;
        /**
         * Quantize the number of colors in image to 256.
         */
        static quantize(opt: QuantizeOptions): MemoryImage;
        /**
         * Applies Reinhard tone mapping to the hdr image, in-place.
         */
        static reinhardToneMap(opt: ReinhardToneMapOptions): MemoryImage;
        /**
         * Remap the color channels of the image.
         * **red**, **green**, **blue** and **alpha** should be set to one of the following:
         * _Channel.red_, _Channel.green_, _Channel.blue_, _Channel.alpha_, or
         * _Channel.luminance_.
         */
        static remapColors(opt: RemapColorsOptions): MemoryImage;
        static scaleRgba(opt: ScaleRgbaOptions): MemoryImage;
        /**
         * Apply a generic separable convolution filter to the **image**, using the
         * given **kernel**.
         *
         * **gaussianBlur** is an example of such a filter.
         */
        static separableConvolution(opt: SeparableConvolutionOptions): MemoryImage;
        /**
         * Apply sepia tone to the **image**.
         *
         * **amount** controls the strength of the effect, in the range [0, 1].
         */
        static sepia(opt: SepiaOptions): MemoryImage;
        /**
         * Apply sketch filter to the **image**.
         *
         * **amount** controls the strength of the effect, in the range [0, 1].
         */
        static sketch(opt: SketchOptions): MemoryImage;
        /**
         * Apply a smoothing convolution filter to the **image**.
         *
         * **weight** is the weight of the current pixel being filtered. If it's greater
         * than 1, it will make the image sharper.
         */
        static smooth(opt: SmoothOptions): MemoryImage;
        /**
         * Apply Sobel edge detection filtering to the **image**.
         */
        static sobel(opt: SobelOptions): MemoryImage;
        static stretchDistortion(opt: StretchDistortionOptions): MemoryImage;
        /**
         * Apply a vignette filter to the **image**.
         *
         * **start** is the inner radius from the center of the image, where the fade to
         * **color** starts to be applied; **end** is the outer radius of the
         * vignette effect where the **color** is fully applied. The radius values are in
         * normalized percentage of the image size [0, 1].
         * **amount** controls the blend of the effect with the original image.
         */
        static vignette(opt: VignetteOptions): MemoryImage;
    }
}
declare module "formats/gif-encoder" {
    import { Encoder } from "formats/encoder";
    import { MemoryImage } from "image/image";
    import { DitherKernel } from "filter/dither-kernel";
    export interface GifEncoderInitOptions {
        delay?: number;
        repeat?: number;
        samplingFactor?: number;
        dither?: DitherKernel;
        ditherSerpentine?: boolean;
    }
    export class GifEncoder implements Encoder {
        private static readonly _gif89Id;
        private static readonly _imageDescRecordType;
        private static readonly _extensionRecordType;
        private static readonly _terminateRecordType;
        private static readonly _applicationExt;
        private static readonly _graphicControlExt;
        private static readonly _eof;
        private static readonly _bits;
        private static readonly _hSize;
        private static readonly _masks;
        private _delay;
        private _repeat;
        private _numColors;
        private _quantizerType;
        private _samplingFactor;
        private _lastImage?;
        private _lastImageDuration?;
        private _lastColorMap?;
        private _width;
        private _height;
        private _encodedFrames;
        private _curAccum;
        private _curBits;
        private _nBits;
        private _initBits;
        private _eofCode;
        private _maxCode;
        private _clearCode;
        private _freeEnt;
        private _clearFlag;
        private _block;
        private _blockSize;
        private _outputBuffer?;
        private _dither;
        private _ditherSerpentine;
        /**
         * Does this encoder support animation?
         */
        private readonly _supportsAnimation;
        get supportsAnimation(): boolean;
        constructor(opt?: GifEncoderInitOptions);
        private addImage;
        private encodeLZW;
        private output;
        private writeBlock;
        private addToBlock;
        private writeApplicationExt;
        private writeGraphicsCtrlExt;
        private writeHeader;
        /**
         * Encode the images that were added with **addFrame**.
         * After this has been called (returning the finishes GIF),
         * calling **addFrame** for a new animation or image is safe again.
         *
         * **addFrame** will not encode the first image passed and after that
         * always encode the previous image. Hence, the last image needs to be
         * encoded here.
         */
        private finish;
        /**
         * This adds the frame passed to **image**.
         * After the last frame has been added, **finish** is required to be called.
         * Optional frame **duration** is in 1/100 sec.
         * */
        addFrame(image: MemoryImage, duration?: number): void;
        /**
         * Encode a single frame image.
         */
        encode(image: MemoryImage, singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/dib-decoder" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { BmpDecoder } from "formats/bmp-decoder";
    import { BmpInfo } from "formats/bmp/bmp-info";
    export class DibDecoder extends BmpDecoder {
        constructor(input: InputBuffer, info: BmpInfo, forceRgba?: boolean);
    }
}
declare module "formats/ico/ico-bmp-info" {
    /** @format */
    import { BmpInfo } from "formats/bmp/bmp-info";
    export class IcoBmpInfo extends BmpInfo {
        get height(): number;
        get ignoreAlphaChannel(): boolean;
    }
}
declare module "formats/ico/ico-info-image" {
    /** @format */
    export interface IcoInfoImageInitOptions {
        width: number;
        height: number;
        colorPalette: number;
        bytesSize: number;
        bytesOffset: number;
        colorPlanes: number;
        bitsPerPixel: number;
    }
    export class IcoInfoImage {
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private readonly _colorPalette;
        get colorPalette(): number;
        private readonly _bytesSize;
        get bytesSize(): number;
        private readonly _bytesOffset;
        get bytesOffset(): number;
        private readonly _colorPlanes;
        get colorPlanes(): number;
        private readonly _bitsPerPixel;
        get bitsPerPixel(): number;
        constructor(opt: IcoInfoImageInitOptions);
    }
}
declare module "formats/ico/ico-type" {
    /** @format */
    export enum IcoType {
        invalid = 0,
        ico = 1,
        cur = 2
    }
    export const IcoTypeLength = 3;
}
declare module "formats/ico/ico-info" {
    /** @format */
    import { Color } from "color/color";
    import { InputBuffer } from "common/input-buffer";
    import { DecodeInfo } from "formats/decode-info";
    import { IcoInfoImage } from "formats/ico/ico-info-image";
    import { IcoType } from "formats/ico/ico-type";
    export class IcoInfo implements DecodeInfo {
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private readonly _type;
        get type(): IcoType;
        private readonly _numFrames;
        get numFrames(): number;
        private _backgroundColor;
        get backgroundColor(): Color | undefined;
        private readonly _images;
        get images(): IcoInfoImage[];
        constructor(type: number, numFrames: number, images: IcoInfoImage[]);
        static read(input: InputBuffer): IcoInfo | undefined;
    }
}
declare module "common/crc32" {
    /** @format */
    export interface Crc32Options {
        buffer: Uint8Array;
        baseCrc?: number;
        position?: number;
        length?: number;
    }
    export abstract class Crc32 {
        private static readonly _crcTable;
        private static makeTable;
        static getChecksum(opt: Crc32Options): number;
    }
}
declare module "formats/png/png-blend-mode" {
    /** @format */
    export enum PngBlendMode {
        /**
         * No alpha blending should be done when drawing this frame (replace pixels in canvas).
         */
        source = 0,
        /**
         * * Alpha blending should be used when drawing this frame (composited over
         * the current canvas image).
         */
        over = 1
    }
}
declare module "formats/png/png-dispose-mode" {
    /** @format */
    export enum PngDisposeMode {
        none = 0,
        background = 1,
        previous = 2
    }
}
declare module "formats/png/png-frame" {
    /** @format */
    import { PngBlendMode } from "formats/png/png-blend-mode";
    import { PngDisposeMode } from "formats/png/png-dispose-mode";
    export interface PngFrameInitOptions {
        sequenceNumber?: number;
        width?: number;
        height?: number;
        xOffset?: number;
        yOffset?: number;
        delayNum?: number;
        delayDen?: number;
        dispose?: number;
        blend?: number;
    }
    export class PngFrame {
        private readonly _fdat;
        get fdat(): number[];
        private _sequenceNumber;
        get sequenceNumber(): number;
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _xOffset;
        get xOffset(): number;
        private _yOffset;
        get yOffset(): number;
        private _delayNum;
        get delayNum(): number;
        private _delayDen;
        get delayDen(): number;
        private _dispose;
        get dispose(): PngDisposeMode;
        private _blend;
        get blend(): PngBlendMode;
        get delay(): number;
        constructor(opt: PngFrameInitOptions);
    }
}
declare module "formats/png/png-color-type" {
    /** @format */
    export enum PngColorType {
        grayscale = 0,
        rgb = 2,
        indexed = 3,
        grayscaleAlpha = 4,
        rgba = 6
    }
}
declare module "formats/png/png-info" {
    /** @format */
    import { Color } from "color/color";
    import { DecodeInfo } from "formats/decode-info";
    import { PngColorType } from "formats/png/png-color-type";
    import { PngFrame } from "formats/png/png-frame";
    export interface PngInfoInitOptions {
        width?: number;
        height?: number;
        bits?: number;
        colorType?: number;
        compressionMethod?: number;
        filterMethod?: number;
        interlaceMethod?: number;
    }
    export class PngInfo implements DecodeInfo {
        private _width;
        get width(): number;
        set width(v: number);
        private _height;
        set height(v: number);
        get height(): number;
        private _backgroundColor;
        get backgroundColor(): Color | undefined;
        set backgroundColor(v: Color | undefined);
        private _numFrames;
        get numFrames(): number;
        set numFrames(v: number);
        private _bits;
        get bits(): number;
        set bits(v: number);
        private _colorType;
        get colorType(): PngColorType | undefined;
        set colorType(v: PngColorType | undefined);
        private _compressionMethod;
        get compressionMethod(): number;
        set compressionMethod(v: number);
        private _filterMethod;
        get filterMethod(): number;
        set filterMethod(v: number);
        private _interlaceMethod;
        get interlaceMethod(): number;
        set interlaceMethod(v: number);
        private _palette?;
        get palette(): Uint8Array | undefined;
        set palette(v: Uint8Array | undefined);
        private _transparency?;
        get transparency(): Uint8Array | undefined;
        set transparency(v: Uint8Array | undefined);
        private _gamma?;
        get gamma(): number | undefined;
        set gamma(v: number | undefined);
        private _iccpName;
        get iccpName(): string;
        set iccpName(v: string);
        private _iccpCompression;
        get iccpCompression(): number;
        set iccpCompression(v: number);
        private _iccpData?;
        get iccpData(): Uint8Array | undefined;
        set iccpData(v: Uint8Array | undefined);
        private _textData;
        get textData(): Map<string, string>;
        private _repeat;
        get repeat(): number;
        set repeat(v: number);
        private readonly _idat;
        get idat(): number[];
        private readonly _frames;
        get frames(): PngFrame[];
        get isAnimated(): boolean;
        constructor(opt?: PngInfoInitOptions);
    }
}
declare module "formats/png/png-filter-type" {
    /** @format */
    export enum PngFilterType {
        none = 0,
        sub = 1,
        up = 2,
        average = 3,
        paeth = 4
    }
}
declare module "formats/png-decoder" {
    import { InputBuffer } from "common/input-buffer";
    import { DecodeInfo } from "formats/decode-info";
    import { Decoder } from "formats/decoder";
    import { PngInfo } from "formats/png/png-info";
    import { MemoryImage } from "image/image";
    /**
     * Decode a PNG encoded image.
     */
    export class PngDecoder implements Decoder {
        private _input?;
        get input(): InputBuffer | undefined;
        private _info;
        get info(): PngInfo;
        private _progressY;
        get progressY(): number;
        private _bitBuffer;
        get bitBuffer(): number;
        private _bitBufferLen;
        get bitBufferLen(): number;
        /**
         * The number of frames that can be decoded.
         */
        get numFrames(): number;
        private static unfilter;
        /**
         * Return the CRC of the bytes
         */
        private static crc;
        /**
         * Process a pass of an interlaced image.
         */
        private processPass;
        private process;
        private resetBits;
        /**
         * Read a number of bits from the input stream.
         */
        private readBits;
        /**
         * Read the next pixel from the input stream.
         */
        private readPixel;
        private setPixel;
        /**
         * Is the given file a valid PNG image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        /**
         * Start decoding the data as an animation sequence, but don't actually
         * process the frames until they are requested with decodeFrame.
         */
        startDecode(bytes: Uint8Array): DecodeInfo | undefined;
        /**
         * Decode the frame (assuming **startDecode** has already been called).
         */
        decodeFrame(frame: number): MemoryImage | undefined;
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
    }
}
declare module "formats/ico-decoder" {
    import { Decoder } from "formats/decoder";
    import { IcoInfo } from "formats/ico/ico-info";
    import { MemoryImage } from "image/image";
    export class IcoDecoder implements Decoder {
        private _input?;
        private _info?;
        get numFrames(): number;
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): IcoInfo | undefined;
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeFrame(frame: number): MemoryImage | undefined;
        /**
         * Decodes the largest frame.
         */
        decodeImageLargest(bytes: Uint8Array): MemoryImage | undefined;
    }
}
declare module "formats/png-encoder" {
    import { CompressionLevel } from "common/typings";
    import { Encoder } from "formats/encoder";
    import { PngFilterType } from "formats/png/png-filter-type";
    import { MemoryImage } from "image/image";
    export interface PngEncoderInitOptions {
        filter?: PngFilterType;
        level?: CompressionLevel;
    }
    /**
     * Encode an image to the PNG format.
     */
    export class PngEncoder implements Encoder {
        private _globalQuantizer;
        private _filter;
        private _level;
        private _repeat;
        private _frames;
        private _sequenceNumber;
        private _isAnimated;
        private _output;
        /**
         * Does this encoder support animation?
         */
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        constructor(opt?: PngEncoderInitOptions);
        /**
         * Return the CRC of the bytes
         */
        private static crc;
        private static writeChunk;
        private static write;
        private static filterSub;
        private static filterUp;
        private static filterAverage;
        private static paethPredictor;
        private static filterPaeth;
        private static filterNone;
        private static numChannels;
        private writeHeader;
        private writeICCPChunk;
        private writeAnimationControlChunk;
        private writeFrameControlChunk;
        private writePalette;
        private writeTextChunk;
        private filter;
        addFrame(image: MemoryImage): void;
        finish(): Uint8Array | undefined;
        /**
         * Encode **image** to the PNG format.
         */
        encode(image: MemoryImage, singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/win-encoder" {
    import { MemoryImage } from "image/image";
    import { Encoder } from "formats/encoder";
    export abstract class WinEncoder implements Encoder {
        protected _type: number;
        get type(): number;
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        protected colorPlanesOrXHotSpot(_index: number): number;
        protected bitsPerPixelOrYHotSpot(_index: number): number;
        encode(image: MemoryImage, singleFrame?: boolean): Uint8Array;
        encodeImages(images: MemoryImage[]): Uint8Array;
    }
}
declare module "formats/ico-encoder" {
    /** @format */
    import { WinEncoder } from "formats/win-encoder";
    export class IcoEncoder extends WinEncoder {
        protected _type: number;
        protected colorPlanesOrXHotSpot(_index: number): number;
        protected bitsPerPixelOrYHotSpot(_index: number): number;
    }
}
declare module "formats/jpeg/jpeg-component-data" {
    /** @format */
    export class JpegComponentData {
        private _hSamples;
        get hSamples(): number;
        private _maxHSamples;
        get maxHSamples(): number;
        private _vSamples;
        get vSamples(): number;
        private _maxVSamples;
        get maxVSamples(): number;
        private _lines;
        get lines(): Array<Uint8Array | undefined>;
        private _hScaleShift;
        get hScaleShift(): number;
        private _vScaleShift;
        get vScaleShift(): number;
        constructor(hSamples: number, maxHSamples: number, vSamples: number, maxVSamples: number, lines: Array<Uint8Array | undefined>);
    }
}
declare module "formats/jpeg/jpeg-adobe" {
    /** @format */
    export class JpegAdobe {
        private _version;
        get version(): number;
        private _flags0;
        get flags0(): number;
        private _flags1;
        get flags1(): number;
        private _transformCode;
        get transformCode(): number;
        constructor(version: number, flags0: number, flags1: number, transformCode: number);
    }
}
declare module "formats/jpeg/huffman-node" {
    /** @format */
    export abstract class HuffmanNode {
    }
}
declare module "formats/jpeg/jpeg-component" {
    /** @format */
    import { HuffmanNode } from "formats/jpeg/huffman-node";
    export class JpegComponent {
        private readonly _quantizationTableList;
        private readonly _quantizationIndex;
        private readonly _hSamples;
        get hSamples(): number;
        private readonly _vSamples;
        get vSamples(): number;
        private _blocks;
        get blocks(): Array<Array<Int32Array>>;
        private _blocksPerLine;
        get blocksPerLine(): number;
        private _blocksPerColumn;
        get blocksPerColumn(): number;
        private _huffmanTableDC;
        set huffmanTableDC(v: Array<HuffmanNode | undefined>);
        get huffmanTableDC(): Array<HuffmanNode | undefined>;
        private _huffmanTableAC;
        set huffmanTableAC(v: Array<HuffmanNode | undefined>);
        get huffmanTableAC(): Array<HuffmanNode | undefined>;
        private _pred;
        set pred(v: number);
        get pred(): number;
        get quantizationTable(): Int16Array | undefined;
        constructor(hSamples: number, vSamples: number, quantizationTableList: Array<Int16Array | undefined>, quantizationIndex: number);
        setBlocks(blocks: Array<Array<Int32Array>>, blocksPerLine: number, blocksPerColumn: number): void;
    }
}
declare module "formats/jpeg/jpeg-frame" {
    import { JpegComponent } from "formats/jpeg/jpeg-component";
    export class JpegFrame {
        private readonly _components;
        get components(): Map<number, JpegComponent>;
        private readonly _componentsOrder;
        get componentsOrder(): Array<number>;
        private _extended;
        get extended(): boolean;
        private _progressive;
        get progressive(): boolean;
        private _precision;
        get precision(): number;
        private _scanLines;
        get scanLines(): number;
        private _samplesPerLine;
        get samplesPerLine(): number;
        private _maxHSamples;
        get maxHSamples(): number;
        private _maxVSamples;
        get maxVSamples(): number;
        private _mcusPerLine;
        get mcusPerLine(): number;
        private _mcusPerColumn;
        get mcusPerColumn(): number;
        constructor(components: Map<number, JpegComponent>, componentsOrder: Array<number>, extended: boolean, progressive: boolean, precision: number, scanLines: number, samplesPerLine: number);
        prepare(): void;
    }
}
declare module "formats/jpeg/jpeg-huffman" {
    /** @format */
    import { HuffmanNode } from "formats/jpeg/huffman-node";
    export class JpegHuffman {
        private readonly _children;
        get children(): Array<HuffmanNode | undefined>;
        private _index;
        get index(): number;
        incrementIndex(): void;
    }
}
declare module "formats/jpeg/jpeg-info" {
    /** @format */
    import { Color } from "color/color";
    import { DecodeInfo } from "formats/decode-info";
    export class JpegInfo implements DecodeInfo {
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _numFrames;
        get numFrames(): number;
        private _backgroundColor;
        get backgroundColor(): Color | undefined;
        setSize(width: number, height: number): void;
    }
}
declare module "formats/jpeg/jpeg-jfif" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class JpegJfif {
        private _thumbWidth;
        get thumbWidth(): number;
        private _thumbHeight;
        get thumbHeight(): number;
        private _majorVersion;
        get majorVersion(): number;
        private _minorVersion;
        get minorVersion(): number;
        private _densityUnits;
        get densityUnits(): number;
        private _xDensity;
        get xDensity(): number;
        private _yDensity;
        get yDensity(): number;
        private _thumbData;
        get thumbData(): InputBuffer;
        constructor(thumbWidth: number, thumbHeight: number, majorVersion: number, minorVersion: number, densityUnits: number, xDensity: number, yDensity: number, thumbData: InputBuffer);
    }
}
declare module "formats/jpeg/jpeg-quantize" {
    import { MemoryImage } from "image/image";
    import { JpegData } from "formats/jpeg/jpeg-data";
    export abstract class JpegQuantize {
        private static readonly _dctClipOffset;
        private static readonly _dctClipLength;
        private static readonly _dctClip;
        private static createDctClip;
        static quantizeAndInverse(quantizationTable: Int16Array, coefBlock: Int32Array, dataOut: Uint8Array, dataIn: Int32Array): void;
        static getImageFromJpeg(jpeg: JpegData): MemoryImage;
    }
}
declare module "formats/jpeg/huffman-parent" {
    /** @format */
    import { HuffmanNode } from "formats/jpeg/huffman-node";
    export class HuffmanParent extends HuffmanNode {
        private readonly _children;
        get children(): Array<HuffmanNode | undefined>;
        constructor(children: Array<HuffmanNode | undefined>);
    }
}
declare module "formats/jpeg/huffman-value" {
    /** @format */
    import { HuffmanNode } from "formats/jpeg/huffman-node";
    export class HuffmanValue extends HuffmanNode {
        private readonly _value;
        get value(): number;
        constructor(value: number);
    }
}
declare module "formats/jpeg/jpeg-marker" {
    /** @format */
    export enum JpegMarker {
        sof0 = 192,
        sof1 = 193,
        sof2 = 194,
        sof3 = 195,
        sof5 = 197,
        sof6 = 198,
        sof7 = 199,
        jpg = 200,
        sof9 = 201,
        sof10 = 202,
        sof11 = 203,
        sof13 = 205,
        sof14 = 206,
        sof15 = 207,
        dht = 196,
        dac = 204,
        rst0 = 208,
        rst1 = 209,
        rst2 = 210,
        rst3 = 211,
        rst4 = 212,
        rst5 = 213,
        rst6 = 214,
        rst7 = 215,
        soi = 216,
        eoi = 217,
        sos = 218,
        dqt = 219,
        dnl = 220,
        dri = 221,
        dhp = 222,
        exp = 223,
        app0 = 224,
        app1 = 225,
        app2 = 226,
        app3 = 227,
        app4 = 228,
        app5 = 229,
        app6 = 230,
        app7 = 231,
        app8 = 232,
        app9 = 233,
        app10 = 234,
        app11 = 235,
        app12 = 236,
        app13 = 237,
        app14 = 238,
        app15 = 239,
        jpg0 = 240,
        jpg13 = 253,
        com = 254,
        tem = 1,
        error = 256
    }
}
declare module "formats/jpeg/jpeg-scan" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { JpegComponent } from "formats/jpeg/jpeg-component";
    import { JpegFrame } from "formats/jpeg/jpeg-frame";
    export type DecodeFunction = (component: JpegComponent, block: Int32Array) => void;
    export class JpegScan {
        private _input;
        get input(): InputBuffer;
        private _frame;
        get frame(): JpegFrame;
        private _precision;
        get precision(): number;
        private _samplesPerLine;
        get samplesPerLine(): number;
        private _scanLines;
        get scanLines(): number;
        private _mcusPerLine;
        get mcusPerLine(): number;
        private _progressive;
        get progressive(): boolean;
        private _maxH;
        get maxH(): number;
        private _maxV;
        get maxV(): number;
        private _components;
        get components(): Array<JpegComponent>;
        private _resetInterval?;
        get resetInterval(): number | undefined;
        private _spectralStart;
        get spectralStart(): number;
        private _spectralEnd;
        get spectralEnd(): number;
        private _successivePrev;
        get successivePrev(): number;
        private _successive;
        get successive(): number;
        private _bitsData;
        get bitsData(): number;
        private _bitsCount;
        get bitsCount(): number;
        private _eobrun;
        get eobrun(): number;
        private _successiveACState;
        get successiveACState(): number;
        private _successiveACNextValue;
        get successiveACNextValue(): number;
        constructor(input: InputBuffer, frame: JpegFrame, components: Array<JpegComponent>, spectralStart: number, spectralEnd: number, successivePrev: number, successive: number, resetInterval?: number);
        private readBit;
        private decodeHuffman;
        private receive;
        private receiveAndExtend;
        private decodeBaseline;
        private decodeDCFirst;
        private decodeDCSuccessive;
        private decodeACFirst;
        private decodeACSuccessive;
        private decodeMcu;
        private decodeBlock;
        decode(): void;
    }
}
declare module "formats/jpeg/jpeg-data" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { JpegComponentData } from "formats/jpeg/jpeg-component-data";
    import { JpegAdobe } from "formats/jpeg/jpeg-adobe";
    import { JpegFrame } from "formats/jpeg/jpeg-frame";
    import { JpegInfo } from "formats/jpeg/jpeg-info";
    import { JpegJfif } from "formats/jpeg/jpeg-jfif";
    import { ExifData } from "exif/exif-data";
    import { MemoryImage } from "image/image";
    import { HuffmanNode } from "formats/jpeg/huffman-node";
    export class JpegData {
        static readonly dctZigZag: number[];
        static readonly dctSize = 8;
        static readonly dctSize2 = 64;
        static readonly numQuantizationTables = 4;
        static readonly numHuffmanTables = 4;
        static readonly numArithTables = 16;
        static readonly maxCompsInScan = 4;
        static readonly maxSamplingFactor = 4;
        private _input;
        get input(): InputBuffer;
        private _jfif;
        get jfif(): JpegJfif;
        private _adobe;
        get adobe(): JpegAdobe;
        private _frame?;
        get frame(): JpegFrame | undefined;
        private _resetInterval;
        get resetInterval(): number;
        private _comment?;
        get comment(): string | undefined;
        private readonly _exifData;
        get exifData(): ExifData;
        private readonly _quantizationTables;
        get quantizationTables(): Array<Int16Array | undefined>;
        private readonly _frames;
        get frames(): Array<JpegFrame | undefined>;
        private readonly _huffmanTablesAC;
        get huffmanTablesAC(): Array<Array<HuffmanNode | undefined> | undefined>;
        private readonly _huffmanTablesDC;
        get huffmanTablesDC(): Array<Array<HuffmanNode | undefined> | undefined>;
        private readonly _components;
        get components(): Array<JpegComponentData>;
        get width(): number;
        get height(): number;
        private readMarkers;
        private skipBlock;
        validate(bytes: Uint8Array): boolean;
        readInfo(bytes: Uint8Array): JpegInfo | undefined;
        read(bytes: Uint8Array): void;
        getImage(): MemoryImage;
        private static buildHuffmanTable;
        private static buildComponentData;
        static toFix(val: number): number;
        private readBlock;
        private nextMarker;
        private readExifData;
        private readAppData;
        private readDQT;
        private readFrame;
        private readDHT;
        private readDRI;
        private readSOS;
    }
}
declare module "formats/jpeg-decoder" {
    import { MemoryImage } from "image/image";
    import { Decoder } from "formats/decoder";
    import { JpegInfo } from "formats/jpeg/jpeg-info";
    /**
     * Decode a jpeg encoded image.
     */
    export class JpegDecoder implements Decoder {
        private _input?;
        private _info?;
        get numFrames(): number;
        /**
         * Is the given file a valid JPEG image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): JpegInfo | undefined;
        decodeFrame(_: number): MemoryImage | undefined;
        decode(bytes: Uint8Array, _frame?: number): MemoryImage | undefined;
    }
}
declare module "formats/jpeg-encoder" {
    import { MemoryImage } from "image/image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode an image to the JPEG format.
     */
    export class JpegEncoder implements Encoder {
        private static readonly _zigzag;
        private static readonly _stdDcLuminanceNrCodes;
        private static readonly _stdDcLuminanceValues;
        private static readonly _stdAcLuminanceNrCodes;
        private static readonly _stdAcLuminanceValues;
        private static readonly _stdDcChrominanceNrCodes;
        private static readonly _stdDcChrominanceValues;
        private static readonly _stdAcChrominanceNrCodes;
        private static readonly _stdAcChrominanceValues;
        private readonly _tableY;
        private readonly _tableUv;
        private readonly _fdTableY;
        private readonly _fdTableUv;
        private readonly _bitCode;
        private readonly _category;
        private readonly _outputfDCTQuant;
        private readonly _du;
        private readonly _ydu;
        private readonly _udu;
        private readonly _vdu;
        private readonly _tableRgbYuv;
        private _ydcHuffman;
        private _uvdcHuffman;
        private _yacHuffman;
        private _uvacHuffman;
        private _currentQuality?;
        private _byteNew;
        private _bytePos;
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        constructor(quality?: number);
        private static computeHuffmanTable;
        private static writeMarker;
        private static writeAPP0;
        private static writeAPP1;
        private static writeSOF0;
        private static writeSOS;
        private static writeDHT;
        private initHuffmanTable;
        private initCategoryNumber;
        private initRgbYuvTable;
        private setQuality;
        private initQuantTables;
        private fDCTQuant;
        private writeDQT;
        private writeBits;
        private resetBits;
        private processDU;
        encode(image: MemoryImage, _singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/tga/tga-image-type" {
    /** @format */
    export enum TgaImageType {
        none = 0,
        palette = 1,
        rgb = 2,
        gray = 3,
        reserved4 = 4,
        reserved5 = 5,
        reserved6 = 6,
        reserved7 = 7,
        reserved8 = 8,
        paletteRle = 9,
        rgbRle = 10,
        grayRle = 11
    }
    export const TgaImageTypeLength = 12;
}
declare module "formats/tga/tga-info" {
    /** @format */
    import { Color } from "color/color";
    import { InputBuffer } from "common/input-buffer";
    import { DecodeInfo } from "formats/decode-info";
    import { TgaImageType } from "formats/tga/tga-image-type";
    export interface TgaInfoInitOptions {
        width?: number;
        height?: number;
        imageOffset?: number;
        bitsPerPixel?: number;
    }
    export class TgaInfo implements DecodeInfo {
        /**
         * The number of frames that can be decoded.
         */
        private readonly _numFrames;
        get numFrames(): number;
        private readonly _backgroundColor;
        get backgroundColor(): Color | undefined;
        private _idLength;
        get idLength(): number;
        private _colorMapType;
        get colorMapType(): number;
        private _imageType;
        get imageType(): TgaImageType;
        private _colorMapOrigin;
        get colorMapOrigin(): number;
        private _colorMapLength;
        get colorMapLength(): number;
        private _colorMapDepth;
        get colorMapDepth(): number;
        private _offsetX;
        get offsetX(): number;
        private _offsetY;
        get offsetY(): number;
        private _width;
        get width(): number;
        protected _height: number;
        get height(): number;
        protected _pixelDepth: number;
        get pixelDepth(): number;
        protected _flags: number;
        get flags(): number;
        protected _colorMap: Uint8Array | undefined;
        get colorMap(): Uint8Array | undefined;
        set colorMap(v: Uint8Array | undefined);
        protected _screenOrigin: number;
        get screenOrigin(): number;
        /**
         *  Offset in the input file the image data starts at.
         */
        private _imageOffset;
        get imageOffset(): number;
        set imageOffset(v: number);
        get hasColorMap(): boolean;
        read(header: InputBuffer): void;
        isValid(): boolean;
    }
}
declare module "formats/tga-decoder" {
    import { MemoryImage } from "image/image";
    import { Decoder } from "formats/decoder";
    import { TgaInfo } from "formats/tga/tga-info";
    /**
     * Decode a TGA image. This only supports the 24-bit and 32-bit uncompressed format.
     */
    export class TgaDecoder implements Decoder {
        private _input;
        private _info;
        get numFrames(): number;
        private decodeColorMap;
        private decodeRle;
        private decodeRgb;
        /**
         * Is the given file a valid TGA image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): TgaInfo | undefined;
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeFrame(_frame: number): MemoryImage | undefined;
    }
}
declare module "formats/tga-encoder" {
    import { MemoryImage } from "image/image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode a TGA image. This only supports the 24-bit uncompressed format.
     */
    export class TgaEncoder implements Encoder {
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        encode(image: MemoryImage, _singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/tiff/tiff-bit-reader" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class TiffBitReader {
        private static readonly _bitMask;
        private _bitBuffer;
        private _bitPosition;
        private _input;
        constructor(input: InputBuffer);
        /**
         * Read a number of bits from the input stream.
         */
        readBits(numBits: number): number;
        readByte(): number;
        /**
         *  Flush the rest of the bits in the buffer so the next read starts at the next byte.
         */
        flushByte(): number;
    }
}
declare module "formats/tiff/tiff-compression" {
    /** @format */
    export enum TiffCompression {
        none = 1,
        ccittRle = 2,
        ccittFax3 = 3,
        ccittFax4 = 4,
        lzw = 5,
        oldJpeg = 6,
        jpeg = 7,
        next = 32766,
        ccittRlew = 32771,
        packBits = 32773,
        thunderScan = 32809,
        it8ctpad = 32895,
        tt8lw = 32896,
        it8mp = 32897,
        it8bl = 32898,
        pixarFilm = 32908,
        pixarLog = 32909,
        deflate = 32946,
        zip = 8,
        dcs = 32947,
        jbig = 34661,
        sgiLog = 34676,
        sgiLog24 = 34677,
        jp2000 = 34712
    }
}
declare module "formats/tiff/tiff-entry" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { IfdValueType } from "exif/ifd-value-type";
    import { IfdValue } from "exif/ifd-value/ifd-value";
    export interface TiffEntryInitOptions {
        tag: number;
        type: number;
        count: number;
        p: InputBuffer;
        valueOffset: number;
    }
    export class TiffEntry {
        private _tag;
        get tag(): number;
        private _type;
        get type(): IfdValueType;
        private _count;
        get count(): number;
        private _valueOffset;
        get valueOffset(): number;
        private _value;
        get value(): IfdValue | undefined;
        private _p;
        get p(): InputBuffer;
        get isValid(): boolean;
        get typeSize(): number;
        get isString(): boolean;
        constructor(opt: TiffEntryInitOptions);
        read(): IfdValue | undefined;
        toString(): string;
    }
}
declare module "formats/tiff/tiff-fax-decoder" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export interface TiffFaxDecoderInitOptions {
        fillOrder: number;
        width: number;
        height: number;
    }
    export class TiffFaxDecoder {
        private static readonly _table1;
        private static readonly _table2;
        /**
         * Table to be used when **fillOrder** = 2, for flipping bytes.
         */
        private static readonly _flipTable;
        /**
         * The main 10 bit white runs lookup table
         */
        private static readonly _white;
        /**
         * Additional make up codes for both White and Black runs
         */
        private static readonly _additionalMakeup;
        /**
         * Initial black run look up table, uses the first 4 bits of a code
         */
        private static readonly _initBlack;
        private static readonly _twoBitBlack;
        /**
         * Main black run table, using the last 9 bits of possible 13 bit code
         */
        private static readonly _black;
        private static readonly _twoDCodes;
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _fillOrder;
        get fillOrder(): number;
        private _changingElemSize;
        private _prevChangingElements?;
        private _currChangingElements?;
        private _data;
        private _bitPointer;
        private _bytePointer;
        private _lastChangingElement;
        private _compression;
        private _uncompressedMode;
        private _fillBits;
        private _oneD;
        constructor(opt: TiffFaxDecoderInitOptions);
        private nextNBits;
        private nextLesserThan8Bits;
        /**
         * Move pointer backwards by given amount of bits
         */
        private updatePointer;
        /**
         * Move to the next byte boundary
         */
        private advancePointer;
        private setToBlack;
        private decodeNextScanline;
        private readEOL;
        private getNextChangingElement;
        /**
         * Returns run length
         */
        private decodeWhiteCodeWord;
        /**
         * Returns run length
         */
        private decodeBlackCodeWord;
        /**
         * One-dimensional decoding methods
         */
        decode1D(out: InputBuffer, compData: InputBuffer, startX: number, height: number): void;
        /**
         * Two-dimensional decoding methods
         */
        decode2D(out: InputBuffer, compData: InputBuffer, startX: number, height: number, tiffT4Options: number): void;
        decodeT6(out: InputBuffer, compData: InputBuffer, startX: number, height: number, tiffT6Options: number): void;
    }
}
declare module "formats/tiff/tiff-format" {
    /** @format */
    export enum TiffFormat {
        invalid = 0,
        uint = 1,
        int = 2,
        float = 3
    }
}
declare module "formats/tiff/tiff-image-type" {
    /** @format */
    export enum TiffImageType {
        bilevel = 0,
        gray4bit = 1,
        gray = 2,
        grayAlpha = 3,
        palette = 4,
        rgb = 5,
        rgba = 6,
        yCbCrSub = 7,
        generic = 8,
        invalid = 9
    }
}
declare module "formats/tiff/tiff-lzw-decoder" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class LzwDecoder {
        private static readonly _lzMaxCode;
        private static readonly _noSuchCode;
        private static readonly _andTable;
        private readonly _buffer;
        private _bitsToGet;
        private _bytePointer;
        private _nextData;
        private _nextBits;
        private _data;
        private _dataLength;
        private _out;
        private _outPointer;
        private _table;
        private _prefix;
        private _tableIndex?;
        private _bufferLength;
        private addString;
        private getString;
        /**
         * Returns the next 9, 10, 11 or 12 bits
         */
        private getNextCode;
        /**
         * Initialize the string table.
         */
        private initializeStringTable;
        decode(p: InputBuffer, out: Uint8Array): void;
    }
}
declare module "formats/tiff/tiff-photometric-type" {
    /** @format */
    export enum TiffPhotometricType {
        whiteIsZero = 0,
        blackIsZero = 1,
        rgb = 2,
        palette = 3,
        transparencyMask = 4,
        cmyk = 5,
        yCbCr = 6,
        reserved7 = 7,
        cieLab = 8,
        iccLab = 9,
        ituLab = 10,
        logL = 11,
        logLuv = 12,
        colorFilterArray = 13,
        linearRaw = 14,
        depth = 15,
        unknown = 16
    }
    export const TiffPhotometricTypeLength = 17;
}
declare module "formats/tiff/tiff-image" {
    import { InputBuffer } from "common/input-buffer";
    import { MemoryImage } from "image/image";
    import { TiffEntry } from "formats/tiff/tiff-entry";
    import { TiffFormat } from "formats/tiff/tiff-format";
    import { TiffImageType } from "formats/tiff/tiff-image-type";
    import { TiffPhotometricType } from "formats/tiff/tiff-photometric-type";
    export class TiffImage {
        private readonly _tags;
        get tags(): Map<number, TiffEntry>;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private _photometricType;
        get photometricType(): TiffPhotometricType;
        private _compression;
        get compression(): number;
        private _bitsPerSample;
        get bitsPerSample(): number;
        private _samplesPerPixel;
        get samplesPerPixel(): number;
        private _sampleFormat;
        get sampleFormat(): TiffFormat;
        private _imageType;
        get imageType(): TiffImageType;
        private _isWhiteZero;
        get isWhiteZero(): boolean;
        private _predictor;
        get predictor(): number;
        private _chromaSubH;
        get chromaSubH(): number;
        private _chromaSubV;
        get chromaSubV(): number;
        private _tiled;
        get tiled(): boolean;
        private _tileWidth;
        get tileWidth(): number;
        private _tileHeight;
        get tileHeight(): number;
        private _tileOffsets;
        get tileOffsets(): number[] | undefined;
        private _tileByteCounts;
        get tileByteCounts(): number[] | undefined;
        private _tilesX;
        get tilesX(): number;
        private _tilesY;
        get tilesY(): number;
        private _tileSize;
        get tileSize(): number | undefined;
        private _fillOrder;
        get fillOrder(): number;
        private _t4Options;
        get t4Options(): number;
        private _t6Options;
        get t6Options(): number;
        private _extraSamples;
        get extraSamples(): number | undefined;
        private _colorMapSamples;
        get colorMapSamples(): number;
        private _colorMap;
        get colorMap(): Uint16Array | undefined;
        private _colorMapRed;
        private _colorMapGreen;
        private _colorMapBlue;
        get isValid(): boolean;
        constructor(p: InputBuffer);
        private readTag;
        private readTagList;
        private decodeBilevelTile;
        private decodeTile;
        private jpegToImage;
        /**
         * Uncompress packbits compressed image data.
         */
        private decodePackBits;
        decode(p: InputBuffer): MemoryImage;
        hasTag(tag: number): boolean;
    }
}
declare module "formats/tiff/tiff-info" {
    /** @format */
    import { Color } from "color/color";
    import { DecodeInfo } from "formats/decode-info";
    import { TiffImage } from "formats/tiff/tiff-image";
    export interface TiffInfoInitOptions {
        bigEndian: boolean;
        signature: number;
        ifdOffset: number;
        images: TiffImage[];
    }
    export class TiffInfo implements DecodeInfo {
        private _bigEndian;
        get bigEndian(): boolean;
        private _signature;
        get signature(): number;
        private _ifdOffset;
        get ifdOffset(): number;
        private _images;
        get images(): TiffImage[];
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _backgroundColor;
        get backgroundColor(): Color | undefined;
        get numFrames(): number;
        constructor(opt: TiffInfoInitOptions);
    }
}
declare module "formats/tiff-decoder" {
    import { ExifData } from "exif/exif-data";
    import { MemoryImage } from "image/image";
    import { Decoder } from "formats/decoder";
    import { TiffInfo } from "formats/tiff/tiff-info";
    export class TiffDecoder implements Decoder {
        private static readonly _tiffSignature;
        private static readonly _tiffLittleEndian;
        private static readonly _tiffBigEndian;
        private _input;
        private _info;
        get info(): TiffInfo | undefined;
        private _exifData;
        get exifData(): ExifData | undefined;
        /**
         * How many frames are available to be decoded. **startDecode** should have been called first.
         * Non animated image files will have a single frame.
         */
        get numFrames(): number;
        /**
         * Read the TIFF header and IFD blocks.
         */
        private readHeader;
        /**
         * Is the given file a valid TIFF image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        /**
         * Validate the file is a TIFF image and get information about it.
         * If the file is not a valid TIFF image, undefined is returned.
         */
        startDecode(bytes: Uint8Array): TiffInfo | undefined;
        /**
         * Decode a single frame from the data stat was set with **startDecode**.
         * If **frame** is out of the range of available frames, undefined is returned.
         * Non animated image files will only have **frame** 0.
         */
        decodeFrame(frame: number): MemoryImage | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified **frame** will be decoded. If there was a problem
         * decoding the file, undefined is returned.
         */
        decode(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
    }
}
declare module "formats/tiff-encoder" {
    import { MemoryImage } from "image/image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode a MemoryImage to the TIFF format.
     */
    export class TiffEncoder implements Encoder {
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        private getSampleFormat;
        encode(image: MemoryImage, _singleFrame?: boolean): Uint8Array;
    }
}
declare module "formats/jpeg/jpeg-utils" {
    import { ExifData } from "exif/exif-data";
    export class JpegUtils {
        private static readonly _exifSignature;
        private readExifData;
        private writeAPP1;
        private readBlock;
        private skipBlock;
        private nextMarker;
        decodeExif(data: Uint8Array): ExifData | undefined;
        injectExif(exif: ExifData, data: Uint8Array): Uint8Array | undefined;
    }
}
declare module "transform/flip-direction" {
    /** @format */
    export enum FlipDirection {
        /**
         * Flip the image horizontally.
         */
        horizontal = 0,
        /**
         * Flip the image vertically.
         */
        vertical = 1,
        /**
         * Flip the image both horizontally and vertically.
         */
        both = 2
    }
}
declare module "transform/trim-side" {
    /** @format */
    export enum TrimSide {
        top = 1,
        bottom = 2,
        left = 4,
        right = 8,
        all = 15
    }
}
declare module "transform/trim-mode" {
    /** @format */
    export enum TrimMode {
        /**
         * Trim an image to the top-left and bottom-right most non-transparent pixels
         */
        transparent = 0,
        /**
         * Trim an image to the top-left and bottom-right most pixels that are not
         * the same as the top-left most pixel of the image.
         */
        topLeftColor = 1,
        /**
         * Trim an image to the top-left and bottom-right most pixels that are not
         * the same as the bottom-right most pixel of the image.
         */
        bottomRightColor = 2
    }
}
declare module "transform/transform" {
    import { Point } from "common/point";
    import { Interpolation } from "common/interpolation";
    import { MemoryImage } from "image/image";
    import { FlipDirection } from "transform/flip-direction";
    import { TrimSide } from "transform/trim-side";
    import { Rectangle } from "common/rectangle";
    import { TrimMode } from "transform/trim-mode";
    export interface TransformOptions {
        image: MemoryImage;
    }
    export interface CopyCropCircleOptions extends TransformOptions {
        radius?: number;
        center?: Point;
        antialias?: boolean;
    }
    export interface CopyCropOptions extends TransformOptions {
        rect: Rectangle;
        radius?: number;
        antialias?: boolean;
    }
    export interface CopyRectifyOptions extends TransformOptions {
        topLeft: Point;
        topRight: Point;
        bottomLeft: Point;
        bottomRight: Point;
        interpolation?: Interpolation;
        toImage?: MemoryImage;
    }
    export interface CopyResizeCropSquareOptions extends TransformOptions {
        size: number;
        interpolation?: Interpolation;
        radius?: number;
        antialias?: boolean;
    }
    export interface CopyResizeOptionsUsingWidth extends TransformOptions {
        width: number;
        height?: number;
        interpolation?: Interpolation;
    }
    export interface CopyResizeOptionsUsingHeight extends TransformOptions {
        height: number;
        width?: number;
        interpolation?: Interpolation;
    }
    export interface CopyRotateOptions extends TransformOptions {
        angle: number;
        interpolation?: Interpolation;
    }
    export interface FlipOptions extends TransformOptions {
        direction: FlipDirection;
    }
    export interface TrimOptions extends TransformOptions {
        mode?: TrimMode;
        sides?: TrimSide;
    }
    export abstract class Transform {
        private static rotate90;
        private static rotate180;
        private static rotate270;
        /**
         * Find the crop area to be used by the trim function.
         *
         * Returns the Rectangle. You could pass these constraints
         * to the **copyCrop** function to crop the image.
         */
        private static findTrim;
        /**
         * If **image** has an orientation value in its exif data, this will rotate the
         * image so that it physically matches its orientation. This can be used to
         * bake the orientation of the image for image formats that don't support exif
         * data.
         */
        static bakeOrientation(opt: TransformOptions): MemoryImage;
        /**
         * Returns a cropped copy of **image**.
         */
        static copyCrop(opt: CopyCropOptions): MemoryImage;
        /**
         * Returns a circle cropped copy of **image**, centered at **centerX** and
         * **centerY** and with the given **radius**. If **radius** is not provided,
         * a radius filling the image will be used. If **centerX** is not provided,
         * the horizontal mid-point of the image will be used. If **centerY** is not
         * provided, the vertical mid-point of the image will be used.
         */
        static copyCropCircle(opt: CopyCropCircleOptions): MemoryImage;
        /**
         * Returns a copy of the **image** image, flipped by the given **direction**.
         */
        static copyFlip(opt: FlipOptions): MemoryImage;
        /**
         * Returns a copy of the **image**, where the given rectangle
         * has been mapped to the full image.
         */
        static copyRectify(opt: CopyRectifyOptions): MemoryImage;
        /**
         * Returns a resized copy of the **image**.
         *
         * If **height** isn't specified, then it will be determined by the aspect
         * ratio of **image** and **width**.
         *
         * If **width** isn't specified, then it will be determined by the aspect ratio
         * of **image** and **height**.
         */
        static copyResize(opt: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight): MemoryImage;
        /**
         * Returns a resized and square cropped copy of the **image** of **size** size.
         */
        static copyResizeCropSquare(opt: CopyResizeCropSquareOptions): MemoryImage;
        /**
         * Returns a copy of the **image**, rotated by **angle** degrees.
         */
        static copyRotate(opt: CopyRotateOptions): MemoryImage;
        /**
         * Flips the **image** using the given **direction**, which can be one of:
         * _FlipDirection.horizontal_, _FlipDirection.vertical_ or _FlipDirection.both_.
         */
        static flip(opt: FlipOptions): MemoryImage;
        /**
         * Flips the **image** vertically.
         */
        static flipVertical(opt: TransformOptions): MemoryImage;
        /**
         * Flips the **image** horizontally.
         */
        static flipHorizontal(opt: TransformOptions): MemoryImage;
        /**
         * Flip the **image** horizontally and vertically.
         */
        static flipHorizontalVertical(opt: TransformOptions): MemoryImage;
        /**
         * Automatically crops the image by finding the corners of the image that
         * meet the **mode** criteria (not transparent or a different color).
         *
         * **mode** can be either _TrimMode.transparent_, _TrimMode.topLeftColor_ or
         * _TrimMode.bottomRightColor_.
         *
         * **sides** can be used to control which sides of the image get trimmed,
         * and can be any combination of _TrimSide.top_, _TrimSide.bottom_, _TrimSide.left_,
         * and _TrimSide.right_.
         */
        static trim(opt: TrimOptions): MemoryImage;
    }
}
declare module "index" {
    /** @format */
    import { CompressionLevel, TypedArray } from "common/typings";
    import { Encoder } from "formats/encoder";
    import { Decoder } from "formats/decoder";
    import { MemoryImage } from "image/image";
    import { PngFilterType } from "formats/png/png-filter-type";
    import { DitherKernel } from "filter/dither-kernel";
    import { ExifData } from "exif/exif-data";
    export { ChannelOrder, ChannelOrderLength } from "color/channel-order";
    export { Channel } from "color/channel";
    export { ColorFloat16 } from "color/color-float16";
    export { ColorFloat32 } from "color/color-float32";
    export { ColorFloat64 } from "color/color-float64";
    export { ColorInt8 } from "color/color-int8";
    export { ColorInt16 } from "color/color-int16";
    export { ColorInt32 } from "color/color-int32";
    export { ColorRgb8 } from "color/color-rgb8";
    export { ColorRgba8 } from "color/color-rgba8";
    export { ColorUint1 } from "color/color-uint1";
    export { ColorUint2 } from "color/color-uint2";
    export { ColorUint4 } from "color/color-uint4";
    export { ColorUint8 } from "color/color-uint8";
    export { ColorUint16 } from "color/color-uint16";
    export { ColorUint32 } from "color/color-uint32";
    export { Color, ColorConvertOptions } from "color/color";
    export { Format, FormatType, FormatMaxValue, FormatSize, FormatToFormatType, convertFormatValue, } from "color/format";
    export { ArrayUtils } from "common/array-utils";
    export { BitUtils } from "common/bit-utils";
    export { Crc32, Crc32Options } from "common/crc32";
    export { Float16 } from "common/float16";
    export { InputBuffer, InputBufferInitOptions } from "common/input-buffer";
    export { Interpolation } from "common/interpolation";
    export { Line } from "common/line";
    export { MathUtils } from "common/math-utils";
    export { OutputBuffer, OutputBufferInitOptions } from "common/output-buffer";
    export { Point } from "common/point";
    export { RandomUtils } from "common/random-utils";
    export { Rational } from "common/rational";
    export { Rectangle } from "common/rectangle";
    export { StringUtils } from "common/string-utils";
    export { BufferEncoding, CompressionLevel, TypedArray } from "common/typings";
    export { BlendMode } from "draw/blend-mode";
    export { CircleQuadrant } from "draw/circle-quadrant";
    export { Draw, CompositeImageOptions, DrawCircleOptions, DrawLineOptions, DrawPixelOptions, DrawPolygonOptions, DrawRectOptions, FillCircleOptions, FillFloodOptions, FillOptions, FillPolygonOptions, FillRectOptions, MaskFloodOptions, } from "draw/draw";
    export { LibError } from "error/lib-error";
    export { IfdAsciiValue } from "exif/ifd-value/ifd-ascii-value";
    export { IfdByteValue } from "exif/ifd-value/ifd-byte-value";
    export { IfdDoubleValue } from "exif/ifd-value/ifd-double-value";
    export { IfdLongValue } from "exif/ifd-value/ifd-long-value";
    export { IfdRationalValue } from "exif/ifd-value/ifd-rational-value";
    export { IfdSByteValue } from "exif/ifd-value/ifd-sbyte-value";
    export { IfdShortValue } from "exif/ifd-value/ifd-short-value";
    export { IfdSingleValue } from "exif/ifd-value/ifd-single-value";
    export { IfdSLongValue } from "exif/ifd-value/ifd-slong-value";
    export { IfdSRationalValue } from "exif/ifd-value/ifd-srational-value";
    export { IfdSShortValue } from "exif/ifd-value/ifd-sshort-value";
    export { IfdUndefinedValue } from "exif/ifd-value/ifd-undefined-value";
    export { IfdValue } from "exif/ifd-value/ifd-value";
    export { ExifData } from "exif/exif-data";
    export { ExifEntry } from "exif/exif-entry";
    export { ExifTag, ExifTagInitOptions, ExifGpsTags, ExifImageTags, ExifInteropTags, ExifTagNameToID, } from "exif/exif-tag";
    export { IfdContainer } from "exif/ifd-container";
    export { IfdDirectory } from "exif/ifd-directory";
    export { IfdValueType, IfdValueTypeSize, getIfdValueTypeSize, getIfdValueTypeString, } from "exif/ifd-value-type";
    export { DitherKernel, DitherKernels } from "filter/dither-kernel";
    export { Filter, AdjustColorOptions, BillboardOptions, BleachBypassOptions, BulgeDistortionOptions, BumpToNormalOptions, ChromaticAberrationOptions, ColorHalftone, ColorOffsetOptions, ContrastOptions, ConvolutionOptions, CopyImageChannelsOptions, DitherImageOptions, DotScreenOptions, DropShadowOptions, EdgeGlowOptions, EmbossOptions, GammaOptions, GaussianBlurOptions, GrayscaleOptions, HdrToLdrOptions, HexagonPixelateOptions, InvertOptions, LuminanceThresholdOptions, MonochromeOptions, NoiseOptions, NormalizeOptions, PixelateOptions, QuantizeOptions, ReinhardToneMapOptions, RemapColorsOptions, ScaleRgbaOptions, SeparableConvolutionOptions, SepiaOptions, SketchOptions, SmoothOptions, SobelOptions, StretchDistortionOptions, VignetteOptions, } from "filter/filter";
    export { NoiseType } from "filter/noise-type";
    export { PixelateMode } from "filter/pixelate-mode";
    export { QuantizeMethod } from "filter/quantize-method";
    export { SeparableKernel, SeparableKernelApplyOptions, } from "filter/separable-kernel";
    export { BmpCompressionMode } from "formats/bmp/bmp-compression-mode";
    export { BmpFileHeader } from "formats/bmp/bmp-file-header";
    export { BmpInfo } from "formats/bmp/bmp-info";
    export { GifColorMap } from "formats/gif/gif-color-map";
    export { GifImageDesc } from "formats/gif/gif-image-desc";
    export { GifInfo, GifInfoInitOptions } from "formats/gif/gif-info";
    export { IcoBmpInfo } from "formats/ico/ico-bmp-info";
    export { IcoInfoImage, IcoInfoImageInitOptions, } from "formats/ico/ico-info-image";
    export { IcoInfo } from "formats/ico/ico-info";
    export { IcoType, IcoTypeLength } from "formats/ico/ico-type";
    export { HuffmanNode } from "formats/jpeg/huffman-node";
    export { HuffmanParent } from "formats/jpeg/huffman-parent";
    export { HuffmanValue } from "formats/jpeg/huffman-value";
    export { JpegAdobe } from "formats/jpeg/jpeg-adobe";
    export { JpegComponentData } from "formats/jpeg/jpeg-component-data";
    export { JpegComponent } from "formats/jpeg/jpeg-component";
    export { JpegData } from "formats/jpeg/jpeg-data";
    export { JpegFrame } from "formats/jpeg/jpeg-frame";
    export { JpegHuffman } from "formats/jpeg/jpeg-huffman";
    export { JpegInfo } from "formats/jpeg/jpeg-info";
    export { JpegJfif } from "formats/jpeg/jpeg-jfif";
    export { JpegMarker } from "formats/jpeg/jpeg-marker";
    export { JpegQuantize } from "formats/jpeg/jpeg-quantize";
    export { JpegScan } from "formats/jpeg/jpeg-scan";
    export { JpegUtils } from "formats/jpeg/jpeg-utils";
    export { PngBlendMode } from "formats/png/png-blend-mode";
    export { PngColorType } from "formats/png/png-color-type";
    export { PngDisposeMode } from "formats/png/png-dispose-mode";
    export { PngFilterType } from "formats/png/png-filter-type";
    export { PngFrame, PngFrameInitOptions } from "formats/png/png-frame";
    export { PngInfo, PngInfoInitOptions } from "formats/png/png-info";
    export { TgaImageType, TgaImageTypeLength } from "formats/tga/tga-image-type";
    export { TgaInfo, TgaInfoInitOptions } from "formats/tga/tga-info";
    export { TiffBitReader } from "formats/tiff/tiff-bit-reader";
    export { TiffCompression } from "formats/tiff/tiff-compression";
    export { TiffEntry, TiffEntryInitOptions } from "formats/tiff/tiff-entry";
    export { TiffFaxDecoder, TiffFaxDecoderInitOptions, } from "formats/tiff/tiff-fax-decoder";
    export { TiffFormat } from "formats/tiff/tiff-format";
    export { TiffImageType } from "formats/tiff/tiff-image-type";
    export { TiffImage } from "formats/tiff/tiff-image";
    export { TiffInfo, TiffInfoInitOptions } from "formats/tiff/tiff-info";
    export { LzwDecoder } from "formats/tiff/tiff-lzw-decoder";
    export { TiffPhotometricType, TiffPhotometricTypeLength, } from "formats/tiff/tiff-photometric-type";
    export { BmpDecoder } from "formats/bmp-decoder";
    export { BmpEncoder } from "formats/bmp-encoder";
    export { DecodeInfo } from "formats/decode-info";
    export { Decoder } from "formats/decoder";
    export { DibDecoder } from "formats/dib-decoder";
    export { Encoder } from "formats/encoder";
    export { GifDecoder } from "formats/gif-decoder";
    export { GifEncoder, GifEncoderInitOptions } from "formats/gif-encoder";
    export { IcoDecoder } from "formats/ico-decoder";
    export { IcoEncoder } from "formats/ico-encoder";
    export { JpegDecoder } from "formats/jpeg-decoder";
    export { JpegEncoder } from "formats/jpeg-encoder";
    export { PngDecoder } from "formats/png-decoder";
    export { PngEncoder, PngEncoderInitOptions } from "formats/png-encoder";
    export { TgaDecoder } from "formats/tga-decoder";
    export { TgaEncoder } from "formats/tga-encoder";
    export { TiffDecoder } from "formats/tiff-decoder";
    export { TiffEncoder } from "formats/tiff-encoder";
    export { WinEncoder } from "formats/win-encoder";
    export { FrameType } from "image/frame-type";
    export { HeapNode } from "image/heap-node";
    export { IccProfile } from "image/icc-profile";
    export { IccProfileCompression } from "image/icc-profile-compression";
    export { MemoryImageDataFloat16 } from "image/image-data-float16";
    export { MemoryImageDataFloat32 } from "image/image-data-float32";
    export { MemoryImageDataFloat64 } from "image/image-data-float64";
    export { MemoryImageDataInt8 } from "image/image-data-int8";
    export { MemoryImageDataInt16 } from "image/image-data-int16";
    export { MemoryImageDataInt32 } from "image/image-data-int32";
    export { MemoryImageDataUint1 } from "image/image-data-uint1";
    export { MemoryImageDataUint2 } from "image/image-data-uint2";
    export { MemoryImageDataUint4 } from "image/image-data-uint4";
    export { MemoryImageDataUint8 } from "image/image-data-uint8";
    export { MemoryImageDataUint16 } from "image/image-data-uint16";
    export { MemoryImageDataUint32 } from "image/image-data-uint32";
    export { MemoryImageData } from "image/image-data";
    export { ImageUtils } from "image/image-utils";
    export { MemoryImage, MemoryImageCloneOptions, MemoryImageColorExtremes, MemoryImageConvertOptions, MemoryImageCreateOptions, MemoryImageFromBytesOptions, } from "image/image";
    export { NeuralQuantizer } from "image/neural-quantizer";
    export { OctreeNode } from "image/octree-node";
    export { OctreeQuantizer } from "image/octree-quantizer";
    export { PaletteFloat16 } from "image/palette-float16";
    export { PaletteFloat32 } from "image/palette-float32";
    export { PaletteFloat64 } from "image/palette-float64";
    export { PaletteInt8 } from "image/palette-int8";
    export { PaletteInt16 } from "image/palette-int16";
    export { PaletteInt32 } from "image/palette-int32";
    export { PaletteUint8 } from "image/palette-uint8";
    export { PaletteUint16 } from "image/palette-uint16";
    export { PaletteUint32 } from "image/palette-uint32";
    export { Palette } from "image/palette";
    export { PixelFloat16 } from "image/pixel-float16";
    export { PixelFloat32 } from "image/pixel-float32";
    export { PixelFloat64 } from "image/pixel-float64";
    export { PixelInt8 } from "image/pixel-int8";
    export { PixelInt16 } from "image/pixel-int16";
    export { PixelInt32 } from "image/pixel-int32";
    export { PixelUint1 } from "image/pixel-uint1";
    export { PixelUint2 } from "image/pixel-uint2";
    export { PixelUint4 } from "image/pixel-uint4";
    export { PixelUint8 } from "image/pixel-uint8";
    export { PixelUint16 } from "image/pixel-uint16";
    export { PixelUint32 } from "image/pixel-uint32";
    export { PixelUndefined } from "image/pixel-undefined";
    export { PixelRangeIterator } from "image/pixel-range-iterator";
    export { Pixel, UndefinedPixel } from "image/pixel";
    export { QuantizerType } from "image/quantizer-type";
    export { Quantizer } from "image/quantizer";
    export { FlipDirection } from "transform/flip-direction";
    export { Transform, CopyCropCircleOptions, CopyCropOptions, CopyRectifyOptions, CopyResizeCropSquareOptions, CopyResizeOptionsUsingHeight, CopyResizeOptionsUsingWidth, CopyRotateOptions, FlipOptions, TransformOptions, TrimOptions, } from "transform/transform";
    export { TrimMode } from "transform/trim-mode";
    export { TrimSide } from "transform/trim-side";
    export interface DecodeOptions {
        data: TypedArray;
    }
    export interface DecodeImageOptions extends DecodeOptions {
        frame?: number;
    }
    export interface DecodeNamedImageOptions extends DecodeImageOptions {
        name: string;
    }
    export interface EncodeOptions {
        image: MemoryImage;
    }
    export interface EncodeNamedImageOptions extends EncodeOptions {
        name: string;
    }
    export interface EncodeJpgOptions extends EncodeOptions {
        quality?: number;
    }
    export interface InjectJpgExifOptions extends DecodeOptions {
        exifData: ExifData;
    }
    export interface EncodeAnimatedOptions extends EncodeOptions {
        singleFrame?: boolean;
    }
    export interface EncodePngOptions extends EncodeAnimatedOptions {
        level?: CompressionLevel;
        filter?: PngFilterType;
    }
    export interface EncodeGifOptions extends EncodeAnimatedOptions {
        repeat?: number;
        samplingFactor?: number;
        dither?: DitherKernel;
        ditherSerpentine?: boolean;
    }
    export interface EncodeIcoImagesOptions {
        images: MemoryImage[];
    }
    /**
     * Return the Decoder that can decode image with the given **name**,
     * by looking at the file extension.
     */
    export function findDecoderForNamedImage(name: string): Decoder | undefined;
    /**
     * Return the Encoder that can decode image with the given **name**,
     * by looking at the file extension.
     */
    export function findEncoderForNamedImage(name: string): Encoder | undefined;
    /**
     * Find a Decoder that is able to decode the given image **data**.
     * Use this is you don't know the type of image it is.
     *
     * **WARNING:** Since this will check the image data against all known decoders,
     * it is much slower than using an explicit decoder.
     */
    export function findDecoderForData(data: TypedArray): Decoder | undefined;
    /**
     * Decode the given image file bytes by first identifying the format of the
     * file and using that decoder to decode the file into a single frame MemoryImage.
     *
     * **WARNING:** Since this will check the image data against all known decoders,
     * it is much slower than using an explicit decoder.
     */
    export function decodeImage(opt: DecodeImageOptions): MemoryImage | undefined;
    /**
     * Decodes the given image file bytes, using the filename extension to
     * determine the decoder.
     */
    export function decodeNamedImage(opt: DecodeNamedImageOptions): MemoryImage | undefined;
    /**
     * Encode the MemoryImage to the format determined by the file extension of **name**.
     * If a format wasn't able to be identified, undefined will be returned.
     * Otherwise the encoded format bytes of the image will be returned.
     */
    export function encodeNamedImage(opt: EncodeNamedImageOptions): Uint8Array | undefined;
    /**
     * Decode a JPG formatted image.
     */
    export function decodeJpg(opt: DecodeOptions): MemoryImage | undefined;
    /**
     * Encode an image to the JPEG format.
     */
    export function encodeJpg(opt: EncodeJpgOptions): Uint8Array;
    /**
     * Decode only the ExifData from a JPEG file, returning undefined if it was
     * unable to.
     */
    export function decodeJpgExif(opt: DecodeOptions): ExifData | undefined;
    /**
     * Inject ExifData into a JPEG file, replacing any existing EXIF data.
     * The new JPEG file bytes will be returned, otherwise undefined if there was an
     * issue.
     */
    export function injectJpgExif(opt: InjectJpgExifOptions): Uint8Array | undefined;
    /**
     * Decode a PNG formatted image.
     */
    export function decodePng(opt: DecodeImageOptions): MemoryImage | undefined;
    /**
     * Encode an image to the PNG format.
     */
    export function encodePng(opt: EncodePngOptions): Uint8Array;
    /**
     * Decode a Targa formatted image.
     */
    export function decodeTga(opt: DecodeImageOptions): MemoryImage | undefined;
    /**
     * Encode an image to the Targa format.
     */
    export function encodeTga(opt: EncodeOptions): Uint8Array;
    /**
     * Decode a GIF formatted image (first frame for animations).
     */
    export function decodeGif(opt: DecodeImageOptions): MemoryImage | undefined;
    /**
     * Encode an image to the GIF format.
     *
     * The **samplingFactor** specifies the sampling factor for
     * image quantization. It is responsible for reducing
     * the amount of unique colors in your images to 256.
     * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
     * a sampling factor of 10 gives you a reasonable trade-off between
     * image quality and quantization speed.
     * If you know that you have less than 256 colors in your frames
     * anyway, you should supply a very large **samplingFactor** for maximum performance.
     */
    export function encodeGif(opt: EncodeGifOptions): Uint8Array;
    /**
     * Decode a TIFF formatted image.
     */
    export function decodeTiff(opt: DecodeImageOptions): MemoryImage | undefined;
    /**
     * Encode an image to the TIFF format.
     */
    export function encodeTiff(opt: EncodeAnimatedOptions): Uint8Array;
    /**
     * Decode a BMP formatted image.
     */
    export function decodeBmp(opt: DecodeOptions): MemoryImage | undefined;
    /**
     * Encode an image to the BMP format.
     */
    export function encodeBmp(opt: EncodeOptions): Uint8Array;
    /**
     * Decode an ICO image.
     */
    export function decodeIco(opt: DecodeImageOptions): MemoryImage | undefined;
    /**
     * Encode an image to the ICO format.
     */
    export function encodeIco(opt: EncodeAnimatedOptions): Uint8Array;
    /**
     * Encode a list of images to the ICO format.
     */
    export function encodeIcoImages(opt: EncodeIcoImagesOptions): Uint8Array;
}
