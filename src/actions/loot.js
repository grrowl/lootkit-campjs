'use strict';

import { Action } from 'flux';

class LootActions extends Action {
  constructor() {
    // for single action
    super();
    this.actions = ['create'];
  }
};


export default new LootActions();
