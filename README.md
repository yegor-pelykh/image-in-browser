📋 Table of contents
=================

- [📜 Overview](#overview)
- [🖼️ Supported Image Formats](#supported-image-formats)
- [🆘 Examples of using](#examples-of-using)
- [📰 Documentation](#documentation)
- [🏭 Performance Warning](#performance-warning)
- [🔧 Contributing](#contributing)
- [🔗 Links](#links)

<h1 id="overview">📜 Overview</h1>

**image-in-browser** is an NPM package providing the ability to load, manipulate and save images of various image file formats.

- works both in Node.js and in the browser (no need for server-side Node.js)
- written entirely in Typescript with transpiling into Javascript
- doesn't have any dependencies on other packages
- is a full-fledged modern ES (ECMAScript) module

This library may be especially useful when you need to work with static or animated images directly in the browser code when the code is isolated from the system it's running on.

<h1 id="supported-image-formats">🖼️ Supported Image Formats</h1>

The following formats are currently supported for encoding / decoding:

**Read / Write**

- **BMP**
- **GIF, animated GIF**
- **ICO**
- **JPG**
- **PNG, animated APNG**
- **TGA**
- **PVR**
- **TIFF**

**Read Only**

- **PNM, PBM, PGM, PPM**
- **PSD**
- **WEBP, animated WEBP**

**Write Only**

- **CUR**

<h1 id="examples-of-using">🆘 Examples of using</h1>

You can see examples of using this library by checking out the repository that was specifically created for publishing code examples there:

[**image-in-browser.examples**](https://github.com/yegor-pelykh/image-in-browser.examples) (_GitHub_)

It will be supplemented and updated over time.

<h1 id="documentation">📰 Documentation</h1>

To view the documentation for the package, please go to the [**Wiki**](https://github.com/yegor-pelykh/image-in-browser/wiki).

<h1 id="performance-warning">🏭 Performance Warning</h1>

Since this library is written entirely in Typescript and is not a native executable library, its performance will not be as fast as a the native library.

<h1 id="contributing">🔧 Contributing</h1>

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

To contribute:
- Fork the project
- Create your feature branch (git checkout -b feature/AmazingFeature)
- **!** Run the script `npm run build` to bring the code up to project standards
- **!** Fix all errors and warnings associated with your changes
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

I will be very grateful for your support.

<h1 id="links">🔗 Links</h1>

Link to NPM repository:

<a href="https://nodei.co/npm/image-in-browser/"><img src="https://nodei.co/npm/image-in-browser.png"></a>
