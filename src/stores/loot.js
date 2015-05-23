'use strict';

import { Store } from 'flux';

import LootActions from 'actions/loot';
import Loot from 'loot';

class LootStore extends Store {
  constructor() {
    super();
    LootActions.addListener('create', this.onCreateLoot.bind(this));

    try {
      this.loot = localStorage.getItem('loot') || [];
    } catch (e) {
      console.warn('Couldn\'t load LootStore', e);
      this.loot = [];
    }
  }

  onCreateLoot(obj) {
    if (!(obj instanceof Loot))
      obj = new Loot(obj);

    this.loot.push(obj);
    super.emitChange();
  }
}

// There can be only one
export default new LootStore();
