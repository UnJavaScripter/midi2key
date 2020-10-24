import { LaunchpadLEDController, ColorsPalette, ColorPalette } from './launchpadLEDController';
import { Shortcuts } from './shortcuts';

const midi = require('midi');

const ActionKeys = new Map([
  [38, ['audio_vol_down', ColorsPalette.red]],
  [39, ['audio_vol_up', ColorsPalette.red]],
  [52, ['audio_pause', ColorsPalette.green]],
  [53, ['audio_play', ColorsPalette.green]],
  [54, ['audio_prev', ColorsPalette.green]],
  [55, ['audio_next', ColorsPalette.green]],
]);

class App {
  input: any;
  output: any;
  launchpad: any;
  shortcuts: any;

  constructor() {
    this.input = new midi.Input();
    this.output = new midi.Output();

    this.init();
  }

  async init() {
    const inputDevice = this.getDevice(this.input, 'launchpad');
    const outputDevice = this.getDevice(this.output, 'launchpad');
    this.input.openPort(inputDevice);
    this.input.ignoreTypes(false, false, false);

    this.output.openPort(outputDevice);

    this.shortcuts = new Shortcuts();
    this.shortcuts.quickActions = ActionKeys;
    this.launchpad = await new LaunchpadLEDController(await this.output);
    await this.launchpad.init();
    this.enableTappableKeys();
    this.input.on('message', this.onMessage.bind(this));
  }

  getDevice(io: any, deviceName: string) {
    const devicesAmount = io.getPortCount();
    for (let i = 0; i < devicesAmount; i++) {
      const name = io.getPortName(i);
      if (name.toLowerCase().includes(deviceName.toLowerCase())) {
        return i
      }
    }
    console.error('device not found!!');
    return null;
  }

  onMessage(deltaTime: number, message: number[]) {
    const [command, key, velocity] = message;
    const isQuickPress = deltaTime < 0.7;
    if (velocity === 0) {
      if (isQuickPress) {
        if(!this.launchpad.activeKeys.has(key)) {
          this.handleKeyOff(key);
        } else {
          return null; // trying to deactivate an active key with a quickPress
        }
      } else {
        if (this.launchpad.activeKeys.has(key)) {
          // disable long press
          this.activeKeyOff(key);
        } else {
          // enable long press
          this.activeKeyOn(key, ColorsPalette.green);
        }
      }
    } else {
      if(!this.launchpad.activeKeys.has(key)) {
        // quick key tap
        this.quickTap(key);
      }
    }
  }

  handleKeyOff(key: number) {
    if(!ActionKeys.has(key)) {
      this.launchpad.keyOff(key);
    }
  }

  quickTap(key: number) {
    console.log('key', key);
    if(ActionKeys.has(key)) {
      const values = ActionKeys.get(key)!;
      this.launchpad.keyTap(key, values[1]);
      this.shortcuts.fireQuickAction(key);
    }else {
      console.log('No quick action associated with key', key);
    }
  }

  activeKeyOn(key: number, color: any) {
    console.log('blink', color)
    this.launchpad.blinkKey(key, color);
    this.launchpad.activeKeys.set(key, [color, true]);
  }

  activeKeyOff(key: number) {
    this.launchpad.activeKeys.delete(key);
    this.launchpad.keyOff(key);
  }

  enableTappableKeys() {
    for(let key of ActionKeys.keys()) {
      const color = ActionKeys.get(key)![1]
      const shade = (<any>color)[<any>"dim"];
      this.launchpad.keyOn(key, shade);
    }
  }

}

const app = new App();
