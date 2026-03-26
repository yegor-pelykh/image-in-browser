<!-- @format -->

# 📋 Table of Contents

- [**Introduction**](#introduction)
- [**Supported Image Formats**](#supported-image-formats)
- [**Usage Examples**](#usage-examples)
- [**Documentation**](#documentation)
- [**Performance Considerations**](#performance-considerations)
- [**Contributing**](#contributing)
- [**Useful Links**](#useful-links)

<h1 id="introduction">🌟 Introduction</h1>

Welcome to **image-in-browser**! This powerful NPM package allows you to effortlessly load, manipulate, and save images in a variety of formats, all within your browser or Node.js environment—no server-side setup required!

Key Features:

- Fully compatible with both Node.js and browser environments
- Developed entirely in TypeScript, compiled to JavaScript
- No external dependencies — lightweight and efficient
- A modern ES (ECMAScript) module for seamless integration

Whether you're working with static images or animated graphics, this library is perfect for projects where you want to keep your code isolated from the underlying system.

<h1 id="supported-image-formats">🖼️ Supported Image Formats</h1>

## Supported Image Formats

**image-in-browser** provides extensive support for various image formats, allowing for both reading and writing capabilities. Below is a detailed overview of each supported format, including specific nuances and additional information.

| Format                   | Read Support | Write Support          | Notes                                                                                                                                                                                                                                                                                               |
| :----------------------- | :----------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BMP**                  | ✅ Yes       | ✅ Yes                 | Bitmap Image File, a common uncompressed raster image format. Often used in Windows environments.                                                                                                                                                                                                   |
| **GIF** / animated GIF   | ✅ Yes       | ✅ Yes                 | Graphics Interchange Format, widely known for supporting animation and transparency. It uses a palette of up to 256 colors.                                                                                                                                                                         |
| **ICO**                  | ✅ Yes       | ✅ Yes                 | Microsoft Icon format, primarily used for favicons, application icons, and cursors within Windows operating systems. It can store multiple images of different sizes and color depths.                                                                                                              |
| **JPG** / JPEG           | ✅ Yes       | ✅ Yes                 | Joint Photographic Experts Group, a widely used lossy compression format, ideal for photographs and complex images where file size is a primary concern. It achieves small file sizes by selectively discarding visual information.                                                                 |
| **PNG** / animated APNG  | ✅ Yes       | ✅ Yes                 | Portable Network Graphics, a lossless compression format that supports transparency (alpha channel) and is excellent for web graphics, logos, and images requiring sharp edges. Animated PNG (APNG) extends PNG to support animation.                                                               |
| **TGA**                  | ✅ Yes       | ✅ Yes                 | Truevision Targa (TGA), an older raster graphics file format often used in 3D animation, video games, and professional image editing for storing raw image data.                                                                                                                                    |
| **PVR**                  | ✅ Yes       | ✅ Yes                 | PowerVR Texture, a texture compression format specifically designed for PowerVR graphics processors. It's commonly used in mobile and embedded graphics applications for efficient texture rendering.                                                                                               |
| **TIFF**                 | ✅ Yes       | ✅ Yes                 | Tagged Image File Format, a highly flexible and versatile format for storing raster images, often used in professional photography, scanning, and printing due to its ability to store high-quality image data with various compression schemes (lossless and lossy).                               |
| **WEBP** / animated WEBP | ✅ Yes       | ✅ Yes (lossless only) | A modern image format developed by Google, offering superior compression for both lossy and lossless images, often resulting in smaller file sizes compared to JPEG and PNG. It also supports animation and alpha transparency. **Write support in this package is limited to lossless WebP only.** |
| **PNM** / PBM, PGM, PPM  | ✅ Yes       | ❌ No                  | Portable Anymap format family, which includes Portable Bitmap (PBM), Portable Graymap (PGM), and Portable Pixmap (PPM). These are simple, uncompressed image formats often used for basic image manipulation and conversions.                                                                       |
| **PSD**                  | ✅ Yes       | ❌ No                  | Adobe Photoshop Document, the native file format for Adobe Photoshop. It can store image layers, adjustments, masks, and other Photoshop-specific features. This package supports reading the flattened image data.                                                                                 |
| **CUR**                  | ❌ No        | ✅ Yes                 | Microsoft Cursor format, used for custom static or animated mouse cursors within Windows. Unlike ICO, CUR files are specifically designed for cursor usage and include a "hot spot" (the pixel that defines the exact click point).                                                                 |

<h1 id="usage-examples">💡 Usage Examples</h1>

Want to see **image-in-browser** in action? Check out our dedicated repository for practical examples and code snippets:

[**image-in-browser.examples**](https://github.com/yegor-pelykh/image-in-browser.examples/tree/main/examples) (_GitHub_)

This repository will continue to grow, providing you with more examples over time.

<h1 id="documentation">📚 Documentation</h1>

For comprehensive documentation on how to use the package, please visit our [**Wiki**](https://github.com/yegor-pelykh/image-in-browser/wiki).

<h1 id="performance-considerations">⚙️ Performance Considerations</h1>

Please note that while **image-in-browser** is a versatile library, its performance may not match that of native libraries, as it is entirely written in TypeScript. Keep this in mind when planning your projects.

<h1 id="testing">🧪 Testing</h1>

The project includes a comprehensive suite of tests to ensure functionality and reliability. To run the tests, use the following command:

```bash
npm run test:all
```

This will execute all test cases defined in the project.

<h1 id="contributing">🤝 Contributing</h1>

We believe that contributions are the heart of the open-source community! Your input can help make **image-in-browser** even better.

To contribute:

1. Fork the project
2. Create your feature branch (e.g., `git checkout -b feature/AmazingFeature`)
3. **Important!** Run `npm run build` to ensure your code meets project standards
4. **Important!** Address any errors or warnings that arise from your changes
5. Commit your changes (e.g., `git commit -m 'Add some AmazingFeature'`)
6. Push to your branch (e.g., `git push origin feature/AmazingFeature`)
7. Open a Pull Request

Your support is greatly appreciated!

<h1 id="license">📜 License</h1>

This project is licensed under the MIT License. See the [**LICENSE.md**](/LICENSE.md) file for details.

<h1 id="useful-links">🔗 Useful Links</h1>

Check out our NPM repository for more information:

<a href="https://nodei.co/npm/image-in-browser/"><img src="https://nodei.co/npm/image-in-browser.png"></a>
