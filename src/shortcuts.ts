const robot = require("robotjs"); // requires X developer tools sudo apt-get install xorg-dev

export class Shortcuts {
  _quickActions: Map<number, [string, [string, any]]> = new Map();

  constructor() {

  }

  set quickActions(quickActions: Map<number, [string, any]>) {
    this._quickActions = quickActions;
  }

  get quickActions() {
    return this._quickActions;
  }
  

  fireQuickAction(key: number) {
    if(this._quickActions.has(key)) {
      const action = this._quickActions.get(key)!;
      robot.keyTap(action[0]);
    }else {
      console.log('no action selected for key', key);
    }
  }

}
