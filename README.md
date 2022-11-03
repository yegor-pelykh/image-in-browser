Table of contents
=================

* [Overview](#overview)
* [Performance Warning](#performance-warning)
* [Supported Image Formats](#supported-image-formats)
* [Example](#example)
* [Format Decoding Functions](#format-decoding-functions)
    * [Generic Decoding Functions](#generic-decoding-functions)
    * [Format-Specific Decoding Functions](#format-specific-decoding-functions)
* [Format Encoding Functions](#format-encoding-functions)
    * [Generic Encoding Functions](#generic-encoding-functions)
    * [Format-Specific Encoding Functions](#format-specific-encoding-functions)
* [Image Filter Functions](#image-filter-functions)
* [Image Transform Functions](#image-transform-functions)
* [Drawing Functions](#drawing-functions)
* [Contributing](#contributing)
* [Links](#links)

Overview
========

**image-in-browser** is an NPM package providing the ability to load, save and manipulate images of different file formats.

- works both in Node.js and in the browser (no need for server-side Node.js)
- written entirely in Typescript with transpiling into Javascript
- fully compatible with the ES6 standard and provides typings for use with Typescript
- may be used as an NPM package or as a compact Javascript bundled compiled into a single file

This library may be especially useful when you need to work with static or animated images directly in the browser code when the code is isolated from the system it's running on.

Performance Warning
===================

Since this library is written entirely in Typescript and is not a native executable library, its performance will not be as fast as a the native library.

Supported Image Formats
=======================

The following formats are currently supported for encoding / decoding:

- BMP,
- GIF / Animated GIF,
- ICO,
- JPEG,
- PNG / Animated APNG,
- TGA,
- TIFF

Example
=======

This example demonstrates sample use cases for the library:
- load a PNG file,
- reduce its size,
- apply a vignette filter,
- save it as an ICO file

```ts
import { readFileSync, writeFileSync } from 'fs';


function createThumbnail() {
  const input = readFileSync('test.png');

  // decoding PNG bytes to MemoryImage
  const image = decodePng(input);
  if (image !== undefined) {

    // making resized thumbnail
    const thumbnail = ImageTransform.copyResize({
      image: image,
      width: 150,
    });

    // applying vignette filter
    ImageFilter.vignette({
      src: thumbnail,
    });

    // encoding MemoryImage to ICO bytes
    const output = encodeIco(thumbnail);
    
    writeFileSync('thumbnail.ico', output);
  }
}
```

Format Decoding Functions
=========================

Decoding is the process by which the byte content of an image file is converted into an object of type MemoryImage in RAM.

The following functions provide a high level interface for decoding images. You can also use the format specific Decoder classes to access format-specific data.

> ℹ️ These methods take input of type `TypedArray`, which is short union of types: `Int8Array` | `Int16Array` | `Int32Array` | `Uint8Array` | `Uint16Array` | `Uint32Array` | `Float32Array` | `Float64Array`.

## Generic Decoding Functions

> ⚠️ Because these functions have to determine the format of the image before they can decode it, it is preferable to use a format specific decoding function, such as `decodeJpg`, if you know what the format is.

---
```ts
decodeImage(data: TypedArray): MemoryImage | undefined
```

Decode an image, determining the format of the file by analyzing the bytes. If the file is an animated image, the first frame is decoded.

**Parameters**:
- **data**: The content of the image file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodeAnimation(data: TypedArray): FrameAnimation | undefined
```

Decode a potentially animated image, determining the format of the file by analyzing the bytes. If the image isn't animated (a JPEG image, a non-animated GIF, etc), the returned `FrameAnimation` will contain a single frame containing the decoded image.

**Parameters**:
- **data**: The content of the image file of type `TypedArray`.

**Returns:** the decoded `FrameAnimation` or `undefined` if the data cannot be decoded.

---
```ts
decodeNamedImage(data: TypedArray, name: string): MemoryImage | undefined
```

Identify the format of the image using the file extension provided by `name`, and decode it with the appropriate decoder. For example, `decodeNamedImage(imageData, 'image.jpg')` will decode the image as a JPEG.

**Parameters**:
- **data**: The content of the image file of type `TypedArray`.
- **data**: The name of the file (used to identify format from the file extension).

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
findDecoderForData(data: TypedArray): Decoder | undefined
```

Returns the Decoder that can decode the given image data.

**Parameters**:
- **data**: The content of the image file of type `TypedArray`.

**Returns:** the `Decoder` that can decode the given image data or `undefined` if no matching decoder is found.

## Format-Specific Decoding Functions

---
```ts
decodeBmp(data: TypedArray): MemoryImage | undefined
```
Decode a BMP formatted image.

**Parameters**:
- **data**: The contents of the BMP file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodeGif(data: TypedArray): MemoryImage | undefined
```
Decode a GIF formatted image. If the GIF is animated, the first frame is returned.

**Parameters**:
- **data**: The contents of the GIF file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodeGifAnimation(data: TypedArray): FrameAnimation | undefined
```
Decode an animated GIF file. If the GIF isn't animated, the animation will contain a single frame.

**Parameters**:
- **data**: The contents of the GIF file of type `TypedArray`.

**Returns:** the decoded `FrameAnimation` or `undefined` if the data cannot be decoded.

---
```ts
decodeIco(data: TypedArray): MemoryImage | undefined
```
Decode an ICO formatted image.

**Parameters**:
- **data**: The contents of the ICO file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodeJpg(data: TypedArray): MemoryImage | undefined
```
Decode a JPEG formatted image.

**Parameters**:
- **data**: The contents of the JPEG file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodePng(data: TypedArray): MemoryImage | undefined
```
Decode a PNG formatted image. If the PNG is animated, the first frame is decoded.

**Parameters**:
- **data**: The contents of the PNG file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodePngAnimation(data: TypedArray): FrameAnimation | undefined
```
Decode a PNG formatted animation. If the PNG isn't animated, the animation will contain a single frame.

**Parameters**:
- **data**: The contents of the PNG file of type `TypedArray`.

**Returns:** the decoded `FrameAnimation` or `undefined` if the data cannot be decoded.

---
```ts
decodeTga(data: TypedArray): MemoryImage | undefined
```
Decode a TGA (Targa) formatted image.

**Parameters**:
- **data**: The contents of the TGA file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodeTiff(data: TypedArray): MemoryImage | undefined
```
Decode a TIFF formatted image.

**Parameters**:
- **data**: The contents of the TIFF file of type `TypedArray`.

**Returns:** the decoded `MemoryImage` or `undefined` if the data cannot be decoded.

---
```ts
decodeTiffAnimation(data: TypedArray): FrameAnimation | undefined
```
Decode a multi-image TIFF file. If the TIFF doesn't have multiple images, the animation will contain a single image.

**Parameters**:
- **data**: The contents of the TIFF file of type `TypedArray`.

**Returns:** the decoded `FrameAnimation` or `undefined` if the data cannot be decoded.

Format Encoding Functions
=========================

Encoding is the process by which the object of type MemoryImage is converted into the byte content of an image file.

The following functions provide a high level interface for encoding images. You can also use the format specific Encoder classes to access format-specific data.

## Generic Encoding Functions

---
```ts
encodeNamedImage(image: MemoryImage, name: string): Uint8Array | undefined
```
Identify the format of the image and encode it with the appropriate encoder.

**Parameters**:
- **image**: the `MemoryImage` to encode.
- **name**: The name of the image, used to derive the format to encode with from the extension.
Returns: the encoded bytes.

**Returns:** the encoded bytes of type `Uint8Array` or `undefined` if no matching encoder is found.

## Format-Specific Encoding Functions

---
```ts
encodeBmp(image: MemoryImage): Uint8Array
```
Encode an image with the BMP format.

**Parameters**:
- **image**: the `MemoryImage` to encode.

**Returns:** the encoded bytes of type `Uint8Array`.

---
```ts
encodeGif(image: MemoryImage, samplingFactor = 10): Uint8Array
```
Encode an image with the GIF format.

**Parameters**:
- **image**: the `MemoryImage` to encode.
- (optional) **samplingFactor**: the sampling factor for image quantization, it is responsible for reducing the amount of unique colors in your images to 256. The default is **10**.

**Returns:** the encoded bytes of type `Uint8Array`.

---
```ts
encodeGifAnimation(animation: FrameAnimation, samplingFactor = 10): Uint8Array | undefined
```
Encode an animation with the animated GIF format.

**Parameters**:
- **animation**: the `FrameAnimation` to encode.
- (optional) **samplingFactor**: the sampling factor for image quantization, it is responsible for reducing the amount of unique colors in your images to 256. The default is **10**.

**Returns:** the encoded bytes of type `Uint8Array` or `undefined` if the animation cannot be encoded.

---
```ts
encodeIco(image: MemoryImage): Uint8Array
```
Encode an image with the ICO format.

**Parameters**:
- **image**: the `MemoryImage` to encode.

**Returns:** the encoded bytes of type `Uint8Array`.

---
```ts
encodeJpg(image: MemoryImage, quality = 100): Uint8Array
```
Encode an image with the JPEG format.

**Parameters**:
- **image**: the `MemoryImage` to encode.
- (optional) **quality**: the JPEG quality, in the range [**0**, **100**] where **100** is highest quality. Default is **100**.

**Returns:** the encoded bytes of type `Uint8Array`.

---
```ts
encodePng(image: MemoryImage, level: CompressionLevel = 6): Uint8Array
```
Encode an image with the PNG format.

**Parameters**:
- **image**: the `MemoryImage` to encode.
- (optional) **level**: the compression level, in the range [**0**, **9**] where **9** is the most compressed. Default is **6**.

**Returns:** the encoded bytes of type `Uint8Array`.

---
```ts
encodePngAnimation(animation: FrameAnimation, level: CompressionLevel = 6): Uint8Array | undefined
```
Encode an animation with the animated PNG format.

**Parameters**:
- **animation**: the `FrameAnimation` to encode.
- (optional) **level**: the compression level, in the range [**0**, **9**] where **9** is the most compressed. Default is **6**.

**Returns:** the encoded bytes of type `Uint8Array` or `undefined` if the animation cannot be encoded.

---
```ts
encodeTga(image: MemoryImage): Uint8Array
```
Encode an image with the TGA (Targa) format.

**Parameters**:
- **image**: the `MemoryImage` to encode.

**Returns:** the encoded bytes of type `Uint8Array`.

---
```ts
encodeTiff(image: MemoryImage): Uint8Array
```
Encode an image with the TIFF format.

**Parameters**:
- **image**: the `MemoryImage` to encode.

**Returns:** the encoded bytes of type `Uint8Array`.

Image Filter Functions
======================

These functions modify images in place and return that image to make merging functions easier.
Image filters can be applied using the static methods of the `ImageFilter` abstract class.

---
```ts
ImageFilter.adjustColor(options: AdjustColorOptions): MemoryImage
```
Adjust the color of the `options.src` image using various color transformations (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- **blacks**: defines the black level of the image, as a color.
- **whites**: defines the white level of the image, as a color.
- **mids**: defines the mid level of hte image, as a color.
- **contrast**: increases (>1) / decreases (<1) the contrast of the image by pushing colors away/toward neutral gray, where at 0 the image is entirely neutral gray (0 contrast), 1 - the image is not adjusted and >1 the image increases contrast.
- **saturation**: scale the saturation of the image, where saturation 1 is the fully saturated color and saturation 0 is fully unsaturated (grayscale) color.
- **brightness**: a linear multiplier for the RGB color values, brightens (>1) or dims (<0) the image. Default is **1**.
- **exposure**: an exponential multiplier for the RGB color values, as RGB *= pow(2, exposure). Default is **0**.
- **gamma**: an exponential multiplier for the RGB color values, as RGB = pow(RGB, gamma). A gamma >1 darkens the image, and gamma <1 brightens the image. Default is **1**.
- **hue**: offset the hue of the image, specified in degrees in the range [**0**, **360**]. Default is **0**.
- **amount**: the strength that this filter is applied to the image, where 1 indicates the filter has full effect, and 0 has no effect (the original image is returned unmodified). Default is **1**.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.brightness(src: MemoryImage, brightness: number): MemoryImage
```
Adjust the brightness of the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **brightness**: an offset that is added to the red, green, and blue channels of every pixel.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.bumpToNormal(src: MemoryImage, strength = 2): MemoryImage
```
Generate a normal map from a height-field bump image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- (optional) **strength**: the strength of the normal image.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.colorOffset(options: ColorOffsetOptions): MemoryImage
```
Apply an offset to the colors of the image (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- (optional) **r**: offset for the red channel. Default is 0.
- (optional) **g**: offset for the green channel. Default is 0.
- (optional) **b**: offset for the blue channel. Default is 0.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.contrast(src: MemoryImage, contrast: number): MemoryImage
```
Apply an offset to the colors of the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **contrast**: value below **100** will decrees the contrast of the image, and values above **100** will increase the contrast. A contrast of **100** will have no affect.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.convolution(options: ConvolutionOptions): MemoryImage
```
Apply a 3x3 convolution filter to the image (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- **filter**: convolution filter coefficients (9 items).
- (options) **div**: the coefficient by which each value will be divided. Default is **1**.
- (options) **offset**: the offset that will be added to each result. Default is **0**.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.emboss(src: MemoryImage): MemoryImage
```
Apply an emboss convolution filter (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.gaussianBlur(src: MemoryImage, radius: number): MemoryImage
```
Blur the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **radius**: how many pixels away from the current pixel should contribute to the blur, where 0 is no blur and the larger the radius, the stronger the blur.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.grayscale(src: MemoryImage): MemoryImage
```
Convert the colors of the image to grayscale (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.invert(src: MemoryImage): MemoryImage
```
Invert the colors of the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.noise(image: MemoryImage, sigma: number, type: NoiseType = NoiseType.gaussian): MemoryImage
```
Add random noise to pixel values (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **sigma**: how strong the effect should be.
- (optional) **type**: the noise type. Default is `NoiseType.gaussian`.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.normalize(src: MemoryImage, minValue: number, maxValue: number): MemoryImage
```
Linearly normalize the pixel values of the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **minValue**: min value of the range of normalizing.
- **maxValue**: max value of the range of normalizing.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.pixelate(src: MemoryImage, blockSize: number, mode: PixelateMode = PixelateMode.upperLeft): MemoryImage
```
Pixelate the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **blockSize**: the size of the pixelated blocks.
- (optional) **mode**: if is `PixelateMode.upperLeft` then the upper-left corner of the block will be used for the block color, if `mode` is `PixelateMode.average`, the average of all the pixels in the block will be used for the block color. Default is `PixelateMode.upperLeft`.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.quantize(options: QuantizeOptions): MemoryImage
```
Reduces the number of colors in the image to the given amount (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- (optional) **numberOfColors**: the number of colors.
- (optional) **method**: quantization method. Default is `QuantizeMethod.neuralNet`.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.remapColors(options: RemapColorsOptions): MemoryImage
```
Remap the color channels of the image. **red**, **green**, **blue** and **alpha** should be set to one of the following: `Channel.red`, `Channel.green`, `Channel.blue`, `Channel.alpha`, or `Channel.luminance`. For example, `remapColors({ src: src, red: Channel.green, green: Channel.red })` will swap the red and green channels of the image. `remapColors({ src: src, alpha: Channel.luminance })` will set the alpha channel to the luminance (grayscale) of the image (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- (optional) **red**: which channel we should remap the **red** channel to.
- (optional) **green**: which channel we should remap the **green** channel to.
- (optional) **blue**: which channel we should remap the **blue** channel to.
- (optional) **alpha**: which channel we should remap the **alpha** channel to.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.scaleRgba(src: MemoryImage, r: number, g: number, b: number, a: number): MemoryImage
```
Scales the image channels by a specified number (divided by 255) (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- **r**: the amount by which the **red** channel will be changed (after dividing by 255).
- **g**: the amount by which the **green** channel will be changed (after dividing by 255).
- **b**: the amount by which the **blue** channel will be changed (after dividing by 255).
- **a**: the amount by which the **alpha** channel will be changed (after dividing by 255).

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.separableConvolution(src: MemoryImage, kernel: SeparableKernel): MemoryImage
```
Apply a generic separable convolution filter on the image, using the given separable kernel.
`ImageFilter.gaussianBlur()` is an example of such a filter (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **kernel**: separable kernel.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.sepia(src: MemoryImage, amount = 1): MemoryImage
```
Filter the image colors using sepia tone (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- (optional) **amount**: controls the strength of the effect, in the range **0**-**1**.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.smooth(src: MemoryImage, w: number): MemoryImage
```
Filter the image colors using sepia tone (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **w**: the weight of the current pixel being filtered. If it's greater than **1**, it will make the image sharper.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.sobel(src: MemoryImage, amount = 1): MemoryImage
```
Apply a sobel edge detection filter to the image (in place).

**Parameters**:
- **src**: the `MemoryImage` to modify.
- **w**: the amount, in the range **0**-**1**.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageFilter.vignette(options: VignetteOptions): MemoryImage
```
Darkens the edges of the image using a elliptical vignette filter (in place).

**Parameters** (from **options**):
- **src**: the `MemoryImage` to modify.
- (optional) **start**: start edge of the filter. Default is **0.3**.
- (optional) **end**: end edge of the filter. Default is **0.75**.
- (optional) **amount**: filter intensity level. Default is **0.8**.

**Returns:** the modified `MemoryImage`.

Image Transform Functions
=========================

Image transformations can be applied using the static methods of the `ImageTransform` abstract class.
Most image transformation functions work on a copy of the input image, returning the modified copy. Such functions are prefixed with `copy`. Those functions that do not have the `copy` prefix modify the image in place, returning a modified copy.

---
```ts
ImageTransform.bakeOrientation(image: MemoryImage): MemoryImage
```
If **image** has an orientation value in its exif data, this function will rotate the image so that it physically matches its orientation. This can be used to bake the orientation of the image for image formats that don't support exif data.

**Parameters**:
- **image**: `MemoryImage` source.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyRotate(src: MemoryImage, angle: number, interpolation: Interpolation = Interpolation.nearest): MemoryImage
```
Returns a copy of the image, rotated by `angle` degrees.

**Parameters**:
- **src**: `MemoryImage` source.
- **angle**: the angle to rotate.
- (optional) **interpolation**: interpolation type. Default is `Interpolation.nearest`.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyResize(options: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight): MemoryImage
```
Returns a resized copy of the image.

**Parameters** (from **options**):
- **image**: `MemoryImage` source.
- (optional) **width**: the width of the resized image.
- (optional) **height**: the height of the resized image.
- (optional) **interpolation**: interpolation type. Default is `Interpolation.nearest`.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyResizeCropSquare(src: MemoryImage, size: number): MemoryImage
```
Returns a resized and square cropped copy of the image of specified size.

**Parameters**:
- **src**: `MemoryImage` source.
- **size**: size of the cropped copy.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyInto(options: CopyIntoOptions): MemoryImage
```
Copy an area of the **src** image into **dst**.

In other words, it will take an rectangular area from **src** of width **srcW** and height **srcH** at position (**srcX**,**srcY**) and place it in a rectangular area of **dst** of width **dstW** and height **dstH** at position (**dstX**,**dstY**).

**Parameters** (from **options**):
- **dst**: `MemoryImage` destination.
- **src**: `MemoryImage` source.
- (optional) **dstX**: X coordinate of the destination image. Default is **0**.
- (optional) **dstY**: Y coordinate of the destination image. Default is **0**.
- (optional) **srcX**: X coordinate of the source image. Default is **0**.
- (optional) **srcY**: Y coordinate of the source image. Default is **0**.
- (optional) **srcW**: width of the rectangular to copy from source image. Default is `src.width`.
- (optional) **srcH**: height of the rectangular to copy from source image. Default is `src.height`.
- (optional) **blend**: whether to apply blending. Default is **true**.
- (optional) **center**: if it is true, the **src** will be centered in **dst**. Default is **false**.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyCrop(src: MemoryImage, x: number, y: number, w: number, h: number): MemoryImage
```
Create a cropped copy of the image.

**Parameters**:
- **src**: `MemoryImage` source.
- **x**: X coordinate of the rectangle from source image.
- **y**: Y coordinate of the rectangle from source image.
- **w**: width of the cropped image.
- **h**: height of the cropped image.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyCropCircle(src: MemoryImage, radius?: number, center?: Point): MemoryImage
```
Returns a round cropped copy of the image.

**Parameters**:
- **src**: `MemoryImage` source.
- (optional) **radius**: radius of the cropped area. Default is `Math.min(src.width, src.height)`.
- (optional) **center**: center point. Default is the center point of the **src**.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.copyRectify(src: MemoryImage, rect: Rectangle, toImage?: MemoryImage): MemoryImage
```
Returns a copy of the **src** image, where the given rectangle has been mapped to the full image.

**Parameters**:
- **src**: `MemoryImage` source.
- **rect**: rectangle to map.
- (optional) **toImage**: the image in which to place the mapped area. Default is the image copied from **src**.

**Returns:** the new `MemoryImage`.

---
```ts
ImageTransform.flip(src: MemoryImage, direction: FlipDirection): MemoryImage
```
Flip the image using the given direction (in place).

**Parameters**:
- **src**: `MemoryImage` source.
- **direction**: flip direction.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageTransform.flipVertical(src: MemoryImage): MemoryImage
```
Flip the image vertically (in place).

**Parameters**:
- **src**: `MemoryImage` source.

**Returns:** the modified `MemoryImage`.

---
```ts
ImageTransform.flipHorizontal(src: MemoryImage): MemoryImage
```
Flip the image horizontally (in place).

**Parameters**:
- **src**: `MemoryImage` source.

**Returns:** the modified `MemoryImage`.

Drawing Functions
=================

These functions allow you to draw on images.
Drawing functions can be applied using the static methods of the `Draw` abstract class.

---
```ts
Draw.drawCircle(image: MemoryImage, center: Point, radius: number, color: number): MemoryImage
```
Draw a circle (in place).

**Parameters**:
- **image**: `MemoryImage` source.
- **center**: center point of a circle.
- **radius**: radius of a circle.
- **color**: color of a circle.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.fillCircle(image: MemoryImage, center: Point, radius: number, color: number): MemoryImage
```
Draw and fill a circle (in place).

**Parameters**:
- **image**: `MemoryImage` source.
- **center**: center point of a circle.
- **radius**: radius of a circle.
- **color**: color of a circle.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.drawImage(options: DrawImageOptions): MemoryImage
```
Draw the image **src** onto the image **dst** (in place).

In other words, drawImage will take an rectangular area from **src** of width **srcW** and height **srcH** at position (**srcX**,**srY**) and place it in a rectangular area of **dst** of width **dstW** and height **dstH** at position (**dstX**,**dstY**).

**Parameters** (from **options**):
- **dst**: `MemoryImage` destination.
- **src**: `MemoryImage` source.
- (optional) **dstX**: X coordinate of the destination image. Default is **0**.
- (optional) **dstY**: Y coordinate of the destination image. Default is **0**.
- (optional) **dstW**: width of the rectangle on the destination image. Default is `Math.min(dst.width, src.width)`.
- (optional) **dstH**: height of the rectangle on the destination image. Default is `Math.min(dst.height, src.height)`.
- (optional) **srcX**: X coordinate of the source image. Default is **0**.
- (optional) **srcY**: Y coordinate of the source image. Default is **0**.
- (optional) **srcW**: width of the rectangular to copy from source image. Default is `src.width`.
- (optional) **srcH**: height of the rectangular to copy from source image. Default is `src.height`.
- (optional) **blend**: whether to apply blending. Default is **true**.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.drawLine(options: DrawLineOptions): MemoryImage
```
Draw a line (in place).

**Parameters** (from **options**):
- **image**: `MemoryImage` source.
- **line**: `Line` object with coordinates of the line.
- **color**: line color.
- (optional) **antialias**: if true, then the line is drawn with smooth edges. Default is **false**.
- (optional) **thickness**: determines how thick the line should be drawn, in pixels. Default is **1**.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.drawPixel(image: MemoryImage, pos: Point, color: number, opacity = 0xff): MemoryImage
```
Draw a single pixel into the image, applying alpha and opacity blending (in place).

**Parameters**:
- **image**: `MemoryImage` source.
- **pos**: coordinates of the point.
- **color**: pixel color.
- (optional) **opacity**: fraction of alpha blending. Default is **0xff** (fully opaque).

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.drawRect(dst: MemoryImage, rect: Rectangle, color: number): MemoryImage
```
Draw a rectangle (in place).

**Parameters**:
- **dst**: `MemoryImage` source.
- **rect**: rectangle coordinates to draw.
- **color**: rectangle color.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.fillRect(src: MemoryImage, rect: Rectangle, color: number): MemoryImage
```
Fill a rectangle with the given color (in place).

**Parameters**:
- **src**: `MemoryImage` source.
- **rect**: rectangle coordinates to draw.
- **color**: fill color.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.fillFlood(options: FillFloodOptions): MemoryImage
```
Fill the 4-connected shape containing (**x**,**y**) in the image **src** with the given **color** (in place).

**Parameters** (from **options**):
- **src**: `MemoryImage` source.
- **x**: the X coordinate of the point where the fill starts.
- **y**: the Y coordinate of the point where the fill starts.
- **color**: fill color.
- (optional) **threshold**: filling threshold. Default is **0**.
- (optional) **compareAlpha**: whether to take into account the alpha channel. Default is **false**.

**Returns:** the modified `MemoryImage`.

---
```ts
Draw.maskFlood(options: MaskFloodOptions): Uint8Array
```
Create a mask describing the 4-connected shape containing (**x**,**y**) in the image **src**.

**Parameters** (from **options**):
- **src**: `MemoryImage` source.
- **x**: the X coordinate of the point where the fill starts.
- **y**: the Y coordinate of the point where the fill starts.
- (optional) **threshold**: filling threshold. Default is **0**.
- (optional) **compareAlpha**: whether to take into account the alpha channel. Default is **false**.
- (optional) **fillValue**: the value of the items corresponding to the filled area. Default is **255**.

**Returns:** the mask of type `Uint8Array`.

---
```ts
Draw.fill(image: MemoryImage, color: number): MemoryImage
```
Fill the entire image with the given color (in place).

**Parameters**:
- **src**: `MemoryImage` source.
- **color**: fill color.

**Returns:** the modified `MemoryImage`.

Contributing
============

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

To contribute:
- Fork the project
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

I will be very grateful for your support.

Links
=====

Link to NPM repository:

<a href="https://nodei.co/npm/image-in-browser/"><img src="https://nodei.co/npm/image-in-browser.png"></a>