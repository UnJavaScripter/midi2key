"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchpadLEDController = exports.ColorsPalette = void 0;
exports.ColorsPalette = {
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
};
class LaunchpadLEDController {
    constructor(output) {
        this.blinkIntervals = new Map([]);
        this.activeKeys = new Map([]);
        this.shadeChangeWaitTime = 150;
        this.keys = this.generateKeysList();
        this.output = output;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearAll();
            yield this.splash();
            // this.splitSegments();
        });
    }
    splash() {
        return new Promise((resolve) => {
            const frameTime = 180;
            setTimeout(() => {
                this.keyOn(67, exports.ColorsPalette.green.normal);
                this.keyOn(51, exports.ColorsPalette.green.normal);
                this.keyOn(52, exports.ColorsPalette.green.normal);
                this.keyOn(68, exports.ColorsPalette.green.normal);
            }, 0);
            setTimeout(() => {
                this.keyOn(67, exports.ColorsPalette.yellow.dim);
                this.keyOn(51, exports.ColorsPalette.yellow.dim);
                this.keyOn(52, exports.ColorsPalette.yellow.dim);
                this.keyOn(68, exports.ColorsPalette.yellow.dim);
            }, frameTime);
            setTimeout(() => {
                this.keyOff(67);
                this.keyOff(51);
                this.keyOff(52);
                this.keyOff(68);
                this.keyOn(66, exports.ColorsPalette.yellow.normal);
                this.keyOn(50, exports.ColorsPalette.yellow.normal);
                this.keyOn(34, exports.ColorsPalette.yellow.normal);
                this.keyOn(35, exports.ColorsPalette.yellow.normal);
                this.keyOn(36, exports.ColorsPalette.yellow.normal);
                this.keyOn(37, exports.ColorsPalette.yellow.normal);
                this.keyOn(53, exports.ColorsPalette.yellow.normal);
                this.keyOn(69, exports.ColorsPalette.yellow.normal);
                this.keyOn(85, exports.ColorsPalette.yellow.normal);
                this.keyOn(84, exports.ColorsPalette.yellow.normal);
                this.keyOn(83, exports.ColorsPalette.yellow.normal);
                this.keyOn(82, exports.ColorsPalette.yellow.normal);
            }, frameTime * 2);
            setTimeout(() => {
                this.keyOn(66, exports.ColorsPalette.red.bright);
                this.keyOn(50, exports.ColorsPalette.red.bright);
                this.keyOn(34, exports.ColorsPalette.red.bright);
                this.keyOn(35, exports.ColorsPalette.red.bright);
                this.keyOn(36, exports.ColorsPalette.red.bright);
                this.keyOn(37, exports.ColorsPalette.red.bright);
                this.keyOn(53, exports.ColorsPalette.red.bright);
                this.keyOn(69, exports.ColorsPalette.red.bright);
                this.keyOn(85, exports.ColorsPalette.red.bright);
                this.keyOn(84, exports.ColorsPalette.red.bright);
                this.keyOn(83, exports.ColorsPalette.red.bright);
                this.keyOn(82, exports.ColorsPalette.red.bright);
            }, frameTime * 3);
            setTimeout(() => {
                this.keyOn(67, exports.ColorsPalette.red.normal);
                this.keyOn(51, exports.ColorsPalette.red.normal);
                this.keyOn(52, exports.ColorsPalette.red.normal);
                this.keyOn(68, exports.ColorsPalette.red.normal);
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
    blinkKey(key, colorPalette) {
        colorPalette = colorPalette || exports.ColorsPalette.red;
        const { normal, bright, dim } = colorPalette;
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
    keyOn(key, color, isLongPress = false) {
        this.output.sendMessage([144, key, color]);
        if (isLongPress) {
            this.activeKeys.set(key, color);
        }
    }
    keyOff(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.blinkIntervals.has(key)) {
                clearInterval(this.blinkIntervals.get(key));
                this.blinkIntervals.delete(key);
                setTimeout(() => {
                    this.output.sendMessage([128, key, 0]);
                }, (this.shadeChangeWaitTime * 5) + 1);
            }
            this.output.sendMessage([128, key, 0]);
            if (this.activeKeys.has(key)) {
                this.activeKeys.delete(key);
            }
        });
    }
    keyTap(key, color) {
        this.keyOn(key, color.bright);
        setTimeout(() => {
            this.keyOn(key, color.dim);
        }, this.shadeChangeWaitTime);
    }
    generateKeysList() {
        const arr = [];
        let i = 0;
        while (arr.length < 64) {
            if (i !== 0 && i % 8 === 0) {
                arr.push(i + 8);
                i = i + 9;
            }
            else {
                arr.push(i);
                i++;
            }
        }
        return arr;
    }
    clearAll() {
        for (let i = 0; i < this.keys.length; i++) {
            this.keyOff(this.keys[i]);
        }
    }
    splitSegments() {
        let row = 1;
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i] < (4 * (4 * row) - 3) - 9) {
                if (this.keys[i] < 64) {
                    this.keyOn(this.keys[i], exports.ColorsPalette.red.dim);
                }
                else {
                    this.keyOn(this.keys[i], exports.ColorsPalette.green.dim);
                }
            }
            else if (this.keys[i] < (4 * (4 * row) - 3)) {
                if (this.keys[i] < 64) {
                    this.keyOn(this.keys[i], exports.ColorsPalette.green.dim);
                }
                else {
                    this.keyOn(this.keys[i], exports.ColorsPalette.yellow.dim);
                }
            }
            if ((this.keys[i + 1]) % 8 === 0) {
                row++;
            }
        }
    }
}
exports.LaunchpadLEDController = LaunchpadLEDController;
