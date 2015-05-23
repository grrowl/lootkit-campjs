'use strict';

import { Action } from 'flux';

class ConnectivityActions extends Action {
  constructor() {
    // for single action
    super();
    this.actions = ['online', 'offline'];
  }
};


export default new ConnectivityActions();
