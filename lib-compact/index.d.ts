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
declare module "common/list-utils" {
    import { TypedArray } from "common/typings";
    export abstract class ListUtils {
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
declare module "common/exif_data" {
    export type ExifDataType = string | number;
    export interface ExifDataInitOptions {
        data?: Map<number, ExifDataType>;
        rawData?: Uint8Array[];
    }
    /**
     * Exif data stored with an image.
     */
    export class ExifData {
        static readonly ORIENTATION = 274;
        private _rawData?;
        get rawData(): Uint8Array[] | undefined;
        private _data;
        get data(): Map<number, ExifDataType>;
        get hasRawData(): boolean;
        get hasOrientation(): boolean;
        get orientation(): number | undefined;
        constructor(options?: ExifDataInitOptions);
        static from(other?: ExifData): ExifData;
        addRowData(data: Uint8Array): void;
    }
}
declare module "common/iccp-compression-mode" {
    /** @format */
    export enum ICCPCompressionMode {
        none = 0,
        deflate = 1
    }
}
declare module "common/icc_profile_data" {
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
declare module "formats/util/interpolation" {
    /** @format */
    export enum Interpolation {
        nearest = 0,
        linear = 1,
        cubic = 2,
        average = 3
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
declare module "common/clamp" {
    /** @format */
    export abstract class Clamp {
        static clamp(number: number, low: number, high: number): number;
        /**
         * Clamp [x] to [a] [b]
         */
        static clampInt(x: number, a: number, b: number): number;
        /**
         * Clamp [x] to [0, 255]
         */
        static clampInt255(x: number): number;
    }
}
declare module "common/bit-operators" {
    /** @format */
    export abstract class BitOperators {
        private static readonly uint8arr;
        private static readonly uint8ToInt8arr;
        private static readonly uint16arr;
        private static readonly uint16ToInt16arr;
        private static readonly uint32arr;
        private static readonly uint32ToInt32arr;
        private static readonly uint32ToFloat32arr;
        private static readonly int32arr;
        private static readonly int32ToUint32arr;
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
         * Binary conversion to an int16. This is equivalent in C to
         * typecasting to a short.
         */
        static toInt16(d: number): number;
        /**
         * Binary conversion to an int32. This is equivalent in C to
         * typecasting to signed int.
         */
        static toInt32(d: number): number;
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
        /**
         * Binary conversion of an int32 to a uint32. This is equivalent in C to
         * typecasting to unsigned int.
         */
        static toUint32(d: number): number;
        static debugBits32(value?: number): string;
    }
}
declare module "common/color-utils" {
    /** @format */
    import { ColorChannel } from "common/color-channel";
    export abstract class ColorUtils {
        /**
         * Returns a new color of [src] alpha-blended onto [dst]. The opacity of [src]
         * is additionally scaled by [fraction] / 255.
         */
        static alphaBlendColors(dst: number, src: number, fraction?: number): number;
        /**
         * Get the [channel] from the [color].
         */
        static getChannel(color: number, channel: ColorChannel): number;
        /**
         * Get the alpha channel from the [color].
         */
        static getAlpha(color: number): number;
        /**
         * Get the blue channel from the [color].
         */
        static getBlue(color: number): number;
        /**
         * Get the color with the given [r], [g], [b], and [a] components.
         * The channel order of a uint32 encoded color is RGBA.
         */
        static getColor(r: number, g: number, b: number, a?: number): number;
        /**
         * Get the green channel from the [color].
         */
        static getGreen(color: number): number;
        /**
         * Returns the luminance (grayscale) value of the [color].
         */
        static getLuminance(color: number): number;
        /**
         * Returns the luminance (grayscale) value of the color.
         */
        static getLuminanceRgb(r: number, g: number, b: number): number;
        /**
         * Get the red channel from the [color].
         */
        static getRed(color: number): number;
        /**
         * Check if [color] is white
         */
        static isBlack(color: number): boolean;
        /**
         * Check if [color] is white
         */
        static isWhite(color: number): boolean;
        /**
         * Returns a new color where the alpha channel of [color] has been replaced by [value].
         */
        static setAlpha(color: number, value: number): number;
        /**
         * Returns a new color where the blue channel of [color] has been replaced by [value].
         */
        static setBlue(color: number, value: number): number;
        /**
         * Returns a new color, where the given [color]'s [channel] has been
         * replaced with the given [value].
         */
        static setChannel(color: number, channel: ColorChannel, value: number): number;
        /**
         * Returns a new color where the green channel of [color] has been replaced
         * by [value].
         */
        static setGreen(color: number, value: number): number;
        /**
         * Returns a new color where the red channel of [color] has been replaced
         * by [value].
         */
        static setRed(color: number, value: number): number;
        /**
         * Convert an HSL color to RGB, where h is specified in normalized degrees
         * [0, 1] (where 1 is 360-degrees); s and l are in the range [0, 1].
         * Returns a list [r, g, b] with values in the range [0, 255].
         */
        static hslToRgb(hue: number, saturation: number, lightness: number): number[];
        /**
         * Convert an HSV color to RGB, where h is specified in normalized degrees
         * [0, 1] (where 1 is 360-degrees); s and l are in the range [0, 1].
         * Returns a list [r, g, b] with values in the range [0, 255].
         */
        static hsvToRgb(hue: number, saturation: number, brightness: number): number[];
        /**
         * Convert an RGB color to HSL, where r, g and b are in the range [0, 255].
         * Returns a list [h, s, l] with values in the range [0, 1].
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
         * Convert a CMYK color to RGB, where c, m, y, k values are in the range
         * [0, 255]. Returns a list [r, g, b] with values in the range [0, 255].
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
declare module "common/memory-image" {
    /** @format */
    import { ExifData } from "common/exif_data";
    import { ICCProfileData } from "common/icc_profile_data";
    import { Interpolation } from "formats/util/interpolation";
    import { RgbChannelSet } from "common/rgb-channel-set";
    import { DisposeMode } from "common/dispose-mode";
    import { BlendMode } from "common/blend-mode";
    import { ColorModel } from "common/color-model";
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
     * This is to be consistent with the Flutter image data. You can use
     * [getBytes] to access the pixel data at the byte (channel) level, optionally
     * providing the format to get the image data as. You can use the letious color
     * functions, such as [getRed], [getGreen], [getBlue], and [getAlpha] to access
     * the individual channels of a given pixel color.
     *
     * If this image is a frame of an animation as decoded by the [decodeFrame]
     * method of [Decoder], then the [xOffset], [yOffset], [width] and [height]
     * determine the area of the canvas this image should be drawn into,
     * as some frames of an animation only modify part of the canvas (recording
     * the part of the frame that actually changes). The [decodeAnimation] method
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
         * [format] defines the order of color channels in [bytes].
         * An HTML canvas element stores colors in Format.rgba format; a Flutter
         * Image object stores colors in Format.rgba format.
         * The length of [bytes] should be (width * height) * format-byte-count,
         * where format-byte-count is 1, 3, or 4 depending on the number of
         * channels in the format (luminance, rgb, rgba, etc).
         *
         * The native format of an image is Format.rgba. If another format
         * is specified, the input data will be converted to rgba to store
         * in the Image.
         *
         * For example, given an Html Canvas, you could create an image:
         * let bytes = canvas.getContext('2d').getImageData(0, 0,
         *   canvas.width, canvas.height).data;
         * let image = Image.fromBytes(canvas.width, canvas.height, bytes,
         *                             format: Format.rgba);
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
         * Specifying the [format] will convert the image data to the specified
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
         * Set all of the pixels of the image to the given [color].
         */
        fill(color: number): MemoryImage;
        /**
         * Set all of the empty pixels (for png's) of the image to the given [color].
         */
        fillBackground(color: number): void;
        /**
         * Add the colors of [other] to the pixels of this image.
         */
        addImage(other: MemoryImage): MemoryImage;
        /**
         * Subtract the colors of [other] from the pixels of this image.
         */
        subtractImage(other: MemoryImage): MemoryImage;
        /**
         * Multiply the colors of [other] with the pixels of this image.
         */
        multiplyImage(other: MemoryImage): MemoryImage;
        /**
         * OR the colors of [other] to the pixels of this image.
         */
        orImage(other: MemoryImage): MemoryImage;
        /**
         * AND the colors of [other] with the pixels of this image.
         */
        andImage(other: MemoryImage): MemoryImage;
        /**
         * Modula the colors of [other] with the pixels of this image.
         */
        modImage(other: MemoryImage): MemoryImage;
        /**
         * Get a pixel from the buffer. No range checking is done.\
         */
        getPixelByIndex(index: number): number;
        /**
         * Set a pixel in the buffer. No range checking is done.
         */
        setPixelByIndex(index: number, color: number): void;
        /**
         * Get the buffer index for the [x], [y] pixel coordinates.
         * No range checking is done.
         */
        getBufferIndex(x: number, y: number): number;
        /**
         * Is the given [x], [y] pixel coordinates within the resolution of the image.
         */
        boundsSafe(x: number, y: number): boolean;
        /**
         * Get the pixel from the given [x], [y] coordinate. Color is encoded in a
         * Uint32 as #AABBGGRR. No range checking is done.
         */
        getPixel(x: number, y: number): number;
        /**
         * Get the pixel from the given [x], [y] coordinate. Color is encoded in a
         * Uint32 as #AABBGGRR. If the pixel coordinates are out of bounds, 0 is
         * returned.
         */
        getPixelSafe(x: number, y: number): number;
        /**
         * Get the pixel using the given [interpolation] type for non-integer pixel
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
         * Set the pixel at the given [x], [y] coordinate to the [color].
         * No range checking is done.
         */
        setPixel(x: number, y: number, color: number): void;
        /**
         * Set the pixel at the given [x], [y] coordinate to the [color].
         * If the pixel coordinates are out of bounds, nothing is done.
         */
        setPixelSafe(x: number, y: number, color: number): void;
        /**
         * Set the pixel at the given [x], [y] coordinate to the color
         * [r], [g], [b], [a].
         *
         * This simply replaces the existing color, it does not do any alpha
         * blending. Use [drawPixel] for that. No range checking is done.
         */
        setPixelRgba(x: number, y: number, r: number, g: number, b: number, a?: number): void;
        /**
         * Return the average gray value of the image.
         */
        getWhiteBalance(asDouble?: boolean): number;
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
    }
    /**
     * Stores multiple images, most often as the frames of an animation.
     *
     * Some formats support multiple images that are not
     * to be interpreted as animation, but rather multiple pages of a document.
     * The [FrameAnimation] container is still used to store the images for these files.
     * The [frameType] property is used to differentiate multi-page documents from
     * multi-frame animations, where it is set to [FrameType.page] for documents
     * and [FrameType.animation] for animated frames.
     *
     * All [Decoder] classes support decoding to an [FrameAnimation], where the
     * [FrameAnimation] will only contain a single frame for single image formats
     * such as JPEG, or if the file doesn't contain any animation such as a single
     * image GIF. If you want to generically support both animated and non-animated
     * files, you can always decode to an animation and if the animation has only
     * a single frame, then it's a non-animated image.
     *
     * In some cases, the frames of the animation may only provide a portion of the
     * canvas, such as the case of animations encoding only the changing pixels
     * from one frame to the next. The [width] and [height] and [backgroundColor]
     * properties of the [FrameAnimation] provide information about the canvas that
     * contains the animation, and the [Image] frames provide information about
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
         * How should the frames be interpreted?  If [FrameType.animation], the
         * frames are part of an animated sequence. If [FrameType.page], the frames
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
         * Get the frame at the given[index].
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
     * full 32-bit precision. A list of Half floats can be stored in a [Uint16List],
     * and converted to a double using the [HalfToDouble] static method.
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
        /**
         * [data] will be one of the type data lists, depending on the [type] and
         * [bitsPerSample]. 16-bit FLOAT slices will be stored in a [Uint16List].
         */
        private readonly data;
        private readonly _name;
        get name(): string;
        private readonly _width;
        get width(): number;
        private readonly _height;
        get height(): number;
        /**
         * Indicates the type of data stored by the slice, either [HdrSlice.INT],
         * [HdrSlice.FLOAT], or [HdrSlice.UINT].
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
         * Create a copy of the [other] HdrSlice.
         */
        static from(other: HdrSlice): HdrSlice;
        /**
         * Get the raw bytes of the data buffer.
         */
        getBytes(): Uint8Array;
        /**
         * Get the float value of the sample at the coordinates [x],[y].
         * [Half] samples are converted to double.
         */
        getFloat(x: number, y: number): number;
        /**
         * Set the float value of the sample at the coordinates [x],[y] for
         * [FLOAT] slices.
         */
        setFloat(x: number, y: number, v: number): void;
        /**
         * Get the int value of the sample at the coordinates [x],[y].
         * An exception will occur if the slice stores FLOAT data.
         */
        getInt(x: number, y: number): number;
        /**
         * Set the int value of the sample at the coordinates [x],[y] for [INT] and
         * [UINT] slices.
         */
        setInt(x: number, y: number, v: number): void;
    }
}
declare module "hdr/hdr-image" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
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
        private readonly slices;
        private red?;
        private green?;
        private blue?;
        private alpha?;
        private depth?;
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
         * Create a copy of the [other] HdrImage.
         */
        static from(other: HdrImage): HdrImage;
        /**
         * Create an HDR image from a LDR [Image] by transforming the channel values
         * to the range [0, 1].
         */
        static fromImage(other: MemoryImage, type?: number, bitsPerSample?: number): HdrImage;
        /**
         * Get the value of the red channel at the given pixel coordinates [x], [y].
         */
        getRed(x: number, y: number): number;
        /**
         * Set the value of the red channel at the given pixel coordinates [x], [y].
         */
        setRed(x: number, y: number, c: number): void;
        setRedInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the green channel at the given pixel coordinates [x], [y].
         */
        getGreen(x: number, y: number): number;
        /**
         * Set the value of the green channel at the given pixel coordinates [x], [y].
         */
        setGreen(x: number, y: number, c: number): void;
        setGreenInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the blue channel at the given pixel coordinates [x], [y].
         */
        getBlue(x: number, y: number): number;
        /**
         * Set the value of the blue channel at the given pixel coordinates [x], [y].
         */
        setBlue(x: number, y: number, c: number): void;
        setBlueInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the alpha channel at the given pixel coordinates [x], [y].
         */
        getAlpha(x: number, y: number): number;
        /**
         * Set the value of the alpha channel at the given pixel coordinates [x], [y].
         */
        setAlpha(x: number, y: number, c: number): void;
        setAlphaInt(x: number, y: number, c: number): void;
        /**
         * Get the value of the depth channel at the given pixel coordinates [x], [y].
         */
        getDepth(x: number, y: number): number;
        /**
         * Set the value of the depth channel at the given pixel coordinates [x], [y].
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
         * Add a channel [slice] to the
         */
        addChannel(slice: HdrSlice): void;
        /**
         * Convert the framebuffer to an floating-point image, as a sequence of
         * floats in RGBA order.
         */
        toFloatRgba(): Float32Array;
    }
}
declare module "common/text-codec" {
    export abstract class TextCodec {
        static readonly utf8Decoder: TextDecoder;
        static readonly latin1Decoder: TextDecoder;
        static getCodePoints(str: string): Uint8Array;
    }
}
declare module "formats/util/input-buffer" {
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
         * Create a copy of [other].
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
         * Set a range of bytes in this buffer to [value], at [start] offset from the
         * current read position, and [length] number of bytes.
         */
        memset(start: number, length: number, value: number): void;
        /**
         * Return a InputStream to read a subset of this stream. It does not
         * move the read position of this stream. [position] is specified relative
         * to the start of the buffer. If [position] is not specified, the current
         * read position is used. If [length] is not specified, the remainder of this
         * stream is used.
         */
        subarray(count: number, position?: number, offset?: number): InputBuffer;
        /**
         * Returns the position of the given [value] within the buffer, starting
         * from the current read position with the given [offset]. The position
         * returned is relative to the start of the buffer, or -1 if the [value]
         * was not found.
         */
        indexOf(value: number, offset?: number): number;
        /**
         * Read [count] bytes from an [offset] of the current read position, without
         * moving the read position.
         */
        peekBytes(count: number, offset?: number): InputBuffer;
        /**
         * Move the read position by [count] bytes.
         */
        skip(count: number): void;
        /**
         * Read a single byte.
         */
        readByte(): number;
        readInt8(): number;
        /**
         * Read [count] bytes from the stream.
         */
        readBytes(count: number): InputBuffer;
        /**
         * Read a null-terminated string, or if [length] is provided, that number of
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
declare module "formats/bmp/bitmap-file-header" {
    import { InputBuffer } from "formats/util/input-buffer";
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
    import { DecodeInfo } from "formats/decode-info";
    import { InputBuffer } from "formats/util/input-buffer";
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
     * In such cases, the [decodeImage] method will decode the first (or otherwise
     * specified with the [frame] parameter) frame of the file. [decodeAnimation]
     * will decode all frames from the image. [startDecode] will initiate
     * decoding of the file, and [decodeFrame] will then decode a specific frame
     * from the file, allowing for animations to be decoded one frame at a time.
     * Some formats, such as TIFF, may store multiple frames, but their use of
     * frames is for multiple page documents and not animation. The terms
     * 'animation' and 'frames' simply refer to 'pages' in this case.
     *
     * If an image file does not have multiple frames, [decodeAnimation] and
     * [startDecode]/[decodeFrame] will return the single image of the
     * file. As such, if you are not sure if a file is animated or not, you can
     * use the animated functions and process it as a single frame image if it
     * has only 1 frame, and as an animation if it has more than 1 frame.
     *
     * Most animated formats do not store full images for frames, but rather
     * some frames will store full images and others will store partial 'change'
     * images. For these files, [decodeAnimation] will always return all images
     * fully composited, meaning full frame images. Decoding frames individually
     * using [startDecode] and [decodeFrame] will return the potentially partial
     * image. In this case, the [DecodeInfo] returned by [startDecode] will include
     * the width and height resolution of the animation canvas, and each [Image]
     * returned by [decodeFrame] will have x, y, width and height properties
     * indicating where in the canvas the frame image should be drawn. It will
     * also have a disposeMethod property that specifies what should be done to
     * the canvas prior to drawing the frame: [Image.DISPOSE_NONE] indicates the
     * canvas should be left alone; [Image.DISPOSE_CLEAR] indicates the canvas
     * should be cleared. For partial frame images,[Image.DISPOSE_NONE] is used
     * so that the partial-frame is drawn on top of the previous frame, applying
     * it's changes to the image.
     */
    export interface Decoder {
        /**
         * How many frames are available to be decoded. [startDecode] should have
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
         * Decode a single frame from the data that was set with [startDecode].
         * If [frame] is out of the range of available frames, null is returned.
         * Non animated image files will only have [frame] 0. An [Image]
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(frame: number): MemoryImage | undefined;
        /**
         * Decode a single high dynamic range (HDR) frame from the data that was set
         * with [startDecode]. If the format of the file does not support HDR images,
         * the regular image will be converted to an HDR image as (color / 255).
         * If [frame] is out of the range of available frames, null is returned.
         * Non animated image files will only have [frame] 0. An [Image]
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeHdrFrame(frame: number): HdrImage | undefined;
        /**
         * Decode all of the frames from an animation. If the file is not an
         * animation, a single frame animation is returned. If there was a problem
         * decoding the file, null is returned.
         */
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified [frame] will be decoded. If there was a problem
         * decoding the file, null is returned.
         */
        decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;
        /**
         * Decode the file and extract a single High Dynamic Range (HDR) image from
         * it. HDR images are stored in floating-poing values. If the format of the
         * file does not support HDR images, the regular image will be converted to
         * an HDR image as (color / 255). If the file is animated, the specified
         * [frame] will be decoded. If there was a problem decoding the file, null is
         * returned.
         */
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/bmp-decoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { BmpInfo } from "formats/bmp/bmp-info";
    import { DecodeInfo } from "formats/decode-info";
    import { Decoder } from "formats/decoder";
    import { InputBuffer } from "formats/util/input-buffer";
    export class BmpDecoder implements Decoder {
        protected input?: InputBuffer;
        protected info?: BmpInfo;
        get numFrames(): number;
        private pixelDataOffset;
        /**
         * Is the given file a valid BMP image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): DecodeInfo | undefined;
        /**
         * Decode a single frame from the data stat was set with [startDecode].
         * If [frame] is out of the range of available frames, null is returned.
         * Non animated image files will only have [frame] 0. An [AnimationFrame]
         * is returned, which provides the image, and top-left coordinates of the
         * image, as animated frames may only occupy a subset of the canvas.
         */
        decodeFrame(_: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        /**
         * Decode all of the frames from an animation. If the file is not an
         * animation, a single frame animation is returned. If there was a problem
         * decoding the file, null is returned.
         */
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        /**
         * Decode the file and extract a single image from it. If the file is
         * animated, the specified [frame] will be decoded. If there was a problem
         * decoding the file, null is returned.
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
         * Encode an animation. Not all formats support animation, and null
         * will be returned if not.
         */
        encodeAnimation(animation: FrameAnimation): Uint8Array | undefined;
    }
}
declare module "formats/util/output-buffer" {
    import { InputBuffer } from "formats/util/input-buffer";
    export interface OutputBufferInitOptions {
        bigEndian?: boolean;
        size?: number;
    }
    export class OutputBuffer {
        private static readonly BLOCK_SIZE;
        private _buffer;
        get buffer(): Uint8Array;
        private readonly _bigEndian;
        get bigEndian(): boolean;
        private _length;
        set length(v: number);
        get length(): number;
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
         * Return the subarray of the buffer in the range [start:end].
         * If [start] or [end] are < 0 then it is relative to the end of the buffer.
         * If [end] is not specified (or null), then it is the end of the buffer.
         * This is equivalent to the python list range operator.
         */
        subarray(start: number, end?: number): Uint8Array;
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
declare module "draw/draw-pixel" {
    import { MemoryImage } from "common/memory-image";
    /**
     * Draw a single pixel into the image, applying alpha and opacity blending.
     */
    export function drawPixel(image: MemoryImage, x: number, y: number, color: number, opacity?: number): MemoryImage;
}
declare module "transform/copy-into" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    /**
     * Copies a rectangular portion of one image to another image. [dst] is the
     * destination image, [src] is the source image identifier.
     *
     * In other words, copyInto will take an rectangular area from src of
     * width [src_w] and height [src_h] at position ([src_x],[src_y]) and place it
     * in a rectangular area of [dst] of width [dst_w] and height [dst_h] at
     * position ([dst_x],[dst_y]).
     *
     * If the source and destination coordinates and width and heights differ,
     * appropriate stretching or shrinking of the image fragment will be performed.
     * The coordinates refer to the upper left corner. This function can be used to
     * copy regions within the same image (if [dst] is the same as [src])
     * but if the regions overlap the results will be unpredictable.
     *
     * [dstX] and [dstY] represent the X and Y position where the [src] will start
     * printing.
     */
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
    export abstract class CopyIntoTransform {
        /**
         * if [center] is true, the [src] will be centered in [dst].
         */
        static copyInto(options: CopyIntoOptions): MemoryImage;
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
    import { InputBuffer } from "formats/util/input-buffer";
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
         * block in if buffer empty) and returns null on failure.
         */
        private bufferedInput;
        private initDecode;
        /**
         * Is the given file a valid Gif image?
         */
        isValidFile(bytes: Uint8Array): boolean;
        /**
         * Validate the file is a Gif image and get information about it.
         * If the file is not a valid Gif image, null is returned.
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
declare module "formats/util/dither-kernel" {
    /** @format */
    export enum DitherKernel {
        None = 0,
        FalseFloydSteinberg = 1,
        FloydSteinberg = 2,
        Stucki = 3,
        Atkinson = 4
    }
}
declare module "formats/util/quantizer" {
    /** @format */
    export interface Quantizer {
        /**
         * Find the index of the closest color to [c] in the [colorMap].
         */
        getQuantizedColor(c: number): number;
    }
}
declare module "formats/util/neural-quantizer" {
    import { MemoryImage } from "common/memory-image";
    import { Quantizer } from "formats/util/quantizer";
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
         * How many colors are in the [colorMap]?
         */
        get numColors(): number;
        /**
         * 10 is a reasonable [samplingFactor] according to
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
         * Get a color from the [colorMap].
         */
        color(index: number): number;
        /**
         * Find the index of the closest color to [c] in the [colorMap].
         */
        lookup(c: number): number;
        /**
         * Find the index of the closest color to [r],[g],[b] in the [colorMap].
         */
        lookupRGB(r: number, g: number, b: number): number;
        /**
         * Find the color closest to [c] in the [colorMap].
         */
        getQuantizedColor(c: number): number;
        /**
         * Convert the [image] to an index map, mapping to this [colorMap].
         */
        getIndexMap(image: MemoryImage): Uint8Array;
    }
}
declare module "formats/util/dither-pixel" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { DitherKernel } from "formats/util/dither-kernel";
    import { NeuralQuantizer } from "formats/util/neural-quantizer";
    export abstract class DitherPixel {
        private static ditherKernels;
        static getDitherPixels(image: MemoryImage, quantizer: NeuralQuantizer, kernel: DitherKernel, serpentine: boolean): Uint8Array;
    }
}
declare module "formats/gif-encoder" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { Encoder } from "formats/encoder";
    import { DitherKernel } from "formats/util/dither-kernel";
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
         * Encode the images that were added with [addFrame].
         * After this has been called (returning the finishes GIF),
         * calling [addFrame] for a new animation or image is safe again.
         *
         * [addFrame] will not encode the first image passed and after that
         * always encode the previous image. Hence, the last image needs to be
         * encoded here.
         */
        private finish;
        /**
         * This adds the frame passed to [image].
         * After the last frame has been added, [finish] is required to be called.
         * Optional frame [duration] is in 1/100 sec.
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
    import { BmpDecoder } from "formats/bmp-decoder";
    import { BmpInfo } from "formats/bmp/bmp-info";
    import { InputBuffer } from "formats/util/input-buffer";
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
    import { DecodeInfo } from "formats/decode-info";
    import { InputBuffer } from "formats/util/input-buffer";
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
declare module "common/color" {
    /**
     * Image pixel colors are instantiated as an int object rather than an instance
     * of the Color class in order to reduce object allocations.
     */
    export abstract class Color {
        /**
         * Create a color value from RGB values in the range [0, 255].
         *
         * The channel order of a uint32 encoded color is BGRA.
         */
        static fromRgb(red: number, green: number, blue: number): number;
        /**
         * Create a color value from RGBA values in the range [0, 255].
         *
         * The channel order of a uint32 encoded color is BGRA.
         */
        static fromRgba(red: number, green: number, blue: number, alpha: number): number;
        /**
         * Create a color value from HSL values in the range [0, 1].
         */
        static fromHsl(hue: number, saturation: number, lightness: number): number;
        /**
         * Create a color value from HSV values in the range [0, 1].
         */
        static fromHsv(hue: number, saturation: number, value: number): number;
        /**
         * Create a color value from XYZ values.
         */
        static fromXyz(x: number, y: number, z: number): number;
        /**
         * Create a color value from CIE-L*ab values.
         */
        static fromLab(L: number, a: number, b: number): number;
        /**
         * Compare colors from a 3 or 4 dimensional color space
         */
        static distance(c1: number[], c2: number[], compareAlpha: boolean): number;
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
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { DecodeInfo } from "formats/decode-info";
    import { Decoder } from "formats/decoder";
    import { PngInfo } from "formats/png/png-info";
    import { InputBuffer } from "formats/util/input-buffer";
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
         * Decode the frame (assuming [startDecode] has already been called).
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
    import { MemoryImage } from "common/memory-image";
    import { HdrImage } from "hdr/hdr-image";
    import { DecodeInfo } from "formats/decode-info";
    import { Decoder } from "formats/decoder";
    import { IcoInfo } from "formats/ico/ico-info";
    import { InputBuffer } from "formats/util/input-buffer";
    export class IcoDecoder implements Decoder {
        _input?: InputBuffer;
        _icoInfo?: IcoInfo;
        get numFrames(): number;
        isValidFile(bytes: Uint8Array): boolean;
        startDecode(bytes: Uint8Array): DecodeInfo | undefined;
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
    import { InputBuffer } from "formats/util/input-buffer";
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
    import { InputBuffer } from "formats/util/input-buffer";
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
    /**
     * /* eslint-disable @typescript-eslint/no-non-null-assertion
     *
     * @format
     */
    /** @format */
    import { ExifData } from "common/exif_data";
    import { MemoryImage } from "common/memory-image";
    import { InputBuffer } from "formats/util/input-buffer";
    import { ComponentData } from "formats/jpeg/component-data";
    import { JpegAdobe } from "formats/jpeg/jpeg-adobe";
    import { JpegFrame } from "formats/jpeg/jpeg-frame";
    import { JpegInfo } from "formats/jpeg/jpeg-info";
    import { JpegJfif } from "formats/jpeg/jpeg-jfif";
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
        private static readExifValue;
        private static buildHuffmanTable;
        private static buildComponentData;
        static toFix(val: number): number;
        private readBlock;
        private nextMarker;
        private readExifDir;
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
    import { DecodeInfo } from "formats/decode-info";
    import { Decoder } from "formats/decoder";
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
        startDecode(bytes: Uint8Array): DecodeInfo | undefined;
        decodeFrame(_: number): MemoryImage | undefined;
        decodeHdrFrame(frame: number): HdrImage | undefined;
        decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;
        decodeImage(bytes: Uint8Array, _?: number): MemoryImage | undefined;
        decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
    }
}
declare module "formats/jpeg-encoder" {
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
declare module "index" {
    /** @format */
    import { FrameAnimation } from "common/frame-animation";
    import { MemoryImage } from "common/memory-image";
    import { CompressionLevel, TypedArray } from "common/typings";
    import { Decoder } from "formats/decoder";
    export { BitOperators } from "common/bit-operators";
    export { BlendMode } from "common/blend-mode";
    export { Clamp } from "common/clamp";
    export { ColorChannel } from "common/color-channel";
    export { ColorModel } from "common/color-model";
    export { ColorUtils } from "common/color-utils";
    export { Color } from "common/color";
    export { Crc32 } from "common/crc32";
    export { DisposeMode } from "common/dispose-mode";
    export { ExifData } from "common/exif_data";
    export { FrameAnimation } from "common/frame-animation";
    export { FrameType } from "common/frame-type";
    export { ICCProfileData } from "common/icc_profile_data";
    export { ICCPCompressionMode } from "common/iccp-compression-mode";
    export { ListUtils } from "common/list-utils";
    export { MemoryImage } from "common/memory-image";
    export { RgbChannelSet } from "common/rgb-channel-set";
    export { TextCodec } from "common/text-codec";
    export { CompressionLevel, TypedArray } from "common/typings";
    export { drawPixel } from "draw/draw-pixel";
    export { BmpDecoder } from "formats/bmp-decoder";
    export { BmpEncoder } from "formats/bmp-encoder";
    export { DecodeInfo } from "formats/decode-info";
    export { Decoder } from "formats/decoder";
    export { Encoder } from "formats/encoder";
    export { GifDecoder } from "formats/gif-decoder";
    export { GifEncoder } from "formats/gif-encoder";
    export { IcoDecoder } from "formats/ico-decoder";
    export { IcoEncoder } from "formats/ico-encoder";
    export { JpegDecoder } from "formats/jpeg-decoder";
    export { JpegEncoder } from "formats/jpeg-encoder";
    export { PngDecoder } from "formats/png-decoder";
    export { PngEncoder } from "formats/png-encoder";
    /**
     * Find a [Decoder] that is able to decode the given image [data].
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
     * file and using that decoder to decode the file into an [Animation]
     * containing one or more [Image] frames.
     */
    export function decodeAnimation(data: TypedArray): FrameAnimation | undefined;
    /**
     * Return the [Decoder] that can decode image with the given [name],
     * by looking at the file extension. See also [findDecoderForData] to
     * determine the decoder to use given the bytes of the file.
     */
    export function getDecoderForNamedImage(name: string): Decoder | undefined;
    /**
     * Identify the format of the image using the file extension of the given
     * [name], and decode the given file [bytes] to an [FrameAnimation] with one or more
     * [MemoryImage] frames. See also [decodeAnimation].
     */
    export function decodeNamedAnimation(data: TypedArray, name: string): FrameAnimation | undefined;
    /**
     * Identify the format of the image using the file extension of the given
     * [name], and decode the given file [bytes] to a single frame [Image]. See
     * also [decodeImage].
     */
    export function decodeNamedImage(data: TypedArray, name: string): MemoryImage | undefined;
    /**
     * Identify the format of the image and encode it with the appropriate
     * [Encoder].
     */
    export function encodeNamedImage(image: MemoryImage, name: string): Uint8Array | undefined;
    /**
     * Decode a JPG formatted image.
     */
    export function decodeJpg(data: TypedArray): MemoryImage | undefined;
    /**
     * Renamed to [decodeJpg], left for backward compatibility.
     */
    export function readJpg(data: TypedArray): MemoryImage | undefined;
    /**
     * Encode an image to the JPEG format.
     */
    export function encodeJpg(image: MemoryImage, quality?: number): Uint8Array;
    /**
     * Renamed to [encodeJpg], left for backward compatibility.
     */
    export function writeJpg(image: MemoryImage, quality?: number): Uint8Array;
    /**
     * Decode a PNG formatted image.
     */
    export function decodePng(data: TypedArray): MemoryImage | undefined;
    /**
     * Decode a PNG formatted animation.
     */
    export function decodePngAnimation(data: TypedArray): FrameAnimation | undefined;
    /**
     * Renamed to [decodePng], left for backward compatibility.
     */
    export function readPng(data: TypedArray): MemoryImage | undefined;
    /**
     * Encode an image to the PNG format.
     */
    export function encodePng(image: MemoryImage, level?: CompressionLevel): Uint8Array;
    /**
     * Encode an animation to the PNG format.
     */
    export function encodePngAnimation(animation: FrameAnimation, level?: CompressionLevel): Uint8Array | undefined;
    /**
     * Renamed to [encodePng], left for backward compatibility.
     */
    export function writePng(image: MemoryImage, level?: CompressionLevel): Uint8Array;
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
     * The [samplingFactor] specifies the sampling factor for
     * NeuQuant image quantization. It is responsible for reducing
     * the amount of unique colors in your images to 256.
     * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
     * a sampling factor of 10 gives you a reasonable trade-off between
     * image quality and quantization speed.
     * If you know that you have less than 256 colors in your frames
     * anyway, you should supply a very large [samplingFactor] for maximum performance.
     */
    export function encodeGif(image: MemoryImage, samplingFactor?: number): Uint8Array;
    /**
     * Encode an animation to the GIF format.
     *
     * The [samplingFactor] specifies the sampling factor for
     * NeuQuant image quantization. It is responsible for reducing
     * the amount of unique colors in your images to 256.
     * According to https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/,
     * a sampling factor of 10 gives you a reasonable trade-off between
     * image quality and quantization speed.
     * If you know that you have less than 256 colors in your frames
     * anyway, you should supply a very large [samplingFactor] for maximum performance.
     *
     * Here, `30` is used a default value for the [samplingFactor] as
     * encoding animations is usually a process that takes longer than
     * encoding a single image (see [encodeGif]).
     */
    export function encodeGifAnimation(animation: FrameAnimation, samplingFactor?: number): Uint8Array | undefined;
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
declare module "transform/copy-rotate" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { Interpolation } from "formats/util/interpolation";
    export abstract class CopyRotateTransform {
        /**
         * Returns a copy of the [src] image, rotated by [angle] degrees.
         */
        static copyRotate(src: MemoryImage, angle: number, interpolation?: Interpolation): MemoryImage;
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
declare module "transform/flip" {
    /** @format */
    import { MemoryImage } from "common/memory-image";
    import { FlipDirection } from "transform/flip-direction";
    export abstract class FlipTransform {
        /**
         * Flips the [src] image using the given [mode], which can be one of:
         * [Flip.horizontal], [Flip.vertical], or [Flip.both].
         */
        static flip(src: MemoryImage, direction: FlipDirection): MemoryImage;
        /**
         * Flip the [src] image vertically.
         */
        static flipVertical(src: MemoryImage): MemoryImage;
        /**
         * Flip the src image horizontally.
         */
        static flipHorizontal(src: MemoryImage): MemoryImage;
    }
}
declare module "transform/bake-orientation" {
    import { MemoryImage } from "common/memory-image";
    export abstract class BakeOrientationTransform {
        /**
         * If [image] has an orientation value in its exif data, this will rotate the
         * image so that it physically matches its orientation. This can be used to
         * bake the orientation of the image for image formats that don't support exif
         * data.
         */
        static bakeOrientation(image: MemoryImage): MemoryImage;
    }
}
declare module "transform/copy-resize" {
    import { MemoryImage } from "common/memory-image";
    import { Interpolation } from "formats/util/interpolation";
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
    export abstract class CopyResizeTransform {
        /**
         * Returns a resized copy of the [src] image.
         * If [height] isn't specified, then it will be determined by the aspect
         * ratio of [src] and [width].
         * If [width] isn't specified, then it will be determined by the aspect ratio
         * of [src] and [height].
         */
        static copyResize(options: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight): MemoryImage;
    }
}
