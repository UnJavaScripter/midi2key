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
const launchpadLEDController_1 = require("./launchpadLEDController");
const shortcuts_1 = require("./shortcuts");
const midi = require('midi');
const ActionKeys = new Map([
    [38, ['audio_vol_down', launchpadLEDController_1.ColorsPalette.red]],
    [39, ['audio_vol_up', launchpadLEDController_1.ColorsPalette.red]],
    [52, ['audio_pause', launchpadLEDController_1.ColorsPalette.green]],
    [53, ['audio_play', launchpadLEDController_1.ColorsPalette.green]],
    [54, ['audio_prev', launchpadLEDController_1.ColorsPalette.green]],
    [55, ['audio_next', launchpadLEDController_1.ColorsPalette.green]],
]);
class App {
    constructor() {
        this.input = new midi.Input();
        this.output = new midi.Output();
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const inputDevice = this.getDevice(this.input, 'launchpad');
            const outputDevice = this.getDevice(this.output, 'launchpad');
            this.input.openPort(inputDevice);
            this.input.ignoreTypes(false, false, false);
            this.output.openPort(outputDevice);
            this.shortcuts = new shortcuts_1.Shortcuts();
            this.shortcuts.quickActions = ActionKeys;
            this.launchpad = yield new launchpadLEDController_1.LaunchpadLEDController(yield this.output);
            yield this.launchpad.init();
            this.enableTappableKeys();
            this.input.on('message', this.onMessage.bind(this));
        });
    }
    getDevice(io, deviceName) {
        const devicesAmount = io.getPortCount();
        for (let i = 0; i < devicesAmount; i++) {
            const name = io.getPortName(i);
            if (name.toLowerCase().includes(deviceName.toLowerCase())) {
                return i;
            }
        }
        console.error('device not found!!');
        return null;
    }
    onMessage(deltaTime, message) {
        const [command, key, velocity] = message;
        const isQuickPress = deltaTime < 0.7;
        if (velocity === 0) {
            if (isQuickPress) {
                if (!this.launchpad.activeKeys.has(key)) {
                    this.handleKeyOff(key);
                }
                else {
                    return null; // trying to deactivate an active key with a quickPress
                }
            }
            else {
                if (this.launchpad.activeKeys.has(key)) {
                    // disable long press
                    this.activeKeyOff(key);
                }
                else {
                    // enable long press
                    this.activeKeyOn(key, launchpadLEDController_1.ColorsPalette.green);
                }
            }
        }
        else {
            if (!this.launchpad.activeKeys.has(key)) {
                // quick key tap
                this.quickTap(key);
            }
        }
    }
    handleKeyOff(key) {
        if (!ActionKeys.has(key)) {
            this.launchpad.keyOff(key);
        }
    }
    quickTap(key) {
        console.log('key', key);
        if (ActionKeys.has(key)) {
            const values = ActionKeys.get(key);
            this.launchpad.keyTap(key, values[1]);
            this.shortcuts.fireQuickAction(key);
        }
        else {
            console.log('No quick action associated with key', key);
        }
    }
    activeKeyOn(key, color) {
        console.log('blink', color);
        this.launchpad.blinkKey(key, color);
        this.launchpad.activeKeys.set(key, [color, true]);
    }
    activeKeyOff(key) {
        this.launchpad.activeKeys.delete(key);
        this.launchpad.keyOff(key);
    }
    enableTappableKeys() {
        for (let key of ActionKeys.keys()) {
            const color = ActionKeys.get(key)[1];
            const shade = color["dim"];
            this.launchpad.keyOn(key, shade);
        }
    }
}
const app = new App();
