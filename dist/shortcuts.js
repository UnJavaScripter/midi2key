"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shortcuts = void 0;
const robot = require("robotjs"); // requires X developer tools sudo apt-get install xorg-dev
class Shortcuts {
    constructor() {
        this._quickActions = new Map();
    }
    set quickActions(quickActions) {
        this._quickActions = quickActions;
    }
    get quickActions() {
        return this._quickActions;
    }
    fireQuickAction(key) {
        if (this._quickActions.has(key)) {
            const action = this._quickActions.get(key);
            robot.keyTap(action[0]);
        }
        else {
            console.log('no action selected for key', key);
        }
    }
}
exports.Shortcuts = Shortcuts;
