export interface ColorPalette {
  normal: number,
  bright: number,
  dim: number,
}

export const ColorsPalette = {
  red: {
    normal: 10,
    bright: 11,
    dim: 1,
  },
  green: {
    normal: 32,
    bright: 48,
    dim: 16,
  },
  yellow: {
    normal: 34,
    bright: 51,
    dim: 17,
  },
}

export class LaunchpadLEDController {
  private output: any;
  private blinkIntervals: Map<number, any> = new Map([]);
  public activeKeys: Map<number, number> = new Map([]);
  private shadeChangeWaitTime = 150;
  private keys = this.generateKeysList();

  constructor(output: any) {
    this.output = output;
  }

  async init() {
    this.clearAll();
    await this.splash();
    // this.splitSegments();
  }

  splash() {
    return new Promise((resolve) => {
      const frameTime = 180;
      setTimeout(() => {
        this.keyOn(67, ColorsPalette.green.normal);
        this.keyOn(51, ColorsPalette.green.normal);
        this.keyOn(52, ColorsPalette.green.normal);
        this.keyOn(68, ColorsPalette.green.normal);
      }, 0);
      setTimeout(() => {
        this.keyOn(67, ColorsPalette.yellow.dim);
        this.keyOn(51, ColorsPalette.yellow.dim);
        this.keyOn(52, ColorsPalette.yellow.dim);
        this.keyOn(68, ColorsPalette.yellow.dim);
      }, frameTime);
      setTimeout(() => {
        this.keyOff(67);
        this.keyOff(51);
        this.keyOff(52);
        this.keyOff(68);
        this.keyOn(66, ColorsPalette.yellow.normal);
        this.keyOn(50, ColorsPalette.yellow.normal);
        this.keyOn(34, ColorsPalette.yellow.normal);
        this.keyOn(35, ColorsPalette.yellow.normal);
        this.keyOn(36, ColorsPalette.yellow.normal);
        this.keyOn(37, ColorsPalette.yellow.normal);
        this.keyOn(53, ColorsPalette.yellow.normal);
        this.keyOn(69, ColorsPalette.yellow.normal);
        this.keyOn(85, ColorsPalette.yellow.normal);
        this.keyOn(84, ColorsPalette.yellow.normal);
        this.keyOn(83, ColorsPalette.yellow.normal);
        this.keyOn(82, ColorsPalette.yellow.normal);
      }, frameTime * 2);
      setTimeout(() => {
        this.keyOn(66, ColorsPalette.red.bright);
        this.keyOn(50, ColorsPalette.red.bright);
        this.keyOn(34, ColorsPalette.red.bright);
        this.keyOn(35, ColorsPalette.red.bright);
        this.keyOn(36, ColorsPalette.red.bright);
        this.keyOn(37, ColorsPalette.red.bright);
        this.keyOn(53, ColorsPalette.red.bright);
        this.keyOn(69, ColorsPalette.red.bright);
        this.keyOn(85, ColorsPalette.red.bright);
        this.keyOn(84, ColorsPalette.red.bright);
        this.keyOn(83, ColorsPalette.red.bright);
        this.keyOn(82, ColorsPalette.red.bright);
      }, frameTime * 3);
      setTimeout(() => {
        this.keyOn(67, ColorsPalette.red.normal);
        this.keyOn(51, ColorsPalette.red.normal);
        this.keyOn(52, ColorsPalette.red.normal);
        this.keyOn(68, ColorsPalette.red.normal);
      }, frameTime * 4);
      setTimeout(() => {
        this.keyOff(66);
        this.keyOff(50);
        this.keyOff(34);
        this.keyOff(35);
        this.keyOff(36);
        this.keyOff(37);
        this.keyOff(53);
        this.keyOff(69);
        this.keyOff(85);
        this.keyOff(84);
        this.keyOff(83);
        this.keyOff(82);
      }, frameTime * 5);
      setTimeout(() => {
        this.keyOff(67);
        this.keyOff(51);
        this.keyOff(52);
        this.keyOff(68);
        resolve();
      }, frameTime * 6);
    });
  }

  blinkKey(key: number, colorPalette: ColorPalette) {
    colorPalette = colorPalette || ColorsPalette.red;
    const {normal, bright, dim} = colorPalette;
    this.keyOn(key, colorPalette.bright);
    const interval = setInterval(() => {
      setTimeout(() => {
        this.keyOn(key, normal);
      }, this.shadeChangeWaitTime * 2);

      setTimeout(() => {
        this.keyOn(key, dim);
      }, this.shadeChangeWaitTime * 3);

      setTimeout(() => {
        this.keyOn(key, normal);
      }, this.shadeChangeWaitTime * 4);

      setTimeout(() => {
        this.keyOn(key, bright);
      }, this.shadeChangeWaitTime * 5);

    }, this.shadeChangeWaitTime * 5);
    this.blinkIntervals.set(key, interval);
  }

  keyOn(key: number, color: number, isLongPress = false) {
    this.output.sendMessage([144, key, color]);
    if(isLongPress) {
      this.activeKeys.set(key, color);
    }
  }

  async keyOff(key: number) {
    if (this.blinkIntervals.has(key)) {
      clearInterval(this.blinkIntervals.get(key));
      this.blinkIntervals.delete(key);
      setTimeout(() => {
        this.output.sendMessage([128, key, 0]);
      }, (this.shadeChangeWaitTime * 5) + 1)
    }
    this.output.sendMessage([128, key, 0]);
    if(this.activeKeys.has(key)) {
      this.activeKeys.delete(key);
    }
  }

  keyTap(key: number, color: ColorPalette) {
    this.keyOn(key, color.bright);
    setTimeout(() => {
      this.keyOn(key, color.dim);
    }, this.shadeChangeWaitTime);
  }

  private generateKeysList() {
    const arr = [];
    let i = 0;
    while (arr.length < 64) {
      if (i !== 0 && i % 8 === 0) {
        arr.push(i + 8);
        i = i + 9;
      } else {
        arr.push(i);
        i++;
      }
    }
    return arr;
  }

  public clearAll() {
    for (let i = 0; i < this.keys.length; i++) {
      this.keyOff(this.keys[i]);
    }
  }

  private splitSegments() {
    let row = 1;
    for (let i = 0; i < this.keys.length; i++) {

      if (this.keys[i] < (4 * (4 * row) - 3) - 9) {
        if (this.keys[i] < 64) {
          this.keyOn(this.keys[i], ColorsPalette.red.dim);
        } else {
          this.keyOn(this.keys[i], ColorsPalette.green.dim);
        }
      } else if (this.keys[i] < (4 * (4 * row) - 3)) {
        if (this.keys[i] < 64) {
          this.keyOn(this.keys[i], ColorsPalette.green.dim);
        } else {
          this.keyOn(this.keys[i], ColorsPalette.yellow.dim);
        }
      }
      if ((this.keys[i + 1]) % 8 === 0) {
        row++
      }
    }
  }
}
