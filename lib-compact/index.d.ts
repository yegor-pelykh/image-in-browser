declare module "common/frame-type" {
    /** @format */
    export enum FrameType {
        /**
         * The frames of this document are to be interpreted as animation.
         */
        animation = 0,
        /**
         * The frames of this document are to be interpreted as pages of a document.
         */
        page = 1
    }
}
declare module "common/iccp-compression-mode" {
    /** @format */
    export enum ICCPCompressionMode {
        none = 0,
        deflate = 1
    }
}
declare module "error/image-error" {
    /** @format */
    /**
     * An Error thrown when there was a problem in the image library.
     */
    export class ImageError extends Error {
        toString(): string;
    }
}
declare module "common/typings" {
    /** @format */
    export type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array;
    export type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';
    export type CompressionLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined;
}
declare module "common/array-utils" {
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
        static setRange<T extends TypedArray>(to: T, start: number, end: number, from: T, skipCount?: number): void;
    }
}
declare module "common/icc-profile-data" {
    import { ICCPCompressionMode } from "common/iccp-compression-mode";
    /**
     * ICC Profile data stored with an image.
     */
    export class ICCProfileData {
        private _name;
        get name(): string;
        private _compression;
        get compression(): ICCPCompressionMode;
        private _data;
        get data(): Uint8Array;
        constructor(name: string, compression: ICCPCompressionMode, data: Uint8Array);
        static from(other: ICCProfileData): ICCProfileData;
        /**
         * Returns the compressed data of the ICC Profile, compressing the stored data as necessary.
         */
        compressed(): Uint8Array;
        /**
         * Returns the uncompressed data of the ICC Profile, decompressing the stored data as necessary.
         */
        decompressed(): Uint8Array;
    }
}
declare module "common/rgb-channel-set" {
    /** @format */
    export enum RgbChannelSet {
        rgb = 0,
        rgba = 1
    }
}
declare module "common/dispose-mode" {
    /** @format */
    export enum DisposeMode {
        /**
         * When drawing a frame, the canvas should be left as it is.
         */
        none = 0,
        /**
         * When drawing a frame, the canvas should be cleared first.
         */
        clear = 1,
        /**
         * When drawing this frame, the canvas should be reverted to how it was before drawing it.
         */
        previous = 2
    }
}
declare module "common/blend-mode" {
    /** @format */
    export enum BlendMode {
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
declare module "common/color-model" {
    /** @format */
    export enum ColorModel {
        argb = 0,
        abgr = 1,
        rgba = 2,
        bgra = 3,
        rgb = 4,
        bgr = 5,
        luminance = 6
    }
}
declare module "common/interpolation" {
    /** @format */
    export enum Interpolation {
        nearest = 0,
        linear = 1,
        cubic = 2,
        average = 3
    }
}
declare module "common/bit-operators" {
    /** @format */
    export abstract class BitOperators {
        private static readonly uint8arr;
        private static readonly uint8ToInt8arr;
        private static readonly int8arr;
        private static readonly int8ToUint8arr;
        private static readonly uint16arr;
        private static readonly uint16ToInt16arr;
        private static readonly int16arr;
        private static readonly int16ToUint16arr;
        private static readonly uint32arr;
        private static readonly uint32ToInt32arr;
        private static readonly int32arr;
        private static readonly int32ToUint32arr;
        private static readonly uint32ToFloat32arr;
        private static readonly uint64arr;
        private static readonly uint64ToFloat64arr;
        static signed(bits: number, value: number): number;
        static shiftR(v: number, n: number): number;
        static shiftL(v: number, n: number): number;
        /**
         * Binary conversion to an int8. This is equivalent in C to
         * typecasting to a char.
         */
        static toInt8(d: number): number;
        /**
         * Binary conversion to an uint8. This is equivalent in C to
         * typecasting to an unsigned char.
         */
        static toUint8(d: number): number;
        /**
         * Binary conversion to an int16. This is equivalent in C to
         * typecasting to a short.
         */
        static toInt16(d: number): number;
        /**
         * Binary conversion to an uint16. This is equivalent in C to
         * typecasting to an unsigned short.
         */
        static toUint16(d: number): number;
        /**
         * Binary conversion to an int32. This is equivalent in C to
         * typecasting to signed int.
         */
        static toInt32(d: number): number;
        /**
         * Binary conversion of an int32 to a uint32. This is equivalent in C to
         * typecasting to unsigned int.
         */
        static toUint32(d: number): number;
        /**
         * Binary conversion to a float32. This is equivalent in C to
         * typecasting to float.
         */
        static toFloat32(d: number): number;
        /**
         * Binary conversion to a float64. This is equivalent in C to
         * typecasting to double.
         */
        static toFloat64(d: bigint): number;
        static debugBits32(value?: number): string;
    }
}
declare module "common/color-channel" {
    /** @format */
    export enum ColorChannel {
        /**
         * Red channel of a color.
         */
        red = 0,
        /**
         * Green channel of a color.
         */
        green = 1,
        /**
         * Blue channel of a color.
         */
        blue = 2,
        /**
         * Alpha channel of a color.
         */
        alpha = 3,
        /**
         * Luminance (brightness) of a color.
         */
        luminance = 4
    }
}
declare module "common/math-operators" {
    /** @format */
    export abstract class MathOperators {
        /**
         * Returns the greatest common divisor of **x** and **y**.
         */
        static gcd(x: number, y: number): number;
        /**
         * Clamp **num** to [**low**, **high**]
         */
        static clamp(num: number, low: number, high: number): number;
        /**
         * Clamp **num** to [**a**, **b**] and truncate
         */
        static clampInt(num: number, low: number, high: number): number;
        /**
         * Clamp **num** to [**0**, **255**]
         */
        static clampInt255(num: number): number;
    }
}
declare module "common/color" {
    import { ColorChannel } from "common/color-channel";
    /**
     * Image pixel colors are instantiated as an int object rather than an instance
     * of the Color class in order to reduce object allocations.
     */
    export abstract class Color {
        /**
         * Create a color value from RGB values in the range [**0**, **255**].
         *
         * The channel order of a uint32 encoded color is BGRA.
         */
        static fromRgb(red: number, green: number, blue: number): number;
        /**
         * Create a color value from RGBA values in the range [**0**, **255**].
         *
         * The channel order of a uint32 encoded color is BGRA.
         */
        static fromRgba(red: number, green: number, blue: number, alpha: number): number;
        /**
         * Create a color value from HSL values in the range [**0**, **1**].
         */
        static fromHsl(hue: number, saturation: number, lightness: number): number;
        /**
         * Create a color value from HSV values in the range [**0**, **1**].
         */
        static fromHsv(hue: number, saturation: number, value: number): number;
        /**
         * Create a color value from XYZ values.
         */
        static fromXyz(x: number, y: number, z: number): number;
        /**
         * Create a color value from CIE-L*a*b values.
         */
        static fromLab(L: number, a: number, b: number): number;
        /**
         * Compare colors from a 3 or 4 dimensional color space
         */
        static distance(c1: number[], c2: number[], compareAlpha: boolean): number;
        /**
         * Returns a new color of **src** alpha-blended onto **dst**. The opacity of **src**
         * is additionally scaled by **fraction** / **255**.
         */
        static alphaBlendColors(dst: number, src: number, fraction?: number): number;
        /**
         * Get the **channel** from the **color**.
         */
        static getChannel(color: number, channel: ColorChannel): number;
        /**
         * Get the alpha channel from the **color**.
         */
        static getAlpha(color: number): number;
        /**
         * Get the blue channel from the **color**.
         */
        static getBlue(color: number): number;
        /**
         * Get the color with the given **r**, **g**, **b**, and **a** components.
         * The channel order of a uint32 encoded color is RGBA.
         */
        static getColor(r: number, g: number, b: number, a?: number): number;
        /**
         * Get the green channel from the **color**.
         */
        static getGreen(color: number): number;
        /**
         * Returns the luminance (grayscale) value of the **color**.
         */
        static getLuminance(color: number): number;
        /**
         * Returns the luminance (grayscale) value of the color.
         */
        static getLuminanceRgb(r: number, g: number, b: number): number;
        /**
         * Get the red channel from the **color**.
         */
        static getRed(color: number): number;
        /**
         * Check if **color** is white
         */
        static isBlack(color: number): boolean;
        /**
         * Check if **color** is white
         */
        static isWhite(color: number): boolean;
        /**
         * Returns a new color where the alpha channel of **color** has been replaced by **value**.
         */
        static setAlpha(color: number, value: number): number;
        /**
         * Returns a new color where the blue channel of **color** has been replaced by **value**.
         */
        static setBlue(color: number, value: number): number;
        /**
         * Returns a new color, where the given **color**'s **channel** has been
         * replaced with the given **value**.
         */
        static setChannel(color: number, channel: ColorChannel, value: number): number;
        /**
         * Returns a new color where the green channel of **color** has been replaced
         * by **value**.
         */
        static setGreen(color: number, value: number): number;
        /**
         * Returns a new color where the red channel of **color** has been replaced
         * by **value**.
         */
        static setRed(color: number, value: number): number;
        /**
         * Convert an HSL color to RGB, where h is specified in normalized degrees
         * [**0**, **1**] (where 1 is 360-degrees); s and l are in the range [**0**, **1**].
         * Returns a list [**r**, **g**, **b**] with values in the range [**0**, **255**].
         */
        static hslToRgb(hue: number, saturation: number, lightness: number): number[];
        /**
         * Convert an HSV color to RGB, where h is specified in normalized degrees
         * [**0**, **1**] (where 1 is 360-degrees); s and l are in the range [**0**, **1**].
         * Returns a list [**r**, **g**, **b**] with values in the range [**0**, **255**].
         */
        static hsvToRgb(hue: number, saturation: number, brightness: number): number[];
        /**
         * Convert an RGB color to HSL, where **r**, **g** and **b** are in the range [**0**, **255**].
         * Returns a list [**h**, **s**, **l**] with values in the range [**0**, **1**].
         */
        static rgbToHsl(r: number, g: number, b: number): number[];
        /**
         * Convert a CIE-L*a*b color to XYZ.
         */
        static labToXyz(l: number, a: number, b: number): number[];
        /**
         * Convert an XYZ color to RGB.
         */
        static xyzToRgb(x: number, y: number, z: number): number[];
        /**
         * Convert a CMYK color to RGB, where **c**, **m**, **y**, **k** values are in the range
         * [**0**, **255**]. Returns a list [**r**, **g**, **b**] with values in the range [**0**, **255**].
         */
        static cmykToRgb(c: number, m: number, y: number, k: number): number[];
        /**
         * Convert a CIE-L*a*b color to RGB.
         */
        static labToRgb(l: number, a: number, b: number): number[];
        /**
         * Convert a RGB color to XYZ.
         */
        static rgbToXyz(r: number, g: number, b: number): number[];
        /**
         * Convert a XYZ color to CIE-L*a*b.
         */
        static xyzToLab(x: number, y: number, z: number): number[];
        /**
         * Convert a RGB color to CIE-L*a*b.
         */
        static rgbToLab(r: number, g: number, b: number): number[];
    }
}
declare module "common/text-codec" {
    export abstract class TextCodec {
        static readonly utf8Decoder: TextDecoder;
        static readonly latin1Decoder: TextDecoder;
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
        constructor(options: InputBufferInitOptions);
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
         * Return a InputStream to read a subset of this stream. It does not
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
declare module "common/output-buffer" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export interface OutputBufferInitOptions {
        bigEndian?: boolean;
        size?: number;
    }
    export class OutputBuffer {
        private static readonly BLOCK_SIZE;
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
        constructor(options?: OutputBufferInitOptions);
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
         * Return the subarray of the buffer in the range **start**:**end**.
         * If **start** or **end** are < 0 then it is relative to the end of the buffer.
         * If **end** is not specified (or undefined), then it is the end of the buffer.
         * This is equivalent to the python list range operator.
         */
        subarray(start: number, end?: number): Uint8Array;
    }
}
declare module "common/rational" {
    export class Rational {
        private _numerator;
        get numerator(): number;
        private _denominator;
        get denominator(): number;
        get asInt(): number;
        get asDouble(): number;
        constructor(numerator: number, denominator: number);
        simplify(): void;
        equalsTo(other: unknown): boolean;
        toString(): string;
    }
}
declare module "exif/exif-value-type" {
    /** @format */
    export enum ExifValueType {
        none = 0,
        byte = 1,
        ascii = 2,
        short = 3,
        long = 4,
        rational = 5,
        sbyte = 6,
        undefined = 7,
        sshort = 8,
        slong = 9,
        srational = 10,
        single = 11,
        double = 12
    }
    export const ExifValueTypeString: string[];
    export const ExifValueTypeSize: number[];
    export function getExifValueTypeString(type: ExifValueType): string;
    export function getExifValueTypeSize(type: ExifValueType, length?: number): number;
}
declare module "exif/exif-value/exif-value" {
    /** @format */
    import { OutputBuffer } from "common/output-buffer";
    import { Rational } from "common/rational";
    import { ExifValueType } from "exif/exif-value-type";
    export abstract class ExifValue {
        get type(): ExifValueType;
        get length(): number;
        get dataSize(): number;
        get typeString(): string;
        toBool(_index?: number): boolean;
        toInt(_index?: number): number;
        toDouble(_index?: number): number;
        toRational(_index?: number): Rational;
        toString(): string;
        write(_out: OutputBuffer): void;
        setBool(_v: boolean, _index?: number): void;
        setInt(_v: number, _index?: number): void;
        setDouble(_v: number, _index?: number): void;
        setRational(_numerator: number, _denomitator: number, _index?: number): void;
        setString(_v: string): void;
        equalsTo(_other: ExifValue): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-entry" {
    /** @format */
    import { ExifValue } from "exif/exif-value/exif-value";
    export class ExifEntry {
        private readonly _tag;
        get tag(): number;
        private _value;
        get value(): ExifValue | undefined;
        set value(v: ExifValue | undefined);
        constructor(tag: number, value?: ExifValue);
    }
}
declare module "exif/exif-ifd-container" {
    /** @format */
    import { ExifIFD } from "exif/exif-ifd";
    export class ExifIFDContainer {
        protected directories: Map<string, ExifIFD>;
        get keys(): IterableIterator<string>;
        get values(): IterableIterator<ExifIFD>;
        get size(): number;
        get isEmpty(): boolean;
        constructor(directories?: Map<string, ExifIFD>);
        static from(other: ExifIFDContainer): ExifIFDContainer;
        has(key: string): boolean;
        get(ifdName: string): ExifIFD;
        set(ifdName: string, value: ExifIFD): void;
        clear(): void;
    }
}
declare module "exif/exif-tag" {
    /** @format */
    import { ExifValueType } from "exif/exif-value-type";
    export interface ExifTagInitOptions {
        name: string;
        type?: ExifValueType;
        count?: number;
    }
    export class ExifTag {
        private readonly _name;
        get name(): string;
        private readonly _type;
        get type(): ExifValueType;
        private _count;
        get count(): number;
        constructor(options: ExifTagInitOptions);
    }
    export const ExifTagNameToID: Map<string, number>;
    export const ExifImageTags: Map<number, ExifTag>;
    export const ExifInteropTags: Map<number, ExifTag>;
    export const ExifGpsTags: Map<number, ExifTag>;
}
declare module "exif/exif-value/exif-ascii-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifAsciiValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: number[] | string);
        static fromData(data: InputBuffer, length: number): ExifAsciiValue;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setString(v: string): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-byte-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifByteValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Uint8Array | number);
        static fromData(data: InputBuffer, offset?: number, length?: number): ExifByteValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-double-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifDoubleValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Float64Array | number);
        static fromData(data: InputBuffer, length: number): ExifDoubleValue;
        toDouble(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setDouble(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-long-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifLongValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Uint32Array | number);
        static fromData(data: InputBuffer, length: number): ExifLongValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-rational-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    import { Rational } from "common/rational";
    export class ExifRationalValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Rational[] | Rational);
        static fromData(data: InputBuffer, length: number): ExifRationalValue;
        static from(other: Rational): ExifRationalValue;
        toInt(index?: number): number;
        toDouble(index?: number): number;
        toRational(index?: number): Rational;
        toString(): string;
        write(out: OutputBuffer): void;
        setRational(numerator: number, denomitator: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-sbyte-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifSByteValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Int8Array | number);
        static fromData(data: InputBuffer, offset?: number, length?: number): ExifSByteValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-short-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifShortValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Uint16Array | number);
        static fromData(data: InputBuffer, length: number): ExifShortValue;
        toInt(index?: number): number;
        toString(): string;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-single-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifSingleValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Float32Array | number);
        static fromData(data: InputBuffer, length: number): ExifSingleValue;
        toDouble(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setDouble(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-slong-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifSLongValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Int32Array | number);
        static fromData(data: InputBuffer, length: number): ExifSLongValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-srational-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    import { Rational } from "common/rational";
    export class ExifSRationalValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Rational[] | Rational);
        static fromData(data: InputBuffer, length: number): ExifSRationalValue;
        static from(other: Rational): ExifSRationalValue;
        toInt(index?: number): number;
        toDouble(index?: number): number;
        toRational(index?: number): Rational;
        toString(): string;
        write(out: OutputBuffer): void;
        setRational(numerator: number, denomitator: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-sshort-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifSShortValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Int16Array | number);
        static fromData(data: InputBuffer, length: number): ExifSShortValue;
        toInt(index?: number): number;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        setInt(v: number, index?: number): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-value/exif-undefined-value" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifValue } from "exif/exif-value/exif-value";
    import { ExifValueType } from "exif/exif-value-type";
    export class ExifUndefinedValue extends ExifValue {
        private value;
        get type(): ExifValueType;
        get length(): number;
        constructor(value: Uint8Array | number);
        static fromData(data: InputBuffer, offset?: number, length?: number): ExifUndefinedValue;
        toData(): Uint8Array;
        toString(): string;
        write(out: OutputBuffer): void;
        equalsTo(other: unknown): boolean;
        clone(): ExifValue;
    }
}
declare module "exif/exif-ifd" {
    /** @format */
    import { Rational } from "common/rational";
    import { ExifIFDContainer } from "exif/exif-ifd-container";
    import { ExifValue } from "exif/exif-value/exif-value";
    export class ExifIFD {
        private readonly data;
        private readonly _sub;
        get sub(): ExifIFDContainer;
        get keys(): IterableIterator<number>;
        get values(): IterableIterator<ExifValue>;
        get size(): number;
        get isEmpty(): boolean;
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
        private setRational;
        static isArrayOfRationalNumbers(value: unknown): boolean;
        has(tag: number): boolean;
        getValue(tag: number | string): ExifValue | undefined;
        setValue(tag: number | string, value: number[][] | Rational[] | number[] | Rational | ExifValue | undefined): void;
    }
}
declare module "exif/exif-data" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { OutputBuffer } from "common/output-buffer";
    import { ExifIFD } from "exif/exif-ifd";
    import { ExifIFDContainer } from "exif/exif-ifd-container";
    import { ExifValue } from "exif/exif-value/exif-value";
    export class ExifData extends ExifIFDContainer {
        get imageIfd(): ExifIFD;
        get thumbnailIfd(): ExifIFD;
        get exifIfd(): ExifIFD;
        get gpsIfd(): ExifIFD;
        get interopIfd(): ExifIFD;
        private writeDirectory;
        private writeDirectoryLargeValues;
        private readEntry;
        static from(other: ExifData): ExifData;
        static fromInputBuffer(input: InputBuffer): ExifData;
        hasTag(tag: number): boolean;
        getTag(tag: number): ExifValue | undefined;
        getTagName(tag: number): string;
        write(out: OutputBuffer): void;
        read(block: InputBuffer): boolean;
        toString(): string;
    }
}
declare module "common/memory-image" {
    /** @format */
    import { ICCProfileData } from "common/icc-profile-data";
    import { RgbChannelSet } from "common/rgb-channel-set";
    import { DisposeMode } from "common/dispose-mode";
    import { BlendMode } from "common/blend-mode";
    import { ColorModel } from "common/color-model";
    import { Interpolation } from "common/interpolation";
    import { ExifData } from "exif/exif-data";
    export interface RgbMemoryImageInitOptions {
        width: number;
        height: number;
        exifData?: ExifData;
        iccProfile?: ICCProfileData;
        textData?: Map<string, string>;
    }
    export interface MemoryImageInitOptions extends RgbMemoryImageInitOptions {
        rgbChannelSet?: RgbChannelSet;
        data?: Uint32Array;
    }
    export interface MemoryImageInitOptionsColorModel {
        width: number;
        height: number;
        data: Uint8Array;
        rgbChannelSet?: RgbChannelSet;
        exifData?: ExifData;
        iccProfile?: ICCProfileData;
        textData?: Map<string, string>;
        colorModel?: ColorModel;
    }
    /**
     * An image buffer where pixels are encoded into 32-bit unsigned ints (Uint32).
     *
     * Pixels are stored in 32-bit unsigned integers in #AARRGGBB format.
     * You can use **getBytes** to access the pixel data at the byte (channel) level,
     * optionally providing the format to get the image data as. You can use the
     * letious color functions, such as **getRed**, **getGreen**, **getBlue**, and **getAlpha**
     * to access the individual channels of a given pixel color.
     *
     * If this image is a frame of an animation as decoded by the **decodeFrame**
     * method of **Decoder**, then the **xOffset**, **yOffset**, **width** and **height**
     * determine the area of the canvas this image should be drawn into,
     * as some frames of an animation only modify part of the canvas (recording
     * the part of the frame that actually changes). The **decodeAnimation** method
     * will always return the fully composed animation, so these coordinate
     * properties are not used.
     */
    export class MemoryImage {
        /**
         * Pixels are encoded into 4-byte Uint32 integers in #AABBGGRR channel order.
         */
        private readonly _data;
        get data(): Uint32Array;
        /**
         * x position at which to render the frame. This is used for frames
         * in an animation, such as from an animated GIF.
         */
        private _xOffset;
        get xOffset(): number;
        /**
         * y position at which to render the frame. This is used for frames
         * in an animation, such as from an animated GIF.
         */
        private _yOffset;
        get yOffset(): number;
        /**
         * How long this frame should be displayed, in milliseconds.
         * A duration of 0 indicates no delay and the next frame will be drawn
         * as quickly as it can.
         */
        private _duration;
        set duration(v: number);
        get duration(): number;
        /**
         * Defines what should be done to the canvas when drawing this frame
         *  in an animation.
         */
        private _disposeMethod;
        get disposeMethod(): DisposeMode;
        /**
         * Defines the blending method (alpha compositing) to use when drawing this
         * frame in an animation.
         */
        private _blendMethod;
        get blendMethod(): BlendMode;
        /**
         * The channels used by this image, indicating whether the alpha channel
         * is used or not. All images have an implicit alpha channel due to the
         * image data being stored in a Uint32, but some images, such as those
         * decoded from a Jpeg, don't use the alpha channel. This allows
         * image encoders that support both rgb and rgba formats, to know which
         * one it should use.
         */
        private _rgbChannelSet;
        get rgbChannelSet(): RgbChannelSet;
        /**
         * EXIF data decoded from an image file.
         */
        private _exifData;
        get exifData(): ExifData;
        set exifData(v: ExifData);
        /**
         * ICC color profile read from an image file.
         */
        private _iccProfile?;
        set iccProfile(v: ICCProfileData | undefined);
        get iccProfile(): ICCProfileData | undefined;
        /**
         * Some formats, like PNG, can encode and decode text data with the image.
         */
        private _textData?;
        get textData(): Map<string, string> | undefined;
        /**
         * Width of the image.
         */
        private readonly _width;
        get width(): number;
        /**
         * Height of the image.
         */
        private readonly _height;
        get height(): number;
        /**
         * The number of channels used by this Image. While all images
         * are stored internally with 4 bytes, some images, such as those
         * loaded from a Jpeg, don't use the 4th (alpha) channel.
         */
        get numberOfChannels(): number;
        /**
         * The size of the image buffer.
         */
        get length(): number;
        /**
         * Create an image with the given dimensions and format.
         */
        constructor(options: MemoryImageInitOptions);
        private static convertData;
        static rgb(options: RgbMemoryImageInitOptions): MemoryImage;
        static from(other: MemoryImage): MemoryImage;
        /**
         *
         * **format** defines the order of color channels in **data**.
         * The length of **data** should be (width * height) * format-byte-count,
         * where format-byte-count is 1, 3, or 4 depending on the number of
         * channels in the format (luminance, rgb, rgba, etc).
         *
         * The native format of an image is Format.rgba. If another format
         * is specified, the input data will be converted to rgba to store
         * in the Image.
         */
        static fromBytes(options: MemoryImageInitOptionsColorModel): MemoryImage;
        /**
         * Clone this image.
         * */
        clone(): MemoryImage;
        /**
         * Get the bytes from the image. You can use this to access the
         * color channels directly, or to pass it to something like an
         * Html canvas context.
         *
         * Specifying the **format** will convert the image data to the specified
         * format. Images are stored internally in Format.rgba format; any
         * other format will require a conversion.
         *
         * For example, given an Html Canvas, you could draw this image into the
         * canvas:
         * Html.ImageData d = context2D.createImageData(image.width, image.height);
         * d.data.setRange(0, image.length, image.getBytes(format: Format.rgba));
         * context2D.putImageData(data, 0, 0);
         */
        getBytes(colorModel?: ColorModel): Uint8Array;
        /**
         * Set all of the pixels of the image to the given **color**.
         */
        fill(color: number): MemoryImage;
        /**
         * Set all of the empty pixels (for png's) of the image to the given **color**.
         */
        fillBackground(color: number): void;
        /**
         * Add the colors of **other** to the pixels of this image.
         */
        addImage(other: MemoryImage): MemoryImage;
        /**
         * Subtract the colors of **other** from the pixels of this image.
         */
        subtractImage(other: MemoryImage): MemoryImage;
        /**
         * Multiply the colors of **other** with the pixels of this image.
         */
        multiplyImage(other: MemoryImage): MemoryImage;
        /**
         * OR the colors of **other** to the pixels of this image.
         */
        orImage(other: MemoryImage): MemoryImage;
        /**
         * AND the colors of **other** with the pixels of this image.
         */
        andImage(other: MemoryImage): MemoryImage;
        /**
         * Modula the colors of **other** with the pixels of this image.
         */
        modImage(other: MemoryImage): MemoryImage;
        /**
         * Get a pixel from the buffer. No range checking is done.
         */
        getPixelByIndex(index: number): number;
        /**
         * Set a pixel in the buffer. No range checking is done.
         */
        setPixelByIndex(index: number, color: number): void;
        /**
         * Get the buffer index for the **x**, **y** pixel coordinates.
         * No range checking is done.
         */
        getBufferIndex(x: number, y: number): number;
        /**
         * Is the given **x**, **y** pixel coordinates within the resolution of the image.
         */
        boundsSafe(x: number, y: number): boolean;
        /**
         * Get the pixel from the given **x**, **y** coordinate. Color is encoded in a
         * Uint32 as #AABBGGRR. No range checking is done.
         */
        getPixel(x: number, y: number): number;
        /**
         * Get the pixel from the given **x**, **y** coordinate. Color is encoded in a
         * Uint32 as #AABBGGRR. If the pixel coordinates are out of bounds, 0 is
         * returned.
         */
        getPixelSafe(x: number, y: number): number;
        /**
         * Get the pixel using the given **interpolation** type for non-integer pixel
         * coordinates.
         */
        getPixelInterpolate(fx: number, fy: number, interpolation?: Interpolation): number;
        /**
         * Get the pixel using linear interpolation for non-integer pixel
         * coordinates.
         */
        getPixelLinear(fx: number, fy: number): number;
        /**
         * Get the pixel using cubic interpolation for non-integer pixel
         * coordinates.
         */
        getPixelCubic(fx: number, fy: number): number;
        /**
         * Set the pixel at the given **x**, **y** coordinate to the **color**.
         * No range checking is done.
         */
        setPixel(x: number, y: number, color: number): void;
        /**
         * Set the pixel at the given **x**, **y** coordinate to the **color**.
         * If the pixel coordinates are out of bounds, nothing is done.
         */
        setPixelSafe(x: number, y: number, color: number): void;
        /**
         * Set the pixel at the given **x**, **y** coordinate to the color
         * **r**, **g**, **b**, **a**.
         *
         * This simply replaces the existing color, it does not do any alpha
         * blending. Use **drawPixel** for that. No range checking is done.
         */
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a?: number): void;
        /**
         * Return the average gray value of the image.
         */
        getWhiteBalance(asDouble?: boolean): number;
        /**
         * Find the minimum and maximum color value in the image.
         * Returns an object with **min** and **max** properties.
         */
        getColorExtremes(): {
            min: number;
            max: number;
        };
        addTextData(data: Map<string, string>): void;
    }
}
declare module "common/frame-animation" {
    /** @format */
    import { FrameType } from "common/frame-type";
    import { MemoryImage } from "common/memory-image";
    export interface FrameAnimationInitOptions {
        width?: number;
        height?: number;
        loopCount?: number;
        frameType?: FrameType;
    }
    /**
     * Stores multiple images, most often as the frames of an animation.
     *
     * Some formats support multiple images that are not
     * to be interpreted as animation, but rather multiple pages of a document.
     * The **FrameAnimation** container is still used to store the images for these files.
     * The **frameType** property is used to differentiate multi-page documents from
     * multi-frame animations, where it is set to **FrameType.page** for documents
     * and **FrameType.animation** for animated frames.
     *
     * All **Decoder** classes support decoding to an **FrameAnimation**, where the
     * **FrameAnimation** will only contain a single frame for single image formats
     * such as JPEG, or if the file doesn't contain any animation such as a single
     * image GIF. If you want to generically support both animated and non-animated
     * files, you can always decode to an animation and if the animation has only
     * a single frame, then it's a non-animated image.
     *
     * In some cases, the frames of the animation may only provide a portion of the
     * canvas, such as the case of animations encoding only the changing pixels
     * from one frame to the next. The **width** and **height** and **backgroundColor**
     * properties of the **FrameAnimation** provide information about the canvas that
     * contains the animation, and the **MemoryImage** frames provide information about
     * how to draw the particular frame, such as the area of the canvas to draw
     * into, and if the canvas should be cleared prior to drawing the frame.
     */
    export class FrameAnimation implements Iterable<MemoryImage> {
        /**
         * The canvas width for containing the animation.
         */
        private _width;
        get width(): number;
        /**
         * The canvas height for containing the animation.
         */
        private _height;
        get height(): number;
        /**
         * The suggested background color to clear the canvas with.
         */
        private _backgroundColor;
        get backgroundColor(): number;
        /**
         * How many times should the animation loop(0 means forever)?
         */
        private _loopCount;
        get loopCount(): number;
        /**
         * How should the frames be interpreted?  If **FrameType.animation**, the
         * frames are part of an animated sequence. If **FrameType.page**, the frames
         * are the pages of a document.
         */
        private _frameType;
        get frameType(): FrameType;
        /**
         * The frames of the animation.
         */
        private _frames;
        get frames(): MemoryImage[];
        /**
         * How many frames are in the animation?
         */
        get numFrames(): number;
        /**
         * The first frame of the animation.
         */
        get first(): MemoryImage;
        /**
         * The last frame of the animation.
         */
        get last(): MemoryImage;
        /**
         * Is the animation empty(no frames)?
         */
        get isEmpty(): boolean;
        /**
         * Returns true if there is at least one frame in the animation.
         */
        get isNotEmpty(): boolean;
        constructor(options?: FrameAnimationInitOptions);
        /**
         * Get the frame at the given **index**.
         */
        getFrame(index: number): MemoryImage;
        /**
         * Add a frame to the animation.
         */
        addFrame(image: MemoryImage): void;
        /**
         * Get the iterator for looping over the animation.
         */
        [Symbol.iterator](): Iterator<MemoryImage, MemoryImage, undefined>;
    }
}
declare module "error/not-implemented-error" {
    /** @format */
    /**
     * An error thrown when some functionality has not yet been implemented.
     */
    export class NotImplementedError extends Error {
        toString(): string;
    }
}
declare module "hdr/half" {
    /**
     * A 16-bit floating-point number, used by high-dynamic-range image formats
     * as a more efficient storage for floating-point values that don't require
     * full 32-bit precision. A list of Half floats can be stored in a **Uint16Array**,
     * and converted to a double using the **halfToDouble()** static method.
     *
     * This class is derived from the OpenEXR library.
     */
    export class Half {
        private static toFloatUint32;
        private static toFloatFloat32;
        private static eLut;
        private bits;
        constructor(bits: number);
        private static convert;
        private static halfToFloat;
        private static fromBits;
        static halfToDouble(bits: number): number;
        static doubleToHalf(n: number): number;
        /**
         * Returns +infinity.
         */
        static positiveInfinity(): Half;
        /**
         * Returns -infinity.
         */
        static negativeInfinity(): Half;
        /**
         * Returns a NAN with the bit pattern 0111111111111111.
         */
        static qNan(): Half;
        /**
         * Returns a NAN with the bit pattern 0111110111111111.
         */
        static sNan(): Half;
        toDouble(): number;
        /**
         * Unary minus
         */
        unaryMinus(): Half;
        /**
         * Addition operator for Half or num left operands.
         */
        add(other: Half | number): Half;
        /**
         * Subtraction operator for Half or num left operands.
         */
        subtract(other: Half | number): Half;
        /**
         * Multiplication operator for Half or num left operands.
         */
        multiply(other: Half | number): Half;
        /**
         * Division operator for Half or num left operands.
         */
        divide(other: Half | number): Half;
        /**
         * Round to n-bit precision (n should be between 0 and 10).
         * After rounding, the significand's 10-n least significant
         * bits will be zero.
         */
        round(n: number): Half;
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
         * Returns true if h is a NAN.
         */
        isNan(): boolean;
        /**
         * Returns true if h is a positive or a negative infinity.
         */
        isInfinity(): boolean;
        /**
         * Returns true if the sign bit of h is set (negative).
         */
        isNegative(): boolean;
        getBits(): number;
        setBits(bits: number): void;
    }
}
declare module "hdr/hdr-slice" {
    import { TypedArray } from "common/typings";
    export interface HdrSliceInitOptions {
        name: string;
        width: number;
        height: number;
        format: number;
        bitsPerSample: number;
        data?: TypedArray;
    }
    /**
     * A slice is the data for an image framebuffer for a single channel.
     */
    export class HdrSlice {
        static UINT: number;
        static INT: number;
        static FLOAT: number;
        private readonly _data;
        /**
         * **data** will be one of the type data lists, depending on the **type** and
         * **bitsPerSample**. 16-bit FLOAT slices will be stored in a **Uint16Array**.
         */
        get data(): TypedArray;
        private readonly _name;
        get name(): string;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        /**
         * Indicates the type of data stored by the slice, either **HdrSlice.INT**,
         * **HdrSlice.FLOAT**, or **HdrSlice.UINT**.
         */
        private readonly _format;
        get format(): number;
        /**
         * How many bits per sample, either 8, 16, 32, or 64.
         */
        private readonly _bitsPerSample;
        get bitsPerSample(): number;
        private get maxIntSize();
        /**
         * Does this channel store floating-point data?
         */
        get isFloat(): boolean;
        constructor(options: HdrSliceInitOptions);
        private static allocateDataForType;
        /**
         * Create a copy of the **other** HdrSlice.
         */
        static from(other: HdrSlice): HdrSlice;
        /**
         * Get the raw bytes of the data buffer.
         */
        getBytes(): Uint8Array;
        /**
         * Get the float value of the sample at the coordinates **x**,**y**.
         * **Half** samples are converted to double.
         */
        getFloat(x: number, y: number): number;
        /**
         * Set the float value of the sample at the coordinates **x**,**y** for
         * **FLOAT** slices.
         */
        setFloat(x: number, y: number, v: number): void;
        /**
         * Get the int value of the sample at the coordinates **x**,**y**.
         * An exception will occur if the slice stores FLOAT data.
         */
        getInt(x: number, y: number): number;
        /**
         * Set the int value of the sample at the coordinates **x**,**y** for **INT** and
         * **UINT** slices.
         */
        setInt(x: number, y: number, v: number): void;
    }
}
declare module "hdr/hdr-image" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { ExifData } from "exif/exif-data";
    import { HdrSlice } from "hdr/hdr-slice";
    /**
     * A high dynamic range RGBA image stored in 16-bit or 32-bit floating-point
     * channels.
     */
    export class HdrImage {
        /**
         * Red value of a sample
         */
        private static R;
        /**
         * Green value of a sample
         */
        private static G;
        /**
         * Blue value of a sample
         */
        private static B;
        /**
         * Alpha/opacity
         */
        private static A;
        /**
         * Distance of the front of a sample from the viewer
         */
        private static Z;
        private readonly _slices;
        get slices(): Map<string, HdrSlice>;
        private _red;
        get red(): HdrSlice | undefined;
        private _green;
        get green(): HdrSlice | undefined;
        private _blue;
        get blue(): HdrSlice | undefined;
        private _alpha;
        get alpha(): HdrSlice | undefined;
        private _depth;
        get depth(): HdrSlice | undefined;
        private _exifData;
        get exifData(): ExifData | undefined;
        set exifData(v: ExifData | undefined);
        /**
         * Does the image have any color channels?
         */
        get hasColor(): boolean;
        /**
         * Does the image have an alpha channel?
         */
        get hasAlpha(): boolean;
        /**
         * Does the image have a depth channel?
         */
        get hasDepth(): boolean;
        /**
         * The width of the framebuffer.
         */
        get width(): number;
        /**
         * The height of the framebuffer.
         */
        get height(): number;
        /**
         * The number of bits per sample.
         */
        get bitsPerSample(): number;
        get sampleFormat(): number;
        /**
         * The number of channels used by the image
         */
        get numberOfChannels(): number;
        /**
         * Create an RGB[A] image.
         */
        static create(width: number, height: number, channels: number, type: number, bitsPerSample: number): HdrImage;
        /**
         * Create a copy of the **other** HdrImage.
         */
        static from(other: HdrImage): HdrImage;
        /**
         * Create an HDR image from a LDR **MemoryImage** by transforming the channel values
         * to the range [**0**, **1**].
         */
        static fromImage(other: MemoryImage, type?: number, bitsPerSample?: number): HdrImage;
        /**
         * Get the value of the red channel at the given pixel coordinates **x**, **y**.
         */
        getRed(x: number, y: number): number;
        /**
         * Set the value of the red channel at the given pixel coordinates **x**, **y**.
         */
        setRed(x: number, y: number, c: number): void;
        setRedInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the green channel at the given pixel coordinates **x**, **y**.
         */
        getGreen(x: number, y: number): number;
        /**
         * Set the value of the green channel at the given pixel coordinates **x**, **y**.
         */
        setGreen(x: number, y: number, c: number): void;
        setGreenInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the blue channel at the given pixel coordinates **x**, **y**.
         */
        getBlue(x: number, y: number): number;
        /**
         * Set the value of the blue channel at the given pixel coordinates **x**, **y**.
         */
        setBlue(x: number, y: number, c: number): void;
        setBlueInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the alpha channel at the given pixel coordinates **x**, **y**.
         */
        getAlpha(x: number, y: number): number;
        /**
         * Set the value of the alpha channel at the given pixel coordinates **x**, **y**.
         */
        setAlpha(x: number, y: number, c: number): void;
        setAlphaInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the depth channel at the given pixel coordinates **x**, **y**.
         */
        getDepth(x: number, y: number): number;
        /**
         * Set the value of the depth channel at the given pixel coordinates **x**, **y**.
         */
        setDepth(x: number, y: number, c: number): void;
        setDepthInt(x: number, y: number, c: number): void;
        /**
         * Does this image contain the given channel?
         */
        hasChannel(ch: string): boolean;
        /**
         * Access a framebuffer slice by name.
         */
        getChannel(ch: string): HdrSlice | undefined;
        /**
         * Add a channel **slice** to the
         */
        addChannel(slice: HdrSlice): void;
        /**
         * Convert the framebuffer to an floating-point image, as a sequence of
         * floats in RGBA order.
         */
        toFloatRgba(): Float32Array;
    }
}
declare module "formats/bmp/bitmap-file-header" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class BitmapFileHeader {
        static readonly BMP_HEADER_FILETYPE: number;
        private readonly _fileLength;
        get fileLength(): number;
        private _offset;
        set offset(v: number);
        get offset(): number;
        constructor(b: InputBuffer);
        static isValidFile(b: InputBuffer): boolean;
        toJson(): Map<string, number>;
    }
}
declare module "formats/decode-info" {
    /** @format */
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
        get backgroundColor(): number;
        /**
         * The number of frames that can be decoded.
         */
        get numFrames(): number;
    }
}
declare module "formats/bmp/bitmap-compression-mode" {
    /** @format */
    export enum BitmapCompressionMode {
        BI_BITFIELDS = 0,
        NONE = 1
    }
}
declare module "formats/bmp/bmp-info" {
    import { InputBuffer } from "common/input-buffer";
    import { DecodeInfo } from "formats/decode-info";
    import { BitmapCompressionMode } from "formats/bmp/bitmap-compression-mode";
    import { BitmapFileHeader } from "formats/bmp/bitmap-file-header";
    export class BmpInfo implements DecodeInfo {
        private readonly _width;
        get width(): number;
        protected readonly _height: number;
        get height(): number;
        private readonly _backgroundColor;
        get backgroundColor(): number;
        private readonly _numFrames;
        get numFrames(): number;
        private readonly _fileHeader;
        get fileHeader(): BitmapFileHeader;
        private readonly _headerSize;
        get headerSize(): number;
        private readonly _planes;
        get planes(): number;
        private readonly _bpp;
        get bpp(): number;
        private readonly _compression;
        get compression(): BitmapCompressionMode;
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
        private readonly _readBottomUp;
        get readBottomUp(): boolean;
        private _v5redMask?;
        get v5redMask(): number | undefined;
        private _v5greenMask?;
        get v5greenMask(): number | undefined;
        private _v5blueMask?;
        get v5blueMask(): number | undefined;
        private _v5alphaMask?;
        get v5alphaMask(): number | undefined;
        private _colorPalette?;
        get colorPalette(): number[] | undefined;
        get ignoreAlphaChannel(): boolean;
        constructor(p: InputBuffer, fileHeader?: BitmapFileHeader);
        private static intToCompressionMode;
        private compressionModeToString;
        private readPalette;
        private readRgba;
        decodeRgba(input: InputBuffer, pixel: (color: number) => void): void;
        toString(): string;
    }
}
declare module "formats/decoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { DecodeInfo } from "formats/decode-info";
    /**
     * Base class for image format decoders.
     *
     * Image pixels are stored as 32-bit unsigned ints, so all formats, regardless
     * of their encoded color resolutions, decode to 32-bit RGBA images. Encoders
     * can reduce the color resolution back down to their required formats.
     *
     * Some image formats support multiple frames, often for encoding animation.
     * In such cases, the **decodeImage** method will decode the first (or otherwise
     * specified with the **frame** parameter) frame of the file. **decodeAnimation**
     * will decode all frames from the image. **startDecode** will initiate
     * decoding of the file, and **decodeFrame** will then decode a specific frame
     * from the file, allowing for animations to be decoded one frame at a time.
     * Some formats, such as TIFF, may store multiple frames, but their use of
     * frames is for multiple page documents and not animation. The terms
     * 'animation' and 'frames' simply refer to 'pages' in this case.
     *
     * If an image file does not have multiple frames, **decodeAnimation** and
     * **startDecode** / **decodeFrame** will return the single image of the
     * file. As such, if you are not sure if a file is animated or not, you can
     * use the animated functions and process it as a single frame image if it
     * has only 1 frame, and as an animation if it has more than 1 frame.
     *
     * Most animated formats do not store full images for frames, but rather
     * some frames will store full images and others will store partial 'change'
     * images. For these files, **decodeAnimation** will always return all images
     * fully composited, meaning full frame images. Decoding frames individually
     * using **startDecode** and **decodeFrame** will return the potentially partial
     * image. In this case, the **DecodeInfo** returned by **startDecode** will include
     * the width and height resolution of the animation canvas, and each **MemoryImage**
     * returned by **decodeFrame** will have x, y, width and height properties
     * indicating where in the canvas the frame image should be drawn. It will
     * also have a disposeMethod property that specifies what should be done to
     * the canvas prior to drawing the frame: **DisposeMode.none** indicates the
     * canvas should be left alone; **DisposeMode.clear** indicates the canvas
     * should be cleared. For partial frame images,**DisposeMode.none** is used
     * so that the partial-frame is drawn on top of the previous frame, applying
     * it's changes to the image.
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
         * process the frames until they are requested with decodeFrame.
         */
        startDecode(bytes: Uint8Array): DecodeInfo | undefined;
        /**
         * Decode a single frame from the data that was set with **startDecode**.
         * If **frame** is out of the range of available frames, undefined is returned.
         * Non animated image files will only have **frame** 0. A **MemoryImage**
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(frame: number): MemoryImage | undefined;
        /**
         * Decode a single high dynamic range (HDR) frame from the data that was set
         * with **startDecode**. If the format of the file does not support HDR images,
         * the regular image will be converted to an HDR image as (color / 255).
         * If **frame** is out of the range of available frames, undefined is returned.
         * Non animated image files will only have **frame** 0. A **MemoryImage**
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeHdrFrame(frame: number): HdrImage | undefined;
        /**
         * Decode all of the frames from an animation. If the file is not an
         * animation, a single frame animation is returned. If there was a problem
         * decoding the file, undefined is returned.
         */
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified **frame** will be decoded. If there was a problem
         * decoding the file, undefined is returned.
         */
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        /**
         * Decode the file and extract a single High Dynamic Range (HDR) image from
         * it. HDR images are stored in floating-poing values. If the format of the
         * file does not support HDR images, the regular image will be converted to
         * an HDR image as (color / 255). If the file is animated, the specified
         * **frame** will be decoded. If there was a problem decoding the file, undefined is
         * returned.
         */
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/bmp-decoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { InputBuffer } from "common/input-buffer";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { BmpInfo } from "formats/bmp/bmp-info";
    import { Decoder } from "formats/decoder";
    export class BmpDecoder implements Decoder {
        protected input?: InputBuffer;
        protected info?: BmpInfo;
        get numFrames(): number;
        private pixelDataOffset;
        /**
         * Is the given file a valid BMP image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): BmpInfo | undefined;
        /**
         * Decode a single frame from the data stat was set with **startDecode**.
         * If **frame** is out of the range of available frames, undefined is returned.
         * Non animated image files will only have **frame** 0. An **AnimationFrame**
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(_: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        /**
         * Decode all of the frames from an animation. If the file is not an
         * animation, a single frame animation is returned. If there was a problem
         * decoding the file, undefined is returned.
         */
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified **frame** will be decoded. If there was a problem
         * decoding the file, undefined is returned.
         */
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/encoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    /**
     * Base class for image format encoders.
     */
    export interface Encoder {
        /**
         * Does this encoder support animation?
         */
        get supportsAnimation(): boolean;
        /**
         * Encode a single image.
         */
        encodeImage(image: MemoryImage): Uint8Array;
        /**
         * Encode an animation. Not all formats support animation, and undefined
         * will be returned if not.
         */
        encodeAnimation(animation: FrameAnimation): Uint8Array | undefined;
    }
}
declare module "formats/bmp-encoder" {
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode a BMP image.
     */
    export class BmpEncoder implements Encoder {
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        encodeImage(image: MemoryImage): Uint8Array;
        encodeAnimation(_: FrameAnimation): Uint8Array | undefined;
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
        equals(other: unknown): boolean;
    }
}
declare module "common/rectangle" {
    export class Rectangle {
        private _left;
        private _top;
        private _right;
        private _bottom;
        private _width;
        private _height;
        get left(): number;
        get top(): number;
        get right(): number;
        get bottom(): number;
        get width(): number;
        get height(): number;
        constructor(x1: number, y1: number, x2: number, y2: number);
        static fromXYWH(x: number, y: number, width: number, height: number): Rectangle;
        static from(other: Rectangle): Rectangle;
        private initialize;
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
declare module "transform/copy-resize-options" {
    /** @format */
    import { Interpolation } from "common/interpolation";
    import { MemoryImage } from "common/memory-image";
    export interface CopyResizeOptionsUsingWidth {
        image: MemoryImage;
        width: number;
        height?: number;
        interpolation?: Interpolation;
    }
    export interface CopyResizeOptionsUsingHeight {
        image: MemoryImage;
        height: number;
        width?: number;
        interpolation?: Interpolation;
    }
}
declare module "transform/copy-into-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface CopyIntoOptions {
        dst: MemoryImage;
        src: MemoryImage;
        dstX?: number;
        dstY?: number;
        srcX?: number;
        srcY?: number;
        srcW?: number;
        srcH?: number;
        blend?: boolean;
        center?: boolean;
    }
}
declare module "common/line" {
    export class Line {
        private _startX;
        private _startY;
        private _endX;
        private _endY;
        private _dx;
        private _dy;
        get startX(): number;
        get startY(): number;
        get endX(): number;
        get endY(): number;
        get dx(): number;
        get dy(): number;
        constructor(x1: number, y1: number, x2: number, y2: number);
        static from(other: Line): Line;
        private initialize;
        moveStart(x: number, y: number): void;
        moveEnd(x: number, y: number): void;
    }
}
declare module "draw/draw-image-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface DrawImageOptions {
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
        blend?: boolean;
    }
}
declare module "draw/draw-line-options" {
    /** @format */
    import { Line } from "common/line";
    import { MemoryImage } from "common/memory-image";
    export interface DrawLineOptions {
        image: MemoryImage;
        line: Line;
        color: number;
        antialias?: boolean;
        thickness?: number;
    }
}
declare module "draw/fill-flood-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface FillFloodOptions {
        src: MemoryImage;
        x: number;
        y: number;
        color: number;
        threshold?: number;
        compareAlpha?: boolean;
    }
}
declare module "draw/mask-flood-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface MaskFloodOptions {
        src: MemoryImage;
        x: number;
        y: number;
        threshold?: number;
        compareAlpha?: boolean;
        fillValue?: number;
    }
}
declare module "draw/draw" {
    import { MemoryImage } from "common/memory-image";
    import { Point } from "common/point";
    import { Rectangle } from "common/rectangle";
    import { DrawImageOptions } from "draw/draw-image-options";
    import { DrawLineOptions } from "draw/draw-line-options";
    import { FillFloodOptions } from "draw/fill-flood-options";
    import { MaskFloodOptions } from "draw/mask-flood-options";
    export abstract class Draw {
        private static readonly OUTCODE_INSIDE;
        private static readonly OUTCODE_LEFT;
        private static readonly OUTCODE_RIGHT;
        private static readonly OUTCODE_BOTTOM;
        private static readonly OUTCODE_TOP;
        /**
         * Calculate the pixels that make up the circumference of a circle on the
         * given **image**, centered at **center** and the given **radius**.
         *
         * The returned list of points is sorted, first by the x coordinate, and
         * second by the y coordinate.
         */
        private static calculateCircumference;
        /**
         * Compute the bit code for a point **p** using the clip rectangle **rect**
         */
        private static computeOutCode;
        /**
         * Clip a line to a rectangle using the Cohen–Sutherland clipping algorithm.
         * **line** is a **Line** object.
         * **rect** is a **Rectangle** object.
         * Results are stored in **line**.
         * If **line** falls completely outside of **rect**, false is returned, otherwise
         * true is returned.
         */
        private static clipLine;
        private static testPixelLabColorDistance;
        /**
         * Adam Milazzo (2015). A More Efficient Flood Fill.
         * http://www.adammil.net/blog/v126_A_More_Efficient_Flood_Fill.html
         */
        private static fill4;
        private static fill4Core;
        /**
         * Draw a circle into the **image** with a center of **center** and
         * the given **radius** and **color**.
         */
        static drawCircle(image: MemoryImage, center: Point, radius: number, color: number): MemoryImage;
        /**
         * Draw and fill a circle into the **image** with a **center**
         * and the given **radius** and **color**.
         *
         * The algorithm uses the same logic as **drawCircle** to calculate each point
         * around the circle's circumference. Then it iterates through every point,
         * finding the smallest and largest y-coordinate values for a given x-
         * coordinate.
         *
         * Once found, it draws a line connecting those two points. The circle is thus
         * filled one vertical slice at a time (each slice being 1-pixel wide).
         */
        static fillCircle(image: MemoryImage, center: Point, radius: number, color: number): MemoryImage;
        /**
         * Draw the image **src** onto the image **dst**.
         *
         * In other words, drawImage will take an rectangular area from **src** of
         * width **srcW** and height **srcH** at position (**srcX**,**srY**) and place it
         * in a rectangular area of **dst** of width **dstW** and height **dstH** at
         * position (**dstX**,**dstY**).
         *
         * If the source and destination coordinates and width and heights differ,
         * appropriate stretching or shrinking of the image fragment will be performed.
         * The coordinates refer to the upper left corner. This function can be used to
         * copy regions within the same image (if **dst** is the same as **src**)
         * but if the regions overlap the results will be unpredictable.
         */
        static drawImage(options: DrawImageOptions): MemoryImage;
        /**
         * Draw a line into **image**.
         *
         * If **antialias** is true then the line is drawn with smooth edges.
         * **thickness** determines how thick the line should be drawn, in pixels.
         */
        static drawLine(options: DrawLineOptions): MemoryImage;
        /**
         * Draw a single pixel into the image, applying alpha and opacity blending.
         */
        static drawPixel(image: MemoryImage, pos: Point, color: number, opacity?: number): MemoryImage;
        /**
         * Draw a rectangle in the image **dst** with the **color**.
         */
        static drawRect(dst: MemoryImage, rect: Rectangle, color: number): MemoryImage;
        /**
         * Fill the 4-connected shape containing **x**,**y** in the image **src** with the
         * given **color**.
         */
        static fillFlood(options: FillFloodOptions): MemoryImage;
        /**
         * Create a mask describing the 4-connected shape containing **x**,**y** in the
         * image **src**.
         */
        static maskFlood(options: MaskFloodOptions): Uint8Array;
        /**
         * Fill a rectangle in the image **src** with the given **color** with the
         * coordinates defined by **rect**.
         */
        static fillRect(src: MemoryImage, rect: Rectangle, color: number): MemoryImage;
        /**
         * Set all of the pixels of an **image** to the given **color**.
         */
        static fill(image: MemoryImage, color: number): MemoryImage;
    }
}
declare module "transform/image-transform" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { Point } from "common/point";
    import { Rectangle } from "common/rectangle";
    import { FlipDirection } from "transform/flip-direction";
    import { CopyResizeOptionsUsingHeight, CopyResizeOptionsUsingWidth } from "transform/copy-resize-options";
    import { CopyIntoOptions } from "transform/copy-into-options";
    import { Interpolation } from "common/interpolation";
    export abstract class ImageTransform {
        /**
         * Returns a copy of the **src** image, rotated by **angle** degrees.
         */
        static copyRotate(src: MemoryImage, angle: number, interpolation?: Interpolation): MemoryImage;
        /**
         * If **image** has an orientation value in its exif data, this will rotate the
         * image so that it physically matches its orientation. This can be used to
         * bake the orientation of the image for image formats that don't support exif
         * data.
         */
        static bakeOrientation(image: MemoryImage): MemoryImage;
        /**
         * Returns a resized copy of the **src** image.
         * If **height** isn't specified, then it will be determined by the aspect
         * ratio of **src** and **width**.
         * If **width** isn't specified, then it will be determined by the aspect ratio
         * of **src** and **height**.
         */
        static copyResize(options: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight): MemoryImage;
        /**
         * Returns a resized and square cropped copy of the **src** image of **size** size.
         */
        static copyResizeCropSquare(src: MemoryImage, size: number): MemoryImage;
        /**
         * Copies a rectangular portion of one image to another image. **dst** is the
         * destination image, **src** is the source image identifier.
         *
         * In other words, copyInto will take an rectangular area from **src** of
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
         * **dstX** and **dstY** represent the X and Y position where the **src** will start
         * printing.
         *
         * if **center** is true, the **src** will be centered in **dst**.
         */
        static copyInto(options: CopyIntoOptions): MemoryImage;
        /**
         * Returns a cropped copy of **src**.
         */
        static copyCrop(src: MemoryImage, x: number, y: number, w: number, h: number): MemoryImage;
        /**
         * Returns a round cropped copy of **src**.
         */
        static copyCropCircle(src: MemoryImage, radius?: number, center?: Point): MemoryImage;
        /**
         * Returns a copy of the **src** image, where the given rectangle
         * has been mapped to the full image.
         */
        static copyRectify(src: MemoryImage, rect: Rectangle, toImage?: MemoryImage): MemoryImage;
        /**
         * Flips the **src** image using the given **mode**, which can be one of:
         * **FlipDirection.horizontal**, **FlipDirection.vertical**, or **FlipDirection.both**.
         */
        static flip(src: MemoryImage, direction: FlipDirection): MemoryImage;
        /**
         * Flip the **src** image vertically.
         */
        static flipVertical(src: MemoryImage): MemoryImage;
        /**
         * Flip the src image horizontally.
         */
        static flipHorizontal(src: MemoryImage): MemoryImage;
    }
}
declare module "formats/gif/gif-color-map" {
    export interface GifColorMapInitOptions {
        numColors: number;
        bitsPerPixel?: number;
        colors?: Uint8Array;
        transparent?: number;
    }
    export class GifColorMap {
        private readonly _colors;
        get colors(): Uint8Array;
        private readonly _numColors;
        get numColors(): number;
        private readonly _bitsPerPixel;
        get bitsPerPixel(): number;
        private _transparent?;
        set transparent(v: number | undefined);
        get transparent(): number | undefined;
        constructor(options: GifColorMapInitOptions);
        private static bitSize;
        static from(other: GifColorMap): GifColorMap;
        getByte(index: number): number;
        setByte(index: number, value: number): number;
        getColor(index: number): number;
        setColor(index: number, r: number, g: number, b: number): void;
        getRed(color: number): number;
        getGreen(color: number): number;
        getBlue(color: number): number;
        getAlpha(color: number): number;
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
    import { DecodeInfo } from "formats/decode-info";
    import { GifColorMap } from "formats/gif/gif-color-map";
    import { GifImageDesc } from "formats/gif/gif-image-desc";
    export interface GifInfoInitOptions {
        width?: number;
        height?: number;
        backgroundColor?: number;
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
        get backgroundColor(): number;
        private _frames;
        get frames(): Array<GifImageDesc>;
        private _colorResolution;
        get colorResolution(): number;
        private _globalColorMap?;
        get globalColorMap(): GifColorMap | undefined;
        private _isGif89;
        get isGif89(): boolean;
        get numFrames(): number;
        constructor(options?: GifInfoInitOptions);
    }
}
declare module "formats/gif-decoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { Decoder } from "formats/decoder";
    import { GifInfo } from "formats/gif/gif-info";
    /**
     * A decoder for the GIF image format. This supports both single frame and
     * animated GIF files, and transparency.
     */
    export class GifDecoder implements Decoder {
        private static readonly STAMP_SIZE;
        private static readonly GIF87_STAMP;
        private static readonly GIF89_STAMP;
        private static readonly IMAGE_DESC_RECORD_TYPE;
        private static readonly EXTENSION_RECORD_TYPE;
        private static readonly TERMINATE_RECORD_TYPE;
        private static readonly GRAPHIC_CONTROL_EXT;
        private static readonly APPLICATION_EXT;
        private static readonly LZ_MAX_CODE;
        private static readonly LZ_BITS;
        private static readonly NO_SUCH_CODE;
        private static readonly CODE_MASKS;
        private static readonly INTERLACED_OFFSET;
        private static readonly INTERLACED_JUMP;
        private info?;
        private input?;
        private repeat;
        private buffer?;
        private stack;
        private suffix;
        private prefix?;
        private bitsPerPixel;
        private pixelCount?;
        private currentShiftDWord;
        private currentShiftState;
        private stackPtr;
        private currentCode?;
        private lastCode;
        private maxCode1;
        private runningBits;
        private runningCode;
        private eofCode;
        private clearCode;
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
         * the maximum possible if image O.k. - LZ_MAX_CODE times.
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
        private decodeFrameImage;
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
        /**
         * Is the given file a valid Gif image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        /**
         * Validate the file is a Gif image and get information about it.
         * If the file is not a valid Gif image, undefined is returned.
         */
        startDecode(bytes: Uint8Array): GifInfo | undefined;
        decodeFrame(frame: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        /**
         * Decode all of the frames of an animated gif. For single image gifs,
         * this will return an animation with a single frame.
         */
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "common/dither-kernel" {
    /** @format */
    export enum DitherKernel {
        None = 0,
        FalseFloydSteinberg = 1,
        FloydSteinberg = 2,
        Stucki = 3,
        Atkinson = 4
    }
}
declare module "common/quantizer" {
    /** @format */
    export interface Quantizer {
        /**
         * Find the index of the closest color to **c** in the **colorMap**.
         */
        getQuantizedColor(c: number): number;
    }
}
declare module "common/neural-quantizer" {
    import { MemoryImage } from "common/memory-image";
    import { Quantizer } from "common/quantizer";
    /**
     * Compute a color map with a given number of colors that best represents
     * the given image.
     */
    export class NeuralQuantizer implements Quantizer {
        private static readonly numCycles;
        private static readonly alphaBiasShift;
        private static readonly initAlpha;
        private static readonly radiusBiasShift;
        private static readonly radiusBias;
        private static readonly alphaRadiusBiasShift;
        private static readonly alphaRadiusBias;
        private static readonly radiusDec;
        private static readonly gamma;
        private static readonly beta;
        private static readonly betaGamma;
        private static readonly prime1;
        private static readonly prime2;
        private static readonly prime3;
        private static readonly prime4;
        private static readonly smallImageBytes;
        private readonly netIndex;
        private samplingFactor;
        private netSize;
        private specials;
        private bgColor;
        private cutNetSize;
        private maxNetPos;
        private initRadius;
        private initBiasRadius;
        private radiusPower;
        /**
         * The network itself
         */
        private network;
        private _colorMap8;
        get colorMap8(): Uint8Array;
        private _colorMap32;
        get colorMap32(): Int32Array;
        /**
         * Bias array for learning
         */
        private bias;
        private freq;
        /**
         * How many colors are in the **colorMap**?
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
        private copyColorMap;
        /**
         * Add an image to the quantized color table.
         */
        private addImage;
        /**
         * Search for BGR values 0..255 and return color index
         */
        private inxSearch;
        /**
         * Get a color from the **colorMap**.
         */
        color(index: number): number;
        /**
         * Find the index of the closest color to **c** in the **colorMap**.
         */
        lookup(c: number): number;
        /**
         * Find the index of the closest color to **r**,**g**,**b** in the **colorMap**.
         */
        lookupRGB(r: number, g: number, b: number): number;
        /**
         * Find the color closest to **c** in the **colorMap**.
         */
        getQuantizedColor(c: number): number;
        /**
         * Convert the **image** to an index map, mapping to this **colorMap**.
         */
        getIndexMap(image: MemoryImage): Uint8Array;
    }
}
declare module "common/dither-pixel" {
    /** @format */
    import { DitherKernel } from "common/dither-kernel";
    import { MemoryImage } from "common/memory-image";
    import { NeuralQuantizer } from "common/neural-quantizer";
    export abstract class DitherPixel {
        private static ditherKernels;
        static getDitherPixels(image: MemoryImage, quantizer: NeuralQuantizer, kernel: DitherKernel, serpentine: boolean): Uint8Array;
    }
}
declare module "formats/gif-encoder" {
    /** @format */
    import { DitherKernel } from "common/dither-kernel";
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { Encoder } from "formats/encoder";
    export interface GifEncoderInitOptions {
        delay?: number;
        repeat?: number;
        samplingFactor?: number;
        dither?: DitherKernel;
        ditherSerpentine?: boolean;
    }
    export class GifEncoder implements Encoder {
        private static readonly gif89Id;
        private static readonly imageDescRecordType;
        private static readonly extensionRecordType;
        private static readonly terminateRecordType;
        private static readonly applicationExt;
        private static readonly graphicControlExt;
        private static readonly eof;
        private static readonly bits;
        private static readonly hsize;
        private static readonly masks;
        private lastImage?;
        private lastImageDuration?;
        private lastColorMap?;
        private width;
        private height;
        private encodedFrames;
        private curAccum;
        private curBits;
        private nBits;
        private initBits;
        private EOFCode;
        private maxCode;
        private clearCode;
        private freeEnt;
        private clearFlag;
        private block;
        private blockSize;
        private outputBuffer?;
        private delay;
        private repeat;
        private samplingFactor;
        private dither;
        private ditherSerpentine;
        /**
         * Does this encoder support animation?
         */
        private readonly _supportsAnimation;
        get supportsAnimation(): boolean;
        constructor(options?: GifEncoderInitOptions);
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
        encodeImage(image: MemoryImage): Uint8Array;
        /**
         * Encode an animation.
         */
        encodeAnimation(animation: FrameAnimation): Uint8Array | undefined;
    }
}
declare module "formats/dib-decoder" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { BmpDecoder } from "formats/bmp-decoder";
    import { BmpInfo } from "formats/bmp/bmp-info";
    export class DibDecoder extends BmpDecoder {
        constructor(input: InputBuffer, info: BmpInfo);
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
        constructor(width: number, height: number, colorPalette: number, bytesSize: number, bytesOffset: number, colorPlanes: number, bitsPerPixel: number);
    }
}
declare module "formats/ico/ico-info" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { DecodeInfo } from "formats/decode-info";
    import { IcoInfoImage } from "formats/ico/ico-info-image";
    export class IcoInfo implements DecodeInfo {
        private readonly _type?;
        get type(): number | undefined;
        private readonly _images?;
        get images(): IcoInfoImage[] | undefined;
        private readonly _numFrames;
        get numFrames(): number;
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _backgroundColor;
        get backgroundColor(): number;
        constructor(numFrames: number, type?: number, images?: IcoInfoImage[]);
        static read(input: InputBuffer): IcoInfo | undefined;
    }
}
declare module "common/crc32" {
    /** @format */
    export interface Crc32Parameters {
        buffer: Uint8Array;
        baseCrc?: number;
        position?: number;
        length?: number;
    }
    export abstract class Crc32 {
        private static readonly crcTable;
        private static makeTable;
        static getChecksum(options: Crc32Parameters): number;
    }
}
declare module "formats/png/png-frame" {
    /** @format */
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
        static readonly APNG_DISPOSE_OP_NONE = 0;
        static readonly APNG_DISPOSE_OP_BACKGROUND = 1;
        static readonly APNG_DISPOSE_OP_PREVIOUS = 2;
        static readonly APNG_BLEND_OP_SOURCE = 0;
        static readonly APNG_BLEND_OP_OVER = 1;
        private readonly _fdat;
        get fdat(): number[];
        private _sequenceNumber?;
        get sequenceNumber(): number | undefined;
        private _width?;
        get width(): number | undefined;
        private _height?;
        get height(): number | undefined;
        private _xOffset?;
        get xOffset(): number | undefined;
        private _yOffset?;
        get yOffset(): number | undefined;
        private _delayNum?;
        get delayNum(): number | undefined;
        private _delayDen?;
        get delayDen(): number | undefined;
        private _dispose?;
        get dispose(): number | undefined;
        private _blend?;
        get blend(): number | undefined;
        get delay(): number;
        constructor(options: PngFrameInitOptions);
    }
}
declare module "formats/png/png-info" {
    /** @format */
    import { DecodeInfo } from "formats/decode-info";
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
        set width(v: number);
        get width(): number;
        private _height;
        set height(v: number);
        get height(): number;
        private _backgroundColor;
        set backgroundColor(v: number);
        get backgroundColor(): number;
        private _numFrames;
        set numFrames(v: number);
        get numFrames(): number;
        private _bits?;
        get bits(): number | undefined;
        private _colorType?;
        get colorType(): number | undefined;
        private _compressionMethod?;
        get compressionMethod(): number | undefined;
        private _filterMethod?;
        get filterMethod(): number | undefined;
        private _interlaceMethod?;
        get interlaceMethod(): number | undefined;
        private _palette?;
        set palette(v: Uint8Array | undefined);
        get palette(): Uint8Array | undefined;
        private _transparency?;
        set transparency(v: Uint8Array | undefined);
        get transparency(): Uint8Array | undefined;
        private _colorLut?;
        set colorLut(v: number[] | undefined);
        get colorLut(): number[] | undefined;
        private _gamma?;
        set gamma(v: number | undefined);
        get gamma(): number | undefined;
        private _iCCPName;
        set iCCPName(v: string);
        get iCCPName(): string;
        private _iCCPCompression;
        set iCCPCompression(v: number);
        get iCCPCompression(): number;
        private _iCCPData?;
        set iCCPData(v: Uint8Array | undefined);
        get iCCPData(): Uint8Array | undefined;
        private _textData;
        get textData(): Map<string, string>;
        private _repeat;
        set repeat(v: number);
        get repeat(): number;
        private readonly _idat;
        get idat(): number[];
        private readonly _frames;
        get frames(): PngFrame[];
        get isAnimated(): boolean;
        constructor(options?: PngInfoInitOptions);
    }
}
declare module "formats/png-decoder" {
    import { FrameAnimation } from "common/frame-animation";
    import { InputBuffer } from "common/input-buffer";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { DecodeInfo } from "formats/decode-info";
    import { Decoder } from "formats/decoder";
    import { PngInfo } from "formats/png/png-info";
    /**
     * Decode a PNG encoded image.
     */
    export class PngDecoder implements Decoder {
        private static readonly GRAYSCALE;
        private static readonly RGB;
        private static readonly INDEXED;
        private static readonly GRAYSCALE_ALPHA;
        private static readonly RGBA;
        private static readonly FILTER_NONE;
        private static readonly FILTER_SUB;
        private static readonly FILTER_UP;
        private static readonly FILTER_AVERAGE;
        private static readonly FILTER_PAETH;
        private _info?;
        get info(): PngInfo | undefined;
        private _input?;
        get input(): InputBuffer | undefined;
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
        private static convert16to8;
        private static convert1to8;
        private static convert2to8;
        private static convert4to8;
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
        /**
         * Get the color with the list of components.
         */
        private getColor;
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
        decodeHdrFrame(frame: number): HdrImage | undefined;
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/ico-decoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { InputBuffer } from "common/input-buffer";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { Decoder } from "formats/decoder";
    import { IcoInfo } from "formats/ico/ico-info";
    export class IcoDecoder implements Decoder {
        _input?: InputBuffer;
        _icoInfo?: IcoInfo;
        get numFrames(): number;
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): IcoInfo | undefined;
        decodeFrame(frame: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        decodeAnimation(_: Uint8Array): FrameAnimation | undefined;
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
        /**
         * Decodes the largest frame.
         */
        decodeImageLargest(bytes: Uint8Array): MemoryImage | undefined;
    }
}
declare module "formats/png-encoder" {
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { CompressionLevel } from "common/typings";
    import { Encoder } from "formats/encoder";
    export interface PngEncoderInitOptions {
        filter?: number;
        level?: CompressionLevel;
    }
    /**
     * Encode an image to the PNG format.
     */
    export class PngEncoder implements Encoder {
        private static readonly FILTER_NONE;
        private static readonly FILTER_SUB;
        private static readonly FILTER_UP;
        private static readonly FILTER_AVERAGE;
        private static readonly FILTER_PAETH;
        private static readonly FILTER_AGRESSIVE;
        private rgbChannelSet?;
        private filter;
        private level;
        private repeat;
        private xOffset;
        private yOffset;
        private delay?;
        private disposeMethod;
        private blendMethod;
        private width;
        private height;
        private frames;
        private sequenceNumber;
        private isAnimated;
        private output?;
        /**
         * Does this encoder support animation?
         */
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        constructor(options?: PngEncoderInitOptions);
        /**
         * Return the CRC of the bytes
         */
        private static crc;
        private static writeChunk;
        private static filterSub;
        private static filterUp;
        private static filterAverage;
        private static paethPredictor;
        private static filterPaeth;
        private static filterNone;
        private writeHeader;
        private writeICCPChunk;
        private writeAnimationControlChunk;
        private applyFilter;
        private writeFrameControlChunk;
        private writeTextChunk;
        addFrame(image: MemoryImage): void;
        finish(): Uint8Array | undefined;
        /**
         * Encode a single frame image.
         */
        encodeImage(image: MemoryImage): Uint8Array;
        /**
         * Encode an animation.
         */
        encodeAnimation(animation: FrameAnimation): Uint8Array | undefined;
    }
}
declare module "formats/win-encoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { Encoder } from "formats/encoder";
    export abstract class WinEncoder implements Encoder {
        protected _type: number;
        get type(): number;
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        protected colorPlanesOrXHotSpot(_index: number): number;
        protected bitsPerPixelOrYHotSpot(_index: number): number;
        encodeImages(images: MemoryImage[]): Uint8Array;
        encodeImage(image: MemoryImage): Uint8Array;
        encodeAnimation(_: FrameAnimation): Uint8Array | undefined;
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
declare module "formats/jpeg/component-data" {
    /** @format */
    export class ComponentData {
        private _hSamples;
        get hSamples(): number;
        private _maxHSamples;
        get maxHSamples(): number;
        private _vSamples;
        get vSamples(): number;
        private _maxVSamples;
        get maxVSamples(): number;
        private _lines;
        get lines(): Array<Uint8Array>;
        private _hScaleShift;
        get hScaleShift(): number;
        private _vScaleShift;
        get vScaleShift(): number;
        constructor(hSamples: number, maxHSamples: number, vSamples: number, maxVSamples: number, lines: Array<Uint8Array>);
    }
}
declare module "formats/jpeg/jpeg" {
    /** @format */
    export abstract class Jpeg {
        static readonly dctZigZag: number[];
        static readonly DCTSIZE = 8;
        static readonly DCTSIZE2 = 64;
        static readonly NUM_QUANT_TBLS = 4;
        static readonly NUM_HUFF_TBLS = 4;
        static readonly NUM_ARITH_TBLS = 16;
        static readonly MAX_COMPS_IN_SCAN = 4;
        static readonly MAX_SAMP_FACTOR = 4;
        static readonly M_SOF0 = 192;
        static readonly M_SOF1 = 193;
        static readonly M_SOF2 = 194;
        static readonly M_SOF3 = 195;
        static readonly M_SOF5 = 197;
        static readonly M_SOF6 = 198;
        static readonly M_SOF7 = 199;
        static readonly M_JPG = 200;
        static readonly M_SOF9 = 201;
        static readonly M_SOF10 = 202;
        static readonly M_SOF11 = 203;
        static readonly M_SOF13 = 205;
        static readonly M_SOF14 = 206;
        static readonly M_SOF15 = 207;
        static readonly M_DHT = 196;
        static readonly M_DAC = 204;
        static readonly M_RST0 = 208;
        static readonly M_RST1 = 209;
        static readonly M_RST2 = 210;
        static readonly M_RST3 = 211;
        static readonly M_RST4 = 212;
        static readonly M_RST5 = 213;
        static readonly M_RST6 = 214;
        static readonly M_RST7 = 215;
        static readonly M_SOI = 216;
        static readonly M_EOI = 217;
        static readonly M_SOS = 218;
        static readonly M_DQT = 219;
        static readonly M_DNL = 220;
        static readonly M_DRI = 221;
        static readonly M_DHP = 222;
        static readonly M_EXP = 223;
        static readonly M_APP0 = 224;
        static readonly M_APP1 = 225;
        static readonly M_APP2 = 226;
        static readonly M_APP3 = 227;
        static readonly M_APP4 = 228;
        static readonly M_APP5 = 229;
        static readonly M_APP6 = 230;
        static readonly M_APP7 = 231;
        static readonly M_APP8 = 232;
        static readonly M_APP9 = 233;
        static readonly M_APP10 = 234;
        static readonly M_APP11 = 235;
        static readonly M_APP12 = 236;
        static readonly M_APP13 = 237;
        static readonly M_APP14 = 238;
        static readonly M_APP15 = 239;
        static readonly M_JPG0 = 240;
        static readonly M_JPG13 = 253;
        static readonly M_COM = 254;
        static readonly M_TEM = 1;
        static readonly M_ERROR = 256;
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
declare module "formats/jpeg/jpeg-component" {
    /** @format */
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
        set huffmanTableDC(v: []);
        get huffmanTableDC(): [];
        private _huffmanTableAC;
        set huffmanTableAC(v: []);
        get huffmanTableAC(): [];
        private _pred;
        set pred(v: number);
        get pred(): number;
        get quantizationTable(): Int16Array | undefined;
        constructor(hSamples: number, vSamples: number, quantizationTableList: Array<Int16Array | undefined>, quantizationIndex: number);
        setBlocks(blocks: Array<Array<Int32Array>>, blocksPerLine: number, blocksPerColumn: number): void;
    }
}
declare module "formats/jpeg/jpeg-frame" {
    /** @format */
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
        private static getEmptyBlocks;
        prepare(): void;
    }
}
declare module "formats/jpeg/jpeg-huffman" {
    /** @format */
    export class JpegHuffman {
        private readonly _children;
        get children(): Array<unknown>;
        private _index;
        get index(): number;
        incrementIndex(): void;
    }
}
declare module "formats/jpeg/jpeg-info" {
    /** @format */
    import { DecodeInfo } from "formats/decode-info";
    export class JpegInfo implements DecodeInfo {
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _backgroundColor;
        get backgroundColor(): number;
        private _numFrames;
        get numFrames(): number;
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
    import { MemoryImage } from "common/memory-image";
    import { JpegData } from "formats/jpeg/jpeg-data";
    export abstract class JpegQuantize {
        private static dctClip;
        private static clamp8;
        static quantizeAndInverse(quantizationTable: Int16Array, coefBlock: Int32Array, dataOut: Uint8Array, dataIn: Int32Array): void;
        static getImageFromJpeg(jpeg: JpegData): MemoryImage;
    }
}
declare module "formats/jpeg/jpeg-scan" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    import { JpegComponent } from "formats/jpeg/jpeg-component";
    import { JpegFrame } from "formats/jpeg/jpeg-frame";
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
    import { MemoryImage } from "common/memory-image";
    import { ComponentData } from "formats/jpeg/component-data";
    import { JpegAdobe } from "formats/jpeg/jpeg-adobe";
    import { JpegFrame } from "formats/jpeg/jpeg-frame";
    import { JpegInfo } from "formats/jpeg/jpeg-info";
    import { JpegJfif } from "formats/jpeg/jpeg-jfif";
    import { ExifData } from "exif/exif-data";
    export class JpegData {
        static readonly CRR: number[];
        static readonly CRG: number[];
        static readonly CBG: number[];
        static readonly CBB: number[];
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
        get huffmanTablesAC(): Array<[] | undefined>;
        private readonly _huffmanTablesDC;
        get huffmanTablesDC(): Array<[] | undefined>;
        private readonly _components;
        get components(): Array<ComponentData>;
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
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { Decoder } from "formats/decoder";
    import { JpegInfo } from "formats/jpeg/jpeg-info";
    /**
     * Decode a jpeg encoded image.
     */
    export class JpegDecoder implements Decoder {
        private info?;
        private input?;
        get numFrames(): number;
        /**
         * Is the given file a valid JPEG image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): JpegInfo | undefined;
        decodeFrame(_: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        decodeImage(bytes: Uint8Array, _?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/jpeg-encoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode an image to the JPEG format.
     */
    export class JpegEncoder implements Encoder {
        private static readonly ZIGZAG;
        private static readonly STD_DC_LUMINANCE_NR_CODES;
        private static readonly STD_DC_LUMINANCE_VALUES;
        private static readonly STD_AC_LUMINANCE_NR_CODES;
        private static readonly STD_AC_LUMINANCE_VALUES;
        private static readonly STD_DC_CHROMINANCE_NR_CODES;
        private static readonly STD_DC_CHROMINANCE_VALUES;
        private static readonly STD_AC_CHROMINANCE_NR_CODES;
        private static readonly STD_AC_CHROMINANCE_VALUES;
        private readonly tableY;
        private readonly tableUV;
        private readonly ftableY;
        private readonly ftableUV;
        private readonly bitcode;
        private readonly category;
        private readonly outputfDCTQuant;
        private readonly DU;
        private readonly YDU;
        private readonly UDU;
        private readonly VDU;
        private readonly tableRGBYUV;
        private htYDC;
        private htUVDC;
        private htYAC;
        private htUVAC;
        private currentQuality?;
        private byteNew;
        private bytePos;
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
        private initRGBYUVTable;
        private setQuality;
        private initQuantTables;
        private fDCTQuant;
        private writeDQT;
        private writeBits;
        private resetBits;
        private processDU;
        encodeImage(image: MemoryImage): Uint8Array;
        encodeAnimation(_: FrameAnimation): Uint8Array | undefined;
    }
}
declare module "formats/tga/tga-info" {
    /** @format */
    import { DecodeInfo } from "formats/decode-info";
    export interface TgaInfoInitOptions {
        width?: number;
        height?: number;
        imageOffset?: number;
        bitsPerPixel?: number;
    }
    export class TgaInfo implements DecodeInfo {
        private readonly _width;
        get width(): number;
        protected readonly _height: number;
        get height(): number;
        private readonly _backgroundColor;
        get backgroundColor(): number;
        /**
         * The number of frames that can be decoded.
         */
        private readonly _numFrames;
        get numFrames(): number;
        /**
         *  Offset in the input file the image data starts at.
         */
        private readonly _imageOffset;
        get imageOffset(): number | undefined;
        /**
         *  Bits per pixel.
         */
        private readonly _bitsPerPixel;
        get bitsPerPixel(): number | undefined;
        constructor(options?: TgaInfoInitOptions);
    }
}
declare module "formats/tga-decoder" {
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { Decoder } from "formats/decoder";
    import { TgaInfo } from "formats/tga/tga-info";
    /**
     * Decode a TGA image. This only supports the 24-bit uncompressed format.
     */
    export class TgaDecoder implements Decoder {
        private info;
        private input;
        get numFrames(): number;
        /**
         * Is the given file a valid TGA image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): TgaInfo | undefined;
        decodeFrame(_frame: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number | undefined): HdrImage | undefined;
    }
}
declare module "formats/tga-encoder" {
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode a TGA image. This only supports the 24-bit uncompressed format.
     */
    export class TgaEncoder implements Encoder {
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        encodeImage(image: MemoryImage): Uint8Array;
        encodeAnimation(_animation: FrameAnimation): Uint8Array | undefined;
    }
}
declare module "formats/tiff/tiff-bit-reader" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class TiffBitReader {
        private static readonly BITMASK;
        private bitBuffer;
        private bitPosition;
        private input;
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
declare module "formats/tiff/tiff-entry" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export interface TiffEntryInitOptions {
        tag: number;
        type: number;
        numValues: number;
        p: InputBuffer;
    }
    export class TiffEntry {
        private static readonly SIZE_OF_TYPE;
        static readonly TYPE_BYTE = 1;
        static readonly TYPE_ASCII = 2;
        static readonly TYPE_SHORT = 3;
        static readonly TYPE_LONG = 4;
        static readonly TYPE_RATIONAL = 5;
        static readonly TYPE_SBYTE = 6;
        static readonly TYPE_UNDEFINED = 7;
        static readonly TYPE_SSHORT = 8;
        static readonly TYPE_SLONG = 9;
        static readonly TYPE_SRATIONAL = 10;
        static readonly TYPE_FLOAT = 11;
        static readonly TYPE_DOUBLE = 12;
        private _tag;
        get tag(): number;
        private _type;
        get type(): number;
        private _numValues;
        get numValues(): number;
        private _valueOffset;
        get valueOffset(): number | undefined;
        set valueOffset(v: number | undefined);
        private _p;
        get p(): InputBuffer;
        get isValid(): boolean;
        get typeSize(): number;
        get isString(): boolean;
        constructor(options: TiffEntryInitOptions);
        private readValueInternal;
        toString(): string;
        readValue(): number;
        readValues(): number[];
        readString(): string;
        read(): number[];
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
        private static readonly TABLE1;
        private static readonly TABLE2;
        /**
         * Table to be used when **fillOrder** = 2, for flipping bytes.
         */
        private static readonly FLIP_TABLE;
        /**
         * The main 10 bit white runs lookup table
         */
        private static readonly WHITE;
        /**
         * Additional make up codes for both White and Black runs
         */
        private static readonly ADDITIONAL_MAKEUP;
        /**
         * Initial black run look up table, uses the first 4 bits of a code
         */
        private static readonly INIT_BLACK;
        private static readonly TWO_BIT_BLACK;
        /**
         * Main black run table, using the last 9 bits of possible 13 bit code
         */
        private static readonly BLACK;
        private static readonly TWO_D_CODES;
        private _width;
        get width(): number;
        private _height;
        get height(): number;
        private _fillOrder;
        get fillOrder(): number;
        private changingElemSize;
        private prevChangingElems?;
        private currChangingElems?;
        private data;
        private bitPointer;
        private bytePointer;
        private lastChangingElement;
        private compression;
        private uncompressedMode;
        private fillBits;
        private oneD;
        constructor(options: TiffFaxDecoderInitOptions);
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
declare module "formats/tiff/tiff-lzw-decoder" {
    /** @format */
    import { InputBuffer } from "common/input-buffer";
    export class LzwDecoder {
        private static readonly LZ_MAX_CODE;
        private static readonly NO_SUCH_CODE;
        private static readonly AND_TABLE;
        private readonly buffer;
        private bitsToGet;
        private bytePointer;
        private nextData;
        private nextBits;
        private data;
        private dataLength;
        private out;
        private outPointer;
        private table;
        private prefix;
        private tableIndex?;
        private bufferLength;
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
declare module "formats/tiff/tiff-image" {
    import { InputBuffer } from "common/input-buffer";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { TiffEntry } from "formats/tiff/tiff-entry";
    export class TiffImage {
        static readonly COMPRESSION_NONE = 1;
        static readonly COMPRESSION_CCITT_RLE = 2;
        static readonly COMPRESSION_CCITT_FAX3 = 3;
        static readonly COMPRESSION_CCITT_FAX4 = 4;
        static readonly COMPRESSION_LZW = 5;
        static readonly COMPRESSION_OLD_JPEG = 6;
        static readonly COMPRESSION_JPEG = 7;
        static readonly COMPRESSION_NEXT = 32766;
        static readonly COMPRESSION_CCITT_RLEW = 32771;
        static readonly COMPRESSION_PACKBITS = 32773;
        static readonly COMPRESSION_THUNDERSCAN = 32809;
        static readonly COMPRESSION_IT8CTPAD = 32895;
        static readonly COMPRESSION_IT8LW = 32896;
        static readonly COMPRESSION_IT8MP = 32897;
        static readonly COMPRESSION_IT8BL = 32898;
        static readonly COMPRESSION_PIXARFILM = 32908;
        static readonly COMPRESSION_PIXARLOG = 32909;
        static readonly COMPRESSION_DEFLATE = 32946;
        static readonly COMPRESSION_ZIP = 8;
        static readonly COMPRESSION_DCS = 32947;
        static readonly COMPRESSION_JBIG = 34661;
        static readonly COMPRESSION_SGILOG = 34676;
        static readonly COMPRESSION_SGILOG24 = 34677;
        static readonly COMPRESSION_JP2000 = 34712;
        static readonly PHOTOMETRIC_BLACKISZERO = 1;
        static readonly PHOTOMETRIC_RGB = 2;
        static readonly TYPE_UNSUPPORTED = -1;
        static readonly TYPE_BILEVEL = 0;
        static readonly TYPE_GRAY_4BIT = 1;
        static readonly TYPE_GRAY = 2;
        static readonly TYPE_GRAY_ALPHA = 3;
        static readonly TYPE_PALETTE = 4;
        static readonly TYPE_RGB = 5;
        static readonly TYPE_RGB_ALPHA = 6;
        static readonly TYPE_YCBCR_SUB = 7;
        static readonly TYPE_GENERIC = 8;
        static readonly FORMAT_UINT = 1;
        static readonly FORMAT_INT = 2;
        static readonly FORMAT_FLOAT = 3;
        static readonly TAG_ARTIST = 315;
        static readonly TAG_BITS_PER_SAMPLE = 258;
        static readonly TAG_CELL_LENGTH = 265;
        static readonly TAG_CELL_WIDTH = 264;
        static readonly TAG_COLOR_MAP = 320;
        static readonly TAG_COMPRESSION = 259;
        static readonly TAG_DATE_TIME = 306;
        static readonly TAG_EXIF_IFD = 34665;
        static readonly TAG_EXTRA_SAMPLES = 338;
        static readonly TAG_FILL_ORDER = 266;
        static readonly TAG_FREE_BYTE_COUNTS = 289;
        static readonly TAG_FREE_OFFSETS = 288;
        static readonly TAG_GRAY_RESPONSE_CURVE = 291;
        static readonly TAG_GRAY_RESPONSE_UNIT = 290;
        static readonly TAG_HOST_COMPUTER = 316;
        static readonly TAG_ICC_PROFILE = 34675;
        static readonly TAG_IMAGE_DESCRIPTION = 270;
        static readonly TAG_IMAGE_LENGTH = 257;
        static readonly TAG_IMAGE_WIDTH = 256;
        static readonly TAG_IPTC = 33723;
        static readonly TAG_MAKE = 271;
        static readonly TAG_MAX_SAMPLE_VALUE = 281;
        static readonly TAG_MIN_SAMPLE_VALUE = 280;
        static readonly TAG_MODEL = 272;
        static readonly TAG_NEW_SUBFILE_TYPE = 254;
        static readonly TAG_ORIENTATION = 274;
        static readonly TAG_PHOTOMETRIC_INTERPRETATION = 262;
        static readonly TAG_PHOTOSHOP = 34377;
        static readonly TAG_PLANAR_CONFIGURATION = 284;
        static readonly TAG_PREDICTOR = 317;
        static readonly TAG_RESOLUTION_UNIT = 296;
        static readonly TAG_ROWS_PER_STRIP = 278;
        static readonly TAG_SAMPLES_PER_PIXEL = 277;
        static readonly TAG_SOFTWARE = 305;
        static readonly TAG_STRIP_BYTE_COUNTS = 279;
        static readonly TAG_STRIP_OFFSETS = 273;
        static readonly TAG_SUBFILE_TYPE = 255;
        static readonly TAG_T4_OPTIONS = 292;
        static readonly TAG_T6_OPTIONS = 293;
        static readonly TAG_THRESHOLDING = 263;
        static readonly TAG_TILE_WIDTH = 322;
        static readonly TAG_TILE_LENGTH = 323;
        static readonly TAG_TILE_OFFSETS = 324;
        static readonly TAG_TILE_BYTE_COUNTS = 325;
        static readonly TAG_SAMPLE_FORMAT = 339;
        static readonly TAG_XMP = 700;
        static readonly TAG_X_RESOLUTION = 282;
        static readonly TAG_Y_RESOLUTION = 283;
        static readonly TAG_YCBCR_COEFFICIENTS = 529;
        static readonly TAG_YCBCR_SUBSAMPLING = 530;
        static readonly TAG_YCBCR_POSITIONING = 531;
        static readonly TAG_NAME: Map<number, string>;
        private readonly _tags;
        get tags(): Map<number, TiffEntry>;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        private _photometricType;
        get photometricType(): number | undefined;
        private _compression;
        get compression(): number;
        private _bitsPerSample;
        get bitsPerSample(): number;
        private _samplesPerPixel;
        get samplesPerPixel(): number;
        private _sampleFormat;
        get sampleFormat(): number;
        private _imageType;
        get imageType(): number;
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
        private _colorMap;
        get colorMap(): number[] | undefined;
        private colorMapRed;
        private colorMapGreen;
        private colorMapBlue;
        private image?;
        private hdrImage?;
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
        private decodePackbits;
        decode(p: InputBuffer): MemoryImage;
        decodeHdr(p: InputBuffer): HdrImage;
        hasTag(tag: number): boolean;
    }
}
declare module "formats/tiff/tiff-info" {
    /** @format */
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
        get backgroundColor(): number;
        get numFrames(): number;
        constructor(options: TiffInfoInitOptions);
    }
}
declare module "formats/tiff-decoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { ExifData } from "exif/exif-data";
    import { HdrImage } from "hdr/hdr-image";
    import { Decoder } from "formats/decoder";
    import { TiffInfo } from "formats/tiff/tiff-info";
    export class TiffDecoder implements Decoder {
        private static readonly TIFF_SIGNATURE;
        private static readonly TIFF_LITTLE_ENDIAN;
        private static readonly TIFF_BIG_ENDIAN;
        private input;
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
         * Non animated image files will only have **frame** 0. An **AnimationFrame**
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(frame: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        /**
         * Decode all of the frames from an animation. If the file is not an
         * animation, a single frame animation is returned. If there was a problem
         * decoding the file, undefined is returned.
         */
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified **frame** will be decoded. If there was a problem
         * decoding the file, undefined is returned.
         */
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/tiff-encoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { Encoder } from "formats/encoder";
    /**
     * Encode a TIFF image.
     */
    export class TiffEncoder implements Encoder {
        private static readonly LITTLE_ENDIAN;
        private static readonly SIGNATURE;
        private _supportsAnimation;
        get supportsAnimation(): boolean;
        private writeHeader;
        private writeImage;
        private writeHdrImage;
        private getSampleFormat;
        private writeEntryUint16;
        private writeEntryUint32;
        encodeImage(image: MemoryImage): Uint8Array;
        encodeAnimation(_animation: FrameAnimation): Uint8Array | undefined;
        encodeHdrImage(image: HdrImage): Uint8Array;
    }
}
declare module "common/octree-node" {
    /** @format */
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
declare module "common/heap-node" {
    /** @format */
    import { OctreeNode } from "common/octree-node";
    export class HeapNode {
        private _buf;
        get buf(): Array<OctreeNode | undefined>;
        get n(): number;
    }
}
declare module "common/octree-quantizer" {
    import { MemoryImage } from "common/memory-image";
    import { Quantizer } from "common/quantizer";
    /**
     * Color quantization using octree,
     * from https://rosettacode.org/wiki/Color_quantization/C
     */
    export class OctreeQuantizer implements Quantizer {
        private static readonly ON_INHEAP;
        private readonly root;
        constructor(image: MemoryImage, numberOfColors?: number);
        private nodeInsert;
        private popHeap;
        private heapAdd;
        private downHeap;
        private upHeap;
        private nodeFold;
        private compareNode;
        /**
         * Find the index of the closest color to **c** in the **colorMap**.
         */
        getQuantizedColor(c: number): number;
    }
}
declare module "common/random-utils" {
    /** @format */
    export abstract class RandomUtils {
        /**
         * Return a random variable between [**-1**,**1**].
         */
        static crand(): number;
        /**
         * Return a random variable following a gaussian distribution and a standard
         * deviation of 1.
         */
        static grand(): number;
        /**
         * Return a random variable following a Poisson distribution of parameter **z**.
         */
        static prand(z: number): number;
    }
}
declare module "filter/adjust-color-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface AdjustColorOptions {
        src: MemoryImage;
        blacks?: number;
        whites?: number;
        mids?: number;
        contrast?: number;
        saturation?: number;
        brightness?: number;
        gamma?: number;
        exposure?: number;
        hue?: number;
        amount?: number;
    }
}
declare module "filter/color-offset-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface ColorOffsetOptions {
        src: MemoryImage;
        red?: number;
        green?: number;
        blue?: number;
        alpha?: number;
    }
}
declare module "filter/convolution-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface ConvolutionOptions {
        src: MemoryImage;
        filter: number[];
        div?: number;
        offset?: number;
    }
}
declare module "filter/noise-type" {
    /** @format */
    export enum NoiseType {
        gaussian = 0,
        uniform = 1,
        saltPepper = 2,
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
declare module "filter/quantize-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { QuantizeMethod } from "filter/quantize-method";
    export interface QuantizeOptions {
        src: MemoryImage;
        numberOfColors?: number;
        method?: QuantizeMethod;
    }
}
declare module "filter/remap-colors-options" {
    /** @format */
    import { ColorChannel } from "common/color-channel";
    import { MemoryImage } from "common/memory-image";
    export interface RemapColorsOptions {
        src: MemoryImage;
        red?: ColorChannel;
        green?: ColorChannel;
        blue?: ColorChannel;
        alpha?: ColorChannel;
    }
}
declare module "filter/separable-kernel" {
    import { MemoryImage } from "common/memory-image";
    /**
     * A kernel object to use with **separableConvolution** filtering.
     */
    export class SeparableKernel {
        private readonly coefficients;
        private readonly size;
        /**
         * Get the number of coefficients in the kernel.
         */
        get length(): number;
        /**
         * Create a separable convolution kernel for the given **radius**.
         */
        constructor(size: number);
        private reflect;
        private applyCoeffsLine;
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
         * applied to the horizontal axis, otherwise it will be appied to the
         * vertical axis.
         */
        apply(src: MemoryImage, dst: MemoryImage, horizontal?: boolean): void;
        /**
         * Scale all of the coefficients by **s**.
         */
        scaleCoefficients(s: number): void;
    }
}
declare module "filter/vignette-options" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    export interface VignetteOptions {
        src: MemoryImage;
        start?: number;
        end?: number;
        amount?: number;
    }
}
declare module "filter/image-filter" {
    import { MemoryImage } from "common/memory-image";
    import { AdjustColorOptions } from "filter/adjust-color-options";
    import { ColorOffsetOptions } from "filter/color-offset-options";
    import { ConvolutionOptions } from "filter/convolution-options";
    import { NoiseType } from "filter/noise-type";
    import { PixelateMode } from "filter/pixelate-mode";
    import { QuantizeOptions } from "filter/quantize-options";
    import { RemapColorsOptions } from "filter/remap-colors-options";
    import { SeparableKernel } from "filter/separable-kernel";
    import { VignetteOptions } from "filter/vignette-options";
    export abstract class ImageFilter {
        private static readonly gaussianKernelCache;
        private static smoothVignetteStep;
        /**
         * Adjust the color of the **src** image using various color transformations.
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
         * **amount** controls how much affect this filter has on the **src** image, where
         * 0 has no effect and 1 has full effect.
         */
        static adjustColor(options: AdjustColorOptions): MemoryImage;
        /**
         * Set the **brightness** level for the image **src**.
         * **brightness** is an offset that is added to the red, green, and blue channels
         * of every pixel.
         */
        static brightness(src: MemoryImage, brightness: number): MemoryImage;
        /**
         * Generate a normal map from a height-field bump image.
         *
         * The red channel of the **src** image is used as an input, 0 represents a low
         * height and 1 a high value. The optional **strength** parameter allows to set
         * the strength of the normal image.
         */
        static bumpToNormal(src: MemoryImage, strength?: number): MemoryImage;
        /**
         * Add the **red**, **green**, **blue** and **alpha** values to the **src** image
         * colors, a per-channel brightness.
         */
        static colorOffset(options: ColorOffsetOptions): MemoryImage;
        /**
         * Set the **contrast** level for the image **src**.
         *
         * **contrast** values below 100 will decrees the contrast of the image,
         * and values above 100 will increase the contrast. A contrast of 100
         * will have no affect.
         */
        static contrast(src: MemoryImage, contrast: number): MemoryImage;
        /**
         * Apply a 3x3 convolution filter to the **src** image. **filter** should be a
         * list of 9 numbers.
         *
         * The rgb channels will divided by **div** and add **offset**, allowing
         * filters to normalize and offset the filtered pixel value.
         */
        static convolution(options: ConvolutionOptions): MemoryImage;
        /**
         * Apply an emboss convolution filter.
         */
        static emboss(src: MemoryImage): MemoryImage;
        /**
         * Apply gaussian blur to the **src** image. **radius** determines how many pixels
         * away from the current pixel should contribute to the blur, where 0 is no
         * blur and the larger the radius, the stronger the blur.
         */
        static gaussianBlur(src: MemoryImage, radius: number): MemoryImage;
        /**
         * Convert the image to grayscale.
         */
        static grayscale(src: MemoryImage): MemoryImage;
        /**
         * Invert the colors of the **src** image.
         */
        static invert(src: MemoryImage): MemoryImage;
        /**
         * Add random noise to pixel values. **sigma** determines how strong the effect
         * should be. **type** should be one of the following: **NoiseType.gaussian**,
         * **NoiseType.uniform**, **NoiseType.saltPepper**, **NoiseType.poisson**,
         * or **NoiseType.rice**.
         */
        static noise(image: MemoryImage, sigma: number, type?: NoiseType): MemoryImage;
        /**
         * Linearly normalize the colors of the image. All color values will be mapped
         * to the range **minValue**, **maxValue** inclusive.
         */
        static normalize(src: MemoryImage, minValue: number, maxValue: number): MemoryImage;
        /**
         * Pixelate the **src** image.
         *
         * **blockSize** determines the size of the pixelated blocks.
         * If **mode** is **PixelateMode.upperLeft** then the upper-left corner of the block
         * will be used for the block color. Otherwise if **mode** is **PixelateMode.average**,
         * the average of all the pixels in the block will be used for the block color.
         */
        static pixelate(src: MemoryImage, blockSize: number, mode?: PixelateMode): MemoryImage;
        /**
         * Quantize the number of colors in image to 256.
         */
        static quantize(options: QuantizeOptions): MemoryImage;
        /**
         * Remap the color channels of the image.
         * **red**, **green**, **blue** and **alpha** should be set to one of the following:
         * **ColorChannel.red**, **ColorChannel.green**, **ColorChannel.blue**, **ColorChannel.alpha**, or
         * **ColorChannel.luminance**. For example,
         * **_remapColors({ src: src, red: ColorChannel.green, green: ColorChannel.red })_**
         * will swap the red and green channels of the image.
         * **_remapColors({ src: src, alpha: ColorChannel.luminance })_**
         * will set the alpha channel to the luminance (grayscale) of the image.
         */
        static remapColors(options: RemapColorsOptions): MemoryImage;
        static scaleRgba(src: MemoryImage, r: number, g: number, b: number, a: number): MemoryImage;
        /**
         * Apply a generic separable convolution filter the **src** image, using the
         * given **kernel**.
         *
         * **gaussianBlur** is an example of such a filter.
         */
        static separableConvolution(src: MemoryImage, kernel: SeparableKernel): MemoryImage;
        /**
         * Apply sepia tone to the image.
         *
         * **amount** controls the strength of the effect, in the range **0**-**1**.
         */
        static sepia(src: MemoryImage, amount?: number): MemoryImage;
        /**
         * Apply a smoothing convolution filter to the **src** image.
         *
         * **w** is the weight of the current pixel being filtered. If it's greater than
         * 1, it will make the image sharper.
         */
        static smooth(src: MemoryImage, w: number): MemoryImage;
        /**
         * Apply Sobel edge detection filtering to the **src** Image.
         */
        static sobel(src: MemoryImage, amount?: number): MemoryImage;
        static vignette(options: VignetteOptions): MemoryImage;
    }
}
declare module "hdr/hdr-to-image" {
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    export abstract class HdrToImage {
        /**
         * Convert a high dynamic range image to a low dynamic range image,
         * with optional exposure control.
         */
        static hdrToImage(hdr: HdrImage, exposure?: number): MemoryImage;
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
         * Trim an image to the top-left and bottom-right most pixels that are not the
         * same as the top-left most pixel of the image.
         */
        topLeftColor = 1,
        /**
         * Trim an image to the top-left and bottom-right most pixels that are not the
         * same as the bottom-right most pixel of the image.
         */
        bottomRightColor = 2
    }
}
declare module "transform/trim-side" {
    /** @format */
    export class TrimSide {
        /**
         * Trim the image down from the top.
         */
        static readonly top: TrimSide;
        /**
         * Trim the image up from the bottom.
         */
        static readonly bottom: TrimSide;
        /**
         * Trim the left edge of the image.
         */
        static readonly left: TrimSide;
        /**
         * Trim the right edge of the image.
         */
        static readonly right: TrimSide;
        /**
         * Trim all edges of the image.
         */
        static readonly all: TrimSide;
        private value;
        constructor(...sides: [number | TrimSide, ...(number | TrimSide)[]]);
        has(side: TrimSide): boolean;
    }
}
declare module "transform/trim" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { TrimMode } from "transform/trim-mode";
    import { TrimSide } from "transform/trim-side";
    export abstract class TrimTransform {
        /**
         * Find the crop area to be used by the trim function.
         * Returns the Rectangle. You could pass these constraints
         * to the **copyCrop** function to crop the image.
         */
        private static findTrim;
        /**
         * Automatically crops the image by finding the corners of the image that
         * meet the **mode** criteria (not transparent or a different color).
         *
         * **mode** can be either **TrimMode.transparent**, **TrimMode.topLeftColor** or
         * **TrimMode.bottomRightColor**.
         *
         * **sides** can be used to control which sides of the image get trimmed,
         * and can be any combination of **TrimSide.top**, **TrimSide.bottom**, **TrimSide.left**,
         * and **TrimSide.right**.
         */
        static trim(src: MemoryImage, mode?: TrimMode, sides?: TrimSide): MemoryImage;
    }
}
declare module "index" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { CompressionLevel, TypedArray } from "common/typings";
    import { Decoder } from "formats/decoder";
    export { ArrayUtils } from "common/array-utils";
    export { BitOperators } from "common/bit-operators";
    export { BlendMode } from "common/blend-mode";
    export { ColorChannel } from "common/color-channel";
    export { ColorModel } from "common/color-model";
    export { Color } from "common/color";
    export { Crc32, Crc32Parameters } from "common/crc32";
    export { DisposeMode } from "common/dispose-mode";
    export { DitherKernel } from "common/dither-kernel";
    export { DitherPixel } from "common/dither-pixel";
    export { FrameAnimation, FrameAnimationInitOptions, } from "common/frame-animation";
    export { FrameType } from "common/frame-type";
    export { HeapNode } from "common/heap-node";
    export { ICCProfileData } from "common/icc-profile-data";
    export { ICCPCompressionMode } from "common/iccp-compression-mode";
    export { InputBuffer, InputBufferInitOptions } from "common/input-buffer";
    export { Interpolation } from "common/interpolation";
    export { Line } from "common/line";
    export { MathOperators } from "common/math-operators";
    export { MemoryImage, MemoryImageInitOptions, MemoryImageInitOptionsColorModel, RgbMemoryImageInitOptions, } from "common/memory-image";
    export { NeuralQuantizer } from "common/neural-quantizer";
    export { OctreeNode } from "common/octree-node";
    export { OctreeQuantizer } from "common/octree-quantizer";
    export { OutputBuffer, OutputBufferInitOptions } from "common/output-buffer";
    export { Point } from "common/point";
    export { Quantizer } from "common/quantizer";
    export { RandomUtils } from "common/random-utils";
    export { Rational } from "common/rational";
    export { Rectangle } from "common/rectangle";
    export { RgbChannelSet } from "common/rgb-channel-set";
    export { TextCodec } from "common/text-codec";
    export { CompressionLevel, TypedArray, BufferEncoding } from "common/typings";
    export { DrawImageOptions } from "draw/draw-image-options";
    export { DrawLineOptions } from "draw/draw-line-options";
    export { Draw } from "draw/draw";
    export { FillFloodOptions } from "draw/fill-flood-options";
    export { MaskFloodOptions } from "draw/mask-flood-options";
    export { ExifAsciiValue } from "exif/exif-value/exif-ascii-value";
    export { ExifByteValue } from "exif/exif-value/exif-byte-value";
    export { ExifDoubleValue } from "exif/exif-value/exif-double-value";
    export { ExifLongValue } from "exif/exif-value/exif-long-value";
    export { ExifRationalValue } from "exif/exif-value/exif-rational-value";
    export { ExifSByteValue } from "exif/exif-value/exif-sbyte-value";
    export { ExifShortValue } from "exif/exif-value/exif-short-value";
    export { ExifSingleValue } from "exif/exif-value/exif-single-value";
    export { ExifSLongValue } from "exif/exif-value/exif-slong-value";
    export { ExifSRationalValue } from "exif/exif-value/exif-srational-value";
    export { ExifSShortValue } from "exif/exif-value/exif-sshort-value";
    export { ExifUndefinedValue } from "exif/exif-value/exif-undefined-value";
    export { ExifValue } from "exif/exif-value/exif-value";
    export { ExifData } from "exif/exif-data";
    export { ExifEntry } from "exif/exif-entry";
    export { ExifIFDContainer } from "exif/exif-ifd-container";
    export { ExifIFD } from "exif/exif-ifd";
    export { ExifTag, ExifTagInitOptions, ExifGpsTags, ExifImageTags, ExifInteropTags, ExifTagNameToID, } from "exif/exif-tag";
    export { ExifValueType, ExifValueTypeSize, ExifValueTypeString, getExifValueTypeSize, getExifValueTypeString, } from "exif/exif-value-type";
    export { AdjustColorOptions } from "filter/adjust-color-options";
    export { ColorOffsetOptions } from "filter/color-offset-options";
    export { ConvolutionOptions } from "filter/convolution-options";
    export { ImageFilter } from "filter/image-filter";
    export { NoiseType } from "filter/noise-type";
    export { PixelateMode } from "filter/pixelate-mode";
    export { QuantizeMethod } from "filter/quantize-method";
    export { QuantizeOptions } from "filter/quantize-options";
    export { RemapColorsOptions } from "filter/remap-colors-options";
    export { SeparableKernel } from "filter/separable-kernel";
    export { VignetteOptions } from "filter/vignette-options";
    export { BmpDecoder } from "formats/bmp-decoder";
    export { BmpEncoder } from "formats/bmp-encoder";
    export { DecodeInfo } from "formats/decode-info";
    export { Decoder } from "formats/decoder";
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
    export { BitmapCompressionMode } from "formats/bmp/bitmap-compression-mode";
    export { BitmapFileHeader } from "formats/bmp/bitmap-file-header";
    export { BmpInfo } from "formats/bmp/bmp-info";
    export { GifColorMap, GifColorMapInitOptions, } from "formats/gif/gif-color-map";
    export { GifImageDesc } from "formats/gif/gif-image-desc";
    export { GifInfo, GifInfoInitOptions } from "formats/gif/gif-info";
    export { IcoBmpInfo } from "formats/ico/ico-bmp-info";
    export { IcoInfoImage } from "formats/ico/ico-info-image";
    export { IcoInfo } from "formats/ico/ico-info";
    export { ComponentData } from "formats/jpeg/component-data";
    export { JpegAdobe } from "formats/jpeg/jpeg-adobe";
    export { JpegComponent } from "formats/jpeg/jpeg-component";
    export { JpegData } from "formats/jpeg/jpeg-data";
    export { JpegFrame } from "formats/jpeg/jpeg-frame";
    export { JpegHuffman } from "formats/jpeg/jpeg-huffman";
    export { JpegInfo } from "formats/jpeg/jpeg-info";
    export { JpegJfif } from "formats/jpeg/jpeg-jfif";
    export { JpegQuantize } from "formats/jpeg/jpeg-quantize";
    export { JpegScan } from "formats/jpeg/jpeg-scan";
    export { Jpeg } from "formats/jpeg/jpeg";
    export { PngFrame, PngFrameInitOptions } from "formats/png/png-frame";
    export { PngInfo, PngInfoInitOptions } from "formats/png/png-info";
    export { TgaInfo } from "formats/tga/tga-info";
    export { TiffBitReader } from "formats/tiff/tiff-bit-reader";
    export { TiffEntry, TiffEntryInitOptions } from "formats/tiff/tiff-entry";
    export { TiffFaxDecoder, TiffFaxDecoderInitOptions, } from "formats/tiff/tiff-fax-decoder";
    export { TiffImage } from "formats/tiff/tiff-image";
    export { TiffInfo, TiffInfoInitOptions } from "formats/tiff/tiff-info";
    export { LzwDecoder } from "formats/tiff/tiff-lzw-decoder";
    export { Half } from "hdr/half";
    export { HdrImage } from "hdr/hdr-image";
    export { HdrSlice, HdrSliceInitOptions } from "hdr/hdr-slice";
    export { HdrToImage } from "hdr/hdr-to-image";
    export { CopyIntoOptions } from "transform/copy-into-options";
    export { CopyResizeOptionsUsingHeight, CopyResizeOptionsUsingWidth, } from "transform/copy-resize-options";
    export { FlipDirection } from "transform/flip-direction";
    export { ImageTransform } from "transform/image-transform";
    export { TrimMode } from "transform/trim-mode";
    export { TrimSide } from "transform/trim-side";
    export { TrimTransform } from "transform/trim";
    /**
     * Find a **Decoder** that is able to decode the given image **data**.
     * Use this is you don't know the type of image it is. Since this will
     * validate the image against all known decoders, it is potentially very slow.
     */
    export function findDecoderForData(data: TypedArray): Decoder | undefined;
    /**
     * Decode the given image file bytes by first identifying the format of the
     * file and using that decoder to decode the file into a single frame [Image].
     */
    export function decodeImage(data: TypedArray): MemoryImage | undefined;
    /**
     * Decode the given image file bytes by first identifying the format of the
     * file and using that decoder to decode the file into an **FrameAnimation**
     * containing one or more **MemoryImage** frames.
     */
    export function decodeAnimation(data: TypedArray): FrameAnimation | undefined;
    /**
     * Return the **Decoder** that can decode image with the given **name**,
     * by looking at the file extension. See also **findDecoderForData** to
     * determine the decoder to use given the bytes of the file.
     */
    export function getDecoderForNamedImage(name: string): Decoder | undefined;
    /**
     * Identify the format of the image using the file extension of the given
     * **name**, and decode the given file **bytes** to an **FrameAnimation** with one or more
     * **MemoryImage** frames. See also **decodeAnimation**.
     */
    export function decodeNamedAnimation(data: TypedArray, name: string): FrameAnimation | undefined;
    /**
     * Identify the format of the image using the file extension of the given
     * **name**, and decode the given file **data** to a single frame **MemoryImage**. See
     * also **decodeImage**.
     */
    export function decodeNamedImage(data: TypedArray, name: string): MemoryImage | undefined;
    /**
     * Identify the format of the image and encode it with the appropriate
     * **Encoder**.
     */
    export function encodeNamedImage(image: MemoryImage, name: string): Uint8Array | undefined;
    /**
     * Decode a JPG formatted image.
     */
    export function decodeJpg(data: TypedArray): MemoryImage | undefined;
    /**
     * Encode an image to the JPEG format.
     */
    export function encodeJpg(image: MemoryImage, quality?: number): Uint8Array;
    /**
     * Decode a PNG formatted image.
     */
    export function decodePng(data: TypedArray): MemoryImage | undefined;
    /**
     * Decode a PNG formatted animation.
     */
    export function decodePngAnimation(data: TypedArray): FrameAnimation | undefined;
    /**
     * Encode an image to the PNG format.
     */
    export function encodePng(image: MemoryImage, level?: CompressionLevel): Uint8Array;
    /**
     * Encode an animation to the PNG format.
     */
    export function encodePngAnimation(animation: FrameAnimation, level?: CompressionLevel): Uint8Array | undefined;
    /**
     * Decode a Targa formatted image.
     */
    export function decodeTga(data: TypedArray): MemoryImage | undefined;
    /**
     * Encode an image to the Targa format.
     */
    export function encodeTga(image: MemoryImage): Uint8Array;
    /**
     * Decode a GIF formatted image (first frame for animations).
     */
    export function decodeGif(data: TypedArray): MemoryImage | undefined;
    /**
     * Decode an animated GIF file. If the GIF isn't animated, the animation
     * will contain a single frame with the GIF's image.
     */
    export function decodeGifAnimation(data: TypedArray): FrameAnimation | undefined;
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
    export function encodeGif(image: MemoryImage, samplingFactor?: number): Uint8Array;
    /**
     * Encode an animation to the GIF format.
     *
     * The **samplingFactor** specifies the sampling factor for
     * NeuQuant image quantization. It is responsible for reducing
     * the amount of unique colors in your images to 256.
     * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
     * a sampling factor of 10 gives you a reasonable trade-off between
     * image quality and quantization speed.
     * If you know that you have less than 256 colors in your frames
     * anyway, you should supply a very large **samplingFactor** for maximum performance.
     *
     * Here, `30` is used a default value for the **samplingFactor** as
     * encoding animations is usually a process that takes longer than
     * encoding a single image (see **encodeGif**).
     */
    export function encodeGifAnimation(animation: FrameAnimation, samplingFactor?: number): Uint8Array | undefined;
    /**
     * Decode a TIFF formatted image.
     */
    export function decodeTiff(data: TypedArray): MemoryImage | undefined;
    /**
     * Decode an multi-image (animated) TIFF file. If the tiff doesn't have
     * multiple images, the animation will contain a single frame with the tiff's
     * image.
     */
    export function decodeTiffAnimation(data: TypedArray): FrameAnimation | undefined;
    /**
     * Encode an image to the TIFF format.
     */
    export function encodeTiff(image: MemoryImage): Uint8Array;
    /**
     * Decode a BMP formatted image.
     */
    export function decodeBmp(data: TypedArray): MemoryImage | undefined;
    /**
     * Encode an image to the BMP format.
     */
    export function encodeBmp(image: MemoryImage): Uint8Array;
    /**
     * Encode an image to the ICO format.
     */
    export function encodeIco(image: MemoryImage): Uint8Array;
    /**
     * Encode a list of images to the ICO format.
     */
    export function encodeIcoImages(images: MemoryImage[]): Uint8Array;
    /**
     * Decode an ICO image.
     */
    export function decodeIco(data: TypedArray): MemoryImage | undefined;
}
