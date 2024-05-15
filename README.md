Table of contents
=================

- [Table of contents](#table-of-contents)
- [Overview](#overview)
- [Performance Warning](#performance-warning)
- [Supported Image Formats](#supported-image-formats)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Links](#links)

Overview
========

**image-in-browser** is an NPM package providing the ability to load, manipulate and save images of various image file formats.

- works both in Node.js and in the browser (no need for server-side Node.js)
- written entirely in Typescript with transpiling into Javascript
- doesn't have any dependencies on other packages
- fully compatible with the ES6 standard and provides typings (declarations) for use with Typescript

This library may be especially useful when you need to work with static or animated images directly in the browser code when the code is isolated from the system it's running on.

Performance Warning
===================

Since this library is written entirely in Typescript and is not a native executable library, its performance will not be as fast as a the native library.

Supported Image Formats
=======================

The following formats are currently supported for encoding / decoding:

**Read / Write**

- BMP
- GIF, animated GIF
- ICO
- JPG
- PNG, animated APNG
- TGA
- PVR
- TIFF

**Read Only**

- PNM, PBM, PGM, PPM
- PSD
- WEBP, animated WEBP

**Write Only**

- CUR

Documentation
============

To view the documentation for the package, please go to the [Wiki](https://github.com/yegor-pelykh/image-in-browser/wiki).

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
