/** @format */

import { Color } from './color';
import { MemoryImage } from './memory-image';
import { Quantizer } from './quantizer';

/**
 * Compute a color map with a given number of colors that best represents
 * the given image.
 */
export class NeuralQuantizer implements Quantizer {
  // No. of learning cycles
  private static readonly numCycles: number = 100;

  // Alpha starts at 1
  private static readonly alphaBiasShift: number = 10;

  // Biased by 10 bits
  private static readonly initAlpha: number =
    1 << NeuralQuantizer.alphaBiasShift;

  private static readonly radiusBiasShift: number = 8;

  private static readonly radiusBias: number =
    1 << NeuralQuantizer.radiusBiasShift;

  private static readonly alphaRadiusBiasShift: number =
    NeuralQuantizer.alphaBiasShift + NeuralQuantizer.radiusBiasShift;

  private static readonly alphaRadiusBias: number =
    1 << NeuralQuantizer.alphaRadiusBiasShift;

  // Factor of 1/30 each cycle
  private static readonly radiusDec: number = 30;

  private static readonly gamma: number = 1024;

  private static readonly beta: number = 1 / 1024;

  private static readonly betaGamma: number =
    NeuralQuantizer.beta * NeuralQuantizer.gamma;

  // Four primes near 500 - assume no image has a length so large
  // that it is divisible by all four primes

  private static readonly prime1 = 499;

  private static readonly prime2 = 491;

  private static readonly prime3 = 487;

  private static readonly prime4 = 503;

  private static readonly smallImageBytes = 3 * NeuralQuantizer.prime4;

  private readonly netIndex = new Int32Array(256);

  private samplingFactor: number;

  // Number of colors used
  private netSize = 16;

  // Number of reserved colors used
  private specials = 3;

  // Reserved background color
  private bgColor = 0;

  private cutNetSize = 0;

  private maxNetPos = 0;

  // For 256 cols, radius starts at 32
  private initRadius = 0;

  private initBiasRadius = 0;

  private radiusPower!: Int32Array;

  /**
   * The network itself
   */
  private network!: number[];

  private _colorMap8!: Uint8Array;
  public get colorMap8(): Uint8Array {
    return this._colorMap8;
  }

  private _colorMap32!: Int32Array;
  public get colorMap32(): Int32Array {
    return this._colorMap32;
  }

  /**
   * Bias array for learning
   */
  private bias!: number[];

  // Freq array for learning
  private freq!: number[];

  /**
   * How many colors are in the [colorMap]?
   */
  get numColors(): number {
    return this.netSize;
  }

  /**
   * 10 is a reasonable [samplingFactor] according to
   * https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/.
   */
  constructor(image: MemoryImage, numberOfColors = 256, samplingFactor = 10) {
    this.samplingFactor = samplingFactor;
    this.initialize(numberOfColors);
    this.addImage(image);
  }

  private initialize(numberOfColors: number): void {
    // Number of colours used
    this.netSize = Math.max(numberOfColors, 4);
    this.cutNetSize = this.netSize - this.specials;
    this.maxNetPos = this.netSize - 1;
    // For 256 cols, radius starts at 32
    this.initRadius = Math.floor(this.netSize / 8);
    this.initBiasRadius = this.initRadius * NeuralQuantizer.radiusBias;
    this._colorMap32 = new Int32Array(this.netSize * 4);
    this._colorMap8 = new Uint8Array(this.netSize * 3);
    // Number of reserved colors used
    this.specials = 3;
    this.bgColor = this.specials - 1;
    this.radiusPower = new Int32Array(this.netSize >> 3);

    this.network = new Array<number>(this.netSize * 3).fill(0);
    this.bias = new Array<number>(this.netSize).fill(0);
    this.freq = new Array<number>(this.netSize).fill(0);

    // Black
    this.network[0] = 0.0;
    this.network[1] = 0.0;
    this.network[2] = 0.0;

    // White
    this.network[3] = 255.0;
    this.network[4] = 255.0;
    this.network[5] = 255.0;

    // RESERVED bgColor
    // background
    const f = 1.0 / this.netSize;
    for (let i = 0; i < this.specials; ++i) {
      this.freq[i] = f;
      this.bias[i] = 0.0;
    }

    for (let i = this.specials, p = this.specials * 3; i < this.netSize; ++i) {
      this.network[p++] = (255.0 * (i - this.specials)) / this.cutNetSize;
      this.network[p++] = (255.0 * (i - this.specials)) / this.cutNetSize;
      this.network[p++] = (255.0 * (i - this.specials)) / this.cutNetSize;

      this.freq[i] = f;
      this.bias[i] = 0.0;
    }
  }

  private updateRadiusPower(rad: number, alpha: number): void {
    for (let i = 0; i < rad; i++) {
      this.radiusPower[i] = Math.trunc(
        alpha *
          (((rad * rad - i * i) * NeuralQuantizer.radiusBias) / (rad * rad))
      );
    }
  }

  private specialFind(b: number, g: number, r: number): number {
    for (let i = 0, p = 0; i < this.specials; i++) {
      if (
        this.network[p++] === b &&
        this.network[p++] === g &&
        this.network[p++] === r
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Search for biased BGR values
   */
  private contest(b: number, g: number, r: number): number {
    // Finds closest neuron (min dist) and updates freq
    // finds best neuron (min dist-bias) and returns position
    // for frequently chosen neurons, freq[i] is high and bias[i] is negative
    // bias[i] = gamma*((1/netsize)-freq[i])

    let bestd = 1.0e30;
    let bestBiasDist: number = bestd;
    let bestpos = -1;
    let bestbiaspos: number = bestpos;

    for (let i = this.specials, p = this.specials * 3; i < this.netSize; i++) {
      let dist = this.network[p++] - b;
      if (dist < 0) {
        dist = -dist;
      }
      let a = this.network[p++] - g;
      if (a < 0) {
        a = -a;
      }
      dist += a;
      a = this.network[p++] - r;
      if (a < 0) {
        a = -a;
      }
      dist += a;
      if (dist < bestd) {
        bestd = dist;
        bestpos = i;
      }

      const biasDist = dist - this.bias[i];
      if (biasDist < bestBiasDist) {
        bestBiasDist = biasDist;
        bestbiaspos = i;
      }
      this.freq[i] -= NeuralQuantizer.beta * this.freq[i];
      this.bias[i] += NeuralQuantizer.betaGamma * this.freq[i];
    }
    this.freq[bestpos] += NeuralQuantizer.beta;
    this.bias[bestpos] -= NeuralQuantizer.betaGamma;
    return bestbiaspos;
  }

  private alterSingle(
    alpha: number,
    i: number,
    b: number,
    g: number,
    r: number
  ): void {
    // Move neuron i towards biased (b,g,r) by factor alpha
    const p = i * 3;
    this.network[p] -= alpha * (this.network[p] - b);
    this.network[p + 1] -= alpha * (this.network[p + 1] - g);
    this.network[p + 2] -= alpha * (this.network[p + 2] - r);
  }

  private alterNeighbors(
    _: number,
    rad: number,
    i: number,
    b: number,
    g: number,
    r: number
  ): void {
    let lo = i - rad;
    if (lo < this.specials - 1) {
      lo = this.specials - 1;
    }

    let hi = i + rad;
    if (hi > this.netSize) {
      hi = this.netSize;
    }

    let j = i + 1;
    let k = i - 1;
    let m = 1;
    while (j < hi || k > lo) {
      const a = this.radiusPower[m++];
      if (j < hi) {
        const p = j * 3;
        this.network[p] -=
          (a * (this.network[p] - b)) / NeuralQuantizer.alphaRadiusBias;
        this.network[p + 1] -=
          (a * (this.network[p + 1] - g)) / NeuralQuantizer.alphaRadiusBias;
        this.network[p + 2] -=
          (a * (this.network[p + 2] - r)) / NeuralQuantizer.alphaRadiusBias;
        j++;
      }
      if (k > lo) {
        const p = k * 3;
        this.network[p] -=
          (a * (this.network[p] - b)) / NeuralQuantizer.alphaRadiusBias;
        this.network[p + 1] -=
          (a * (this.network[p + 1] - g)) / NeuralQuantizer.alphaRadiusBias;
        this.network[p + 2] -=
          (a * (this.network[p + 2] - r)) / NeuralQuantizer.alphaRadiusBias;
        k--;
      }
    }
  }

  private learn(image: MemoryImage): void {
    let biasRadius = this.initBiasRadius;
    const alphaDec = 30 + Math.floor((this.samplingFactor - 1) / 3);
    const lengthCount = image.length;
    const samplePixels = Math.floor(lengthCount / this.samplingFactor);
    let delta = Math.max(
      Math.floor(samplePixels / NeuralQuantizer.numCycles),
      1
    );
    let alpha = NeuralQuantizer.initAlpha;

    if (delta === 0) {
      delta = 1;
    }

    let rad = biasRadius >> NeuralQuantizer.radiusBiasShift;
    if (rad <= 1) {
      rad = 0;
    }

    this.updateRadiusPower(rad, alpha);

    let step = 0;
    let pos = 0;
    if (lengthCount < NeuralQuantizer.smallImageBytes) {
      this.samplingFactor = 1;
      step = 1;
    } else if (lengthCount % NeuralQuantizer.prime1 !== 0) {
      step = NeuralQuantizer.prime1;
    } else {
      if (lengthCount % NeuralQuantizer.prime2 !== 0) {
        step = NeuralQuantizer.prime2;
      } else {
        if (lengthCount % NeuralQuantizer.prime3 !== 0) {
          step = NeuralQuantizer.prime3;
        } else {
          step = NeuralQuantizer.prime4;
        }
      }
    }

    let i = 0;
    while (i < samplePixels) {
      const p = image.getPixelByIndex(pos);
      const red = Color.getRed(p);
      const green = Color.getGreen(p);
      const blue = Color.getBlue(p);

      if (i === 0) {
        // Remember background colour
        this.network[this.bgColor * 3] = blue;
        this.network[this.bgColor * 3 + 1] = green;
        this.network[this.bgColor * 3 + 2] = red;
      }

      let j = this.specialFind(blue, green, red);
      j = j < 0 ? this.contest(blue, green, red) : j;

      if (j >= this.specials) {
        // Don't learn for specials
        const a = Number(alpha) / NeuralQuantizer.initAlpha;
        this.alterSingle(a, j, blue, green, red);
        if (rad > 0) {
          // Alter neighbours
          this.alterNeighbors(a, rad, j, blue, green, red);
        }
      }

      pos += step;
      while (pos >= lengthCount) {
        pos -= lengthCount;
      }

      i++;
      if (i % delta === 0) {
        alpha -= Math.floor(alpha / alphaDec);
        biasRadius -= Math.floor(biasRadius / NeuralQuantizer.radiusDec);
        rad = biasRadius >> NeuralQuantizer.radiusBiasShift;
        if (rad <= 1) {
          rad = 0;
        }
        this.updateRadiusPower(rad, alpha);
      }
    }
  }

  private fix(): void {
    for (let i = 0, p = 0, q = 0; i < this.netSize; i++, q += 4) {
      for (let j = 0; j < 3; ++j, ++p) {
        let x = Math.trunc(0.5 + this.network[p]);
        if (x < 0) {
          x = 0;
        }
        if (x > 255) {
          x = 255;
        }
        this._colorMap32[q + j] = x;
      }
      this._colorMap32[q + 3] = i;
    }
  }

  /**
   * Insertion sort of network and building of netindex[0..255]
   */
  private inxBuild(): void {
    let previousColor = 0;
    let startPos = 0;

    for (let i = 0, p = 0; i < this.netSize; i++, p += 4) {
      let smallpos = i;
      // Index on g
      let smallval = this._colorMap32[p + 1];

      // Find smallest in i..netsize-1
      for (let j = i + 1, q = p + 4; j < this.netSize; j++, q += 4) {
        if (this._colorMap32[q + 1] < smallval) {
          // Index on g
          smallpos = j;
          // Index on g
          smallval = this._colorMap32[q + 1];
        }
      }

      const q = smallpos * 4;

      // Swap p (i) and q (smallpos) entries
      if (i !== smallpos) {
        let j = this._colorMap32[q];
        this._colorMap32[q] = this._colorMap32[p];
        this._colorMap32[p] = j;

        j = this._colorMap32[q + 1];
        this._colorMap32[q + 1] = this._colorMap32[p + 1];
        this._colorMap32[p + 1] = j;

        j = this._colorMap32[q + 2];
        this._colorMap32[q + 2] = this._colorMap32[p + 2];
        this.colorMap32[p + 2] = j;

        j = this._colorMap32[q + 3];
        this._colorMap32[q + 3] = this._colorMap32[p + 3];
        this._colorMap32[p + 3] = j;
      }

      // SmallVal entry is now in position i
      if (smallval !== previousColor) {
        this.netIndex[previousColor] = (startPos + i) >> 1;
        for (let j = previousColor + 1; j < smallval; j++) {
          this.netIndex[j] = i;
        }
        previousColor = smallval;
        startPos = i;
      }
    }

    this.netIndex[previousColor] = (startPos + this.maxNetPos) >> 1;
    for (let j = previousColor + 1; j < 256; j++) {
      // Really 256
      this.netIndex[j] = this.maxNetPos;
    }
  }

  private copyColorMap(): void {
    for (let i = 0, p = 0, q = 0; i < this.netSize; ++i) {
      this._colorMap8[p++] = Math.abs(this._colorMap32[q + 2]) & 0xff;
      this._colorMap8[p++] = Math.abs(this._colorMap32[q + 1]) & 0xff;
      this._colorMap8[p++] = Math.abs(this._colorMap32[q]) & 0xff;
      q += 4;
    }
  }

  /**
   * Add an image to the quantized color table.
   */
  private addImage(image: MemoryImage): void {
    this.learn(image);
    this.fix();
    this.inxBuild();
    this.copyColorMap();
  }

  /**
   * Search for BGR values 0..255 and return color index
   */
  private inxSearch(b: number, g: number, r: number): number {
    // Biggest possible dist is 256*3
    let bestd = 1000;
    let best = -1;
    // Index on g
    let i = this.netIndex[g];
    // Start at netindex[g] and work outwards
    let j = i - 1;

    while (i < this.netSize || j >= 0) {
      if (i < this.netSize) {
        const p = i * 4;
        let dist = this._colorMap32[p + 1] - g;
        // Inx key
        if (dist >= bestd) {
          // Stop iter
          i = this.netSize;
        } else {
          if (dist < 0) {
            dist = -dist;
          }
          let a = this._colorMap32[p] - b;
          if (a < 0) {
            a = -a;
          }
          dist += a;
          if (dist < bestd) {
            a = this._colorMap32[p + 2] - r;
            if (a < 0) {
              a = -a;
            }
            dist += a;
            if (dist < bestd) {
              bestd = dist;
              best = i;
            }
          }
          i++;
        }
      }

      if (j >= 0) {
        const p = j * 4;
        // Inx key - reverse dif
        let dist = g - this._colorMap32[p + 1];
        if (dist >= bestd) {
          // Stop iter
          j = -1;
        } else {
          if (dist < 0) {
            dist = -dist;
          }
          let a = this._colorMap32[p] - b;
          if (a < 0) {
            a = -a;
          }
          dist += a;
          if (dist < bestd) {
            a = this._colorMap32[p + 2] - r;
            if (a < 0) {
              a = -a;
            }
            dist += a;
            if (dist < bestd) {
              bestd = dist;
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
   * Get a color from the [colorMap].
   */
  public color(index: number): number {
    return Color.getColor(
      this._colorMap8[index * 3],
      this._colorMap8[index * 3 + 1],
      this._colorMap8[index * 3 + 2]
    );
  }

  /**
   * Find the index of the closest color to [c] in the [colorMap].
   */
  public lookup(c: number): number {
    const r = Color.getRed(c);
    const g = Color.getGreen(c);
    const b = Color.getBlue(c);
    return this.inxSearch(b, g, r);
  }

  /**
   * Find the index of the closest color to [r],[g],[b] in the [colorMap].
   */
  public lookupRGB(r: number, g: number, b: number): number {
    return this.inxSearch(b, g, r);
  }

  /**
   * Find the color closest to [c] in the [colorMap].
   */
  public getQuantizedColor(c: number): number {
    const r = Color.getRed(c);
    const g = Color.getGreen(c);
    const b = Color.getBlue(c);
    const a = Color.getAlpha(c);
    const i = this.inxSearch(b, g, r) * 3;
    return Color.getColor(
      this._colorMap8[i],
      this._colorMap8[i + 1],
      this._colorMap8[i + 2],
      a
    );
  }

  /**
   * Convert the [image] to an index map, mapping to this [colorMap].
   */
  public getIndexMap(image: MemoryImage): Uint8Array {
    const map = new Uint8Array(image.width * image.height);
    for (let i = 0, len = image.length; i < len; ++i) {
      map[i] = this.lookup(image.getPixelByIndex(i));
    }
    return map;
  }
}
