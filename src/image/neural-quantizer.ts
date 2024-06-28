/** @format */

import { Color } from '../color/color.js';
import { ColorRgb8 } from '../color/color-rgb8.js';
import { ColorRgba8 } from '../color/color-rgba8.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from './image.js';
import { PaletteUint32 } from './palette-uint32.js';
import { PaletteUint8 } from './palette-uint8.js';
import { Pixel } from './pixel.js';
import { Quantizer } from './quantizer.js';

/**
 * Compute a color map with a given number of colors that best represents
 * the given image.
 */
export class NeuralQuantizer implements Quantizer {
  /** Number of learning cycles */
  private static readonly _numCycles: number = 100;

  /** Alpha starts at 1 */
  private static readonly _alphaBiasShift: number = 10;

  /** Initial alpha value, biased by 10 bits */
  private static readonly _initAlpha: number =
    1 << NeuralQuantizer._alphaBiasShift;

  /** Radius bias shift value */
  private static readonly _radiusBiasShift: number = 8;

  /** Radius bias value */
  private static readonly _radiusBias: number =
    1 << NeuralQuantizer._radiusBiasShift;

  /** Alpha radius bias shift value */
  private static readonly _alphaRadiusBiasShift: number =
    NeuralQuantizer._alphaBiasShift + NeuralQuantizer._radiusBiasShift;

  /** Alpha radius bias value */
  private static readonly alphaRadiusBias: number =
    1 << NeuralQuantizer._alphaRadiusBiasShift;

  /** Radius decrement factor, 1/30 each cycle */
  private static readonly _radiusDec: number = 30;

  /** Gamma value */
  private static readonly _gamma: number = 1024;

  /** Beta value */
  private static readonly _beta: number = 1 / 1024;

  /** Beta times gamma value */
  private static readonly _betaGamma: number =
    NeuralQuantizer._beta * NeuralQuantizer._gamma;

  /** Prime number 1, used for image length assumption */
  private static readonly _prime1 = 499;

  /** Prime number 2, used for image length assumption */
  private static readonly _prime2 = 491;

  /** Prime number 3, used for image length assumption */
  private static readonly _prime3 = 487;

  /** Prime number 4, used for image length assumption */
  private static readonly _prime4 = 503;

  /** Small image bytes calculation */
  private static readonly _smallImageBytes = 3 * NeuralQuantizer._prime4;

  /** Network index array */
  private readonly _netIndex = new Int32Array(256);

  /** Sampling factor */
  private _samplingFactor: number;

  /** Number of colors used */
  private _netSize = 16;

  /** Number of reserved colors used */
  private _specials = 3;

  /** Reserved background color */
  private _bgColor = 0;

  /** Cut network size */
  private _cutNetSize = 0;

  /** Maximum network position */
  private _maxNetPos = 0;

  /** Initial radius value, starts at 32 for 256 colors */
  private _initRadius = 0;

  /** Initial bias radius value */
  private _initBiasRadius = 0;

  /** Radius power array */
  private _radiusPower!: Int32Array;

  /** The network itself */
  private _network!: number[];

  /** Internal palette */
  private _paletteInternal!: PaletteUint32;

  /** External palette */
  private _palette!: PaletteUint8;

  /** Get the palette */
  public get palette(): PaletteUint8 {
    return this._palette;
  }

  /** Bias array for learning */
  private _bias!: number[];

  /** Frequency array for learning */
  private _freq!: number[];

  /** How many colors are in the palette? */
  public get numColors(): number {
    return this._netSize;
  }

  /**
   * 10 is a reasonable samplingFactor according to
   * https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/.
   * @param {MemoryImage} image - The image to be quantized.
   * @param {number} [numberOfColors=256] - The number of colors to quantize to.
   * @param {number} [samplingFactor=10] - The sampling factor.
   */
  constructor(image: MemoryImage, numberOfColors = 256, samplingFactor = 10) {
    this._samplingFactor = samplingFactor;
    this.initialize(numberOfColors);
    this.addImage(image);
  }

  /**
   * Initialize the quantizer with the given number of colors.
   * @param {number} numberOfColors - The number of colors to initialize with.
   */
  private initialize(numberOfColors: number): void {
    this._netSize = Math.max(numberOfColors, 4);
    this._cutNetSize = this._netSize - this._specials;
    this._maxNetPos = this._netSize - 1;
    this._initRadius = Math.floor(this._netSize / 8);
    this._initBiasRadius = this._initRadius * NeuralQuantizer._radiusBias;
    this._paletteInternal = new PaletteUint32(256, 4);
    this._palette = new PaletteUint8(256, 3);
    this._specials = 3;
    this._bgColor = this._specials - 1;
    this._radiusPower = new Int32Array(this._netSize >>> 3);

    this._network = new Array<number>(this._netSize * 3).fill(0);
    this._bias = new Array<number>(this._netSize).fill(0);
    this._freq = new Array<number>(this._netSize).fill(0);

    this._network[0] = 0.0;
    this._network[1] = 0.0;
    this._network[2] = 0.0;

    this._network[3] = 255.0;
    this._network[4] = 255.0;
    this._network[5] = 255.0;

    const f = 1 / this._netSize;
    for (let i = 0; i < this._specials; ++i) {
      this._freq[i] = f;
      this._bias[i] = 0.0;
    }

    for (
      let i = this._specials, p = this._specials * 3;
      i < this._netSize;
      ++i
    ) {
      this._network[p++] = (255 * (i - this._specials)) / this._cutNetSize;
      this._network[p++] = (255 * (i - this._specials)) / this._cutNetSize;
      this._network[p++] = (255 * (i - this._specials)) / this._cutNetSize;

      this._freq[i] = f;
      this._bias[i] = 0.0;
    }
  }

  /**
   * Update the radius power.
   * @param {number} rad - The radius.
   * @param {number} alpha - The alpha value.
   */
  private updateRadiusPower(rad: number, alpha: number): void {
    for (let i = 0; i < rad; i++) {
      this._radiusPower[i] = Math.trunc(
        alpha *
          (((rad * rad - i * i) * NeuralQuantizer._radiusBias) / (rad * rad))
      );
    }
  }

  /**
   * Find a special color in the network.
   * @param {number} b - Blue component.
   * @param {number} g - Green component.
   * @param {number} r - Red component.
   * @returns {number} The index of the special color.
   */
  private specialFind(b: number, g: number, r: number): number {
    for (let i = 0, p = 0; i < this._specials; i++) {
      if (
        this._network[p++] === b &&
        this._network[p++] === g &&
        this._network[p++] === r
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Search for biased BGR values.
   * @param {number} b - Blue component.
   * @param {number} g - Green component.
   * @param {number} r - Red component.
   * @returns {number} The index of the closest color.
   */
  private contest(b: number, g: number, r: number): number {
    let bestD = 1.0e30;
    let bestBiasDist = bestD;
    let bestPos = -1;
    let bestBiasPos = bestPos;

    for (
      let i = this._specials, p = this._specials * 3;
      i < this._netSize;
      i++
    ) {
      let dist = this._network[p++] - b;
      if (dist < 0) {
        dist = -dist;
      }
      let a = this._network[p++] - g;
      if (a < 0) {
        a = -a;
      }
      dist += a;
      a = this._network[p++] - r;
      if (a < 0) {
        a = -a;
      }
      dist += a;
      if (dist < bestD) {
        bestD = dist;
        bestPos = i;
      }

      const biasDist = dist - this._bias[i];
      if (biasDist < bestBiasDist) {
        bestBiasDist = biasDist;
        bestBiasPos = i;
      }
      this._freq[i] -= NeuralQuantizer._beta * this._freq[i];
      this._bias[i] += NeuralQuantizer._betaGamma * this._freq[i];
    }

    this._freq[bestPos] += NeuralQuantizer._beta;
    this._bias[bestPos] -= NeuralQuantizer._betaGamma;
    return bestBiasPos;
  }

  /**
   * Move neuron i towards biased (b,g,r) by factor alpha.
   * @param {number} alpha - The alpha value.
   * @param {number} i - The neuron index.
   * @param {number} b - Blue component.
   * @param {number} g - Green component.
   * @param {number} r - Red component.
   */
  private alterSingle(
    alpha: number,
    i: number,
    b: number,
    g: number,
    r: number
  ): void {
    const p = i * 3;
    this._network[p] -= alpha * (this._network[p] - b);
    this._network[p + 1] -= alpha * (this._network[p + 1] - g);
    this._network[p + 2] -= alpha * (this._network[p + 2] - r);
  }

  /**
   * Alter neighbors of neuron i.
   * @param {number} _ - Unused parameter.
   * @param {number} rad - The radius.
   * @param {number} i - The neuron index.
   * @param {number} b - Blue component.
   * @param {number} g - Green component.
   * @param {number} r - Red component.
   */
  private alterNeighbors(
    _: number,
    rad: number,
    i: number,
    b: number,
    g: number,
    r: number
  ): void {
    let lo = i - rad;
    if (lo < this._specials - 1) {
      lo = this._specials - 1;
    }

    let hi = i + rad;
    if (hi > this._netSize) {
      hi = this._netSize;
    }

    let j = i + 1;
    let k = i - 1;
    let m = 1;
    while (j < hi || k > lo) {
      const a = this._radiusPower[m++];
      if (j < hi) {
        const p = j * 3;
        this._network[p] -=
          (a * (this._network[p] - b)) / NeuralQuantizer.alphaRadiusBias;
        this._network[p + 1] -=
          (a * (this._network[p + 1] - g)) / NeuralQuantizer.alphaRadiusBias;
        this._network[p + 2] -=
          (a * (this._network[p + 2] - r)) / NeuralQuantizer.alphaRadiusBias;
        j++;
      }
      if (k > lo) {
        const p = k * 3;
        this._network[p] -=
          (a * (this._network[p] - b)) / NeuralQuantizer.alphaRadiusBias;
        this._network[p + 1] -=
          (a * (this._network[p + 1] - g)) / NeuralQuantizer.alphaRadiusBias;
        this._network[p + 2] -=
          (a * (this._network[p + 2] - r)) / NeuralQuantizer.alphaRadiusBias;
        k--;
      }
    }
  }

  /**
   * Learn from the image.
   * @param {MemoryImage} image - The image to learn from.
   */
  private learn(image: MemoryImage): void {
    let biasRadius = this._initBiasRadius;
    const alphaDec = 30 + Math.floor((this._samplingFactor - 1) / 3);
    const lengthCount = image.width * image.height;
    const samplePixels = Math.floor(lengthCount / this._samplingFactor);
    let delta = Math.max(
      Math.floor(samplePixels / NeuralQuantizer._numCycles),
      1
    );
    let alpha = NeuralQuantizer._initAlpha;

    if (delta === 0) {
      delta = 1;
    }

    let rad = biasRadius >>> NeuralQuantizer._radiusBiasShift;
    if (rad <= 1) {
      rad = 0;
    }

    this.updateRadiusPower(rad, alpha);

    let step = 0;
    let pos = 0;
    if (lengthCount < NeuralQuantizer._smallImageBytes) {
      this._samplingFactor = 1;
      step = 1;
    } else if (lengthCount % NeuralQuantizer._prime1 !== 0) {
      step = NeuralQuantizer._prime1;
    } else {
      if (lengthCount % NeuralQuantizer._prime2 !== 0) {
        step = NeuralQuantizer._prime2;
      } else {
        if (lengthCount % NeuralQuantizer._prime3 !== 0) {
          step = NeuralQuantizer._prime3;
        } else {
          step = NeuralQuantizer._prime4;
        }
      }
    }

    const w = image.width;
    const h = image.height;

    let x = 0;
    let y = 0;
    let i = 0;
    while (i < samplePixels) {
      const p = image.getPixel(x, y);

      const red = p.r;
      const green = p.g;
      const blue = p.b;

      if (i === 0) {
        this._network[this._bgColor * 3] = blue;
        this._network[this._bgColor * 3 + 1] = green;
        this._network[this._bgColor * 3 + 2] = red;
      }

      let j = this.specialFind(blue, green, red);
      j = j < 0 ? this.contest(blue, green, red) : j;

      if (j >= this._specials) {
        const a = Number(alpha) / NeuralQuantizer._initAlpha;
        this.alterSingle(a, j, blue, green, red);
        if (rad > 0) {
          this.alterNeighbors(a, rad, j, blue, green, red);
        }
      }

      pos += step;
      x += step;
      while (x > w) {
        x -= w;
        y++;
      }
      while (pos >= lengthCount) {
        pos -= lengthCount;
        y -= h;
      }

      i++;
      if (i % delta === 0) {
        alpha -= Math.floor(alpha / alphaDec);
        biasRadius -= Math.floor(biasRadius / NeuralQuantizer._radiusDec);
        rad = biasRadius >>> NeuralQuantizer._radiusBiasShift;
        if (rad <= 1) {
          rad = 0;
        }
        this.updateRadiusPower(rad, alpha);
      }
    }
  }

  /**
   * Fix the palette.
   */
  private fix(): void {
    for (let i = 0, p = 0; i < this._netSize; i++) {
      for (let j = 0; j < 3; ++j, ++p) {
        const x = MathUtils.clampInt255(Math.trunc(0.5 + this._network[p]));
        this._paletteInternal.set(i, j, x);
      }
      this._paletteInternal.set(i, 3, i);
    }
  }

  /**
   * Insertion sort of network and building of netindex[0..255].
   */
  private inxBuild(): void {
    let previousColor = 0;
    let startPos = 0;

    for (let i = 0; i < this._netSize; i++) {
      let smallPos = i;
      let smallVal = this._paletteInternal.get(i, 1);

      for (let j = i + 1; j < this._netSize; j++) {
        if (this._paletteInternal.get(j, 1) < smallVal) {
          smallPos = j;
          smallVal = this._paletteInternal.get(j, 1);
        }
      }

      const p = i;
      const q = smallPos;

      if (i !== smallPos) {
        let j = this._paletteInternal.get(q, 0);
        this._paletteInternal.set(q, 0, this._paletteInternal.get(p, 0));
        this._paletteInternal.set(p, 0, j);

        j = this._paletteInternal.get(q, 1);
        this._paletteInternal.set(q, 1, this._paletteInternal.get(p, 1));
        this._paletteInternal.set(p, 1, j);

        j = this._paletteInternal.get(q, 2);
        this._paletteInternal.set(q, 2, this._paletteInternal.get(p, 2));
        this._paletteInternal.set(p, 2, j);

        j = this._paletteInternal.get(q, 3);
        this._paletteInternal.set(q, 3, this._paletteInternal.get(p, 3));
        this._paletteInternal.set(p, 3, j);
      }

      if (smallVal !== previousColor) {
        this._netIndex[previousColor] = (startPos + i) >>> 1;
        for (let j = previousColor + 1; j < smallVal; j++) {
          this._netIndex[j] = i;
        }
        previousColor = Math.trunc(smallVal);
        startPos = i;
      }
    }

    this._netIndex[previousColor] = (startPos + this._maxNetPos) >>> 1;
    for (let j = previousColor + 1; j < 256; j++) {
      this._netIndex[j] = this._maxNetPos;
    }
  }

  /**
   * Copy the palette.
   */
  private copyPalette(): void {
    for (let i = 0; i < this._netSize; ++i) {
      this._palette.setRgb(
        i,
        Math.abs(this._paletteInternal.get(i, 2)),
        Math.abs(this._paletteInternal.get(i, 1)),
        Math.abs(this._paletteInternal.get(i, 0))
      );
    }
  }

  /**
   * Search for BGR values 0..255 and return color index
   * @param {number} b - Blue component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} r - Red component (0-255)
   * @returns {number} The index of the closest color in the palette
   */
  private inxSearch(b: number, g: number, r: number): number {
    // Biggest possible dist is 256*3
    let bestD = 1000;
    let best = -1;
    // Index on g
    let i = this._netIndex[g];
    // Start at netIndex[g] and work outwards
    let j = i - 1;

    while (i < this._netSize || j >= 0) {
      if (i < this._netSize) {
        // Inx key
        let dist = this._paletteInternal.get(i, 1) - g;
        if (dist >= bestD) {
          // Stop iter
          i = this._netSize;
        } else {
          if (dist < 0) {
            dist = -dist;
          }
          let a = this._paletteInternal.get(i, 0) - b;
          if (a < 0) {
            a = -a;
          }
          dist += a;
          if (dist < bestD) {
            a = this._paletteInternal.get(i, 2) - r;
            if (a < 0) {
              a = -a;
            }
            dist += a;
            if (dist < bestD) {
              bestD = Math.trunc(dist);
              best = i;
            }
          }
          i++;
        }
      }

      if (j >= 0) {
        const p = j * 4;
        // Inx key - reverse dif
        let dist = g - this._paletteInternal.get(j, 1);
        if (dist >= bestD) {
          // Stop iter
          j = -1;
        } else {
          if (dist < 0) {
            dist = -dist;
          }
          let a = this._paletteInternal.get(j, 0) - b;
          if (a < 0) {
            a = -a;
          }
          dist += a;
          if (dist < bestD) {
            a = this._paletteInternal.get(j, 2) - r;
            if (a < 0) {
              a = -a;
            }
            dist += a;
            if (dist < bestD) {
              bestD = Math.trunc(dist);
              best = j;
            }
          }
          j--;
        }
      }
    }
    return best;
  }

  /**
   * Find the index of the closest color to **c** in the **palette**.
   * @param {Color} c - The color to find the closest index for
   * @returns {number} The index of the closest color in the palette
   */
  public getColorIndex(c: Color): number {
    const r = Math.trunc(c.r);
    const g = Math.trunc(c.g);
    const b = Math.trunc(c.b);
    return this.inxSearch(b, g, r);
  }

  /**
   * Find the index of the closest color to **r**,**g**,**b** in the **palette**.
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @returns {number} The index of the closest color in the palette
   */
  public getColorIndexRgb(r: number, g: number, b: number): number {
    return this.inxSearch(b, g, r);
  }

  /**
   * Find the color closest to **c** in the **palette**.
   * @param {Color} c - The color to find the closest match for
   * @returns {Color} The closest color in the palette
   */
  public getQuantizedColor(c: Color): Color {
    const i = this.getColorIndex(c);
    const out =
      c.length === 4 ? new ColorRgba8(0, 0, 0, 255) : new ColorRgb8(0, 0, 0);
    out.r = this.palette.get(i, 0);
    out.g = this.palette.get(i, 1);
    out.b = this.palette.get(i, 2);
    if (c.length === 4) {
      out.a = c.a;
    }
    return out;
  }

  /**
   * Convert the **image** to a palette image.
   * @param {MemoryImage} image - The image to convert
   * @returns {MemoryImage} The converted palette image
   */
  public getIndexImage(image: MemoryImage): MemoryImage {
    const target = new MemoryImage({
      width: image.width,
      height: image.height,
      numChannels: 1,
      palette: this.palette,
    });

    target.frameIndex = image.frameIndex;
    target.frameType = image.frameType;
    target.frameDuration = image.frameDuration;

    const imageIt = image[Symbol.iterator]();
    const targetIt = target[Symbol.iterator]();
    let imageItRes: IteratorResult<Pixel> | undefined = undefined;
    let targetItRes: IteratorResult<Pixel> | undefined = undefined;
    while (
      (((imageItRes = imageIt.next()), (targetItRes = targetIt.next())),
      !imageItRes.done && !targetItRes.done)
    ) {
      const t = targetItRes.value;
      t.setChannel(0, this.getColorIndex(imageItRes.value));
    }

    return target;
  }

  /**
   * Add an image to the quantized color table.
   * @param {MemoryImage} image - The image to add
   */
  public addImage(image: MemoryImage): void {
    this.learn(image);
    this.fix();
    this.inxBuild();
    this.copyPalette();
  }
}
